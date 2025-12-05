'use client';
import { View, Modal } from 'react-native';

import { useState, useEffect, useMemo } from 'react';

import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, Calendar, TrendingUp, Download, 
  ChevronRight, Wallet, CheckCircle, Clock 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { format } from 'date-fns';
import PayslipModal from '../src/app/cashier/payroll/components/PayslipModal'; 
// ^ Adjust import path based on your folder structure

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

const SalaryCard = ({ title, value, subtitle, icon, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white p-6 rounded-3xl shadow-lg border border-amber-100 relative overflow-hidden"
  >
    <div className={`absolute top-0 right-0 p-4 opacity-10 ${color}`}>
      {icon}
    </div>
    <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">{title}</p>
    <h3 className="text-3xl font-black text-gray-800 mt-2">{value}</h3>
    <p className="text-amber-600 text-xs font-medium mt-1">{subtitle}</p>
  </motion.div>
);

export default function MySalaryClient() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);

  useEffect(() => {
    const fetchMyPayroll = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/payroll/my-history`, { withCredentials: true });
        setHistory(res.data);
      } catch (error) {
        console.error("Error fetching payroll", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyPayroll();
  }, []);

  const stats = useMemo(() => {
    if (!history.length) return { latest: 0, totalYTD: 0, avg: 0 };
    
    const currentYear = new Date().getFullYear();
    const thisYearSlips = history.filter(h => h.year === currentYear);
    
    return {
      latest: history[0]?.netPay || 0,
      totalYTD: thisYearSlips.reduce((sum, item) => sum + item.netPay, 0),
      avg: Math.round(thisYearSlips.reduce((sum, item) => sum + item.netPay, 0) / (thisYearSlips.length || 1))
    };
  }, [history]);

  const chartData = useMemo(() => {
    // Take last 6 months and reverse for chart (oldest to newest)
    return [...history].slice(0, 6).reverse().map(h => ({
      name: `${new Date(0, h.month - 1).toLocaleString('default', { month: 'short' })}`,
      net: h.netPay,
      gross: h.baseSalary
    }));
  }, [history]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#FDFBF7]">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 lg:p-10 font-sans">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-10">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-700"
        >
          My Compensation
        </motion.h1>
        <p className="text-gray-500 mt-2">Track your earnings and download payslips.</p>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SalaryCard 
            title="Latest Net Pay" 
            value={`ETB ${stats.latest.toLocaleString()}`} 
            subtitle={history[0] ? format(new Date(history[0].year, history[0].month - 1), 'MMMM yyyy') : 'No data'}
            icon={<Wallet size={64} />} 
            color="text-green-500"
            delay={0.1}
          />
          <SalaryCard 
            title="Year to Date (YTD)" 
            value={`ETB ${stats.totalYTD.toLocaleString()}`} 
            subtitle={`${new Date().getFullYear()} Total Earnings`}
            icon={<TrendingUp size={64} />} 
            color="text-blue-500"
            delay={0.2}
          />
          <SalaryCard 
            title="Average Monthly" 
            value={`ETB ${stats.avg.toLocaleString()}`} 
            subtitle="Based on this year"
            icon={<DollarSign size={64} />} 
            color="text-amber-500"
            delay={0.3}
          />
        </div>

        {/* Content Split: Chart + List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Chart Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-xl border border-amber-100"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp className="text-amber-500" size={20}/> Income Trend
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Area type="monotone" dataKey="net" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#colorNet)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Recent Payslips List */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-6 rounded-3xl shadow-xl border border-amber-100 flex flex-col h-[400px]"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="text-amber-500" size={20}/> Recent Payslips
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {history.length === 0 ? (
                <div className="text-center text-gray-400 mt-10">No records found</div>
              ) : (
                history.map((item, idx) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    onClick={() => setSelectedPayslip(item)}
                    className="group cursor-pointer p-4 rounded-2xl bg-gray-50 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-all duration-200"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${item.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                          {item.status === 'paid' ? <CheckCircle size={18} /> : <Clock size={18} />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">
                            {format(new Date(item.year, item.month - 1), 'MMMM yyyy')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.status === 'paid' ? `Paid on ${format(new Date(item.paidAt || Date.now()), 'dd MMM')}` : 'Pending Processing'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">ETB {item.netPay.toLocaleString()}</p>
                        <p className="text-xs text-amber-600 font-medium flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          View <ChevronRight size={12} />
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedPayslip && (
          <PayslipModal 
            payslip={selectedPayslip} 
            onClose={() => setSelectedPayslip(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}