// src/app/admin/payroll/page.tsx 
'use client';
import { View, Modal, Alert } from 'react-native';

import { useState, useEffect, useMemo } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  Calendar, Users, Clock, DollarSign, AlertCircle, 
  TrendingUp, PieChart as PieIcon, Activity 
} from 'lucide-react';
import PayrollTable from '../../cashier/payroll/components/PayrollTable';
import PayslipModal from '../../cashier/payroll/components/PayslipModal';
import { format } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';

// --- Types & Interfaces ---
interface StatCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  color: string;
  isActive: boolean;
  onClick: () => void;
}

// --- Components ---

const StatCard = ({ title, value, subValue, icon, color, isActive, onClick }: StatCardProps) => (
  <motion.div
    whileHover={{ y: -6, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`cursor-pointer relative overflow-hidden p-6 rounded-3xl shadow-xl border transition-all duration-300 ${
      isActive 
        ? 'bg-white border-amber-500 ring-4 ring-amber-500/20' 
        : 'bg-white/90 border-amber-100 hover:border-amber-300'
    }`}
  >
    <div className="flex justify-between items-start z-10 relative">
      <div>
        <p className={`font-bold text-sm tracking-wide uppercase ${isActive ? 'text-amber-600' : 'text-gray-500'}`}>
          {title}
        </p>
        <h3 className="text-3xl font-black text-gray-800 mt-2">{value}</h3>
        {subValue && <p className="text-xs font-medium text-gray-400 mt-1">{subValue}</p>}
      </div>
      <div className={`p-4 rounded-2xl ${color} ${isActive ? 'shadow-inner' : 'shadow-lg'} text-white`}>
        {icon}
      </div>
    </div>
    {/* Decorative Background Blob */}
    <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-10 transition-colors ${
      isActive ? 'bg-amber-500' : 'bg-gray-300'
    }`} />
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur border border-amber-100 p-4 rounded-xl shadow-2xl z-50">
        <p className="font-bold text-gray-800 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-gray-600 capitalize">{entry.name}:</span>
            <span className="font-bold text-gray-900">
              {entry.name === 'Amount' || entry.name === 'Net Pay' || entry.name === 'Tax' 
                ? `ETB ${entry.value.toLocaleString()}` 
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function PayrollClient() {
  // --- State ---
  const [staff, setStaff] = useState<any[]>([]);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [viewingPayslip, setViewingPayslip] = useState<any>(null);
  const [error, setError] = useState('');
  
  // Dashboard Analytics State
  const [activeView, setActiveView] = useState<'overview' | 'paid' | 'pending'>('overview');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // --- Fetching Logic ---
  const fetchStaff = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/staff/payroll-preview`, { withCredentials: true });
      setStaff(res.data || []);
      setError('');
    } catch (err: any) {
      console.error("Payroll preview staff error:", err);
      setStaff([]);
    }
  };

  const fetchPayroll = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(
        `${API_URL}/api/payroll/${selectedPeriod.year}/${selectedPeriod.month}`,
        { withCredentials: true }
      );
      setPayslips(res.data || []);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        const msg = err.response?.data?.message || "Failed to load payroll";
        setError(msg);
        toast.error(msg);
      }
      setPayslips([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchPayroll();
  }, [selectedPeriod]);

  const handleGeneratePayroll = async () => {
    if (!confirm(`Generate payroll for ${format(new Date(selectedPeriod.year, selectedPeriod.month - 1), 'MMMM yyyy')}?`)) return;

    setIsGenerating(true);
    try {
      await axios.post(`${API_URL}/api/payroll/generate`, selectedPeriod, { withCredentials: true });
      toast.success("Payroll generated successfully!");
      await fetchPayroll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to generate payroll");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Data Processing for Charts ---
  const displayData = useMemo(() => {
    if (!staff.length) return [];
    return staff.map((member: any) => {
      const payslip = payslips.find((p: any) => p.user._id === member._id);
      if (payslip) return payslip;
      const base = member.salary || 15000;
      return {
        _id: member._id + '-preview',
        user: member,
        baseSalary: base,
        bonus: 0,
        deductions: 0,
        tax: Math.round(base * 0.30),
        pension: Math.round(base * 0.07),
        netPay: Math.round(base - (base * 0.30) - (base * 0.07)),
        status: 'pending',
        isGenerated: false,
        period: selectedPeriod,
      };
    });
  }, [staff, payslips, selectedPeriod]);

  const stats = useMemo(() => {
    const total = displayData.reduce((sum, p) => sum + p.netPay, 0);
    const paid = payslips.filter(p => p.status === 'paid').length;
    const pending = displayData.length - paid; 
    const generated = payslips.length;
    return { total, paid, pending, generated, totalStaff: staff.length };
  }, [displayData, payslips, staff]);

  // Chart Data: Department Costs
  const departmentData = useMemo(() => {
    const grouped = displayData.reduce((acc: any, curr: any) => {
      const role = curr.user.role || 'Other';
      if (!acc[role]) acc[role] = { name: role, value: 0 };
      acc[role].value += curr.netPay;
      return acc;
    }, {});
    return Object.values(grouped);
  }, [displayData]);

  // Chart Data: Status Breakdown
  const statusData = useMemo(() => {
    return [
      { name: 'Paid', value: stats.paid, color: '#10B981' }, // Emerald
      { name: 'Pending', value: stats.pending, color: '#F59E0B' }, // Amber
    ];
  }, [stats]);

  // Chart Data: Salary Components
  const salaryComponentsData = useMemo(() => {
    const data = displayData.reduce((acc: any, curr: any) => {
      acc.netPay += curr.netPay;
      acc.tax += (curr.tax || 0) + (curr.pension || 0);
      acc.base += curr.baseSalary;
      return acc;
    }, { name: 'Total Distribution', netPay: 0, tax: 0, base: 0 });
    return [
      { name: 'Net Pay', value: data.netPay, fill: '#F59E0B' },
      { name: 'Tax & Pension', value: data.tax, fill: '#EF4444' },
    ];
  }, [displayData]);

  const currentPeriodStr = format(new Date(selectedPeriod.year, selectedPeriod.month - 1), 'MMMM yyyy');
  const COLORS = ['#F59E0B', '#F97316', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6'];

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-gray-900 p-4 sm:p-6 lg:p-8 font-sans">
      <Toaster position="top-right" />

      {/* --- Royal Header --- */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
              Payroll <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Dashboard</span>
            </h1>
            <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
              <Calendar size={18} className="text-amber-500" />
              Period: {currentPeriodStr}
            </p>
          </motion.div>

          <div className="flex gap-4 items-center bg-white p-2 rounded-2xl shadow-sm border border-gray-200">
            <select
              value={selectedPeriod.month}
              onChange={(e) => setSelectedPeriod(prev => ({ ...prev, month: +e.target.value }))}
              className="bg-transparent font-bold text-gray-700 outline-none cursor-pointer px-2"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'short' })}</option>
              ))}
            </select>
            <div className="h-6 w-[1px] bg-gray-300"></div>
            <input
              type="number"
              value={selectedPeriod.year}
              onChange={(e) => setSelectedPeriod(prev => ({ ...prev, year: +e.target.value }))}
              className="w-16 bg-transparent font-bold text-gray-700 outline-none text-center"
            />
             <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGeneratePayroll}
              disabled={isGenerating}
              className={`ml-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center gap-2 ${
                isGenerating
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-orange-500/30'
              }`}
            >
              {isGenerating ? <Activity className="animate-spin" size={16} /> : <DollarSign size={16} />}
              {isGenerating ? 'Processing...' : 'Generate'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* --- Interactive Stat Cards --- */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Payroll" 
          value={`ETB ${stats.total.toLocaleString()}`} 
          subValue="Estimated Net Pay"
          icon={<DollarSign size={24} />} 
          color="bg-gradient-to-br from-green-400 to-green-600"
          isActive={activeView === 'overview'}
          onClick={() => setActiveView('overview')}
        />
        <StatCard 
          title="Paid Staff" 
          value={`${stats.paid} / ${stats.totalStaff}`} 
          subValue="Completed Transactions"
          icon={<Users size={24} />} 
          color="bg-gradient-to-br from-blue-400 to-blue-600"
          isActive={activeView === 'paid'}
          onClick={() => setActiveView('paid')}
        />
        <StatCard 
          title="Pending Actions" 
          value={stats.pending.toString()} 
          subValue="Requires Attention"
          icon={<Clock size={24} />} 
          color="bg-gradient-to-br from-amber-400 to-orange-500"
          isActive={activeView === 'pending'}
          onClick={() => setActiveView('pending')}
        />
      </div>

      {/* --- Dynamic Analytics Section --- */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="max-w-7xl mx-auto mb-10"
        >
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-amber-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500"></div>
            
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              {/* Left Side: Description */}
              <div className="lg:w-1/3 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-bold">
                  {activeView === 'overview' && <TrendingUp size={16} />}
                  {activeView === 'paid' && <PieIcon size={16} />}
                  {activeView === 'pending' && <AlertCircle size={16} />}
                  {activeView === 'overview' ? 'Financial Overview' : activeView === 'paid' ? 'Payment Distribution' : 'Pending Payments'}
                </div>
                <h2 className="text-3xl font-black text-gray-800">
                  {activeView === 'overview' && "Monthly Expenditure Analysis"}
                  {activeView === 'paid' && "Completion Status Breakdown"}
                  {activeView === 'pending' && "Outstanding Payments"}
                </h2>
                <p className="text-gray-500 leading-relaxed">
                  {activeView === 'overview' && "Visualize the distribution of funds across different departments. This helps in understanding the major cost centers for the current month."}
                  {activeView === 'paid' && "A quick glance at how many staff members have been paid versus those who are still waiting. Ensure 100% completion before month-end."}
                  {activeView === 'pending' && "Monitor pending transactions to avoid delays in staff compensation. Prioritize clearing these items."}
                </p>
              </div>

              {/* Right Side: Charts */}
              <div className="lg:w-2/3 w-full h-[320px] flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  {activeView === 'overview' ? (
                    <BarChart data={departmentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Amount" radius={[8, 8, 0, 0]}>
                        {departmentData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  ) : activeView === 'paid' ? (
                    // --- FIXED PIE CHART ---
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%" // Centered horizontally
                        cy="50%" // Centered vertically
                        innerRadius={80} 
                        outerRadius={110} // Reduced slightly to prevent clipping
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend 
                        verticalAlign="bottom" 
                        align="center" 
                        iconType="circle"
                        wrapperStyle={{ paddingTop: '20px' }} 
                      />
                    </PieChart>
                  ) : (
                     // Pending View: Distribution of Cost
                     <BarChart data={salaryComponentsData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#f0f0f0" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                         {salaryComponentsData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* --- Main Table Section --- */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
             <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
             <p className="mt-4 text-amber-800 font-medium">Loading Royal Payroll...</p>
          </div>
        ) : displayData.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl shadow-xl border border-dashed border-gray-300">
            <Users className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-xl font-bold text-gray-600">No active staff members found</p>
            <p className="text-gray-400">Add employees in Staff Management to begin.</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {payslips.length === 0 && (
              <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-full text-amber-600">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-900">Payroll Not Yet Generated</h3>
                  <p className="text-amber-700">The table below shows a preview. Click "Generate" to finalize for this month.</p>
                </div>
              </div>
            )}
            
            <PayrollTable
              payslips={
                activeView === 'paid' ? displayData.filter(p => p.status === 'paid') :
                activeView === 'pending' ? displayData.filter(p => p.status === 'pending') :
                displayData
              }
              onViewPayslip={setViewingPayslip}
              isGenerated={payslips.length > 0}
              isAdmin={true} 
            />
          </motion.div>
        )}
      </div>

      {/* Payslip Modal */}
      <AnimatePresence>
        {viewingPayslip && (
          <PayslipModal
            payslip={viewingPayslip}
            onClose={() => setViewingPayslip(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}