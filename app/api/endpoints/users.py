from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_admin_user
from app.api.deps.database import get_db
from app.core.limiter import limiter
from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import User as UserSchema
from app.schemas.user import UserUpdate

router = APIRouter()


@router.get("", response_model=List[UserSchema])
@limiter.limit("20/minute")
async def list_users(
    request: Request,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """List all users (Admin only)"""
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.get("/{user_id}", response_model=UserSchema)
@limiter.limit("20/minute")
async def get_user(
    request: Request,
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """Get user by ID (Admin only)"""
    user = db.query(User).filter(user_id == User.id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return user


@router.put("/{user_id}", response_model=UserSchema)
@limiter.limit("20/minute")
async def update_user(
    request: Request,
    user_id: int,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """Update user (Admin only)"""
    user = db.query(User).filter(user_id == User.id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    if user_update.email:
        existing = (
            db.query(User)
            .filter(user_update.email == User.email, user.id != User.id)
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        user.email = user_update.email

    if user_update.username:
        existing = (
            db.query(User)
            .filter(user_update.username == User.username, user.id != User.id)
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken"
            )

        user.username = user_update.username

    if user_update.fullname:
        user.fullname = user_update.fullname

    if user_update.mobile:
        user.mobile = user_update.mobile

    if user_update.password:
        user.password = hash_password(user_update.password)

    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("20/minute")
async def delete_user(
    request: Request,
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """Delete user (Admin only)"""

    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete yourself"
        )

    user = db.query(User).filter(user_id == User.id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    db.delete(user)
    db.commit()
