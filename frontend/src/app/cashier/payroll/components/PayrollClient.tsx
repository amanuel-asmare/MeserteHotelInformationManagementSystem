
/*'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import api from '../../../../lib/api';
import { Calendar, Users, ClockIcon, DollarSign } from 'lucide-react';
import PayrollTable from './PayrollTable';
import PayslipModal from './PayslipModal';
import { format } from 'date-fns';
import { useAuth } from '../../../../../context/AuthContext';
import { Toaster } from 'react-hot-toast';
const StatCard = ({ title, value, icon, color }) => (
  <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-xl border border-amber-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
      </div>
      <div className={`p-4 rounded-full ${color}`}>{icon}</div>
    </div>
  </motion.div>
);

export default function PayrollClient() {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);           // All staff
  const [payslips, setPayslips] = useState([]);     // Generated payslips
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [viewingPayslip, setViewingPayslip] = useState(null);
  const [error, setError] = useState('');

  // Fetch all active staff
  const fetchStaff = async () => {
    try {
      const { data } = await api.get('/api/staff/active');
      setStaff(data);
    } catch (err) {
      console.error("Failed to load staff:", err);
    }
  };

  // Fetch generated payslips for selected period
  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/payroll/${selectedPeriod.year}/${selectedPeriod.month}`);
      setPayslips(data);
    } catch (err) {
      if (err.response?.status !== 404) {
        setError(err.response?.data?.message || "Failed to load payroll");
      }
      setPayslips([]); // No payroll generated yet
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStaff();
      fetchPayroll();
    }
  }, [selectedPeriod, user]);

  const handleGeneratePayroll = async () => {
  if (!confirm(`Generate payroll for ${format(new Date(selectedPeriod.year, selectedPeriod.month - 1), 'MMMM yyyy')}?`)) return;

  setIsGenerating(true);
  setError('');

  try {
    await api.post('/api/payroll/generate', selectedPeriod);
    await fetchPayroll(); // This will now get real payslips
    toast.success("Payroll generated successfully!"); // Optional: add toast
  } catch (err: any) {
    const msg = err.response?.data?.message || "Failed to generate payroll";
    setError(msg);
    console.error("Generation error:", err.response || err);
  } finally {
    setIsGenerating(false);
  }
};

  // Merge staff with payslip data if exists
  const displayData = useMemo(() => {
    return staff.map(s => {
      const payslip = payslips.find(p => p.user._id === s._id);
      if (payslip) return payslip;
      return {
        _id: s._id,
        user: s,
        baseSalary: s.salary,
        bonus: 0,
        deductions: 0,
        tax: Math.round(s.salary * 0.3), // Example 30% tax
        pension: Math.round(s.salary * 0.07),
        netPay: Math.round(s.salary * 0.63), // Approx after tax & pension
        status: 'pending',
        isGenerated: false,
      };
    });
  }, [staff, payslips]);

  const stats = useMemo(() => {
    const generated = payslips.length;
    const total = displayData.reduce((sum, p) => sum + p.netPay, 0);
    const paid = payslips.filter(p => p.status === 'paid').length;
    const pending = payslips.filter(p => p.status === 'pending').length;
    return { total, paid, pending, generated, totalStaff: staff.length };
  }, [displayData, payslips, staff]);

  return (
    <div className="space-y-8">
    <Toaster position="top-right" />
      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
          PAYROLL MANAGEMENT
        </h1>
        <p className="text-xl text-amber-700 mt-3">Where Excellence Meets Royal Compensation</p>
      </motion.div>

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3">
          <select value={selectedPeriod.month} onChange={e => setSelectedPeriod(p => ({ ...p, month: parseInt(e.target.value) }))}
            className="px-5 py-3 border-2 border-amber-300 rounded-xl font-semibold">
            {[...Array(12)].map((_, i) => (
              <option key={i+1} value={i+1}>{new Date(2025, i).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <input type="number" value={selectedPeriod.year} onChange={e => setSelectedPeriod(p => ({ ...p, year: parseInt(e.target.value) }))}
            className="w-24 px-4 py-3 border-2 border-amber-300 rounded-xl font-semibold text-center" min="2020" />
        </div>

        <div className="flex gap-3">
          {user?.role !== 'cashier' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGeneratePayroll}
              disabled={isGenerating || payslips.length === staff.length}
              className={`px-6 py-3 rounded-xl font-bold shadow-lg ${
                payslips.length === staff.length
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 text-black'
              }`}
            >
              {isGenerating ? 'Generating...' : payslips.length > 0 ? 'Regenerate Payroll' : 'Generate Payroll'}
            </motion.button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Payroll" value={`ETB ${stats.total.toLocaleString()}`} icon={<DollarSign size={32} className="text-green-600" />} color="bg-green-100" />
        <StatCard title="Paid" value={`${stats.paid}/${stats.generated}`} icon={<Users size={32} className="text-blue-600" />} color="bg-blue-100" />
        <StatCard title="Pending" value={stats.pending} icon={<ClockIcon size={32} className="text-yellow-600" />} color="bg-yellow-100" />
        <StatCard title="Period" value={format(new Date(selectedPeriod.year, selectedPeriod.month - 1), 'MMMM yyyy')} icon={<Calendar size={32} className="text-purple-600" />} color="bg-purple-100" />
      </div>

      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">{error}</div>}

      {loading ? (
        <div className="text-center py-20 text-2xl">Loading royal payroll...</div>
      ) : displayData.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl">
          <p className="text-xl text-gray-600">No active staff found.</p>
        </div>
      ) : (
        <>
          {payslips.length === 0 && (
            <div className="text-center py-6 bg-yellow-50 border border-yellow-300 rounded-xl">
              <p className="text-lg font-semibold text-yellow-800">
                Payroll not generated for {format(new Date(selectedPeriod.year, selectedPeriod.month - 1), 'MMMM yyyy')} yet.
              </p>
              {user?.role !== 'cashier' && (
                <p className="text-amber-600 mt-2">Click "Generate Payroll" to create payslips</p>
              )}
            </div>
          )}

          <PayrollTable
            payslips={displayData}
            onViewPayslip={setViewingPayslip}
            onUpdatePayslip={async (id, updates) => {
              const { data } = await api.put(`/api/payroll/${id}`, updates);
              setPayslips(prev => prev.map(p => p._id === data._id ? data : p));
            }}
            isGenerated={payslips.length > 0}
          />
        </>
      )}

      {viewingPayslip && (
        <PayslipModal
          payslip={viewingPayslip}
          onClose={() => setViewingPayslip(null)}
          onUpdate={async (id, updates) => {
            const { data } = await api.put(`/api/payroll/${id}`, updates);
            setPayslips(prev => prev.map(p => p._id === data._id ? data : p));
            setViewingPayslip(data);
          }}
        />
      )}
    </div>
  );
}*/
'use client';
import { Button, Modal } from 'react-native';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import PayrollTable from './PayrollTable';
import PayslipModal from './PayslipModal';
import { DollarSign, Users, Clock, Calendar, Activity } from 'lucide-react';
import { format } from 'date-fns';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    className="bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-xl border border-amber-200"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-amber-700 font-semibold text-sm">{title}</p>
        <p className="text-2xl font-black text-gray-800 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${color} shadow-md`}>{icon}</div>
    </div>
  </motion.div>
);

export default function PayrollClient() {
  const [staff, setStaff] = useState<any[]>([]);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [viewingPayslip, setViewingPayslip] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');

  // Fetch User Role
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/me`, { withCredentials: true });
        // Normalized role check
        const role = res.data.user?.role?.toLowerCase().trim() || 'cashier';
        setUserRole(role);
      } catch (err) {
        console.error("Error fetching user role", err);
        setUserRole('cashier'); // Default fallback
      }
    };
    fetchUser();
  }, []);

  // Fetch Data
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
      toast.error("Failed to load payroll data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  // Generate Payroll
  const handleGeneratePayroll = async () => {
    if (!confirm("Generate payroll for this period?")) return;
    setIsGenerating(true);
    try {
      await axios.post(`${API_URL}/api/payroll/generate`, selectedPeriod, { withCredentials: true });
      toast.success("Payroll generated!");
      await fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to generate payroll");
    } finally {
      setIsGenerating(false);
    }
  };

  // Update Payslip (Passed to Modal)
  const handleUpdatePayslip = async (id: string, updates: any): Promise<boolean> => {
    try {
      const { data } = await axios.put(`${API_URL}/api/payroll/${id}`, updates, { withCredentials: true });
      
      // Update local state immediately
      setPayslips(prev => prev.map(p => p._id === data._id ? data : p));
      setViewingPayslip(data); // Update modal view with new data
      
      return true; // Success
    } catch (err) {
      console.error("Update failed", err);
      toast.error("Update failed");
      return false; // Failure
    }
  };

  // Calculate Tax (Same logic as backend/modal for preview)
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

  // Prepare Data for Table
  const displayData = useMemo(() => {
    return staff.map(s => {
      const p = payslips.find((ps: any) => ps.user._id === s._id);
      if (p) return p;

      const base = s.salary || 0; // Default 0 if undefined
      const { tax, pension } = calculateEthiopianTax(base);
      return {
        _id: null, // No ID means not generated yet
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

  const stats = useMemo(() => {
    const total = displayData.reduce((sum, p) => sum + p.netPay, 0);
    const paid = payslips.filter((p: any) => p.status === 'paid').length;
    const pending = payslips.filter((p: any) => p.status === 'pending').length;
    const generated = payslips.length;
    const period = new Date(selectedPeriod.year, selectedPeriod.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });

    return { total, paid, pending, generated, totalStaff: staff.length, period };
  }, [displayData, payslips, staff, selectedPeriod]);

  // Permissions Logic
  const isAdminOrManager = ['admin', 'manager'].includes(userRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-6">
      <Toaster position="top-right" />

      <div className="text-center mb-10">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-700">
          PAYROLL MANAGEMENT
        </h1>
        <p className="text-2xl text-amber-700 mt-3">Where Excellence Meets Royal Compensation</p>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex gap-4">
            <select 
              value={selectedPeriod.month} 
              onChange={e => setSelectedPeriod(p => ({ ...p, month: +e.target.value }))} 
              className="px-6 py-3 bg-white border-2 border-amber-300 rounded-xl font-bold text-lg shadow-md text-gray-700 cursor-pointer"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={i+1}>{new Date(2025, i).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
            <input 
              type="number" 
              value={selectedPeriod.year} 
              onChange={e => setSelectedPeriod(p => ({ ...p, year: +e.target.value }))} 
              className="w-28 px-4 py-3 border-2 border-amber-300 rounded-xl font-bold text-center shadow-md text-gray-700" 
            />
          </div>
          
          {/* Only Admin/Manager can see Generate Button */}
          {isAdminOrManager && (
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              onClick={handleGeneratePayroll}
              disabled={isGenerating}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 disabled:opacity-70"
            >
              {isGenerating ? <Activity className="animate-spin" /> : null}
              {isGenerating ? 'Generating...' : 'Generate Payroll'}
            </motion.button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard title="Total Payroll" value={`ETB ${stats.total.toLocaleString()}`} icon={<DollarSign size={32} className="text-green-600" />} color="bg-green-100" />
          <StatCard title="Paid" value={`${stats.paid}/${stats.generated}`} icon={<Users size={32} className="text-blue-600" />} color="bg-blue-100" />
          <StatCard title="Pending" value={stats.pending} icon={<Clock size={32} className="text-yellow-600" />} color="bg-yellow-100" />
          <StatCard title="Period" value={stats.period} icon={<Calendar size={32} className="text-purple-600" />} color="bg-purple-100" />
        </div>

        {/* Warning if not generated */}
        {!isAdminOrManager && payslips.length === 0 && (
          <div className="bg-pink-100 border-l-4 border-pink-500 p-5 rounded-xl shadow-sm">
            <p className="font-bold text-pink-800">Payroll has not been generated for this period yet.</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
             <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-600 mx-auto"></div>
             <p className="mt-4 text-xl text-gray-600 font-medium">Loading payroll data...</p>
          </div>
        ) : (
          <PayrollTable
            payslips={displayData}
            onViewPayslip={setViewingPayslip}
            // Pass update function if admin/manager. This enables "Mark as Paid" in the table
            onUpdatePayslip={isAdminOrManager ? handleUpdatePayslip : undefined}
            isGenerated={payslips.length > 0}
            isAdmin={isAdminOrManager} 
          />
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {viewingPayslip && (
          <PayslipModal
            payslip={viewingPayslip}
            onClose={() => setViewingPayslip(null)}
            // CRITICAL: We pass the update function here if the user is authorized.
            // The Modal uses the existence of this prop to show/hide the Edit button.
            onUpdate={isAdminOrManager ? handleUpdatePayslip : undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}