'use client';
import { Text } from 'react-native';

import { useState, useEffect } from 'react';

import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, ComposedChart, Line 
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Wallet, Activity, ArrowUpRight, ArrowDownRight, PieChart } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(val);

export default function FinancialAnalytics() {
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netProfit: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/finance/analytics`, { withCredentials: true });
        setData(res.data.chartData);
        setSummary(res.data.summary);
      } catch (err) {
        console.error(err);
      } finally {
        // Added a small timeout just to show off the beautiful animation for at least 1.5s
        setTimeout(() => setLoading(false), 1500);
      }
    };
    fetchData();
  }, []);

  // --- 🌟 NEW ATTRACTIVE LOADING ANIMATION 🌟 ---
  if (loading) return (
    <div className="flex h-[75vh] w-full flex-col items-center justify-center bg-gray-50/50 relative overflow-hidden rounded-3xl">
      {/* Background Pulse Effect */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Bars (Representing Income, Expense, Profit) */}
        <div className="flex items-end gap-3 h-24 mb-8">
          <motion.div 
            animate={{ height: [30, 80, 40, 90, 30], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 bg-emerald-500 rounded-lg shadow-lg shadow-emerald-200"
          />
          <motion.div 
            animate={{ height: [50, 20, 60, 30, 50], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            className="w-6 bg-rose-500 rounded-lg shadow-lg shadow-rose-200"
          />
          <motion.div 
            animate={{ height: [20, 96, 50, 80, 20], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            className="w-6 bg-amber-500 rounded-lg shadow-lg shadow-amber-200"
          />
        </div>

        {/* Text Animation */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h3 className="text-xl font-black text-gray-800 tracking-tight flex items-center gap-2">
            <Activity className="animate-pulse text-amber-600" size={20}/>
            Processing Financials...
          </h3>
          <p className="text-sm text-gray-400 mt-2 font-medium">Aggregating Revenue & Expense Data</p>
        </motion.div>
      </div>
    </div>
  );

  // Profit Margin Calculation for Display
  const profitMargin = summary.totalIncome > 0 
    ? ((summary.netProfit / summary.totalIncome) * 100).toFixed(1) 
    : '0';

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. HEADER & TITLE */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-end gap-4"
      >
        <div>
          <h1 className="text-3xl font-black text-gray-900">Financial Performance</h1>
          <p className="text-gray-500">Real-time profit, cost, and revenue analysis.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
          <PieChart size={18} className="text-amber-600" />
          <span className="font-bold text-gray-700 text-sm">Fiscal Year: {new Date().getFullYear()}</span>
        </div>
      </motion.div>

      {/* 2. KPI CARDS (Summary) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Income Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl shadow-lg shadow-green-500/5 border border-green-100 relative overflow-hidden">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Income</p>
              <h3 className="text-3xl font-black text-gray-900 mt-2">{formatCurrency(summary.totalIncome)}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><TrendingUp size={24}/></div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500"></div>
        </motion.div>

        {/* Expense Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-3xl shadow-lg shadow-red-500/5 border border-red-100 relative overflow-hidden">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Expenses</p>
              <h3 className="text-3xl font-black text-gray-900 mt-2">{formatCurrency(summary.totalExpense)}</h3>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><TrendingDown size={24}/></div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-red-500"></div>
        </motion.div>

        {/* Net Profit Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Net Profit</p>
              <h3 className="text-3xl font-black text-amber-400 mt-2">{formatCurrency(summary.netProfit)}</h3>
              <div className="mt-2 inline-flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg text-xs font-bold">
                {Number(profitMargin) >= 0 ? <ArrowUpRight size={14} className="text-green-400"/> : <ArrowDownRight size={14} className="text-red-400"/>}
                <span className={Number(profitMargin) >= 0 ? "text-green-400" : "text-red-400"}>{profitMargin}% Margin</span>
              </div>
            </div>
            <div className="p-3 bg-white/10 text-white rounded-2xl"><Wallet size={24}/></div>
          </div>
          {/* Background Decor */}
          <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-amber-500/20 rounded-full blur-3xl"></div>
        </motion.div>
      </div>

      {/* 3. CHARTS SECTION */}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CHART 1: INCOME TREND (Area) */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><DollarSign size={20} className="text-green-600"/> Revenue Stream</h3>
            <p className="text-xs text-gray-500">Income form Bookings & Food Orders</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                  formatter={(value: number) => [formatCurrency(value), 'Income']}
                />
                <Area type="monotone" dataKey="Income" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* CHART 2: EXPENSE BREAKDOWN (Bar) */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><TrendingDown size={20} className="text-red-600"/> Cost Analysis</h3>
            <p className="text-xs text-gray-500">Inventory, Payroll & Operational Costs</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                  formatter={(value: number) => [formatCurrency(value), 'Expense']}
                />
                <Bar dataKey="Expense" fill="#EF4444" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

      {/* CHART 3: COMPARISON (The Beast Chart) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-black text-gray-900">Profit vs. Cost Comparison</h3>
            <p className="text-gray-500">Comprehensive view of financial health over the year.</p>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
             <div className="flex items-center gap-2 text-sm text-gray-600"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Income</div>
             <div className="flex items-center gap-2 text-sm text-gray-600"><div className="w-3 h-3 rounded-full bg-rose-500"></div> Expense</div>
             <div className="flex items-center gap-2 text-sm text-gray-600"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Net Profit</div>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="name" scale="point" padding={{ left: 20, right: 20 }} axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 13, dy: 10}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 13}} tickFormatter={(value) => `${value / 1000}k`} />
              <Tooltip 
                 contentStyle={{ backgroundColor: '#1F2937', color: '#fff', borderRadius: '12px', border: 'none' }}
                 itemStyle={{ color: '#fff' }}
                 formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              {/* Income Bar */}
              <Bar dataKey="Income" barSize={20} fill="#10B981" radius={[4, 4, 0, 0]} />
              {/* Expense Bar */}
              <Bar dataKey="Expense" barSize={20} fill="#F43F5E" radius={[4, 4, 0, 0]} />
              {/* Profit Line */}
              <Line type="monotone" dataKey="Profit" stroke="#F59E0B" strokeWidth={4} dot={{r: 4, fill: '#F59E0B', strokeWidth: 2, stroke: '#fff'}} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

    </div>
  );
}