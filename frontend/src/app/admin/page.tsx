'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Calendar, FileText, BarChart3, Users } from 'lucide-react';
import Link from 'next/link';
import StatModal from '../../../components/ui/StatModal';

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

  const stats: Stat[] = [
    { label: 'Occupied Rooms', value: '42/60', icon: Home, color: 'blue', trend: '+12%', type: 'rooms' },
    { label: 'Today’s Check-ins', value: '8', icon: Calendar, color: 'green', trend: '+3', type: 'checkins' },
    { label: 'Pending Feedback', value: '3', icon: FileText, color: 'purple', trend: '-2', type: 'feedback' },
    { label: 'Revenue Today', value: 'ETB 48,500', icon: BarChart3, color: 'amber', trend: '+15%', type: 'revenue' },
  ];

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back, <span className="text-amber-600">Admin</span>!
        </h2>
        <p className="text-gray-600 mt-1">Here’s what’s happening at the hotel today.</p>
      </div>

      {/* INTERACTIVE STATS */}
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
            <p className="text-xs text-amber-600 mt-2">Click to view chart</p>
          </motion.div>
        ))}
      </div>

      {/* ACTION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/staff" className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <Users size={32} className="mb-3 group-hover:scale-110 transition" />
          <h3 className="text-xl font-semibold mb-2">Manage Users</h3>
          <p className="text-sm opacity-90">View, add, or update users</p>
        </Link>

        <Link href="/admin/rooms" className="group bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <Home size={32} className="mb-3 group-hover:scale-110 transition" />
          <h3 className="text-xl font-semibold mb-2">Manage Rooms</h3>
          <p className="text-sm opacity-90">Add, update, or delete rooms</p>
        </Link>

      
        <Link href="/admin/reports" className="group bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <BarChart3 size={32} className="mb-3 group-hover:scale-110 transition" />
          <h3 className="text-xl font-semibold mb-2">Reports</h3>
          <p className="text-sm opacity-90">View hotel reports</p>
        </Link>
      </div>

      {/* MODAL */}
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
}/*// src/app/admin/page.tsx
import AdminDashboardClient from './AdminDashboardClient';

export default function AdminPage() {
  return <AdminDashboardClient />;
}*/
/*
'use client';

import { useEffect } from 'react';
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