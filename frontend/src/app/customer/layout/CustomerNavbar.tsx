'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { useLanguage } from '../../../../context/LanguageContext'; // ✅ Import Language Hook
import { Bell, Moon, Sun, LogOut, Menu, X, Globe } from 'lucide-react'; // ✅ Added Globe
import { motion, AnimatePresence } from 'framer-motion';
import HotelLogo from '../../../../components/HotelLogo';
interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
}

interface NavbarProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
  notifications: Notification[];
  showNotifications: boolean;
  setShowNotifications: (v: boolean) => void;
}

export default function CustomerNavbar({ 
  onMenuToggle, 
  isSidebarOpen, 
  darkMode, 
  toggleDarkMode,
  notifications,
  showNotifications,
  setShowNotifications 
}: NavbarProps) {
  
  const { user, logout } = useAuth();
  
  // ✅ Language State
  const { language, setLanguage } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'am', name: 'Amharic (አማርኛ)' },
  ];

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Logo & Toggle */}
          <div className="flex items-center gap-4">
          
            <div className="flex items-center gap-3">
             
          {/* Left: Logo & Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-600 dark:text-gray-300"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            {/* ✅ REPLACED STATIC LOGO WITH DYNAMIC COMPONENT */}
            <HotelLogo className="scale-90 origin-left" />
            {/*<p className="text-xs text-gray-500 dark:text-gray-400">Welcome, {user?.firstName}</p>*/}
          </div>
             
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* ✅ 1. LANGUAGE SWITCHER */}
            <div className="relative">
              <button 
                onClick={() => setLangOpen(!langOpen)} 
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-600 dark:text-gray-300"
              >
                <Globe size={20} />
                <span className="hidden sm:inline text-sm font-medium uppercase">
                  {language}
                </span>
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                  >
                    <div className="py-1">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code as 'en' | 'am');
                            setLangOpen(false);
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                            language === lang.code 
                              ? 'text-amber-600 font-bold bg-amber-50 dark:bg-amber-900/20' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {darkMode ? <Sun className="text-yellow-400" size={20} /> : <Moon className="text-gray-600" size={20} />}
            </button>

            {/* 3. Notifications */}
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
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                      <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30"/>
                            <p className="text-sm">No new notifications</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${!n.read ? 'bg-amber-50 dark:bg-amber-900/10' : ''}`}
                          >
                            <div className="flex gap-3">
                                <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${n.type === 'success' ? 'bg-green-500' : n.type === 'warning' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                <div>
                                    <p className="font-medium text-sm text-gray-900 dark:text-white">{n.title}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{n.message}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                                </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 4. Profile & Logout */}
            <div className="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-gray-700 ml-2">
              <img
                src={user?.profileImage || '/default-avatar.png'}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-500/50"
                onError={(e) => (e.currentTarget.src = '/default-avatar.png')}
              />
              <button
                onClick={logout}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg transition-all font-medium"
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