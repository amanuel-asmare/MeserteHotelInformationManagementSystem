'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Coffee, Plus, Minus, ShoppingCart, X, History, Loader2, CreditCard, Hotel, Utensils, Receipt, Calendar, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { useAuth } from '../../../../context/AuthContext';
import Link from 'next/link';
import { format, startOfDay, startOfWeek, startOfMonth, isAfter, isBefore } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';

let io: any;
if (typeof window !== 'undefined') {
  io = require('socket.io-client');
}

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

interface CartItem {
  menuItem: string;
  name: string;
  price: number;
  quantity: number;
  notes: string;
  image: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: any[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  orderedAt: string;
  roomNumber?: string;
  tableNumber?: string;
}

type FilterType = 'active' | 'today' | 'week' | 'month' | 'all';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function CustomerMenuPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('active');
  const [orderType, setOrderType] = useState<'room' | 'table'>('room');
  const [tableNumber, setTableNumber] = useState<string>('');

  const socketRef = useRef<any>(null);

  // Socket.IO
  useEffect(() => {
    if (typeof window === 'undefined' || !user?._id) return;
    const socket = io(API_BASE, { withCredentials: true });
    socketRef.current = socket;
    socket.on('connect', () => console.log('Socket connected'));
    socket.on('orderUpdate', (updatedOrder: Order) => {
      setAllOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
      toast.success(`Order ${updatedOrder.orderNumber} is now ${updatedOrder.status.toUpperCase()}!`, {
        style: { background: '#10b981', color: 'white' },
      });
    });
    return () => socket.disconnect();
  }, [user?._id]);

  // Handle payment success
  useEffect(() => {
    const paid = searchParams.get('paid');
    if (paid === '1') {
      toast.success('Payment successful! Your order is being prepared.', { duration: 6000 });
      setCart([]);
      setTableNumber('');
      fetchOrderHistory();
    } else if (paid === '0') {
      toast.error('Payment failed. Please try again.');
    }
    if (paid) {
      const url = new URL(window.location.href);
      url.searchParams.delete('paid');
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [searchParams, router]);

  // Load data
  useEffect(() => {
    fetchMenu();
    loadCart();
    if (!authLoading && user) fetchOrderHistory();
  }, [authLoading, user]);

  useEffect(() => {
    localStorage.setItem('customerCart', JSON.stringify(cart));
  }, [cart]);

  const fetchMenu = async () => {
    try {
      const r = await api.get('/api/menu');
      setMenu(r.data);
    } catch {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const loadCart = () => {
    const saved = localStorage.getItem('customerCart');
    if (saved) setCart(JSON.parse(saved));
  };

  const fetchOrderHistory = async () => {
    try {
      const r = await api.get('/api/orders/my');
      setAllOrders(r.data);
      applyFilter(r.data, 'active');
    } catch {
      toast.error('Failed to load your orders');
    }
  };

  const getImageUrl = (path: string) =>
    path?.startsWith('http') ? path : `${API_BASE}${path}` || '/default-menu.jpg';

 const applyFilter = (orders: Order[], filter: FilterType) => {
  const now = new Date();
  let filtered: Order[] = [];

  if (filter === 'active') {
    filtered = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  } 
  else if (filter === 'today') {
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    filtered = orders.filter(o => {
      const orderDate = new Date(o.orderedAt);
      return orderDate >= todayStart && o.status === 'delivered';
    });
  } 
  else if (filter === 'week') {
    // Week starts on Monday (ISO week)
    const day = now.getDay(); // 0 = Sunday, 1 = Monday...
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    filtered = orders.filter(o => {
      const orderDate = new Date(o.orderedAt);
      return orderDate >= monday && o.status === 'delivered';
    });
  } 
  else if (filter === 'month') {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    filtered = orders.filter(o => {
      const orderDate = new Date(o.orderedAt);
      return orderDate >= monthStart && o.status === 'delivered';
    });
  } 
  else if (filter === 'all') {
    filtered = orders.filter(o => o.status === 'delivered');
  }

  // Sort newest first
  filtered.sort((a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime());

  setFilteredOrders(filtered);
  setActiveFilter(filter);
};
  // Cart functions (same as before)
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItem === item._id);
      if (existing) {
        return prev.map(i => i.menuItem === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        menuItem: item._id,
        name: item.name,
        price: item.price,
        quantity: 1,
        notes: '',
        image: getImageUrl(item.image)
      }];
    });
    toast.success(`${item.name} added!`, { icon: 'Success' });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev =>
      prev.map(i => i.menuItem === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
        .filter(i => i.quantity > 0)
    );
  };

  const updateNotes = (id: string, notes: string) => {
    setCart(prev => prev.map(i => i.menuItem === id ? { ...i, notes } : i));
  };

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2);

  const placeOrder = async () => {
    // ... (same as before - unchanged)
    if (!user) { toast.error('Please log in first'); router.push('/login'); return; }
    if (cart.length === 0) { toast.error('Your cart is empty'); return; }
    const location = orderType === 'room' ? user.roomNumber : tableNumber.trim();
    if (!location) {
      toast.error(orderType === 'room' ? 'Please set your room number' : 'Please enter table number');
      return;
    }
    setPlacingOrder(true);
    try {
      let phone = user.phone?.trim() || '0912345678';
      if (!phone.startsWith('+') && !phone.startsWith('0')) phone = '0' + phone.replace(/\D/g, '').slice(-9);
      if (phone.startsWith('0')) phone = '+251' + phone.slice(1);
      if (!/^\+2519\d{8}$/.test(phone)) phone = '+251912345678';

      const payload = {
        items: cart.map(i => ({ menuItem: i.menuItem, quantity: i.quantity, notes: i.notes })),
        totalAmount: parseFloat(totalPrice),
        customerName: `${user.firstName} ${user.lastName}`.trim() || 'Customer',
        email: user.email || 'customer@meserethotel.com',
        phone,
        ...(orderType === 'room' ? { roomNumber: location } : { tableNumber: location })
      };

      const res = await api.post('/api/orders/chapa', payload);
      if (res.data.checkout_url) {
        localStorage.setItem('pendingOrderCart', JSON.stringify(cart));
        localStorage.setItem('pendingOrderType', orderType);
        if (orderType === 'table') localStorage.setItem('pendingTableNumber', tableNumber);
        window.location.href = res.data.checkout_url;
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Payment failed.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const openReceipt = (orderId: string) => {
    router.push(`/customer/receipt/${orderId}`);
  };

  const isOrderButtonDisabled = placingOrder ||
    (orderType === 'room' && !user?.roomNumber) ||
    (orderType === 'table' && !tableNumber.trim());

  // MINIMUM LOADING TIME FOR MAXIMUM WOW EFFECT
  const MIN_LOADING_TIME = 3500; // 3.5 seconds of pure luxury
  const [minTimePassed, setMinTimePassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, MIN_LOADING_TIME);

    return () => clearTimeout(timer);
  }, []);

  if (loading || authLoading || !minTimePassed) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-amber-900 via-orange-800 to-amber-950 flex items-center justify-center overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/20 via-transparent to-yellow-600/20 animate-pulse"></div>
          <div className="absolute top-20 left-20 w-96 h-96 bg-yellow-500 rounded-full filter blur-3xl animate-ping"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-orange-600 rounded-full filter blur-3xl animate-ping delay-1000"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative z-10 text-center"
        >
          {/* Golden Hotel Logo Circle */}
          <motion.div
            animate={{
              scale: [1, 1.12, 1],
              rotate: [0, 12, -12, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative mx-auto w-52 h-52 mb-12"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-amber-600 rounded-full shadow-2xl"></div>
            <div className="absolute inset-3 bg-gradient-to-tr from-amber-950 to-orange-900 rounded-full flex items-center justify-center">
              <div className="text-white font-extrabold text-7xl tracking-widest drop-shadow-2xl">
                MH
              </div>
            </div>

            {/* Premium Rotating Rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-6 border-4 border-yellow-400/40 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-10 border-2 border-yellow-500/30 rounded-full"
            />
          </motion.div>

          {/* Hotel Name - Slower & More Elegant */}
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 1.4 }}
            className="text-7xl md:text-8xl font-black text-white tracking-widest text-center"
            style={{
              textShadow: "0 0 60px rgba(251, 191, 36, 0.9), 0 0 100px rgba(251, 146, 60, 0.7)",
              fontFamily: "'Playfair Display', serif",
              letterSpacing: "0.15em",
            }}
          >
            MESERET
          </motion.h1>
          <motion.h2
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 1.4 }}
            className="text-5xl md:text-6xl font-bold text-amber-300 text-center mt-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            HOTEL
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1.5 }}
            className="text-2xl text-amber-100 mt-6 font-light tracking-wider"
          >
            Where Luxury Meets Ethiopian Hospitality
          </motion.p>

          {/* Enhanced Loading Bar */}
          <div className="mt-16 w-80 mx-auto">
            <div className="h-2 bg-amber-900/40 rounded-full overflow-hidden border border-amber-600/30">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 shadow-2xl shadow-amber-500/60"
              />
            </div>
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="text-amber-200 text-center mt-6 text-xl font-medium"
            >
              Crafting your perfect dining experience...
            </motion.div>
          </div>

          {/* Floating Luxury Icons */}
          <motion.div className="absolute top-1/3 -left-10 text-yellow-200/60" animate={{ y: [-20, 20, -20] }} transition={{ duration: 6, repeat: Infinity }}>
            <Coffee size={70} />
          </motion.div>
          <motion.div className="absolute top-1/2 -right-16 text-orange-200/60" animate={{ y: [20, -20, 20] }} transition={{ duration: 7, repeat: Infinity, delay: 1 }}>
            <Utensils size={65} />
          </motion.div>
        </motion.div>
      </div>
    );
  }
  return (
    <>
      <Toaster position="top-right" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order Food & Drinks</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Delivered to:{' '}
              {orderType === 'room' && <span className="font-semibold text-amber-600">Room {user?.roomNumber || 'Not set'}</span>}
              {orderType === 'table' && <span className="font-semibold text-amber-600">Table {tableNumber || 'Not set'}</span>}
              {(orderType === 'room' && !user?.roomNumber) && (
                <Link href="/customer/settings/roomSet" className="ml-2 text-amber-600 underline text-sm">Set Room</Link>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowHistory(true)} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition">
              <History size={22} />
            </button>
            <button onClick={() => setShowCart(true)} className="relative p-4 bg-amber-600 text-white rounded-xl hover:bg-amber-700 shadow-lg transition">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </motion.span>
              )}
            </button>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menu.map(item => (
            <motion.div
              key={item._id}
              whileHover={{ y: -8, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer"
              onClick={() => addToCart(item)}
            >
              <div className="h-48 relative overflow-hidden">
                {item.image && item.image !== '/uploads/menu/default-menu.png' ? (
                  <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" onError={e => (e.currentTarget.src = '/default-menu.jpg')} />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-amber-100 to-orange-100">
                    <Coffee className="w-16 h-16 text-amber-600" />
                  </div>
                )}
                <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-medium rounded-full shadow-sm ${
                  item.category === 'drinks' ? 'bg-green-100 text-green-800' :
                  item.category === 'breakfast' ? 'bg-yellow-100 text-yellow-800' :
                  item.category === 'lunch' ? 'bg-blue-100 text-blue-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {item.category}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">{item.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-2xl font-bold text-amber-600">ETB {item.price}</span>
                  <div className="p-2 bg-amber-600 text-white rounded-lg"><Plus size={20} /></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CART DRAWER — NOW WITH IMAGES! */}
      <AnimatePresence>
        {showCart && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} />
            <motion.div className="relative w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Order</h2>
                <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={24} /></button>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Your cart is empty</p>
                ) : (
                  <div className="space-y-6">
                    {/* Order Type */}
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-between">
                      <label className="flex items-center gap-2 font-medium">
                        <input type="radio" checked={orderType === 'room'} onChange={() => setOrderType('room')} className="form-radio text-amber-600" />
                        <Hotel size={18} /> Room Service
                      </label>
                      <label className="flex items-center gap-2 font-medium">
                        <input type="radio" checked={orderType === 'table'} onChange={() => setOrderType('table')} className="form-radio text-amber-600" />
                        <Utensils size={18} /> Table Service
                      </label>
                    </div>

                    {/* Table Number */}
                    {orderType === 'table' && (
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <label className="block text-sm font-medium mb-1">Table Number</label>
                        <input
                          type="text"
                          value={tableNumber}
                          onChange={e => setTableNumber(e.target.value)}
                          placeholder="e.g., A12, 5"
                          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    )}

                    {/* CART ITEMS WITH IMAGES */}
                    {cart.map(item => (
                      <motion.div key={item.menuItem} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 shadow-md">
                        <div className="flex gap-4 items-start">
                          {/* Item Image */}
                          <div className="flex-shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl shadow" />
                            ) : (
                              <div className="w-20 h-20 bg-gray-200 rounded-xl flex items-center justify-center">
                                <Coffee size={32} className="text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Item Details */}
                          <div className="flex-1">
                            <h4 className="font-bold text-lg">{item.name}</h4>
                            <p className="text-sm text-amber-600">ETB {item.price} each</p>
                            <input
                              type="text"
                              placeholder="Notes (e.g., less spicy)"
                              value={item.notes}
                              onChange={e => updateNotes(item.menuItem, e.target.value)}
                              className="mt-2 w-full px-3 py-1 text-sm border rounded-lg"
                            />
                          </div>

                          {/* Quantity */}
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQuantity(item.menuItem, -1)} className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300"><Minus size={16} /></button>
                            <span className="w-10 text-center font-bold text-lg">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.menuItem, 1)} className="p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"><Plus size={16} /></button>
                          </div>
                        </div>
                        <p className="text-right mt-3 text-xl font-bold text-amber-600">
                          ETB {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t bg-gray-50 dark:bg-gray-800">
                  <div className="flex justify-between text-2xl font-bold mb-6">
                    <span>Total</span>
                    <span className="text-amber-600">ETB {totalPrice}</span>
                  </div>
                  <button
                    onClick={placeOrder}
                    disabled={isOrderButtonDisabled}
                    className="w-full py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl"
                  >
                    {placingOrder ? (
                      <>Processing...</>
                    ) : (
                      <>Pay with Chapa • ETB {totalPrice}</>
                    )}
                  </button>
                  {(orderType === 'room' && !user?.roomNumber) && (
                    <p className="text-center mt-4 text-sm text-red-600">
                      <Link href="/customer/settings/roomSet" className="underline">Set room number to pay</Link>
                    </p>
                  )}
                  {(orderType === 'table' && !tableNumber.trim()) && (
                    <p className="text-center mt-4 text-sm text-red-600">Enter table number to pay</p>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ORDER HISTORY & RECEIPT BUTTON */}
      {/* ORDER HISTORY MODAL - NOW WITH IMAGES */}
<AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden"
            >
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <History size={32} className="text-amber-600" />
                  Order History
                </h2>
                <button onClick={() => setShowHistory(false)} className="p-3 hover:bg-gray-100 rounded-xl transition">
                  <X size={28} />
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex overflow-x-auto bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b">
                {[
                  { id: 'active', label: 'Active Orders', icon: Clock },
                  { id: 'today', label: 'Today', icon: Calendar },
                  { id: 'week', label: 'This Week', icon: Calendar },
                  { id: 'month', label: 'This Month', icon: Calendar },
                  { id: 'all', label: 'All Time', icon: Calendar },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => applyFilter(allOrders, tab.id as FilterType)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition whitespace-nowrap ${
                      activeFilter === tab.id
                        ? 'bg-amber-600 text-white shadow-lg'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Orders List */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-16">
                    <Coffee size={64} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">
                      {activeFilter === 'active' ? 'No active orders' : 'No orders found'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order, index) => (
                      <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-start gap-4">
                            {order.items[0]?.image ? (
                              <img
                                src={getImageUrl(order.items[0].image)}
                                alt={order.items[0].name}
                                className="w-20 h-20 object-cover rounded-xl shadow-lg"
                              />
                            ) : (
                              <div className="w-20 h-20 bg-gray-200 rounded-xl flex items-center justify-center">
                                <Coffee size={36} className="text-gray-400" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-bold text-xl">Order {order.orderNumber}</h3>
                              <p className="text-sm text-gray-600">{format(new Date(order.orderedAt), 'PPPp')}</p>
                              <p className="text-sm mt-1 font-medium">
                                {order.roomNumber ? `Room ${order.roomNumber}` : order.tableNumber ? `Table ${order.tableNumber}` : 'N/A'}
                                {' • '}ETB {order.totalAmount} • {order.items.length} items
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                            <button
                              onClick={() => openReceipt(order._id)}
                              className="mt-4 w-full px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-medium shadow-lg transition flex items-center justify-center gap-2"
                            >
                              <Receipt size={20} />
                              View Receipt
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}/*// src/app/customer/menu/page.tsx (Frontend - Corrected and Simplified)
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Coffee, Plus, Minus, ShoppingCart, X, Printer, History, Loader2, CreditCard, Hotel, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { useAuth } from '../../../../context/AuthContext';
import Link from 'next/link';
import { format } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

// Initialize socket.io client only on the client-side
let io: any;
if (typeof window !== 'undefined') {
  io = require('socket.io-client');
}

// --- Interface Definitions ---
interface MenuItem { _id: string; name: string; description: string; price: number; category: string; image: string; }
interface CartItem { menuItem: string; name: string; price: number; quantity: number; notes: string; }
interface Order {
  _id: string; orderNumber: string; items: any[]; totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  orderedAt: string; deliveredAt?: string;
  customer: { roomNumber?: string; tableNumber?: string; };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

export default function CustomerMenuPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  // Page-specific state. The layout state (sidebarOpen, darkMode) has been removed.
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [orderType, setOrderType] = useState<'room' | 'table'>('room');
  const [tableNumber, setTableNumber] = useState<string>('');
  const socketRef = useRef<any>(null);

  // All useEffect hooks and functions for data fetching and logic remain unchanged.
  // ... (Socket.IO, Payment Handling, Data Fetching, etc.) ...
    // Socket
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const socket = io(API_BASE, { withCredentials: true });
    socketRef.current = socket;
    socket.on('connect', () => console.log('WS connected'));
    socket.on('orderUpdate', (upd: Order) => {
      setOrderHistory(prev => prev.map(o => o._id === upd._id ? upd : o));
      toast.success(`Order ${upd.orderNumber} → ${upd.status.toUpperCase()}!`, {
        style: { background: '#10b981', color: 'white' }
      });
    });
    return () => socket.disconnect();
  }, []);
  // Paid success toast and clear search params
  useEffect(() => {
    const paid = searchParams.get('paid');
    if (paid === '1') {
      toast.success('Payment successful! Your order is being prepared.', { duration: 6000 });
      setCart([]); // Clear cart on successful payment
      setTableNumber(''); // Clear table number on successful payment
      fetchOrderHistory(); // Refresh order history
    } else if (paid === '0') {
      toast.error('Payment failed. Please try again.');
    }
    // Remove 'paid' parameter from URL
    if (paid) {
      const url = new URL(window.location.href);
      url.searchParams.delete('paid');
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [searchParams, router]);
  // Load data
  useEffect(() => {
    fetchMenu();
    loadCart();
    if (!authLoading && user) {
      fetchOrderHistory();
    }
  }, [authLoading, user]);
  useEffect(() => { localStorage.setItem('customerCart', JSON.stringify(cart)); }, [cart]);
  
  const fetchMenu = async () => {
    try { const r = await api.get('/api/menu'); setMenu(r.data); }
    catch { toast.error('Failed to load menu'); }
    finally { setLoading(false); }
  };
  const loadCart = () => { const s = localStorage.getItem('customerCart'); if (s) setCart(JSON.parse(s)); };
  const fetchOrderHistory = async () => {
    try { const r = await api.get('/api/orders/my'); setOrderHistory(r.data); }
    catch (e: any) { toast.error(e.response?.data?.message || 'Failed to load orders'); }
  };
  const getImageUrl = (p: string) => p?.startsWith('http') ? p : `${API_BASE}${p}` || '/default-menu.jpg';
  // Cart
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const ex = prev.find(i => i.menuItem === item._id);
      if (ex) return prev.map(i => i.menuItem === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { menuItem: item._id, name: item.name, price: item.price, quantity: 1, notes: '' }];
    });
    toast.success(`${item.name} added!`);
  };
  const updateQuantity = (id: string, d: number) => setCart(prev => prev.map(i => i.menuItem === id ? { ...i, quantity: Math.max(0, i.quantity + d) } : i).filter(i => i.quantity > 0));
  const updateNotes = (id: string, n: string) => setCart(prev => prev.map(i => i.menuItem === id ? { ...i, notes: n } : i));
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2);
  // Chapa payment
 const placeOrder = async () => {
  if (!user) {
    toast.error("Please log in first");
    router.push('/login');
    return;
  }
  if (cart.length === 0) {
    toast.error("Cart is empty");
    return;
  }

  const location = orderType === 'room'
    ? user.roomNumber
    : tableNumber.trim();

  if (!location) {
    toast.error(orderType === 'room'
      ? "Please set your room number in Settings"
      : "Please enter table number"
    );
    return;
  }

  setPlacingOrder(true);

  try {
    // CLEAN & VALIDATE PHONE — THIS IS CRITICAL FOR CHAPA
    let cleanPhone = user.phone?.trim() || '';
    if (!cleanPhone) {
      cleanPhone = '0912345678'; // Fallback test number (valid ET format)
    }
    // Ensure it starts with 0 or +251
    if (!cleanPhone.startsWith('+') && !cleanPhone.startsWith('0')) {
      cleanPhone = '0' + cleanPhone.replace(/[^\d]/g, '').slice(-9);
    }
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '+251' + cleanPhone.slice(1);
    }
    if (!/^(\+251|0)9\d{8}$/.test(cleanPhone.replace('+251', '0'))) {
      cleanPhone = '+251912345678'; // Final fallback
    }

    const payload = {
      items: cart.map(i => ({
        menuItem: i.menuItem,
        quantity: i.quantity,
        notes: i.notes
      })),
      totalAmount: parseFloat(totalPrice),
      customerName: `${user.firstName} ${user.lastName}`.trim() || "Customer",
      email: user.email || "customer@meserethotel.com", // Fallback email
      phone: cleanPhone, // ← NOW ALWAYS VALID
      ...(orderType === 'room' ? { roomNumber: location } : { tableNumber: location })
      
    };

    console.log("Sending to /api/orders/chapa:", payload); // Debug
    

    const res = await api.post('/api/orders/chapa', payload);

    if (res.data.checkout_url) {
      localStorage.setItem('pendingOrderCart', JSON.stringify(cart));
      localStorage.setItem('pendingOrderType', orderType);
      if (orderType === 'table') localStorage.setItem('pendingTableNumber', tableNumber);

      window.location.href = res.data.checkout_url;
    } else {
      throw new Error("No checkout URL from Chapa");
    }
  } catch (e: any) {
    console.error("Chapa Order Failed:", e.response?.data || e);
    toast.error(
      e.response?.data?.message ||
      "Payment failed. Please check your details or try again later."
    );
  } finally {
    setPlacingOrder(false);
  }
};
  // Receipt// src/app/customer/menu/page.tsx → Replace printReceipt
const printReceipt = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = order.items.map(item => `
        <tr>
            <td class="py-3 border-b">${item.name || 'Unknown Item'} × ${item.quantity || 1}</td>
            <td class="py-3 border-b text-right">ETB ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
        </tr>
    `).join('');

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt - ${order.orderNumber}</title>
            <meta charset="utf-8">
            <style>
                body { font-family: 'Segoe UI', sans-serif; padding: 40px; background: #f9f9f9; margin: 0; }
                .receipt { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { width: 80px; height: 80px; background: #f59e0b; color: white; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold; margin-bottom: 16px; }
                h1 { color: #1f2937; margin: 0 0 8px 0; font-size: 24px; }
                .info { color: #4b5563; margin: 8px 0; font-size: 14px; }
                table { width: 100%; margin: 20px 0; border-collapse: collapse; }
                th { text-align: left; padding: 12px 0; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
               	td { padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
                .total { font-size: 24px; font-weight: bold; text-align: right; margin-top: 20px; color: #f59e0b; }
                .footer { text-align: center; margin-top: 40px; color: #6b7280; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="header">
                    <div class="logo">MH</div>
                    <h1>Meseret Hotel</h1>
                    <div class="info"><strong>Order:</strong> ${order.orderNumber}</div>
                    <div class="info"><strong>Customer:</strong> ${order.customer.name}</div>
                    <div class="info">
                        <strong>Delivered to:</strong> 
                        ${order.customer.roomNumber ? `Room ${order.customer.roomNumber}` : `Table ${order.customer.tableNumber || 'N/A'}`}
                    </div>
                    <div class="info"><strong>Date:</strong> ${format(new Date(order.orderedAt), 'PPP p')}</div>
                </div>
                <table>
                    <thead><tr><th>Item</th><th class="text-right">Price</th></tr></thead>
                    <tbody>${itemsHtml}</tbody>
                </table>
                <div class="total">Total: ETB ${order.totalAmount.toFixed(2)}</div>
                <div class="footer">Thank you for choosing Meseret Hotel!</div>
            </div>
        </body>
        </html>
    `);

    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
};

  return (
    <>
      <Toaster position="top-right" />
      
      {/* Page content is now the top-level element /}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order Food & Drinks</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Delivered to:
              {orderType === 'room' && (
                  <span className="font-semibold text-amber-600 ml-1">Room {user?.roomNumber || 'Not set'}</span>
              )}
              {orderType === 'table' && (
                  <span className="font-semibold text-amber-600 ml-1">Table {tableNumber || 'Not set'}</span>
              )}
              {(orderType === 'room' && !user?.roomNumber) && <Link href="/customer/settings/roomSet" className="ml-2 text-amber-600 underline text-sm">Set Room</Link>}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowHistory(true)} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600"><History size={22} /></button>
            <button onClick={() => setShowCart(true)} className="relative p-4 bg-amber-600 text-white rounded-xl hover:bg-amber-700 shadow-lg">
              <ShoppingCart size={24} />
              {totalItems > 0 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{totalItems}</motion.span>}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menu.map(item => (
            <motion.div key={item._id} whileHover={{ y: -8, scale: 1.03 }} whileTap={{ scale: 0.98 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer"
              onClick={() => addToCart(item)}>
              <div className="h-48 relative overflow-hidden">
                {item.image && item.image !== '/uploads/menu/default-menu.png' ? (
                  <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" onError={e => (e.currentTarget.src = '/default-menu.jpg')} />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-amber-100 to-orange-100"><Coffee className="w-16 h-16 text-amber-600" /></div>
                )}
                <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-medium rounded-full shadow-sm ${
                  item.category === 'drinks' ? 'bg-green-100 text-green-800' :
                  item.category === 'breakfast' ? 'bg-yellow-100 text-yellow-800' :
                  item.category === 'lunch' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                }`}>{item.category}</span>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">{item.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-2xl font-bold text-amber-600">ETB {item.price}</span>
                  <div className="p-2 bg-amber-600 text-white rounded-lg"><Plus size={20} /></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CART DRAWER /}
      <AnimatePresence>
        {showCart && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} />
            <motion.div className="relative w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b flex items-center justify-between"><h2 className="text-2xl font-bold">Your Order</h2>
                <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={24} /></button>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                {cart.length === 0 ? <p className="text-center text-gray-500 py-8">Your cart is empty</p> : (
                  <div className="space-y-4">
                    <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-between">
                        <label className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                            <input type="radio" value="room" checked={orderType === 'room'} onChange={() => setOrderType('room')} className="form-radio text-amber-600" />
                            <Hotel size={18} /> Room Service
                        </label>
                        <label className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                            <input type="radio" value="table" checked={orderType === 'table'} onChange={() => setOrderType('table')} className="form-radio text-amber-600" />
                            <Utensils size={18} /> Table Service
                        </label>
                    </div>
                    {orderType === 'table' && (
                        <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Table Number</label>
                            <input
                                type="text"
                                id="tableNumber"
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                                placeholder="e.g., A12, 5"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enter your table number for restaurant orders.</p>
                        </div>
                    )}
                    {cart.map(item => (
                      <motion.div key={item.menuItem} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{item.name}</h4>
                            <p className="text-sm text-amber-600">ETB {item.price} each</p>
                            <input type="text" placeholder="Notes (e.g., less spicy)" value={item.notes}
                              onChange={e => updateNotes(item.menuItem, e.target.value)}
                              className="mt-2 w-full px-3 py-1 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button onClick={() => updateQuantity(item.menuItem, -1)} className="p-1 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500"><Minus size={16} /></button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.menuItem, 1)} className="p-1 bg-amber-600 text-white rounded-lg hover:bg-amber-700"><Plus size={16} /></button>
                          </div>
                        </div>
                        <p className="text-right mt-2 font-semibold">ETB {(item.price * item.quantity).toFixed(2)}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              {cart.length > 0 && (
                <div className="p-6 border-t">
                  <div className="flex justify-between text-xl font-bold mb-4"><span>Total</span><span className="text-amber-600">ETB {totalPrice}</span></div>
                  <button onClick={placeOrder} disabled={isOrderButtonDisabled}
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
                    {placingOrder ? <><Loader2 className="animate-spin" size={20} /> Processing...</> :
                      <><CreditCard size={20} /> Pay with Chapa • ETB {totalPrice}</>}
                  </button>
                  {(orderType === 'room' && !user?.roomNumber) && <p className="text-center mt-3 text-sm text-red-600"><Link href="/customer/settings/roomSet" className="underline">Set room number to pay</Link></p>}
                  {(orderType === 'table' && !tableNumber.trim()) && <p className="text-center mt-3 text-sm text-red-600">Enter a table number to pay</p>}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ORDER HISTORY /}
      <AnimatePresence>
        {showHistory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center"><h2 className="text-2xl font-bold">Order History</h2>
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={24} /></button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {orderHistory.length === 0 ? <p className="text-center text-gray-500">No orders yet</p> : (
                  <div className="space-y-4">
                    {orderHistory.map(order => (
                      <motion.div key={order._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="border rounded-xl p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-lg">Order {order.orderNumber}</p>
                            <p className="text-sm text-gray-600">{format(new Date(order.orderedAt), 'PPp')}</p>
                            <p className="text-sm mt-1">
                              {order.customer?.roomNumber ? `Room: ${order.customer.roomNumber}` :
                               order.customer?.tableNumber ? `Table: ${order.customer.tableNumber}` : ''}
                              • ETB {order.totalAmount}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                            }`}>{order.status}</span>
                            <button onClick={() => printReceipt(order)} className="mt-2 text-amber-600 hover:underline text-sm flex items-center gap-1"><Printer size={16} /> Print</button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
*/