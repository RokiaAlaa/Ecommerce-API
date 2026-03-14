import redis.asyncio as redis
import json
from typing import Optional
from app.core.config import settings
from app.models.product import Product

redis_client = redis.Redis.from_url(f'redis://{settings.redis_hostname}:{settings.redis_port}', decode_responses=True)

PRODUCT_CACHE_TTL = 3600

async def cache_product(product: Product) -> None:
    """Cache product data"""
    cache_key = f'product:{product.id}'
    product_data = {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "stock": product.stock,
        "category_id": product.category_id,
        "image_url": product.image_url,
        "is_available": product.is_available,
    }
    await redis_client.setex(cache_key, PRODUCT_CACHE_TTL, json.dumps(product_data))

async def get_cached_product(product_id: int) -> Optional[dict]:
    """Get cached product"""
    cache_key = f'product:{product_id}'
    cached = await redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    return None

async def invalidate_product_cache(product_id: int) -> None:
    """Invalidate product cache"""
    cache_key = f'product:{product_id}'
    await redis_client.delete(cache_key)