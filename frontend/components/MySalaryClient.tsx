'use client';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, Calendar, TrendingUp, Wallet, CheckCircle, Clock, ChevronRight, Crown
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import PayslipModal from '../src/app/cashier/payroll/components/PayslipModal';
import { useLanguage } from '../context/LanguageContext';

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
  const { t } = useLanguage();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);
  const [showRoyalLoading, setShowRoyalLoading] = useState(true);

  // Royal entrance for salary page
  useEffect(() => {
    const timer = setTimeout(() => setShowRoyalLoading(false), 4800);
    return () => clearTimeout(timer);
  }, []);

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
    return [...history].slice(0, 6).reverse().map(h => ({
      name: `${new Date(0, h.month - 1).toLocaleString('default', { month: 'short' })}`,
      net: h.netPay,
      gross: h.baseSalary
    }));
  }, [history]);

  // === ROYAL PAYROLL LOADING SCREEN ===
  if (loading || showRoyalLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-amber-950 via-emerald-950 to-black flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-emerald-950/70 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.3),transparent_70%)]" />
          
          {/* Floating Emerald & Gold Particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -350, 0],
                x: [0, Math.sin(i) * 350, 0],
                opacity: [0, 1, 0],
                scale: [0.4, 1.8, 0.4]
              }}
              transition={{
                duration: 16 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.7
              }}
              className="absolute w-96 h-96 bg-gradient-to-r from-emerald-400/30 via-amber-400/40 to-transparent rounded-full blur-3xl"
              style={{
                top: `${8 + i * 5}%`,
                left: i % 2 === 0 ? "-30%" : "100%"
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.5 }}
          className="relative z-10 text-center px-8"
        >
          {/* Golden Crown + Payroll Icon */}
          <motion.div
            animate={{ rotateY: [0, 360], scale: [1, 1.2, 1] }}
            transition={{ rotateY: { duration: 40, repeat: Infinity }, scale: { duration: 14, repeat: Infinity } }}
            className="relative mx-auto w-96 h-96 mb-16"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-emerald-600 shadow-2xl ring-20 ring-amber-400/60 blur-xl" />
            <div className="absolute inset-12 rounded-full bg-gradient-to-tr from-emerald-950 to-black flex items-center justify-center shadow-inner">
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
                className="text-9xl font-black text-amber-400 tracking-widest drop-shadow-2xl"
                style={{ textShadow: "0 0 120px rgba(251,191,36,1)" }}
              >
                ₿
              </motion.div>
            </div>
            <motion.div
              animate={{ y: [0, -50, 0] }}
              transition={{ duration: 7, repeat: Infinity }}
              className="absolute -top-24 left-1/2 -translate-x-1/2"
            >
              <Crown className="w-40 h-40 text-yellow-400 drop-shadow-2xl" />
            </motion.div>
          </motion.div>

          {/* Elegant Title */}
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 2.5 }}
            className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 tracking-widest mb-10"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t('myCompensation') || "MY COMPENSATION"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4, duration: 2 }}
            className="text-4xl text-amber-100 font-light tracking-widest mb-32"
          >
            {t('loadingEarnings') || "Loading Your Earnings with Royal Precision..."}
          </motion.p>

          {/* Luxury Progress Bar */}
          <div className="w-full max-w-3xl mx-auto">
            <div className="h-10 bg-black/70 rounded-full overflow-hidden border-6 border-amber-700/90 backdrop-blur-3xl shadow-2xl">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 4.8, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-yellow-500 relative overflow-hidden"
              >
                <motion.div
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2.8, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                />
              </motion.div>
            </div>

            <motion.p
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-center mt-20 text-5xl font-medium text-amber-200 tracking-widest"
            >
              {t('calculatingYourWorth') || "Calculating Your Worth..."}
            </motion.p>
          </div>
        </motion.div>
      </div>
    );
  }

  // === ORIGINAL DASHBOARD CONTENT (100% UNCHANGED) ===
  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 lg:p-10 font-sans">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-10">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-700"
        >
          {t('myCompensation')}
        </motion.h1>
        <p className="text-gray-500 mt-2">{t('trackEarningsDesc')}</p>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SalaryCard
            title={t('latestNetPay')}
            value={`ETB ${stats.latest.toLocaleString()}`}
            subtitle={history[0] ? format(new Date(history[0].year, history[0].month - 1), 'MMMM yyyy') : t('noData')}
            icon={<Wallet size={64} />}
            color="text-green-500"
            delay={0.1}
          />
          <SalaryCard
            title={t('yearToDate')}
            value={`ETB ${stats.totalYTD.toLocaleString()}`}
            subtitle={`${new Date().getFullYear()} ${t('totalEarnings')}`}
            icon={<TrendingUp size={64} />}
            color="text-blue-500"
            delay={0.2}
          />
          <SalaryCard
            title={t('averageMonthly')}
            value={`ETB ${stats.avg.toLocaleString()}`}
            subtitle={t('basedOnThisYear')}
            icon={<DollarSign size={64} />}
            color="text-amber-500"
            delay={0.3}
          />
        </div>

        {/* Chart + Payslip List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-xl border border-amber-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp className="text-amber-500" size={20}/> {t('incomeTrends')}
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
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                  <Area type="monotone" dataKey="net" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#colorNet)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Recent Payslips */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="bg-white p-6 rounded-3xl shadow-xl border border-amber-100 flex flex-col h-[400px]">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="text-amber-500" size={20}/> {t('recentPayslips')}
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {history.length === 0 ? (
                <div className="text-center text-gray-400 mt-10">{t('noRecordsFound')}</div>
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
                            {item.status === 'paid' ? `${t('paidOn')} ${format(new Date(item.paidAt || Date.now()), 'dd MMM')}` : t('pendingProcessing')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">ETB {item.netPay.toLocaleString()}</p>
                        <p className="text-xs text-amber-600 font-medium flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {t('view')} <ChevronRight size={12} />
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