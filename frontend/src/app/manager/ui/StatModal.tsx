
//src/app/manager/ui/StatModal.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface StatModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  value: string;
  trend: string;
  type: 'rooms' | 'revenue' | 'orders' | 'staff';
}

export default function StatModal({ isOpen, onClose, title, value, trend, type }: StatModalProps) {
  const revenueData = [
    { day: 'Mon', amount: 42000 },
    { day: 'Tue', amount: 48500 },
    { day: 'Wed', amount: 51000 },
    { day: 'Thu', amount: 47000 },
    { day: 'Fri', amount: 62000 },
    { day: 'Sat', amount: 78000 },
    { day: 'Sun', amount: 65000 },
  ];

  const roomData = [
    { name: 'Occupied', value: 42 },
    { name: 'Available', value: 18 },
  ];

  const orderData = [
    { name: 'Coffee', value: 4 },
    { name: 'Food', value: 2 },
    { name: 'Drinks', value: 1 },
  ];

  const staffData = [
    { shift: 'Morning', count: 10 },
    { shift: 'Evening', count: 8 },
  ];

  const COLORS = ['#3b82f6', '#e5e7eb'];
  const BAR_COLORS = { orders: '#8b5cf6', staff: '#10b981' };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-70 z-50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 lg:inset-8 z-50 overflow-hidden rounded-3xl shadow-2xl"
          >
            <div className="h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 lg:p-10 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">{title}</h2>
                  <p className="text-2xl lg:text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">{value}</p>
                  <span className={`text-sm font-medium ${trend.startsWith('+') ? 'text-green-600' : trend === '100%' ? 'text-amber-600' : 'text-red-600'}`}>
                    {trend} vs yesterday
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  <X size={24} className="text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              {/* Chart */}
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  {type === 'revenue' && (
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#f59e0b"
                        strokeWidth={4}
                        dot={{ fill: '#f59e0b', r: 6 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  )}

                  {type === 'rooms' && (
                    <PieChart>
                      <Pie
                        data={roomData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {roomData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                          <p className="text-5xl font-bold text-gray-900 dark:text-white">70%</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Occupancy</p>
                        </div>
                      </div>
                    </PieChart>
                  )}

                  {type === 'orders' && (
                    <BarChart data={orderData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip />
                      <Bar dataKey="value" fill={BAR_COLORS.orders} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  )}

                  {type === 'staff' && (
                    <BarChart data={staffData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="shift" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip />
                      <Bar dataKey="count" fill={BAR_COLORS.staff} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}