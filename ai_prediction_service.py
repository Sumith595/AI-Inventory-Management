import json
from datetime import datetime

import requests
from database import SessionLocal
from database_models import (
    Product,
    InventoryHistory,
    InventoryPrediction,
)


def calculate_product_metrics(product, history):
    current_stock = product.quantity
    total_sales = sum(h.units_sold for h in history)
    total_days = len(history)

    avg_daily_sales = round(total_sales / total_days, 2) if total_days > 0 else 0
    predicted_stockout_days = (
        round(current_stock / avg_daily_sales, 2)
        if avg_daily_sales > 0 else None
    )

    return {
        "current_stock": current_stock,
        "total_sales": total_sales,
        "days": total_days,
        "average_daily_sales": avg_daily_sales,
        "predicted_stockout_days": predicted_stockout_days,
    }


def call_ollama_ai(product_name, metrics):
    prompt = f"""
You are an inventory analyst.

Analyze the following product:

Product Name: {product_name}
Current Stock: {metrics['current_stock']}
Average Daily Sales: {metrics['average_daily_sales']}
Predicted Stockout Days: {metrics['predicted_stockout_days']}

Respond ONLY with valid JSON:

{{
    "risk_level":"HIGH | MEDIUM | LOW",
    "recommendation":"Short recommendation"
}}
"""

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "mistral",
                "prompt": prompt,
                "stream": False,
            },
            timeout=60,
        )
        response.raise_for_status()
        result = response.json()
        text = result.get("response", "").strip()
        start = text.find("{")
        end = text.rfind("}") + 1
        if start == -1 or end == 0:
            return None
        return json.loads(text[start:end])
    except Exception as exc:
        print("Ollama Error:", exc)
        return None


def generate_ai_prediction():
    db = SessionLocal()
    try:
        products = db.query(Product).all()
        for product in products:
            history = (
                db.query(InventoryHistory)
                .filter(InventoryHistory.product_id == product.id)
                .all()
            )
            metrics = calculate_product_metrics(product, history)
            ai_result = call_ollama_ai(product.name, metrics)
            if ai_result is None:
                ai_result = {
                    "risk_level": "MEDIUM",
                    "recommendation": "Unable to generate AI recommendation.",
                }

            prediction = (
                db.query(InventoryPrediction)
                .filter(InventoryPrediction.product_id == product.id)
                .first()
            )
            if prediction is None:
                prediction = InventoryPrediction(product_id=product.id)
                db.add(prediction)

            prediction.current_stock = metrics["current_stock"]
            prediction.average_daily_sales = metrics["average_daily_sales"]
            prediction.predicted_stockout_days = metrics["predicted_stockout_days"]
            prediction.demand_growth = 0

            current_stock = metrics["current_stock"]
            stockout_days = metrics["predicted_stockout_days"]
            avg_sales = metrics["average_daily_sales"]

            if current_stock == 0:
                risk_level = "CRITICAL"
            elif current_stock < 10:
                risk_level = "HIGH"
            elif current_stock < 20:
                risk_level = "MEDIUM"
            elif avg_sales == 0:
                risk_level = "LOW"
            elif stockout_days is not None and stockout_days <= 3:
                risk_level = "HIGH"
            elif stockout_days is not None and stockout_days <= 7:
                risk_level = "MEDIUM"
            else:
                risk_level = "LOW"

            prediction.risk_level = risk_level
            recommendation = ai_result.get("recommendation", "").strip()
            if not recommendation:
                if risk_level == "CRITICAL":
                    recommendation = "Stock exhausted. Reorder immediately."
                elif risk_level == "HIGH":
                    recommendation = "Reorder within 1-2 days."
                elif risk_level == "MEDIUM":
                    recommendation = "Monitor stock and reorder this week."
                else:
                    recommendation = "Inventory level is healthy."

            prediction.recommendation = recommendation
            prediction.generated_at = datetime.now()
            db.commit()
            print(f"Prediction saved for {product.name} - {prediction.risk_level}")

        return {
            "success": True,
            "message": "AI Predictions Generated Successfully",
        }
    except Exception as exc:
        db.rollback()
        print("Error generating AI predictions:", exc)
        return {
            "success": False,
            "message": f"Error generating AI predictions: {exc}",
        }
    finally:
        db.close()


if __name__ == "__main__":
    result = generate_ai_prediction()
    print(result)
        