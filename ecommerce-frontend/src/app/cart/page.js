'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { cart, loading, removeFromCart, updateQuantity, fetchCart, clearCart } = useCart();

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(itemId);
      toast.success('Item removed');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const handleUpdateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    try {
      await updateQuantity(itemId, quantity);
    } catch {
      toast.error('Failed to update quantity');
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast.success('Cart cleared');
    } catch {
      toast.error('Failed to clear cart');
    }
  };

  if (cart.items.length === 0) {
    return (
      <main className="min-h-screen bg-[#FAF7F2]">
        <Navbar />
        <div className="pt-16 flex flex-col items-center justify-center min-h-[70vh] px-6">
          <ShoppingBag size={64} className="text-[#D4C4B0] mb-6" />
          <h2 className="text-2xl font-medium text-[#3D2B1F] mb-2">Your cart is empty</h2>
          <p className="text-[#8C7B6B] text-sm mb-8">Add some products to get started</p>
          <Link href="/products"
            className="bg-[#5C3D2E] text-[#FAF7F2] px-8 py-3 rounded-full text-sm hover:bg-[#3D2B1F] transition-colors">
            Browse products
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <Navbar />
      <div className="pt-16">
        <div className="bg-[#EDE0D4] py-10 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-medium text-[#3D2B1F]">Your Cart</h1>
              <p className="text-sm text-[#8C7B6B] mt-1">{cart.total_items} items</p>
            </div>
            <button
              onClick={handleClearCart}
              className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-400 rounded-full text-sm hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} /> Clear cart
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">

          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-[#E0D5C5] p-4 flex gap-4">
                <div className="relative w-24 h-24 bg-[#EDE0D4] rounded-xl overflow-hidden flex-shrink-0">
                  {item.product?.image_url ? (
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag size={24} className="text-[#C4A98A]" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-sm font-medium text-[#3D2B1F] mb-1">{item.product?.name}</h3>
                  <p className="text-sm text-[#5C3D2E] font-medium mb-3">
                    ${item.product?.price.toFixed(2)}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-[#E0D5C5] rounded-full overflow-hidden">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1 text-[#5C3D2E] hover:bg-[#EDE0D4] transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-3 py-1 text-sm text-[#3D2B1F]">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 text-[#5C3D2E] hover:bg-[#EDE0D4] transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-[#8C7B6B] hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-[#3D2B1F]">
                    ${(item.product?.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-[#EDE0D4] rounded-2xl p-6 sticky top-24">
              <h2 className="text-lg font-medium text-[#3D2B1F] mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8C7B6B]">Subtotal ({cart.total_items} items)</span>
                  <span className="text-[#3D2B1F]">${cart.total_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8C7B6B]">Shipping</span>
                  <span className="text-green-600 text-xs">Free</span>
                </div>
                <div className="border-t border-[#D4C4B0] pt-3 flex justify-between">
                  <span className="font-medium text-[#3D2B1F]">Total</span>
                  <span className="font-medium text-[#5C3D2E] text-lg">${cart.total_price.toFixed(2)}</span>
                </div>
              </div>

              <Link href="/checkout"
                className="w-full bg-[#5C3D2E] text-[#FAF7F2] py-3 rounded-full text-sm font-medium hover:bg-[#3D2B1F] transition-colors flex items-center justify-center gap-2">
                Checkout <ArrowRight size={16} />
              </Link>

              <Link href="/products"
                className="w-full mt-3 border border-[#5C3D2E] text-[#5C3D2E] py-3 rounded-full text-sm text-center block hover:bg-[#5C3D2E] hover:text-[#FAF7F2] transition-colors">
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}