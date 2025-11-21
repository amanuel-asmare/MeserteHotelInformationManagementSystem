// frontend/src/app/cashier/components/CahierDashbored.tsx
'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import RecentTransactionsTable from './RecentTransactionsTable';
import {
    BanknotesIcon,
    ClockIcon,
    CheckCircleIcon,
    ArrowUturnLeftIcon,
} from '@heroicons/react/24/outline';

// --- Improved StatCard Component ---
const StatCard = ({ title, value, icon, color, loading }) => {
    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2"></div>
            </div>
        );
    }

    return (
        <div className={`bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center space-x-4 border-l-4 ${color}`}>
            <div className={`p-3 rounded-full ${color.replace('border', 'bg').replace('-500', '-100')}`}>
               {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
            </div>
        </div>
    );
};


// --- Main Dashboard Component ---
export default function CashierDashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // ✅ SINGLE API CALL to our new efficient endpoint
                const { data } = await api.get('/api/dashboard/cashier');
                setDashboardData(data);
                setError(null); // Clear previous errors
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setError("Could not load dashboard data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (error) {
        return (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md" role="alert">
                <p className="font-bold">An Error Occurred</p>
                <p>{error}</p>
            </div>
        );
    }
    
    // Currency formatter for consistency
    const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(amount);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
                Cashier Dashboard
            </h1>
            
            {/* --- Stats Grid --- */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                    title="Today's Revenue" 
                    value={loading ? '...' : formatCurrency(dashboardData?.stats.revenue || 0)} 
                    icon={<BanknotesIcon className="h-7 w-7 text-green-500" />}
                    color="border-green-500"
                    loading={loading} 
                />
                <StatCard 
                    title="Pending Payments" 
                    value={loading ? '...' : dashboardData?.stats.pending || 0} 
                    icon={<ClockIcon className="h-7 w-7 text-yellow-500" />}
                    color="border-yellow-500"
                    loading={loading}
                />
                <StatCard 
                    title="Completed Today" 
                    value={loading ? '...' : dashboardData?.stats.completed || 0} 
                    icon={<CheckCircleIcon className="h-7 w-7 text-blue-500" />}
                    color="border-blue-500"
                    loading={loading}
                />
                <StatCard 
                    title="Refunds Issued Today" 
                    value={loading ? '...' : dashboardData?.stats.refunds || 0} 
                    icon={<ArrowUturnLeftIcon className="h-7 w-7 text-red-500" />}
                    color="border-red-500"
                    loading={loading}
                />
            </div>

            {/* --- Recent Transactions Table --- */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Transactions</h2>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <RecentTransactionsTable 
                        transactions={dashboardData?.transactions || []} 
                        loading={loading} 
                    />
                </div>
            </div>
        </div>
    );
}/*// frontend/src/app/cashier/components/CashierDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api'; // Your pre-configured axios instance
import RecentTransactionsTable from './RecentTransactionsTable';

// Import icons for the StatCards from heroicons
import {
    BanknotesIcon,
    ClockIcon,
    CheckCircleIcon,
    ArrowUturnLeftIcon,
} from '@heroicons/react/24/outline';


// StatCard component with better icon handling
const StatCard = ({ title, value, icon, color }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex items-center space-x-4 border-l-4 ${color}`}>
        <div className={`p-3 rounded-full ${color.replace('border', 'bg').replace('-500', '-100')}`}>
           {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
    </div>
);


// Main Dashboard Component
export default function CashierDashboard() {
    const [stats, setStats] = useState({
        revenue: 0,
        pending: 0,
        completed: 0,
        refunds: 0,
    });
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch bookings and food orders concurrently for better performance
                const [bookingsRes, ordersRes] = await Promise.all([
                    api.get('/api/bookings/receptionist/all-bookings'), // Endpoint for all bookings
                    api.get('/api/orders') // Endpoint for all food orders
                ]);

                const bookings = bookingsRes.data;
                const orders = ordersRes.data;

                // --- Process Data for Stats ---
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // 1. Today's Revenue (from completed bookings and orders)
                const todaysBookingsRevenue = bookings
                    .filter(b => new Date(b.createdAt) >= today && b.paymentStatus === 'completed')
                    .reduce((sum, b) => sum + b.totalPrice, 0);

                const todaysOrdersRevenue = orders
                    .filter(o => new Date(o.orderedAt) >= today && o.paymentStatus === 'completed')
                    .reduce((sum, o) => sum + o.totalAmount, 0);

                // 2. Pending Payments (all pending, not just today)
                const pendingBookings = bookings.filter(b => b.paymentStatus === 'pending').length;
                const pendingOrders = orders.filter(o => o.paymentStatus === 'pending').length;

                // 3. Today's Completed Transactions
                const completedBookingsToday = bookings.filter(b => new Date(b.createdAt) >= today && b.paymentStatus === 'completed').length;
                const completedOrdersToday = orders.filter(o => new Date(o.orderedAt) >= today && o.paymentStatus === 'completed').length;

                // 4. Refunds Issued (assuming only bookings can be refunded for now)
                const refundsToday = bookings.filter(b => new Date(b.updatedAt) >= today && b.paymentStatus === 'refunded').length;

                setStats({
                    revenue: todaysBookingsRevenue + todaysOrdersRevenue,
                    pending: pendingBookings + pendingOrders,
                    completed: completedBookingsToday + completedOrdersToday,
                    refunds: refundsToday
                });


                // --- Process Data for Recent Transactions Table ---
                const formattedBookings = bookings.map(b => ({
                    id: `book-${b._id}`,
                    type: 'Room Booking',
                    customerName: `${b.user?.firstName || 'Guest'} ${b.user?.lastName || ''}`,
                    date: b.createdAt,
                    amount: b.totalPrice,
                    status: b.paymentStatus // or b.status for booking status
                }));

                const formattedOrders = orders.map(o => ({
                    id: `order-${o._id}`,
                    type: 'Food Order',
                    customerName: o.customer.name,
                    date: o.orderedAt,
                    amount: o.totalAmount,
                    status: o.paymentStatus
                }));

                // Combine, sort by date, and take the 10 most recent
                const allTransactions = [...formattedBookings, ...formattedOrders]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 10);
                
                setRecentTransactions(allTransactions);

            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setError("Could not load dashboard data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // Empty dependency array means this runs once on component mount

    if (loading) {
        return <div className="text-center py-10">Loading Dashboard...</div>;
    }

    if (error) {
        return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{error}</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-semibold text-gray-800 animate-fade-in-down">Cashier Dashboard</h1>
            
            <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                    title="Today's Revenue" 
                    value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(stats.revenue)} 
                    icon={<BanknotesIcon className="h-7 w-7 text-green-500" />}
                    color="border-green-500" 
                />
                <StatCard 
                    title="Pending Payments" 
                    value={stats.pending} 
                    icon={<ClockIcon className="h-7 w-7 text-yellow-500" />}
                    color="border-yellow-500" 
                />
                <StatCard 
                    title="Completed Transactions" 
                    value={stats.completed} 
                    icon={<CheckCircleIcon className="h-7 w-7 text-blue-500" />}
                    color="border-blue-500" 
                />
                <StatCard 
                    title="Refunds Issued" 
                    value={stats.refunds} 
                    icon={<ArrowUturnLeftIcon className="h-7 w-7 text-red-500" />}
                    color="border-red-500" 
                />
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-700">Recent Transactions</h2>
                <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
                    <RecentTransactionsTable transactions={recentTransactions} />
                </div>
            </div>
        </div>
    );
}*/