// frontend/src/app/(staff-roles)/attendance/page.tsx (or separate pages as requested)
'use client';

import { useState, useEffect } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from '../../../../components/reportRecep/card'; // Adjust path
import { Button } from '../../../../components/ui/Button'; // Adjust path
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell
} from '../../../../components/reportRecep/table'; // Adjust path
import { CalendarCheck, Clock, CheckCircle2, XCircle, Info, RefreshCcw } from 'lucide-react'; // Icons
import { useAuth } from '../../../../context/AuthContext'; // Adjust path
import { DatePicker } from '../../../../components/attendance/DataPicker';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

interface AttendanceRecord {
    _id: string;
    user: string; // User ID
    date: string;
    checkIn: string | null;
    checkOut: string | null;
    status: 'present' | 'absent' | 'leave' | 'half-day' | 'pending' | 'approved';
    notes?: string;
    markedBy: { firstName: string; lastName: string } | null; // Manager/Admin ID
    createdAt: string;
    updatedAt: string;
}

const getStatusColor = (status: AttendanceRecord['status']) => {
    switch (status) {
        case 'present': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
        case 'absent': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
        case 'leave': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900';
        case 'half-day': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
        case 'pending': return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
        case 'approved': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900';
        default: return 'text-gray-500 bg-gray-50 dark:text-gray-500 dark:bg-gray-800';
    }
};

const formatTime = (isoString: string | null) => {
    if (!isoString) return '-';
    const date = parseISO(isoString);
    return isValid(date) ? format(date, 'hh:mm a') : '-';
};

const formatDateForDisplay = (isoString: string) => {
    const date = parseISO(isoString);
    return isValid(date) ? format(date, 'PPP') : '-';
};

export default function StaffAttendancePage() {
    const { user, loading: authLoading } = useAuth();
    const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [selectedHistoryDate, setSelectedHistoryDate] = useState<Date | undefined>(new Date());
    const [historyAttendance, setHistoryAttendance] = useState<AttendanceRecord | null>(null);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);


// Fix: Use /my for today, or /my/2025-11-24 for specific date
const fetchTodayAttendance = async () => {
    if (!user) return;

    setLoading(true);
    try {
        const res = await axios.get(`${API_URL}/api/attendance/my`, {
            withCredentials: true
        });
        setTodayAttendance(res.data);
    } catch (error: any) {
        if (error.response?.status === 404) {
            setTodayAttendance(null);
        } else {
            console.error('Error:', error);
            toast.error(error.response?.data?.message || 'Failed to load attendance');
        }
    } finally {
        setLoading(false);
    }
};

const fetchHistoryAttendance = async (date: Date) => {
    setIsHistoryLoading(true);
    setHistoryAttendance(null); // ← Important: clear old data
    try {
        const formatted = format(date, 'yyyy-MM-dd');
        const res = await axios.get(`${API_URL}/api/attendance/my/${formatted}`, {
            withCredentials: true
        });
        setHistoryAttendance(res.data);
    } catch (error: any) {
        if (error.response?.status === 404) {
            setHistoryAttendance(null);
        } else {
            toast.error('Failed to load history');
        }
    } finally {
        setIsHistoryLoading(false);
    }
};
  
 useEffect(() => {
    if (!authLoading && user) {
        fetchTodayAttendance();

        // Always show today's attendance in history card on first load
        if (selectedHistoryDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const selected = new Date(selectedHistoryDate);
            selected.setHours(0, 0, 0, 0);

            if (selected.getTime() !== today.getTime()) {
                fetchHistoryAttendance(selectedHistoryDate);
            }
            // Removed the else block — we handle it via todayAttendance dependency below
        }
    }
}, [authLoading, user, selectedHistoryDate]);

// NEW: Separate effect to sync todayAttendance → history when today is selected
useEffect(() => {
    if (selectedHistoryDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selected = new Date(selectedHistoryDate);
        selected.setHours(0, 0, 0, 0);

        if (selected.getTime() === today.getTime() && todayAttendance) {
            setHistoryAttendance(todayAttendance);
            setIsHistoryLoading(false);
        }
    }
}, [todayAttendance, selectedHistoryDate]);
    const handleCheckIn = async () => {
        setIsCheckingIn(true);
        try {
            await axios.post(`${API_URL}/api/attendance/check-in`, {}, { withCredentials: true });
            toast.success('Checked in successfully!');
            fetchTodayAttendance(); // Refresh today's attendance
        } catch (error: any) {
            console.error('Check-in failed:', error);
            toast.error(error.response?.data?.message || 'Check-in failed.');
        } finally {
            setIsCheckingIn(false);
        }
    };

    const handleCheckOut = async () => {
        setIsCheckingOut(true);
        try {
            await axios.post(`${API_URL}/api/attendance/check-out`, {}, { withCredentials: true });
            toast.success('Checked out successfully!');
            fetchTodayAttendance(); // Refresh today's attendance
        } catch (error: any) {
            console.error('Check-out failed:', error);
            toast.error(error.response?.data?.message || 'Check-out failed.');
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (authLoading) {
        return <div className="flex items-center justify-center h-screen text-xl">Loading authentication...</div>;
    }

    if (!user) {
        return <div className="flex items-center justify-center h-screen text-xl text-red-500">Not authorized. Please login.</div>;
    }

    const canCheckIn = !todayAttendance || (!todayAttendance.checkIn && !todayAttendance.checkOut);
    const canCheckOut = todayAttendance && todayAttendance.checkIn && !todayAttendance.checkOut;


    return (
        <div className="container mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Today's Attendance Card */}
            <Card className="shadow-lg h-fit">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold flex items-center gap-3 text-amber-600 dark:text-amber-400">
                        <CalendarCheck className="h-8 w-8" /> Today's Attendance
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
                        Mark your daily check-in and check-out.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between text-lg font-medium">
                        <span className="text-gray-800 dark:text-gray-200">Date:</span>
                        <span className="text-amber-700 dark:text-amber-300">{format(new Date(), 'PPP')}</span>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-24 text-gray-500 dark:text-gray-400">
                            <RefreshCcw className="animate-spin mr-2" /> Loading...
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg shadow-sm">
                                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 dark:text-gray-300">Check-in</p>
                                <p className="text-xl font-semibold text-blue-800 dark:text-blue-200">
                                    {formatTime(todayAttendance?.checkIn || null)}
                                </p>
                            </div>
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg shadow-sm">
                                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 dark:text-gray-300">Check-out</p>
                                <p className="text-xl font-semibold text-purple-800 dark:text-purple-200">
                                    {formatTime(todayAttendance?.checkOut || null)}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">Status:</span>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${getStatusColor(todayAttendance?.status || 'absent')}`}>
                            {todayAttendance?.status || 'Not Recorded'}
                        </span>
                    </div>

                    <div className="flex gap-4 mt-6">
                        <Button
                            onClick={handleCheckIn}
                            disabled={!canCheckIn || isCheckingIn || loading}
                            loading={isCheckingIn}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3"
                        >
                            <CheckCircle2 size={20} className="mr-2" /> Check-in
                        </Button>
                        <Button
                            onClick={handleCheckOut}
                            disabled={!canCheckOut || isCheckingOut || loading}
                            loading={isCheckingOut}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3"
                        >
                            <XCircle size={20} className="mr-2" /> Check-out
                        </Button>
                    </div>
                </CardContent>
                {todayAttendance?.notes && (
                    <CardFooter className="pt-4 border-t dark:border-gray-700">
                        <p className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                            <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                            <span className="font-medium">Notes:</span> {todayAttendance.notes}
                        </p>
                    </CardFooter>
                )}
            </Card>

            {/* Attendance History Card */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold flex items-center gap-3 text-blue-600 dark:text-blue-400">
                        <Clock className="h-8 w-8" /> Attendance History
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
                        View your past attendance records by date.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner">
                        <span className="text-lg font-medium text-gray-700 dark:text-gray-200">Select Date:</span>
                        <DatePicker
                            date={selectedHistoryDate}
                            setDate={setSelectedHistoryDate}
                            disabled={(date) => date > new Date()} // Disable future dates
                        />
                    </div>

                    {isHistoryLoading ? (
                        <div className="flex justify-center items-center h-48 text-gray-500 dark:text-gray-400">
                            <RefreshCcw className="animate-spin mr-2" /> Loading history...
                        </div>
                    ) : historyAttendance ? (
                        <div className="rounded-lg border dark:border-gray-700 overflow-hidden">
                            <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <TableHeader className="bg-gray-100 dark:bg-gray-800">
                                    <TableRow>
                                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</TableHead>
                                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Check-in</TableHead>
                                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Check-out</TableHead>
                                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</TableHead>
                                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                                    <TableRow>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {formatDateForDisplay(historyAttendance.date)}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                            {formatTime(historyAttendance.checkIn)}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                            {formatTime(historyAttendance.checkOut)}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusColor(historyAttendance.status)}`}>
                                                {historyAttendance.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-[200px] truncate">
                                            {historyAttendance.notes || '-'}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <p className="text-center py-8 text-gray-500 dark:text-gray-400">No attendance record found for this date.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}