'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, User, Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { cart } = useCart();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
    setIsAdmin(localStorage.getItem('is_admin') === 'true');
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${searchQuery}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#FAF7F2] shadow-sm' : 'bg-[#FAF7F2]'
    } border-b border-[#D4C9B8]`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        <Link href="/" className="text-xl font-medium text-[#5C3D2E] tracking-widest">
          LUMIÈRE
        </Link>

        {searchOpen ? (
          <form onSubmit={handleSearch} className="flex-1 mx-8 flex items-center gap-2">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C7B6B]" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 bg-[#EDE0D4] border border-[#D4C9B8] rounded-full text-sm text-[#3D2B1F] placeholder-[#8C7B6B] focus:outline-none focus:border-[#5C3D2E]"
              />
            </div>
            <button
              type="button"
              onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
              className="text-[#8C7B6B] hover:text-[#5C3D2E] transition-colors"
            >
              <X size={20} />
            </button>
          </form>
        ) : (
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm text-[#8C7B6B] hover:text-[#5C3D2E] transition-colors">Home</Link>
            <Link href="/products" className="text-sm text-[#8C7B6B] hover:text-[#5C3D2E] transition-colors">Products</Link>
            {isAdmin && (
              <Link href="/admin" className="text-sm text-[#5C3D2E] font-medium hover:text-[#3D2B1F] transition-colors">
                Admin
              </Link>
            )}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-[#8C7B6B] hover:text-[#5C3D2E] transition-colors"
          >
            <Search size={20} />
          </button>

          <Link href={isLoggedIn ? '/profile' : '/login'}
            className="text-[#8C7B6B] hover:text-[#5C3D2E] transition-colors">
            <User size={20} />
          </Link>

          <Link href="/cart" className="relative text-[#8C7B6B] hover:text-[#5C3D2E] transition-colors">
            <ShoppingBag size={20} />
            {cart.total_items > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#5C3D2E] text-[#FAF7F2] text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cart.total_items}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}