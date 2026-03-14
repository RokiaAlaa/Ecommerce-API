import pytest
from fastapi import status

def test_get_empty_cart(client, user_headers):
    """Test getting empty cart"""
    response = client.get("/api/v1/cart", headers=user_headers)

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data['total_items'] == 0
    assert data['total_price'] == 0

def test_add_to_cart(client, user_headers, test_product):
    """Test adding item to cart"""
    response = client.post(
        "/api/v1/cart/items", 
        headers=user_headers,
        json={
            "product_id": test_product.id,
            'quantity': 2
        }
    )

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data['product_id'] == test_product.id
    assert data['quantity'] == 2

def test_add_to_cart_insufficient_stock(client, user_headers, test_product):
    """Test adding more items than available stock"""
    response = client.post(
        "/api/v1/cart/items", 
        headers=user_headers,
        json={
            "product_id": test_product.id,
            'quantity': test_product.stock + 10
        }
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "stock" in response.json()['detail'].lower()

def test_add_to_cart_nonexistent_product(client, user_headers):
    """Test adding non-existent product"""
    response = client.post(
        "/api/v1/cart/items", 
        headers=user_headers,
        json={
            "product_id": 99999,
            'quantity': 1
        }
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_update_cart_item(client, user_headers, test_product):
    """Test updating cart item quantity"""

    response = client.post(
        "/api/v1/cart/items", 
        headers=user_headers,
        json={"product_id": test_product.id,'quantity': 1}
    )

    cart_item_id = response.json()['id']

    response = client.put(
        f"/api/v1/cart/items/{cart_item_id}", 
        headers=user_headers,
        json={'quantity': 3}
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data['quantity'] == 3

def test_remove_cart_item(client, user_headers, test_product):
    """Test removing item from cart"""

    response = client.post(
        "/api/v1/cart/items", 
        headers=user_headers,
        json={"product_id": test_product.id,'quantity': 1}
    )

    cart_item_id = response.json()['id']

    response = client.delete(
        f"/api/v1/cart/items/{cart_item_id}", 
        headers=user_headers,
    )

    assert response.status_code == status.HTTP_204_NO_CONTENT

def test_clear_cart(client, user_headers, test_product):
    """Test clearing entire cart"""

    response = client.post(
        "/api/v1/cart/items", 
        headers=user_headers,
        json={"product_id": test_product.id,'quantity': 1}
    )

    response = client.delete("/api/v1/cart", headers=user_headers)

    assert response.status_code == status.HTTP_204_NO_CONTENT

    response = client.get("/api/v1/cart", headers=user_headers)
    assert response.json()['total_items'] == 0

def test_cart_calculates_total(client, user_headers, test_product):
    """Test cart total calculation"""

    response = client.post(
        "/api/v1/cart/items", 
        headers=user_headers,
        json={"product_id": test_product.id,'quantity': 3}
    )

    response = client.get("/api/v1/cart", headers=user_headers)
    data = response.json()

    expected_total = test_product.price * 3
    assert data['total_items'] == 3
    assert data['total_price'] == expected_total