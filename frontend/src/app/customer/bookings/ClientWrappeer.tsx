// src/app/customer/bookings/ClientWrapper.tsx
'use client';

import { useState } from 'react';
import CustomerBookingClient from './CustomerBookingClient';
import CustomerNavbar from '../layout/CustomerNavbar';
import CustomerSidebar from '../layout/CustomerSidebar';
import CustomerFooter from '../layout/CustomerFooter';

export default function ClientWrapper() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 dark:bg-gray-900 ${darkMode ? 'dark' : ''}`}>
      <CustomerNavbar
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
      />
      <div className="flex">
        <CustomerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6 lg:p-8">
          <CustomerBookingClient />
        </main>
      </div>
      <CustomerFooter />
    </div>
  );
}