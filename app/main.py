from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.deps.database import Base, engine
from app.api.router import api_router
from app.core.config import settings
from app.core.limiter import limiter
from app.core.logging import logger

Base.metadata.create_all(bind=engine)


app = FastAPI(
    title=settings.app_name,
    description="E-Commerce API with FastAPI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.on_event("startup")
async def startup_event():
    logger.info("Application starting up...")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Application shutting down...")


@app.get("/")
async def root():
    return {"message": "E-commerce API", "docs": "/docs"}


@app.get("/health")
async def health_checks():
    return {"status": "healthy"}


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="E-commerce API",
        version="1.0.0",
        description="""
# E-commerce API

A complete RESTful API for e-commerce applications built with FastAPI.

## Features

* **User Authentication**: JWT-based authentication with registration and login
* **Product Management**: CRUD operations for products with categories
* **Shopping Cart**: Add, update, remove items from cart
* **Order Management**: Checkout process and order tracking
* **Admin Panel**: Admin-only endpoints for managing products and orders
* **Caching**: Redis caching for improved performance
* **Search & Filtering**: Advanced product search and filtering

## Authentication

Most endpoints require authentication. Use the `/auth/login` endpoint to get an access token.

Include the token in the `Authorization` header:

Authorization: Bearer <your_token>

## Rate Limiting

API requests are rate-limited to prevent abuse. Limits:
- 20 requests per minute per IP.
        """,
        routes=app.routes,
        tags=[
            {
                "name": "Authentication",
                "description": "User registration, login, and profile management",
            },
            {"name": "Users", "description": "User management (Admin only)"},
            {"name": "Categories", "description": "Product categories"},
            {
                "name": "Products",
                "description": "Product catalog with search and filtering",
            },
            {"name": "Cart", "description": "Shopping cart operations"},
            {"name": "Orders", "description": "Order creation and management"},
        ],
    )

    openapi_schema["info"]["x-logo"] = {
        "url": "https://fastapi.tiangolo.com/img/logo-margin/logo-teal.png"
    }

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
