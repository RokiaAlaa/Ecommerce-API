import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.api.deps.database import SessionLocal
from app.models.category import Category
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.models.cart import CartItem
from app.models.user import User
from app.core.security import hash_password

db = SessionLocal()

def seed_categories():
    categories = [
        {"name": "Electronics", "slug": "electronics", "description": "Latest gadgets and tech devices"},
        {"name": "Fashion", "slug": "fashion", "description": "Trendy clothing and accessories"},
        {"name": "Home & Living", "slug": "home-living", "description": "Beautiful home decor and furniture"},
        {"name": "Beauty", "slug": "beauty", "description": "Skincare, makeup and wellness products"},
        {"name": "Books", "slug": "books", "description": "Fiction, non-fiction and educational books"},
        {"name": "Sports", "slug": "sports", "description": "Sports equipment and activewear"},
    ]

    created = []
    for cat in categories:
        existing = db.query(Category).filter(Category.slug == cat["slug"]).first()
        if not existing:
            category = Category(**cat)
            db.add(category)
            db.flush()
            created.append(category)
            print(f"Created category: {cat['name']}")
        else:
            created.append(existing)
            print(f"Category already exists: {cat['name']}")

    db.commit()
    return created


def seed_products(categories):
    cat = {c.slug: c.id for c in categories}

    products = [
        # Electronics
        {
            "name": "Wireless Noise-Cancelling Headphones",
            "description": "Premium over-ear headphones with active noise cancellation, 30-hour battery life, and superior sound quality.",
            "price": 149.99,
            "stock": 50,
            "category_id": cat["electronics"],
            "image_url": "/images/496de09493e23048a7c83f3357d9339c.jpg",
            "is_available": True,
        },
        {
            "name": "Smart Watch Pro",
            "description": "Feature-packed smartwatch with health monitoring, GPS, and 7-day battery life.",
            "price": 199.99,
            "stock": 35,
            "category_id": cat["electronics"],
            "image_url": "/images/96f679740714cb14e700edb42ddb8378.jpg",
            "is_available": True,
        },
        {
            "name": "Bluetooth Speaker",
            "description": "Portable waterproof speaker with 360-degree sound and 12-hour playtime.",
            "price": 79.99,
            "stock": 80,
            "category_id": cat["electronics"],
            "image_url": "/images/6359730d78ec4a1b7f4a3db7f50b21f4.jpg",
            "is_available": True,
        },
        {
            "name": "Mechanical Keyboard",
            "description": "TKL mechanical keyboard with RGB backlighting and tactile switches.",
            "price": 89.99,
            "stock": 40,
            "category_id": cat["electronics"],
            "image_url": "/images/c24ebdf18ce0a0b63cdd197769db81bc.jpg",
            "is_available": True,
        },

        # Fashion
        {
            "name": "Classic Leather Bag",
            "description": "Handcrafted genuine leather tote bag, perfect for work or casual outings.",
            "price": 129.99,
            "stock": 25,
            "category_id": cat["fashion"],
            "image_url": "/images/09ce8c155307c47382be359a495a059c.jpg",
            "is_available": True,
        },
        {
            "name": "Minimalist Sunglasses",
            "description": "UV400 polarized sunglasses with lightweight titanium frame.",
            "price": 59.99,
            "stock": 60,
            "category_id": cat["fashion"],
            "image_url": "/images/d2954bb2e6fe18384dae4d77aa68a696.jpg",
            "is_available": True,
        },
        {
            "name": "Wool Knit Sweater",
            "description": "Soft merino wool sweater in a classic relaxed fit, available in multiple colors.",
            "price": 89.99,
            "stock": 45,
            "category_id": cat["fashion"],
            "image_url": "/images/2ab4fb750857a25a15dd7233340bb411.jpg",
            "is_available": True,
        },
        {
            "name": "Canvas Sneakers",
            "description": "Lightweight canvas sneakers with cushioned insole, perfect for everyday wear.",
            "price": 49.99,
            "stock": 70,
            "category_id": cat["fashion"],
            "image_url": "/images/2ea88297e9ef726f98a8617db808c9ba.jpg",
            "is_available": True,
        },

        # Home & Living
        {
            "name": "Ceramic Vase Set",
            "description": "Set of 3 handcrafted ceramic vases in earthy tones, perfect for minimalist decor.",
            "price": 48.00,
            "stock": 30,
            "category_id": cat["home-living"],
            "image_url": "/images/c072fc1aac3e901d352896c844510e5d.jpg",
            "is_available": True,
        },
        {
            "name": "Scented Candle Collection",
            "description": "Set of 4 soy wax candles in calming scents: vanilla, lavender, sandalwood, and rose.",
            "price": 36.00,
            "stock": 55,
            "category_id": cat["home-living"],
            "image_url": "/images/d9f4391ef767b434bc5641e4b044dfdb.jpg",
            "is_available": True,
        },
        {
            "name": "Linen Throw Pillow",
            "description": "Soft linen throw pillow with removable cover, available in neutral tones.",
            "price": 29.99,
            "stock": 65,
            "category_id": cat["home-living"],
            "image_url": "/images/f2744c5f2db55f967108142276b3f124.jpg",
            "is_available": True,
        },
        {
            "name": "Wooden Serving Board",
            "description": "Handcrafted acacia wood serving board with juice groove, ideal for charcuterie.",
            "price": 42.00,
            "stock": 40,
            "category_id": cat["home-living"],
            "image_url": "/images/e0d20e447a1dced7bb77480b6baccb49.jpg",
            "is_available": True,
        },

        # Beauty
        {
            "name": "Rose Face Serum",
            "description": "Hydrating face serum with rose extract and hyaluronic acid for glowing skin.",
            "price": 38.00,
            "stock": 90,
            "category_id": cat["beauty"],
            "image_url": "/images/d4b5636999ca3f041f0964f1dd019dd5.jpg",
            "is_available": True,
        },
        {
            "name": "Jade Roller Set",
            "description": "Natural jade facial roller and gua sha tool set for relaxing skincare routine.",
            "price": 24.99,
            "stock": 75,
            "category_id": cat["beauty"],
            "image_url": "/images/c18b7757186059195797904c21c569ea.jpg",
            "is_available": True,
        },
        {
            "name": "Lip Care Kit",
            "description": "Nourishing lip care set with scrub, balm, and serum for soft, healthy lips.",
            "price": 19.99,
            "stock": 100,
            "category_id": cat["beauty"],
            "image_url": "/images/c504f22b935eb116a0d3b973c9f0e3cc.jpg",
            "is_available": True,
        },

        # Books
        {
            "name": "The Art of Thinking Clearly",
            "description": "A practical guide to overcoming cognitive biases for better decision-making.",
            "price": 14.99,
            "stock": 120,
            "category_id": cat["books"],
            "image_url": "/images/e3b22eba56890606924bb4dc738fb13a.jpg",
            "is_available": True,
        },
        {
            "name": "Atomic Habits",
            "description": "A proven framework for building good habits and breaking bad ones.",
            "price": 16.99,
            "stock": 110,
            "category_id": cat["books"],
            "image_url": "/images/1cb5da527dc50195cb41cb0ed6c19145.jpg",
            "is_available": True,
        },
        {
            "name": "The Midnight Library",
            "description": "A novel about the choices that make a life worth living.",
            "price": 13.99,
            "stock": 85,
            "category_id": cat["books"],
            "image_url": "/images/bd30d5fd3065b0833aa56f58dded646d.jpg",
            "is_available": True,
        },

        # Sports
        {
            "name": "Yoga Mat Premium",
            "description": "Non-slip eco-friendly yoga mat with alignment lines and carrying strap.",
            "price": 55.00,
            "stock": 45,
            "category_id": cat["sports"],
            "image_url": "/images/c8575f6a1b492c48dcf120ef8ddd37f3.jpg",
            "is_available": True,
        },
        {
            "name": "Resistance Bands Set",
            "description": "Set of 5 resistance bands in different strengths for full-body workouts.",
            "price": 29.99,
            "stock": 95,
            "category_id": cat["sports"],
            "image_url": "/images/15408cfcc246849c364dc3a231be0d85.jpg",
            "is_available": True,
        },
        {
            "name": "Water Bottle Insulated",
            "description": "Double-wall insulated stainless steel bottle, keeps drinks cold 24h or hot 12h.",
            "price": 34.99,
            "stock": 80,
            "category_id": cat["sports"],
            "image_url": "/images/c2d2b3c1fd3a8abb0dabe671031dffc0.jpg",
            "is_available": True,
        },
    ]

    for prod in products:
        existing = db.query(Product).filter(Product.name == prod["name"]).first()
        if not existing:
            product = Product(**prod)
            db.add(product)
            print(f"Created product: {prod['name']}")
        else:
            existing.image_url = prod["image_url"]
            print(f"Updated product: {prod['name']}")

    db.commit()


def seed_admin():
    existing = db.query(User).filter(User.email == "admin@lumiere.com").first()
    if not existing:
        admin = User(
            email="admin@lumiere.com",
            username="admin",
            fullname="Admin User",
            password=hash_password("admin123"),
            is_active=True,
            is_admin=True,
        )
        db.add(admin)
        db.commit()
        print("Admin created: admin@lumiere.com / admin123")
    else:
        print("Admin already exists")


if __name__ == "__main__":
    print("Seeding database...")
    categories = seed_categories()
    seed_products(categories)
    seed_admin()
    print("Done!")
    db.close()