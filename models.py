from typing import Optional

from pydantic import BaseModel


class Product(BaseModel):
    id: Optional[int] = None
    name: str
    description: str
    price: float
    quantity: int

    model_config = {
        'from_attributes': True,
    }


class InventoryUpdate(BaseModel):
    product_id: int
    units_sold: int

    model_config = {
        'from_attributes': True,
    }
