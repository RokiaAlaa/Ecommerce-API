from pydantic import BaseModel, Field
from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.schemas.product import Product

class CartItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., ge=1)

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1)

class CartItem(CartItemBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class CartItemWithProduct(CartItem):
    product: 'Product'

class Cart(BaseModel):
    items: list[CartItemWithProduct]
    total_items: int
    total_price: float

from app.schemas.product import Product
CartItemWithProduct.model_rebuild()
Cart.model_rebuild()
