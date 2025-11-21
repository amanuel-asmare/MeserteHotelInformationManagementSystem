// src/app/customer/layout/CustomerNavbar.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { Bell, Moon, Sun, LogOut, Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function CustomerNavbar({ onMenuToggle, isSidebarOpen, darkMode, toggleDarkMode }: NavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'Order Delivered', message: 'Your Injera & Tibs has arrived!', time: '2 min ago', read: false },
    { id: 2, title: 'New Menu', message: 'Try our fresh Buna & Doro Wat!', time: '1 hour ago', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                H
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Meseret Hotel</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Welcome, {user?.firstName}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {darkMode ? <Sun className="text-yellow-500" size={20} /> : <Moon className="text-gray-600" size={20} />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Bell size={20} className="text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-4 border-b">
                      <h3 className="font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className={`p-3 border-b hover:bg-gray-50 dark:hover:bg-gray-700 ${!n.read ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}>
                          <p className="font-medium text-sm">{n.title}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{n.message}</p>
                          <p className="text-xs text-gray-500">{n.time}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={user?.profileImage || '/default-avatar.png'}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500"
              />
              <button
                onClick={logout}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}