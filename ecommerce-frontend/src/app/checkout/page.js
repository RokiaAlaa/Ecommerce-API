'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { ordersAPI } from '@/lib/api';
import { MapPin, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, fetchCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!address.trim()) {
      toast.error('Please enter shipping address');
      return;
    }
    setLoading(true);
    try {
      const res = await ordersAPI.createOrder({ shipping_address: address });
      await fetchCart();
      toast.success('Order placed successfully!');
      router.push(`/orders/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <Navbar />
      <div className="pt-16">
        <div className="bg-[#EDE0D4] py-10 px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-medium text-[#3D2B1F]">Checkout</h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Shipping Form */}
          <div>
            <h2 className="text-lg font-medium text-[#3D2B1F] mb-6 flex items-center gap-2">
              <MapPin size={20} className="text-[#5C3D2E]" />
              Shipping Address
            </h2>

            <form onSubmit={handleOrder} className="space-y-4">
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your full shipping address..."
                rows={4}
                required
                className="w-full px-4 py-3 bg-white border border-[#E0D5C5] rounded-xl text-sm text-[#3D2B1F] placeholder-[#C4B8A8] focus:outline-none focus:border-[#5C3D2E] resize-none"
              />

              <button
                type="submit"
                disabled={loading || cart.items.length === 0}
                className="w-full bg-[#5C3D2E] text-[#FAF7F2] py-4 rounded-full text-sm font-medium hover:bg-[#3D2B1F] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                {loading ? 'Placing order...' : `Place order — $${cart.total_price.toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="text-lg font-medium text-[#3D2B1F] mb-6">Order Summary</h2>
            <div className="bg-[#EDE0D4] rounded-2xl p-6 space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 bg-[#D4C4B0] rounded-lg overflow-hidden flex-shrink-0">
                    {item.product?.image_url ? (
                      <Image src={item.product.image_url} alt={item.product.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={16} className="text-[#C4A98A]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-[#3D2B1F] line-clamp-1">{item.product?.name}</p>
                    <p className="text-xs text-[#8C7B6B]">x{item.quantity}</p>
                  </div>
                  <p className="text-xs font-medium text-[#5C3D2E]">
                    ${(item.product?.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}

              <div className="border-t border-[#D4C4B0] pt-4 flex justify-between">
                <span className="font-medium text-[#3D2B1F]">Total</span>
                <span className="font-medium text-[#5C3D2E]">${cart.total_price.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}