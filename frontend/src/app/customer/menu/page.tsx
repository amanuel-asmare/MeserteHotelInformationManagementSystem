// src/app/customer/menu/page.tsx (Frontend - Corrected and Simplified)
'use client';

import { useState, useEffect, useRef } from 'react';
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
    if (authLoading) {
      toast.error("Please wait, user authentication is still loading.");
      return;
    }
    if (!user) {
      toast.error("You need to be logged in to place an order.");
      router.push('/login');
      return;
    }
    if (cart.length === 0) {
      toast.error('Your cart is empty! Add items before placing an order.');
      return;
    }
    let customerLocationIdentifier = '';
    if (orderType === 'room') {
        customerLocationIdentifier = user.roomNumber || '';
        if (!customerLocationIdentifier) {
            toast.error('Please set your room number in Settings before placing an order via room service.');
            return;
        }
    } else { // orderType === 'table'
        customerLocationIdentifier = tableNumber.trim();
        if (!customerLocationIdentifier) {
            toast.error('Please enter a table number before placing an order for restaurant service.');
            return;
        }
    }
    setPlacingOrder(true);
    try {
      const payload: any = { // Use 'any' for now to allow dynamic properties
        items: cart.map(i => ({ menuItem: i.menuItem, quantity: i.quantity, notes: i.notes })),
        notes: '',
        totalAmount: parseFloat(totalPrice),
        customerName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone, // FIXED: Removed || 'N/A' to avoid invalid phone_number
      };
      if (orderType === 'room') {
        payload.roomNumber = customerLocationIdentifier;
      } else {
        payload.tableNumber = customerLocationIdentifier;
      }
      const res = await api.post('/api/orders/chapa', payload);
      if (!res.data.checkout_url) {
        throw new Error('Chapa did not return a checkout URL. Please try again.');
      }
      window.location.href = res.data.checkout_url;
    } catch (e: any) {
      console.error("Error placing order:", e);
      toast.error(e.response?.data?.message || e.message || 'Payment initiation failed. Please check your network and try again.');
    } finally {
      setPlacingOrder(false);
    }
  };
  // Receipt
  const printReceipt = (order: Order) => {
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
      <div class="header"><div class="logo">Hotel</div><h2>Order Receipt</h2>
      <p><strong>Order:</strong> ${order.orderNumber}</p>
      <p><strong>Date:</strong> ${format(new Date(order.orderedAt), 'PPp')}</p>
      <p><strong>${order.customer?.roomNumber ? 'Room' : 'Table'}:</strong> ${order.customer?.roomNumber || order.customer?.tableNumber || 'N/A'}</p></div>
      <table><thead><tr><th>Item</th><th class="text-right">Price</th></tr></thead><tbody>${items}</tbody></table>
      <div class="total text-right">Total: ETB ${order.totalAmount.toFixed(2)}</div>
      <div class="footer">Thank you!</div></body></html>`);
    w.document.close(); w.focus(); setTimeout(() => w.print(), 500);
  };
  const isOrderButtonDisabled = placingOrder || (orderType === 'room' && !user?.roomNumber) || (orderType === 'table' && !tableNumber.trim());

  if (loading || authLoading) {
    return (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-32 h-32 relative">
                <div className="absolute inset-0 rounded-full border-8 border-amber-200"></div>
                <div className="absolute inset-0 rounded-full border-8 border-t-amber-600 border-r-amber-600 border-b-transparent border-l-transparent animate-spin"></div>
                <div className="absolute inset-4 bg-amber-600 rounded-full flex items-center justify-center"><Coffee className="w-12 h-12 text-white" /></div>
            </motion.div>
        </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      
      {/* Page content is now the top-level element */}
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
              {(orderType === 'room' && !user?.roomNumber) && <Link href="/customer/settings" className="ml-2 text-amber-600 underline text-sm">Set Room</Link>}
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

      {/* CART DRAWER */}
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
                  {(orderType === 'room' && !user?.roomNumber) && <p className="text-center mt-3 text-sm text-red-600"><Link href="/customer/settings" className="underline">Set room number to pay</Link></p>}
                  {(orderType === 'table' && !tableNumber.trim()) && <p className="text-center mt-3 text-sm text-red-600">Enter a table number to pay</p>}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ORDER HISTORY */}
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
}/*'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CustomerNavbar from '../layout/CustomerNavbar';
import CustomerSidebar from '../layout/CustomerSidebar';
import CustomerFooter from '../layout/CustomerFooter';
import { Coffee, Plus, Minus, ShoppingCart, X, Printer, History, Loader2, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { useAuth } from '../../../../context/AuthContext';
import Link from 'next/link';
import { format } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';

let io: any;
if (typeof window !== 'undefined') io = require('socket.io-client');

interface MenuItem { _id: string; name: string; description: string; price: number; category: string; image: string; }
interface CartItem { menuItem: string; name: string; price: number; quantity: number; notes: string; }
interface Order {
  _id: string; orderNumber: string; items: any[]; totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  orderedAt: string; deliveredAt?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function CustomerMenuPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth(); // Destructure loading state from useAuth

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const socketRef = useRef<any>(null);

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
    // Only fetch order history if user is available and not still loading auth
    if (!authLoading && user) {
      fetchOrderHistory();
    }
  }, [authLoading, user]); // Depend on authLoading and user

  useEffect(() => { localStorage.setItem('customerCart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark'); }, [darkMode]);

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
    if (authLoading) {
      toast.error("Please wait, user authentication is still loading.");
      return;
    }
    if (!user) {
      toast.error("You need to be logged in to place an order.");
      router.push('/login'); // Redirect to login if not authenticated
      return;
    }
    if (!user.roomNumber) {
      toast.error('Please set your room number in Settings before placing an order.');
      // Optionally redirect to settings
      // router.push('/customer/settings');
      return;
    }
    if (cart.length === 0) {
      toast.error('Your cart is empty! Add items before placing an order.');
      return;
    }

    setPlacingOrder(true);
    try {
      const payload = {
        items: cart.map(i => ({ menuItem: i.menuItem, quantity: i.quantity, notes: i.notes })),
        notes: '',
        totalAmount: parseFloat(totalPrice),
        customerName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone || 'N/A',
        roomNumber: user.roomNumber
      };
      const res = await api.post('/api/orders/chapa', payload);
      if (!res.data.checkout_url) {
        throw new Error('Chapa did not return a checkout URL. Please try again.');
      }
      // Redirect to Chapa checkout page
      window.location.href = res.data.checkout_url;
    } catch (e: any) {
      console.error("Error placing order:", e);
      toast.error(e.response?.data?.message || e.message || 'Payment initiation failed. Please check your network and try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Receipt
  const printReceipt = (order: Order) => {
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
      <div class="header"><div class="logo">Hotel</div><h2>Order Receipt</h2>
      <p><strong>Order:</strong> ${order.orderNumber}</p>
      <p><strong>Date:</strong> ${format(new Date(order.orderedAt), 'PPp')}</p>
      <p><strong>Room:</strong> ${user?.roomNumber || 'N/A'}</p></div>
      <table><thead><tr><th>Item</th><th class="text-right">Price</th></tr></thead><tbody>${items}</tbody></table>
      <div class="total text-right">Total: ETB ${order.totalAmount.toFixed(2)}</div>
      <div class="footer">Thank you!</div></body></html>`);
    w.document.close(); w.focus(); setTimeout(() => w.print(), 500);
  };

  if (loading || authLoading) return <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-32 h-32 relative">
      <div className="absolute inset-0 rounded-full border-8 border-amber-200"></div>
      <div className="absolute inset-0 rounded-full border-8 border-t-amber-600 border-r-amber-600 border-b-transparent border-l-transparent animate-spin"></div>
      <div className="absolute inset-4 bg-amber-600 rounded-full flex items-center justify-center"><Coffee className="w-12 h-12 text-white" /></div>
    </motion.div>
  </div>;

  return (
    <>
      <Toaster position="top-right" />
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${darkMode ? 'dark' : ''}`}>
        <CustomerNavbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
        <div className="flex">
          <CustomerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 p-6 lg:p-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order Food & Drinks</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Delivered to Room <span className="font-semibold text-amber-600">{user?.roomNumber || 'Not set'}</span>
                    {!user?.roomNumber && <Link href="/customer/settings" className="ml-2 text-amber-600 underline text-sm">Set Room</Link>}
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
          </main>
        </div>
        <CustomerFooter />

        {/* CART DRAWER 
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
                      {cart.map(item => (
                        <motion.div key={item.menuItem} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold">{item.name}</h4>
                              <p className="text-sm text-amber-600">ETB {item.price} each</p>
                              <input type="text" placeholder="Notes (e.g., less spicy)" value={item.notes}
                                onChange={e => updateNotes(item.menuItem, e.target.value)}
                                className="mt-2 w-full px-3 py-1 text-sm border rounded-lg" />
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button onClick={() => updateQuantity(item.menuItem, -1)} className="p-1 bg-gray-200 rounded-lg hover:bg-gray-300"><Minus size={16} /></button>
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
                    <button onClick={() => {
    console.log('Button clicked');
    placeOrder();
  }} disabled={placingOrder || !user?.roomNumber}
                      className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
                      {placingOrder ? <><Loader2 className="animate-spin" size={20} /> Processing...</> :
                        <><CreditCard size={20} /> Pay with Chapa • ETB {totalPrice}</>}
                    </button>
                    {!user?.roomNumber && <p className="text-center mt-3 text-sm text-red-600"><Link href="/customer/settings" className="underline">Set room number to pay</Link></p>}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ORDER HISTORY 
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
                              <p className="text-sm mt-1">{order.items.length} items • ETB {order.totalAmount}</p>
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
      </div>
    </>
  );
}*/