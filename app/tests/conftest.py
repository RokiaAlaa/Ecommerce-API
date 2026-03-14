import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
from app.main import app
from app.api.deps.database import get_db, Base
from app.models.user import User
from app.models.category import Category
from app.models.product import Product
from app.core.security import hash_password
from unittest.mock import AsyncMock, patch

@pytest.fixture(autouse=True)
def mock_redis():
    with patch("app.core.security.redis_client") as mock_security, \
         patch("app.services.cache.redis_client") as mock_cache:
        mock_security.get = AsyncMock(return_value=None)
        mock_security.set = AsyncMock(return_value=True)
        mock_security.delete = AsyncMock(return_value=True)
        mock_cache.get = AsyncMock(return_value=None)
        mock_cache.set = AsyncMock(return_value=True)
        mock_cache.delete = AsyncMock(return_value=True)
        yield mock_security

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope='function')
def db():
    """Create database tables for each test"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope='function')
def client(db):
    """Test client"""
    return TestClient(app)

@pytest.fixture
def test_user(db):
    """Create test user"""
    user = User(
        email="test@example.com",
        username='testuser',
        fullname='Test User',
        password=hash_password('testpassword'),
        is_active=True,
        is_admin=False,
        mobile='01228662449',
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture
def test_admin(db):
    """Create test admin"""
    admin = User(
        email="admin@example.com",
        username='admin',
        fullname='Admin User',
        password=hash_password('adminpassword'),
        is_active=True,
        is_admin=True,
        mobile='01228662448',
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin

@pytest.fixture
def test_category(db):
    """Create test category"""
    category = Category(
        name='Electronics',
        description='Electronic devices',
        slug='electronics'
    )

    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@pytest.fixture
def test_product(db, test_category):
    """Create test product"""
    product = Product(
        name="Test Product",
        description='Test Description',
        price=99.99,
        stock=10,
        category_id=test_category.id,
        image_url="https://example.com/image.jpg",
        is_available=True,
    )

    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@pytest.fixture
def user_token(client, test_user):
    """Get JWT token for test user"""
    response = client.post(
        '/api/v1/auth/login',
        data = {"username": test_user.email, "password": 'testpassword'}
    )

    return response.json()['access_token']

@pytest.fixture
def admin_token(client, test_admin):
    """Get JWT token for test admin"""
    response = client.post(
        '/api/v1/auth/login',
        data = {"username": test_admin.email, "password": 'adminpassword'}
    )

    return response.json()['access_token']

@pytest.fixture
def user_headers(user_token):
    """Headers with user token"""
    return {'Authorization': f'Bearer {user_token}'}

@pytest.fixture
def admin_headers(admin_token):
    """Headers with admin token"""
    return {'Authorization': f'Bearer {admin_token}'}
