from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session 
from app.models.order import Order, OrderItem, OrderStatus
from app.schemas.order import OrderCreate, OrderUpdate, OrderWithItems, Order as OrderSchema
from app.models.cart import CartItem
from app.models.user import User
from app.api.deps.auth import get_current_active_user, get_current_admin_user
from app.api.deps.database import get_db
from typing import List
from app.core.limiter import limiter

router = APIRouter()

@router.get("", response_model=List[OrderSchema])
@limiter.limit("20/minute")
async def list_user_orders(request: Request, skip: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100), current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Get user's order history"""

    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

    return orders

@router.get("/admin/all", response_model=List[OrderSchema])
@limiter.limit("20/minute")
async def list_all_orders(request: Request, skip: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100), order_status: OrderStatus = None, current_user: User = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    """List all orders (Admin only)"""

    query = db.query(Order)

    if order_status:
        query = query.filter(Order.status == order_status)

    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

    return orders

@router.get("/{order_id}", response_model=OrderWithItems)
@limiter.limit("20/minute")
async def get_order(request: Request, order_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Get order details"""

    order = db.query(Order).filter(Order.user_id == current_user.id, order_id == Order.id).first()

    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = "Order not found")
    
    return order


@router.post("", response_model=OrderWithItems, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
async def create_order(request: Request, new_order: OrderCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Create order from cart (checkout)"""

    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()

    if not cart_items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = "Cart is empty")
    
    total_amount = 0

    for cart_item in cart_items:
        product = cart_item.product

        if not product.is_available:

            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = f"product {product.name} is not available")
             
        if product.stock < cart_item.quantity:

            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = f"Not enough stock for {product.name}. Available: {product.stock}")
        
        total_amount += product.price * cart_item.quantity


    order = Order(user_id=current_user.id, total_amount=total_amount, status=OrderStatus.PENDING, shipping_address=new_order.shipping_address)

    db.add(order)
    db.flush()

    for cart_item in cart_items:
        order_item = OrderItem(order_id=order.id, product_id=cart_item.product.id, quantity=cart_item.quantity, price=cart_item.product.price)

        db.add(order_item)

        cart_item.product.stock -= cart_item.quantity

    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()

    db.commit()
    db.refresh(order)

    return order

 
@router.put("/{order_id}/status", response_model=OrderSchema)
@limiter.limit("20/minute")
async def update_order_status(request: Request, order_id: int, order_update: OrderUpdate, current_user: User = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    """Update order status (Admin only)"""

    order = db.query(Order).filter(order_id == Order.id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = "Order not found")
    

    order.status = order_update.status
    db.commit()
    db.refresh(order)
    
    return order