'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

interface StatModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  value: string;
  trend: string;
  type: 'rooms' | 'checkins' | 'feedback' | 'revenue';
}

const COLORS = ['#f59e0b', '#10b981', '#8b5cf6', '#3b82f6'];

export default function StatModal({ isOpen, onClose, title, value, trend, type }: StatModalProps) {
  if (!isOpen) return null;

  const data = {
    rooms: [
      { name: 'Occupied', value: 42 },
      { name: 'Available', value: 18 },
    ],
    checkins: [
      { day: 'Mon', checkins: 5 },
      { day: 'Tue', checkins: 7 },
      { day: 'Wed', checkins: 8 },
      { day: 'Thu', checkins: 6 },
      { day: 'Fri', checkins: 9 },
      { day: 'Sat', checkins: 12 },
      { day: 'Sun', checkins: 8 },
    ],
    feedback: [
      { status: 'Pending', count: 3 },
      { status: 'Resolved', count: 12 },
    ],
    revenue: [
      { day: 'Mon', revenue: 42000 },
      { day: 'Tue', revenue: 48000 },
      { day: 'Wed', revenue: 52000 },
      { day: 'Thu', revenue: 45000 },
      { day: 'Fri', revenue: 68000 },
      { day: 'Sat', revenue: 75000 },
      { day: 'Sun', revenue: 48500 },
    ],
  }[type];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-500">Current Value</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Trend</p>
            <p className={`text-3xl font-bold ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {trend}
            </p>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'rooms' && (
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {data.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            )}
            {type === 'checkins' && (
              <BarChart data={data}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="checkins" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            )}
            {type === 'feedback' && (
              <BarChart data={data}>
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            )}
            {type === 'revenue' && (
              <LineChart data={data}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(v) => `ETB ${v}`} />
                <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b' }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.div>
  );
}