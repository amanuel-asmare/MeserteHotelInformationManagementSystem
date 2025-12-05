'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BedDouble, TrendingUp, Utensils, Users, 
  Clock, DollarSign, Activity, ArrowUpRight, MoreHorizontal
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import NewsFeed from '../../../components/NewsFeed'; 

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';
const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];

// ... (Keep StatCard and QuickLink components as they are) ...
// I am omitting them here to save space, but DO NOT DELETE THEM from your file.
const StatCard = ({ title, value, subValue, icon, color, trend }: any) => (
  <motion.div
    whileHover={{ y: -5 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-full"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color} text-white shadow-lg shadow-opacity-20`}>
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
      <div className="absolute -bottom-4 -right-4 opacity-20 transform rotate-12">
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

  // Mock Data for Visuals
  const revenueData = useMemo(() => [
    { name: '8am', value: stats.totalRevenue * 0.1 },
    { name: '10am', value: stats.totalRevenue * 0.2 },
    { name: '12pm', value: stats.totalRevenue * 0.5 },
    { name: '2pm', value: stats.totalRevenue * 0.6 },
    { name: '4pm', value: stats.totalRevenue * 0.8 },
    { name: 'Now', value: stats.totalRevenue },
  ], [stats.totalRevenue]);

  const orderStatusData = useMemo(() => [
    { name: 'Pending', value: stats.pendingOrders },
    { name: 'Completed', value: 12 }, 
    { name: 'Cancelled', value: 2 },  
  ], [stats.pendingOrders]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium mt-4">Loading Manager Overview...</p>
      </div>
    );
  }

  const occupancyRate = stats.totalRooms > 0 ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
      >
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{user?.firstName || 'Manager'}!</span>
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Operational Overview & Analytics</p>
        </div>
        <div className="bg-white px-5 py-2 rounded-2xl shadow-sm border border-gray-100">
           <p className="text-xs font-bold text-gray-400 uppercase">Current Time</p>
           <p className="text-xl font-bold text-gray-800">
             {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
           </p>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Occupied Rooms" 
          value={`${stats.occupiedRooms}/${stats.totalRooms}`} 
          subValue={`${occupancyRate}% Occupancy`}
          icon={<BedDouble size={24} />} 
          color="bg-blue-500"
          trend="+12%"
        />
        <StatCard 
          title="Today's Revenue" 
          value={`ETB ${stats.totalRevenue.toLocaleString()}`} 
          subValue="Total Earnings"
          icon={<DollarSign size={24} />} 
          color="bg-green-500"
          trend="+8%"
        />
        <StatCard 
          title="Pending Orders" 
          value={stats.pendingOrders} 
          subValue="Kitchen & Bar"
          icon={<Utensils size={24} />} 
          color="bg-purple-500"
          trend="-3"
        />
        <StatCard 
          title="Staff On Duty" 
          value={stats.staffOnDuty} 
          subValue="Active Now"
          icon={<Users size={24} />} 
          color="bg-amber-500"
          trend="100%"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Area Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100"
          >
            <div className="mb-6 flex justify-between items-center">
               <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                 <Activity className="text-green-500" /> Live Revenue
               </h3>
               <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold">Today</span>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                  <Tooltip 
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                     formatter={(value: number) => [`ETB ${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

           {/* Order Status Bar Chart */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100"
           >
             <h3 className="text-lg font-bold text-gray-800 mb-4">Order Status</h3>
             <div className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={orderStatusData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} />
                   <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px'}} />
                   <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                     {orderStatusData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </motion.div>
      </div>

      {/* Quick Links Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickLink 
          title="Manage Staff" 
          desc="Add, edit, or remove employees"
          icon={<Users size={28} />} 
          color="bg-blue-600"
          href="/manager/staff"
        />
        <QuickLink 
          title="Room Status" 
          desc="Monitor free & occupied rooms"
          icon={<BedDouble size={28} />} 
          color="bg-indigo-600"
          href="/manager/rooms"
        />
        <QuickLink 
          title="Menu Orders" 
          desc="Track live food & drink orders"
          icon={<Utensils size={28} />} 
          color="bg-pink-600"
          href="/manager/orders"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         {/* Recent Orders Table */}
         <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
               <h3 className="text-lg font-bold text-gray-900">Recent Food Orders</h3>
               <Link href="/manager/orders" className="p-2 hover:bg-gray-50 rounded-full transition">
                 <MoreHorizontal size={20} className="text-gray-500" />
               </Link>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full">
                 <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                   <tr>
                     <th className="px-6 py-4 text-left">Order ID</th>
                     <th className="px-6 py-4 text-left">Items</th>
                     <th className="px-6 py-4 text-left">Amount</th>
                     <th className="px-6 py-4 text-left">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {stats.recentOrders.map((order: any) => (
                     <tr key={order._id} className="hover:bg-gray-50/50 transition">
                       <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.orderNumber}</td>
                       <td className="px-6 py-4 text-sm text-gray-500">
                         {order.items.length} items ({order.items[0]?.name || 'Food'}...)
                       </td>
                       <td className="px-6 py-4 text-sm font-bold text-gray-800">ETB {order.totalAmount}</td>
                       <td className="px-6 py-4">
                         <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                           order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                           order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                           'bg-blue-100 text-blue-700'
                         }`}>
                           {order.status}
                         </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
               {stats.recentOrders.length === 0 && (
                 <div className="p-6 text-center text-gray-400">No active orders</div>
               )}
             </div>
         </div>

         {/* News Feed - NOW FULL WIDTH IN COLUMN */}
         <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex flex-col">
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