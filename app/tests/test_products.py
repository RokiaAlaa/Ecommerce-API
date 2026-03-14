import pytest
from fastapi import status

def test_list_products(client, test_product):
    """Test listing products"""
    response = client.get("/api/v1/products")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_get_product(client, test_product):
    """Test getting single product"""
    response = client.get(f"/api/v1/products/{test_product.id}")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data['id'] == test_product.id
    assert data['name'] == test_product.name

def test_get_nonexistent_product(client):
    """Test getting non-existent product"""
    response = client.get("/api/v1/products/99999")

    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_filter_products_by_category(client, test_product, test_category):
    """Test filtering products by category"""
    response = client.get(f"/api/v1/products?category_id={test_category.id}")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert all(p['category_id'] == test_category.id for p in data)

def test_filter_products_by_price(client, test_product):
    """Test filtering products by price range"""
    response = client.get("/api/v1/products?min_price=50&max_price=150")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert all(50 <= p['price'] <= 150 for p in data)

def test_search_products(client, test_product):
    """Test product search"""
    response = client.get(f"/api/v1/products?search={test_product.name[:4]}")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) > 0

def test_create_products_admin(client, test_category, admin_headers):
    """Test creating product as admin"""
    response = client.post(
        f"/api/v1/products", headers=admin_headers,
        json={
            'name': 'New product',
            'description': 'New Description',
            'price': 49.99,
            'stock': 20,
            'category_id': test_category.id,
            'image_url': "https://example.com/image.jpg",
            'is_available': True
        }
    )

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data['name'] == 'New product'

def test_create_products_non_admin(client, test_category, user_headers):
    """Test creating product as regular user (should fail)"""
    response = client.post(
        f"/api/v1/products",
        headers=user_headers,
        json={
            'name': 'New product',
            'description': 'New Description',
            'price': 49.99,
            'stock': 20,
            'category_id': test_category.id,
            'image_url': "https://example.com/image.jpg",
            'is_available': True
        }
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN

def test_update_product(client, test_product, admin_headers):
    """Test updating product"""
    response = client.put(
        f"/api/v1/products/{test_product.id}",
        headers=admin_headers,
        json={
            'price': 49.99,
            'stock': 20,
        }
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data['price'] == 49.99
    assert data['stock'] == 20

def test_delete_product(client, test_product, admin_headers):
    """Test deleting product"""
    response = client.delete(
        f"/api/v1/products/{test_product.id}",
        headers=admin_headers,
    )

    assert response.status_code == status.HTTP_204_NO_CONTENT

    response = client.get(f"/api/v1/products/{test_product.id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND