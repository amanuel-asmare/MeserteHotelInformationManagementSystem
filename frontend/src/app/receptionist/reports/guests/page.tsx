'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Users, UserPlus, CalendarDays, Save } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../components/reportRecep/card';
import { Label } from '../../../../../components/reportRecep/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../../components/reportRecep/table';
import { Textarea } from '../../../../../components/ui/textarea';

// === FIX #1: Update the interface to use `_id` ===
interface GuestReportData {
  startDate: string;
  endDate: string;
  newGuestsInDateRange: number;
  totalRegisteredGuests: number;
  recentGuestSignups: Array<{
    _id: string; // Changed from 'id' to '_id'
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    registeredOn: string;
  }>;
}

const API_URL = 'https://localhost:5000';

export default function GuestReportPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reportData, setReportData] = useState<GuestReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(new Date(0).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'receptionist' && user.role !== 'manager' && user.role !== 'admin'))) {
      router.push('/');
    } else if (user) {
      fetchGuestReport();
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
        setSaveSuccess('Guest Report saved successfully!');
        setNote('');
      }
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
        <Button onClick={() => fetchGuestReport(false)} disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700">
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
            onClick={() => fetchGuestReport(true)}
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
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">New Guests Registered ({reportData.startDate} to {reportData.endDate})</CardTitle>
                <UserPlus className="h-4 w-4 text-green-500 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.newGuestsInDateRange}</div>
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
                      // === FIX #2: Use the correct `_id` field for the key ===
                      <TableRow key={guest._id} className="dark:border-gray-700">
                        <TableCell className="font-medium text-gray-900 dark:text-white">{`${guest.firstName} ${guest.lastName}`}</TableCell>
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
}
/*// src/app/receptionist/reports/guests/page.tsx
'use client';

import { useState, useEffect } from 'react';
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