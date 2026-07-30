

from pydantic import BaseModel, Field


class DailySalesRequest(BaseModel):
    product_id: int
    units_sold: int
    
class PredictionRequest(BaseModel):

    product_id: int

    current_stock: int

    average_daily_sales: float

    predicted_stockout_days: int

    demand_growth: float = Field(..., alias="demand_growth")

    risk_level: str

    recommendation: str

    model_config = {
        "populate_by_name": True
    }