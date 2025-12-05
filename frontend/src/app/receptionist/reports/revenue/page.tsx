 //`frontend/src/app/receptionist/reports/revenue/page.tsx`**


'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { DollarSign, BarChart3, Receipt, CalendarDays, Save } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../components/reportRecep/card'; // Corrected import path
import { Label } from '../../../../../components/reportRecep/label'; // Corrected import path
import { Textarea } from '../../../../../components/ui/textarea'; // Assuming you have a Textarea component

interface RevenueReportData {
  startDate: string;
  endDate: string;
  totalOverallRevenue: number;
  foodBeverageRevenue: number;
  roomBookingRevenue: number;
  averageOrderValue: number;
  numberOfOrders: number;
}

const API_URL = 'https://localhost:5000'; // Or your deployed API URL

export default function RevenueReportPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reportData, setReportData] = useState<RevenueReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(new Date(new Date().setDate(1)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'receptionist' && user.role !== 'manager' && user.role !== 'admin'))) {
      router.push('/');
    } else if (user) {
      fetchRevenueReport();
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
        setSaveSuccess('Revenue Report saved successfully!');
        setNote('');
      }
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

      <div className="mb-6 flex flex-wrap items-end space-x-4 space-y-4 md:space-y-0">
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
        <Button onClick={() => fetchRevenueReport(false)} disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700">
          {loading ? 'Generating...' : 'Generate Report'}
        </Button>
      </div>

      {reportData && (
        <div className="mb-6 p-4 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
          <Label htmlFor="reportNote" className="block text-gray-700 dark:text-gray-300 mb-2">Note for Manager/Admin (Optional)</Label>
          <Textarea
            id="reportNote"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add any relevant notes for this report..."
            rows={3}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <Button
            onClick={() => fetchRevenueReport(true)}
            disabled={loading}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800 flex items-center"
          >
            <Save className="mr-2" size={20} /> {loading ? 'Saving...' : 'Save Report'}
          </Button>
          {saveSuccess && <p className="text-green-600 dark:text-green-400 mt-2">{saveSuccess}</p>}
        </div>
      )}

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
}

/*// src/app/receptionist/reports/revenue/page.tsx
'use client';

import { useState, useEffect } from 'react';
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