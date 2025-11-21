'use client';

import { useState, useEffect } from 'react';
import { Bell, Moon, Sun, LogOut, User, Menu, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../../context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

interface ReceptionNavbarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  isDarkMode: boolean; // Prop to receive dark mode state
  toggleDarkMode: () => void; // Prop to receive dark mode toggle function
}

export default function ReceptionNavbar({ toggleSidebar, isSidebarOpen, isDarkMode, toggleDarkMode }: ReceptionNavbarProps) {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const menuVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.15 } },
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Logo and Sidebar Toggle */}
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleSidebar}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 lg:hidden"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>

            {/* Logo */}
            <Link href="/reception" className="flex items-center space-x-2">
                <Image
                    src="/MHIMS_LOGO.png"
                    alt="Meseret Hotel Logo"
                    width={60}
                    height={60}
                    className="rounded-lg shadow-md flex-shrink-0"
                />
                <div className="hidden sm:block">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Meseret Hotel</h1>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Reception Dashboard</p>
                </div>
            </Link>
          </div>

          {/* Search */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search guests, rooms, reservations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 dark:text-white text-sm transition"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <div className="relative">
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold animate-pulse">3</span>
              </div>
            </motion.div>

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

            {/* User Menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <img
                  className="w-8 h-8 rounded-full ring-2 ring-amber-500"
                  src={user?.profileImage || '/default-avatar.png'}
                  alt="Profile"
                  width={32}
                  height={32}
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
                    <Link href="/admin/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                       Settings
                    </Link>
                    
                    <motion.button
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
}/*'use client';

import { useState, useEffect } from 'react';
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