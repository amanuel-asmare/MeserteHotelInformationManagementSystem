'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bed, Coffee, Star, MessageCircle, Crown, Hotel } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import NewsFeed from '../../../components/NewsFeed';
import { useLanguage } from '../../../context/LanguageContext'; // Import Hook

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

export default function CustomerDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useLanguage(); // Use Translation Hook

  const [stats, setStats] = useState({
    roomNumber: 'N/A',
    ordersToday: 0,
    unreadMessages: 0,
    ratingGiven: 'N/A' as string | number,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [minTimePassed, setMinTimePassed] = useState(false);

  // MINIMUM 4.5 SECONDS OF LUXURY
  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), 4500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      setStatsLoading(true);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

        const bookingsRes = await fetch(`${API_URL}/api/bookings/my-bookings`, { credentials: 'include' });
        let currentRoomNumber = t('notAssigned'); // Use Translation Default
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

        // Only update if it's actually assigned, otherwise keep translated default
        if (currentRoomNumber !== 'Not Assigned' && currentRoomNumber !== 'N/A') {
             setStats(prev => ({ ...prev, roomNumber: currentRoomNumber }));
        } else {
             setStats(prev => ({ ...prev, roomNumber: t('notAssigned') }));
        }

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
          ordersToday,
          unreadMessages,
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
  }, [user, authLoading, t]); // Add t as dependency

  // ROYAL LOADING SCREEN — SAME AS BOOKING & MENU
  if (!minTimePassed || authLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-amber-950 via-black to-amber-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-amber-950/50 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15),transparent_70%)]" />

          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -100, 0], x: [0, Math.sin(i) * 100, 0], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 8 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
              className="absolute w-96 h-96 bg-gradient-to-r from-yellow-400/20 to-orange-600/20 rounded-full blur-3xl"
              style={{ top: `${20 + i * 10}%`, left: i % 2 === 0 ? "-20%" : "80%" }}
            />
          ))}
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5, ease: "easeOut" }} className="relative z-10 text-center px-8">
          {/* 3D Golden Logo */}
          <motion.div
            animate={{ rotateY: [0, 360], scale: [1, 1.15, 1] }}
            transition={{ rotateY: { duration: 20, repeat: Infinity, ease: "linear" }, scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }}}
            className="relative mx-auto w-64 h-64 mb-12 perspective-1000"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-orange-600 shadow-2xl ring-8 ring-yellow-400/30" />
            <div className="absolute inset-8 rounded-full bg-gradient-to-tr from-amber-950 to-black flex items-center justify-center shadow-inner">
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="text-8xl font-black text-yellow-400 tracking-widest drop-shadow-2xl"
                style={{ textShadow: "0 0 60px rgba(251,191,36,0.9)" }}
              >
                MH
              </motion.div>
            </div>
            <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -top-10 left-1/2 -translate-x-1/2 text-yellow-300">
              <Crown size={60} />
            </motion.div>
          </motion.div>

          {/* Letter-by-letter MESERET */}
          <div className="flex justify-center gap-3 mb-6">
            {["M","E","S","E","R","E","T"].map((letter, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 100, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 1 + i * 0.15, duration: 0.8, ease: "easeOut" }}
                className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500"
                style={{ textShadow: "0 0 80px rgba(251,191,36,0.9), 0 10px 30px rgba(0,0,0,0.5)", fontFamily: "'Playfair Display', serif" }}
              >
                {letter}
              </motion.span>
            ))}
          </div>

          <motion.h2 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.5, duration: 1.2 }} className="text-5xl md:text-7xl font-bold text-amber-300 tracking-wider mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            {t('luxuryHotel')}
          </motion.h2>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.2, duration: 1.5 }} className="text-2xl text-amber-100 font-light tracking-widest">
            {t('welcomeHome')}, {user?.firstName || t('guest')}
          </motion.p>

          <div className="mt-20 w-96 mx-auto">
            <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-amber-600/50 backdrop-blur-xl">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 shadow-2xl relative overflow-hidden"
              >
                <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              </motion.div>
            </div>
            <motion.div animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 3, repeat: Infinity }} className="text-center mt-8 text-2xl font-medium text-amber-200 tracking-wider">
              {t('preparingWelcome')}
            </motion.div>
          </div>

          <motion.div className="absolute top-32 left-10 text-amber-300/60" animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
            <Hotel size={80} />
          </motion.div>
          <motion.div className="absolute bottom-40 right-16 text-yellow-300/60" animate={{ y: [0, -30, 0] }} transition={{ duration: 6, repeat: Infinity }}>
            <Coffee size={70} />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const dashboardStats = [
    { icon: Bed, label: t('myRoom'), value: stats.roomNumber, color: 'blue' },
    { icon: Coffee, label: t('ordersToday'), value: stats.ordersToday, color: 'green' },
    { icon: Star, label: t('ratingGiven'), value: stats.ratingGiven, color: 'amber' },
    { icon: MessageCircle, label: t('messages'), value: stats.unreadMessages, color: 'purple' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
        {t('welcomeBack')}, <span className="text-amber-600">{user?.firstName}!</span>
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-10">
        {t('delightedHaveYou')} <span className="font-semibold text-amber-600">{t('meseretHotel')}</span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {dashboardStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.6 }}
            whileHover={{ y: -12, scale: 1.05 }}
            className="relative bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-amber-200 dark:border-amber-800 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent dark:from-amber-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 shadow-lg mb-5`}>
              <stat.icon className="text-white" size={32} />
            </div>

            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">
              {statsLoading ? '...' : stat.value}
            </p>

            {stat.label === t('myRoom') && stat.value !== 'N/A' && stat.value !== t('notAssigned') && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className="absolute -top-3 -right-3">
                <Crown className="text-amber-500" size={40} />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      <div><NewsFeed /></div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-12 text-center">
        <p className="text-xl text-amber-600 dark:text-amber-400 font-medium italic">
          {t('luxuryRedefined')}
        </p>
      </motion.div>
    </motion.div>
  );
}
/*// src/app/customer/dashboard/page.tsx
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
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';
        
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
}*/