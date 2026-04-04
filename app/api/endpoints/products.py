from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_admin_user
from app.api.deps.database import get_db
from app.core.limiter import limiter
from app.models.product import Product
from app.models.user import User
from app.schemas.product import Product as ProductSchema
from app.schemas.product import (ProductCreate, ProductUpdate,
                                 ProductWithCategory)
from app.services.cache import (cache_product, get_cached_product,
                                invalidate_product_cache)

router = APIRouter()


@router.get("", response_model=List[ProductSchema])
@limiter.limit("20/minute")
async def list_products(
    request: Request,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category_id: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    List products with filtering and pagination
    - **category_id**: Filter by category
    - **min_price**: Minimum price filter
    - **max_price**: Maximum price filter
    - **search**: Search in product name
    """

    query = db.query(Product).filter(Product.is_available == True)

    if category_id:
        query = query.filter(Product.category_id == category_id)

    if min_price:
        query = query.filter(Product.price >= min_price)

    if max_price:
        query = query.filter(Product.price <= max_price)

    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))

    products = query.offset(skip).limit(limit).all()
    return products


@router.get("/{prod_id}", response_model=ProductWithCategory)
@limiter.limit("20/minute")
async def get_product(request: Request, prod_id: int, db: Session = Depends(get_db)):
    """Get product by ID with caching"""

    cached = await get_cached_product(prod_id)
    if cached:
        return cached

    prod = db.query(Product).filter(prod_id == Product.id).first()
    if not prod:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    await cache_product(prod)

    return prod

@router.post("", response_model=ProductSchema, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
async def create_product(
    request: Request,
    new_prod: ProductCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """Create product (Admin only)"""

    prod = Product(**new_prod.model_dump())
    db.add(prod)
    db.commit()
    db.refresh(prod)

    return prod


@router.put("/{prod_id}", response_model=ProductSchema)
@limiter.limit("20/minute")
async def update_product(
    request: Request,
    prod_id: int,
    new_prod: ProductUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """Update product (Admin only)"""

    prod = db.query(Product).filter(prod_id == Product.id).first()
    if not prod:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    update_data = new_prod.model_dump(exclude_unset=True)

    for field, val in update_data.items():
        setattr(prod, field, val)

    db.commit()
    db.refresh(prod)

    await invalidate_product_cache(prod_id)

    return prod


@router.delete("/{prod_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("20/minute")
async def delete_product(
    request: Request,
    prod_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """Delete product (Admin only)"""

    prod = db.query(Product).filter(prod_id == Product.id).first()
    if not prod:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    db.delete(prod)
    db.commit()

    await invalidate_product_cache(prod_id)
