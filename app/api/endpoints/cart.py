from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session 
from app.schemas.cart import Cart, CartItem as CartItemSchema, CartItemCreate, CartItemUpdate, CartItemWithProduct
from app.models.cart import CartItem
from app.models.user import User
from app.models.product import Product
from app.api.deps.auth import get_current_active_user
from app.api.deps.database import get_db
from app.core.limiter import limiter

router = APIRouter()

@router.get("", response_model=Cart)
@limiter.limit("20/minute")
async def get_cart(request: Request, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Get user's cart"""

    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()

    total_items = sum(item.quantity for item in cart_items)
    total_price = sum(item.product.price * item.quantity for item in cart_items)

    return {"items" : cart_items, "total_items" : total_items, "total_price" : total_price}


@router.post("/items", response_model=CartItemSchema, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
async def add_to_cart(request: Request, new_item: CartItemCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Add item to cart"""

    product = db.query(Product).filter(Product.id == new_item.product_id).first()

    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = "Product not found")
    
    if not product.is_available:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = "Product is not available")
     
    if product.stock < new_item.quantity:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = f"Not enough stock. Available: {product.stock}")
    

    existing = db.query(CartItem).filter(current_user.id == CartItem.user_id, CartItem.product_id == new_item.product_id).first()

    if existing:
        existing.quantity += new_item.quantity

        if existing.quantity > product.stock:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = "Product is not available")
        
        db.commit()
        db.refresh(existing)
        return existing


    cart_item = CartItem(user_id = current_user.id, product_id = new_item.product_id, quantity = new_item.quantity)

    db.add(cart_item)
    db.commit()
    db.refresh(cart_item)

    return cart_item


@router.put("/items/{item_id}", response_model=CartItemSchema)
@limiter.limit("20/minute")
async def update_cart_item(request: Request, item_id: int, item_update: CartItemUpdate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Update cart item quantity"""

    cart_item = db.query(CartItem).filter(CartItem.id == item_id, current_user.id == CartItem.user_id).first()
    if not cart_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

    if cart_item.product.stock < item_update.quantity:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail = f"Not enough stock. Available: {cart_item.product.stock}")
    
    cart_item.quantity = item_update.quantity
    db.commit()
    db.refresh(cart_item)

    return cart_item

 
@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("20/minute")
async def remove_from_cart(request: Request, item_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Remove item from cart"""

    cart_item = db.query(CartItem).filter(CartItem.id == item_id, current_user.id == CartItem.user_id).first()
    if not cart_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

    db.delete(cart_item)
    db.commit()

@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("20/minute")
async def clear_cart(request: Request, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Clear entire cart"""

    db.query(CartItem).filter(current_user.id == CartItem.user_id).delete()
    db.commit()
    