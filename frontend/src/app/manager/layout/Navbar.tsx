'use client';
import { Button } from 'react-native';


import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { Bell, Moon, Sun, LogOut, Menu, X, Check, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import HotelLogo from '../../../../components/HotelLogo'; // Import the dynamic logo

interface NavbarProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
  notifications?: any[];
  showNotifications?: boolean;
  setShowNotifications?: (v: boolean) => void;
}

export default function Navbar({
  onMenuToggle,
  isSidebarOpen,
  darkMode,
  toggleDarkMode,
  notifications = [],
  showNotifications = false,
  setShowNotifications = () => {},
}: NavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* --- LEFT SECTION (Logo & Toggle) --- */}
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar Toggle */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* DYNAMIC HOTEL LOGO */}
            {/* This sits in the corner and updates automatically based on Admin Settings */}
            <div className="flex items-center">
               <HotelLogo className="scale-90 origin-left" /> 
            </div>
          </div>

          {/* --- RIGHT SECTION (Actions) --- */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-yellow-400 transition shadow-sm"
              title="Toggle Theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications && setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition shadow-sm"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse border-2 border-white dark:border-gray-800">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 origin-top-right"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                      <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                        {unreadCount} New
                      </span>
                    </div>
                    
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                          <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                          <p>All caught up!</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition flex gap-3 ${
                              !notif.read ? 'bg-amber-50/60 dark:bg-amber-900/10' : ''
                            }`}
                          >
                            <div className={`w-2.5 h-2.5 mt-2 rounded-full flex-shrink-0 ${
                              notif.type === 'success' ? 'bg-green-500 shadow-green-500/50' : 
                              notif.type === 'warning' ? 'bg-amber-500 shadow-amber-500/50' : 
                              'bg-blue-500 shadow-blue-500/50'
                            } shadow-sm`} />
                            <div>
                              <p className={`text-sm font-semibold ${!notif.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                {notif.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                {notif.message}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-wide">
                                {notif.time}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <Link href="/manager/chat" className="block p-3 text-center text-sm font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition flex items-center justify-center gap-2">
                      <MessageSquare size={16} /> Open Communication Center
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mt-1">
                  Manager
                </p>
              </div>
              <div className="relative group cursor-pointer">
                <img
                  src={user?.profileImage || '/default-avatar.png'}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-offset-2 ring-amber-500 dark:ring-offset-gray-900 transition-all group-hover:scale-105"
                  onError={(e) => (e.currentTarget.src = '/default-avatar.png')}
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 rounded-lg transition-all font-bold"
              title="Sign Out"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}/*//src/app/manager/layout/Navbar.tsx
'use client';

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
