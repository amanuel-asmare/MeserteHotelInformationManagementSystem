'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Bed, Clock, AlertCircle, Search, DollarSign,
  Hotel, Crown
} from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import NewsFeed from '../../../components/NewsFeed';
import { useLanguage } from '../../../context/LanguageContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

interface Guest { _id: string; firstName: string; lastName: string; email: string; phone?: string; }
interface Room { _id: string; roomNumber: string; type: string; availability: boolean; status: string; }
interface Booking {
  _id: string;
  user: Guest;
  room: Room;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: string;
}
interface DashboardData {
  checkedInToday: Booking[];
  todayRevenue: number;
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  maintenanceRooms: number;
  bookings: Booking[];
}

export default function ReceptionDashboard() {
  const { t } = useLanguage();
  const [data, setData] = useState<DashboardData | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'checked-in' | 'departing'>('all');
  const [loading, setLoading] = useState(true);
  const [minTimePassed, setMinTimePassed] = useState(false);

  // Royal entrance timer
  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), 5200);
    return () => clearTimeout(timer);
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/dashboard/receptionist`, { withCredentials: true });
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // === ROYAL LOADING SCREEN ===
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
            {t('receptionPortal')}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.2, duration: 1.5 }}
            className="text-2xl text-amber-100 font-light tracking-widest"
          >
            {t('loadingReports')}
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
              {t('processing')}
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // === DATA PROCESSING ===
  const { checkedInToday, todayRevenue, totalRooms, availableRooms, occupiedRooms, maintenanceRooms, bookings } = data!;
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const actualCheckedInGuests = bookings.filter(b =>
    b.status === 'confirmed' &&
    new Date(b.checkIn) <= today &&
    new Date(b.checkOut) > today
  );

  const upcomingArrivals = bookings
    .filter(b => b.status === 'confirmed' && new Date(b.checkIn) > today)
    .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())
    .slice(0, 5);

  const todayDepartures = bookings.filter(b =>
    b.status === 'confirmed' &&
    format(new Date(b.checkOut), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  );

  const stats = [
    { icon: Users, label: t('todaysCheckins'), value: checkedInToday.length, color: 'blue', trend: '+12%' },
    { icon: Bed, label: t('availableRooms'), value: availableRooms, color: 'green', trend: '-2%' },
    { icon: DollarSign, label: t('revenueToday'), value: `ETB ${todayRevenue.toLocaleString()}`, color: 'amber', trend: '+8%' },
    { icon: Clock, label: t('guestsArrived'), value: upcomingArrivals.length, color: 'purple', trend: '+3%' },
  ];

  const filteredGuests = actualCheckedInGuests.filter(b => {
    const name = `${b.user.firstName} ${b.user.lastName}`.toLowerCase();
    const matches = name.includes(search.toLowerCase()) || (b.user.email?.toLowerCase().includes(search.toLowerCase()));
    if (filter === 'all' || filter === 'checked-in') return matches;
    if (filter === 'departing') return todayDepartures.some(d => d._id === b._id) && matches;
    return matches;
  });

  const roomStatusData = [
    { name: t('available'), value: availableRooms, color: '#10B981' },
    { name: t('occupied'), value: occupiedRooms, color: '#F59E0B' },
    { name: t('maintenance'), value: maintenanceRooms, color: '#EF4444' },
  ];

  const recentCheckInsData = checkedInToday.map(booking => ({
    name: `${booking.user.firstName} ${booking.user.lastName}`,
    value: booking.totalPrice,
  })).slice(0, 5);

  // === MAIN DASHBOARD WITH INSANE ANIMATED HEADER ===
  return (
    <div className="space-y-8 p-6 transition-all duration-300">
      {/* EPIC ANIMATED HEADER */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16 relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 dark:from-gray-900 dark:via-amber-950 dark:to-gray-900 border border-amber-200 dark:border-amber-800 shadow-2xl"
      >
        {/* Floating Particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              x: [0, i % 2 === 0 ? -20 : 20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full blur-md"
            style={{ top: `${20 + i * 6}%`, left: `${10 + i * 7}%` }}
          />
        ))}

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, type: "spring" }}
          className="relative z-10"
        >
          {/* Title with letter-by-letter entrance + glow */}
          <h1 className="text-5xl md:text-7xl font-black tracking-wider mb-6">
            {t('receptionPortal').split(' ').map((word, i) => (
              <span key={i} className="inline-block">
                {word.split('').map((letter, j) => (
                  <motion.span
                    key={j}
                    initial={{ opacity: 0, y: 100, rotateX: -90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: 0.1 * j + i * 0.4, duration: 0.8, type: "spring", stiffness: 100 }}
                    className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-500 to-orange-600"
                    style={{
                      textShadow: "0 0 40px rgba(251,191,36,0.8)",
                      fontFamily: "'Playfair Display', serif"
                    }}
                  >
                    {letter === ' ' ? '\u00A0' : letter}
                  </motion.span>
                ))}
                <span className="mx-4" />
              </span>
            ))}
          </h1>

          {/* Welcome Message with floating effect */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 1.2 }}
            className="space-y-4"
          >
            <motion.p
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="text-3xl md:text-5xl font-bold text-gray-800 dark:text-amber-100"
            >
              {t('welcome')}! {t('delightedHaveYou')}
            </motion.p>
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-xl text-amber-600 dark:text-amber-400 font-medium tracking-wider"
            >
              {t('receptionReady')} • {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </motion.div>
          </motion.div>

          {/* Golden underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 2, duration: 1.5 }}
            className="mt-8 h-2 bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full"
          />
        </motion.div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 + 0.2 }}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-xl bg-${s.color}-100 dark:bg-${s.color}-900/30`}>
                <s.icon className={`w-6 h-6 text-${s.color}-600 dark:text-${s.color}-400`} />
              </div>
              {s.trend && (
                <span className={`text-xs font-medium ${s.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {s.trend}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Checked-in Guests + Upcoming/Departures */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Checked-in Guests */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('guestsArrived')}</h3>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder={t('search')}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm w-full sm:w-48 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-amber-500 focus:border-amber-500 transition"
                />
              </div>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-amber-500 focus:border-amber-500 transition"
              >
                <option value="all">{t('all')}</option>
                <option value="checked-in">{t('confirmed')}</option>
                <option value="departing">{t('checkOutLabel')}</option>
              </select>
            </div>
          </div>
          <div className="flex-1 space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {filteredGuests.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('noRecentBookings')}</p>
            ) : (
              <AnimatePresence>
                {filteredGuests.map(b => (
                  <motion.div
                    key={b._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.01, backgroundColor: 'rgba(251, 191, 36, 0.05)' }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-amber-700 dark:text-amber-300 text-sm">
                          {b.user.firstName[0]}{b.user.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{b.user.firstName} {b.user.lastName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('room')} {b.room.roomNumber}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-gray-600 dark:text-gray-400">
                        {format(new Date(b.checkIn), 'MMM dd')} - {format(new Date(b.checkOut), 'MMM dd')}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">ETB {b.totalPrice.toLocaleString()}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.div>

        {/* Upcoming & Departures */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/40 rounded-2xl p-6 shadow-sm border border-blue-200 dark:border-blue-700 cursor-pointer">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-800 dark:text-blue-300">
              <Clock size={18} /> {t('guestsArrived')}
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {upcomingArrivals.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('noBookingsFound')}</p>
              ) : (
                <AnimatePresence>
                  {upcomingArrivals.map(b => (
                    <motion.div
                      key={b._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.9)' }}
                      className="bg-white dark:bg-gray-700 p-3 rounded-lg text-sm shadow-xs transition"
                    >
                      <p className="font-medium text-gray-900 dark:text-white">{b.user.firstName} {b.user.lastName}</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {t('room')} {b.room.roomNumber} • {format(new Date(b.checkIn), 'MMM dd, h:mm a')}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/40 rounded-2xl p-6 shadow-sm border border-red-200 dark:border-red-700 cursor-pointer">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-800 dark:text-red-300">
              <AlertCircle size={18} /> {t('checkOutLabel')}
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {todayDepartures.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('noRecentBookings')}</p>
              ) : (
                <AnimatePresence>
                  {todayDepartures.map(b => (
                    <motion.div
                      key={b._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.9)' }}
                      className="bg-white dark:bg-gray-700 p-3 rounded-lg text-sm shadow-xs transition"
                    >
                      <p className="font-medium text-gray-900 dark:text-white">{b.user.firstName} {b.user.lastName}</p>
                      <p className="text-gray-600 dark:text-gray-400">{t('room')} {b.room.roomNumber}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('liveOccupancy')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={roomStatusData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" animationDuration={800} animationEasing="ease-out">
                {roomStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'white', borderColor: '#ccc', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('revenue')} ({t('todaysCheckins')})</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={recentCheckInsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#6B7280" className="text-xs" />
              <YAxis stroke="#6B7280" className="text-xs" />
              <Tooltip formatter={(value: number) => `ETB ${value.toLocaleString()}`} contentStyle={{ backgroundColor: 'white', borderColor: '#ccc', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="value" fill="#F59E0B" radius={[10, 10, 0, 0]} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Room Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('roomStatus')} {t('summary')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <Bed className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{availableRooms}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('available')}</p>
          </div>
          <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <Users className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{occupiedRooms}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('occupied')}</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
            <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{maintenanceRooms}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('maintenance')}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <Hotel className="w-8 h-8 text-gray-600 dark:text-gray-300 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">{totalRooms}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('totalRooms')}</p>
          </div>
        </div>
      </motion.div>

      <div><NewsFeed /></div>
    </div>
  );
}/*'use client';

import { motion } from 'framer-motion';
import {
  Users, Bed, CreditCard, MessageCircle, Star, Clock, CheckCircle, AlertCircle,
  Search, Filter, Plus, Calendar, TrendingUp, DollarSign, BarChart3
} from 'lucide-react';
import api from '@/lib/api';
import { format, startOfToday, endOfToday } from 'date-fns';

interface Guest {
  id: string;
  name: string;
  room: string;
  status: 'checked-in' | 'checked-out' | 'no-show';
  arrival: Date;
  departure: Date;
  phone: string;
}

interface Room {
  id: string;
  number: string;
  status: 'available' | 'occupied' | 'maintenance';
  guest?: string;
  price: number;
  type: 'Standard' | 'Deluxe' | 'Suite' | 'Executive';
}

interface Stat {
  icon: any;
  label: string;
  value: string | number;
  color: string;
  trend: string;
}

export default function ReceptionDashboard() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = [useState([])];
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // useEffect(() => {
  //   fetchDashboardData();
  // }, [selectedDate]);

  // const fetchDashboardData = async () => {
  //   setLoading(true);
  //   try {
  //     const [g, r, res] = await Promise.all([
  //       api.get('/api/reception/guests'),
  //       api.get('/api/reception/rooms'),
  //       api.get('/api/reception/reservations')
  //     ]);
  //     setGuests(g.data || []);
  //     setRooms(r.data || []);
  //     setReservations(res.data || []);
  //   } catch (error) {
  //     console.error('Failed to fetch dashboard data:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  const filteredGuests = guests.filter(guest => 
    (!search || guest.name.toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'all' || guest.status === filter)
  );

  const today = startOfToday();
  const upcomingArrivals = reservations.filter(res => new Date(res.arrival) >= today).length;
  const checkedIn = guests.filter(g => g.status === 'checked-in').length;
  const availableRooms = rooms.filter(r => r.status === 'available').length;
  const revenue = Math.round(Math.random() * 5000) + 1000; // Mock data

  const stats: Stat[] = [
    { icon: Users, label: 'Checked-in Guests', value: checkedIn, color: 'blue', trend: '+12%' },
    { icon: Bed, label: 'Available Rooms', value: availableRooms, color: 'green', trend: '-2%' },
    { icon: CreditCard, label: "Today's Revenue", value: `$${revenue}`, color: 'amber', trend: '+5.2%' },
    { icon: Clock, label: 'Upcoming Arrivals', value: upcomingArrivals, color: 'purple', trend: '+3%' },
  ];

  return (
    <div className="space-y-8">
      {/* Header 
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reception Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{format(selectedDate, 'PPP')}</span>
            </div>
            <Button onClick={() => fetchDashboardData()}>Refresh</Button>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats 
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
              <span className={`text-xs font-medium ${
                stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Check-in & Rooms 
        <div className="lg:col-span-2 space-y-6">
          {/* Check-in Widget 
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Quick Check-in</h3>
              <Button variant="ghost"><Plus size={16} className="mr-2" /> Add Guest</Button>
            </div>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input placeholder="Guest Name" />
                <Input type="email" placeholder="Email" />
                <Input type="tel" placeholder="Phone" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500">
                    <option>Select Room</option>
                    {rooms.filter(r => r.status === 'available').map(room => (
                      <option key={room.id} value={room.number}>{room.number} - {room.type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Check-in Date</label>
                  <Input type="date" />
                </div>
              </div>
              <div className="flex gap-4">
                <Button className="flex-1">Check-in Guest</Button>
                <Button variant="outline" className="flex-1">Cancel</Button>
              </div>
            </form>
          </motion.div>

          {/* Active Guests Table 
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Active Guests ({guests.length})</h3>
                <div className="flex gap-2">
                  <div className="flex gap-1">
                    <Input placeholder="Search" className="w-40 p-2" />
                    <Button variant="ghost" size="sm"><Search size={16} /></Button>
                  </div>
                  <select className="p-2 border border-gray-300 rounded">
                    <option>All Status</option>
                    <option>Checked-in</option>
                    <option>Checked-out</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="p-4 text-left">Guest</th>
                    <th className="p-4 text-left">Room</th>
                    <th className="p-4 text-left">Check-in</th>
                    <th className="p-4 text-left">Check-out</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Balance</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuests.slice(0, 10).map((guest, i) => (
                    <motion.tr key={guest.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600">{guest.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-medium">{guest.name}</p>
                            <p className="text-xs text-gray-500">{guest.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {guest.room}
                        </span>
                      </td>
                      <td className="p-4 text-sm">{format(guest.arrival, 'MMM dd')}</td>
                      <td className="p-4 text-sm">{format(guest.departure, 'MMM dd')}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          guest.status === 'checked-in' ? 'bg-green-100 text-green-800' :
                          guest.status === 'checked-out' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {guest.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-semibold text-green-600">$450</span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="outline">Invoice</Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Showing 1 to {filteredGuests.length} of {guests.length} entries</p>
                <Button variant="ghost" size="sm">Next</Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Widgets 
        <div className="space-y-6">
          {/* Upcoming Arrivals 
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 shadow-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock size={20} />
              Upcoming Check-ins
            </h3>
            <div className="space-y-3">
              {['Alice Johnson - Room 105 - 2:00 PM', 'Charlie Brown - Room 106 - 3:00 PM', 'Diana Prince - Room 107 - 4:00 PM'].map((arrival, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div>
                    <p className="font-medium">{arrival.split(' - ')[0]}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Room {arrival.split(' - ')[1]} • {arrival.split(' - ')[2]}</p>
                  </div>
                  <CheckCircle className="text-blue-500" size={20} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Today's Departures 
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl p-6 shadow-lg border border-red-200 dark:border-red-800">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="text-red-500" size={20} />
              Today's Departures
            </h3>
            <div className="space-y-3">
              {['Bob Wilson - Room 101 - 11:00 AM', 'Eve Davis - Room 102 - 12:00 PM', 'Frank Miller - Room 103 - 1:00 PM'].map((departure, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div>
                    <p className="font-medium">{departure.split(' - ')[0]}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Room {departure.split(' - ')[1]} • {departure.split(' - ')[2]}</p>
                  </div>
                  <AlertCircle className="text-red-500" size={20} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions 
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 shadow-lg border border-purple-200 dark:border-purple-800">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Users, label: 'New Guest', href: '/reception/guests/add' },
                { icon: Bed, label: 'Room Status', href: '/reception/rooms/status' },
                { icon: CreditCard, label: 'New Reservation', href: '/reception/reservations/add' },
                { icon: FileText, label: 'Print Invoice', href: '/reception/billing/print' },
              ].map((action, i) => (
                <Link key={action.label} href={action.href} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition">
                  <action.icon className="h-5 w-5 text-purple-600" />
                  <span className="text-sm">{action.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}*/