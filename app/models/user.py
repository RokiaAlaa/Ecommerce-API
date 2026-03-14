from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.sql.sqltypes import TIMESTAMP
from sqlalchemy.orm import relationship
from app.api.deps.database import Base
from sqlalchemy.sql.expression import text
from app.api.deps.database import Base

class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False, unique=True, index=True)
    username = Column(String, nullable=False, unique=True, index=True)
    fullname = Column(String)
    password = Column(String, nullable=False) # hashed
    is_active = Column(Boolean, server_default='1') 
    is_admin = Column(Boolean, server_default='0')
    mobile = Column(String)
    created_at = Column(TIMESTAMP(timezone = True), nullable=False, server_default=text('CURRENT_TIMESTAMP'))
    updated_at = Column(TIMESTAMP(timezone = True), nullable=True, server_default=text('CURRENT_TIMESTAMP'))

    cart_items = relationship("CartItem", back_populates="user", cascade='all, delete-orphan')
    orders = relationship("Order", back_populates="user", cascade='all, delete-orphan')
