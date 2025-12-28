'use client';

import { useState, useEffect, useCallback } from 'react';
import { Menu, X, Globe, LogOut, Sun, Moon, Bell, CheckCircle, Info, AlertCircle, Trash2, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { usePathname } from 'next/navigation';
import Footer from '../../app/admin/Footer'; 
import { useLanguage } from '../../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import HotelLogo from '../../../components/HotelLogo'; 
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mesertehotelinformationmanagementsystem.onrender.com';

const getImageUrl = (path: string | undefined) => {
  if (!path) return '/default-avatar.png';
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
};

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // --- DARK MODE LOGIC ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    if (newMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  // Inside your fetchNotifications function:
const fetchNotifications = useCallback(async () => {
    try {
        const res = await axios.get(`${API_URL}/api/dashboard/notifications`, { withCredentials: true });
        // Only update state if the data is different to avoid unnecessary re-renders
        setNotifications(res.data);
    } catch (err) {
        console.error("Error fetching notifications", err);
    }
}, []);

// Update the UseEffect for polling (make it faster for "real-time" feel)
useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
}, [fetchNotifications]);

// Updated Dismiss Logic
const dismissNotificationPermanently = async (id: string) => {
    // 1. Optimistic Update (Remove from UI immediately)
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    try {
        // 2. Tell the backend to mark as read
        await axios.delete(`${API_URL}/api/dashboard/notifications/${id}`, { withCredentials: true });
    } catch (err) {
        console.error("Failed to dismiss", err);
        // 3. If it failed, put it back in the list
        fetchNotifications(); 
    }
};

const handleNotificationClick = (notif: any) => {
    setSelectedNotification(notif);
    setShowNotifications(false);
    // When viewed, mark it as read permanently
    dismissNotificationPermanently(notif.id);
};
const deleteNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Don't open the modal if just clicking delete
    dismissNotificationPermanently(id);
};
  const languages = [{ code: 'en', name: 'English' }, { code: 'am', name: 'Amharic (አማርኛ)' }];

  const menuItems = [
    { icon: 'LayoutDashboard', label: t('dashboard'), href: '/admin' },
    { icon: 'BedDouble', label: t('roomManagement'), href: '/admin/rooms' },
    { icon: 'Users', label: t('manageStaff'), href: '/admin/staff' },
    { icon: 'MenuSquare', label: t('menuManagement'), href: '/admin/menu' },
    { icon: 'ShoppingCart', label: t('foodOrders'), href: '/admin/food-orders' },
    { icon: 'FileBarChart', label: t('generateReport'), href: '/admin/reports' },
    { icon: 'UploadCloud', label: t('News'), href: '/admin/upload-docs' },
    { icon: 'FileText', label: t('feedback'), href: '/admin/feedback' },
    { icon: 'MessageCircle', label: t('chat'), href: '/admin/chat' },
    { icon: 'Banknote', label: t('pyroll'), href: '/admin/payroll' },
    { icon: 'Settings', label: t('HotelLego'), href: '/admin/settings/settingConfigration' },
    { icon: 'ShoppingBag', label: t('purchases'), href: '/admin/purchases' },
    { icon: 'Receipt', label: t('expenses'), href: '/admin/expenses' },
    { icon: 'PieChart', label: t('financialReports'), href: '/admin/analytics' },
    { icon: 'Settings', label: t('settings'), href: '/admin/settings' },
  ];

  const unreadCount = notifications.length;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      
      {/* HEADER */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden text-gray-600 dark:text-gray-300">
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <HotelLogo className="scale-90 origin-left" />
          </div>

          <div className="flex items-center gap-3">
            {/* Language */}
            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg">
                <Globe size={18} />
                <span className="hidden sm:inline uppercase">{language}</span>
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 z-50 overflow-hidden">
                    {languages.map(lang => (
                      <button key={lang.code} onClick={() => { setLanguage(lang.code as 'en' | 'am'); setLangOpen(false); }} className={`block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${language === lang.code ? 'text-amber-600 font-bold bg-amber-50 dark:bg-amber-900/20' : 'dark:text-gray-300'}`}>
                        {lang.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dark Mode */}
            <button onClick={toggleDarkMode} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-400">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className={`relative p-2 rounded-lg transition ${showNotifications ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-gray-100 dark:bg-gray-700'} text-gray-600 dark:text-gray-300`}>
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold border-2 border-white dark:border-gray-800 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }} className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border dark:border-gray-700 overflow-hidden z-50">
                    <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                      <h3 className="font-bold dark:text-white">Recent Updates</h3>
                      <span className="text-[10px] px-2 py-1 bg-amber-500 text-white rounded-full uppercase tracking-tighter">Live</span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-10 text-center text-gray-400 text-sm italic">All caught up!</div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} onClick={() => handleNotifClick(n)} className="p-4 border-b dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer group transition-all">
                            <div className="flex gap-3">
                              <div className={`mt-1 p-2 rounded-xl h-fit ${getColors(n.type)}`}>
                                {getIcon(n.type)}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{n.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{n.message}</p>
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); dismissPermanently(n.id); }} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile - KEPT AS PER ORIGINAL */}
            <div className="hidden sm:flex items-center gap-3 pl-3 border-l dark:border-gray-700">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                  {user?.firstName || 'Amanuel'}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mt-1">
                  {t('admin')}
                </p>
              </div>
              <img
                src={getImageUrl(user?.profileImage)}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-offset-2 ring-amber-500 dark:ring-offset-gray-800"
              />
            </div>

            {/* Logout */}
            <button onClick={logout} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-100 transition">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedNotification && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${selectedNotification.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                        {selectedNotification.type === 'success' ? <CheckCircle size={28} /> : <Info size={28} />}
                    </div>
                    <button onClick={() => setSelectedNotification(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400 transition-colors"><X size={20} /></button>
                </div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">{selectedNotification.title}</h2>
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-4"><Calendar size={14} /><span>Received Today</span></div>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm font-medium">{selectedNotification.detail}</p>
                </div>
                <button onClick={() => setSelectedNotification(null)} className="w-full mt-6 py-3 bg-amber-600 text-white font-bold rounded-xl shadow-lg hover:bg-amber-700 transition-colors">Dismiss</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 shadow-lg transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-5 h-full overflow-y-auto">
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = require('lucide-react')[item.icon];
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-amber-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-amber-50 dark:hover:bg-gray-700'}`}>
                    {Icon && <Icon size={20} />}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
          <div className="mt-auto border-t dark:border-gray-800">
             <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}/*'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Globe, LogOut, Sun, Moon, Bell } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { usePathname } from 'next/navigation';
import Footer from '../../app/admin/Footer'; // Make sure path is correct based on your folder structure
import { useLanguage } from '../../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import HotelLogo from '../../../components/HotelLogo'; 

const getImageUrl = (path: string | undefined) => {
  if (!path) return '/default-avatar.png';
  if (path.startsWith('http')) return path;
  // const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://mesertehotelinformationmanagementsystem.onrender.com';
  return `${API_BASE}${path}`;
};

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  
  // UI States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // --- DARK MODE LOGIC ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // --- MOCK NOTIFICATIONS ---
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'System Update', message: 'Maintenance scheduled for 2:00 AM', time: '10 min ago', type: 'info', read: false },
    { id: 2, title: 'New Booking', message: 'Room 104 booked by Abebe', time: '1 hour ago', type: 'success', read: false },
  ]);
  const unreadCount = notifications.filter(n => !n.read).length;

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'am', name: 'Amharic (አማርኛ)' },
  ];

  // Translating Sidebar Items
  const menuItems = [
    { icon: 'LayoutDashboard', label: t('dashboard'), href: '/admin' },
    { icon: 'BedDouble', label: t('roomManagement'), href: '/admin/rooms' },
    { icon: 'Users', label: t('manageStaff'), href: '/admin/staff' },
    { icon: 'MenuSquare', label: t('menuManagement'), href: '/admin/menu' },
    { icon: 'ShoppingCart', label: t('foodOrders'), href: '/admin/food-orders' },
    { icon: 'FileBarChart', label: t('generateReport'), href: '/admin/reports' },
    { icon: 'UploadCloud', label: t('News'), href: '/admin/upload-docs' },
    { icon: 'FileText', label: t('feedback'), href: '/admin/feedback' },
    { icon: 'MessageCircle', label: t('chat'), href: '/admin/chat' },
    { icon: 'Banknote', label: t('pyroll'), href: '/admin/payroll' },
   
    { icon: 'Settings', label: t('HotelLego'), href: '/admin/settings/settingConfigration' },
    { icon: 'ShoppingBag', label: t('purchases'), href: '/admin/purchases' },
    { icon: 'Receipt', label: t('expenses'), href: '/admin/expenses' },
    { icon: 'PieChart', label: t('financialReports'), href: '/admin/analytics' },
    { icon: 'Settings', label: t('settings'), href: '/admin/settings' },
  ];

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      
      
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          
         
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition md:hidden">
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <HotelLogo className="scale-90 origin-left" />
          </div>

          
          <div className="flex items-center gap-3 sm:gap-4">
            
           
            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                <Globe size={18} />
                <span className="hidden sm:inline font-medium">
                  {languages.find(l => l.code === language)?.code.toUpperCase()}
                </span>
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50"
                  >
                    {languages.map(lang => (
                      <button 
                        key={lang.code} 
                        onClick={() => { setLanguage(lang.code as 'en' | 'am'); setLangOpen(false); }} 
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${language === lang.code ? 'text-amber-600 font-bold bg-amber-50 dark:bg-amber-900/20' : 'text-gray-700 dark:text-gray-300'}`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-yellow-400 transition"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse border-2 border-white dark:border-gray-800">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            
            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                  {user?.firstName}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mt-1">
                  {t('admin')}
                </p>
              </div>
              <img
                src={getImageUrl(user?.profileImage)}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-offset-2 ring-amber-500 dark:ring-offset-gray-800"
              />
            </div>

          
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 rounded-lg transition-all font-bold"
            >
              <LogOut size={18} />
              <span className="hidden md:inline">{t('logout')}</span>
            </button>

          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
      
        <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-5 h-full overflow-y-auto">
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = require('lucide-react')[item.icon];
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-amber-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-amber-50 dark:hover:bg-gray-700 hover:text-amber-700 dark:hover:text-white'}`}>
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}

*/


/*// src/app/admin/AdminLayoutClient.tsx
'use client';

import { Menu, X, Globe, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { usePathname } from 'next/navigation';
import Footer from './Footer';
import { useLanguage } from '../../../context/LanguageContext'; // Import Hook

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage(); // Get t() and setLanguage
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'am', name: 'Amharic (አማርኛ)' },
  ];

  // Dynamic Menu Items using t()
  const menuItems = [
    { icon: 'LayoutDashboard', label: t('dashboard'), href: '/admin' },
    { icon: 'BedDouble', label: t('roomManagement'), href: '/admin/rooms' },
    { icon: 'Users', label: t('manageStaff'), href: '/admin/staff' },
    { icon: 'MenuSquare', label: t('menuManagement'), href: '/admin/menu' },
    { icon: 'ShoppingCart', label: t('foodOrders'), href: '/admin/food-orders' },
    { icon: 'FileBarChart', label: t('generateReport'), href: '/admin/reports' },
    { icon: 'UploadCloud', label: t('uploadDocs'), href: '/admin/upload-docs' },
    { icon: 'FileText', label: t('feedback'), href: '/admin/feedback' },
    { icon: 'Settings', label: t('settings'), href: '/admin/settings' },
    { icon: 'MessageCircle', label: t('chat'), href: '/admin/chat' },
  ];

  const currentPage = menuItems.find(item => item.href === pathname)?.label || t('dashboard');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header /}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 transition md:hidden">
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm">A</div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{t('admin')} Portal</h1>
                <p className="text-xs text-gray-500">{t('meseretHotel')}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher /}
            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                <Globe size={16} />
                <span className="hidden sm:inline">
                  {languages.find(l => l.code === language)?.name}
                </span>
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                  {languages.map(lang => (
                    <button 
                      key={lang.code} 
                      onClick={() => { 
                        setLanguage(lang.code as 'en' | 'am'); // Update Global State
                        setLangOpen(false); 
                      }} 
                      className={`block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm ${language === lang.code ? 'bg-amber-50 text-amber-600 font-medium' : ''}`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>

            <button onClick={logout} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium">
              <LogOut size={16} />
              <span className="hidden sm:inline">{t('logout')}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar /}
        <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 shadow-lg transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-5">
            <nav className="space-y-1">
              {menuItems.map((item) => {
                // Dynamic Icon loading
                const Icon = require('lucide-react')[item.icon];
                return (
                  <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${pathname === item.href ? 'bg-amber-600 text-white shadow-md' : 'text-gray-700 hover:bg-amber-50 hover:text-amber-600'}`}>
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}*/