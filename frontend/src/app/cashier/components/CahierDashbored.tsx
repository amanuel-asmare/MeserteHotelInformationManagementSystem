'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../lib/api';
import RecentTransactionsTable from './RecentTransactionsTable';
import { BanknotesIcon, ClockIcon, CheckCircleIcon, ArrowUturnLeftIcon} from '@heroicons/react/24/outline';
import { Crown } from 'lucide-react';
import NewsFeed from '../../../../components/NewsFeed';
import { useLanguage } from '../../../../context/LanguageContext'; // Import Language Hook

const StatCard = ({ title, value, icon, color, loading }) => {
  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur p-8 rounded-2xl shadow-xl animate-pulse border border-amber-200">
        <div className="h-8 bg-amber-200 rounded w-3/4 mb-4"></div>
        <div className="h-12 bg-amber-300 rounded w-1/2"></div>
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -10, scale: 1.03 }}
      className="relative overflow-hidden bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-3xl shadow-2xl border border-amber-300 dark:border-amber-700"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-transparent" />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-300">{title}</p>
          <p className="text-4xl font-black text-gray-900 dark:text-white mt-3">
            {value}
          </p>
        </div>
        <div className={`p-5 rounded-2xl ${color.replace('border', 'bg').replace('-500', '-100')} shadow-lg`}>
          {icon}
        </div>
      </div>
      {(title.includes("Revenue") || title.includes("ገቢ")) && value !== "ETB 0.00" && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-4 -right-4">
          <Crown className="w-16 h-16 text-amber-500 drop-shadow-xl" />
        </motion.div>
      )}
    </motion.div>
  );
};

export default function CashierDashboard() {
  const { t } = useLanguage(); // Initialize hook
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [minTimePassed, setMinTimePassed] = useState(false);

  // Minimum 4.5 seconds of luxury loading
  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), 4500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/dashboard/cashier');
        setDashboardData(data);
      } catch (err) {
        console.error("Failed to fetch cashier data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(amount || 0);

  // ROYAL LOADING SCREEN
  if (loading || !minTimePassed) {
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
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5 }} className="relative z-10 text-center px-8">
          {/* 3D Golden Logo */}
          <motion.div
            animate={{ rotateY: [0, 360], scale: [1, 1.15, 1] }}
            transition={{ rotateY: { duration: 20, repeat: Infinity, ease: "linear" }, scale: { duration: 8, repeat: Infinity } }}
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
              <Crown className="w-16 h-16" />
            </motion.div>
          </motion.div>

          <div className="flex justify-center gap-3 mb-6">
            {["M", "E", "S", "E", "R", "E", "T"].map((letter, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 100, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 1 + i * 0.15, duration: 0.8 }}
                className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500"
                style={{ textShadow: "0 0 80px rgba(251,191,36,0.9)", fontFamily: "'Playfair Display', serif" }}
              >
                {letter}
              </motion.span>
            ))}
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 1.2 }}
            className="text-5xl md:text-7xl font-bold text-amber-300 tracking-wider mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t('cashierPortal').toUpperCase()} {/* "CASHIER PANEL" equivalent */}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.2, duration: 1.5 }}
            className="text-2xl text-amber-100 font-light tracking-widest"
          >
            {t('managingFinances')} {/* "Managing Finances with Royal Precision" */}
          </motion.p>

          <div className="mt-20 w-96 mx-auto">
            <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-amber-600/50 backdrop-blur-xl">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 shadow-2xl relative overflow-hidden"
              >
                <motion.div
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
              </motion.div>
            </div>
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-center mt-8 text-2xl font-medium text-amber-200 tracking-wider"
            >
              {t('loadingFinancialOverview')}...
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // MAIN DASHBOARD CONTENT
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-gray-900 dark:to-black p-6 lg:p-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.h1
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t('cashierDashboard').toUpperCase()}
          </motion.h1>
          <p className="text-xl text-amber-700 dark:text-amber-300 font-medium">
            {t('financialControlCenter')} • {t('meseretHotel')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <StatCard
            title={t('todaysRevenue')}
            value={formatCurrency(dashboardData?.stats.revenue)}
            icon={<BanknotesIcon className="h-12 w-12 text-green-600" />}
            color="border-green-500"
            loading={loading}
          />
          <StatCard
            title={t('pendingPayments')}
            value={dashboardData?.stats.pending || 0}
            icon={<ClockIcon className="h-12 w-12 text-yellow-600" />}
            color="border-yellow-500"
            loading={loading}
          />
          <StatCard
            title={t('completedToday')}
            value={dashboardData?.stats.completed || 0}
            icon={<CheckCircleIcon className="h-12 w-12 text-blue-600" />}
            color="border-blue-500"
            loading={loading}
          />
          <StatCard
            title={t('refundsToday')}
            value={dashboardData?.stats.refunds || 0}
            icon={<ArrowUturnLeftIcon className="h-12 w-12 text-red-600" />}
            color="border-red-500"
            loading={loading}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-amber-200 p-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <BanknotesIcon className="w-10 h-10 text-amber-600" />
            {t('recentTransactions')}
          </h2>
          <RecentTransactionsTable transactions={dashboardData?.transactions || []} loading={loading} />
          
          
          </motion.div>
        <div><NewsFeed/></div>
        <div className="text-center mt-12 text-amber-700 dark:text-amber-400 font-medium text-lg italic">
          "{t('transactionQuote')}"
        </div>
      </motion.div>
    </div>
  );
}
/*// frontend/src/app/cashier/components/CahierDashbored.tsx
'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import RecentTransactionsTable from './RecentTransactionsTable';
import {
    BanknotesIcon,
    ClockIcon,
    CheckCircleIcon,
    ArrowUturnLeftIcon,
} from '@heroicons/react/24/outline';

// --- Improved StatCard Component ---
const StatCard = ({ title, value, icon, color, loading }) => {
    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2"></div>
            </div>
        );
    }

    return (
        <div className={`bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center space-x-4 border-l-4 ${color}`}>
            <div className={`p-3 rounded-full ${color.replace('border', 'bg').replace('-500', '-100')}`}>
               {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
            </div>
        </div>
    );
};


// --- Main Dashboard Component ---
export default function CashierDashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // ✅ SINGLE API CALL to our new efficient endpoint
                const { data } = await api.get('/api/dashboard/cashier');
                setDashboardData(data);
                setError(null); // Clear previous errors
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setError("Could not load dashboard data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (error) {
        return (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md" role="alert">
                <p className="font-bold">An Error Occurred</p>
                <p>{error}</p>
            </div>
        );
    }
    
    // Currency formatter for consistency
    const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(amount);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
                Cashier Dashboard
            </h1>
            
            {/* --- Stats Grid --- /}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                    title="Today's Revenue" 
                    value={loading ? '...' : formatCurrency(dashboardData?.stats.revenue || 0)} 
                    icon={<BanknotesIcon className="h-7 w-7 text-green-500" />}
                    color="border-green-500"
                    loading={loading} 
                />
                <StatCard 
                    title="Pending Payments" 
                    value={loading ? '...' : dashboardData?.stats.pending || 0} 
                    icon={<ClockIcon className="h-7 w-7 text-yellow-500" />}
                    color="border-yellow-500"
                    loading={loading}
                />
                <StatCard 
                    title="Completed Today" 
                    value={loading ? '...' : dashboardData?.stats.completed || 0} 
                    icon={<CheckCircleIcon className="h-7 w-7 text-blue-500" />}
                    color="border-blue-500"
                    loading={loading}
                />
                <StatCard 
                    title="Refunds Issued Today" 
                    value={loading ? '...' : dashboardData?.stats.refunds || 0} 
                    icon={<ArrowUturnLeftIcon className="h-7 w-7 text-red-500" />}
                    color="border-red-500"
                    loading={loading}
                />
            </div>

            {/* --- Recent Transactions Table --- /}
            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Transactions</h2>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <RecentTransactionsTable 
                        transactions={dashboardData?.transactions || []} 
                        loading={loading} 
                    />
                </div>
            </div>
        </div>
    );
}*/