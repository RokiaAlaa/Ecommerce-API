from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_admin_user
from app.api.deps.database import get_db
from app.core.limiter import limiter
from app.models.category import Category
from app.models.user import User
from app.schemas.category import Category as CategorySchema
from app.schemas.category import CategoryCreate, CategoryUpdate

router = APIRouter()


@router.get("", response_model=List[CategorySchema])
@limiter.limit("20/minute")
async def list_categories(request: Request, db: Session = Depends(get_db)):
    """List all categories (Public)"""

    categories = db.query(Category).all()
    return categories


@router.get("/{cat_id}", response_model=CategorySchema)
@limiter.limit("20/minute")
async def get_category(request: Request, cat_id: int, db: Session = Depends(get_db)):
    """Get category by ID (Public)"""

    cat = db.query(Category).filter(cat_id == Category.id).first()
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Category not found"
        )
    return cat


@router.post("", response_model=CategorySchema, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
async def create_category(
    request: Request,
    new_cat: CategoryCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """Create category (Admin only)"""

    existing = db.query(Category).filter(new_cat.slug == Category.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this slug already exists",
        )

    cat = Category(**new_cat.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)

    return cat


@router.put("/{cat_id}", response_model=CategorySchema)
@limiter.limit("20/minute")
async def update_category(
    request: Request,
    cat_id: int,
    new_cat: CategoryUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """Update category (Admin only)"""

    cat = db.query(Category).filter(cat_id == Category.id).first()
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Category not found"
        )

    update_data = new_cat.model_dump(exclude_unset=True)

    for field, val in update_data.items():
        setattr(cat, field, val)

    db.commit()
    db.refresh(cat)

    return cat


@router.delete("/{cat_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("20/minute")
async def delete_category(
    request: Request,
    cat_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """Delete category (Admin only)"""

    cat = db.query(Category).filter(cat_id == Category.id).first()
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Category not found"
        )

    db.delete(cat)
    db.commit()
