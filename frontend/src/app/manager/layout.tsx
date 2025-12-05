'use client';

import { useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './layout/Navbar';
import Sidebar from './layout/Sidebar';
import Footer from './layout/Footer';
import { Home } from 'lucide-react';
import axios from 'axios'; // Import axios

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
}

export default function ManagerLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Dynamic Notifications State
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // --- FETCH NOTIFICATIONS ---
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/dashboard/notifications`, { withCredentials: true });
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to load notifications");
      }
    };

    if (user) {
        fetchNotifs();
        // Optional: Poll every minute
        const interval = setInterval(fetchNotifs, 60000);
        return () => clearInterval(interval);
    }
  }, [user]);

  // ... (Keep Redirect and Dark Mode effects same as before) ...

  useEffect(() => {
    if (user && user.role !== 'manager') router.push('/');
  }, [user, router]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) { root.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
    else { root.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  }, [darkMode]);

  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark') setDarkMode(true);
  }, []);
  
  if (!user) {
     // ... (Keep Loading Screen same as before) ...
     return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      <Navbar
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
        notifications={notifications} // Pass dynamic data
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
      />

      <div className="flex flex-1 relative">
        <AnimatePresence>
          {(sidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-xl lg:shadow-none border-r border-gray-200 dark:border-gray-700 pt-20 lg:pt-0 transition-colors duration-300"
            >
              <Sidebar activePath={pathname} />
            </motion.aside>
          )}
        </AnimatePresence>
        
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>

      <Footer />

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}