'use client';

import { useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import CustomerNavbar from './layout/CustomerNavbar';
import CustomerSidebar from './layout/CustomerSidebar';
import CustomerFooter from '../manager/layout/Footer'; 
import { Home } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
}

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  
  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Redirect if not customer
  useEffect(() => {
    if (user && user.role !== 'customer') {
      // Optional: Redirect if they shouldn't be here, or just let them view if your logic allows
    }
  }, [user]);

  // --- DARK MODE LOGIC ---
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
  }, []);

  // --- FETCH NOTIFICATIONS ---
  useEffect(() => {
    const fetchNotifs = async () => {
      if (!user) return;
      try {
        // Reuse the same notification endpoint, or create a customer specific one if needed.
        // For now, assuming the general endpoint filters by user ID or we use a new one.
        // Since we don't have a specific customer-notif endpoint yet, I'll simulate dynamic fetching
        // based on your existing Order/Booking endpoints, or use the shared dashboard one.
        
        // Let's use a custom fetch here to build notifications from their real data:
        const [ordersRes, bookingsRes] = await Promise.all([
            axios.get(`${API_URL}/api/orders/my`, { withCredentials: true }),
            axios.get(`${API_URL}/api/bookings/my-bookings`, { withCredentials: true })
        ]);

        const newNotifs: Notification[] = [];

        // Recent Orders
        ordersRes.data.slice(0, 3).forEach((o: any) => {
            if (o.status === 'delivered') {
                newNotifs.push({
                    id: `ord-${o._id}`,
                    title: 'Order Delivered',
                    message: `Your order #${o.orderNumber} has arrived!`,
                    time: new Date(o.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                    type: 'success',
                    read: false
                });
            }
        });

        // Upcoming Bookings
        bookingsRes.data.forEach((b: any) => {
            const checkIn = new Date(b.checkIn);
            const now = new Date();
            const diff = Math.ceil((checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diff >= 0 && diff <= 3 && b.status === 'confirmed') {
                 newNotifs.push({
                    id: `book-${b._id}`,
                    title: 'Upcoming Stay',
                    message: `Your stay in Room ${b.room?.roomNumber} starts in ${diff === 0 ? 'today' : diff + ' days'}!`,
                    time: 'Just now',
                    type: 'info',
                    read: true
                });
            }
        });

        setNotifications(newNotifs);

      } catch (err) {
        console.error("Failed to load notifications");
      }
    };

    fetchNotifs();
  }, [user]);

  if (!user) {
     // Simple Loading State for Layout
     return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">Loading...</div>;
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      <CustomerNavbar
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
        notifications={notifications}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
      />

      <div className="flex flex-1 relative">
        <AnimatePresence>
          {(sidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
            <CustomerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          )}
        </AnimatePresence>
        
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden w-full">
          {children}
        </main>
      </div>

      <CustomerFooter />

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}
    </div>
  );
}