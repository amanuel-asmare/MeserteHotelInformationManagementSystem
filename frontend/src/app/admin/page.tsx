'use client';
import { Text } from 'react-native';

import { useState, useEffect, useMemo } from 'react';

import { motion } from 'framer-motion';
import { 
  Home, CalendarCheck, FileText, TrendingUp, 
  Users, BedDouble, ArrowUpRight, Loader2, DollarSign, 
  Activity, PieChart as PieIcon, MoreHorizontal, Globe, Server, ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import NewsFeed from '../../../components/NewsFeed';
import { useLanguage } from '../../../context/LanguageContext';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mesertehotelinformationmanagementsystem.onrender.com';
const COLORS = ['#F59E0B', '#E5E7EB']; 

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    occupiedRooms: 0,
    totalRooms: 0,
    todaysCheckIns: 0,
    pendingFeedback: 0,
    totalRevenue: 0,
    recentBookings: []
  });
  const [loading, setLoading] = useState(true);
  const [minTimePassed, setMinTimePassed] = useState(false);
  
  // FIX: Generate random positions only on client mount to avoid hydration mismatch
  const [particles, setParticles] = useState<{x: number, size: number, delay: number}[]>([]);
const {t,language}=useLanguage();
  useEffect(() => {
    // Generate random values once on mount
    setParticles([
      { x: Math.random() * 100 - 50, size: 80 + Math.random() * 40, delay: 1.5 },
      { x: Math.random() * 100 - 50, size: 80 + Math.random() * 40, delay: 3.0 },
      { x: Math.random() * 100 - 50, size: 80 + Math.random() * 40, delay: 4.5 },
    ]);

    const timer = setTimeout(() => setMinTimePassed(true), 4500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/dashboard/admin`, { 
          withCredentials: true 
        });
        setStats(res.data);
      } catch (err) {
        console.error("Error loading dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const occupancyData = useMemo(() => [
    { name: t('occupied'), value: stats.occupiedRooms },
    { name:  t('available'), value: Math.max(0, stats.totalRooms - stats.occupiedRooms) },
  ], [stats,t]);

  const revenueData = useMemo(() => {
    const base = stats.totalRevenue || 1000;
    return [
      { name: 'Mon', amount: base * 0.7 },
      { name: 'Tue', amount: base * 0.5 },
      { name: 'Wed', amount: base * 0.8 },
      { name: 'Thu', amount: base * 0.6 },
      { name: 'Fri', amount: base * 0.9 },
      { name: 'Sat', amount: base * 1.2 },
      { name: 'Sun', amount: base }, 
    ];
  }, [stats.totalRevenue]);

  const occupancyRate = stats.totalRooms > 0 
    ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) 
    : 0;

  // --- ROYAL LOADING SCREEN ---
  if (loading || !minTimePassed) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center overflow-hidden z-50">
        
        {/* Digital Grid Background */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        {/* Floating Data Icons - Now using stable state for positions */}
        {particles.length > 0 && [Server, Globe, ShieldCheck].map((Icon, i) => (
           <motion.div
             key={i}
             className="absolute text-amber-500/20"
             initial={{ y: '100vh', x: `${particles[i].x}%`, opacity: 0 }}
             animate={{ y: '-20vh', opacity: [0, 0.5, 0] }}
             transition={{ 
               duration: 8 + (particles[i].delay), // Use stored delay
               repeat: Infinity, 
               delay: particles[i].delay,
               ease: "linear"
             }}
             style={{ left: `${20 + i * 30}%` }}
           >
             <Icon size={particles[i].size} />
           </motion.div>
        ))}

        <motion.div 
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 text-center px-8"
        >
          {/* Central Command Sphere */}
          <div className="relative w-64 h-64 mx-auto mb-12 flex items-center justify-center">
             {/* Outer Rings */}
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 border-2 border-dashed border-amber-500/30 rounded-full"
             />
             <motion.div 
               animate={{ rotate: -360 }}
               transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
               className="absolute inset-4 border border-amber-400/20 rounded-full"
             />
             
             {/* Core Pulsing Orb */}
             <motion.div
               animate={{ scale: [1, 1.1, 1], boxShadow: ["0 0 20px rgba(245,158,11,0.2)", "0 0 60px rgba(245,158,11,0.6)", "0 0 20px rgba(245,158,11,0.2)"] }}
               transition={{ duration: 3, repeat: Infinity }}
               className="w-32 h-32 bg-gradient-to-br from-amber-500 to-orange-700 rounded-full flex items-center justify-center shadow-2xl relative z-10"
             >
                <Globe className="text-white w-16 h-16 animate-pulse" />
             </motion.div>
             
             {/* Scanning Radar */}
             <motion.div
               animate={{ rotate: 360 }}
               transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-transparent to-amber-500/10"
               style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 0, 0 0)' }} // Attempt at radar sweep look
             />
          </div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-4xl md:text-6xl font-black text-white tracking-tight mb-2"
          >
           {language === 'am' ? 'አስተዳዳሪ' : 'ADMIN'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">{language === 'am' ? 'ፖርታል' : 'PORTAL'}</span>
          </motion.h2>

          <motion.div 
            className="h-1 w-32 mx-auto bg-amber-600 rounded-full mb-6"
            initial={{ width: 0 }}
            animate={{ width: 120 }}
            transition={{ delay: 0.8, duration: 1 }}
          />

          <motion.p 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-gray-400 font-mono text-sm tracking-widest uppercase"
          >
             {language === 'am' ? 'ሲስተም በመጫን ላይ...' : 'Initializing Command Systems...'}
          </motion.p>

        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* --- Header Section --- */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-3xl border border-amber-100"
      >
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
          {t('welcome')}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">{user?.firstName || 'Admin'}!</span>
          </h1>
        <p className="text-gray-600 mt-2 font-medium">{language === 'am' ? 'የሆቴልዎ አፈጻጸም አጠቃላይ እይታ እዚህ አለ።' : 'Here is your daily hotel performance overview.'}</p>
        </div>
        <div className="text-right hidden md:block bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('todaysDate')}</p>
            <p className="text-lg font-bold text-gray-800">
            {new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'am-ET', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </motion.div>

      {/* --- Stat Cards Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
       <StatCard 
          title={t('occupiedRooms')} 
          value={`${stats.occupiedRooms}/${stats.totalRooms}`} 
          subValue={`${occupancyRate}% ${t('rate')}`}
          icon={<Home size={24} className="text-white" />} 
          bgIcon="bg-blue-500"
          trend="+12%"
        />
         <StatCard 
          title={t('todaysCheckins')} 
          value={stats.todaysCheckIns} 
          subValue={t('guestsArrived')}
          icon={<CalendarCheck size={24} className="text-white" />} 
          bgIcon="bg-green-500"
          trend="+5%"
        />
        <StatCard 
          title={t('pendingFeedback')} 
          value={stats.pendingFeedback} 
          subValue={t('actionRequired')}
          icon={<FileText size={24} className="text-white" />} 
          bgIcon="bg-purple-500"
          trend="+3" 
        />
        <StatCard 
          title={t('revenueToday')} 
          value={`ETB ${stats.totalRevenue.toLocaleString()}`} 
          subValue={t('cashChapa')}
          icon={<DollarSign size={24} className="text-white" />} 
          bgIcon="bg-amber-500"
          trend="+8.5%"
        />
      </div>

      {/* --- Charts Section (The "Best Interface" Part) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue Analytics Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-lg border border-gray-100"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp className="text-amber-500" /> {t('revenueAnalytics')}
              </h3>
              <p className="text-sm text-gray-500">{t('incomeTrend')}</p>
            </div>
            <button className="text-sm bg-gray-50 hover:bg-gray-100 px-3 py-1 rounded-lg text-gray-600 font-medium transition">
                {t('weeklyReport')}
            </button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value: number) => [`ETB ${value.toLocaleString()}`, t('revenueToday')]}
                />
                <Area type="monotone" dataKey="amount" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Occupancy Donut Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex flex-col"
        >
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <PieIcon className="text-blue-500" /> {t('roomStatus')}
            </h3>
            <p className="text-sm text-gray-500">{t('liveOccupancy')}</p>
          </div>
          
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupancyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {occupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <span className="text-3xl font-black text-gray-800">{occupancyRate}%</span>
              <span className="text-xs text-gray-500 font-medium uppercase">{t('occupied')}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- Quick Actions --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickActionCard 
          title={t('manageStaff')}
          desc={t('accessStaffPortal')}
          icon={<Users size={28} />}
          gradient="bg-gradient-to-br from-blue-500 to-blue-700"
          href="/admin/staff"
        />
        <QuickActionCard 
        title={t('roomControl')} 
          desc={t('updateRoomStatus')}
          icon={<BedDouble size={28} />}
          gradient="bg-gradient-to-br from-green-500 to-green-700"
          href="/admin/rooms"
        />
        <QuickActionCard 
          title={t('fullReports')} 
          desc={t('downloadAnalytics')}
          icon={<TrendingUp size={28} />}
          gradient="bg-gradient-to-br from-purple-500 to-purple-700"
          href="/admin/reports"
        />
      </div>

      {/* --- Recent Activity Table + News Feed --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-2 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t('recentBookings')}</h3>
              <p className="text-sm text-gray-500">{t('latestTransactions')}</p>
            </div>
            <Link href="/admin/reports" className="p-2 hover:bg-white rounded-full transition shadow-sm border border-transparent hover:border-gray-200">
              <MoreHorizontal size={20} className="text-gray-600" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-left">{t('guest')}</th>
                    <th className="px-6 py-4 text-left">{t('room')}</th>
                  <th className="px-6 py-4 text-left">{t('amount')}</th>
                  <th className="px-6 py-4 text-left">{t('status')}</th>
                  <th className="px-6 py-4 text-left">{t('date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentBookings.length > 0 ? (
                  stats.recentBookings.map((booking: any) => (
                    <tr key={booking._id} className="hover:bg-amber-50/30 transition duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-200 to-orange-100 flex items-center justify-center text-amber-700 font-bold text-sm mr-3 shadow-inner">
                            {booking.user?.firstName?.[0] || 'G'}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">
                              {booking.user?.firstName} {booking.user?.lastName}
                            </div>
                            <div className="text-xs text-gray-500">{booking.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800">#{booking.room?.roomNumber || 'N/A'}</span>
                          <span className="text-xs text-gray-500 capitalize">{booking.room?.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                        ETB {booking.totalPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                          booking.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' :
                          booking.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {booking.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(booking.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 flex flex-col items-center justify-center">
                      <div className="bg-gray-50 p-4 rounded-full mb-3">
                        <FileText size={24} className="text-gray-300" />
                      </div>
                     {t('noRecentBookings')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* News Feed */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex flex-col">
           <NewsFeed /> 
        </div>
      </div>
    </div>
  );
}

// --- Sub-Components ---

const StatCard = ({ title, value, subValue, icon, bgIcon, trend }: any) => (
  <motion.div
    whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-full transition-all"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-4 rounded-2xl ${bgIcon} shadow-lg shadow-opacity-20`}>
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
      <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-1">{title}</p>
      <h3 className="text-3xl font-black text-gray-800 tracking-tight">{value}</h3>
      {subValue && <p className="text-sm text-gray-400 mt-2 font-medium">{subValue}</p>}
    </div>
  </motion.div>
);

const QuickActionCard = ({ title, desc, icon, gradient, href }: any) => (
  <Link href={href} className="block h-full">
    <motion.div 
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`${gradient} p-6 rounded-3xl text-white shadow-xl cursor-pointer h-full flex flex-col justify-center relative overflow-hidden group`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition duration-500">
        {icon}
      </div>
      <div className="flex items-center gap-4 relative z-10">
        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-white/80 text-sm font-medium">{desc}</p>
        </div>
      </div>
    </motion.div>
  </Link>
);

/*'use client';

import { motion } from 'framer-motion';
import { Home, Calendar, FileText, BarChart3, Users } from 'lucide-react';
import Link from 'next/link';
import StatModal from '../../../components/ui/StatModal';
import { useLanguage } from '../../../context/LanguageContext';

interface Stat {
  label: string;
  value: string;
  icon: any;
  color: string;
  trend: string;
  type: 'rooms' | 'checkins' | 'feedback' | 'revenue';
}

export default function AdminDashboard() {
  const [selectedStat, setSelectedStat] = useState<Stat | null>(null);
  const { t, language } = useLanguage(); // Get translation function

  // Translated Stats
  const stats: Stat[] = [
    { label: t('occupiedRooms'), value: '42/60', icon: Home, color: 'blue', trend: '+12%', type: 'rooms' },
    { label: t('todaysCheckins'), value: '8', icon: Calendar, color: 'green', trend: '+3', type: 'checkins' },
    { label: t('pendingFeedback'), value: '3', icon: FileText, color: 'purple', trend: '-2', type: 'feedback' },
    { label: t('revenueToday'), value: 'ETB 48,500', icon: BarChart3, color: 'amber', trend: '+15%', type: 'revenue' },
  ];

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          {t('welcome')}, <span className="text-amber-600">Admin</span>!
        </h2>
        <p className="text-gray-600 mt-1">
          {language === 'am' ? 'የሆቴሉ አጠቃላይ ሁኔታ ይህን ይመስላል።' : 'Here’s what’s happening at the hotel today.'}
        </p>
      </div>

      {/* INTERACTIVE STATS /}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={() => setSelectedStat(stat)}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-${stat.color}-100`}>
                <stat.icon className={`text-${stat.color}-600`} size={28} />
              </div>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                className={`text-lg font-bold ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}
              >
                {stat.trend}
              </motion.span>
            </div>
            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
            <p className="text-xs text-amber-600 mt-2">{t('viewChart')}</p>
          </motion.div>
        ))}
      </div>

      {/* ACTION CARDS /}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/staff" className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <Users size={32} className="mb-3 group-hover:scale-110 transition" />
          <h3 className="text-xl font-semibold mb-2">{t('manageStaff')}</h3>
          <p className="text-sm opacity-90">{language === 'am' ? 'ሰራተኞችን ይመልከቱ፣ ይጨምሩ' : 'View, add, or update users'}</p>
        </Link>

        <Link href="/admin/rooms" className="group bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <Home size={32} className="mb-3 group-hover:scale-110 transition" />
          <h3 className="text-xl font-semibold mb-2">{t('roomManagement')}</h3>
          <p className="text-sm opacity-90">{language === 'am' ? 'ክፍሎችን ያስተዳድሩ' : 'Add, update, or delete rooms'}</p>
        </Link>

        <Link href="/admin/reports" className="group bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <BarChart3 size={32} className="mb-3 group-hover:scale-110 transition" />
          <h3 className="text-xl font-semibold mb-2">{t('generateReport')}</h3>
          <p className="text-sm opacity-90">{language === 'am' ? 'ሪፖርቶችን ይመልከቱ' : 'View hotel reports'}</p>
        </Link>
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
    </>
  );
}*/











/*'use client';

import { motion } from 'framer-motion';
import { Home, Calendar, FileText, BarChart3, Users } from 'lucide-react';
import Link from 'next/link';
import StatModal from '../../../components/ui/StatModal';
import { useLanguage } from '../../../context/LanguageContext';
interface Stat {
  label: string;
  value: string;
  icon: any;
  color: string;
  trend: string;
  type: 'rooms' | 'checkins' | 'feedback' | 'revenue';
}

export default function AdminDashboard() {
  const [selectedStat, setSelectedStat] = useState<Stat | null>(null);
  const {t}=useLanguage();

  const stats: Stat[] = [
    { label: t('Occupied Rooms'), value: '42/60', icon: Home, color: 'blue', trend: '+12%', type: 'rooms' },
    { label: t('Today’s Check-ins'), value: '8', icon: Calendar, color: 'green', trend: '+3', type: 'checkins' },
    { label: t('Pending Feedback'), value: '3', icon: FileText, color: 'purple', trend: '-2', type: 'feedback' },
    { label: t('Revenue Today'), value: 'ETB 48,500', icon: BarChart3, color: 'amber', trend: '+15%', type: 'revenue' },
  ];

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back, <span className="text-amber-600">t('Admin')</span>!
        </h2>
        <p className="text-gray-600 mt-1">t("Here’s what’s happening at the hotel today").</p>
      </div>

      {/* INTERACTIVE STATS /}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={() => setSelectedStat(stat)}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-${stat.color}-100`}>
                <stat.icon className={`text-${stat.color}-600`} size={28} />
              </div>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                className={`text-lg font-bold ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}
              >
                {stat.trend}
              </motion.span>
            </div>
            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
            <p className="text-xs text-amber-600 mt-2">t('Click to view chart')</p>
          </motion.div>
        ))}
      </div>

      {/* ACTION CARDS /}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/staff" className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <Users size={32} className="mb-3 group-hover:scale-110 transition" />
          <h3 className="text-xl font-semibold mb-2">t('Manage Users')</h3>
          <p className="text-sm opacity-90">t('View, add, or update users')</p>
        </Link>

        <Link href="/admin/rooms" className="group bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <Home size={32} className="mb-3 group-hover:scale-110 transition" />
          <h3 className="text-xl font-semibold mb-2">t('Manage Rooms')</h3>
          <p className="text-sm opacity-90">t('Add, update, or delete rooms')</p>
        </Link>

      
        <Link href="/admin/reports" className="group bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <BarChart3 size={32} className="mb-3 group-hover:scale-110 transition" />
          <h3 className="text-xl font-semibold mb-2">t('Reports')</h3>
          <p className="text-sm opacity-90">t('View hotel reports')</p>
        </Link>
      </div>

      {/* MODAL /}
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
    </>
  );
}
*/
/*// src/app/admin/page.tsx
import AdminDashboardClient from './AdminDashboardClient';

export default function AdminPage() {
  return <AdminDashboardClient />;
}*/
/*
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  // Redirect if not admin or not logged in
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.replace('/'); // or '/login'
    }
  }, [user, loading, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg font-medium text-gray-700">Loading...</div>
      </div>
    );
  }

  // Final safety: if somehow user is null after loading
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg font-medium text-red-600">Access Denied</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* === ADMIN HEADER === 
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              A
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Meseret Hotel</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
            <img
              src={user.profileImage || '/default-avatar.png'}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-amber-600"
            />
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* === MAIN CONTENT === 
      <div className="container mx-auto mt-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-amber-600 mb-4">Admin Dashboard</h1>
          <p className="text-lg mb-2">
            Welcome back, <strong>{user.firstName} {user.lastName}</strong>!
          </p>
          <p className="text-gray-600 mb-6">Manage users, rooms, reservations, and reports.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a
              href="/admin/users"
              className="bg-blue-600 text-white p-6 rounded-lg text-center hover:bg-blue-700 transition transform hover:scale-105"
            >
              <h3 className="text-xl font-semibold">Manage Users</h3>
            </a>
            <a
              href="/admin/rooms"
              className="bg-green-600 text-white p-6 rounded-lg text-center hover:bg-green-700 transition transform hover:scale-105"
            >
              <h3 className="text-xl font-semibold">Manage Rooms</h3>
            </a>
            <a
              href="/admin/reports"
              className="bg-purple-600 text-white p-6 rounded-lg text-center hover:bg-purple-700 transition transform hover:scale-105"
            >
              <h3 className="text-xl font-semibold">View Reports</h3>
            </a>
          </div>

          <button
            onClick={logout}
            className="mt-8 w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}*/