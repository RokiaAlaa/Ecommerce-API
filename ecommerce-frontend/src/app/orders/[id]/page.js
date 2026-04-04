'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ordersAPI } from '@/lib/api';
import { Package, ArrowLeft, MapPin, ShoppingBag } from 'lucide-react';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.getOrder(id)
      .then((res) => setOrder(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <Navbar />
      <div className="pt-16 max-w-4xl mx-auto px-6 py-16">
        <div className="h-64 bg-[#EDE0D4] rounded-2xl animate-pulse" />
      </div>
    </main>
  );

  if (!order) return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <Navbar />
      <div className="pt-16 text-center py-20">
        <p className="text-[#8C7B6B]">Order not found</p>
        <Link href="/orders" className="text-[#5C3D2E] underline mt-4 block">Back to orders</Link>
      </div>
    </main>
  );

  const currentStep = statusSteps.indexOf(order.status);

  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Link href="/orders" className="flex items-center gap-2 text-sm text-[#8C7B6B] hover:text-[#5C3D2E] mb-8 transition-colors">
            <ArrowLeft size={16} />
            Back to orders
          </Link>

          {/* Header */}
          <div className="bg-[#EDE0D4] rounded-2xl p-6 mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-medium text-[#3D2B1F]">Order #{order.id}</h1>
              <p className="text-sm text-[#8C7B6B] mt-1">
                {new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>
            <span className={`text-xs px-4 py-2 rounded-full font-medium ${statusColors[order.status]}`}>
              {order.status}
            </span>
          </div>

          {/* Progress */}
          {order.status !== 'cancelled' && (
            <div className="bg-white border border-[#E0D5C5] rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between">
                {statusSteps.map((step, i) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        i <= currentStep ? 'bg-[#5C3D2E] text-[#FAF7F2]' : 'bg-[#EDE0D4] text-[#8C7B6B]'
                      }`}>
                        {i + 1}
                      </div>
                      <p className="text-xs text-[#8C7B6B] mt-2 capitalize">{step}</p>
                    </div>
                    {i < statusSteps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 ${i < currentStep ? 'bg-[#5C3D2E]' : 'bg-[#EDE0D4]'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="bg-white border border-[#E0D5C5] rounded-2xl p-6 mb-6">
            <h2 className="text-base font-medium text-[#3D2B1F] mb-4 flex items-center gap-2">
              <Package size={18} className="text-[#5C3D2E]" />
              Items
            </h2>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="relative w-16 h-16 bg-[#EDE0D4] rounded-xl overflow-hidden flex-shrink-0">
                    {item.product?.image_url ? (
                      <Image src={item.product.image_url} alt={item.product?.name || ''} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={20} className="text-[#C4A98A]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#3D2B1F]">{item.product?.name || `Product #${item.product_id}`}</p>
                    <p className="text-xs text-[#8C7B6B]">x{item.quantity} × ${item.price.toFixed(2)}</p>
                  </div>
                  <p className="text-sm font-medium text-[#5C3D2E]">
                    ${(item.quantity * item.price).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E0D5C5] mt-4 pt-4 flex justify-between">
              <span className="font-medium text-[#3D2B1F]">Total</span>
              <span className="font-medium text-[#5C3D2E] text-lg">${order.total_amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white border border-[#E0D5C5] rounded-2xl p-6">
            <h2 className="text-base font-medium text-[#3D2B1F] mb-3 flex items-center gap-2">
              <MapPin size={18} className="text-[#5C3D2E]" />
              Shipping Address
            </h2>
            <p className="text-sm text-[#7A6655]">{order.shipping_address}</p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}