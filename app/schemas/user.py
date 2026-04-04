from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    username: str
    fullname: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(min_length=6)
    mobile: Optional[str] = None


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    fullname: Optional[str] = None
    password: Optional[str] = Field(None, min_length=6)
    mobile: Optional[str] = None


class User(UserBase):
    id: int
    mobile: Optional[str] = None
    is_active: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str
