'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { productsAPI } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, ArrowLeft, Star, Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    setLoading(true);
    productsAPI.getOne(id).then((res) => {
      setProduct(res.data);
      setLoading(false);
      productsAPI.getAll({ category_id: res.data.category_id })
        .then((r) => {
          const data = r.data.results ?? r.data;
          setRelated(data.filter((p) => p.id !== res.data.id).slice(0, 4));
        });
    }).catch(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to add items to cart');
      return;
    }
    try {
      await addToCart(product.id, quantity);
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <Navbar />
      <div className="pt-16 max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="h-96 bg-[#EDE0D4] rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-[#EDE0D4] rounded-xl animate-pulse w-3/4" />
            <div className="h-4 bg-[#EDE0D4] rounded-xl animate-pulse w-1/2" />
            <div className="h-24 bg-[#EDE0D4] rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );

  if (!product) return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <Navbar />
      <div className="pt-16 text-center py-20">
        <p className="text-[#8C7B6B]">Product not found</p>
        <Link href="/products" className="text-[#5C3D2E] underline mt-4 block">Back to products</Link>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">

          <Link href="/products" className="flex items-center gap-2 text-sm text-[#8C7B6B] hover:text-[#5C3D2E] mb-8 transition-colors">
            <ArrowLeft size={16} />
            Back to products
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="relative h-96 md:h-[500px] bg-[#EDE0D4] rounded-3xl overflow-hidden">
              {product.image_url ? (
                <Image src={product.image_url} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag size={60} className="text-[#C4A98A]" />
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-[#C4A98A] text-[#C4A98A]" />
                ))}
                <span className="text-xs text-[#8C7B6B] ml-2">(4.8)</span>
              </div>

              {product.category && (
                <span className="text-xs text-[#8C7B6B] uppercase tracking-wider mb-2">
                  {product.category.name}
                </span>
              )}

              <h1 className="text-3xl font-medium text-[#3D2B1F] mb-3">{product.name}</h1>
              <p className="text-3xl font-medium text-[#5C3D2E] mb-6">${product.price.toFixed(2)}</p>
              <p className="text-[#7A6655] text-sm leading-relaxed mb-8">{product.description}</p>

              <div className="flex items-center gap-2 mb-6">
                <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-400'}`} />
                <span className="text-sm text-[#8C7B6B]">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <span className="text-sm text-[#8C7B6B]">Quantity</span>
                <div className="flex items-center border border-[#E0D5C5] rounded-full overflow-hidden">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-[#5C3D2E] hover:bg-[#EDE0D4] transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-[#3D2B1F]">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 text-[#5C3D2E] hover:bg-[#EDE0D4] transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="bg-[#5C3D2E] text-[#FAF7F2] py-4 rounded-full text-sm font-medium hover:bg-[#3D2B1F] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                Add to cart
              </button>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="bg-[#F5F0E8] py-16 mt-8">
            <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-2xl font-medium text-[#3D2B1F] mb-2">You may also like</h2>
              <p className="text-sm text-[#8C7B6B] mb-8">From the same category</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
      <Footer />
    </main>
  );
}