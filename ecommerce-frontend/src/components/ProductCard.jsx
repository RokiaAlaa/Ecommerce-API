'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart, loading } = useCart();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to add items to cart');
      return;
    }
    try {
      await addToCart(product.id, 1);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error('Failed to add to cart');
    }
  };

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="bg-[#FAF7F2] rounded-2xl overflow-hidden border border-[#E0D5C5] hover:border-[#C4A98A] transition-all duration-300 hover:shadow-md">
        
        <div className="relative h-56 bg-[#EDE0D4] overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag size={40} className="text-[#C4A98A]" />
            </div>
          )}
          {product.stock < 5 && product.stock > 0 && (
            <span className="absolute top-3 left-3 bg-[#5C3D2E] text-[#FAF7F2] text-xs px-3 py-1 rounded-full">
              Only {product.stock} left
            </span>
          )}
          {product.stock === 0 && (
            <span className="absolute top-3 left-3 bg-[#8C7B6B] text-[#FAF7F2] text-xs px-3 py-1 rounded-full">
              Out of stock
            </span>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} className="fill-[#C4A98A] text-[#C4A98A]" />
            ))}
          </div>
          <h3 className="text-sm font-medium text-[#3D2B1F] mb-1 line-clamp-1">{product.name}</h3>
          <p className="text-xs text-[#8C7B6B] mb-3 line-clamp-1">{product.description}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-[#5C3D2E]">${product.price.toFixed(2)}</span>
            <button
              onClick={handleAddToCart}
              disabled={loading || product.stock === 0}
              className="bg-[#EDE0D4] hover:bg-[#5C3D2E] text-[#5C3D2E] hover:text-[#FAF7F2] w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50"
            >
              <ShoppingBag size={16} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}