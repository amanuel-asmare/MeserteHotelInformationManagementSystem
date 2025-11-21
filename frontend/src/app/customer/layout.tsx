// src/app/customer/layout.tsx
'use client';

import { useState, useEffect, ReactNode } from 'react';
import CustomerNavbar from './layout/CustomerNavbar';
import CustomerSidebar from './layout/CustomerSidebar';
import CustomerFooter from '../manager/layout/Footer'; // Assuming this path is correct

// This component defines the shared layout for all customer pages
export default function CustomerLayout({ children }: { children: ReactNode }) {
  // State for managing the UI is now handled by the layout, not individual pages
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Effect to toggle dark mode class on the main html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${darkMode ? 'dark' : ''}`}>
      {/* The Navbar is part of the layout and will appear on all customer pages */}
      <CustomerNavbar
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
      />
      <div className="flex">
        {/* The Sidebar is also part of the layout */}
        <CustomerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* The 'main' tag is where the content of individual pages will be rendered */}
        <main className="flex-1 p-6 lg:p-8">
          {children} {/* 'children' will be page.tsx (e.g., your dashboard content) */}
        </main>
      </div>
      
      {/* The Footer is the final part of the shared layout */}
      <CustomerFooter />
    </div>
  );
}