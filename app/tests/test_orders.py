import pytest
from fastapi import status

def test_create_order_from_cart(client, user_headers, test_product):
    """Test checkout process"""
    
    client.post(
       '/api/v1/cart/items',
       headers=user_headers,
       json={"product_id": test_product.id, 'quantity': 2} 
    )

    response = client.post(
        '/api/v1/orders',
        headers=user_headers,
        json={'shipping_address': '123 Test St, Test City'}
    )

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data['total_amount'] == test_product.price * 2
    assert data['status'] == 'pending' ##
    assert len(data['items']) == 1 

def test_create_order_empty_cart(client, user_headers):
    """Test creating order with empty cart"""

    response = client.post(
        '/api/v1/orders',
        headers=user_headers,
        json={'shipping_address': '123 Test St, Test City'}
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'empty' in response.json()['detail'].lower()

def test_create_order_updates_stock(client, user_headers, test_product, db):
    """Test that order creation decreases stock"""
    initial_stock = test_product.stock 


    client.post(
       '/api/v1/cart/items',
       headers=user_headers,
       json={"product_id": test_product.id, 'quantity': 2} 
    )

    response = client.post(
        '/api/v1/orders',
        headers=user_headers,
        json={'shipping_address': '123 Test St, Test City'}
    )

    db.refresh(test_product)

    assert test_product.stock == initial_stock - 2

def test_create_clear_cart(client, user_headers, test_product):
    """Test that order creation clears cart"""
    
    client.post(
       '/api/v1/cart/items',
       headers=user_headers,
       json={"product_id": test_product.id, 'quantity': 2} 
    )

    response = client.post(
        '/api/v1/orders',
        headers=user_headers,
        json={'shipping_address': '123 Test St, Test City'}
    )

    response = client.get('/api/v1/cart', headers=user_headers)
    assert response.json()['total_items'] == 0

def test_get_user_orders(client, user_headers, test_product):
    """Test getting user's order history"""
    
    client.post(
       '/api/v1/cart/items',
       headers=user_headers,
       json={"product_id": test_product.id, 'quantity': 2} 
    )

    response = client.post(
        '/api/v1/orders',
        headers=user_headers,
        json={'shipping_address': '123 Test St, Test City'}
    )

    response = client.get('/api/v1/orders', headers=user_headers)

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) > 0 

def test_get_order_details(client, user_headers, test_product):
    """Test getting single order details"""
    
    client.post(
       '/api/v1/cart/items',
       headers=user_headers,
       json={"product_id": test_product.id, 'quantity': 2} 
    )

    order_response = client.post(
        '/api/v1/orders',
        headers=user_headers,
        json={'shipping_address': '123 Test St, Test City'}
    )

    order_id = order_response.json()['id']
    response = client.get(f'/api/v1/orders/{order_id}', headers=user_headers)

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data['id'] == order_id
    assert 'items' in data

def test_admin_list_all_orders(client, user_headers, test_product, admin_headers):
    """Test admin listing all orders"""
    
    client.post(
       '/api/v1/cart/items',
       headers=user_headers,
       json={"product_id": test_product.id, 'quantity': 2} 
    )

    client.post(
        '/api/v1/orders',
        headers=user_headers,
        json={'shipping_address': '123 Test St, Test City'}
    )


    response = client.get('/api/v1/orders/admin/all', headers=admin_headers)

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) > 0

def test_admin_update_order_status(client, user_headers, test_product, admin_headers):
    """Test admin updating order status"""
    
    client.post(
       '/api/v1/cart/items',
       headers=user_headers,
       json={"product_id": test_product.id, 'quantity': 2} 
    )

    order_reponse = client.post(
        '/api/v1/orders',
        headers=user_headers,
        json={'shipping_address': '123 Test St, Test City'}
    )

    order_id = order_reponse.json()['id']

    response = client.put(
        f'/api/v1/orders/{order_id}/status',
        headers=admin_headers,
        json={'status': 'processing'}
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()['status'] == 'processing'

def test_user_cannot_update_order_status(client, user_headers, test_product):
    """Test that regular user cannot update order status"""
    
    client.post(
       '/api/v1/cart/items',
       headers=user_headers,
       json={"product_id": test_product.id, 'quantity': 2} 
    )

    order_reponse = client.post(
        '/api/v1/orders',
        headers=user_headers,
        json={'shipping_address': '123 Test St, Test City'}
    )

    order_id = order_reponse.json()['id']

    response = client.put(
        f'/api/v1/orders/{order_id}/status',
        headers=user_headers,
        json={'status': 'processing'}
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN