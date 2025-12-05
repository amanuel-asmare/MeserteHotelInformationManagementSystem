'use client';
import { View } from 'react-native';

import { Fragment, useState, useEffect } from 'react';

import { useAuth } from '../../../../context/AuthContext';
import { Menu, Transition } from '@headlessui/react';
import { 
  Bell, Moon, Sun, LogOut, Menu as MenuIcon, X, 
  ChevronDown, Check, MessageSquare, PanelLeftClose, PanelLeftOpen 
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  darkMode: boolean;
  toggleDarkMode: () => void;
  notifications: any[];
  showNotifications: boolean;
  setShowNotifications: (v: boolean) => void;
}

export default function Header({ 
  isSidebarOpen, 
  toggleSidebar,
  darkMode,
  toggleDarkMode,
  notifications,
  showNotifications,
  setShowNotifications
}: HeaderProps) {
  const { user, logout } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-20 transition-colors h-20">
      
      {/* --- LEFT: TOGGLE & LOGO --- */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar} 
          className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        >
          {isSidebarOpen ? <PanelLeftClose size={24} /> : <PanelLeftOpen size={24} />}
        </button>

        {/* Dynamic Hotel Logo */}
        <HotelLogo className="scale-90 origin-left hidden sm:flex" />
      </div>

      {/* --- RIGHT: ACTIONS --- */}
      <div className="flex items-center gap-3">
        
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          title="Toggle Theme"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse border-2 border-white dark:border-gray-800">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 origin-top-right"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                  <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-bold">{unreadCount} New</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                       <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                       <p>No new notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex gap-3 ${!notif.read ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}
                      >
                        <div className={`w-2.5 h-2.5 mt-2 rounded-full flex-shrink-0 ${
                          notif.type === 'success' ? 'bg-green-500' : 
                          notif.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                        }`} />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{notif.title}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                          <p className="text-[10px] text-gray-400 mt-2">{notif.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <Link href="/cashier/chat" className="block p-3 text-center text-sm font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition">
                  View All Messages
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        {isMounted && (
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Cashier</p>
              </div>
              <img
                className="h-10 w-10 rounded-full object-cover ring-2 ring-amber-500 dark:ring-offset-gray-800"
                src={getImageUrl(user?.profileImage)}
                alt="Profile"
                onError={(e) => (e.currentTarget.src = '/default-avatar.png')}
              />
              <ChevronDown className="h-4 w-4 text-gray-400" />
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
              <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 focus:outline-none z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 md:hidden">
                   <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.firstName}</p>
                   <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/cashier/settings"
                        className={`${active ? 'bg-gray-50 dark:bg-gray-700' : ''} flex items-center gap-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 font-medium`}
                      >
                        <MessageSquare size={16}/> Settings & Profile
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={logout}
                        className={`${active ? 'bg-red-50 dark:bg-red-900/20' : ''} w-full text-left flex items-center gap-2 px-4 py-3 text-sm text-red-600 dark:text-red-400 font-bold`}
                      >
                        <LogOut size={16}/> Sign Out
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        )}
      </div>
    </header>
  );
}