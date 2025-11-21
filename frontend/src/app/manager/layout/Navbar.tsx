/*//src/app/manager/layout/Navbar.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../..../../../../context/AuthContext';
import { Bell, Moon, Sun, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
  notifications: any[];
  showNotifications: boolean;
  setShowNotifications: (v: boolean) => void;
}

export default function Navbar({
  onMenuToggle,
  isSidebarOpen,
  darkMode,
  toggleDarkMode,
  notifications,
  showNotifications,
  setShowNotifications,
}: NavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left 
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                M
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Manager Portal</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Meseret Hotel</p>
              </div>
            </div>
          </div>

          {/* Right 
          <div className="flex items-center gap-3">
            {/* Dark Mode 
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {darkMode ? <Sun className="text-yellow-500" size={20} /> : <Moon className="text-gray-600" size={20} />}
            </button>

            {/* Notifications 
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
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
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-gray-500 dark:text-gray-400">No new notifications</p>
                      ) : (
                        notifications.map(notif => (
                          <div
                            key={notif.id}
                            className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${!notif.read ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                notif.type === 'success' ? 'bg-green-500' :
                                notif.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                              }`}></div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-white text-sm">{notif.title}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{notif.time}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 text-center">
                      <button className="text-sm text-amber-600 dark:text-amber-400 font-medium hover:underline">
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile 
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Manager</p>
              </div>
              <img
                src={user?.profileImage || '/default-avatar.png'}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500"
              />
            </div>

            {/* LOGOUT - NOW VISIBLE ON MOBILE 
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium sm:px-4 sm:py-2"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}*/// src/app/manager/layout/Navbar.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { Bell, Moon, Sun, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
  notifications?: any[];           // ← Optional
  showNotifications?: boolean;     // ← Optional
  setShowNotifications?: (v: boolean) => void; // ← Optional
}

export default function Navbar({
  onMenuToggle,
  isSidebarOpen,
  darkMode,
  toggleDarkMode,
  notifications = [],           // ← Default empty array
  showNotifications = false,    // ← Default false
  setShowNotifications = () => {}, // ← No-op
}: NavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  // SAFE: notifications is always an array
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                M
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Manager Portal</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Meseret Hotel</p>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Dark Mode */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {darkMode ? <Sun className="text-yellow-500" size={20} /> : <Moon className="text-gray-600" size={20} />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
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
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-gray-500 dark:text-gray-400">No new notifications</p>
                      ) : (
                        notifications.map(notif => (
                          <div
                            key={notif.id}
                            className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${!notif.read ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                notif.type === 'success' ? 'bg-green-500' :
                                notif.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                              }`}></div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-white text-sm">{notif.title}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{notif.time}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 text-center">
                      <button className="text-sm text-amber-600 dark:text-amber-400 font-medium hover:underline">
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Manager</p>
              </div>
              <img
                src={user?.profileImage || '/default-avatar.png'}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500"
              />
            </div>

            {/* LOGOUT */}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium sm:px-4 sm:py-2"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}