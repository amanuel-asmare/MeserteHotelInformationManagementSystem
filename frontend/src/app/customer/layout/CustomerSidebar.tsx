// src/app/customer/layout/CustomerSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Calendar, Coffee, MessageSquare, Settings, Star, X, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

// The menuItems array is updated to include subItems for Settings
const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/customer' },
  { icon: Calendar, label: 'My Bookings', href: '/customer/bookings' },
  { icon: Coffee, label: 'Order Food', href: '/customer/menu' },
  { icon: Star, label: 'Give Feedback', href: '/customer/feedback' },
  { icon: MessageSquare, label: 'Chat', href: '/customer/chat' },
  {
    icon: Settings,
    label: 'Settings',
    href: '/customer/settings', // Base href for parent active state
    subItems: [
      { label: 'Room Set', href: '/customer/settings/roomSet' },
      { label: 'Profile', href: '/customer/settings/profile' }
    ]
  },
];

export default function CustomerSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [isDesktop, setIsDesktop] = useState(false);
  
  // ✅ NEW STATE: Manages the open/closed state of the Settings dropdown.
  // It defaults to open if the current page is one of the settings sub-pages.
  const [isSettingsOpen, setIsSettingsOpen] = useState(pathname.startsWith('/customer/settings'));

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <>
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen || isDesktop ? 0 : -300 }}
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-xl lg:shadow-none border-r border-gray-200 dark:border-gray-700 pt-20 lg:pt-0 ${
          isOpen ? 'block' : 'hidden lg:block'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <h2 className="text-xl font-bold">Menu</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map(item => {
              const Icon = item.icon;
              
              // ✅ If the item has sub-items, render it as a dropdown button
              if (item.subItems) {
                const isSettingsActive = pathname.startsWith(item.href);
                return (
                  <div key={item.label}>
                    <button
                      onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all ${
                        isSettingsActive
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-semibold'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-300 ${isSettingsOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    
                    {/* Animate the presence of the sub-menu */}
                    <AnimatePresence>
                      {isSettingsOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden pl-8 pt-2"
                        >
                          <div className="space-y-2 border-l-2 border-gray-200 dark:border-gray-600">
                            {item.subItems.map(subItem => {
                              const subActive = pathname === subItem.href;
                              return (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  onClick={onClose}
                                  className={`block ml-4 pl-4 py-2 text-sm rounded-r-lg ${
                                    subActive
                                      ? 'text-amber-600 dark:text-amber-400 font-bold border-r-4 border-amber-500'
                                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                  }`}
                                >
                                  {subItem.label}
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              // ✅ Otherwise, render a normal link
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    active
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-semibold'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </motion.aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}