'use client';

import { useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './layout/Navbar';
import Sidebar from './layout/Sidebar';
import Footer from './layout/Footer';
import { Home } from 'lucide-react';

// Define the structure for notifications
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
  
  // Dummy notifications - this state now lives in the layout
  const [notifications] = useState<Notification[]>([
    { id: '1', title: 'New Check-in', message: 'Room 304 - Abebe Kebede', time: '2 min ago', type: 'info', read: false },
    { id: '2', title: 'Low Stock Alert', message: 'Coffee beans running low', time: '15 min ago', type: 'warning', read: false },
    { id: '3', title: 'Feedback Received', message: '5-star review from guest', time: '1 hour ago', type: 'success', read: true },
  ]);

  // Redirect if not a manager
  useEffect(() => {
    if (user && user.role !== 'manager') {
      router.push('/');
    }
  }, [user, router]);

  // Effect for handling dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  // A loading/unauthorized state
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-32 h-32 mx-auto mb-8 relative">
            <div className="absolute inset-0 rounded-full border-8 border-amber-200"></div>
            <div className="absolute inset-0 rounded-full border-8 border-t-amber-600 border-r-amber-600 border-b-transparent border-l-transparent animate-spin"></div>
            <div className="absolute inset-4 bg-amber-600 rounded-full flex items-center justify-center">
              <Home className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          <h2 className="text-3xl font-bold text-amber-700 dark:text-amber-400">Loading Manager Portal...</h2>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors ${darkMode ? 'dark' : ''}`}>
      <Navbar
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
        notifications={notifications}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
      />

      <div className="flex">
        {/* === SIDEBAR === */}
        <AnimatePresence>
          {/* Show sidebar permanently on large screens, or when toggled on smaller screens */}
          {(sidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-xl lg:shadow-none border-r border-gray-200 dark:border-gray-700 pt-20 lg:pt-0"
            >
              <Sidebar activePath={pathname} />
            </motion.aside>
          )}
        </AnimatePresence>
        
        {/* === MAIN DYNAMIC CONTENT === */}
        {/* The {children} prop is where your page.tsx content will be rendered! */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>

      <Footer />

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}
    </div>
  );
}