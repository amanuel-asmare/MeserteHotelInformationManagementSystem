'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, DollarSign, Percent, Bed, Users,
  BarChart, PieChart, TrendingUp, Printer,
  Save, CheckCircle, FileText
} from 'lucide-react';
import api from '@/lib/api';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { subDays, format } from 'date-fns';
import {
  LineChart, Line, BarChart as RechartsBarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Pie, Cell
} from 'recharts';
import { useAuth } from '../../../../context/AuthContext';
import { useLanguage } from '../../../../context/LanguageContext'; // Import translation

// === COMPONENTS ===
const StatCard = ({ title, value, icon, unit = '', color }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center space-x-4 hover:shadow-xl transition-shadow"
  >
    <div className={`p-4 rounded-xl ${color.bg} ${color.text}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-black text-gray-800 tracking-tight">{value}{unit}</p>
    </div>
  </motion.div>
);

const ChartContainer = ({ title, icon, children }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.1 }}
    className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col"
  >
    <div className="flex items-center space-x-2 mb-6">
      <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
    </div>
    <div className="h-80 w-full flex items-center justify-center">
      {children}
    </div>
  </motion.div>
);

// === MAIN PAGE ===
export default function ReportPage() {
  const { t, language } = useLanguage(); // Translation hook
  const { user, loading: authLoading } = useAuth();

  const [minTimePassed, setMinTimePassed] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([subDays(new Date(), 29), new Date()]);
  const [startDate, endDate] = dateRange;
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      // FIX: Cast keys to any to avoid strict type error
      setError(t('selectDateRange' as any) || 'Please select a valid date range.');
      return;
    }
    setLoading(true); setError(''); setReportData(null); setSaveSuccess(false);
    try {
      const { data } = await api.get('/api/reports/comprehensive', {
        params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
      });
      setReportData(data);
    } catch (err: any) {
      // FIX: Cast 'failedGenerateReport' to any
      setError(err.response?.data?.message || t('failedGenerateReport' as any) || "Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = async () => {
    if (!reportData) return;
    setSaving(true); setError('');
    try {
      await api.post('/api/reports/comprehensive/save', {
        reportData, note,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      });
      setSaveSuccess(true); setNote(''); setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      // FIX: Cast 'saveFailed' to any
      setError(err.response?.data?.message || t('saveFailed' as any) || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => window.print();

  const PIE_COLORS = ['#4F46E5', '#F59E0B'];

  if (!minTimePassed || authLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-amber-950 via-black to-amber-900 flex items-center justify-center overflow-hidden z-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15),transparent_70%)]" />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-2xl ring-4 ring-amber-900/50">
            <Crown className="text-white w-12 h-12" />
          </div>
          <h2 className="text-4xl font-black text-amber-400 tracking-widest mb-2">
            {t('financialReports') || "FINANCIAL REPORTS"}
          </h2>
          <p className="text-amber-200/80 tracking-wide">
            {/* FIX: Cast 'analyzingExcellence' to any */}
            {t('analyzingExcellence' as any) || "Analyzing Business Excellence..."}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 lg:p-10 font-sans text-gray-900">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-700 mb-4">
            {/* FIX: Cast 'comprehensiveReports' to any */}
            {t('comprehensiveReports' as any) || "COMPREHENSIVE REPORTS"}
          </h1>
          <p className="text-xl text-gray-500 font-medium">
            {/* FIX: Cast 'dataIntoDecisions' to any */}
            {t('dataIntoDecisions' as any) || "Turning Data into Royal Decisions"}
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-amber-100 mb-8">
          <div className="flex flex-col xl:flex-row justify-between items-center gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{t('generateReports') || "Generate Report"}</h2>
              {/* FIX: Cast 'selectDateToAnalyze' to any */}
              <p className="text-gray-500 mt-1">{t('selectDateToAnalyze' as any) || "Select a date range to analyze performance."}</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-200">
              <div className="relative z-20">
                <DatePicker
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => setDateRange(update)}
                  isClearable={true}
                  className="px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-gray-700 font-medium w-72"
                  // FIX: Cast 'selectDateRange' to any
                  placeholderText={t('selectDateRange' as any) || "Select date range"}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGenerateReport}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-amber-500/30 disabled:opacity-70 transition-all"
              >
                {/* FIX: Cast 'analyzing' to any */}
                {loading ? t('analyzing' as any) || 'Analyzing...' : t('generateReports') || 'Generate Report'}
              </motion.button>
              <button
                onClick={handlePrint}
                className="p-3 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition shadow-sm"
                // FIX: Cast 'printReport' to any
                title={t('printReport' as any) || "Print Report"}
              >
                <Printer className="w-6 h-6" />
              </button>
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg">
              {/* FIX: Cast 'error' to any */}
              <p className="font-bold">{t('error' as any) || "Error"}</p>
              <p>{error}</p>
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {reportData && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              {user?.role === 'cashier' && (
                <motion.div layout className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-3xl border border-amber-200 shadow-sm no-print">
                  <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
                    {/* FIX: Cast 'saveForManagement' to any */}
                    <Save size={20}/> {t('saveForManagement' as any) || "Save for Management"}
                  </h3>
                  <div className="flex flex-col md:flex-row gap-4">
                    <input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      // FIX: Cast 'addNoteOptional' to any
                      placeholder={t('addNoteOptional' as any) || "Add a note (optional)..."}
                      className="flex-1 px-4 py-3 rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={handleSaveReport}
                      disabled={saving}
                      className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {/* FIX: Cast 'saving' and 'saveToDatabase' to any */}
                      {saving ? t('saving') || 'Saving...' : t('saveToDatabase' as any) || 'Save to Database'}
                    </motion.button>
                  </div>
                  {saveSuccess && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-700 font-bold mt-2 flex items-center gap-2">
                      {/* FIX: Cast 'reportSavedSuccess' to any */}
                      <CheckCircle size={16}/> {t('reportSavedSuccess' as any) || "Report saved successfully!"}
                    </motion.p>
                  )}
                </motion.div>
              )}

              {/* Print Header */}
              <div className="hidden print:block text-center mb-8">
                {/* FIX: Cast 'financialReport' to any */}
                <h1 className="text-3xl font-bold text-black">{t('meseretHotel')} - {t('financialReport' as any) || "Financial Report"}</h1>
                <p className="text-lg text-gray-600">
                  {startDate && format(startDate, 'dd MMM yyyy')} - {endDate && format(endDate, 'dd MMM yyyy')}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  // FIX: Cast 'totalRevenue' to any
                  title={t('totalRevenue' as any) || "Total Revenue"}
                  value={reportData.summary.totalRevenue.toLocaleString()}
                  unit=" ETB"
                  icon={<DollarSign className="w-6 h-6" />}
                  color={{ bg: 'bg-green-100', text: 'text-green-600' }}
                />
                <StatCard
                  title={t('avgOccupancy') || "Avg. Occupancy"}
                  value={reportData.summary.avgOccupancy}
                  unit="%"
                  icon={<Percent className="w-6 h-6" />}
                  color={{ bg: 'bg-blue-100', text: 'text-blue-600' }}
                />
                <StatCard
                  title={t('newBookings') || "New Bookings"}
                  value={reportData.summary.newBookings}
                  icon={<Bed className="w-6 h-6" />}
                  color={{ bg: 'bg-purple-100', text: 'text-purple-600' }}
                />
                <StatCard
                  // FIX: Cast 'totalGuestsServed' to any
                  title={t('totalGuestsServed' as any) || "Total Guests Served"}
                  value={reportData.summary.totalGuests}
                  icon={<Users className="w-6 h-6" />}
                  color={{ bg: 'bg-amber-100', text: 'text-amber-600' }}
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* FIX: Cast 'revenueSources' to any */}
                <ChartContainer title={t('revenueSources' as any) || "Revenue Sources"} icon={<PieChart className="w-5 h-5 text-indigo-600" />}>
                  {parseFloat(reportData.revenueBreakdown.roomRevenue) === 0 && parseFloat(reportData.revenueBreakdown.orderRevenue) === 0 ? (
                    // FIX: Cast 'noRevenueThisPeriod' to any
                    <div className="text-center text-gray-400">{t('noRevenueThisPeriod' as any) || "No revenue recorded for this period."}</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: t('roomRevenue') || 'Room Revenue', value: parseFloat(reportData.revenueBreakdown.roomRevenue) },
                            { name: t('foodOrderRevenue') || 'Food & Beverage', value: parseFloat(reportData.revenueBreakdown.orderRevenue) }
                          ]}
                          cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                        >
                          {PIE_COLORS.map((color, index) => <Cell key={`cell-${index}`} fill={color} />)}
                        </Pie>
                        <Tooltip formatter={(val: number) => `ETB ${val.toLocaleString()}`} />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </ChartContainer>

                <ChartContainer title={t('topMenuItems') || "Top 5 Menu Items"} icon={<BarChart className="w-5 h-5 text-green-600" />}>
                  {reportData.topMenuItems.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart layout="vertical" data={reportData.topMenuItems} margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={100} style={{fontSize: '12px', fontWeight: 500}} />
                        <Tooltip cursor={{fill: '#f3f4f6'}} />
                        {/* FIX: Cast 'sold' to any */}
                        <Bar dataKey="quantitySold" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} name={t('sold' as any) || "Sold"} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  ) : (
                    // FIX: Cast 'noFoodOrders' to any
                    <div className="text-center text-gray-400">{t('noFoodOrders' as any) || "No food orders in this period"}</div>
                  )}
                </ChartContainer>

                {/* FIX: Cast 'occupancyTrend' to any */}
                <ChartContainer title={t('occupancyTrend' as any) || "Occupancy Trend"} icon={<TrendingUp className="w-5 h-5 text-blue-600" />}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={reportData.occupancyTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tick={{fontSize: 10}} tickFormatter={(str) => str.slice(5)} />
                      <YAxis unit="%" />
                      <Tooltip formatter={(val) => `${val}%`} />
                      <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={3} dot={{r: 3}} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>

                {/* FIX: Cast 'bookingVolume' to any */}
                <ChartContainer title={t('bookingVolume' as any) || "Booking Volume"} icon={<FileText className="w-5 h-5 text-purple-600" />}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={reportData.bookingTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tick={{fontSize: 10}} tickFormatter={(str) => str.slice(5)} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="bookings" stroke="#8b5cf6" strokeWidth={3} dot={{r: 3}} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}/*'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, DollarSign, Percent, Bed, Users,
  BarChart, PieChart, TrendingUp, Printer,
  Save, CheckCircle, FileText
} from 'lucide-react';
import api from '@/lib/api';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { subDays, format } from 'date-fns';
import {
  LineChart, Line, BarChart as RechartsBarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Pie, Cell
} from 'recharts';
import { useAuth } from '../../../../context/AuthContext';
import { useLanguage } from '../../../../context/LanguageContext'; // Import translation

// === COMPONENTS ===
const StatCard = ({ title, value, icon, unit = '', color }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center space-x-4 hover:shadow-xl transition-shadow"
  >
    <div className={`p-4 rounded-xl ${color.bg} ${color.text}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-black text-gray-800 tracking-tight">{value}{unit}</p>
    </div>
  </motion.div>
);

const ChartContainer = ({ title, icon, children }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.1 }}
    className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col"
  >
    <div className="flex items-center space-x-2 mb-6">
      <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
    </div>
    <div className="h-80 w-full flex items-center justify-center">
      {children}
    </div>
  </motion.div>
);

// === MAIN PAGE ===
export default function ReportPage() {
  const { t, language } = useLanguage(); // Translation hook
  const { user, loading: authLoading } = useAuth();

  const [minTimePassed, setMinTimePassed] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([subDays(new Date(), 29), new Date()]);
  const [startDate, endDate] = dateRange;
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      setError(t('selectDateRange') || 'Please select a valid date range.');
      return;
    }
    setLoading(true); setError(''); setReportData(null); setSaveSuccess(false);
    try {
      const { data } = await api.get('/api/reports/comprehensive', {
        params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
      });
      setReportData(data);
    } catch (err: any) {
      setError(err.response?.data?.message || t('failedGenerateReport') || "Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = async () => {
    if (!reportData) return;
    setSaving(true); setError('');
    try {
      await api.post('/api/reports/comprehensive/save', {
        reportData, note,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      });
      setSaveSuccess(true); setNote(''); setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || t('saveFailed') || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => window.print();

  const PIE_COLORS = ['#4F46E5', '#F59E0B'];

  if (!minTimePassed || authLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-amber-950 via-black to-amber-900 flex items-center justify-center overflow-hidden z-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15),transparent_70%)]" />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-2xl ring-4 ring-amber-900/50">
            <Crown className="text-white w-12 h-12" />
          </div>
          <h2 className="text-4xl font-black text-amber-400 tracking-widest mb-2">
            {t('financialReports') || "FINANCIAL REPORTS"}
          </h2>
          <p className="text-amber-200/80 tracking-wide">
            {t('analyzingExcellence') || "Analyzing Business Excellence..."}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 lg:p-10 font-sans text-gray-900">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-700 mb-4">
            {t('comprehensiveReports') || "COMPREHENSIVE REPORTS"}
          </h1>
          <p className="text-xl text-gray-500 font-medium">
            {t('dataIntoDecisions') || "Turning Data into Royal Decisions"}
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-amber-100 mb-8">
          <div className="flex flex-col xl:flex-row justify-between items-center gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{t('generateReports') || "Generate Report"}</h2>
              <p className="text-gray-500 mt-1">{t('selectDateToAnalyze') || "Select a date range to analyze performance."}</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-200">
              <div className="relative z-20">
                <DatePicker
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => setDateRange(update)}
                  isClearable={true}
                  className="px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-gray-700 font-medium w-72"
                  placeholderText={t('selectDateRange') || "Select date range"}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGenerateReport}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-amber-500/30 disabled:opacity-70 transition-all"
              >
                {loading ? t('analyzing') || 'Analyzing...' : t('generateReports') || 'Generate Report'}
              </motion.button>
              <button
                onClick={handlePrint}
                className="p-3 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition shadow-sm"
                title={t('printReport') || "Print Report"}
              >
                <Printer className="w-6 h-6" />
              </button>
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg">
              <p className="font-bold">{t('error') || "Error"}</p>
              <p>{error}</p>
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {reportData && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              {user?.role === 'cashier' && (
                <motion.div layout className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-3xl border border-amber-200 shadow-sm no-print">
                  <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
                    <Save size={20}/> {t('saveForManagement') || "Save for Management"}
                  </h3>
                  <div className="flex flex-col md:flex-row gap-4">
                    <input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={t('addNoteOptional') || "Add a note (optional)..."}
                      className="flex-1 px-4 py-3 rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={handleSaveReport}
                      disabled={saving}
                      className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {saving ? t('saving') || 'Saving...' : t('saveToDatabase') || 'Save to Database'}
                    </motion.button>
                  </div>
                  {saveSuccess && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-700 font-bold mt-2 flex items-center gap-2">
                      <CheckCircle size={16}/> {t('reportSavedSuccess') || "Report saved successfully!"}
                    </motion.p>
                  )}
                </motion.div>
              )}

              <div className="hidden print:block text-center mb-8">
                <h1 className="text-3xl font-bold text-black">{t('meseretHotel')} - {t('financialReport') || "Financial Report"}</h1>
                <p className="text-lg text-gray-600">
                  {startDate && format(startDate, 'dd MMM yyyy')} - {endDate && format(endDate, 'dd MMM yyyy')}
                </p>
              </div>

             
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title={t('totalRevenue') || "Total Revenue"}
                  value={reportData.summary.totalRevenue.toLocaleString()}
                  unit=" ETB"
                  icon={<DollarSign className="w-6 h-6" />}
                  color={{ bg: 'bg-green-100', text: 'text-green-600' }}
                />
                <StatCard
                  title={t('avgOccupancy') || "Avg. Occupancy"}
                  value={reportData.summary.avgOccupancy}
                  unit="%"
                  icon={<Percent className="w-6 h-6" />}
                  color={{ bg: 'bg-blue-100', text: 'text-blue-600' }}
                />
                <StatCard
                  title={t('newBookings') || "New Bookings"}
                  value={reportData.summary.newBookings}
                  icon={<Bed className="w-6 h-6" />}
                  color={{ bg: 'bg-purple-100', text: 'text-purple-600' }}
                />
                <StatCard
                  title={t('totalGuestsServed') || "Total Guests Served"}
                  value={reportData.summary.totalGuests}
                  icon={<Users className="w-6 h-6" />}
                  color={{ bg: 'bg-amber-100', text: 'text-amber-600' }}
                />
              </div>

             
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartContainer title={t('revenueSources') || "Revenue Sources"} icon={<PieChart className="w-5 h-5 text-indigo-600" />}>
                  {parseFloat(reportData.revenueBreakdown.roomRevenue) === 0 && parseFloat(reportData.revenueBreakdown.orderRevenue) === 0 ? (
                    <div className="text-center text-gray-400">{t('noRevenueThisPeriod') || "No revenue recorded for this period."}</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: t('roomRevenue') || 'Room Revenue', value: parseFloat(reportData.revenueBreakdown.roomRevenue) },
                            { name: t('foodBeverage') || 'Food & Beverage', value: parseFloat(reportData.revenueBreakdown.orderRevenue) }
                          ]}
                          cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                        >
                          {PIE_COLORS.map((color, index) => <Cell key={`cell-${index}`} fill={color} />)}
                        </Pie>
                        <Tooltip formatter={(val: number) => `ETB ${val.toLocaleString()}`} />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </ChartContainer>

                <ChartContainer title={t('topMenuItems') || "Top 5 Menu Items"} icon={<BarChart className="w-5 h-5 text-green-600" />}>
                  {reportData.topMenuItems.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart layout="vertical" data={reportData.topMenuItems} margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={100} style={{fontSize: '12px', fontWeight: 500}} />
                        <Tooltip cursor={{fill: '#f3f4f6'}} />
                        <Bar dataKey="quantitySold" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} name={t('sold') || "Sold"} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-gray-400">{t('noFoodOrders') || "No food orders in this period"}</div>
                  )}
                </ChartContainer>

                <ChartContainer title={t('occupancyTrend') || "Occupancy Trend"} icon={<TrendingUp className="w-5 h-5 text-blue-600" />}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={reportData.occupancyTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tick={{fontSize: 10}} tickFormatter={(str) => str.slice(5)} />
                      <YAxis unit="%" />
                      <Tooltip formatter={(val) => `${val}%`} />
                      <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={3} dot={{r: 3}} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>

                <ChartContainer title={t('bookingVolume') || "Booking Volume"} icon={<FileText className="w-5 h-5 text-purple-600" />}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={reportData.bookingTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tick={{fontSize: 10}} tickFormatter={(str) => str.slice(5)} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="bookings" stroke="#8b5cf6" strokeWidth={3} dot={{r: 3}} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
*/