from pydantic import BaseModel, Field
from typing import TYPE_CHECKING, Optional
from datetime import datetime

if TYPE_CHECKING:
    from app.schemas.category import Category

    
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None 
    price: float = Field(gt=0)
    stock: int = Field(ge=0)
    category_id: int
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None 
    price: Optional[float] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0) 
    category_id: Optional[int] = None
    image_url: Optional[str] = None
    is_available: Optional[bool] = None

class Product(ProductBase):
    id: int
    is_available: bool
    created_at: datetime

    class Config:
        from_attributes = True 

class ProductWithCategory(Product):
    category: 'Category'

from app.schemas.category import Category
ProductWithCategory.model_rebuild()