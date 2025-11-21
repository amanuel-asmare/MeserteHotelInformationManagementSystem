/*'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../lib/api';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { subDays, format } from 'date-fns';
import { DollarSign, Percent, Bed, Users, BarChart, PieChart, TrendingUp, Printer, Save, CheckCircle } from 'lucide-react';
import { LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Pie, Cell } from 'recharts';

// (StatCard and ChartContainer components remain the same as your original code)
const StatCard = ({ title, value, icon, unit = '' }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-5 rounded-lg shadow-md flex items-start space-x-4"
    >
        <div className="p-3 rounded-lg bg-gray-100">{icon}</div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}{unit}</p>
        </div>
    </motion.div>
);

const ChartContainer = ({ title, icon, children }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-6 rounded-lg shadow-md"
    >
        <div className="flex items-center space-x-2 mb-4">
            {icon}
            <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        </div>
        <div className="h-72 w-full">
            {children}
        </div>
    </motion.div>
);

export default function GenerateReportClient({ user }) { // Receive user prop
    const [dateRange, setDateRange] = useState([subDays(new Date(), 29), new Date()]);
    const [startDate, endDate] = dateRange;
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [note, setNote] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleGenerateReport = async () => {
        if (!startDate || !endDate) {
            setError('Please select a valid date range.');
            return;
        }
        setLoading(true);
        setError('');
        setReportData(null);
        setSaveSuccess(false);

        try {
            const { data } = await api.get('/api/report/comprehensive', {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                }
            });
            setReportData(data);
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred while generating the report.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveReport = async () => {
        if (!reportData) {
            setError("Please generate a report first before saving.");
            return;
        }
        setSaving(true);
        setError('');
        setSaveSuccess(false);

        try {
             await api.get('/api/report/comprehensive', {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    save: 'true',
                    note: note,
                }
            });
            setSaveSuccess(true);
            setNote(''); // Clear note on success
            setTimeout(() => setSaveSuccess(false), 4000); // Hide success message after 4s
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save the report.");
        } finally {
            setSaving(false);
        }
    };
    
    const handlePrint = () => window.print();

    const PIE_COLORS = ['#4f46e5', '#10b981'];

    return (
        <div className="p-6 space-y-6 report-container bg-gray-50 min-h-screen">
            <style jsx global>{`
                @media print {
                    body * { visibility: hidden; }
                    .report-container, .report-container * { visibility: visible; }
                    .report-container { position: absolute; left: 0; top: 0; width: 100%; padding: 0; }
                    .no-print { display: none; }
                    .print-header { display: block !important; text-align: center; margin-bottom: 20px; }
                }
            `}</style>
            
            <div className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center no-print">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Comprehensive Report</h1>
                    <p className="text-gray-500">Select a date range to generate a business overview.</p>
                </div>
                <div className="flex items-center gap-4">
                    <DatePicker
                        selectsRange={true}
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(update) => setDateRange(update)}
                        isClearable={true}
                        className="p-2 border rounded-md"
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleGenerateReport}
                        disabled={loading || saving}
                        className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md disabled:bg-indigo-300"
                    >
                        {loading ? 'Generating...' : 'Generate'}
                    </motion.button>
                     <button onClick={handlePrint} className="p-2 rounded-md hover:bg-gray-100" title="Print Report">
                        <Printer />
                    </button>
                </div>
            </div>

            {error && <p className="text-red-500 text-center p-3 bg-red-100 rounded-md">{error}</p>}
            
            <AnimatePresence>
                {reportData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                    >
                        {/* --- NEW: Save Report Section for Cashier --- }
                        {user?.role === 'cashier' && (
                            <motion.div 
                                layout
                                className="bg-white p-4 rounded-lg shadow-md no-print"
                            >
                                <h3 className="font-semibold text-gray-700 mb-2">Save Report for Management</h3>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Add an optional note for the manager or admin..."
                                    className="w-full p-2 border rounded-md mb-3"
                                    rows="3"
                                ></textarea>
                                <div className="flex items-center gap-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSaveReport}
                                        disabled={saving || loading}
                                        className="px-5 py-2 bg-green-600 text-white font-semibold rounded-md disabled:bg-green-300 flex items-center gap-2"
                                    >
                                        <Save size={18} />
                                        {saving ? 'Saving...' : 'Save Report'}
                                    </motion.button>
                                    {saveSuccess && (
                                        <motion.div 
                                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                            className="text-green-600 flex items-center gap-2 font-semibold"
                                        >
                                            <CheckCircle size={20} /> Report Saved Successfully!
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                        
                        {/* --- Report Display Section --- /}
                        <div className="print-header hidden">
                            <h1 className="text-3xl font-bold">Meseret Hotel - Comprehensive Report</h1>
                            <p className="text-lg">{format(startDate, 'MM/dd/yyyy')} - {format(endDate, 'MM/dd/yyyy')}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard title="Total Revenue" value={reportData.summary.totalRevenue} unit=" ETB" icon={<DollarSign className="text-green-500" />} />
                            <StatCard title="Avg. Occupancy" value={reportData.summary.avgOccupancy} unit="%" icon={<Percent className="text-blue-500" />} />
                            <StatCard title="New Bookings" value={reportData.summary.newBookings} icon={<Bed className="text-purple-500" />} />
                            <StatCard title="Total Guests" value={reportData.summary.totalGuests} icon={<Users className="text-yellow-500" />} />
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ChartContainer title="Revenue Breakdown" icon={<PieChart className="text-indigo-500" />}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie dataKey="value" data={[{name: 'Rooms', value: parseFloat(reportData.revenueBreakdown.roomRevenue)}, {name: 'Food/Orders', value: parseFloat(reportData.revenueBreakdown.orderRevenue)}]} cx="50%" cy="50%" outerRadius={80} label>
                                            {reportData.revenueBreakdown && PIE_COLORS.map((color, index) => <Cell key={`cell-${index}`} fill={color} />)}
                                        </Pie>
                                        <Tooltip formatter={(value) => `${value} ETB`} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                            
                             <ChartContainer title="Top 5 Menu Items" icon={<BarChart className="text-green-500" />}>
                                <ResponsiveContainer>
                                    <Bar data={reportData.topMenuItems} layout="vertical" margin={{ left: 50 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis type="category" dataKey="name" width={100} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="quantitySold" fill="#10b981" name="Quantity Sold" />
                                    </Bar>
                                </ResponsiveContainer>
                            </ChartContainer>

                            <ChartContainer title="Occupancy Trend" icon={<TrendingUp className="text-blue-500" />}>
                                <ResponsiveContainer>
                                    <LineChart data={reportData.occupancyTrend} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis unit="%" />
                                        <Tooltip formatter={(value) => `${value}%`} />
                                        <Legend />
                                        <Line type="monotone" dataKey="rate" stroke="#3b82f6" name="Occupancy Rate" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartContainer>

                            <ChartContainer title="New Booking Trend" icon={<Bed className="text-purple-500" />}>
                                <ResponsiveContainer>
                                    <LineChart data={reportData.bookingTrend} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="bookings" stroke="#8b5cf6" name="New Bookings" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}*//*'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../lib/api';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { subDays } from 'date-fns';
import { DollarSign, Percent, Bed, Users, BarChart, PieChart, TrendingUp, Printer } from 'lucide-react';
import { LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Pie, Cell } from 'recharts';

const StatCard = ({ title, value, icon, unit = '' }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-5 rounded-lg shadow-md flex items-start space-x-4"
    >
        <div className="p-3 rounded-lg bg-gray-100">{icon}</div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}{unit}</p>
        </div>
    </motion.div>
);

const ChartContainer = ({ title, icon, children }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-6 rounded-lg shadow-md"
    >
        <div className="flex items-center space-x-2 mb-4">
            {icon}
            <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        </div>
        <div className="h-72 w-full">
            {children}
        </div>
    </motion.div>
);

export default function GenerateReportClient() {
    const [dateRange, setDateRange] = useState([subDays(new Date(), 29), new Date()]);
    const [startDate, endDate] = dateRange;
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateReport = async () => {
        if (!startDate || !endDate) {
            setError('Please select a valid date range.');
            return;
        }
        setLoading(true);
        setError('');
        setReportData(null);
        try {
            const { data } = await api.get('/api/reports/comprehensive', {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                }
            });
            setReportData(data);
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred while generating the report.");
        } finally {
            setLoading(false);
        }
    };
    
    const handlePrint = () => window.print();

    const PIE_COLORS = ['#4f46e5', '#10b981'];

    return (
        <div className="space-y-6 report-container">
            <style jsx global>{`
                @media print {
                    body * { visibility: hidden; }
                    .report-container, .report-container * { visibility: visible; }
                    .report-container { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none; }
                }
            `}</style>
            
            {/* Header Controls /}
            <div className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center no-print">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Comprehensive Report</h1>
                    <p className="text-gray-500">Select a date range to generate a business overview.</p>
                </div>
                <div className="flex items-center gap-4">
                    <DatePicker
                        selectsRange={true}
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(update) => setDateRange(update)}
                        isClearable={true}
                        className="p-2 border rounded-md"
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleGenerateReport}
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md disabled:bg-indigo-300"
                    >
                        {loading ? 'Generating...' : 'Generate'}
                    </motion.button>
                     <button onClick={handlePrint} className="p-2 rounded-md hover:bg-gray-100" title="Print Report">
                        <Printer />
                    </button>
                </div>
            </div>

            {error && <p className="text-red-500">{error}</p>}
            
            <AnimatePresence>
                {reportData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                    >
                        {/* KPI Cards /}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard title="Total Revenue" value={reportData.summary.totalRevenue} unit=" ETB" icon={<DollarSign className="text-green-500" />} />
                            <StatCard title="Avg. Occupancy" value={reportData.summary.avgOccupancy} unit="%" icon={<Percent className="text-blue-500" />} />
                            <StatCard title="New Bookings" value={reportData.summary.newBookings} icon={<Bed className="text-purple-500" />} />
                            <StatCard title="Total Guests" value={reportData.summary.totalGuests} icon={<Users className="text-yellow-500" />} />
                        </div>
                        
                        {/* Charts Grid /}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ChartContainer title="Revenue Breakdown" icon={<PieChart className="text-indigo-500" />}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie dataKey="value" data={[{name: 'Rooms', value: parseFloat(reportData.revenueBreakdown.roomRevenue)}, {name: 'Food/Orders', value: parseFloat(reportData.revenueBreakdown.orderRevenue)}]} cx="50%" cy="50%" outerRadius={80} label>
                                            {reportData.revenueBreakdown && PIE_COLORS.map((color, index) => <Cell key={`cell-${index}`} fill={color} />)}
                                        </Pie>
                                        <Tooltip formatter={(value) => `${value} ETB`} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                            
                             <ChartContainer title="Top 5 Menu Items" icon={<BarChart className="text-green-500" />}>
                                <ResponsiveContainer>
                                    <Bar data={reportData.topMenuItems} layout="vertical" margin={{ left: 50 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis type="category" dataKey="name" width={100} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="quantitySold" fill="#10b981" name="Quantity Sold" />
                                    </Bar>
                                </ResponsiveContainer>
                            </ChartContainer>

                            <ChartContainer title="Occupancy Trend" icon={<TrendingUp className="text-blue-500" />}>
                                <ResponsiveContainer>
                                    <LineChart data={reportData.occupancyTrend} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis unit="%" />
                                        <Tooltip formatter={(value) => `${value}%`} />
                                        <Legend />
                                        <Line type="monotone" dataKey="rate" stroke="#3b82f6" name="Occupancy Rate" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartContainer>

                            <ChartContainer title="New Booking Trend" icon={<Bed className="text-purple-500" />}>
                                <ResponsiveContainer>
                                    <LineChart data={reportData.bookingTrend} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="bookings" stroke="#8b5cf6" name="New Bookings" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}*/