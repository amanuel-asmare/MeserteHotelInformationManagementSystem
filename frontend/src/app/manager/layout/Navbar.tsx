'use client';
import { useState } from 'react';
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
  Trash2 // ✅ Added Trash icon for dismissal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import HotelLogo from '../../../../components/HotelLogo';

interface NavbarProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
  notifications?: any[];
  showNotifications?: boolean;
  setShowNotifications?: (v: boolean) => void;
  onDismiss?: (id: string) => void; // ✅ New Prop for permanent removal
}

export default function Navbar({
  onMenuToggle,
  isSidebarOpen,
  darkMode,
  toggleDarkMode,
  notifications = [],
  showNotifications = false,
  setShowNotifications = () => {},
  onDismiss = () => {}, // ✅ Default empty function
}: NavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();

  const [langOpen, setLangOpen] = useState(false);

  // Since backend now only sends unread notifications, we use length directly
  const unreadCount = notifications.length;

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'am', name: 'Amharic', native: 'አማርኛ' },
  ];

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* LEFT: Logo + Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="flex items-center">
              <HotelLogo className="h-12 w-auto scale-95 origin-left" />
            </div>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-3">

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300 font-medium"
              >
                <Globe size={20} />
                <span className="hidden sm:inline text-sm uppercase tracking-wider">
                  {language === 'am' ? 'አማ' : 'ENG'}
                </span>
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code as 'en' | 'am');
                          setLangOpen(false);
                        }}
                        className={`w-full text-left px-5 py-3 text-sm font-medium transition flex items-center gap-3 ${
                          language === lang.code
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {language === lang.code && <Check size={16} className="text-amber-600" />}
                        <span className="ml-2">
                          <span className="block font-bold">{lang.native}</span>
                          <span className="text-xs opacity-70">{lang.name}</span>
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-yellow-400 transition shadow-sm"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition shadow-sm"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse border-2 border-white dark:border-gray-800">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 origin-top-right"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                        {t('notifications' as any) || "Notifications"}
                      </h3>
                      {unreadCount > 0 && (
                        <span className="text-xs bg-amber-600 text-white px-3 py-1 rounded-full font-bold">
                          {unreadCount} {t('new' as any) || "New"}
                        </span>
                      )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                          <Bell className="w-16 h-16 mx-auto mb-4 opacity-20" />
                          <p className="font-medium">{t('allCaughtUp' as any) || "All caught up!"}</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => onDismiss(notif.id)} // ✅ Mark as read on click
                            className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition flex gap-4 cursor-pointer group"
                          >
                            <div className={`w-3 h-3 mt-1.5 rounded-full flex-shrink-0 ${
                              notif.type === 'success' ? 'bg-green-500' :
                              notif.type === 'warning' ? 'bg-amber-500' :
                              'bg-blue-500'
                            } shadow-lg`} />
                            
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <p className="font-bold text-sm text-gray-900 dark:text-white">
                                  {notif.title}
                                </p>
                                {/* ✅ Permanent Dismissal Button */}
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDismiss(notif.id);
                                  }}
                                  className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                                {notif.message}
                              </p>
                              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 uppercase tracking-wider font-medium">
                                {notif.time || 'Recently'}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <Link
                      href="/manager/chat"
                      className="block p-4 text-center font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition text-sm flex items-center justify-center gap-2 border-t dark:border-gray-700"
                    >
                      <MessageSquare size={18} />
                      {t('openCommunicationCenter' as any) || "Open Communication Center"}
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider mt-1">
                  {t('manager') || "Manager"}
                </p>
              </div>
              <div className="relative">
                <img
                  src={user?.profileImage || '/default-avatar.png'}
                  alt="Profile"
                  className="w-11 h-11 rounded-full object-cover ring-4 ring-amber-500/20"
                  onError={(e) => (e.currentTarget.src = '/default-avatar.png')}
                />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl transition-all font-bold text-sm"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">{t('logout') || "Logout"}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}/*'use client';


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
          
          
          <div className="flex items-center gap-4">
           
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

           
            <div className="flex items-center">
               <HotelLogo className="scale-90 origin-left" /> 
            </div>
          </div>

    
          <div className="flex items-center gap-3 sm:gap-4">
            
     
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-yellow-400 transition shadow-sm"
              title="Toggle Theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            
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
}*/