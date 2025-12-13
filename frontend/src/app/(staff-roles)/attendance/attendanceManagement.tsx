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
} from '../../../../components/reportRecep/card'; 
import { Button } from '../../../../components/ui/Button'; 
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell
} from '../../../../components/reportRecep/table'; 
import { CalendarCheck, Clock, CheckCircle2, XCircle, Info, RefreshCcw } from 'lucide-react'; 
import { useAuth } from '../../../../context/AuthContext'; 
import { DatePicker } from '../../../../components/attendance/DataPicker';
import { useLanguage } from '../../../../context/LanguageContext'; // Import Language Hook

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mesertehotelinformationmanagementsystem.onrender.com';
interface AttendanceRecord {
    _id: string;
    user: string;
    date: string;
    checkIn: string | null;
    checkOut: string | null;
    status: 'present' | 'absent' | 'leave' | 'half-day' | 'pending' | 'approved';
    notes?: string;
    markedBy: { firstName: string; lastName: string } | null;
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
    const { t } = useLanguage(); 
    const { user, loading: authLoading } = useAuth();
    const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [selectedHistoryDate, setSelectedHistoryDate] = useState<Date | undefined>(new Date());
    const [historyAttendance, setHistoryAttendance] = useState<AttendanceRecord | null>(null);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);

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
                toast.error(error.response?.data?.message || t('failedLoadAttendance'));
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchHistoryAttendance = async (date: Date) => {
        setIsHistoryLoading(true);
        setHistoryAttendance(null); 
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
                toast.error(t('failedLoadHistory'));
            }
        } finally {
            setIsHistoryLoading(false);
        }
    };
  
    useEffect(() => {
        if (!authLoading && user) {
            fetchTodayAttendance();

            if (selectedHistoryDate) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const selected = new Date(selectedHistoryDate);
                selected.setHours(0, 0, 0, 0);

                if (selected.getTime() !== today.getTime()) {
                    fetchHistoryAttendance(selectedHistoryDate);
                }
            }
        }
    }, [authLoading, user, selectedHistoryDate]);

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
            toast.success(t('checkInSuccess'));
            fetchTodayAttendance(); 
        } catch (error: any) {
            console.error('Check-in failed:', error);
            toast.error(error.response?.data?.message || t('checkInFailed'));
        } finally {
            setIsCheckingIn(false);
        }
    };

    const handleCheckOut = async () => {
        setIsCheckingOut(true);
        try {
            await axios.post(`${API_URL}/api/attendance/check-out`, {}, { withCredentials: true });
            toast.success(t('checkOutSuccess'));
            fetchTodayAttendance(); 
        } catch (error: any) {
            console.error('Check-out failed:', error);
            toast.error(error.response?.data?.message || t('checkOutFailed'));
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (authLoading) {
        return <div className="flex items-center justify-center h-screen text-xl">{t('loadingAuth')}...</div>;
    }

    if (!user) {
        return <div className="flex items-center justify-center h-screen text-xl text-red-500">Not authorized. Please login.</div>;
    }

    const canCheckIn = !todayAttendance || (!todayAttendance.checkIn && !todayAttendance.checkOut);
    const canCheckOut = todayAttendance && todayAttendance.checkIn && !todayAttendance.checkOut;

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Today's Attendance Card */}
            <Card className="shadow-lg h-fit w-full">
                <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-amber-600 dark:text-amber-400">
                        <CalendarCheck className="h-6 w-6 md:h-8 md:w-8" /> {t('todaysAttendance')}
                    </CardTitle>
                    <CardDescription className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-2">
                        {t('markAttendanceDesc')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-base md:text-lg font-medium gap-2">
                        <span className="text-gray-800 dark:text-gray-200">{t('date')}:</span>
                        <span className="text-amber-700 dark:text-amber-300 font-bold">{format(new Date(), 'PPP')}</span>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-24 text-gray-500 dark:text-gray-400">
                            <RefreshCcw className="animate-spin mr-2" /> {t('loading')}...
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg shadow-sm">
                                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 dark:text-gray-300">{t('checkIn')}</p>
                                <p className="text-xl font-semibold text-blue-800 dark:text-blue-200">
                                    {formatTime(todayAttendance?.checkIn || null)}
                                </p>
                            </div>
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg shadow-sm">
                                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 dark:text-gray-300">{t('checkOut')}</p>
                                <p className="text-xl font-semibold text-purple-800 dark:text-purple-200">
                                    {formatTime(todayAttendance?.checkOut || null)}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg gap-2">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{t('status')}:</span>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${getStatusColor(todayAttendance?.status || 'absent')}`}>
                            {/* FIX: Cast status to 'any' to bypass strict type check for translation key */}
                            {todayAttendance?.status ? t(todayAttendance.status as any) : t('notRecorded')}
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-6">
                        <Button
                            onClick={handleCheckIn}
                            disabled={!canCheckIn || isCheckingIn || loading}
                            loading={isCheckingIn}
                            className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 text-white py-3"
                        >
                            <CheckCircle2 size={20} className="mr-2" /> {t('checkIn')}
                        </Button>
                        <Button
                            onClick={handleCheckOut}
                            disabled={!canCheckOut || isCheckingOut || loading}
                            loading={isCheckingOut}
                            className="w-full sm:flex-1 bg-red-600 hover:bg-red-700 text-white py-3"
                        >
                            <XCircle size={20} className="mr-2" /> {t('checkOut')}
                        </Button>
                    </div>
                </CardContent>
                {todayAttendance?.notes && (
                    <CardFooter className="pt-4 border-t dark:border-gray-700">
                        <p className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                            <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                            <span className="font-medium">{t('note')}:</span> {todayAttendance.notes}
                        </p>
                    </CardFooter>
                )}
            </Card>

            {/* Attendance History Card */}
            <Card className="shadow-lg w-full">
                <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-blue-600 dark:text-blue-400">
                        <Clock className="h-6 w-6 md:h-8 md:w-8" /> {t('attendanceHistory')}
                    </CardTitle>
                    <CardDescription className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-2">
                        {t('viewHistoryDesc')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner">
                        <span className="text-lg font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">{t('selectDate')}:</span>
                        <div className="w-full sm:w-auto">
                            <DatePicker
                                date={selectedHistoryDate}
                                setDate={setSelectedHistoryDate}
                                disabled={(date) => date > new Date()}
                            />
                        </div>
                    </div>

                    {isHistoryLoading ? (
                        <div className="flex justify-center items-center h-48 text-gray-500 dark:text-gray-400">
                            <RefreshCcw className="animate-spin mr-2" /> {t('loadingHistory')}...
                        </div>
                    ) : historyAttendance ? (
                        <div className="rounded-lg border dark:border-gray-700 overflow-hidden w-full">
                            <div className="overflow-x-auto">
                                <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <TableHeader className="bg-gray-100 dark:bg-gray-800">
                                        <TableRow>
                                            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('date')}</TableHead>
                                            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('checkIn')}</TableHead>
                                            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('checkOut')}</TableHead>
                                            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('status')}</TableHead>
                                            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('note')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                                        <TableRow>
                                            <TableCell className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {formatDateForDisplay(historyAttendance.date)}
                                            </TableCell>
                                            <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                {formatTime(historyAttendance.checkIn)}
                                            </TableCell>
                                            <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                {formatTime(historyAttendance.checkOut)}
                                            </TableCell>
                                            <TableCell className="px-4 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusColor(historyAttendance.status)}`}>
                                                    {/* FIX: Cast status to 'any' to bypass strict type check for translation key */}
                                                    {t(historyAttendance.status as any) || historyAttendance.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-[150px] md:max-w-[200px] truncate">
                                                {historyAttendance.notes || '-'}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center py-8 text-gray-500 dark:text-gray-400">{t('noAttendanceFound')}</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}/*'use client';

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
} from '../../../../components/reportRecep/card'; 
import { Button } from '../../../../components/ui/Button'; 
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell
} from '../../../../components/reportRecep/table'; 
import { CalendarCheck, Clock, CheckCircle2, XCircle, Info, RefreshCcw } from 'lucide-react'; 
import { useAuth } from '../../../../context/AuthContext'; 
import { DatePicker } from '../../../../components/attendance/DataPicker';
import { useLanguage } from '../../../../context/LanguageContext'; // Import Language Hook

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

interface AttendanceRecord {
    _id: string;
    user: string;
    date: string;
    checkIn: string | null;
    checkOut: string | null;
    status: 'present' | 'absent' | 'leave' | 'half-day' | 'pending' | 'approved';
    notes?: string;
    markedBy: { firstName: string; lastName: string } | null;
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
    const { t } = useLanguage(); // Initialize Translation
    const { user, loading: authLoading } = useAuth();
    const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [selectedHistoryDate, setSelectedHistoryDate] = useState<Date | undefined>(new Date());
    const [historyAttendance, setHistoryAttendance] = useState<AttendanceRecord | null>(null);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);

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
                toast.error(error.response?.data?.message || t('failedLoadAttendance'));
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchHistoryAttendance = async (date: Date) => {
        setIsHistoryLoading(true);
        setHistoryAttendance(null); 
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
                toast.error(t('failedLoadHistory'));
            }
        } finally {
            setIsHistoryLoading(false);
        }
    };
  
    useEffect(() => {
        if (!authLoading && user) {
            fetchTodayAttendance();

            if (selectedHistoryDate) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const selected = new Date(selectedHistoryDate);
                selected.setHours(0, 0, 0, 0);

                if (selected.getTime() !== today.getTime()) {
                    fetchHistoryAttendance(selectedHistoryDate);
                }
            }
        }
    }, [authLoading, user, selectedHistoryDate]);

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
            toast.success(t('checkInSuccess'));
            fetchTodayAttendance(); 
        } catch (error: any) {
            console.error('Check-in failed:', error);
            toast.error(error.response?.data?.message || t('checkInFailed'));
        } finally {
            setIsCheckingIn(false);
        }
    };

    const handleCheckOut = async () => {
        setIsCheckingOut(true);
        try {
            await axios.post(`${API_URL}/api/attendance/check-out`, {}, { withCredentials: true });
            toast.success(t('checkOutSuccess'));
            fetchTodayAttendance(); 
        } catch (error: any) {
            console.error('Check-out failed:', error);
            toast.error(error.response?.data?.message || t('checkOutFailed'));
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (authLoading) {
        return <div className="flex items-center justify-center h-screen text-xl">{t('loadingAuth')}...</div>;
    }

    if (!user) {
        return <div className="flex items-center justify-center h-screen text-xl text-red-500">Not authorized. Please login.</div>;
    }

    const canCheckIn = !todayAttendance || (!todayAttendance.checkIn && !todayAttendance.checkOut);
    const canCheckOut = todayAttendance && todayAttendance.checkIn && !todayAttendance.checkOut;

    return (
        <div className="container mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
           
            <Card className="shadow-lg h-fit">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold flex items-center gap-3 text-amber-600 dark:text-amber-400">
                        <CalendarCheck className="h-8 w-8" /> {t('todaysAttendance')}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
                        {t('markAttendanceDesc')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between text-lg font-medium">
                        <span className="text-gray-800 dark:text-gray-200">{t('date')}:</span>
                        <span className="text-amber-700 dark:text-amber-300">{format(new Date(), 'PPP')}</span>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-24 text-gray-500 dark:text-gray-400">
                            <RefreshCcw className="animate-spin mr-2" /> {t('loading')}...
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg shadow-sm">
                                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 dark:text-gray-300">{t('checkIn')}</p>
                                <p className="text-xl font-semibold text-blue-800 dark:text-blue-200">
                                    {formatTime(todayAttendance?.checkIn || null)}
                                </p>
                            </div>
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg shadow-sm">
                                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 dark:text-gray-300">{t('checkOut')}</p>
                                <p className="text-xl font-semibold text-purple-800 dark:text-purple-200">
                                    {formatTime(todayAttendance?.checkOut || null)}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{t('status')}:</span>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${getStatusColor(todayAttendance?.status || 'absent')}`}>
                            {todayAttendance?.status ? t(todayAttendance.status) : t('notRecorded')}
                        </span>
                    </div>

                    <div className="flex gap-4 mt-6">
                        <Button
                            onClick={handleCheckIn}
                            disabled={!canCheckIn || isCheckingIn || loading}
                            loading={isCheckingIn}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3"
                        >
                            <CheckCircle2 size={20} className="mr-2" /> {t('checkIn')}
                        </Button>
                        <Button
                            onClick={handleCheckOut}
                            disabled={!canCheckOut || isCheckingOut || loading}
                            loading={isCheckingOut}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3"
                        >
                            <XCircle size={20} className="mr-2" /> {t('checkOut')}
                        </Button>
                    </div>
                </CardContent>
                {todayAttendance?.notes && (
                    <CardFooter className="pt-4 border-t dark:border-gray-700">
                        <p className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                            <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                            <span className="font-medium">{t('note')}:</span> {todayAttendance.notes}
                        </p>
                    </CardFooter>
                )}
            </Card>

           
                <CardHeader>
                    <CardTitle className="text-3xl font-bold flex items-center gap-3 text-blue-600 dark:text-blue-400">
                        <Clock className="h-8 w-8" /> {t('attendanceHistory')}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
                        {t('viewHistoryDesc')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner">
                        <span className="text-lg font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">{t('selectDate')}:</span>
                        <div className="w-full sm:w-auto">
                            <DatePicker
                                date={selectedHistoryDate}
                                setDate={setSelectedHistoryDate}
                                disabled={(date) => date > new Date()}
                            />
                        </div>
                    </div>

                    {isHistoryLoading ? (
                        <div className="flex justify-center items-center h-48 text-gray-500 dark:text-gray-400">
                            <RefreshCcw className="animate-spin mr-2" /> {t('loadingHistory')}...
                        </div>
                    ) : historyAttendance ? (
                        <div className="rounded-lg border dark:border-gray-700 overflow-hidden">
                            <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <TableHeader className="bg-gray-100 dark:bg-gray-800">
                                    <TableRow>
                                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('date')}</TableHead>
                                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('checkIn')}</TableHead>
                                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('checkOut')}</TableHead>
                                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('status')}</TableHead>
                                        <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('note')}</TableHead>
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
                                                {t(historyAttendance.status) || historyAttendance.status}
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
                        <p className="text-center py-8 text-gray-500 dark:text-gray-400">{t('noAttendanceFound')}</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}*/