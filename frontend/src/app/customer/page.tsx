// src/app/customer/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bed, Coffee, Star, MessageCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext'; // Adjust path if necessary

// --- TYPE DEFINITIONS (These remain the same) ---

interface Order {
  _id: string;
  orderedAt: string;
}
interface UnreadCount {
  sender: string;
  count: number;
}
interface Booking {
  _id: string;
  room: { roomNumber: string; };
  checkIn: string;
  checkOut: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}
interface Feedback {
  _id: string;
  rating: number;
  createdAt: string;
}

// The page component now only contains the logic for the dashboard itself.
export default function CustomerDashboardPage() {
  const { user, loading: authLoading } = useAuth();

  // State for dashboard-specific data
  const [stats, setStats] = useState({
    roomNumber: 'N/A',
    ordersToday: 0,
    unreadMessages: 0,
    ratingGiven: 'N/A' as string | number,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true); // Renamed from 'loading' for clarity

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // The data fetching logic remains the same, as it's specific to this page.
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      setStatsLoading(true);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        
        const bookingsRes = await fetch(`${API_URL}/api/bookings/my-bookings`, { credentials: 'include' });
        let currentRoomNumber = 'Not Assigned';
        if (bookingsRes.ok) {
          const bookings: Booking[] = await bookingsRes.json();
          const now = new Date();
          const activeBooking = bookings.find(b => {
            const checkIn = new Date(b.checkIn);
            const checkOut = new Date(b.checkOut);
            const startOfCheckIn = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
            return b.status === 'confirmed' && startOfCheckIn <= now && now < checkOut;
          });
          if (activeBooking) currentRoomNumber = activeBooking.room.roomNumber;
        }
        
        setStats(prev => ({ ...prev, roomNumber: currentRoomNumber }));

        const [ordersRes, messagesRes, feedbackRes] = await Promise.all([
          fetch(`${API_URL}/api/orders/my`, { credentials: 'include' }),
          fetch(`${API_URL}/api/chat/unread-counts`, { credentials: 'include' }),
          fetch(`${API_URL}/api/feedback/my`, { credentials: 'include' })
        ]);

        let ordersToday = 0;
        if (ordersRes.ok) {
          const orders: Order[] = await ordersRes.json();
          const today = new Date().toISOString().split('T')[0];
          ordersToday = orders.filter(o => o.orderedAt.startsWith(today)).length;
        }

        let unreadMessages = 0;
        if (messagesRes.ok) {
          const counts: UnreadCount[] = await messagesRes.json();
          unreadMessages = counts.reduce((sum, item) => sum + item.count, 0);
        }

        let latestRating: string | number = 'N/A';
        if (feedbackRes.ok) {
          const feedbackData = await feedbackRes.json();
          if (feedbackData.data.length > 0) {
            latestRating = feedbackData.data[0].rating.toFixed(1);
          }
        }
        
        setStats(prev => ({
          ...prev,
          ordersToday: ordersToday,
          unreadMessages: unreadMessages,
          ratingGiven: latestRating,
        }));
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    if (!authLoading && user) fetchDashboardData();
    else if (!authLoading && !user) setStatsLoading(false);
  }, [user, authLoading]);

  // Main page loader
  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 relative"
        >
          <div className="absolute inset-0 rounded-full border-8 border-amber-200"></div>
          <div className="absolute inset-0 rounded-full border-8 border-t-amber-600 border-r-amber-600 border-b-transparent border-l-transparent animate-spin"></div>
          <div className="absolute inset-4 bg-amber-600 rounded-full flex items-center justify-center">
            <Bed className="w-12 h-12 text-white" />
          </div>
        </motion.div>
      </div>
    );
  }

  const dashboardStats = [
    { icon: Bed, label: 'My Room', value: stats.roomNumber, color: 'blue' },
    { icon: Coffee, label: 'Orders Today', value: stats.ordersToday, color: 'green' },
    { icon: Star, label: 'Rating Given', value: stats.ratingGiven, color: 'amber' },
    { icon: MessageCircle, label: 'Messages', value: stats.unreadMessages, color: 'purple' },
  ];

  // The component now only returns the content that will be placed inside the layout's <main> tag.
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Welcome back, {user?.firstName}!
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Enjoy your stay at Meseret Hotel
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-${stat.color}-100 dark:bg-${stat.color}-900/30 mb-4`}>
              <stat.icon className={`text-${stat.color}-600 dark:text-${stat.color}-400`} size={28} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {statsLoading ? '...' : stat.value}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}/*// src/app/customer/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import CustomerNavbar from './layout/CustomerNavbar';
import CustomerSidebar from './layout/CustomerSidebar';
import CustomerFooter from '../manager/layout/Footer';
import { motion } from 'framer-motion';
import { Bed, Coffee, Star, MessageCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext'; // Adjust path if necessary

// --- TYPE DEFINITIONS FOR FETCHED DATA ---

interface Order {
  _id: string;
  orderedAt: string; // ISO date string
}

interface UnreadCount {
    sender: string;
    count: number;
}

interface Booking {
  _id: string;
  room: {
    roomNumber: string;
  };
  checkIn: string; // ISO date string
  checkOut: string; // ISO date string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

// ✅ NEW: Interface for the customer's own feedback
interface Feedback {
    _id: string;
    rating: number;
    createdAt: string;
}


export default function CustomerDashboard() {
  const { user, loading: authLoading } = useAuth();

  // State for dashboard-specific data
  const [stats, setStats] = useState({
    roomNumber: 'N/A',
    ordersToday: 0,
    unreadMessages: 0,
    ratingGiven: 'N/A' as string | number, // Type can be string or number
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // General page loading state
  const [loading, setLoading] = useState(true);

  // States for UI control
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      setStatsLoading(true);

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

        // --- Step 1: Fetch Bookings to find the active room (High Priority) ---
        const bookingsRes = await fetch(`${API_URL}/api/bookings/my-bookings`, { credentials: 'include' });
        let currentRoomNumber = 'Not Assigned';

        if (bookingsRes.ok) {
          const bookings: Booking[] = await bookingsRes.json();
          const now = new Date();
          
          const activeBooking = bookings.find(booking => {
              const checkInDate = new Date(booking.checkIn);
              const checkOutDate = new Date(booking.checkOut);
              const startOfCheckInDay = new Date(checkInDate.getFullYear(), checkInDate.getMonth(), checkInDate.getDate());
              return (
                  booking.status === 'confirmed' &&
                  startOfCheckInDay <= now &&
                  now < checkOutDate
              );
          });

          if (activeBooking) {
            currentRoomNumber = activeBooking.room.roomNumber;
          }
        } else {
            console.error("Failed to fetch bookings.");
        }
        
        setStats(prevStats => ({
            ...prevStats,
            roomNumber: currentRoomNumber,
        }));

        // --- Step 2: Fetch other secondary stats (Orders, Messages, and Feedback) ---
        const [ordersRes, messagesRes, feedbackRes] = await Promise.all([
          fetch(`${API_URL}/api/orders/my`, { credentials: 'include' }),
          fetch(`${API_URL}/api/chat/unread-counts`, { credentials: 'include' }),
          fetch(`${API_URL}/api/feedback/my`, { credentials: 'include' }) // ✅ FETCH FEEDBACK
        ]);

        let ordersTodayCount = 0;
        if (ordersRes.ok) {
          const orders: Order[] = await ordersRes.json();
          const today = new Date().toISOString().split('T')[0];
          ordersTodayCount = orders.filter(
            (order) => order.orderedAt.split('T')[0] === today
          ).length;
        } else {
            console.error("Failed to fetch orders.");
        }

        let unreadMessagesCount = 0;
        if (messagesRes.ok) {
          const unreadCounts: UnreadCount[] = await messagesRes.json();
          unreadMessagesCount = unreadCounts.reduce((total, item) => total + item.count, 0);
        } else {
            console.error("Failed to fetch message counts.");
        }
        
        // ✅ --- PROCESS FETCHED FEEDBACK --- ✅
        let latestRating: string | number = 'N/A';
        if (feedbackRes.ok) {
            const feedbackResponse = await feedbackRes.json();
            const feedbacks: Feedback[] = feedbackResponse.data; // Data is nested

            if (feedbacks.length > 0) {
                // Get rating from the most recent feedback and format it to one decimal place
                latestRating = feedbacks[0].rating.toFixed(1);
            }
        } else {
            console.error("Failed to fetch user feedback.");
        }

        // Update the rest of the stats
        setStats(prevStats => ({
            ...prevStats,
            ordersToday: ordersTodayCount,
            unreadMessages: unreadMessagesCount,
            ratingGiven: latestRating, // ✅ SET THE DYNAMIC RATING
        }));

      } catch (error) {
        console.error("An error occurred while fetching dashboard data:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchDashboardData();
    } else if (!authLoading && !user) {
        setStatsLoading(false);
    }

  }, [user, authLoading]);

  // Main page loader
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 relative"
        >
          <div className="absolute inset-0 rounded-full border-8 border-amber-200"></div>
          <div className="absolute inset-0 rounded-full border-8 border-t-amber-600 border-r-amber-600 border-b-transparent border-l-transparent animate-spin"></div>
          <div className="absolute inset-4 bg-amber-600 rounded-full flex items-center justify-center">
            <Bed className="w-12 h-12 text-white" />
          </div>
        </motion.div>
      </div>
    );
  }

  const dashboardStats = [
    { icon: Bed, label: 'My Room', value: stats.roomNumber, color: 'blue' },
    { icon: Coffee, label: 'Orders Today', value: stats.ordersToday, color: 'green' },
    { icon: Star, label: 'Rating Given', value: stats.ratingGiven, color: 'amber' },
    { icon: MessageCircle, label: 'Messages', value: stats.unreadMessages, color: 'purple' },
  ];

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${darkMode ? 'dark' : ''}`}>
      <CustomerNavbar
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
      />
      <div className="flex">
        <CustomerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6 lg:p-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Enjoy your stay at Meseret Hotel
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-${stat.color}-100 dark:bg-${stat.color}-900/30 mb-4`}>
                    <stat.icon className={`text-${stat.color}-600 dark:text-${stat.color}-400`} size={28} />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {statsLoading ? '...' : stat.value}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
      <CustomerFooter />
    </div>
  );
}*/