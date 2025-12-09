/*// src/app/manager/rooms/ClientWrapper.tsx
'use client';

import { useState } from 'react';
import ManagerRoomStatusClient from './ManagerRoomStatusClient';
import Navbar from '../layout/Navbar';
import Sidebar from '../layout/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClientWrapper() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: '1', title: 'Room 304 Cleaned', message: 'Housekeeping completed', time: '5 min ago', type: 'success', read: false },
    { id: '2', title: 'Maintenance Request', message: 'AC not working in 205', time: '1 hour ago', type: 'warning', read: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 dark:bg-gray-900 flex">
      {/* SIDEBAR - MOBILE & DESKTOP /}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 1024) && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`
              fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 
              shadow-xl lg:shadow-none border-r border-gray-200 dark:border-gray-700 
              pt-20 lg:pt-0
              ${sidebarOpen ? 'block' : 'hidden lg:block'}
            `}
          >
            <Sidebar activePath="/manager/rooms" />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT /}
      <div className="flex-1 flex flex-col">
        <Navbar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          isSidebarOpen={sidebarOpen}
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode(!darkMode)}
          notifications={notifications}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
        />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <ManagerRoomStatusClient />
        </main>
      </div>

      {/* MOBILE OVERLAY /}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}*/
'use client';
import ManagerRoomStatusClient from './ManagerRoomStatusClient';

export default function ClientWrapper() {

  return (
    <>
      <ManagerRoomStatusClient />
    </>
  );
}