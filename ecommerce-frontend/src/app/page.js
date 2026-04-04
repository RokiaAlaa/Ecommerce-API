'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { productsAPI, categoriesAPI } from '@/lib/api';
import { ArrowRight, Truck, Shield, RefreshCw } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodsRes, catsRes] = await Promise.all([
          productsAPI.getAll(),
          categoriesAPI.getAll(),
        ]);
        const data = prodsRes.data.results ?? prodsRes.data;
        setProducts(data.slice(0, 8));
        setCategories(catsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categoryImages = {
    electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80',
    fashion: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80',
    'home-living': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
    beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80',
    books: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&q=80',
    sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80',
  };

  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <Navbar />

      <section className="pt-16 grid grid-cols-1 md:grid-cols-2 min-h-[90vh]">
        <div className="bg-[#EDE0D4] flex flex-col justify-center px-10 md:px-16 py-20">
          <p className="text-xs text-[#8C7B6B] tracking-[4px] uppercase mb-4">New Collection 2025</p>
          <h1 className="text-5xl md:text-6xl font-medium text-[#3D2B1F] leading-tight mb-6">
            Discover<br />Timeless<br />Elegance
          </h1>
          <p className="text-[#7A6655] text-base leading-relaxed mb-8 max-w-md">
            Curated pieces that blend modern design with classic craftsmanship. Shop the finest collection.
          </p>
          <div className="flex gap-4">
            <Link href="/products"
              className="bg-[#5C3D2E] text-[#FAF7F2] px-8 py-3 rounded-full text-sm hover:bg-[#3D2B1F] transition-colors flex items-center gap-2">
              Shop now <ArrowRight size={16} />
            </Link>
            <Link href="/products"
              className="border border-[#5C3D2E] text-[#5C3D2E] px-8 py-3 rounded-full text-sm hover:bg-[#5C3D2E] hover:text-[#FAF7F2] transition-colors">
              Explore
            </Link>
          </div>
        </div>
        <div className="relative bg-[#D4C4B0] min-h-[400px]">
          <Image
            src="/logo.png"
            alt="Hero"
            fill
            className="object-contain p-8"
            priority
          />
          <div className="absolute inset-0 bg-[#D4C4B0]/20" />
          <div className="absolute bottom-8 left-8 bg-[#FAF7F2] rounded-xl p-4 shadow-sm">
            <p className="text-xs text-[#8C7B6B]">Free shipping</p>
            <p className="text-sm font-medium text-[#3D2B1F]">Orders over $50</p>
          </div>
          <div className="absolute top-8 right-8 bg-[#FAF7F2] rounded-xl p-4 shadow-sm">
            <p className="text-xs text-[#8C7B6B]">New arrivals</p>
            <p className="text-sm font-medium text-[#3D2B1F]">24 items</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: <Truck size={24} />, title: 'Free Shipping', desc: 'On all orders over $50' },
          { icon: <Shield size={24} />, title: 'Secure Payment', desc: '100% secure transactions' },
          { icon: <RefreshCw size={24} />, title: 'Easy Returns', desc: '30-day return policy' },
        ].map((f, i) => (
          <div key={i} className="flex items-center gap-4 p-6 bg-[#EDE0D4] rounded-2xl">
            <div className="text-[#5C3D2E]">{f.icon}</div>
            <div>
              <p className="text-sm font-medium text-[#3D2B1F]">{f.title}</p>
              <p className="text-xs text-[#8C7B6B]">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-medium text-[#3D2B1F] mb-2">Shop by category</h2>
        <p className="text-sm text-[#8C7B6B] mb-8">Find exactly what you're looking for</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/products?category_id=${cat.id}`}
              className="group relative h-32 rounded-2xl overflow-hidden">
              <Image
                src={categoryImages[cat.slug] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=80'}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-[#3D2B1F]/40 group-hover:bg-[#3D2B1F]/50 transition-colors" />
              <p className="absolute bottom-3 left-3 text-xs font-medium text-[#FAF7F2]">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#F5F0E8] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-medium text-[#3D2B1F] mb-2">Featured products</h2>
              <p className="text-sm text-[#8C7B6B]">Handpicked just for you</p>
            </div>
            <Link href="/products" className="text-sm text-[#8C6B52] underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-72 bg-[#EDE0D4] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-[#5C3D2E] rounded-3xl p-10 md:p-16 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-3xl font-medium text-[#FAF7F2] mb-2">Special offer — 20% off</h2>
            <p className="text-[#D4C4B0] text-sm">Use code LUMIERE20 at checkout. Limited time only.</p>
          </div>
          <Link href="/products"
            className="bg-[#FAF7F2] text-[#5C3D2E] px-8 py-3 rounded-full text-sm font-medium hover:bg-[#EDE0D4] transition-colors whitespace-nowrap">
            Shop the sale
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}