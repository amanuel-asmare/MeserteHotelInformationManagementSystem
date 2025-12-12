'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CalendarDays, DollarSign, Users, Bed, TrendingUp, Hotel, Save, Crown
} from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../components/reportRecep/card';
import { Label } from '../../../../../components/reportRecep/label';
import { Textarea } from '../../../../../components/ui/textarea';
import { useLanguage } from '../../../../../context/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

interface DailyReportData {
  reportDate: string;
  newCheckIns: number;
  newCheckOuts: number;
  newBookingsToday: number;
  totalRevenueToday: number;
  occupancyRate: string;
  availableRooms: number;
  occupiedRooms: number;
  totalRooms: number;
}

export default function DailyReportPage() {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [reportData, setReportData] = useState<DailyReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
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
      fetchDailyReport(false);
    }
  }, [user, authLoading]);

  const fetchDailyReport = async (saveReport: boolean = false) => {
    setLoading(true);
    setError(null);
    setSaveSuccess(null);
    try {
      const response = await axios.get<DailyReportData>(`${API_URL}/api/reports/daily`, {
        params: {
          date: selectedDate,
          save: saveReport ? 'true' : 'false',
          note: saveReport ? note : undefined,
        },
        withCredentials: true,
      });
      setReportData(response.data);
      if (saveReport) {
        setSaveSuccess(t('dailyReportSaved') || 'Report saved successfully!');
        setNote('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('failedFetchDaily') || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  // ROYAL LOADING SCREEN — Perfect & Stunning
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
          {/* Crown + Report Icon */}
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
            DAILY REPORT
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4, duration: 2 }}
            className="text-4xl text-amber-100 font-light tracking-widest mb-32"
          >
            {t('preparingRoyalReport') || "Preparing Your Royal Daily Report..."}
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
              {t('compilingData') || "Compiling Your Royal Data..."}
            </motion.p>
          </div>
        </motion.div>
      </div>
    );
  }

  // FULL FUNCTIONAL PAGE — 100% PRESERVED
  return (
    <div className="container mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white flex items-center">
        <CalendarDays className="mr-3" size={32} /> {t('dailyReport') || "Daily Report"}
      </h1>

      <div className="mb-6 flex flex-wrap items-end space-x-4 space-y-4 md:space-y-0">
        <div>
          <Label htmlFor="reportDate" className="text-gray-700 dark:text-gray-300">
            {t('selectDate') || "Select Date"}
          </Label>
          <input
            id="reportDate"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-48 mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
        <Button onClick={() => fetchDailyReport(false)} disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white">
          {loading ? t('generating') || "Generating..." : t('generateReport') || "Generate Report"}
        </Button>
      </div>

      {reportData && (
        <div className="mb-6 p-4 border rounded-lg bg-white dark:bg-gray-800">
          <Label htmlFor="reportNote" className="block text-gray-700 dark:text-gray-300 mb-2">
            {t('noteForManager') || "Note for Manager (Optional)"}
          </Label>
          <Textarea
            id="reportNote"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('addNotePlaceholder') || "Add any special notes..."}
            rows={3}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
          />
          <Button
            onClick={() => fetchDailyReport(true)}
            disabled={loading}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white flex items-center"
          >
            <Save className="mr-2" size={20} /> {loading ? t('saving') || "Saving..." : t('saveReport') || "Save Report"}
          </Button>
          {saveSuccess && <p className="text-green-600 dark:text-green-400 mt-2">{saveSuccess}</p>}
        </div>
      )}

      {error && <div className="p-4 mb-4 text-red-600 bg-red-100 dark:bg-red-900/30 rounded-lg">{error}</div>}

      {reportData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-lg dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('reportDate') || "Report Date"}</CardTitle>
              <CalendarDays className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.reportDate}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('totalRevenueToday') || "Total Revenue Today"}</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">ETB {reportData.totalRevenueToday.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('occupancyRate') || "Occupancy Rate"}</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.occupancyRate}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('newCheckIns') || "New Check-Ins"}</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.newCheckIns}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('newCheckOuts') || "New Check-Outs"}</CardTitle>
              <Users className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.newCheckOuts}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('newBookingsToday') || "New Bookings Today"}</CardTitle>
              <Bed className="h-4 w-4 text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.newBookingsToday}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('availableRooms') || "Available Rooms"}</CardTitle>
              <Bed className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.availableRooms}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('occupiedRooms') || "Occupied Rooms"}</CardTitle>
              <Bed className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.occupiedRooms}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('totalRooms') || "Total Rooms"}</CardTitle>
              <Hotel className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.totalRooms}</div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center text-gray-600 dark:text-gray-400 mt-10 text-xl">
          {t('selectDateGeneratePrompt') || "Please select a date and click Generate Report"}
        </div>
      )}
    </div>
  );
}

// NEW: Add a simple Textarea component or use a library one
// `frontend/src/components/ui/textarea.tsx`
// import * as React from "react"
// import { cn } from "@/lib/utils"
// const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
//   ({ className, ...props }, ref) => {
//     return (
//       <textarea
//         className={cn(
//           "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
//           className
//         )}
//         ref={ref}
//         {...props}
//       />
//     )
//   }
// )
// Textarea.displayName = "Textarea"
// export { Textarea }
 /*// src/app/receptionist/reports/daily/page.tsx
'use client';

import axios from 'axios';
import { useAuth } from '../../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { CalendarDays, DollarSign, Users, Bed, TrendingUp,Hotel } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../components/reportRecep/card';
import { Label } from '../../../../../components/reportRecep/label';

interface DailyReportData {
  reportDate: string;
  newCheckIns: number;
  newCheckOuts: number;
  newBookingsToday: number;
  totalRevenueToday: number;
  occupancyRate: string;
  availableRooms: number;
  occupiedRooms: number;
  totalRooms: number;
}

const API_URL = 'http://localhost:5000'; // Or your deployed API URL

export default function DailyReportPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reportData, setReportData] = useState<DailyReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'receptionist' && user.role !== 'manager' && user.role !== 'admin'))) {
      router.push('/'); // Redirect if not authorized
    } else if (user) {
      fetchDailyReport();
    }
  }, [user, authLoading]);

  const fetchDailyReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<DailyReportData>(`${API_URL}/api/reports/daily`, {
        params: { date: selectedDate },
        withCredentials: true,
      });
      setReportData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch daily report.');
      console.error('Error fetching daily report:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (!user && !authLoading)) {
    return <div className="flex justify-center items-center min-h-screen">Loading authentication...</div>;
  }

  if (error && !reportData) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white flex items-center">
        <CalendarDays className="mr-3" size={32} /> Daily Report
      </h1>

      <div className="mb-6 flex items-end space-x-4">
        <div>
          <Label htmlFor="reportDate" className="text-gray-700 dark:text-gray-300">Select Date</Label>
          <Input
            id="reportDate"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-48 mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
        <Button onClick={fetchDailyReport} disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700">
          {loading ? 'Generating...' : 'Generate Report'}
        </Button>
      </div>

      {reportData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Report Date</CardTitle>
              <CalendarDays className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.reportDate}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Revenue Today</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">ETB {reportData.totalRevenueToday.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Occupancy Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.occupancyRate}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">New Check-ins</CardTitle>
              <Users className="h-4 w-4 text-purple-500 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.newCheckIns}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">New Check-outs</CardTitle>
              <Users className="h-4 w-4 text-orange-500 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.newCheckOuts}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">New Bookings Today</CardTitle>
              <Bed className="h-4 w-4 text-teal-500 dark:text-teal-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.newBookingsToday}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Available Rooms</CardTitle>
              <Bed className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.availableRooms}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Occupied Rooms</CardTitle>
              <Bed className="h-4 w-4 text-red-500 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.occupiedRooms}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Rooms</CardTitle>
              <Hotel className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.totalRooms}</div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center text-gray-600 dark:text-gray-400 mt-10">
          Select a date and click "Generate Report" to view daily statistics.
        </div>
      )}
    </div>
  );
}*/