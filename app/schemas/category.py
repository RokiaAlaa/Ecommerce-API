from pydantic import BaseModel
from typing import Optional, List#, TYPE_CHECKING
from datetime import datetime

# if TYPE_CHECKING:
#     from app.schemas.product import Product
    
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    slug: str

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    slug: Optional[str] = None

class Category(CategoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# class CategoryWithProducts(Category):
#     products: List['Product']

#     class Config:
#         from_attributes = True