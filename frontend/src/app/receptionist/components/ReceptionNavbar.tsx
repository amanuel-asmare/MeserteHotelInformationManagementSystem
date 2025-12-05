'use client';


import { useState, useEffect } from 'react';

import { Bell, Moon, Sun, LogOut, Settings,Menu, X, Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../../context/AuthContext';
import { useLanguage } from '../../../../context/LanguageContext';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import HotelLogo from '../../../../components/HotelLogo';

interface ReceptionNavbarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

export default function ReceptionNavbar({ toggleSidebar, isSidebarOpen, isDarkMode, toggleDarkMode }: ReceptionNavbarProps) {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // --- FETCH NOTIFICATIONS ---
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/dashboard/notifications`, { withCredentials: true });
        setNotifications(res.data);
      } catch (error) {
        console.error("Failed to load notifications");
      }
    };

    fetchNotifications();
    // Optional: Poll every 60s
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const languages = [
    { code: 'en', name: 'English', label: 'English' },
    { code: 'am', name: 'Amharic', label: 'አማርኛ' },
  ];

  const currentLangLabel = languages.find(l => l.code === language)?.label || 'English';

  const menuVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.15 } },
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 z-50 transition-colors duration-300">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Section - Logo and Sidebar Toggle */}
         {/* Left Section - Logo and Sidebar Toggle */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleSidebar}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 lg:hidden"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>

            {/* ✅ REPLACED STATIC LOGO WITH DYNAMIC COMPONENT */}
            <HotelLogo className="scale-90 origin-left" />
          </div>
          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4">

            {/* --- LANGUAGE SWITCHER --- */}
            <div className="relative">
              <button 
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-200"
              >
                <Globe size={20} className="text-amber-600 dark:text-amber-500" />
                <span className="hidden md:block text-sm font-medium">{currentLangLabel}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code as 'en' | 'am');
                          setLangOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between
                          ${language === lang.code 
                            ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-bold' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dark Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </motion.button>

            {/* Notifications */}
            <div className="relative">
              <motion.button 
                whileHover={{ scale: 1.1 }} 
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition relative"
              >
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></span>
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">No new notifications</div>
                      ) : (
                        notifications.map((notif: any) => (
                          <div key={notif.id} className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{notif.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{notif.time}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu */}
            <div className="relative pl-2 border-l border-gray-200 dark:border-gray-700">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <img
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-500"
                  src={user?.profileImage || '/default-avatar.png'}
                  alt="Profile"
                  width={36}
                  height={36}
                />
                <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">{user?.firstName}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Receptionist</p>
                </div>
                <ChevronDown size={14} className="text-gray-500" />
              </motion.button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    variants={menuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl ring-1 ring-gray-200 dark:ring-gray-700 z-50 origin-top-right"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
                        {user?.email}
                      </p>
                    </div>
                    <Link href="/receptionist/settings" className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                       <Settings size={16} /> Settings
                    </Link>
                    
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition rounded-b-xl"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}/*'use client';

import { Bell, Moon, Sun, LogOut, User, Menu, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../../context/AuthContext';
import Link from 'next/link';
import Image from 'next/image'; // Import Image component

interface ReceptionNavbarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function ReceptionNavbar({ toggleSidebar, isSidebarOpen }: ReceptionNavbarProps) {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  const menuVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.15 } },
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Logo and Sidebar Toggle 
          <div className="flex items-center space-x-2"> {/* Reduced space-x to 2 /}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleSidebar}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 lg:hidden" // Only show on smaller screens
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>

            {/* Logo - Adjusted Size and better positioning to prevent covering /}
            <Link href="/reception" className="flex items-center space-x-2">
                <Image
                    src="/MHIMS_LOGO.png" // Path to your public folder image
                    alt="Meseret Hotel Logo"
                    width={60} // Adjusted width to better fit and avoid overlap
                    height={60} // Adjusted height
                    className="rounded-lg shadow-md flex-shrink-0" // flex-shrink-0 to prevent shrinking
                />
                <div className="hidden sm:block"> {/* Hide on extra small screens if space is tight /}
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Meseret Hotel</h1>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Reception Dashboard</p>
                </div>
            </Link>
          </div>

          {/* Search /}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search guests, rooms, reservations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white text-sm transition" // Added transition
              />
            </div>
          </div>

          {/* Right Section /}
          <div className="flex items-center gap-4">
            {/* Notifications /}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <div className="relative">
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold animate-pulse">3</span>
              </div>
            </motion.div>

            {/* Dark Mode /}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </motion.button>

            {/* User Menu /}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <img
                  className="w-8 h-8 rounded-full ring-2 ring-amber-500" // Adjusted size
                  src={user?.profileImage || '/default-avatar.png'}
                  alt="Profile"
                  width={32} // Adjusted width
                  height={32} // Adjusted height
                />
                <span className="hidden md:block text-sm font-medium text-gray-900 dark:text-white">
                  {user?.firstName || 'Guest'}
                </span>
              </motion.button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    variants={menuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl ring-1 ring-gray-200 dark:ring-gray-700 z-50 origin-top-right"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Receptionist
                      </p>
                    </div>
                    <Link href="/reception/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                      Profile
                    </Link>
                    <Link href="/reception/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                      Settings
                    </Link>
                    <motion.button // Added motion to logout button
                        whileHover={{ backgroundColor: '#fee2e2', color: '#ef4444' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition rounded-b-xl"
                    >
                      Logout
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}*/