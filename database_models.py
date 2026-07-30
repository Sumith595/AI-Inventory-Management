from sqlalchemy import Column, Date, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False, unique=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255))
    price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)

    inventory_history = relationship(
        "InventoryHistory",
        back_populates="product",
        cascade="all, delete-orphan"
    )
    inventory_predictions = relationship(
        "InventoryPrediction",
        back_populates="product",
        cascade="all, delete-orphan"
    )
    inventory_updates = relationship(
        "InventoryUpdate",
        back_populates="product",
        cascade="all, delete-orphan"
    )

class InventoryHistory(Base):
    __tablename__ = "inventory_history"

    id = Column(Integer, primary_key=True, index=True, unique=True)
    product_id = Column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
    )
    stock_remaining = Column(Integer, nullable=False)
    units_sold = Column(Integer, nullable=False)
    recorded_date = Column(Date, nullable=False)

    product = relationship("Product", back_populates="inventory_history")

class InventoryPrediction(Base):
    __tablename__ = "inventory_predictions"

    id = Column(Integer, primary_key=True, index=True, unique=True)
    product_id = Column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
    )
    current_stock = Column(Integer, nullable=False)
    average_daily_sales = Column(Float, nullable=False)
    predicted_stockout_days = Column(Float)
    demand_growth = Column(String(20))
    risk_level = Column(String(20))
    recommendation = Column(Text)
    generated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    product = relationship("Product", back_populates="inventory_predictions")

class InventoryUpdate(Base):
    __tablename__ = "inventory_updates"

    id = Column(Integer, primary_key=True, index=True, unique=True)
    product_id = Column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
    )
    units_sold = Column(Integer, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    product = relationship("Product", back_populates="inventory_updates")

