'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { format } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';
import { Printer, Package, Clock, CheckCircle, XCircle } from 'lucide-react';

// Define the Order interface
interface Order {
  _id: string;
  orderNumber: string;
  customer: { name: string; roomNumber: string; phone: string };
  items: any[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  orderedAt: string;
}

// This page now correctly assumes it will be wrapped by the main layout.
export default function ManagerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/orders');
      setOrders(res.data);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: Order['status']) => {
    try {
      await api.put(`/api/orders/${id}/status`, { status });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
      toast.success(`Order updated to ${status}`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Update failed');
    }
  };

  const printReceipt = (order: Order) => {
    // This function remains unchanged
    const w = window.open('', '_blank');
    if (!w) return;
    const items = order.items.map(i => `<tr><td class="py-2">${i.name} x${i.quantity}</td><td class="text-right">ETB ${(i.price * i.quantity).toFixed(2)}</td></tr>`).join('');
    w.document.write(`
      <html><head><title>Receipt - ${order.orderNumber}</title>
      <style>body{font-family:Segoe UI,sans-serif;padding:30px}.header{text-align:center;margin-bottom:30px}
      .logo{width:80px;height:80px;margin:auto 10px;background:#f59e0b;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold}
      table{width:100%;border-collapse:collapse;margin:20px 0}th,td{padding:10px;border-bottom:1px solid #eee}th{background:#f9f9f9}
      .total{font-weight:bold;font-size:1.3em;margin-top:20px}.footer{text-align:center;margin-top:40px;color:#666;font-size:0.9em}</style>
      </head><body>
      <div class="header"><div class="logo">M</div><h2>Order Receipt</h2>
      <p><strong>Order:</strong> ${order.orderNumber}</p>
      <p><strong>Customer:</strong> ${order.customer.name} (Room ${order.customer.roomNumber})</p>
      <p><strong>Date:</strong> ${format(new Date(order.orderedAt), 'PPp')}</p></div>
      <table><thead><tr><th>Item</th><th class="text-right">Price</th></tr></thead><tbody>${items}</tbody></table>
      <div class="total text-right">Total: ETB ${order.totalAmount.toFixed(2)}</div>
      <div class="footer">Thank you!</div></body></html>`);
    w.document.close(); w.focus(); setTimeout(() => w.print(), 500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    // Use a React Fragment <> because the layout provides the main structure
    <>
      <Toaster position="top-right" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">All Orders</h1>
        <div className="space-y-4">
          {orders.map(order => (
            <motion.div key={order._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
              {/* All the order details and buttons remain exactly the same */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-bold text-lg">Order {order.orderNumber}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{order.customer.name} • Room {order.customer.roomNumber}</p>
                  <p className="text-sm">{format(new Date(order.orderedAt), 'PPp')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}>{order.status}</span>
                  <button onClick={() => printReceipt(order)} className="p-2 hover:bg-gray-100 rounded-lg"><Printer size={18} /></button>
                </div>
              </div>
              <div className="mb-4">
                {order.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{i.name} x{i.quantity}</span>
                    <span>ETB {(i.price * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold mt-2">
                  <span>Total</span>
                  <span>ETB {order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {order.status === 'pending' && <button onClick={() => updateStatus(order._id, 'preparing')} className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-1"><Package size={16} /> Prepare</button>}
                {order.status === 'preparing' && <button onClick={() => updateStatus(order._id, 'ready')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"><Clock size={16} /> Ready</button>}
                {order.status === 'ready' && <button onClick={() => updateStatus(order._id, 'delivered')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1"><CheckCircle size={16} /> Delivered</button>}
                {(order.status === 'pending' || order.status === 'preparing') && <button onClick={() => updateStatus(order._id, 'cancelled')} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1"><XCircle size={16} /> Cancel</button>}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </>
  );
}