'use client';

import { Fragment, useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useLanguage } from '../../../../context/LanguageContext';
import { Menu, Transition } from '@headlessui/react';
import {
  Bell, Moon, Sun, LogOut,
  PanelLeftClose, PanelLeftOpen,
  ChevronDown, Check, Globe, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import HotelLogo from '../../../../components/HotelLogo';

const getImageUrl = (path: string | undefined) => {
  if (!path) return '/default-avatar.png';
  if (path.startsWith('http')) return path;
  // const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://mesertehotelinformationmanagementsystem.onrender.com';
  return `${API_BASE}${path}`;
};

// FIX: Added darkMode and toggleDarkMode to interface to match Layout usage
interface HeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  notifications: any[];
  showNotifications: boolean;
  setShowNotifications: (v: boolean) => void;
  darkMode: boolean;       // Added
  toggleDarkMode: () => void; // Added
}

export default function Header({
  isSidebarOpen,
  toggleSidebar,
  notifications,
  showNotifications,
  setShowNotifications,
  darkMode,      // Destructured prop
  toggleDarkMode // Destructured prop
}: HeaderProps) {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const [isMounted, setIsMounted] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  // Removed local isDark state as it's now controlled by props

  const unreadCount = notifications.filter(n => !n.read).length;

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'am', name: 'Amharic', native: 'አማርኛ' },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <header className="sticky top-0 z-40 w-full flex items-center justify-between px-3 sm:px-6 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors h-16 sm:h-20">
      
      {/* LEFT: Toggle + Logo */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
          title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        >
          {isSidebarOpen ? <PanelLeftClose size={24} /> : <PanelLeftOpen size={24} />}
        </button>
         
        <div className="flex items-center min-w-0">
            <HotelLogo className="h-8 sm:h-10 w-auto origin-left" />
        </div>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-1 sm:gap-3 md:gap-4 ml-auto">

        {/* Language Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setLangOpen(!langOpen);
              setShowNotifications(false);
            }}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition font-medium text-gray-700 dark:text-gray-200"
          >
            <Globe size={20} className="text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline text-sm font-bold uppercase tracking-wider">
              {language === 'am' ? 'አማ' : 'ENG'}
            </span>
          </button>

          <AnimatePresence>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setLangOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-40 sm:w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 origin-top-right"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as 'en' | 'am');
                        setLangOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm font-medium transition flex items-center gap-3 ${
                        language === lang.code
                          ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {language === lang.code && <Check size={16} />}
                      <span className={language !== lang.code ? 'ml-7' : ''}>
                        {lang.native} 
                      </span>
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode} // Used prop function
          className="p-2 sm:p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-all text-gray-600 dark:text-gray-300 flex-shrink-0"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <motion.div
            key={darkMode ? 'moon' : 'sun'} // Used prop state
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {darkMode ? <Moon size={20} className="text-blue-300" /> : <Sun size={20} className="text-amber-500" />}
          </motion.div>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setLangOpen(false);
            }}
            className="relative p-2 sm:p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition text-gray-600 dark:text-gray-300"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 sm:top-2 sm:right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                 <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                 <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-[-45px] sm:right-0 mt-3 w-[85vw] sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 origin-top-right max-w-[350px]"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {/* FIX: Cast 'notifications' to any */}
                      {t('notifications' as any) || "Notifications"}
                    </h3>
                    {unreadCount > 0 && (
                        <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">
                            {unreadCount} New
                        </span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        {/* FIX: Cast 'allCaughtUp' to any */}
                        <p>{t('allCaughtUp' as any) || "No new notifications"}</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${!notif.read ? 'bg-amber-50/30 dark:bg-amber-900/10' : ''}`}>
                          <div className="flex justify-between items-start mb-1">
                              <p className="font-semibold text-sm text-gray-900 dark:text-white">{notif.title}</p>
                              <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{notif.time}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <Link 
                    href="/cashier/chat" 
                    onClick={() => setShowNotifications(false)}
                    className="block p-3 text-center text-sm font-semibold text-amber-600 dark:text-amber-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    {/* FIX: Cast 'viewAllMessages' to any */}
                    {t('viewAllMessages' as any) || "View All Messages"}
                  </Link>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <Menu as="div" className="relative ml-1 sm:ml-2">
            <Menu.Button className="flex items-center gap-1 p-1 pr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-amber-500">
              <img
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border-2 border-white dark:border-gray-600 shadow-sm"
                src={getImageUrl(user?.profileImage)}
                alt="User"
                onError={(e) => (e.currentTarget.src = '/default-avatar.png')}
              />
              <div className="hidden lg:block text-left mr-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{user?.firstName}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                  {/* FIX: Cast 'cashier' to any */}
                  {t('cashier' as any) || "Cashier"}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-gray-800 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden z-50">
                 <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <p className="font-bold text-gray-900 dark:text-white truncate">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                 </div>
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/cashier/settings"
                        className={`${active ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' : 'text-gray-700 dark:text-gray-200'} flex items-center gap-2 px-4 py-2 text-sm transition`}
                      >
                        <Settings size={16} />
                        {/* FIX: Cast 'settings' to any */}
                        {t('settings' as any) || "Settings"}
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={logout}
                        className={`${active ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'text-red-500 dark:text-red-400'} w-full text-left flex items-center gap-2 px-4 py-2 text-sm font-medium transition`}
                      >
                        <LogOut size={16} />
                        {/* FIX: Cast 'logout' to any */}
                        {t('logout' as any) || "Sign Out"}
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
        </Menu>
      </div>
    </header>
  );
}/*'use client';

import { Fragment, useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useLanguage } from '../../../../context/LanguageContext';
import { Menu, Transition } from '@headlessui/react';
import {
  Bell, Moon, Sun, LogOut,
  PanelLeftClose, PanelLeftOpen,
  ChevronDown, Check, Globe, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import HotelLogo from '../../../../components/HotelLogo';

const getImageUrl = (path: string | undefined) => {
  if (!path) return '/default-avatar.png';
  if (path.startsWith('http')) return path;
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  return `${API_BASE}${path}`;
};

interface HeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  notifications: any[];
  showNotifications: boolean;
  setShowNotifications: (v: boolean) => void;
}

export default function Header({
  isSidebarOpen,
  toggleSidebar,
  notifications,
  showNotifications,
  setShowNotifications
}: HeaderProps) {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const [isMounted, setIsMounted] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'am', name: 'Amharic', native: 'አማርኛ' },
  ];

  // --- DARK MODE LOGIC ---
  useEffect(() => {
    setIsMounted(true);
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  if (!isMounted) return null;

  return (
    <header className="sticky top-0 z-40 w-full flex items-center justify-between px-3 sm:px-6 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors h-16 sm:h-20">
      
     
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
          title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        >
          {isSidebarOpen ? <PanelLeftClose size={24} /> : <PanelLeftOpen size={24} />}
        </button>
         
       
        <div className="flex items-center min-w-[100px] sm:min-w-0">
            <HotelLogo className="h-8 sm:h-10 w-auto origin-left" />
        </div>
      </div>

    
      <div className="flex items-center gap-1 sm:gap-3 md:gap-4 ml-auto">

       
        <div className="relative">
          <button
            onClick={() => {
              setLangOpen(!langOpen);
              setShowNotifications(false);
            }}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition font-medium text-gray-700 dark:text-gray-200"
          >
            <Globe size={20} className="text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline text-sm font-bold uppercase tracking-wider">
              {language === 'am' ? 'አማ' : 'ENG'}
            </span>
          </button>

          <AnimatePresence>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setLangOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-40 sm:w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 origin-top-right"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as 'en' | 'am');
                        setLangOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm font-medium transition flex items-center gap-3 ${
                        language === lang.code
                          ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {language === lang.code && <Check size={16} />}
                      <span className={language !== lang.code ? 'ml-7' : ''}>
                        {lang.native} 
                      </span>
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        
        <button
          onClick={toggleDarkMode}
          className="p-2 sm:p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-all text-gray-600 dark:text-gray-300 flex-shrink-0"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <motion.div
            key={isDark ? 'moon' : 'sun'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {isDark ? <Moon size={20} className="text-blue-300" /> : <Sun size={20} className="text-amber-500" />}
          </motion.div>
        </button>

     
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setLangOpen(false);
            }}
            className="relative p-2 sm:p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition text-gray-600 dark:text-gray-300"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 sm:top-2 sm:right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                 <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                 <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-[-45px] sm:right-0 mt-3 w-[85vw] sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 origin-top-right max-w-[350px]"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {t('notifications') || "Notifications"}
                    </h3>
                    {unreadCount > 0 && (
                        <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">
                            {unreadCount} New
                        </span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>{t('allCaughtUp') || "No new notifications"}</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${!notif.read ? 'bg-amber-50/30 dark:bg-amber-900/10' : ''}`}>
                          <div className="flex justify-between items-start mb-1">
                              <p className="font-semibold text-sm text-gray-900 dark:text-white">{notif.title}</p>
                              <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{notif.time}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <Link 
                    href="/cashier/chat" 
                    onClick={() => setShowNotifications(false)}
                    className="block p-3 text-center text-sm font-semibold text-amber-600 dark:text-amber-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    {t('viewAllMessages') || "View All Messages"}
                  </Link>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

    
        <Menu as="div" className="relative ml-1 sm:ml-2">
            <Menu.Button className="flex items-center gap-1 p-1 pr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-amber-500">
              <img
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border-2 border-white dark:border-gray-600 shadow-sm"
                src={getImageUrl(user?.profileImage)}
                alt="User"
                onError={(e) => (e.currentTarget.src = '/default-avatar.png')}
              />
              <div className="hidden lg:block text-left mr-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{user?.firstName}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                  {t('cashier') || "Cashier"}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-gray-800 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden z-50">
                 <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <p className="font-bold text-gray-900 dark:text-white truncate">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                 </div>
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/cashier/settings"
                        className={`${active ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' : 'text-gray-700 dark:text-gray-200'} flex items-center gap-2 px-4 py-2 text-sm transition`}
                      >
                        <Settings size={16} />
                        {t('settings') || "Settings"}
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={logout}
                        className={`${active ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'text-red-500 dark:text-red-400'} w-full text-left flex items-center gap-2 px-4 py-2 text-sm font-medium transition`}
                      >
                        <LogOut size={16} />
                        {t('logout') || "Sign Out"}
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
        </Menu>
      </div>
    </header>
  );
}*/