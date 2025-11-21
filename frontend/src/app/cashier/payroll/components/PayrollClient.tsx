'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import api from '../../../../lib/api';
import { Calendar, Users, DollarSign, AlertTriangle } from 'lucide-react';
import PayrollTable from './PayrollTable';
import PayslipModal from './PayslipModal';
import { format } from 'date-fns';
import { useAuth } from '../../../../../context/AuthContext';

const StatCard = ({ title, value, icon, loading }) => (
    <div className="bg-white p-5 rounded-lg shadow-md flex items-center space-x-4">
        {loading ? <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div> : <div className="p-3 rounded-full bg-gray-100">{icon}</div>}
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            {loading ? <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mt-1"></div> : <p className="text-xl font-semibold text-gray-800">{value}</p>}
        </div>
    </div>
);

export default function PayrollClient() {
    const { user } = useAuth();
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });
    const [viewingPayslip, setViewingPayslip] = useState(null);
    const [error, setError] = useState('');

    const fetchPayroll = async (period) => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.get(`/api/payroll/${period.year}/${period.month}`);
            setPayslips(data);
        } catch (err) {
            if (err.response?.status === 403) {
                 setError("You do not have permission to view this resource.");
            }
            setPayslips([]); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
          fetchPayroll(selectedPeriod);
        }
    }, [selectedPeriod, user]);

    const handleGeneratePayroll = async () => {
        if (!confirm(`Are you sure you want to generate payroll for ${format(new Date(selectedPeriod.year, selectedPeriod.month - 1), 'MMMM yyyy')}? This action cannot be undone.`)) return;

        setIsGenerating(true);
        setError('');
        try {
            await api.post('/api/payroll/generate', selectedPeriod);
            await fetchPayroll(selectedPeriod);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to generate payroll.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleUpdatePayslip = async (payslipId, updates) => {
        try {
            const { data: updatedPayslip } = await api.put(`/api/payroll/${payslipId}`, updates);
            setPayslips(prev => prev.map(p => p._id === updatedPayslip._id ? updatedPayslip : p));
            if (viewingPayslip?._id === updatedPayslip._id) {
                setViewingPayslip(updatedPayslip);
            }
            return true;
        } catch(err) {
            alert(err.response?.data?.message || "Update failed.");
            return false;
        }
    };

    const stats = useMemo(() => {
        const totalPayroll = payslips.reduce((sum, p) => sum + p.netPay, 0);
        const paidCount = payslips.filter(p => p.status === 'paid').length;
        return { totalPayroll, paidCount };
    }, [payslips]);

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Payroll Management</h1>
                    <p className="text-gray-500 mt-1">Generate, view, and manage employee monthly salaries.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <input type="number" value={selectedPeriod.month} onChange={e => setSelectedPeriod(p => ({ ...p, month: parseInt(e.target.value) }))} className="p-2 border rounded-md w-24" min="1" max="12" />
                    <input type="number" value={selectedPeriod.year} onChange={e => setSelectedPeriod(p => ({ ...p, year: parseInt(e.target.value) }))} className="p-2 border rounded-md w-28" />
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard loading={loading} title="Total Net Payroll" value={`ETB ${stats.totalPayroll.toLocaleString('en-US', {minimumFractionDigits: 2})}`} icon={<DollarSign className="text-green-500" />} />
                <StatCard loading={loading} title="Employees Paid" value={`${stats.paidCount} / ${payslips.length}`} icon={<Users className="text-blue-500" />} />
                <StatCard loading={loading} title="Period" value={format(new Date(selectedPeriod.year, selectedPeriod.month - 1), 'MMMM yyyy')} icon={<Calendar className="text-purple-500" />} />
            </div>

            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center gap-3"><AlertTriangle size={20} />{error}</div>}

            <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex justify-end mb-4 min-h-[40px]">
                    {user && (user.role === 'manager' || user.role === 'admin') && payslips.length === 0 && !loading && (
                        <motion.button 
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={handleGeneratePayroll} disabled={isGenerating} 
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md font-semibold disabled:bg-indigo-300">
                          {isGenerating ? 'Generating...' : `Generate for ${format(new Date(selectedPeriod.year, selectedPeriod.month - 1), 'MMMM yyyy')}`}
                        </motion.button>
                    )}
                </div>

                {loading ? (
                  <div className="text-center p-8 text-gray-500">Loading payroll data...</div>
                ) : payslips.length > 0 ? (
                  <PayrollTable 
                      payslips={payslips} 
                      onViewPayslip={setViewingPayslip}
                      onUpdatePayslip={handleUpdatePayslip}
                  />
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    {user?.role === 'cashier'
                      ? 'Payroll for this period has not been generated by management yet.'
                      : 'No payroll data found for this period. Ensure active employees have a salary set before generating.'
                    }
                  </div>
                )}
            </div>
            
            {viewingPayslip && (
                <PayslipModal 
                    payslip={viewingPayslip} 
                    onClose={() => setViewingPayslip(null)} 
                    onUpdate={handleUpdatePayslip}
                />
            )}
        </div>
    );
}
/*'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import api from '../../../../lib/api';
import { Calendar, Users, DollarSign, FileDown, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import PayrollTable from './PayrollTable'; // We will create this
import PayslipModal from './PayslipModal';   // We will create this
import { format } from 'date-fns';

const StatCard = ({ title, value, icon, loading }) => (
    <div className="bg-white p-5 rounded-lg shadow-md flex items-center space-x-4">
        {loading ? <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div> : <div className="p-3 rounded-full bg-gray-100">{icon}</div>}
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            {loading ? <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mt-1"></div> : <p className="text-xl font-semibold text-gray-800">{value}</p>}
        </div>
    </div>
);

export default function PayrollClient() {
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });
    const [viewingPayslip, setViewingPayslip] = useState(null);
    const [error, setError] = useState('');

    const fetchPayroll = async (period) => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.get(`/api/payroll/${period.year}/${period.month}`);
            setPayslips(data);
        } catch (err) {
            console.error(err);
            setPayslips([]); // Clear previous data
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayroll(selectedPeriod);
    }, [selectedPeriod]);

    const handleGeneratePayroll = async () => {
        if (!confirm(`Are you sure you want to generate payroll for ${selectedPeriod.month}/${selectedPeriod.year}? This action cannot be undone.`)) return;

        setIsGenerating(true);
        setError('');
        try {
            await api.post('/api/payroll/generate', selectedPeriod);
            await fetchPayroll(selectedPeriod); // Refresh data after generation
        } catch (err) {
            setError(err.response?.data?.message || "Failed to generate payroll.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleUpdatePayslip = async (payslipId, updates) => {
        try {
            const { data: updatedPayslip } = await api.put(`/api/payroll/${payslipId}`, updates);
            // Update the state locally for instant UI feedback
            setPayslips(prev => prev.map(p => p._id === updatedPayslip._id ? updatedPayslip : p));
            if (viewingPayslip?._id === updatedPayslip._id) {
                setViewingPayslip(updatedPayslip);
            }
            return true;
        } catch(err) {
            alert(err.response?.data?.message || "Update failed.");
            return false;
        }
    };

    const stats = useMemo(() => {
        const totalPayroll = payslips.reduce((sum, p) => sum + p.netPay, 0);
        const paidCount = payslips.filter(p => p.status === 'paid').length;
        return { totalPayroll, paidCount };
    }, [payslips]);

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Payroll Management</h1>
                    <p className="text-gray-500 mt-1">Generate, view, and manage employee monthly salaries.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <input type="number" value={selectedPeriod.month} onChange={e => setSelectedPeriod(p => ({ ...p, month: parseInt(e.target.value) }))} className="p-2 border rounded-md w-24" min="1" max="12" />
                    <input type="number" value={selectedPeriod.year} onChange={e => setSelectedPeriod(p => ({ ...p, year: parseInt(e.target.value) }))} className="p-2 border rounded-md w-28" />
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard loading={loading} title="Total Net Payroll" value={`ETB ${stats.totalPayroll.toLocaleString('en-US', {minimumFractionDigits: 2})}`} icon={<DollarSign className="text-green-500" />} />
                <StatCard loading={loading} title="Employees Paid" value={`${stats.paidCount} / ${payslips.length}`} icon={<Users className="text-blue-500" />} />
                <StatCard loading={loading} title="Period" value={format(new Date(selectedPeriod.year, selectedPeriod.month - 1), 'MMMM yyyy')} icon={<Calendar className="text-purple-500" />} />
            </div>

            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center gap-3"><AlertTriangle size={20} />{error}</div>}

            <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex justify-end mb-4">
                    {payslips.length === 0 && !loading && (
                        <motion.button 
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={handleGeneratePayroll} disabled={isGenerating} 
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md font-semibold disabled:bg-indigo-300">
                          {isGenerating ? 'Generating...' : `Generate for ${format(new Date(selectedPeriod.year, selectedPeriod.month - 1), 'MMMM yyyy')}`}
                        </motion.button>
                    )}
                </div>

                <PayrollTable 
                    payslips={payslips} 
                    loading={loading} 
                    onViewPayslip={setViewingPayslip}
                    onUpdatePayslip={handleUpdatePayslip}
                />
            </div>
            
            {viewingPayslip && (
                <PayslipModal 
                    payslip={viewingPayslip} 
                    onClose={() => setViewingPayslip(null)} 
                    onUpdate={handleUpdatePayslip}
                />
            )}
        </div>
    );
}*/