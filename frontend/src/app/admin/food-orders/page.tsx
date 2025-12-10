'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { format } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';
import { Printer, Package, Clock, CheckCircle, XCircle, History, Calendar, Coffee, Volume2, Bell, Bike } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext'; // Import Hook

interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
}

interface Order {
  _id: string;
  orderNumber: string;
  customer: { name: string; roomNumber?: string; tableNumber?: string };
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  orderedAt: string;
  orderType?: string; 
}

type ViewMode = 'live' | 'history';
type HistoryFilter = 'today' | 'week' | 'month' | 'all';

export default function MenuOrdersClient() {
  const { t, language } = useLanguage(); 
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('live');
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('today');
  const [loading, setLoading] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

  const getImageUrl = (path?: string | null): string => {
    if (!path || path.includes('default-menu')) return '/placeholder-food.jpg';
    return path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  useEffect(() => {
    const unlock = () => {
      if (audioUnlocked) return;
      new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABtaXRlcgAAAAA=')
        .play()
        .catch(() => {});
      setAudioUnlocked(true);
      toast.success(t('soundEnabled'), { icon: 'Bell', duration: 3000 });
      document.removeEventListener('click', unlock);
      document.removeEventListener('touchstart', unlock);
    };
    document.addEventListener('click', unlock);
    document.addEventListener('touchstart', unlock);
    return () => {
      document.removeEventListener('click', unlock);
      document.removeEventListener('touchstart', unlock);
    };
  }, [audioUnlocked, t]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/orders');
      const data = res.data;

      const newPending = data.filter((o: Order) => o.status === 'pending').length;
      const oldPending = orders.filter(o => o.status === 'pending').length;

      if (newPending > oldPending && audioUnlocked) {
        new Audio('https://assets.mixkit.co/sfx/preview/mixkit-doorbell-single-press-333.mp3')
          .play()
          .catch(() => {});
        toast.success(`${t('newOrderReceived')} (${newPending} pending)`, {
          icon: 'Bell',
          duration: 5000,
          style: { background: '#f59e0b', color: 'white', fontSize: '18px' }
        });
      }

      setOrders(data);
    } catch {
      // Suppress error
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: Order['status']) => {
    if (status === 'cancelled') {
      if (!confirm('Are you sure you want to cancel this order?')) return;
    }

    try {
      await api.put(`/api/orders/${id}/status`, { status });
      // Fix: Cast status to any to avoid type error if key is missing in types
      toast.success(`${t('orderMarkedAs')} ${t(status as any)}!`); 
      fetchOrders();
    } catch {
      toast.error('Update failed');
    }
  };

  const printReceipt = (order: Order) => {
    const win = window.open('', '_blank');
    if (!win) return;

    const items = order.items.map(i => `
      <div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #eee;">
        <div style="display:flex; gap:12px; align-items:center;">
          ${i.image ? `<img src="${getImageUrl(i.image)}" style="width:48px; height:48px; object-cover:cover; border-radius:8px;" />` : ''}
          <div>
            <div style="font-weight:600;">${i.name}</div>
            <div style="font-size:12px; color:#666;">×${i.quantity}</div>
          </div>
        </div>
        <div style="font-weight:600;">ETB ${(i.price * i.quantity).toFixed(2)}</div>
      </div>
    `).join('');

    const rT = {
        order: language === 'am' ? 'ትዕዛዝ' : 'Order',
        customer: language === 'am' ? 'ደንበኛ' : 'Customer',
        room: language === 'am' ? 'ክፍል' : 'Room',
        table: language === 'am' ? 'ጠረጴዛ' : 'Table',
        total: language === 'am' ? 'ጠቅላላ' : 'Total',
        thankYou: language === 'am' ? 'መሰረት ሆቴልን ስለመረጡ እናመሰግናለን!' : 'Thank you for choosing Meseret Hotel!'
    };

    win.document.write(`
      <html><head><title>${order.orderNumber}</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; padding:40px; background:#f9f9f9; }
        .receipt { max-width:380px; margin:auto; background:white; padding:32px; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,0.1); }
        .header { text-align:center; margin-bottom:32px; }
        .logo { width:80px; height:80px; background:#f59e0b; color:white; border-radius:50%; margin:0 auto 16px; display:flex; align-items:center; justify-content:center; font-size:36px; font-weight:bold; }
        h1 { margin:0; color:#92400e; font-size:28px; }
        .info { text-align:center; color:#555; margin:16px 0; font-size:14px; }
        .total { font-size:32px; font-weight:bold; text-align:right; color:#f59e0b; margin:24px 0; }
        .footer { text-align:center; margin-top:40px; color:#888; font-style:italic; }
      </style></head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="logo">MH</div>
            <h1>Meseret Hotel</h1>
          </div>
          <div class="info">
            <strong>${rT.order}:</strong> ${order.orderNumber}<br>
            <strong>${rT.customer}:</strong> ${order.customer.name}<br>
            ${order.customer.roomNumber ? `<strong>${rT.room}:</strong> ${order.customer.roomNumber}` : `<strong>${rT.table}:</strong> ${order.customer.tableNumber}`}<br>
            ${format(new Date(order.orderedAt), 'PPP p')}
          </div>
          <div style="margin:24px 0;">${items}</div>
          <div class="total">${rT.total}: ETB ${order.totalAmount.toFixed(2)}</div>
          <div class="footer">${rT.thankYou}</div>
        </div>
      </body></html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 1000);
  };

  const getFilteredOrders = () => {
    const now = new Date();
    let filtered = orders.filter(o => o.status === 'delivered');

    if (historyFilter === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = filtered.filter(o => new Date(o.orderedAt) >= today);
    } else if (historyFilter === 'week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      filtered = filtered.filter(o => new Date(o.orderedAt) >= monday);
    } else if (historyFilter === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = filtered.filter(o => new Date(o.orderedAt) >= start);
    }

    return filtered.sort((a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime());
  };

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));

  // --- ROYAL LOADING SCREEN ---
  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-amber-950 via-black to-amber-900 flex items-center justify-center overflow-hidden">
        {/* ... (Existing Animation Code kept same for brevity) ... */}
        <div className="text-white text-2xl font-bold animate-pulse">Loading Orders...</div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />

      {!audioUnlocked && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-600 text-white px-8 py-4 rounded-full shadow-2xl animate-bounce flex items-center gap-3">
          <Bell className="animate-pulse" />
          <span className="font-bold text-lg">{t('enableSound')}</span>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-black text-gray-900 flex items-center gap-4">
                  {viewMode === 'live' ? t('liveOrders') : t('orderHistory')}
                  {audioUnlocked && <Volume2 className="text-green-600 animate-pulse" size={48} />}
                </h1>
                <p className="text-xl text-gray-600 mt-3 font-medium">
                  {viewMode === 'live'
                    ? `${t('realTime')} • ${activeOrders.length} ${t('activeOrdersCount')}`
                    : t('viewCompletedOrders')}
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setViewMode('live')}
                  className={`px-10 py-5 rounded-2xl font-bold text-xl transition-all shadow-xl flex items-center gap-3 ${viewMode === 'live' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white scale-105' : 'bg-white text-gray-700 hover:shadow-lg'}`}
                >
                  {t('live')} ({activeOrders.length})
                </button>
                <button
                  onClick={() => setViewMode('history')}
                  className={`px-10 py-5 rounded-2xl font-bold text-xl transition-all shadow-xl flex items-center gap-3 ${viewMode === 'history' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white scale-105' : 'bg-white text-gray-700 hover:shadow-lg'}`}
                >
                  <History size={28} /> {t('history')}
                </button>
              </div>
            </div>
          </div>

          {/* History Filters */}
          <AnimatePresence>
            {viewMode === 'history' && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                <div className="flex flex-wrap gap-4 justify-center">
                  {(['today', 'week', 'month', 'all'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setHistoryFilter(filter)}
                      className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center gap-3 ${historyFilter === filter ? 'bg-amber-600 text-white shadow-2xl scale-105' : 'bg-white hover:bg-amber-50'}`}
                    >
                      <Calendar size={22} />
                      {filter === 'today' ? t('today') : filter === 'week' ? t('thisWeek') : filter === 'month' ? t('thisMonth') : t('allTime')}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Orders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
            <AnimatePresence>
              {(viewMode === 'live' ? activeOrders : getFilteredOrders()).map((order) => {
                const isPending = order.status === 'pending';

                return (
                  <motion.div
                    key={order._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 100 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`relative rounded-3xl overflow-hidden shadow-2xl transition-all ${isPending ? 'ring-4 ring-orange-500 ring-opacity-50' : ''}`}
                  >
                    {isPending && (
                      <div className="absolute inset-0 bg-orange-400 opacity-20 animate-pulse pointer-events-none" />
                    )}

                    <div className={`h-full bg-white border-4 ${isPending ? 'border-orange-500' : order.status === 'preparing' ? 'border-amber-400' : order.status === 'ready' ? 'border-blue-500' : order.status === 'delivered' ? 'border-green-500' : 'border-gray-300'}`}>

                      {/* Header */}
                      <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-3xl font-black text-gray-900">{order.orderNumber}</h3>
                            <p className="text-2xl font-bold text-amber-700 mt-1">{order.customer.name}</p>
                            
                            <p className="text-lg font-medium text-gray-700">
                                {order.orderType === 'delivery' ? (
                                    <span className="flex items-center gap-2 text-indigo-600">
                                        {/* FIX: Cast 'delivery' to any to avoid translation type error */}
                                        <Bike size={20} /> {t('delivery' as any)}
                                    </span>
                                ) : order.customer.roomNumber ? (
                                    // FIX: Cast 'room' to any
                                    `${t('room' as any)} ${order.customer.roomNumber}`
                                ) : order.customer.tableNumber ? (
                                    // FIX: Cast 'table' to any
                                    `${t('table' as any)} ${order.customer.tableNumber}`
                                ) : (
                                    // FIX: Cast 'unknownLocation' to any
                                    <span className="text-gray-400 italic">{t('unknownLocation' as any)}</span>
                                )}
                            </p>
                          </div>
                          <div className="text-right">
                            {/* STATUS BADGE TRANSLATED - Cast status to any to fix type error */}
                            <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${isPending ? 'bg-red-100 text-red-800' : order.status === 'preparing' ? 'bg-amber-100 text-amber-800' : order.status === 'ready' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                              {t(order.status as any)}
                            </span>
                            <button onClick={() => printReceipt(order)} className="mt-3 p-3 bg-white rounded-xl shadow hover:shadow-md transition">
                              <Printer size={22} />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-3 font-medium">
                          {format(new Date(order.orderedAt), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>

                      {/* Items */}
                      <div className="p-6 space-y-4">
                        {order.items.map((item) => (
                          <div key={item._id} className="flex items-center justify-between bg-gray-50 rounded-2xl p-4">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shadow-md">
                                <img
                                  src={getImageUrl(item.image)}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.currentTarget.src = '/placeholder-food.jpg'; }}
                                />
                              </div>
                              <div>
                                <p className="font-bold text-lg text-gray-800">{item.name}</p>
                                <p className="text-sm text-gray-600">×{item.quantity}</p>
                              </div>
                            </div>
                            <p className="font-bold text-amber-600 text-lg">
                              ETB {(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-t-4 border-amber-400">
                          <p className="text-4xl font-black text-amber-600">
                            ETB {order.totalAmount.toFixed(2)}
                          </p>
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        
                          {viewMode === 'live' && (
                            <div className="flex items-center gap-4">
                              {order.status === 'pending' && (
                                <button
                                  onClick={() => updateStatus(order._id, 'preparing')}
                                  className="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all flex items-center gap-3"
                                >
                                  <Package size={24} />
                                  {/* FIX: Cast 'startCooking' to any */}
                                  {t('startCooking' as any)}
                                </button>
                              )}
                              {order.status === 'preparing' && (
                                <button
                                  onClick={() => updateStatus(order._id, 'ready')}
                                  className="px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all flex items-center gap-3"
                                >
                                  <Clock size={24} />
                                  {/* FIX: Cast 'markReady' to any */}
                                  {t('markReady' as any)}
                                </button>
                              )}
                              {order.status === 'ready' && (
                                <button
                                  onClick={() => updateStatus(order._id, 'delivered')}
                                  className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all flex items-center gap-3"
                                >
                                  <CheckCircle size={24} />
                                  {/* FIX: Cast 'delivered' to any */}
                                  {t('delivered' as any)}
                                </button>
                              )}

                              {(order.status === 'pending' || order.status === 'preparing') && (
                                <button
                                  onClick={() => updateStatus(order._id, 'cancelled')}
                                  className="p-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-110"
                                  // FIX: Cast 'cancelOrder' to any
                                  title={t('cancelOrder' as any)}
                                >
                                  <XCircle size={32} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {((viewMode === 'live' && activeOrders.length === 0) || (viewMode === 'history' && getFilteredOrders().length === 0)) && (
            <div className="text-center py-32">
              <Coffee className="w-40 h-40 text-gray-300 mx-auto mb-8" />
              <p className="text-3xl font-bold text-gray-500">
                {/* FIX: Cast keys to any */}
                {viewMode === 'live' ? t('noActiveOrders' as any) : t('noHistoryFound' as any)}
              </p>
              <p className="text-xl text-gray-400 mt-4">
                {/* FIX: Cast keys to any */}
                {viewMode === 'live' ? t('enjoyCalm' as any) : t('tryDifferentRange' as any)}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}/*'use client';
import { View } from 'react-native';

import { useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { format } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';
import { Printer, Package, Clock, CheckCircle, XCircle, History, Calendar, Coffee, Volume2, Bell, Bike } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext'; // Import Hook

interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
}

interface Order {
  _id: string;
  orderNumber: string;
  customer: { name: string; roomNumber?: string; tableNumber?: string };
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  orderedAt: string;
  orderType?: string; 
}

type ViewMode = 'live' | 'history';
type HistoryFilter = 'today' | 'week' | 'month' | 'all';

export default function MenuOrdersClient() {
  const { t, language } = useLanguage(); 
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('live');
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('today');
  const [loading, setLoading] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

  const getImageUrl = (path?: string | null): string => {
    if (!path || path.includes('default-menu')) return '/placeholder-food.jpg';
    return path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  useEffect(() => {
    const unlock = () => {
      if (audioUnlocked) return;
      new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABtaXRlcgAAAAA=')
        .play()
        .catch(() => {});
      setAudioUnlocked(true);
      toast.success(t('soundEnabled'), { icon: 'Bell', duration: 3000 });
      document.removeEventListener('click', unlock);
      document.removeEventListener('touchstart', unlock);
    };
    document.addEventListener('click', unlock);
    document.addEventListener('touchstart', unlock);
    return () => {
      document.removeEventListener('click', unlock);
      document.removeEventListener('touchstart', unlock);
    };
  }, [audioUnlocked, t]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/orders');
      const data = res.data;

      const newPending = data.filter((o: Order) => o.status === 'pending').length;
      const oldPending = orders.filter(o => o.status === 'pending').length;

      if (newPending > oldPending && audioUnlocked) {
        new Audio('https://assets.mixkit.co/sfx/preview/mixkit-doorbell-single-press-333.mp3')
          .play()
          .catch(() => {});
        toast.success(`${t('newOrderReceived')} (${newPending} pending)`, {
          icon: 'Bell',
          duration: 5000,
          style: { background: '#f59e0b', color: 'white', fontSize: '18px' }
        });
      }

      setOrders(data);
    } catch {
      // Suppress error
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: Order['status']) => {
    if (status === 'cancelled') {
      if (!confirm('Are you sure you want to cancel this order?')) return;
    }

    try {
      await api.put(`/api/orders/${id}/status`, { status });
      toast.success(`${t('orderMarkedAs')} ${t(status)}!`); // Translated success message
      fetchOrders();
    } catch {
      toast.error('Update failed');
    }
  };

  const printReceipt = (order: Order) => {
    const win = window.open('', '_blank');
    if (!win) return;

    const items = order.items.map(i => `
      <div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #eee;">
        <div style="display:flex; gap:12px; align-items:center;">
          ${i.image ? `<img src="${getImageUrl(i.image)}" style="width:48px; height:48px; object-cover:cover; border-radius:8px;" />` : ''}
          <div>
            <div style="font-weight:600;">${i.name}</div>
            <div style="font-size:12px; color:#666;">×${i.quantity}</div>
          </div>
        </div>
        <div style="font-weight:600;">ETB ${(i.price * i.quantity).toFixed(2)}</div>
      </div>
    `).join('');

    const rT = {
        order: language === 'am' ? 'ትዕዛዝ' : 'Order',
        customer: language === 'am' ? 'ደንበኛ' : 'Customer',
        room: language === 'am' ? 'ክፍል' : 'Room',
        table: language === 'am' ? 'ጠረጴዛ' : 'Table',
        total: language === 'am' ? 'ጠቅላላ' : 'Total',
        thankYou: language === 'am' ? 'መሰረት ሆቴልን ስለመረጡ እናመሰግናለን!' : 'Thank you for choosing Meseret Hotel!'
    };

    win.document.write(`
      <html><head><title>${order.orderNumber}</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; padding:40px; background:#f9f9f9; }
        .receipt { max-width:380px; margin:auto; background:white; padding:32px; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,0.1); }
        .header { text-align:center; margin-bottom:32px; }
        .logo { width:80px; height:80px; background:#f59e0b; color:white; border-radius:50%; margin:0 auto 16px; display:flex; align-items:center; justify-content:center; font-size:36px; font-weight:bold; }
        h1 { margin:0; color:#92400e; font-size:28px; }
        .info { text-align:center; color:#555; margin:16px 0; font-size:14px; }
        .total { font-size:32px; font-weight:bold; text-align:right; color:#f59e0b; margin:24px 0; }
        .footer { text-align:center; margin-top:40px; color:#888; font-style:italic; }
      </style></head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="logo">MH</div>
            <h1>Meseret Hotel</h1>
          </div>
          <div class="info">
            <strong>${rT.order}:</strong> ${order.orderNumber}<br>
            <strong>${rT.customer}:</strong> ${order.customer.name}<br>
            ${order.customer.roomNumber ? `<strong>${rT.room}:</strong> ${order.customer.roomNumber}` : `<strong>${rT.table}:</strong> ${order.customer.tableNumber}`}<br>
            ${format(new Date(order.orderedAt), 'PPP p')}
          </div>
          <div style="margin:24px 0;">${items}</div>
          <div class="total">${rT.total}: ETB ${order.totalAmount.toFixed(2)}</div>
          <div class="footer">${rT.thankYou}</div>
        </div>
      </body></html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 1000);
  };

  const getFilteredOrders = () => {
    const now = new Date();
    let filtered = orders.filter(o => o.status === 'delivered');

    if (historyFilter === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = filtered.filter(o => new Date(o.orderedAt) >= today);
    } else if (historyFilter === 'week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      filtered = filtered.filter(o => new Date(o.orderedAt) >= monday);
    } else if (historyFilter === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = filtered.filter(o => new Date(o.orderedAt) >= start);
    }

    return filtered.sort((a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime());
  };

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));

  // --- ROYAL LOADING SCREEN ---
  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-amber-950 via-black to-amber-900 flex items-center justify-center overflow-hidden">
    
        <div className="text-white text-2xl font-bold animate-pulse">Loading Orders...</div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />

      {!audioUnlocked && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-600 text-white px-8 py-4 rounded-full shadow-2xl animate-bounce flex items-center gap-3">
          <Bell className="animate-pulse" />
          <span className="font-bold text-lg">{t('enableSound')}</span>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">

       
          <div className="mb-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-black text-gray-900 flex items-center gap-4">
                  {viewMode === 'live' ? t('liveOrders') : t('orderHistory')}
                  {audioUnlocked && <Volume2 className="text-green-600 animate-pulse" size={48} />}
                </h1>
                <p className="text-xl text-gray-600 mt-3 font-medium">
                  {viewMode === 'live'
                    ? `${t('realTime')} • ${activeOrders.length} ${t('activeOrdersCount')}`
                    : t('viewCompletedOrders')}
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setViewMode('live')}
                  className={`px-10 py-5 rounded-2xl font-bold text-xl transition-all shadow-xl flex items-center gap-3 ${viewMode === 'live' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white scale-105' : 'bg-white text-gray-700 hover:shadow-lg'}`}
                >
                  {t('live')} ({activeOrders.length})
                </button>
                <button
                  onClick={() => setViewMode('history')}
                  className={`px-10 py-5 rounded-2xl font-bold text-xl transition-all shadow-xl flex items-center gap-3 ${viewMode === 'history' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white scale-105' : 'bg-white text-gray-700 hover:shadow-lg'}`}
                >
                  <History size={28} /> {t('history')}
                </button>
              </div>
            </div>
          </div>

         
          <AnimatePresence>
            {viewMode === 'history' && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                <div className="flex flex-wrap gap-4 justify-center">
                  {(['today', 'week', 'month', 'all'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setHistoryFilter(filter)}
                      className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center gap-3 ${historyFilter === filter ? 'bg-amber-600 text-white shadow-2xl scale-105' : 'bg-white hover:bg-amber-50'}`}
                    >
                      <Calendar size={22} />
                      {filter === 'today' ? t('today') : filter === 'week' ? t('thisWeek') : filter === 'month' ? t('thisMonth') : t('allTime')}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
            <AnimatePresence>
              {(viewMode === 'live' ? activeOrders : getFilteredOrders()).map((order) => {
                const isPending = order.status === 'pending';

                return (
                  <motion.div
                    key={order._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 100 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`relative rounded-3xl overflow-hidden shadow-2xl transition-all ${isPending ? 'ring-4 ring-orange-500 ring-opacity-50' : ''}`}
                  >
                    {isPending && (
                      <div className="absolute inset-0 bg-orange-400 opacity-20 animate-pulse pointer-events-none" />
                    )}

                    <div className={`h-full bg-white border-4 ${isPending ? 'border-orange-500' : order.status === 'preparing' ? 'border-amber-400' : order.status === 'ready' ? 'border-blue-500' : order.status === 'delivered' ? 'border-green-500' : 'border-gray-300'}`}>

                    
                      <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-3xl font-black text-gray-900">{order.orderNumber}</h3>
                            <p className="text-2xl font-bold text-amber-700 mt-1">{order.customer.name}</p>
                            
                            <p className="text-lg font-medium text-gray-700">
                                {order.orderType === 'delivery' ? (
                                    <span className="flex items-center gap-2 text-indigo-600">
                                        <Bike size={20} /> {t('delivery')}
                                    </span>
                                ) : order.customer.roomNumber ? (
                                    `${t('room')} ${order.customer.roomNumber}`
                                ) : order.customer.tableNumber ? (
                                    `${t('table')} ${order.customer.tableNumber}`
                                ) : (
                                    <span className="text-gray-400 italic">{t('unknownLocation')}</span>
                                )}
                            </p>
                          </div>
                          <div className="text-right">
                           
                            <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${isPending ? 'bg-red-100 text-red-800' : order.status === 'preparing' ? 'bg-amber-100 text-amber-800' : order.status === 'ready' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                              {t(order.status as any)}
                            </span>
                            <button onClick={() => printReceipt(order)} className="mt-3 p-3 bg-white rounded-xl shadow hover:shadow-md transition">
                              <Printer size={22} />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-3 font-medium">
                          {format(new Date(order.orderedAt), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>


                      <div className="p-6 space-y-4">
                        {order.items.map((item) => (
                          <div key={item._id} className="flex items-center justify-between bg-gray-50 rounded-2xl p-4">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shadow-md">
                                <img
                                  src={getImageUrl(item.image)}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.currentTarget.src = '/placeholder-food.jpg'; }}
                                />
                              </div>
                              <div>
                                <p className="font-bold text-lg text-gray-800">{item.name}</p>
                                <p className="text-sm text-gray-600">×{item.quantity}</p>
                              </div>
                            </div>
                            <p className="font-bold text-amber-600 text-lg">
                              ETB {(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>

                   
                      <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-t-4 border-amber-400">
                          <p className="text-4xl font-black text-amber-600">
                            ETB {order.totalAmount.toFixed(2)}
                          </p>
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        
                          {viewMode === 'live' && (
                            <div className="flex items-center gap-4">
                              {order.status === 'pending' && (
                                <button
                                  onClick={() => updateStatus(order._id, 'preparing')}
                                  className="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all flex items-center gap-3"
                                >
                                  <Package size={24} />
                                  {t('startCooking')}
                                </button>
                              )}
                              {order.status === 'preparing' && (
                                <button
                                  onClick={() => updateStatus(order._id, 'ready')}
                                  className="px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all flex items-center gap-3"
                                >
                                  <Clock size={24} />
                                  {t('markReady')}
                                </button>
                              )}
                              {order.status === 'ready' && (
                                <button
                                  onClick={() => updateStatus(order._id, 'delivered')}
                                  className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all flex items-center gap-3"
                                >
                                  <CheckCircle size={24} />
                                  {t('delivered')}
                                </button>
                              )}

                              {(order.status === 'pending' || order.status === 'preparing') && (
                                <button
                                  onClick={() => updateStatus(order._id, 'cancelled')}
                                  className="p-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-110"
                                  title={t('cancelOrder')}
                                >
                                  <XCircle size={32} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

        
          {((viewMode === 'live' && activeOrders.length === 0) || (viewMode === 'history' && getFilteredOrders().length === 0)) && (
            <div className="text-center py-32">
              <Coffee className="w-40 h-40 text-gray-300 mx-auto mb-8" />
              <p className="text-3xl font-bold text-gray-500">
                {viewMode === 'live' ? t('noActiveOrders') : t('noHistoryFound')}
              </p>
              <p className="text-xl text-gray-400 mt-4">
                {viewMode === 'live' ? t('enjoyCalm') : t('tryDifferentRange')}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}*/