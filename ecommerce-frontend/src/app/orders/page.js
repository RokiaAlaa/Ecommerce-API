'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ordersAPI } from '@/lib/api';
import { Package, ArrowRight, ChevronRight } from 'lucide-react';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    ordersAPI.getOrders()
      .then((res) => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <Navbar />
      <div className="pt-16">
        <div className="bg-[#EDE0D4] py-10 px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-medium text-[#3D2B1F]">My Orders</h1>
            <p className="text-sm text-[#8C7B6B] mt-1">{orders.length} orders</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-[#EDE0D4] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20">
              <Package size={64} className="text-[#D4C4B0] mx-auto mb-6" />
              <h2 className="text-xl font-medium text-[#3D2B1F] mb-2">No orders yet</h2>
              <p className="text-[#8C7B6B] text-sm mb-8">Start shopping to see your orders here</p>
              <Link href="/products"
                className="bg-[#5C3D2E] text-[#FAF7F2] px-8 py-3 rounded-full text-sm hover:bg-[#3D2B1F] transition-colors inline-flex items-center gap-2">
                Shop now <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link key={order.id} href={`/orders/${order.id}`}
                  className="bg-white border border-[#E0D5C5] rounded-2xl p-6 flex items-center justify-between hover:border-[#C4A98A] transition-colors group block">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#EDE0D4] rounded-xl flex items-center justify-center">
                      <Package size={20} className="text-[#5C3D2E]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#3D2B1F]">Order #{order.id}</p>
                      <p className="text-xs text-[#8C7B6B] mt-1">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                    <p className="text-sm font-medium text-[#5C3D2E]">${order.total_amount.toFixed(2)}</p>
                    <ChevronRight size={16} className="text-[#8C7B6B] group-hover:text-[#5C3D2E] transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}