'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BedDouble, TrendingUp, Utensils, Users,
  Clock, DollarSign, Activity, ArrowUpRight, MoreHorizontal, Crown
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import NewsFeed from '../../../components/NewsFeed';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';
const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];

// Reusable Components
const StatCard = ({ title, value, subValue, icon, color, trend }: any) => (
  <motion.div
    whileHover={{ y: -5 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-full"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color} text-white shadow-lg`}>
        {icon}
      </div>
      {trend && (
        <span className="flex items-center text-xs font-bold px-2 py-1 rounded-full text-green-600 bg-green-50 border border-green-100">
          <ArrowUpRight size={14} className="mr-1" />
          {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-gray-500 text-sm font-bold uppercase tracking-wide mb-1">{title}</p>
      <h3 className="text-3xl font-black text-gray-800 tracking-tight">{value}</h3>
      {subValue && <p className="text-sm text-gray-400 mt-2 font-medium">{subValue}</p>}
    </div>
  </motion.div>
);

const QuickLink = ({ title, desc, icon, color, href }: any) => (
  <Link href={href} className="block h-full">
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${color} p-6 rounded-3xl text-white shadow-xl cursor-pointer h-full flex flex-col justify-center relative overflow-hidden`}
    >
      <div className="absolute -bottom-4 -right-4 opacity-20 transform rotate-12 scale-150">
        {icon}
      </div>
      <div className="relative z-10 flex items-center gap-4">
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="text-white/80 text-xs">{desc}</p>
        </div>
      </div>
    </motion.div>
  </Link>
);

export default function ManagerDashboard() {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    occupiedRooms: 0,
    totalRooms: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    staffOnDuty: 0,
    recentOrders: []
  });

  const [loading, setLoading] = useState(true);
  const [showRoyalLoading, setShowRoyalLoading] = useState(true);

  // Royal entrance timer
  useEffect(() => {
    const timer = setTimeout(() => setShowRoyalLoading(false), 5200);
    return () => clearTimeout(timer);
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/dashboard/manager`, { withCredentials: true });
        setStats(res.data);
      } catch (err) {
        console.error("Error loading manager stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // === ALL HOOKS ARE UNCONDITIONAL — NO MORE REACT HOOK ERRORS ===
  const occupancyRate = stats.totalRooms > 0
    ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100)
    : 0;

  const revenueData = useMemo(() => [
    { name: language === 'am' ? '8:00' : '8am', value: stats.totalRevenue * 0.1 },
    { name: language === 'am' ? '10:00' : '10am', value: stats.totalRevenue * 0.2 },
    { name: language === 'am' ? '12:00' : '12pm', value: stats.totalRevenue * 0.5 },
    { name: language === 'am' ? '2:00' : '2pm', value: stats.totalRevenue * 0.6 },
    { name: language === 'am' ? '4:00' : '4pm', value: stats.totalRevenue * 0.8 },
    { name: t('now') || (language === 'am' ? 'Now' : 'Now'), value: stats.totalRevenue },
  ], [stats.totalRevenue, t, language]);

  const orderStatusData = useMemo(() => [
    { name: t('pending') || 'Pending', value: stats.pendingOrders },
    { name: t('completed') || 'Completed', value: 12 },
    { name: t('cancelled') || 'Cancelled', value: 2 },
  ], [stats.pendingOrders, t]);

  // === ROYAL LOADING SCREEN ===
  if (loading || showRoyalLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-amber-950 via-black to-amber-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-amber-950/80 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.35),transparent_70%)]" />
          
          {/* Floating Golden Orbs */}
          {[...Array(24)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -400, 0],
                x: [0, Math.sin(i) * 400, 0],
                opacity: [0, 1, 0],
                scale: [0.3, 2, 0.3]
              }}
              transition={{
                duration: 18 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.6
              }}
              className="absolute w-96 h-96 bg-gradient-to-r from-yellow-400/40 via-orange-600/30 to-transparent rounded-full blur-3xl"
              style={{
                top: `${5 + i * 4}%`,
                left: i % 2 === 0 ? "-40%" : "100%"
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          className="relative z-10 text-center px-8 max-w-6xl"
        >
          {/* Crown + MH Logo */}
          <motion.div
            animate={{ rotateY: [0, 360], scale: [1, 1.25, 1] }}
            transition={{ rotateY: { duration: 50, repeat: Infinity, ease: "linear" }, scale: { duration: 15, repeat: Infinity } }}
            className="relative mx-auto w-[420px] h-[420px] mb-20 perspective-1000"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-orange-700 shadow-2xl ring-20 ring-yellow-400/70 blur-xl" />
            <div className="absolute inset-16 rounded-full bg-gradient-to-tr from-amber-950 to-black flex items-center justify-center shadow-inner">
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
                className="text-10xl font-black text-yellow-400 tracking-widest drop-shadow-2xl"
                style={{ textShadow: "0 0 140px rgba(251,191,36,1)" }}
              >
                MH
              </motion.div>
            </div>
            <motion.div
              animate={{ y: [0, -60, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-32 left-1/2 -translate-x-1/2"
            >
              <Crown className="w-44 h-44 text-yellow-400 drop-shadow-2xl" />
            </motion.div>
          </motion.div>

          {/* MESERET Letter Animation */}
          <div className="flex justify-center gap-8 mb-16">
            {("MESERET").split('').map((letter, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 300, rotateX: -180 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 1.8 + i * 0.22, duration: 1.4, type: "spring", stiffness: 80 }}
                className="text-9xl md:text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-600"
                style={{
                  textShadow: "0 0 120px rgba(251,191,36,1)",
                  fontFamily: "'Playfair Display', serif"
                }}
              >
                {letter}
              </motion.span>
            ))}
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 4, duration: 2.5 }}
            className="text-7xl md:text-9xl font-black text-amber-300 tracking-widest mb-12"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            MANAGER PALACE
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 5.5, duration: 2 }}
            className="text-4xl md:text-5xl text-amber-100 font-light tracking-widest mb-32"
          >
            {t('royalAnalyticsLoading') || "Initializing Royal Command Center..."}
          </motion.p>

          {/* Progress Bar */}
          <div className="w-full max-w-4xl mx-auto">
            <div className="h-10 bg-black/70 rounded-full overflow-hidden border-6 border-amber-700/95 backdrop-blur-3xl shadow-2xl">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 5.2, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-700 relative overflow-hidden"
              >
                <motion.div
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent"
                />
              </motion.div>
            </div>

            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-center mt-24 text-5xl md:text-6xl font-medium text-amber-200 tracking-widest"
            >
              {t('preparingDashboard') || "Preparing Your Royal Throne..."}
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // === FULLY FUNCTIONAL DASHBOARD ===
  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">
            {t('welcomeBack') || 'Welcome back'},{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {user?.firstName || 'Manager'}!
            </span>
          </h1>
          <p className="text-xl text-gray-600 mt-3 font-medium">
            {t('operationalOverview') || 'Operational Overview & Royal Analytics'}
          </p>
        </div>
        <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg border border-amber-100">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            {t('currentTime') || 'Current Time'}
          </p>
          <p className="text-2xl font-black text-gray-800 mt-1">
            {new Date().toLocaleTimeString(language === 'am' ? 'am-ET' : 'en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('occupiedRooms') || "Occupied Rooms"}
          value={`${stats.occupiedRooms}/${stats.totalRooms}`}
          subValue={`${occupancyRate}% ${t('occupancy') || 'Occupancy'}`}
          icon={<BedDouble size={28} />}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          trend="+12%"
        />
        <StatCard
          title={t('todaysRevenue') || "Today's Revenue"}
          value={`ETB ${stats.totalRevenue.toLocaleString()}`}
          subValue={t('totalEarnings') || "Total Earnings"}
          icon={<DollarSign size={28} />}
          color="bg-gradient-to-br from-green-500 to-emerald-600"
          trend="+8%"
        />
        <StatCard
          title={t('pendingOrders') || "Pending Orders"}
          value={stats.pendingOrders}
          subValue={t('kitchenBar') || "Kitchen & Bar"}
          icon={<Utensils size={28} />}
          color="bg-gradient-to-br from-purple-500 to-pink-600"
          trend="-3"
        />
        <StatCard
          title={t('staffOnDuty') || "Staff On Duty"}
          value={stats.staffOnDuty}
          subValue={t('activeNow') || "Active Now"}
          icon={<Users size={28} />}
          color="bg-gradient-to-br from-amber-500 to-orange-600"
          trend="100%"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Live Revenue */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Activity className="text-green-600" size={28} />
              {t('liveRevenue') || "Live Revenue"}
            </h3>
            <span className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-bold">
              {t('today') || "Today"}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => `ETB ${v.toLocaleString()}`} />
              <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Order Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            {t('orderStatus') || "Order Status"}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={orderStatusData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <Tooltip />
              <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={50}>
                {orderStatusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickLink title={t('manageStaff') || "Manage Staff"} desc={t('manageStaffDesc') || "Add, edit, or remove employees"} icon={<Users size={32} />} color="bg-gradient-to-br from-blue-600 to-indigo-700" href="/manager/staff" />
        <QuickLink title={t('roomStatus') || "Room Status"} desc={t('monitorRooms') || "Monitor free & occupied rooms"} icon={<BedDouble size={32} />} color="bg-gradient-to-br from-indigo-600 to-purple-700" href="/manager/rooms" />
        <QuickLink title={t('menuOrders') || "Menu Orders"} desc={t('trackLiveOrders') || "Track live food & drink orders"} icon={<Utensils size={32} />} color="bg-gradient-to-br from-pink-600 to-rose-700" href="/manager/orders" />
      </div>

      {/* Recent Orders + News */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-amber-50 to-orange-50">
            <h3 className="text-xl font-bold text-gray-900">
              {t('recentFoodOrders') || "Recent Food Orders"}
            </h3>
            <Link href="/manager/orders" className="p-2 hover:bg-amber-100 rounded-full transition">
              <MoreHorizontal size={22} className="text-gray-600" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-left">{t('orderId') || 'Order ID'}</th>
                  <th className="px-6 py-4 text-left">{t('items') || 'Items'}</th>
                  <th className="px-6 py-4 text-left">{t('amount') || 'Amount'}</th>
                  <th className="px-6 py-4 text-left">{t('status') || 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order: any) => (
                    <tr key={order._id} className="hover:bg-amber-50/30 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order.orderNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {order.items.length} {t('items').toLowerCase()} ({order.items[0]?.name || t('food')})
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-800">
                        ETB {order.totalAmount}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {t(order.status) || order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-gray-500">
                      {t('noActiveOrders') || 'No active orders'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
          <NewsFeed />
        </div>
      </div>
    </div>
  );
}/*'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import StatModal from '../../../components/ui/StatModal';
import { Bed, BarChart3, Coffee, Users, FileText, UserCheck } from 'lucide-react';
import NewsFeed from '../../../components/NewsFeed';
interface Stat {
  label: string;
  value: string;
  icon: any;
  color: string;
  trend: string;
  type: 'rooms' | 'revenue' | 'orders' | 'staff';
}

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedStat, setSelectedStat] = useState<Stat | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  const stats: Stat[] = [
    { label: 'Occupied Rooms', value: '42/60', icon: Bed, color: 'blue', trend: '+12%', type: 'rooms' },
    { label: 'Today\'s Revenue', value: 'ETB 48,500', icon: BarChart3, color: 'green', trend: '+8%', type: 'revenue' },
    { label: 'Pending Orders', value: '7', icon: Coffee, color: 'purple', trend: '-3', type: 'orders' },
    { label: 'Staff On Duty', value: '18', icon: Users, color: 'amber', trend: '100%', type: 'staff' },
  ];

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, <span className="text-amber-600 dark:text-amber-400">{user?.firstName}</span>!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {format(currentTime, 'EEEE, MMMM d, yyyy • h:mm:ss a')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={() => setSelectedStat(stat)}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                <stat.icon className={`text-${stat.color}-600 dark:text-${stat.color}-400`} size={28} />
              </div>
              <span className={`text-lg font-bold ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{stat.trend}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {selectedStat && (
        <StatModal
          isOpen={!!selectedStat}
          onClose={() => setSelectedStat(null)}
          title={selectedStat.label}
          value={selectedStat.value}
          trend={selectedStat.trend}
          type={selectedStat.type}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Manage Staff', desc: 'Add, edit, or remove employees', href: '/manager/staff', gradient: 'from-blue-500 to-blue-600', icon: Users },
          { title: 'Room Status', desc: 'Monitor free & occupied rooms', href: '/manager/rooms', gradient: 'from-indigo-500 to-indigo-600', icon: Bed },
          { title: 'Menu Orders', desc: 'Track live food & drink orders', href: '/manager/menu', gradient: 'from-pink-500 to-pink-600', icon: Coffee },
        ].map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: (i + 1) * 0.1 }} whileHover={{ y: -4 }}>
            <Link href={card.href} className={`block p-6 rounded-xl text-white shadow-lg bg-gradient-to-br ${card.gradient}`}>
              <card.icon size={32} className="mb-3" />
              <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
              <p className="text-sm opacity-90">{card.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
      <div><NewsFeed/></div>
    </>
  );
}*/