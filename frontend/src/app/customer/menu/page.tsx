'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Coffee, Plus, Minus, ShoppingCart, X, History, 
  Loader2, Hotel, Utensils, Receipt, Calendar, Clock, 
  Bike, MapPin, Pizza, Sandwich, Soup, IceCream // Added icons for loading animation
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { useAuth } from '../../../../context/AuthContext';
import Link from 'next/link';
import { format } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';
import { useLanguage } from '../../../../context/LanguageContext';

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

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://mesertehotelinformationmanagementsystem.onrender.com';
// --- NEW LOADING COMPONENT ---
const CulinaryLoader = () => {
  const [currentIcon, setCurrentIcon] = useState(0);
  const icons = [Utensils, Pizza, Coffee, Soup, Sandwich, IceCream];
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % icons.length);
    }, 600);
    return () => clearInterval(timer);
  }, [icons.length]);

  const CurrentIconComponent = icons[currentIcon];

  return (
    <div className="fixed inset-0 z-[100] bg-[#1a1a1a] flex flex-col items-center justify-center overflow-hidden">
     
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: "110vh", x: Math.random() * 100 + "vw", opacity: 0 }}
            animate={{ y: "-10vh", opacity: [0, 0.8, 0] }}
            transition={{ 
              duration: 5 + Math.random() * 5, 
              repeat: Infinity, 
              delay: Math.random() * 5,
              ease: "linear"
            }}
            className="absolute text-amber-500/30"
          >
             <div className="w-2 h-2 rounded-full bg-amber-500" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center">
     
        <motion.div 
          className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500 to-orange-700 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(245,158,11,0.4)] border-4 border-[#2a2a2a]"
          animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIcon}
              initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
              transition={{ duration: 0.3 }}
            >
              <CurrentIconComponent size={56} className="text-white drop-shadow-lg" />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        
        <div className="text-center space-y-2">
            <h1 className="text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 font-serif">
               MESERET DINING
            </h1>
            <p className="text-gray-400 text-sm tracking-[0.3em] uppercase font-light animate-pulse">
                Preparing Your Experience
            </p>
        </div>

       
        <div className="w-64 h-1.5 bg-gray-800 rounded-full mt-8 overflow-hidden relative">
            <motion.div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-orange-600"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3.5, ease: "easeInOut" }}
            />
        </div>
      </div>
    </div>
  );
};

export default function CustomerMenuPage() {
  const { t, language } = useLanguage(); 
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
    if (typeof window === 'undefined' || !(user as any)?._id) return;
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
          toast.success(`${t('order' as any)} ${updatedOrder.orderNumber} ${t('orderMarkedAs' as any)} ${statusText}!`, {
            style: { background: '#10b981', color: 'white' },
            duration: 4000
          });
      }
    });

    return () => socket.disconnect();
  }, [(user as any)?._id, t]);

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
      console.error(t('failedLoadHistory' as any));
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
    toast.success(`${item.name} ${t('itemAdded' as any)}`, { icon: 'Success' });
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
    if (!user) { toast.error(t('pleaseLogIn' as any)); router.push('/login'); return; }
    if (cart.length === 0) { toast.error(t('cartEmpty' as any)); return; }
    
    if (orderType === 'room' && !user.roomNumber) {
      toast.error(t('setRoomNumber' as any));
      return;
    }
    if (orderType === 'table' && !tableNumber.trim()) {
      toast.error(t('enterTableNumber' as any));
      return;
    }
    if (orderType === 'delivery') {
        if(!deliveryDetails.phone || !deliveryDetails.street || !deliveryDetails.landmark) {
            toast.error(t('fillDeliveryDetails' as any));
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

  // Loading Screen Timer
  const MIN_LOADING_TIME = 3500; 
  const [minTimePassed, setMinTimePassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => { setMinTimePassed(true); }, MIN_LOADING_TIME);
    return () => clearTimeout(timer);
  }, []);

  if (loading || authLoading || !minTimePassed) {
    return <CulinaryLoader />;
  }

  return (
    <>
      <Toaster position="top-right" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
     
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('orderFoodDrinks')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('deliveredTo')} {' '}
              {orderType === 'room' && <span className="font-semibold text-amber-600">{t('room')} {user?.roomNumber || t('notSet' as any)}</span>}
              {orderType === 'table' && <span className="font-semibold text-amber-600">{t('table' as any)} {tableNumber || t('notSet' as any)}</span>}
              {orderType === 'delivery' && <span className="font-semibold text-amber-600">{t('deliveryService' as any)}</span>}
              {(orderType === 'room' && !user?.roomNumber) && (
                <Link href="/customer/settings/roomSet" className="ml-2 text-amber-600 underline text-sm">{t('setRoom' as any)}</Link>
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
                {t( item.category as any)}
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

     
      <AnimatePresence>
        {showCart && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} />
            <motion.div className="relative w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl flex flex-col h-full" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b flex items-center justify-between bg-gray-50 dark:bg-gray-900">
                <h2 className="text-2xl font-bold">{t('yourOrder' as any)}</h2>
                <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-200 rounded-full"><X size={24} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                      <ShoppingCart size={64} className="text-gray-300" />
                      <p>{t('cartEmpty' as any)}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    
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
                                <span className="text-xs font-bold">{t('deliveryService' as any)}</span>
                            </label>
                        </div>
                    </div>


                    {orderType === 'table' && (
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg animate-in slide-in-from-top-2">
                        <label className="block text-sm font-bold mb-1">{t('tableNumber' as any)}</label>
                        <input
                          type="text"
                          value={tableNumber}
                          onChange={e => setTableNumber(e.target.value)}
                          placeholder="e.g., A12"
                          className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
                        />
                      </div>
                    )}

                   
                    {orderType === 'delivery' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                            <h4 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                                <MapPin size={16} /> {t('deliveryDetails' as any)}
                            </h4>
                            <input
                                type="text"
                                placeholder={t('phoneNumber' as any)}
                                value={deliveryDetails.phone}
                                onChange={e => setDeliveryDetails({...deliveryDetails, phone: e.target.value})}
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                            />
                            <input
                                type="text"
                                placeholder={t('streetArea' as any)}
                                value={deliveryDetails.street}
                                onChange={e => setDeliveryDetails({...deliveryDetails, street: e.target.value})}
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                            />
                            <textarea
                                placeholder={t('landmarkInstructions' as any)}
                                value={deliveryDetails.landmark}
                                onChange={e => setDeliveryDetails({...deliveryDetails, landmark: e.target.value})}
                                className="w-full px-3 py-2 border rounded-lg text-sm h-16 resize-none bg-white"
                            />
                            <div className="text-xs text-orange-600 font-bold bg-orange-100 p-2 rounded">
                                {t('deliveryFeeAdded')}
                            </div>
                        </motion.div>
                    )}

                   
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


              <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-gray-800">
                {filteredOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                    <History size={48} className="mb-2 opacity-50" />
                    <p>{t('noOrdersFoundCategory' as any)}</p>
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
                                        {t('order' as any)} {order.orderNumber}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-medium">
                                        {format(new Date(order.orderedAt), "MMMM do, yyyy 'at' h:mm a")}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {order.orderType === 'delivery' 
                                            ? t('homeDelivery' as any)
                                            : order.customer?.roomNumber 
                                                ? `${t('room')} ${order.customer.roomNumber}` 
                                                : `${t('table' as any)} ${order.customer.tableNumber}`} 
                                        {' • '} {order.items.length} {t('items')}
                                    </p>
                                </div>
                            </div>

                           
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)} uppercase tracking-wide`}>
                                {t(order.status as any)}
                            </span>
                        </div>

                        
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
}
  

/*'use client';
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
                                    
                                    <p className="text-sm text-gray-500 font-medium">
                                        {format(new Date(order.orderedAt), "MMMM do, yyyy 'at' h:mm a")}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        
                                        {order.orderType === 'delivery' 
                                            ? t('homeDelivery')
                                            : order.customer?.roomNumber 
                                                ? `${t('room')} ${order.customer.roomNumber}` 
                                                : `${t('table')} ${order.customer.tableNumber}`} 
                                        {' • '} {order.items.length} {t('items')}
                                    </p>
                                </div>
                            </div>

                          
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)} uppercase tracking-wide`}>
                                {t(order.status as any)}
                            </span>
                        </div>

                        
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
}*/