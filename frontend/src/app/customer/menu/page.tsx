'use client';
import { Image, Modal } from 'react-native';

import { useState, useEffect, useRef } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';
import { Coffee, Plus, Minus, ShoppingCart, X, History, Loader2, Hotel, Utensils, Receipt, Calendar, Clock, Bike, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { useAuth } from '../../../../context/AuthContext';
import Link from 'next/link';
import { format } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';
import { useLanguage } from '../../../../context/LanguageContext'; // Import Hook

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
  status: string;
  orderedAt: string;
  orderType: string;
  customer: {
      name: string;
      roomNumber?: string;
      tableNumber?: string;
      deliveryAddress?: any;
  };
}

type FilterType = 'active' | 'today' | 'week' | 'month' | 'all';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function CustomerMenuPage() {
  const { t, language } = useLanguage(); // Use Hook
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  
  // Orders State
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('active');
  
  // Order Form State
  const [orderType, setOrderType] = useState<'room' | 'table' | 'delivery'>('room');
  const [tableNumber, setTableNumber] = useState<string>('');
  
  // Delivery Address State
  const [deliveryDetails, setDeliveryDetails] = useState({
    phone: '', 
    street: '',
    houseNumber: '',
    landmark: '',
    city: 'Addis Ababa'
  });

  const socketRef = useRef<any>(null);

  // Initialize delivery phone
  useEffect(() => {
    if (user?.phone) {
        setDeliveryDetails(prev => ({ ...prev, phone: user.phone || '' }));
    }
  }, [user]);

  // --- SOCKET.IO CONNECTION ---
  useEffect(() => {
    if (typeof window === 'undefined' || !user?._id) return;
    const socket = io(API_BASE, { withCredentials: true });
    socketRef.current = socket;
    socket.on('connect', () => console.log('Socket connected'));
    
    // REAL-TIME UPDATE LISTENER
    socket.on('orderUpdate', (updatedOrder: Order) => {
      // 1. Update the master list
      setAllOrders(prev => {
        // Check if it's a new order or update
        const exists = prev.find(o => o._id === updatedOrder._id);
        if (exists) {
            return prev.map(o => o._id === updatedOrder._id ? updatedOrder : o);
        } else {
            return [updatedOrder, ...prev];
        }
      });

      // 2. Notification
      if (updatedOrder.status !== 'pending') {
          // Translate status for toast
          const statusText = t(updatedOrder.status as any) || updatedOrder.status;
          toast.success(`${t('order')} ${updatedOrder.orderNumber} ${t('orderMarkedAs')} ${statusText}!`, {
            style: { background: '#10b981', color: 'white' },
            duration: 4000
          });
      }
    });

    return () => socket.disconnect();
  }, [user?._id, t]);

  // --- AUTOMATICALLY RE-FILTER WHEN ORDERS UPDATE ---
  useEffect(() => {
    applyFilter(allOrders, activeFilter);
  }, [allOrders, activeFilter]);

  // Handle payment success
  useEffect(() => {
    const paid = searchParams.get('paid');
    if (paid === '1') {
      toast.success(t('paymentSuccess'), { duration: 6000 });
      setCart([]);
      setTableNumber('');
      setDeliveryDetails({ phone: user?.phone || '', street: '', houseNumber: '', landmark: '', city: 'Addis Ababa' });
      fetchOrderHistory();
    } else if (paid === '0') {
      toast.error(t('paymentFailed'));
    }
    if (paid) {
      const url = new URL(window.location.href);
      url.searchParams.delete('paid');
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [searchParams, router, t, user]);

  // Load Initial Data
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
      toast.error(t('failedLoadMenu'));
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
      // Initial filter application
      applyFilter(r.data, 'active'); 
    } catch {
      console.error(t('failedLoadHistory'));
    }
  };

  const getImageUrl = (path: string) =>
    path?.startsWith('http') ? path : `${API_BASE}${path}` || '/default-menu.jpg';

  // --- FILTER LOGIC ---
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
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
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
        filtered = orders; 
    }

    filtered.sort((a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime());
    setFilteredOrders(filtered);
  };

  const handleFilterClick = (filter: FilterType) => {
      setActiveFilter(filter);
  };

  // --- CART FUNCTIONS ---
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
    toast.success(`${item.name} ${t('itemAdded')}`, { icon: 'Success' });
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

  // --- CALCULATE TOTAL INCLUDING DELIVERY FEE ---
  const deliveryFee = orderType === 'delivery' ? 50 : 0; 
  const itemsTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = (itemsTotal + deliveryFee).toFixed(2);

  const placeOrder = async () => {
    if (!user) { toast.error(t('pleaseLogIn')); router.push('/login'); return; }
    if (cart.length === 0) { toast.error(t('cartEmpty')); return; }
    
    if (orderType === 'room' && !user.roomNumber) {
      toast.error(t('setRoomNumber'));
      return;
    }
    if (orderType === 'table' && !tableNumber.trim()) {
      toast.error(t('enterTableNumber'));
      return;
    }
    if (orderType === 'delivery') {
        if(!deliveryDetails.phone || !deliveryDetails.street || !deliveryDetails.landmark) {
            toast.error(t('fillDeliveryDetails'));
            return;
        }
    }

    setPlacingOrder(true);
    try {
      let phoneToSend = orderType === 'delivery' 
        ? deliveryDetails.phone 
        : (user.phone || '0912345678');

      const payload = {
        items: cart.map(i => ({ menuItem: i.menuItem, quantity: i.quantity, notes: i.notes })),
        totalAmount: parseFloat(totalPrice),
        customerName: `${user.firstName} ${user.lastName}`.trim() || 'Customer',
        email: user.email || 'customer@meserethotel.com',
        phone: phoneToSend,
        orderType, 
        ...(orderType === 'room' && { roomNumber: user.roomNumber }),
        ...(orderType === 'table' && { tableNumber: tableNumber }),
        ...(orderType === 'delivery' && { deliveryAddress: deliveryDetails })
      };

      const res = await api.post('/api/orders/chapa', payload);
      if (res.data.checkout_url) {
        localStorage.setItem('pendingOrderCart', JSON.stringify(cart));
        window.location.href = res.data.checkout_url;
      }
    } catch (e: any) {
      const errorMessage = e.response?.data?.message || t('paymentSetupFailed');
      toast.error(errorMessage);
    } finally {
      setPlacingOrder(false);
    }
  };

  const openReceipt = (orderId: string) => {
    router.push(`/customer/receipt/${orderId}`);
  };

  const isOrderButtonDisabled = placingOrder ||
    (orderType === 'room' && !user?.roomNumber) ||
    (orderType === 'table' && !tableNumber.trim()) ||
    (orderType === 'delivery' && (!deliveryDetails.phone || !deliveryDetails.street || !deliveryDetails.landmark));

  // --- HELPERS FOR HISTORY UI ---
  const getStatusColor = (status: string) => {
    switch(status) {
        case 'pending': return 'bg-orange-100 text-orange-600 border-orange-200';
        case 'preparing': return 'bg-blue-100 text-blue-600 border-blue-200';
        case 'ready': return 'bg-purple-100 text-purple-600 border-purple-200';
        case 'out_for_delivery': return 'bg-indigo-100 text-indigo-600 border-indigo-200';
        case 'delivered': return 'bg-green-100 text-green-600 border-green-200';
        case 'cancelled': return 'bg-red-100 text-red-600 border-red-200';
        default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // Loading Screen
  const MIN_LOADING_TIME = 3500; 
  const [minTimePassed, setMinTimePassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => { setMinTimePassed(true); }, MIN_LOADING_TIME);
    return () => clearTimeout(timer);
  }, []);

  if (loading || authLoading || !minTimePassed) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-amber-900 via-orange-800 to-amber-950 flex items-center justify-center overflow-hidden">
        <Loader2 className="animate-spin text-white w-16 h-16" />
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-right" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('orderFoodDrinks')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('deliveredTo')} {' '}
              {orderType === 'room' && <span className="font-semibold text-amber-600">{t('room')} {user?.roomNumber || t('notSet')}</span>}
              {orderType === 'table' && <span className="font-semibold text-amber-600">{t('table')} {tableNumber || t('notSet')}</span>}
              {orderType === 'delivery' && <span className="font-semibold text-amber-600">{t('deliveryService')}</span>}
              {(orderType === 'room' && !user?.roomNumber) && (
                <Link href="/customer/settings/roomSet" className="ml-2 text-amber-600 underline text-sm">{t('setRoom')}</Link>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <button 
                onClick={() => setShowHistory(true)} 
                className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-2"
            >
              <History size={22} />
              <span className="hidden md:inline font-medium">{t('history')}</span>
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
                <img 
                    src={getImageUrl(item.image)} 
                    alt={item.name} 
                    className="w-full h-full object-cover" 
                    onError={e => (e.currentTarget.src = '/default-menu.jpg')} 
                />
                <span className="absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full bg-white/90 text-black shadow-md capitalize">
                {t( item.category)}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{item.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1 min-h-[40px]">{item.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xl font-bold text-amber-600">ETB {item.price}</span>
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition"><Plus size={20} /></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CART DRAWER */}
      <AnimatePresence>
        {showCart && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} />
            <motion.div className="relative w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl flex flex-col h-full" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b flex items-center justify-between bg-gray-50 dark:bg-gray-900">
                <h2 className="text-2xl font-bold">{t('yourOrder')}</h2>
                <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-200 rounded-full"><X size={24} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                      <ShoppingCart size={64} className="text-gray-300" />
                      <p>{t('cartEmpty')}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Order Type Selection */}
                    <div className="p-4 bg-amber-50 dark:bg-gray-700 rounded-xl flex flex-col gap-3">
                        <p className="text-sm font-bold text-amber-800 dark:text-amber-300 uppercase">{t('selectService')}</p>
                        <div className="flex items-center justify-between">
                            <label className="flex flex-col items-center gap-1 cursor-pointer">
                                <input type="radio" checked={orderType === 'room'} onChange={() => setOrderType('room')} className="hidden" />
                                <div className={`p-3 rounded-lg border-2 ${orderType === 'room' ? 'border-amber-600 bg-white text-amber-600' : 'border-transparent text-gray-500'}`}>
                                    <Hotel size={24} />
                                </div>
                                <span className="text-xs font-bold">{t('roomService')}</span>
                            </label>
                            <label className="flex flex-col items-center gap-1 cursor-pointer">
                                <input type="radio" checked={orderType === 'table'} onChange={() => setOrderType('table')} className="hidden" />
                                <div className={`p-3 rounded-lg border-2 ${orderType === 'table' ? 'border-amber-600 bg-white text-amber-600' : 'border-transparent text-gray-500'}`}>
                                    <Utensils size={24} />
                                </div>
                                <span className="text-xs font-bold">{t('tableService')}</span>
                            </label>
                            <label className="flex flex-col items-center gap-1 cursor-pointer">
                                <input type="radio" checked={orderType === 'delivery'} onChange={() => setOrderType('delivery')} className="hidden" />
                                <div className={`p-3 rounded-lg border-2 ${orderType === 'delivery' ? 'border-amber-600 bg-white text-amber-600' : 'border-transparent text-gray-500'}`}>
                                    <Bike size={24} />
                                </div>
                                <span className="text-xs font-bold">{t('deliveryService')}</span>
                            </label>
                        </div>
                    </div>

                    {/* Table Number Input */}
                    {orderType === 'table' && (
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg animate-in slide-in-from-top-2">
                        <label className="block text-sm font-bold mb-1">{t('tableNumber')}</label>
                        <input
                          type="text"
                          value={tableNumber}
                          onChange={e => setTableNumber(e.target.value)}
                          placeholder="e.g., A12"
                          className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
                        />
                      </div>
                    )}

                    {/* Delivery Address Form */}
                    {orderType === 'delivery' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                            <h4 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                                <MapPin size={16} /> {t('deliveryDetails')}
                            </h4>
                            <input
                                type="text"
                                placeholder={t('phoneNumber')}
                                value={deliveryDetails.phone}
                                onChange={e => setDeliveryDetails({...deliveryDetails, phone: e.target.value})}
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                            />
                            <input
                                type="text"
                                placeholder={t('streetArea')}
                                value={deliveryDetails.street}
                                onChange={e => setDeliveryDetails({...deliveryDetails, street: e.target.value})}
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                            />
                            <textarea
                                placeholder={t('landmarkInstructions')}
                                value={deliveryDetails.landmark}
                                onChange={e => setDeliveryDetails({...deliveryDetails, landmark: e.target.value})}
                                className="w-full px-3 py-2 border rounded-lg text-sm h-16 resize-none bg-white"
                            />
                            <div className="text-xs text-orange-600 font-bold bg-orange-100 p-2 rounded">
                                {t('deliveryFeeAdded')}
                            </div>
                        </motion.div>
                    )}

                    {/* CART ITEMS */}
                    {cart.map(item => (
                      <div key={item.menuItem} className="flex gap-4 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                          <img src={getImageUrl(item.image)} className="w-16 h-16 object-cover rounded-lg bg-gray-200" />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                                <p className="font-bold text-sm">ETB {item.price}</p>
                            </div>
                            <input
                              type="text"
                              placeholder="Notes..."
                              value={item.notes}
                              onChange={e => updateNotes(item.menuItem, e.target.value)}
                              className="mt-1 w-full text-xs border-b border-dashed border-gray-300 focus:border-amber-500 outline-none pb-1 bg-transparent"
                            />
                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-2 py-1">
                                    <button onClick={() => updateQuantity(item.menuItem, -1)} className="hover:text-red-500"><Minus size={14} /></button>
                                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.menuItem, 1)} className="hover:text-green-500"><Plus size={14} /></button>
                                </div>
                                <span className="text-sm font-bold text-amber-600">{(item.price * item.quantity).toFixed(0)}</span>
                            </div>
                          </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t bg-white dark:bg-gray-900 shadow-negative z-10">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-gray-500 text-sm">
                        <span>{t('subtotal')}</span>
                        <span>ETB {itemsTotal.toFixed(2)}</span>
                    </div>
                    {orderType === 'delivery' && (
                        <div className="flex justify-between text-gray-500 text-sm">
                            <span>{t('deliveryFee')}</span>
                            <span>ETB {deliveryFee.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-xl font-black text-gray-900 dark:text-white pt-2 border-t">
                        <span>{t('total')}</span>
                        <span>ETB {totalPrice}</span>
                    </div>
                  </div>
                  <button
                    onClick={placeOrder}
                    disabled={isOrderButtonDisabled}
                    className="w-full py-4 bg-amber-600 text-white rounded-xl font-bold text-lg hover:bg-amber-700 transition shadow-lg shadow-amber-200 disabled:opacity-50 disabled:shadow-none"
                  >
                    {placingOrder ? t('processing') : t('payWithChapa')}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ORDER HISTORY MODAL */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 z-10">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
                    <History className="text-amber-600" /> {t('orderHistory')}
                    </h2>
                    <p className="text-sm text-gray-500">{t('trackOrders')}</p>
                </div>
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                  <X size={24} />
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 p-4 bg-gray-50 dark:bg-gray-900 overflow-x-auto no-scrollbar border-b border-gray-200 dark:border-gray-700">
                {[
                  { id: 'active', label: t('activeOrders'), icon: Clock },
                  { id: 'all', label: t('allHistory'), icon: Calendar },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleFilterClick(tab.id as FilterType)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition whitespace-nowrap ${
                      activeFilter === tab.id
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Orders List Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-gray-800">
                {filteredOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                    <History size={48} className="mb-2 opacity-50" />
                    <p>{t('noOrdersFoundCategory')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order, index) => (
                      <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white dark:bg-gray-700 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-600 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-4">
                            {/* Left: Image & Title */}
                            <div className="flex gap-4">
                                <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                    {order.items[0]?.image ? (
                                        <img src={getImageUrl(order.items[0].image)} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full"><Coffee className="text-gray-400" /></div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                        {t('order')} {order.orderNumber}
                                    </h3>
                                    {/* --- CORRECT DATE FORMAT HERE --- */}
                                    <p className="text-sm text-gray-500 font-medium">
                                        {format(new Date(order.orderedAt), "MMMM do, yyyy 'at' h:mm a")}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {/* Translated Location Type */}
                                        {order.orderType === 'delivery' 
                                            ? t('homeDelivery')
                                            : order.customer?.roomNumber 
                                                ? `${t('room')} ${order.customer.roomNumber}` 
                                                : `${t('table')} ${order.customer.tableNumber}`} 
                                        {' • '} {order.items.length} {t('items')}
                                    </p>
                                </div>
                            </div>

                            {/* Right: Status Badge */}
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)} uppercase tracking-wide`}>
                                {t(order.status as any)}
                            </span>
                        </div>

                        {/* Footer: Price & Action */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-600">
                            <div className="text-sm">
                                <span className="text-gray-500">{t('total')}:</span>
                                <span className="ml-2 font-black text-lg text-gray-900 dark:text-white">ETB {order.totalAmount.toLocaleString()}</span>
                            </div>
                            
                            <button
                              onClick={() => openReceipt(order._id)}
                              className="flex items-center gap-2 px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-bold text-sm shadow-orange-200 shadow-sm"
                            >
                              <Receipt size={16} />
                              {t('viewReceipt')}
                            </button>
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