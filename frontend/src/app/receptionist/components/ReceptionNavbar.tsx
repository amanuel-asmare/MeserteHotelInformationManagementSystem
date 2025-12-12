'use client';
import { Switch } from 'react-native';

import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { useLanguage } from '../../../../context/LanguageContext';
import {
  Bell,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
  Globe,
  MessageSquare,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import HotelLogo from '../../../../components/HotelLogo';

interface ReceptionNavbarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  notifications?: any[];
  showNotifications?: boolean;
  setShowNotifications?: (v: boolean) => void;
}

export default function ReceptionNavbar({
  toggleSidebar,
  isSidebarOpen,
  notifications = [],
  showNotifications = false,
  setShowNotifications = () => {},
}: ReceptionNavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();

  const [langOpen, setLangOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // Local state to avoid SSR issues

  const unreadCount = notifications.filter(n => !n.read).length;

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'am', name: 'Amharic', native: 'አማርኛ' },
  ];

  // Safe dark mode detection & toggle (only runs on client)
  useEffect(() => {
    const checkDarkMode = () => {
      const dark = document.documentElement.classList.contains('dark');
      setIsDarkMode(dark);
    };

    checkDarkMode(); // Initial check

    // Watch for changes (e.g. system preference)
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDarkMode(prev => !prev);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-all duration-300">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* LEFT: Logo + Mobile Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition"
            >
              {isSidebarOpen ? <X size={26} /> : <Menu size={26} />}
            </button>

            <div className="flex items-center">
              <HotelLogo className="h-14 w-auto scale-95 origin-left" />
            </div>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-4">

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 hover:from-amber-100 dark:hover:from-amber-900/50 transition font-medium text-amber-700 dark:text-amber-400 shadow-sm"
              >
                <Globe size={20} />
                <span className="hidden sm:inline text-sm font-bold uppercase tracking-wider">
                  {language === 'am' ? 'አማ' : 'ENG'}
                </span>
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-amber-200 dark:border-amber-800 overflow-hidden z-50"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code as 'en' | 'am');
                          setLangOpen(false);
                        }}
                        className={`w-full text-left px-6 py-4 text-sm font-medium transition flex items-center gap-4 ${
                          language === lang.code
                            ? 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 text-amber-700 dark:text-amber-300'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {language === lang.code && <Check size={18} className="text-amber-600 dark:text-amber-400" />}
                        <div>
                          <div className="font-bold text-base">{lang.native}</div>
                          <div className="text-xs opacity-75">{lang.name}</div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dark Mode Toggle – NOW 100% SAFE & WORKING */}
            <button
              onClick={toggleDarkMode}
              className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-gray-700 dark:to-gray-600 hover:shadow-xl transition-all transform hover:scale-110 shadow-lg"
              title={isDarkMode ? t('lightMode' as any) || "Light Mode" : t('darkMode' as any) || "Dark Mode"}
            >
              <motion.div
                key={isDarkMode ? 'sun' : 'moon'}
                initial={{ rotate: 180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {isDarkMode ? (
                  <Sun size={22} className="text-yellow-500 drop-shadow-lg" />
                ) : (
                  <Moon size={22} className="text-gray-700 drop-shadow-md" />
                )}
              </motion.div>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 hover:shadow-xl transition shadow-md"
              >
                <Bell size={22} className="text-amber-700 dark:text-amber-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse border-2 border-white dark:border-gray-800">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-4 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-amber-200 dark:border-amber-800 overflow-hidden z-50"
                  >
                    <div className="p-5 border-b border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
                      <h3 className="font-bold text-xl text-amber-700 dark:text-amber-300">
                        {t('notifications' as any) || "Notifications"}
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                          <Bell className="w-16 h-16 mx-auto mb-4 opacity-20" />
                          <p className="font-medium">{t('allCaughtUp' as any) || "All caught up!"}</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif.id} className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-amber-50/50 dark:hover:bg-gray-700 transition">
                            <p className="font-semibold text-gray-900 dark:text-white">{notif.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-2">{notif.time}</p>
                          </div>
                        ))
                      )}
                    </div>
                    <Link href="/receptionist/chat" className="block p-4 text-center bg-amber-600 hover:bg-amber-700 text-white font-bold transition">
                      {t('openChat' as any) || "Open Chat"}
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-4 pl-4 border-l border-amber-300 dark:border-amber-700">
              <div className="hidden sm:block text-right">
                <p className="font-bold text-gray-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  {t('receptionist') || "Receptionist"}
                </p>
              </div>
              <div className="relative group">
                <img
                  src={user?.profileImage || '/default-avatar.png'}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover ring-4 ring-amber-500/30 group-hover:ring-amber-500 transition-all shadow-lg"
                  onError={(e) => (e.currentTarget.src = '/default-avatar.png')}
                />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <LogOut size={20} />
              <span className="hidden sm:inline">{t('logout') || "Logout"}</span>
            </button>
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