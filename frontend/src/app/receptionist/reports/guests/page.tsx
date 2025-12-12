'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users, UserPlus, Save, Crown
} from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../components/reportRecep/card';
import { Label } from '../../../../../components/reportRecep/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../../components/reportRecep/table';
import { Textarea } from '../../../../../components/ui/textarea';
import { useLanguage } from '../../../../../context/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

interface GuestReportData {
  startDate: string;
  endDate: string;
  newGuestsInDateRange: number;
  totalRegisteredGuests: number;
  recentGuestSignups: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    registeredOn: string;
  }>;
}

export default function GuestReportPage() {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [reportData, setReportData] = useState<GuestReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
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
      fetchGuestReport(false);
    }
  }, [user, authLoading]);

  const fetchGuestReport = async (saveReport: boolean = false) => {
    setLoading(true);
    setError(null);
    setSaveSuccess(null);
    try {
      const response = await axios.get<GuestReportData>(`${API_URL}/api/reports/guests`, {
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
        setSaveSuccess(t('guestReportSaved') || 'Report saved successfully!');
        setNote('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('failedFetchGuest') || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  // ROYAL LOADING SCREEN — GUEST REPORT EDITION
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
          {/* Crown + Guest Icon */}
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
                G
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
            GUEST REPORT
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            
            animate={{ opacity: 1 }}
            transition={{ delay: 4, duration: 2 }}
            className="text-4xl text-amber-100 font-light tracking-widest mb-32"
          >
            {t('preparingGuestReport') || "Preparing Your Royal Guest Insights..."}
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
              {t('analyzingGuests') || "Analyzing Your Royal Guests..."}
            </motion.p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ORIGINAL FUNCTIONAL PAGE — 100% PRESERVED
  return (
    <div className="container mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white flex items-center">
        <Users className="mr-3" size={32} /> {t('guestReport') || "Guest Report"}
      </h1>

      <div className="mb-6 flex flex-wrap items-end space-x-4 space-y-4 md:space-y-0">
        <div>
          <Label htmlFor="startDate" className="text-gray-700 dark:text-gray-300">
            {t('startDate') || "Start Date"}
          </Label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-48 mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
        <div>
          <Label htmlFor="endDate" className="text-gray-700 dark:text-gray-300">
            {t('endDate') || "End Date"}
          </Label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-48 mt-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
        <Button onClick={() => fetchGuestReport(false)} disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white">
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
            onClick={() => fetchGuestReport(true)}
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
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="shadow-lg dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('guestsInPeriod')} ({reportData.startDate} to {reportData.endDate})</CardTitle>
                <UserPlus className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.newGuestsInDateRange}</div>
              </CardContent>
            </Card>

            <Card className="shadow-lg dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                
                <CardTitle className="text-sm font-medium">{t('totalRegisteredGuests')}</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.totalRegisteredGuests}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-lg dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-lg font-medium">{t('recentSignups')}</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.recentGuestSignups.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('firstName') || "Name"}</TableHead>
                      <TableHead>{t('email')}</TableHead>
                      <TableHead>{t('phone')}</TableHead>
                      <TableHead>{t('registeredOn')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.recentGuestSignups.map((guest) => (
                      <TableRow key={guest._id}>
                        <TableCell className="font-medium">{guest.firstName} {guest.lastName}</TableCell>
                        <TableCell>{guest.email}</TableCell>
                        <TableCell>{guest.phone || 'N/A'}</TableCell>
                        <TableCell>{guest.registeredOn}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-gray-600 dark:text-gray-400 py-4">{t('noRecentBookings')}</p>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center text-gray-600 dark:text-gray-400 mt-10 text-xl">
          {t('selectDateRangePrompt') || "Please select a date range and click Generate Report"}
        </div>
      )}
    </div>
  );
}
/*// src/app/receptionist/reports/guests/page.tsx
'use client';

import axios from 'axios';
import { useAuth } from '../../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Users, UserPlus, CalendarDays } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../components/reportRecep/card';
import { Label } from '../../../../../components/reportRecep/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../../components/reportRecep/table';

interface GuestReportData {
  startDate: string;
  endDate: string;
  newGuestsRegistered: number;
  totalRegisteredGuests: number;
  recentGuestSignups: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    registeredOn: string;
  }>;
}

const API_URL = 'http://localhost:5000'; // Or your deployed API URL

export default function GuestReportPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reportData, setReportData] = useState<GuestReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(new Date(0).toISOString().split('T')[0]); // Default to epoch
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'receptionist' && user.role !== 'manager' && user.role !== 'admin'))) {
      router.push('/');
    } else if (user) {
      fetchGuestReport();
    }
  }, [user, authLoading]);

  const fetchGuestReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<GuestReportData>(`${API_URL}/api/reports/guests`, {
        params: { startDate, endDate },
        withCredentials: true,
      });
      setReportData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch guest report.');
      console.error('Error fetching guest report:', err);
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
        <Users className="mr-3" size={32} /> Guest Report
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
        <Button onClick={fetchGuestReport} disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700">
          {loading ? 'Generating...' : 'Generate Report'}
        </Button>
      </div>

      {error && <div className="p-4 mb-4 text-red-600 bg-red-100 dark:bg-red-900/30 rounded-lg">{error}</div>}

      {reportData ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">New Guests Registered ({reportData.startDate} to {reportData.endDate})</CardTitle>
                <UserPlus className="h-4 w-4 text-green-500 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.newGuestsRegistered}</div>
              </CardContent>
            </Card>

            <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Registered Guests</CardTitle>
                <Users className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.totalRegisteredGuests}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">Recent Guest Signups</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.recentGuestSignups.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="dark:border-gray-700">
                      <TableHead className="text-gray-700 dark:text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Email</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Phone</TableHead>
                      <TableHead className="text-gray-700 dark:text-gray-300">Registered On</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.recentGuestSignups.map((guest) => (
                      <TableRow key={guest.id} className="dark:border-gray-700">
                        <TableCell className="font-medium text-gray-900 dark:text-white">{guest.name}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{guest.email}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{guest.phone || 'N/A'}</TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300">{guest.registeredOn}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-gray-600 dark:text-gray-400 py-4">No recent guest signups in this period.</p>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center text-gray-600 dark:text-gray-400 mt-10">
          Select a date range and click "Generate Report" to view guest statistics.
        </div>
      )}
    </div>
  );
}*/