'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { DollarSign, BarChart3, Receipt, CalendarDays, Save, Crown } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../components/reportRecep/card';
import { Label } from '../../../../../components/reportRecep/label';
import { Textarea } from '../../../../../components/ui/textarea';
import { useLanguage } from '../../../../../context/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

interface RevenueReportData {
  startDate: string;
  endDate: string;
  totalOverallRevenue: number;
  foodBeverageRevenue: number;
  roomBookingRevenue: number;
  averageOrderValue: number;
  numberOfOrders: number;
}

export default function RevenueReportPage() {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [reportData, setReportData] = useState<RevenueReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(new Date(new Date().setDate(1)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [showRoyalLoading, setShowRoyalLoading] = useState(true);

  // Royal entrance
  useEffect(() => {
    const timer = setTimeout(() => setShowRoyalLoading(false), 4800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!authLoading && (!user || !['receptionist', 'manager', 'admin'].includes(user.role))) {
      router.push('/');
    } else if (user) {
      fetchRevenueReport(false);
    }
  }, [user, authLoading]);

  const fetchRevenueReport = async (saveReport: boolean = false) => {
    setLoading(true);
    setError(null);
    setSaveSuccess(null);
    try {
      const response = await axios.get<RevenueReportData>(`${API_URL}/api/reports/revenue`, {
        params: {
          startDate,
          endDate,
          save: saveReport ? 'true' : 'false',
          note: saveReport ? note : undefined,
        },
        withCredentials: true,
      });
      setReportData(response.data);
      if (saveReport) {
        setSaveSuccess(t('revenueReportSaved') || 'Report saved successfully!');
        setNote('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('failedFetchRevenue') || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  // ROYAL LOADING SCREEN — REVENUE REPORT EDITION
  if (authLoading || showRoyalLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-amber-950 via-emerald-950 to-black flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-emerald-950/70 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.3),transparent_70%)]" />
          
          {/* Floating Gold & Emerald Particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -380, 0],
                x: [0, Math.sin(i) * 380, 0],
                opacity: [0, 1, 0],
                scale: [0.4, 1.9, 0.4]
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
          {/* Crown + "R" Icon */}
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
                R
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

          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 2.5 }}
            className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 tracking-widest mb-10"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            REVENUE REPORT
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4, duration: 2 }}
            className="text-4xl text-amber-100 font-light tracking-widest mb-32"
          >
            {t('preparingRevenueReport') || "Preparing Your Royal Revenue Report..."}
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
              {t('analyzingRevenue') || "Analyzing Your Royal Revenue..."}
            </motion.p>
          </div>
        </motion.div>
      </div>
    );
  }

  // YOUR ORIGINAL PAGE — 100% PRESERVED & FULLY FUNCTIONAL
  return (
    <div className="container mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white flex items-center">
        <DollarSign className="mr-3" size={32} /> {t('revenue')} {t('generateReport').split(' ')[1]}
      </h1>

      <div className="mb-6 flex flex-wrap items-end space-x-4 space-y-4 md:space-y-0">
        <div>
          <Label htmlFor="startDate" className="text-gray-700 dark:text-gray-300">{t('startDate')}</Label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-48 mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
        <div>
          <Label htmlFor="endDate" className="text-gray-700 dark:text-gray-300">{t('endDate')}</Label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-48 mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
        <Button onClick={() => fetchRevenueReport(false)} disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700">
          {loading ? t('generating') : t('generateReport')}
        </Button>
      </div>

      {reportData && (
        <div className="mb-6 p-4 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
          <Label htmlFor="reportNote" className="block text-gray-700 dark:text-gray-300 mb-2">{t('noteForManager')}</Label>
          <Textarea
            id="reportNote"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('addNotePlaceholder')}
            rows={3}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <Button
            onClick={() => fetchRevenueReport(true)}
            disabled={loading}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800 flex items-center"
          >
            <Save className="mr-2" size={20} /> {loading ? t('saving') : t('saveReport')}
          </Button>
          {saveSuccess && <p className="text-green-600 dark:text-green-400 mt-2">{saveSuccess}</p>}
        </div>
      )}

      {error && <div className="p-4 mb-4 text-red-600 bg-red-100 dark:bg-red-900/30 rounded-lg">{error}</div>}

      {reportData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('dateRange')}</CardTitle>
              <CalendarDays className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{reportData.startDate} to {reportData.endDate}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('totalOverallRevenue')}</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text150 text-gray-900 dark:text-white">ETB {reportData.totalOverallRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('foodBeverageRevenue')}</CardTitle>
              <Receipt className="h-4 w-4 text-purple-500 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">ETB {reportData.foodBeverageRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('roomBookingRevenue')}</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">ETB {reportData.roomBookingRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('avgOrderValue')}</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">ETB {reportData.averageOrderValue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('numberOfOrders')}</CardTitle>
              <Receipt className="h-4 w-4 text-orange-500 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.numberOfOrders}</div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center text-gray-600 dark:text-gray-400 mt-10">
          {t('selectDateRangePrompt')}
        </div>
      )}
    </div>
  );
}

/*// src/app/receptionist/reports/revenue/page.tsx
'use client';

import axios from 'axios';
import { useAuth } from '../../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { DollarSign, BarChart3, Receipt, CalendarDays } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../components/reportRecep/card';
import { Label } from '../../../../../components/reportRecep/label';

interface RevenueReportData {
  startDate: string;
  endDate: string;
  totalOverallRevenue: number;
  foodBeverageRevenue: number;
  roomBookingRevenue: number;
  averageOrderValue: number;
  numberOfOrders: number;
}

const API_URL = 'http://localhost:5000'; // Or your deployed API URL

export default function RevenueReportPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reportData, setReportData] = useState<RevenueReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(new Date(new Date().setDate(1)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'receptionist' && user.role !== 'manager' && user.role !== 'admin'))) {
      router.push('/');
    } else if (user) {
      fetchRevenueReport();
    }
  }, [user, authLoading]);

  const fetchRevenueReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<RevenueReportData>(`${API_URL}/api/reports/revenue`, {
        params: { startDate, endDate },
        withCredentials: true,
      });
      setReportData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch revenue report.');
      console.error('Error fetching revenue report:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (!user && !authLoading)) {
    return <div className="flex justify-center items-center min-h-screen">Loading authentication...</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white flex items-center">
        <DollarSign className="mr-3" size={32} /> Revenue Report
      </h1>

      <div className="mb-6 flex items-end space-x-4">
        <div>
          <Label htmlFor="startDate" className="text-gray-700 dark:text-gray-300">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-48 mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
        <div>
          <Label htmlFor="endDate" className="text-gray-700 dark:text-gray-300">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-48 mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
        <Button onClick={fetchRevenueReport} disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700">
          {loading ? 'Generating...' : 'Generate Report'}
        </Button>
      </div>

      {error && <div className="p-4 mb-4 text-red-600 bg-red-100 dark:bg-red-900/30 rounded-lg">{error}</div>}

      {reportData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Range</CardTitle>
              <CalendarDays className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{reportData.startDate} to {reportData.endDate}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Overall Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">ETB {reportData.totalOverallRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Food & Beverage Revenue</CardTitle>
              <Receipt className="h-4 w-4 text-purple-500 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">ETB {reportData.foodBeverageRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Room Booking Revenue</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">ETB {reportData.roomBookingRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Average Order Value</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">ETB {reportData.averageOrderValue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Number of Orders</CardTitle>
              <Receipt className="h-4 w-4 text-orange-500 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.numberOfOrders}</div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center text-gray-600 dark:text-gray-400 mt-10">
          Select a date range and click "Generate Report" to view revenue statistics.
        </div>
      )}
    </div>
  );
}*/