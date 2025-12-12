'use client';
import { useLanguage } from '../../../../context/LanguageContext'; // Import Language Hook

// 1. Define Props Interface for StatusBadge
interface StatusBadgeProps {
  status: string;
}

// A helper component for styling the status badges
const StatusBadge = ({ status }: StatusBadgeProps) => {
  const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
  let specificClasses = "";

  // Keeping status checks in English as they likely come from DB
  switch (status.toLowerCase()) {
    case 'completed':
    case 'confirmed':
    case 'delivered':
      specificClasses = "bg-green-100 text-green-800";
      break;
    case 'pending':
      specificClasses = "bg-yellow-100 text-yellow-800";
      break;
    case 'cancelled':
    case 'failed':
      specificClasses = "bg-red-100 text-red-800";
      break;
    default:
      specificClasses = "bg-gray-100 text-gray-800";
  }

  return <span className={`${baseClasses} ${specificClasses}`}>{status}</span>;
};

// 2. Define Interfaces for Transaction Data
interface Transaction {
  id: string;
  type: string;
  customerName: string;
  date: string;
  amount: number;
  status: string;
}

interface RecentTransactionsTableProps {
  transactions: Transaction[];
  loading: boolean;
}

// --- The main table component with Loading State ---
export default function RecentTransactionsTable({ transactions, loading }: RecentTransactionsTableProps) {
  const { t } = useLanguage(); // Initialize hook

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <h3 className="text-lg font-medium">{t('noRecentTransactions')}</h3>
        <p className="mt-1 text-sm">{t('transactionsEmptyState')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('type')}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('customer')}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('date')}</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('amount')}</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {transactions.map((tx) => (
            <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tx.type}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{tx.customerName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {new Date(tx.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right font-mono">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(tx.amount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                <StatusBadge status={tx.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}/*
'use client';
import { useLanguage } from '../../../../context/LanguageContext'; // Import Language Hook

// A helper component for styling the status badges
const StatusBadge = ({ status }) => {
  const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
  let specificClasses = "";

  // Keeping status checks in English as they likely come from DB
  switch (status.toLowerCase()) {
    case 'completed':
    case 'confirmed':
    case 'delivered':
      specificClasses = "bg-green-100 text-green-800";
      break;
    case 'pending':
      specificClasses = "bg-yellow-100 text-yellow-800";
      break;
    case 'cancelled':
    case 'failed':
      specificClasses = "bg-red-100 text-red-800";
      break;
    default:
      specificClasses = "bg-gray-100 text-gray-800";
  }

  return <span className={`${baseClasses} ${specificClasses}`}>{status}</span>;
};

// --- The main table component with Loading State ---
export default function RecentTransactionsTable({ transactions, loading }) {
  const { t } = useLanguage(); // Initialize hook

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <h3 className="text-lg font-medium">{t('noRecentTransactions')}</h3>
        <p className="mt-1 text-sm">{t('transactionsEmptyState')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('type')}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('customer')}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('date')}</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('amount')}</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {transactions.map((tx) => (
            <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tx.type}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{tx.customerName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {new Date(tx.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right font-mono">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(tx.amount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                <StatusBadge status={tx.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}*/