import pytest
from fastapi import status

def test_register_user(client): 
    """Test user registration"""
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
    data = response.json() #from json to py dict
    assert data['email'] == 'newuser@example.com'
    assert data['username'] == 'newuser'
    assert 'hashed_password' not in data

def test_register_duplicate_email(client, test_user): 
    """Test registration with duplicate email"""
    response = client.post(
        '/api/v1/auth/register',
        json={
            'email': test_user.email,
            'username': 'different',
            'password': "password123"
        }
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'already registered' in response.json()['detail'].lower()

def test_register_duplicate_username(client, test_user): 
    """Test registration with duplicate username"""
    response = client.post(
        '/api/v1/auth/register',
        json={
            'email': 'different@emaple.com',
            'username': test_user.username,
            'password': "password123"
        }
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'already taken' in response.json()['detail'].lower()

def test_login_success(client, test_user): 
    """Test successful login"""
    response = client.post(
        '/api/v1/auth/login',
        data={'username': test_user.email ,'password': "testpassword"}
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert 'access_token' in data
    assert data['token_type'] == 'bearer'

def test_login_wrong_password(client, test_user): 
    """Test login with wrong password"""
    response = client.post(
        '/api/v1/auth/login',
        data={'username': test_user.email ,'password': "wrongpassword"}
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_login_nonexist_user(client): 
    """Test login with non-existent user"""
    response = client.post(
        '/api/v1/auth/login',
        data={'username': "nonexistent@example.com" ,'password': "password"}
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_current_user(client, test_user, user_headers):
    """Test getting current user profile"""
    response = client.get('/api/v1/auth/me', headers=user_headers)

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data['email'] == test_user.email
    assert data['username'] == test_user.username

def test_get_current_user_unauthorized(client):
    """Test getting profile without token"""
    response = client.get('/api/v1/auth/me')

    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_current_invalid_token(client):
    """Test getting profile with invalid token"""
    headers = {"Authorization": "Bearer invalid token"}
    response = client.get('/api/v1/auth/me', headers=headers)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_update_current_user(client, test_user, user_headers):    
    """Test updating user profile"""

    response = client.put(
        '/api/v1/auth/me',
        headers=user_headers,
        json={
            'fullname': 'Updated Name',
            'email': 'updated@example.com',
            'username': 'updatedusername',
            'mobile': '01228665588'
        }
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data['fullname'] == 'Updated Name'
    assert data['email'] == 'updated@example.com'
    assert data['username'] == 'updatedusername'
    assert data['mobile'] == '01228665588'

def test_update_password(client, test_user, user_headers):   
    """Test password update"""

    response = client.put(
        '/api/v1/auth/me',
        headers=user_headers,
        json={'password': 'newpassword123'}
    )

    assert response.status_code == status.HTTP_200_OK

    response = client.post(
        '/api/v1/auth/login',
        data={'username': test_user.email ,'password': "newpassword123"}
    )

    assert response.status_code == status.HTTP_200_OK