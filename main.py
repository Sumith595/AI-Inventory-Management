from datetime import date
from typing import Generator

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import func
from sqlalchemy.orm import Session as DBSession

from ai_prediction_service import generate_ai_prediction
from database import SessionLocal, engine
from database_models import (
    Base,
    InventoryHistory,
    InventoryPrediction,
    InventoryUpdate as DBInventoryUpdate,
    Product as DBProduct,
)
from models import InventoryUpdate as InventoryUpdateSchema, Product as ProductSchema
from schemas import DailySalesRequest, PredictionRequest

app = FastAPI(title='Inventory Management API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=False,
    allow_methods=['*'],
    allow_headers=['*'],
)

DEFAULT_PRODUCTS = [
    {'name': 'Phone', 'description': 'A smartphone', 'price': 699.99, 'quantity': 50},
    {'name': 'Laptop', 'description': 'A powerful laptop', 'price': 999.99, 'quantity': 30},
    {'name': 'Pen', 'description': 'A blue ink pen', 'price': 1.99, 'quantity': 100},
    {'name': 'Table', 'description': 'A wooden table', 'price': 199.99, 'quantity': 20},
    {'name': 'Monitor', 'description': 'A 24-inch monitor', 'price': 150.0, 'quantity': 100},
    {'name': 'Backpack', 'description': 'A durable backpack', 'price': 60.0, 'quantity': 100},
    {'name': 'Water Bottle', 'description': 'A stainless steel water bottle', 'price': 20.0, 'quantity': 100},
    {'name': 'Headphones', 'description': 'Noise-cancelling headphones', 'price': 120.0, 'quantity': 100},
    {'name': 'Smartwatch', 'description': 'A smartwatch with fitness tracking', 'price': 200.0, 'quantity': 100},
    {'name': 'Camera', 'description': 'A digital camera', 'price': 300.0, 'quantity': 100},
]


def get_db() -> Generator[DBSession, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def serialize_product(product: DBProduct) -> dict:
    return {
        'id': product.id,
        'name': product.name,
        'description': product.description,
        'price': product.price,
        'quantity': product.quantity,
    }


def seed_initial_products(db: DBSession) -> None:
    if db.query(DBProduct).count() == 0:
        for product_data in DEFAULT_PRODUCTS:
            db.add(DBProduct(**product_data))
        db.commit()


@app.on_event('startup')
def startup_event() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_initial_products(db)
    finally:
        db.close()


@app.get('/')
def greet() -> dict[str, str]:
    return {'message': 'Hello, World!'}


@app.get('/products', response_model=list[ProductSchema])
def get_products(db: DBSession = Depends(get_db)) -> list[dict]:
    products = db.query(DBProduct).all()
    return [serialize_product(product) for product in products]


@app.get('/products/{id}', response_model=ProductSchema)
def get_product(id: int, db: DBSession = Depends(get_db)) -> dict:
    product = db.query(DBProduct).filter(DBProduct.id == id).first()
    if product is None:
        raise HTTPException(status_code=404, detail='Product not found')
    return serialize_product(product)


@app.post('/products', response_model=ProductSchema)
def add_product(product: ProductSchema, db: DBSession = Depends(get_db)) -> dict:
    db_product = DBProduct(**product.model_dump(exclude={'id'}))
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return serialize_product(db_product)


@app.put('/products/{id}', response_model=ProductSchema)
def update_product(id: int, product: ProductSchema, db: DBSession = Depends(get_db)) -> dict:
    db_product = db.query(DBProduct).filter(DBProduct.id == id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail='Product not found')
    db_product.name = product.name
    db_product.description = product.description
    db_product.price = product.price
    db_product.quantity = product.quantity
    db.commit()
    db.refresh(db_product)
    return serialize_product(db_product)


@app.delete('/products/{id}')
def delete_product(id: int, db: DBSession = Depends(get_db)) -> dict[str, str]:
    product = db.query(DBProduct).filter(DBProduct.id == id).first()
    if product is None:
        raise HTTPException(status_code=404, detail='Product not found')

    db.query(InventoryPrediction).filter(InventoryPrediction.product_id == id).delete(synchronize_session=False)
    db.query(InventoryHistory).filter(InventoryHistory.product_id == id).delete(synchronize_session=False)
    db.query(DBInventoryUpdate).filter(DBInventoryUpdate.product_id == id).delete(synchronize_session=False)
    db.delete(product)
    db.commit()
    return {'message': 'Product deleted successfully'}


@app.get('/admin/inventory-data')
def get_inventory_data(db: DBSession = Depends(get_db)) -> list[dict]:
    products = db.query(DBProduct).all()
    result = []
    for product in products:
        history = (
            db.query(InventoryHistory)
            .filter(InventoryHistory.product_id == product.id)
            .order_by(InventoryHistory.recorded_date.desc())
            .limit(30)
            .all()
        )
        sales = [record.units_sold for record in history]
        if len(sales) >= 2:
            mid = len(sales) // 2
            previous_period = sales[:mid]
            current_period = sales[mid:]
        else:
            previous_period = sales
            current_period = []

        previous_avg = sum(previous_period) / len(previous_period) if previous_period else 0
        current_avg = sum(current_period) / len(current_period) if current_period else 0

        if previous_avg > 0:
            demand_growth = round(((current_avg - previous_avg) / previous_avg) * 100, 2)
            demand_growth = round(abs(max(min(demand_growth, 100), -100)), 2)
        else:
            demand_growth = 0

        result.append({
            'product_id': product.id,
            'product_name': product.name,
            'current_stock': product.quantity,
            'sales_history': sales[::-1],
            'average_daily_sales': int(sum(sales) / len(sales)) if sales else 0,
            'demand_growth': demand_growth,
        })
    return result


@app.post('/admin/update-inventory')
def update_inventory(data: InventoryUpdateSchema, db: DBSession = Depends(get_db)) -> dict[str, str]:
    product = db.query(DBProduct).filter(DBProduct.id == data.product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail='Product not found')
    if data.units_sold > product.quantity:
        raise HTTPException(status_code=400, detail='Not enough stock')

    product.quantity -= data.units_sold
    history = InventoryHistory(
        product_id=product.id,
        stock_remaining=product.quantity,
        units_sold=data.units_sold,
        recorded_date=date.today(),
    )
    db.add(history)
    db.commit()
    return {'message': 'Inventory updated successfully'}


@app.post('/admin/daily-sales')
def record_daily_sales(data: DailySalesRequest, db: DBSession = Depends(get_db)) -> dict[str, str]:
    product = db.query(DBProduct).filter(DBProduct.id == data.product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail='Product not found')
    if data.units_sold > product.quantity:
        raise HTTPException(status_code=400, detail='Units sold cannot exceed current stock')

    product.quantity -= data.units_sold
    history = InventoryHistory(
        product_id=product.id,
        stock_remaining=product.quantity,
        units_sold=data.units_sold,
        recorded_date=date.today(),
    )
    db.add(history)
    db.commit()
    return {'message': 'Daily sales recorded successfully'}


@app.get('/admin/daily-sales')
def get_daily_sales(db: DBSession = Depends(get_db)) -> list[dict]:
    history = (
        db.query(InventoryHistory)
        .order_by(InventoryHistory.recorded_date.desc())
        .all()
    )
    result = []
    for sale in history:
        product = db.query(DBProduct).filter(DBProduct.id == sale.product_id).first()
        result.append({
            'id': sale.id,
            'product_name': product.name if product else None,
            'units_sold': sale.units_sold,
            'stock_remaining': sale.stock_remaining,
            'date': sale.recorded_date,
        })
    return result


@app.get('/admin/dashboard')
def get_dashboard(db: DBSession = Depends(get_db)) -> dict:
    total_products = db.query(DBProduct).count()
    low_stock = db.query(DBProduct).filter(DBProduct.quantity <= 10).count()
    today_sales = (
        db.query(func.sum(InventoryHistory.units_sold))
        .filter(InventoryHistory.recorded_date == date.today())
        .scalar()
    ) or 0
    return {
        'total_products': total_products,
        'low_stock': low_stock,
        'today_sales': today_sales,
        'ai_alerts': 0,
    }


@app.post('/admin/save-prediction')
def save_prediction(data: PredictionRequest, db: DBSession = Depends(get_db)) -> dict[str, str]:
    prediction = (
        db.query(InventoryPrediction)
        .filter(InventoryPrediction.product_id == data.product_id)
        .first()
    )
    if prediction is None:
        prediction = InventoryPrediction(product_id=data.product_id)
        db.add(prediction)

    prediction.current_stock = data.current_stock
    prediction.average_daily_sales = data.average_daily_sales
    prediction.predicted_stockout_days = data.predicted_stockout_days
    prediction.demand_growth = data.demand_growth
    prediction.risk_level = data.risk_level
    prediction.recommendation = data.recommendation
    db.commit()
    return {'message': 'Prediction Saved'}


def safe_float(value):
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


@app.get('/admin/predictions')
def get_predictions(db: DBSession = Depends(get_db)) -> list[dict]:
    predictions = (
        db.query(InventoryPrediction)
        .order_by(InventoryPrediction.product_id, InventoryPrediction.generated_at.desc())
        .all()
    )
    latest_predictions = {}
    for prediction in predictions:
        if prediction.product_id not in latest_predictions:
            latest_predictions[prediction.product_id] = prediction

    result = []
    for prediction in latest_predictions.values():
        product = db.query(DBProduct).filter(DBProduct.id == prediction.product_id).first()
        result.append({
            'id': prediction.id,
            'product_id': prediction.product_id,
            'product_name': product.name if product else None,
            'current_stock': prediction.current_stock,
            'average_daily_sales': safe_float(prediction.average_daily_sales),
            'predicted_stockout_days': safe_float(prediction.predicted_stockout_days),
            'demand_growth': safe_float(prediction.demand_growth),
            'risk_level': prediction.risk_level,
            'recommendation': prediction.recommendation,
            'generated_at': prediction.generated_at,
        })
    return result


@app.post('/admin/generate-predictions', response_model=None)
def generate_predictions():
    result = generate_ai_prediction()
    if result.get('success'):
        return result
    return JSONResponse(status_code=502, content=result)


@app.get('/admin/report-data')
def report_summary(db: DBSession = Depends(get_db)) -> dict:
    products = db.query(DBProduct).all()
    total_products = len(products)
    available_stock = sum(product.quantity for product in products)
    low_stock_products = db.query(DBProduct).filter(DBProduct.quantity <= 10).all()
    out_of_stock_products = db.query(DBProduct).filter(DBProduct.quantity == 0).all()

    sales = db.query(InventoryHistory).all()
    today_sales = sum(sale.units_sold for sale in sales if sale.recorded_date == date.today())
    products_sold_today = len([sale for sale in sales if sale.recorded_date == date.today()])
    avg_daily_sales = int(sum(sale.units_sold for sale in sales) / len(sales)) if sales else 0

    predictions = (
        db.query(InventoryPrediction)
        .order_by(InventoryPrediction.product_id, InventoryPrediction.generated_at.desc())
        .all()
    )
    latest_predictions = {}
    for prediction in predictions:
        if prediction.product_id not in latest_predictions:
            latest_predictions[prediction.product_id] = prediction

    latest_list = list(latest_predictions.values())
    predictions_generated = len(latest_list)
    high_risk_predictions = len([p for p in latest_list if (p.risk_level or '').upper() == 'HIGH'])
    medium_risk_predictions = len([p for p in latest_list if (p.risk_level or '').upper() == 'MEDIUM'])
    low_risk_predictions = len([p for p in latest_list if (p.risk_level or '').upper() == 'LOW'])
    stockout_predictions = len([p for p in latest_list if p.predicted_stockout_days is not None])
    average_stockout_days = (
        int(sum(p.predicted_stockout_days for p in latest_list if p.predicted_stockout_days is not None) / stockout_predictions)
        if stockout_predictions > 0 else 0
    )

    return {
        'inventory_summary': {
            'total_products': total_products,
            'available_stock': available_stock,
            'low_stock': len(low_stock_products),
            'out_of_stock': len(out_of_stock_products),
        },
        'sales_summary': {
            'today_sales': today_sales,
            'products_sold_today': products_sold_today,
            'average_daily_sales': avg_daily_sales,
        },
        'ai_summary': {
            'predictions_generated': predictions_generated,
            'high_risk': high_risk_predictions,
            'medium_risk': medium_risk_predictions,
            'low_risk': low_risk_predictions,
            'average_stockout_days': average_stockout_days,
        },
    }
