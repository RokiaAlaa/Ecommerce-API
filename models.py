from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Float, Text, Enum
from sqlalchemy.sql.sqltypes import TIMESTAMP
from sqlalchemy.orm import relationship
from app.api.deps.database import Base
from sqlalchemy.sql.expression import text
import enum


class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, nullable=False)
    email = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False) # hashed
    username = Column(String, nullable=False, unique=True)
    full_name = Column(String, nullable=False)
    status = Column(Boolean, nullable=False, server_default='1') 
    is_admin = Column(Boolean, server_default='0')
    mobile = Column(String, nullable=False)
    created_at = Column(TIMESTAMP(timezone = True), nullable=False, server_default=text('now()'))
    updated_at = Column(TIMESTAMP(timezone = True), nullable=True, server_default=text('now()'))

    cart_items = relationship("CartItem", back_populates="user")
    orders = relationship("Order", back_populates="user")
    
class Category(Base):
    __tablename__ = 'category'

    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String, nullable=False, unique=True)
    description = Column(Text)
    slug = Column(String, nullable=False, unique=True)
    created_at = Column(TIMESTAMP(timezone = True), nullable=False, server_default=text('now()'))
    
    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = 'product'

    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text) #should it be string???
    stock = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    category_id = Column(Integer, ForeignKey("category.id", ondelete="CASCADE"), nullable=False)
    is_available = Column(Boolean, nullable=False, server_default='1')
    image_url = Column(String)
    created_at = Column(TIMESTAMP(timezone = True), nullable=False, server_default=text('now()'))
    updated_at = Column(TIMESTAMP(timezone = True), nullable=True, server_default=text('now()'))
    
    category = relationship("Category", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")
    cart_items = relationship("CartItem", back_populates="product")
    
class OrderStatus(enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    
class CartItem(Base):
    __tablename__ = 'cart_item'

    id = Column(Integer, primary_key=True, nullable=False)
    product_id = Column(Integer, ForeignKey("product.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    quantity  = Column(Integer, nullable=False)
    created_at = Column(TIMESTAMP(timezone = True), nullable=False, server_default=text('now()'))
    updated_at = Column(TIMESTAMP(timezone = True), nullable=False, server_default=text('now()'))

    product = relationship("Product", back_populates="cart_items")
    user = relationship("User", back_populates="cart_items")

class OrderItem(Base):
    __tablename__ = 'order_item'

    id = Column(Integer, primary_key=True, nullable=False)
    product_id = Column(Integer, ForeignKey("product.id", ondelete="CASCADE"), nullable=False)
    order_id = Column(Integer, ForeignKey("order.id", ondelete="CASCADE"), nullable=False)
    quantity  = Column(Integer, nullable=False)
    price  = Column(Float, nullable=False)
    created_at = Column(TIMESTAMP(timezone = True), nullable=False, server_default=text('now()'))

    product = relationship("Product", back_populates="order_items")
    order = relationship("Order", back_populates="items")
    
class Order(Base):
    __tablename__ = 'order'

    id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    shipping_address= Column(Text, nullable=False)
    total_amount  = Column(Float, nullable=False)
    status = Column(Enum(OrderStatus), nullable=False, server_default="pending")
    created_at = Column(TIMESTAMP(timezone = True), nullable=False, server_default=text('now()'))
    updated_at = Column(TIMESTAMP(timezone = True), nullable=False, server_default=text('now()'))
   
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")