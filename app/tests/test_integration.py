import pytest
from fastapi import status

def test_complete_user_flow(client, test_product):
    """Test complete user journey from registration to order"""

    # 1. Register
    response = client.post(
        '/api/v1/auth/register',
        json={
            'email': 'newuser@example.com',
            'username': 'newuser',
            'fullname': 'New User',
            'password': "password123"
        }
    )

    assert response.status_code == status.HTTP_201_CREATED

    # 2. Login
    response = client.post(
        '/api/v1/auth/login',
        data={'username': 'newuser@example.com' ,'password': "password123"}
    )

    assert response.status_code == status.HTTP_200_OK
    token = response.json()['access_token']
    user_headers = {'Authorization': f'Bearer {token}'}

    # 3. Browse products
    response = client.get("/api/v1/products")
    assert response.status_code == status.HTTP_200_OK

    # 4. Add to cart
    response = client.post(
        "/api/v1/cart/items", 
        headers=user_headers,
        json={
            "product_id": test_product.id,
            'quantity': 2
        }
    )

    assert response.status_code == status.HTTP_201_CREATED

    # 5. View cart
    response = client.get("/api/v1/cart", headers=user_headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()['total_items'] == 2

    # 6. Checkout
    response = client.post(
        '/api/v1/orders',
        headers=user_headers,
        json={'shipping_address': '123 Test St, Test City'}
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert response.json()['total_amount'] == test_product.price * 2

    # 7. View order history
    response = client.get('/api/v1/orders', headers=user_headers)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) > 0 

def test_admin_product_management_flow(client, test_category, admin_headers):
    """Test admin managing products"""

    # Create product
    response = client.post(
        f"/api/v1/products", 
        headers=admin_headers,
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
    product_id = response.json()['id']

    # Update product
    response = client.put(
        f"/api/v1/products/{product_id}",
        headers=admin_headers,
        json={
            'price': 49.99,
            'stock': 20,
        }
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json()['price'] == 49.99

    # Delete product
    response = client.delete(
        f"/api/v1/products/{product_id}",
        headers=admin_headers,
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Verify deleted
    response = client.get(f"/api/v1/products/{product_id}")

    assert response.status_code == status.HTTP_404_NOT_FOUND

## status