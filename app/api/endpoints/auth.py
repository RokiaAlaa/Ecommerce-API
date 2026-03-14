from fastapi import APIRouter,status, HTTPException, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api.deps.database import get_db
from app.api.deps.auth import get_current_active_user
from app.core.security import hash_password, verify_password
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, User as UserSchema, UserUpdate
from app.schemas.token import Token
from app.core import security
from app.services.cache import redis_client
from app.api.deps.auth import oauth2_scheme
from app.core.limiter import limiter

router = APIRouter()

@router.post("/register", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
async def register(request: Request, user_in: UserCreate, db: Session = Depends(get_db)): 
    """Register a new user"""
    existing_email = db.query(User).filter(user_in.email == User.email).first()

    if existing_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Email already registered')
        
    existing_username = db.query(User).filter(user_in.username == User.username).first()

    if existing_username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Username already taken')
    

    new_user = User(
                    email=user_in.email,
                    username=user_in.username,
                    fullname=user_in.fullname,
                    password=hash_password(user_in.password),
                    mobile=user_in.mobile,
                    is_active=True,
                    is_admin=False
                    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)  

    return new_user


@router.post("/login", response_model=Token)
@limiter.limit("20/minute")
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login with email/username and password"""
    user = db.query(User).filter((form_data.username == User.username) | (form_data.username == User.email)).first()

    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email/username or password", headers={"WWW-Authenticate": "Bearer"})
    
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    
    access_token = security.create_access_token(data = {"user_id" : user.id})

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserSchema)
@limiter.limit("20/minute")
async def read_current_user(request: Request, current_user: User = Depends(get_current_active_user)):
    """Get current user profile"""
    return current_user


@router.put("/me", response_model=UserSchema)
@limiter.limit("20/minute")
async def update_current_user(request: Request, user_update: UserUpdate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Update current user profile"""
    if user_update.email: 
        existing = db.query(User).filter(user_update.email == User.email, current_user.id != User.id).first()

        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Email already registered')

        current_user.email = user_update.email

    if user_update.username: 
        existing = db.query(User).filter(user_update.username == User.username, current_user.id != User.id).first()

        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Username already taken')

        current_user.username = user_update.username
  
    if user_update.fullname: 
        current_user.fullname = user_update.fullname

    
    if user_update.mobile: 
        current_user.mobile = user_update.mobile
    
    if user_update.password: 
        current_user.password = hash_password(user_update.password)

    db.commit()
    db.refresh(current_user)

    return current_user


@router.post("/logout")
@limiter.limit("20/minute")
async def logout(request: Request, token: str = Depends(oauth2_scheme), current_user: User = Depends(get_current_active_user)): 
    """Logout (client should delete token)"""
    await redis_client.setex(
        f"blacklist:{token}",
        settings.access_token_expire_minutes * 60,
        "blacklisted"
    )

    return {"message": "Successfully logged out"}