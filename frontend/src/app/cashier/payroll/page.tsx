'use client';

import { useState, useEffect, useMemo } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import PayrollTable from './components/PayrollTable';
import PayslipModal from './components/PayslipModal';
import { DollarSign, Users, Clock, Calendar } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext'; // Import translation hook

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_URL= process.env.NEXT_PUBLIC_API_URL || 'https://mesertehotelinformationmanagementsystem.onrender.com';
const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    className="bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-xl border border-amber-200 w-full"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-amber-700 font-semibold text-sm">{title}</p>
        <p className="text-xl sm:text-2xl font-black text-gray-800 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${color} shadow-md`}>{icon}</div>
    </div>
  </motion.div>
);

export default function PayrollClient() {
  const { t, language } = useLanguage(); // Use translation

  const [staff, setStaff] = useState<any[]>([]);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [viewingPayslip, setViewingPayslip] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/me`, { withCredentials: true });
        setUserRole(res.data.user.role.toLowerCase());
      } catch (err) {
        console.error("Error fetching user role", err);
        setUserRole('cashier');
      }
    };
    fetchUser();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [staffRes, payrollRes] = await Promise.all([
        axios.get(`${API_URL}/api/staff/payroll-preview`, { withCredentials: true }),
        axios.get(`${API_URL}/api/payroll/${selectedPeriod.year}/${selectedPeriod.month}`, { withCredentials: true }).catch(() => ({ data: [] }))
      ]);
      setStaff(staffRes.data);
      setPayslips(payrollRes.data);
    } catch (err) {
      toast.error(t('failedLoad') || "Failed to load payroll data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  const handleGeneratePayroll = async () => {
    if (!confirm(t('generateConfirm') + ` ${selectedPeriod.month}/${selectedPeriod.year}?`)) return;
    try {
      await axios.post(`${API_URL}/api/payroll/generate`, selectedPeriod, { withCredentials: true });
      toast.success(t('payrollGeneratedSuccess'));
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('failedGenerate'));
    }
  };

  // Original function returning boolean (needed for Modal)
  const handleUpdatePayslip = async (id: string, updates: any): Promise<boolean> => {
    try {
      const { data } = await axios.put(`${API_URL}/api/payroll/${id}`, updates, { withCredentials: true });
      setPayslips(prev => prev.map(p => p._id === data._id ? data : p));
      setViewingPayslip(data);
      return true;
    } catch (err) {
      toast.error(t('failedUpdate') || "Update failed");
      return false;
    }
  };

  // Wrapper function returning void (needed for Table) to fix the type error
  const handleUpdatePayslipVoid = async (id: string, updates: any): Promise<void> => {
    await handleUpdatePayslip(id, updates);
  };

  const displayData = useMemo(() => {
    return staff.map(s => {
      const p = payslips.find(ps => ps.user._id === s._id);
      if (p) return p;
      const base = s.salary || 15000;
      const { tax, pension } = calculateEthiopianTax(base);
      return {
        _id: null,
        user: s,
        baseSalary: base,
        bonus: 0,
        deductions: 0,
        tax,
        pension,
        netPay: base - tax - pension,
        status: 'pending',
      };
    });
  }, [staff, payslips]);

  const calculateEthiopianTax = (gross: number) => {
    let tax = 0;
    const pension = Math.round(gross * 0.07);
    if (gross <= 600) tax = 0;
    else if (gross <= 1650) tax = gross * 0.10 - 60;
    else if (gross <= 3200) tax = gross * 0.15 - 142.50;
    else if (gross <= 5250) tax = gross * 0.20 - 302.50;
    else if (gross <= 7800) tax = gross * 0.25 - 565;
    else if (gross <= 10900) tax = gross * 0.30 - 955;
    else tax = gross * 0.35 - 1500;
    return { tax: Math.round(tax), pension };
  };

  const stats = useMemo(() => {
    const total = displayData.reduce((sum, p) => sum + p.netPay, 0);
    const paid = payslips.filter(p => p.status === 'paid').length;
    const pending = payslips.filter(p => p.status === 'pending').length;
    const generated = payslips.length;
    const period = new Date(selectedPeriod.year, selectedPeriod.month - 1).toLocaleString(
      language === 'am' ? 'am-ET' : 'en-US',
      { month: 'long', year: 'numeric' }
    );
    return { total, paid, pending, generated, totalStaff: staff.length, period };
  }, [displayData, payslips, staff, selectedPeriod, language]);

  const isAdminOrManager = ['admin', 'manager'].includes(userRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4 sm:p-6">
      <Toaster position="top-right" />

      {/* Royal Header */}
      <div className="text-center mb-8 sm:mb-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-700 leading-tight"
          style={{ fontFamily: language === 'am' ? "'Noto Sans Ethiopic', serif" : "'Playfair Display', serif" }}
        >
          {t('payrollDashboard')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg sm:text-2xl text-amber-700 mt-2 sm:mt-3 font-medium"
        >
          {t('whereExcellenceMeetsCompensation')}
        </motion.p>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Period Selector + Generate Button */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">
            <select
              value={selectedPeriod.month}
              onChange={e => setSelectedPeriod(p => ({ ...p, month: +e.target.value }))}
              className="w-full sm:w-auto px-6 py-3 bg-white border-2 border-amber-300 rounded-xl font-bold text-lg shadow-md text-gray-700 cursor-pointer"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={i+1}>
                  {new Date(2025, i).toLocaleString(language === 'am' ? 'am-ET' : 'en-US', { month: 'long' })}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={selectedPeriod.year}
              onChange={e => setSelectedPeriod(p => ({ ...p, year: +e.target.value }))}
              className="w-full sm:w-28 px-4 py-3 border-2 border-amber-300 rounded-xl font-bold text-center shadow-md text-gray-700"
            />
          </div>

          {isAdminOrManager && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGeneratePayroll}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all"
            >
              {t('generate')} {t('payrollDashboard').split(' ')[0]}
            </motion.button>
          )}
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title={t('totalPayroll')}
            value={`ETB ${stats.total.toLocaleString()}`}
            icon={<DollarSign size={28} className="text-green-600 sm:w-8 sm:h-8" />}
            color="bg-green-100"
          />
          <StatCard
            title={t('paidStaff')}
            value={`${stats.paid}/${stats.generated}`}
            icon={<Users size={28} className="text-blue-600 sm:w-8 sm:h-8" />}
            color="bg-blue-100"
          />
          <StatCard
            title={t('pendingPayments')}
            value={stats.pending}
            icon={<Clock size={28} className="text-yellow-600 sm:w-8 sm:h-8" />}
            color="bg-yellow-100"
          />
          <StatCard
            title={t('period')}
            value={stats.period}
            icon={<Calendar size={28} className="text-purple-600 sm:w-8 sm:h-8" />}
            color="bg-purple-100"
          />
        </div>

        {/* Not Generated Warning */}
        {!isAdminOrManager && payslips.length === 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-pink-100 border-l-4 border-pink-500 p-5 rounded-xl shadow-sm"
          >
            <p className="font-bold text-pink-800">{t('payrollNotGenerated')}</p>
          </motion.div>
        )}

        {/* Loading or Table */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-xl text-gray-600 font-medium">
              {t('loadingPayroll')}...
            </p>
          </div>
        ) : (
          <PayrollTable
            payslips={displayData}
            onViewPayslip={setViewingPayslip}
            // FIX: Pass the void wrapper to satisfy PayrollTable's interface
            onUpdatePayslip={handleUpdatePayslipVoid}
            isGenerated={payslips.length > 0}
            isAdmin={isAdminOrManager}
          />
        )}
      </div>

      {/* Payslip Modal */}
      <AnimatePresence>
        {viewingPayslip && (
          <PayslipModal
            payslip={viewingPayslip}
            onClose={() => setViewingPayslip(null)}
            // Pass the original boolean promise function to Modal if it expects that
            onUpdate={isAdminOrManager ? handleUpdatePayslip : undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}/*'use client';

import { useState, useEffect, useMemo } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import PayrollTable from './components/PayrollTable';
import PayslipModal from './components/PayslipModal';
import { DollarSign, Users, Clock, Calendar } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext'; // Import translation hook

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    className="bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-xl border border-amber-200 w-full"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-amber-700 font-semibold text-sm">{title}</p>
        <p className="text-xl sm:text-2xl font-black text-gray-800 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${color} shadow-md`}>{icon}</div>
    </div>
  </motion.div>
);

export default function PayrollClient() {
  const { t, language } = useLanguage(); // Use translation

  const [staff, setStaff] = useState<any[]>([]);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [viewingPayslip, setViewingPayslip] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/me`, { withCredentials: true });
        setUserRole(res.data.user.role.toLowerCase());
      } catch (err) {
        console.error("Error fetching user role", err);
        setUserRole('cashier');
      }
    };
    fetchUser();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [staffRes, payrollRes] = await Promise.all([
        axios.get(`${API_URL}/api/staff/payroll-preview`, { withCredentials: true }),
        axios.get(`${API_URL}/api/payroll/${selectedPeriod.year}/${selectedPeriod.month}`, { withCredentials: true }).catch(() => ({ data: [] }))
      ]);
      setStaff(staffRes.data);
      setPayslips(payrollRes.data);
    } catch (err) {
      toast.error(t('failedLoad') || "Failed to load payroll data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  const handleGeneratePayroll = async () => {
    if (!confirm(t('generateConfirm') + ` ${selectedPeriod.month}/${selectedPeriod.year}?`)) return;
    try {
      await axios.post(`${API_URL}/api/payroll/generate`, selectedPeriod, { withCredentials: true });
      toast.success(t('payrollGeneratedSuccess'));
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('failedGenerate'));
    }
  };

  const handleUpdatePayslip = async (id: string, updates: any): Promise<boolean> => {
    try {
      const { data } = await axios.put(`${API_URL}/api/payroll/${id}`, updates, { withCredentials: true });
      setPayslips(prev => prev.map(p => p._id === data._id ? data : p));
      setViewingPayslip(data);
      return true;
    } catch (err) {
      toast.error(t('failedUpdate') || "Update failed");
      return false;
    }
  };

  const displayData = useMemo(() => {
    return staff.map(s => {
      const p = payslips.find(ps => ps.user._id === s._id);
      if (p) return p;
      const base = s.salary || 15000;
      const { tax, pension } = calculateEthiopianTax(base);
      return {
        _id: null,
        user: s,
        baseSalary: base,
        bonus: 0,
        deductions: 0,
        tax,
        pension,
        netPay: base - tax - pension,
        status: 'pending',
      };
    });
  }, [staff, payslips]);

  const calculateEthiopianTax = (gross: number) => {
    let tax = 0;
    const pension = Math.round(gross * 0.07);
    if (gross <= 600) tax = 0;
    else if (gross <= 1650) tax = gross * 0.10 - 60;
    else if (gross <= 3200) tax = gross * 0.15 - 142.50;
    else if (gross <= 5250) tax = gross * 0.20 - 302.50;
    else if (gross <= 7800) tax = gross * 0.25 - 565;
    else if (gross <= 10900) tax = gross * 0.30 - 955;
    else tax = gross * 0.35 - 1500;
    return { tax: Math.round(tax), pension };
  };

  const stats = useMemo(() => {
    const total = displayData.reduce((sum, p) => sum + p.netPay, 0);
    const paid = payslips.filter(p => p.status === 'paid').length;
    const pending = payslips.filter(p => p.status === 'pending').length;
    const generated = payslips.length;
    const period = new Date(selectedPeriod.year, selectedPeriod.month - 1).toLocaleString(
      language === 'am' ? 'am-ET' : 'en-US',
      { month: 'long', year: 'numeric' }
    );
    return { total, paid, pending, generated, totalStaff: staff.length, period };
  }, [displayData, payslips, staff, selectedPeriod, language]);

  const isAdminOrManager = ['admin', 'manager'].includes(userRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4 sm:p-6">
      <Toaster position="top-right" />

     
      <div className="text-center mb-8 sm:mb-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-700 leading-tight"
          style={{ fontFamily: language === 'am' ? "'Noto Sans Ethiopic', serif" : "'Playfair Display', serif" }}
        >
          {t('payrollDashboard')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg sm:text-2xl text-amber-700 mt-2 sm:mt-3 font-medium"
        >
          {t('whereExcellenceMeetsCompensation')}
        </motion.p>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
       
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">
            <select
              value={selectedPeriod.month}
              onChange={e => setSelectedPeriod(p => ({ ...p, month: +e.target.value }))}
              className="w-full sm:w-auto px-6 py-3 bg-white border-2 border-amber-300 rounded-xl font-bold text-lg shadow-md text-gray-700 cursor-pointer"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={i+1}>
                  {new Date(2025, i).toLocaleString(language === 'am' ? 'am-ET' : 'en-US', { month: 'long' })}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={selectedPeriod.year}
              onChange={e => setSelectedPeriod(p => ({ ...p, year: +e.target.value }))}
              className="w-full sm:w-28 px-4 py-3 border-2 border-amber-300 rounded-xl font-bold text-center shadow-md text-gray-700"
            />
          </div>

          {isAdminOrManager && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGeneratePayroll}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all"
            >
              {t('generate')} {t('payrollDashboard').split(' ')[0]}
            </motion.button>
          )}
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title={t('totalPayroll')}
            value={`ETB ${stats.total.toLocaleString()}`}
            icon={<DollarSign size={28} className="text-green-600 sm:w-8 sm:h-8" />}
            color="bg-green-100"
          />
          <StatCard
            title={t('paidStaff')}
            value={`${stats.paid}/${stats.generated}`}
            icon={<Users size={28} className="text-blue-600 sm:w-8 sm:h-8" />}
            color="bg-blue-100"
          />
          <StatCard
            title={t('pendingPayments')}
            value={stats.pending}
            icon={<Clock size={28} className="text-yellow-600 sm:w-8 sm:h-8" />}
            color="bg-yellow-100"
          />
          <StatCard
            title={t('period')}
            value={stats.period}
            icon={<Calendar size={28} className="text-purple-600 sm:w-8 sm:h-8" />}
            color="bg-purple-100"
          />
        </div>

       
        {!isAdminOrManager && payslips.length === 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-pink-100 border-l-4 border-pink-500 p-5 rounded-xl shadow-sm"
          >
            <p className="font-bold text-pink-800">{t('payrollNotGenerated')}</p>
          </motion.div>
        )}

       
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-xl text-gray-600 font-medium">
              {t('loadingPayroll')}...
            </p>
          </div>
        ) : (
          <PayrollTable
            payslips={displayData}
            onViewPayslip={setViewingPayslip}
            onUpdatePayslip={handleUpdatePayslip}
            isGenerated={payslips.length > 0}
            isAdmin={isAdminOrManager}
          />
        )}
      </div>

     
      <AnimatePresence>
        {viewingPayslip && (
          <PayslipModal
            payslip={viewingPayslip}
            onClose={() => setViewingPayslip(null)}
            onUpdate={isAdminOrManager ? handleUpdatePayslip : undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}*/