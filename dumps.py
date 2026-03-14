import pytest
from fastapi import status

def test_complete_user_flow(client, test_category, admin_headers):
    """Test complete user journey from registration to order"""
    
    # 1. Register
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "flow@example.com",
            "username": "flowuser",
            "password": "password123"
        }
    )
    assert response.status_code == status.HTTP_201_CREATED
    
    # 2. Login
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "flow@example.com", "password": "password123"}
    )
    assert response.status_code == status.HTTP_200_OK
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Browse products
    response = client.get("/api/v1/products")
    assert response.status_code == status.HTTP_200_OK
    
    # 4. Create product as admin and add to cart
    response = client.post(
        "/api/v1/products",
        headers=admin_headers,
        json={
            "name": "Flow Product",
            "description": "Test",
            "price": 50.00,
            "stock": 10,
            "category_id": test_category.id
        }
    )
    assert response.status_code == status.HTTP_201_CREATED
    product_id = response.json()["id"]

    response = client.post(
        "/api/v1/cart/items",
        headers=headers,
        json={"product_id": product_id, "quantity": 2}
    )
    assert response.status_code == status.HTTP_201_CREATED
    
    # 5. View cart
    response = client.get("/api/v1/cart", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["total_items"] == 2
    
    # 6. Checkout
    response = client.post(
        "/api/v1/orders",
        headers=headers,
        json={"shipping_address": "123 Test St, Test City"}
    )
    assert response.status_code == status.HTTP_201_CREATED
    assert response.json()["total_amount"] == 50.00 * 2
    
    # 7. View order history
    response = client.get("/api/v1/orders", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) > 0


def test_admin_product_management_flow(client, admin_headers, test_category):
    """Test admin managing products"""
    
    # Create product
    response = client.post(
        "/api/v1/products",
        headers=admin_headers,
        json={
            "name": "Admin Product",
            "description": "Test",
            "price": 99.99,
            "stock": 50,
            "category_id": test_category.id
        }
    )
    assert response.status_code == status.HTTP_201_CREATED
    product_id = response.json()["id"]
    
    # Update product
    response = client.put(
        f"/api/v1/products/{product_id}",
        headers=admin_headers,
        json={"price": 79.99}
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["price"] == 79.99
    
    # Delete product
    response = client.delete(
        f"/api/v1/products/{product_id}",
        headers=admin_headers
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Verify deleted
    response = client.get(f"/api/v1/products/{product_id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND