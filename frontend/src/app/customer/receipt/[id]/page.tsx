'use client';

import { Button } from 'react-native';
// src/app/customer/receipt/[id]/page.tsx
import { useState, useEffect } from 'react';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Printer, Coffee } from 'lucide-react';
import { format } from 'date-fns';
import api from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://mesertehotelinformationmanagementsystem.onrender.com';
interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  image?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  orderedAt: string;
  roomNumber?: string;
  tableNumber?: string;
}

export default function ReceiptPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (path?: string) =>
    path ? (path.startsWith('http') ? path : `${API_BASE}${path}`) : '/default-menu.jpg';

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/api/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        toast.error('Failed to load receipt');
        router.push('/customer/menu');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, router]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin"><Coffee size={48} className="text-amber-600" /></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back & Print Buttons */}
          <div className="flex justify-between items-center mb-6">
            <Link href="/customer/menu" className="flex items-center gap-2 text-amber-600 hover:text-amber-700">
              <ArrowLeft size={20} /> Back to Menu
            </Link>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-xl hover:bg-amber-700 transition shadow-lg print:hidden"
            >
              <Printer size={20} /> Print Receipt
            </button>
          </div>

          {/* Beautiful Receipt Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Hotel Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-10 text-center">
              <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Coffee size={48} />
              </div>
              <h1 className="text-4xl font-bold">Meseret Hotel</h1>
              <p className="text-xl mt-2">Thank you for your order!</p>
            </div>

            {/* Receipt Content */}
            <div className="p-8">
              <h2 className="text-2xl font-bold text-center mb-6">Order Receipt</h2>

              <div className="text-center text-gray-600 space-y-2 mb-8">
                <p><strong>Order ID:</strong> {order.orderNumber}</p>
                <p><strong>Date & Time:</strong> {format(new Date(order.orderedAt), 'PPPp')}</p>
                <p><strong>Delivered to:</strong> Room {order.roomNumber || 'N/A'} {order.tableNumber && `• Table ${order.tableNumber}`}</p>
              </div>

              {/* Items Table */}
              <div className="border-t-2 border-b-2 border-amber-200 py-4 mb-6">
                <div className="grid grid-cols-12 gap-4 font-semibold text-gray-700 mb-3">
                  <div className="col-span-6">Item</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-4 text-right">Price</div>
                </div>

                {order.items.map((item) => (
                  <div key={item._id} className="grid grid-cols-12 gap-4 items-center py-4 border-b border-gray-100">
                    <div className="col-span-6 flex items-center gap-3">
                      {item.image ? (
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-14 h-14 object-cover rounded-lg shadow"
                          onError={(e) => (e.currentTarget.src = '/default-menu.jpg')}
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Coffee size={28} className="text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.notes && <p className="text-xs text-gray-500">Note: {item.notes}</p>}
                      </div>
                    </div>
                    <div className="col-span-2 text-center font-medium">×{item.quantity}</div>
                    <div className="col-span-4 text-right font-bold text-amber-600">
                      ETB {(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="text-right">
                <p className="text-3xl font-bold text-amber-600">
                  Total: ETB {order.totalAmount.toFixed(2)}
                </p>
              </div>

              {/* Footer */}
              <div className="text-center mt-10 text-gray-600">
                <p>We hope you enjoyed your meal.</p>
                <p className="mt-2">For feedback or inquiries: +251 911 234 567</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hide buttons when printing */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .bg-white.rounded-3xl, .bg-white.rounded-3xl * {
            visibility: visible;
          }
          .bg-white.rounded-3xl {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}