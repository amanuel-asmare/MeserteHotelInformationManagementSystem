'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { Search, FileText, History, Clock, DollarSign } from 'lucide-react';
import BillDetailsModal from './BillDetailsModal';
import { useLanguage } from '../../../../../context/LanguageContext';

// --- Helper to construct full image URL ---
const getImageUrl = (path: string) => {
  if (!path) return '/default-avatar.png';
  if (path.startsWith('http')) return path;
  // const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://mesertehotelinformationmanagementsystem.onrender.com';
  return `${API_BASE}${path}`;
};

const StatCard = ({ title, value, icon, color }: any) => (
  <div className={`bg-white p-5 rounded-lg shadow-md flex items-center space-x-4 border-l-4 ${color}`}>
    <div className={`p-3 rounded-full ${color.replace('border', 'bg').replace('-500', '-100')}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-xl font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

export default function BillingManagementClient() {
  const [activeTab, setActiveTab] = useState('active');
  const [activeBills, setActiveBills] = useState<any[]>([]);
  const [invoiceHistory, setInvoiceHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBill, setSelectedBill] = useState<string | null>(null);

  const { t } = useLanguage();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [activeRes, historyRes] = await Promise.all([
        api.get('/api/billing/active'),
        api.get('/api/billing/history')
      ]);
      setActiveBills(activeRes.data);
      setInvoiceHistory(historyRes.data);
    } catch (error) {
      console.error("Failed to fetch billing data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredActiveBills = activeBills.filter(bill =>
    bill.booking?.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.booking?.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.booking?.room?.roomNumber?.toString().includes(searchTerm)
  );

  const totalOutstanding = activeBills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-800">{t('billingManagement')}</h1>
        {/* FIX: Cast 'billingManagementDesc' to any to avoid type error */}
        <p className="text-gray-500 mt-1">{t('billingManagementDesc' as any)}</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title={t('totalOutstanding')}
          value={`ETB ${totalOutstanding.toFixed(2)}`}
          icon={<DollarSign className="h-6 w-6 text-yellow-500" />}
          color="border-yellow-500"
        />
        <StatCard
          title={t('activeBills')}
          value={activeBills.length}
          icon={<FileText className="h-6 w-6 text-blue-500" />}
          color="border-blue-500"
        />
        <StatCard
          title={t('invoicesToday')}
          value={invoiceHistory.filter(inv => new Date(inv.paidAt).toDateString() === new Date().toDateString()).length}
          icon={<Clock className="h-6 w-6 text-green-500" />}
          color="border-green-500"
        />
      </div>

      {/* Tabs & Content */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4 border-b pb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'active' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}
            >
              {t('activeBills')}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'history' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}
            >
              {t('invoiceHistory')}
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={t('searchByNameOrRoom')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {loading ? (
              <div className="text-center py-10 text-gray-500">{t('loading')}</div>
            ) : activeTab === 'active' ? (
              filteredActiveBills.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-lg">{t('noActiveBills')}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredActiveBills.map(bill => (
                    <motion.div
                      key={bill._id}
                      layout
                      className="p-4 border rounded-lg hover:shadow-lg transition-shadow cursor-pointer bg-white"
                      onClick={() => setSelectedBill(bill._id)}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src={getImageUrl(bill.booking.user.profileImage)}
                          alt={t('guest')}
                          className="h-12 w-12 rounded-full object-cover border border-gray-200"
                          onError={(e) => (e.currentTarget.src = '/default-avatar.png')}
                        />
                        <div>
                          <p className="font-semibold text-gray-800">
                            {bill.booking.user.firstName} {bill.booking.user.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {t('room')} {bill.booking.room.roomNumber}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {t('checkoutDate')}: {new Date(bill.booking.checkOut).toLocaleDateString()}
                      </p>
                      <p className="text-lg font-bold text-right text-indigo-600 mt-2">
                        ETB {bill.totalAmount.toFixed(2)}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )
            ) : (
              invoiceHistory.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-lg">{t('noInvoiceHistory')}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('guest')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('room')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('total')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('paidAt')}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoiceHistory.map((inv) => (
                        <tr key={inv._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {inv.user?.firstName} {inv.user?.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {inv.room?.roomNumber || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ETB {inv.totalAmount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(inv.paidAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedBill && (
          <BillDetailsModal
            billId={selectedBill}
            onClose={() => setSelectedBill(null)}
            onCheckoutSuccess={fetchData}
          />
        )}
      </AnimatePresence>
    </div>
  );
}/*'use client';
import { Modal } from 'react-native';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { Search, FileText, History, Clock, DollarSign } from 'lucide-react';
import BillDetailsModal from './BillDetailsModal';
import { useLanguage } from '../../../../../context/LanguageContext';

// --- Helper to construct full image URL ---
const getImageUrl = (path: string) => {
  if (!path) return '/default-avatar.png';
  if (path.startsWith('http')) return path;
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';
  return `${API_BASE}${path}`;
};

const StatCard = ({ title, value, icon, color }: any) => (
  <div className={`bg-white p-5 rounded-lg shadow-md flex items-center space-x-4 border-l-4 ${color}`}>
    <div className={`p-3 rounded-full ${color.replace('border', 'bg').replace('-500', '-100')}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-xl font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

export default function BillingManagementClient() {
  const [activeTab, setActiveTab] = useState('active');
  const [activeBills, setActiveBills] = useState<any[]>([]);
  const [invoiceHistory, setInvoiceHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBill, setSelectedBill] = useState<string | null>(null);

  const { t } = useLanguage();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [activeRes, historyRes] = await Promise.all([
        api.get('/api/billing/active'),
        api.get('/api/billing/history')
      ]);
      setActiveBills(activeRes.data);
      setInvoiceHistory(historyRes.data);
    } catch (error) {
      console.error("Failed to fetch billing data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredActiveBills = activeBills.filter(bill =>
    bill.booking?.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.booking?.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.booking?.room?.roomNumber?.toString().includes(searchTerm)
  );

  const totalOutstanding = activeBills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
   
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-800">{t('billingManagement')}</h1>
        <p className="text-gray-500 mt-1">{t('billingManagementDesc')}</p>
      </motion.div>

     
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title={t('totalOutstanding')}
          value={`ETB ${totalOutstanding.toFixed(2)}`}
          icon={<DollarSign className="h-6 w-6 text-yellow-500" />}
          color="border-yellow-500"
        />
        <StatCard
          title={t('activeBills')}
          value={activeBills.length}
          icon={<FileText className="h-6 w-6 text-blue-500" />}
          color="border-blue-500"
        />
        <StatCard
          title={t('invoicesToday')}
          value={invoiceHistory.filter(inv => new Date(inv.paidAt).toDateString() === new Date().toDateString()).length}
          icon={<Clock className="h-6 w-6 text-green-500" />}
          color="border-green-500"
        />
      </div>

      
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4 border-b pb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'active' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}
            >
              {t('activeBills')}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'history' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}
            >
              {t('invoiceHistory')}
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={t('searchByNameOrRoom')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {loading ? (
              <div className="text-center py-10 text-gray-500">{t('loading')}</div>
            ) : activeTab === 'active' ? (
              filteredActiveBills.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-lg">{t('noActiveBills')}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredActiveBills.map(bill => (
                    <motion.div
                      key={bill._id}
                      layout
                      className="p-4 border rounded-lg hover:shadow-lg transition-shadow cursor-pointer bg-white"
                      onClick={() => setSelectedBill(bill._id)}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src={getImageUrl(bill.booking.user.profileImage)}
                          alt={t('guest')}
                          className="h-12 w-12 rounded-full object-cover border border-gray-200"
                          onError={(e) => (e.currentTarget.src = '/default-avatar.png')}
                        />
                        <div>
                          <p className="font-semibold text-gray-800">
                            {bill.booking.user.firstName} {bill.booking.user.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {t('room')} {bill.booking.room.roomNumber}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {t('checkoutDate')}: {new Date(bill.booking.checkOut).toLocaleDateString()}
                      </p>
                      <p className="text-lg font-bold text-right text-indigo-600 mt-2">
                        ETB {bill.totalAmount.toFixed(2)}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )
            ) : (
              invoiceHistory.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-lg">{t('noInvoiceHistory')}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('guest')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('room')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('total')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('paidAt')}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoiceHistory.map((inv) => (
                        <tr key={inv._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {inv.user?.firstName} {inv.user?.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {inv.room?.roomNumber || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ETB {inv.totalAmount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(inv.paidAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </motion.div>
        </AnimatePresence>
      </div>


      <AnimatePresence>
        {selectedBill && (
          <BillDetailsModal
            billId={selectedBill}
            onClose={() => setSelectedBill(null)}
            onCheckoutSuccess={fetchData}
          />
        )}
      </AnimatePresence>
    </div>
  );
}*/