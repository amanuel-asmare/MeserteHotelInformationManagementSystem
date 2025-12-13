'use client';

import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import Footer from '../../app/admin/Footer';
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mesertehotelinformationmanagementsystem.onrender.com';
export default function CashierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true); // Controls Desktop Collapse & Mobile Open
  const [isMobile, setIsMobile] = useState(false);
  
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // --- RESPONSIVE CHECK ---
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false); // Default closed on mobile
      } else {
        setSidebarOpen(true); // Default open on desktop
      }
    };
    
    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- DARK MODE LOGIC ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // --- FETCH NOTIFICATIONS ---
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/dashboard/notifications`, { withCredentials: true });
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to load notifications");
      }
    };

    if (user) {
        fetchNotifs();
        const interval = setInterval(fetchNotifs, 60000);
        return () => clearInterval(interval);
    }
  }, [user]);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      
      {/* --- SIDEBAR WRAPPER --- */}
      {/* Mobile: Fixed Overlay. Desktop: Relative Flow */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out
          ${isMobile 
              ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') // Mobile: Slide in/out
              : (isSidebarOpen ? 'translate-x-0' : '-translate-x-64')   // Desktop: Slide to hide (-64 is approx width) or usage of width transition
          }
          lg:relative lg:translate-x-0
          ${!isMobile && !isSidebarOpen ? 'lg:w-0 lg:overflow-hidden' : 'lg:w-64'}
        `}
      >
        <Sidebar isOpen={true} onClose={closeSidebar} isMobile={isMobile} />
      </div>

      {/* Mobile Overlay Backdrop */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm" 
          onClick={closeSidebar}
        />
      )}

      {/* --- MAIN CONTENT WRAPPER --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          notifications={notifications}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-gray-100 dark:bg-gray-900 transition-colors scroll-smooth">
          {children}
           <Footer/>
        </main>
       
      </div>
    </div>
  );
}