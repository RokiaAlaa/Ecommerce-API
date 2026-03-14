from pydantic import BaseModel, Field
from typing import Optional, List,TYPE_CHECKING
from datetime import datetime
from app.models.order import OrderStatus

if TYPE_CHECKING:
    from app.schemas.product import Product

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int #= Field(..., ge=1)
    price: float

class OrderItem(OrderItemBase):
    id: int
    order_id: int
    # created_at: datetime

    class Config:
        from_attributes = True 

class OrderItemWithProduct(OrderItem):
    product: "Product"

class OrderCreate(BaseModel):
    shipping_address: str

class OrderUpdate(BaseModel):
    status: OrderStatus

class Order(BaseModel):
    id: int
    user_id: int
    total_amount: float
    status: OrderStatus
    shipping_address: str
    created_at: datetime

    class Config:
        from_attributes = True 

class OrderWithItems(Order):
    items: List[OrderItem]

from app.schemas.product import Product
OrderItemWithProduct.model_rebuild() 