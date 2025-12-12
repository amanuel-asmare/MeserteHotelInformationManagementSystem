'use client';

import { motion } from 'framer-motion';
import { Eye, Check, Edit3 } from 'lucide-react';
import { useLanguage } from '../../../../../context/LanguageContext';

const StatusBadge = ({ status }: { status: string }) => {
  const { t } = useLanguage();

  const styles: Record<string, string> = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    'not-generated': 'bg-gray-100 text-gray-600',
  };

  const labelMap: Record<string, string> = {
    paid: t('paid'),
    pending: t('pending'),
    cancelled: t('cancelled'),
    // FIX: Cast keys to any to avoid type error
    'not-generated': t('notGenerated' as any) || t('payrollNotGenerated' as any),
  };

  const displayLabel = labelMap[status] || labelMap['not-generated'];

  return (
    <span className={`inline-block px-3 py-1 text-[10px] sm:text-xs font-semibold rounded-full ${styles[status] || styles['not-generated']}`}>
      {displayLabel}
    </span>
  );
};

interface PayrollTableProps {
  payslips: any[];
  onViewPayslip: (payslip: any) => void;
  onUpdatePayslip?: (id: string, updates: any) => Promise<void>;
  onEditPayslip?: (payslip: any) => void;
  isGenerated?: boolean;
  isAdmin?: boolean;
}

export default function PayrollTable({
  payslips,
  onViewPayslip,
  onUpdatePayslip,
  onEditPayslip,
  isGenerated = false,
  isAdmin = false,
}: PayrollTableProps) {
  const { t } = useLanguage();

  const handleMarkAsPaid = (id: string) => {
    onUpdatePayslip?.(id, { status: 'paid' });
  };

  return (
    <div className="w-full max-w-[100vw] overflow-x-auto bg-white rounded-2xl shadow-2xl border border-amber-100">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-amber-50 to-orange-50">
          <tr>
            <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
              {t('employee')}
            </th>
            <th className="px-4 sm:px-6 py-4 text-right text-xs font-bold text-amber-900 uppercase tracking-wider">
              {/* FIX: Cast 'netPayAmount' to any */}
              {t('netPayAmount' as any) || t('netPay')}
            </th>
            <th className="px-4 sm:px-6 py-4 text-center text-xs font-bold text-amber-900 uppercase tracking-wider">
              {t('status')}
            </th>
            <th className="px-4 sm:px-6 py-4 text-center text-xs font-bold text-amber-900 uppercase tracking-wider">
              {t('actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {payslips.map((p) => (
            <motion.tr
              key={p._id || p.user._id}
              whileHover={{ backgroundColor: '#fffbeb' }}
              className="hover:shadow-md transition-all"
            >
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <img
                    className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border-4 border-amber-200 shadow-md"
                    src={p.user.profileImage || '/default-avatar.png'}
                    alt={p.user.firstName}
                  />
                  <div className="ml-3 sm:ml-4">
                    <div className="text-sm font-bold text-gray-900">
                      {p.user.firstName} <span className="hidden sm:inline">{p.user.lastName}</span>
                      <span className="sm:hidden">{p.user.lastName?.charAt(0)}.</span>
                    </div>
                    <div className="text-xs sm:text-sm text-amber-600 font-medium capitalize">
                      {p.user.role === 'receptionist' ? t('receptionist') :
                       p.user.role === 'cashier' ? t('cashier') :
                       p.user.role === 'manager' ? t('manager') : p.user.role}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm sm:text-lg font-bold text-amber-700">
                ETB {p.netPay.toLocaleString()}
              </td>
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                <StatusBadge status={p._id && isGenerated ? p.status : 'not-generated'} />
              </td>
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                <div className="flex justify-center items-center space-x-2 sm:space-x-3">
                  <button
                    onClick={() => onViewPayslip(p)}
                    className="text-indigo-600 hover:text-indigo-800 transform hover:scale-110 transition p-1"
                    title={t('view')}
                  >
                    <Eye size={18} className="sm:w-5 sm:h-5" />
                  </button>

                  {isAdmin && p._id && (
                    <button
                      onClick={() => onEditPayslip?.(p)}
                      className="text-amber-600 hover:text-amber-800 transform hover:scale-110 transition p-1"
                      // FIX: Cast 'editPayslip' to any
                      title={t('editPayslip' as any) || t('edit')}
                    >
                      <Edit3 size={18} className="sm:w-5 sm:h-5" />
                    </button>
                  )}

                  {!isAdmin && p.status === 'pending' && isGenerated && p._id && onUpdatePayslip && (
                    <button
                      onClick={() => handleMarkAsPaid(p._id)}
                      className="text-green-600 hover:text-green-900 transform hover:scale-110 transition p-1"
                      // FIX: Cast 'markAsPaid' to any
                      title={t('markAsPaid' as any)}
                    >
                      <Check size={18} className="sm:w-5 sm:h-5" />
                    </button>
                  )}
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}/*// src/app/cashier/payroll/components/PayrollTable.tsx
'use client';

import { motion } from 'framer-motion';
import { Eye, Check, Edit3 } from 'lucide-react';
import { useLanguage } from '../../../../../context/LanguageContext';

const StatusBadge = ({ status }: { status: string }) => {
  const { t } = useLanguage();

  const styles: Record<string, string> = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    'not-generated': 'bg-gray-100 text-gray-600',
  };

  const labelMap: Record<string, string> = {
    paid: t('paid'),
    pending: t('pending'),
    cancelled: t('cancelled'),
    'not-generated': t('notGenerated') || t('payrollNotGenerated'),
  };

  const displayLabel = labelMap[status] || labelMap['not-generated'];

  return (
    <span className={`inline-block px-3 py-1 text-[10px] sm:text-xs font-semibold rounded-full ${styles[status] || styles['not-generated']}`}>
      {displayLabel}
    </span>
  );
};

interface PayrollTableProps {
  payslips: any[];
  onViewPayslip: (payslip: any) => void;
  onUpdatePayslip?: (id: string, updates: any) => Promise<void>;
  onEditPayslip?: (payslip: any) => void;
  isGenerated?: boolean;
  isAdmin?: boolean;
}

export default function PayrollTable({
  payslips,
  onViewPayslip,
  onUpdatePayslip,
  onEditPayslip,
  isGenerated = false,
  isAdmin = false,
}: PayrollTableProps) {
  const { t } = useLanguage();

  const handleMarkAsPaid = (id: string) => {
    onUpdatePayslip?.(id, { status: 'paid' });
  };

  return (
    <div className="w-full max-w-[100vw] overflow-x-auto bg-white rounded-2xl shadow-2xl border border-amber-100">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-amber-50 to-orange-50">
          <tr>
            <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">
              {t('employee')}
            </th>
            <th className="px-4 sm:px-6 py-4 text-right text-xs font-bold text-amber-900 uppercase tracking-wider">
              {t('netPayAmount') || t('netPay')}
            </th>
            <th className="px-4 sm:px-6 py-4 text-center text-xs font-bold text-amber-900 uppercase tracking-wider">
              {t('status')}
            </th>
            <th className="px-4 sm:px-6 py-4 text-center text-xs font-bold text-amber-900 uppercase tracking-wider">
              {t('actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {payslips.map((p) => (
            <motion.tr
              key={p._id || p.user._id}
              whileHover={{ backgroundColor: '#fffbeb' }}
              className="hover:shadow-md transition-all"
            >
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <img
                    className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border-4 border-amber-200 shadow-md"
                    src={p.user.profileImage || '/default-avatar.png'}
                    alt={p.user.firstName}
                  />
                  <div className="ml-3 sm:ml-4">
                    <div className="text-sm font-bold text-gray-900">
                      {p.user.firstName} <span className="hidden sm:inline">{p.user.lastName}</span>
                      <span className="sm:hidden">{p.user.lastName?.charAt(0)}.</span>
                    </div>
                    <div className="text-xs sm:text-sm text-amber-600 font-medium capitalize">
                      {p.user.role === 'receptionist' ? t('receptionist') :
                       p.user.role === 'cashier' ? t('cashier') :
                       p.user.role === 'manager' ? t('manager') : p.user.role}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm sm:text-lg font-bold text-amber-700">
                ETB {p.netPay.toLocaleString()}
              </td>
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                <StatusBadge status={p._id && isGenerated ? p.status : 'not-generated'} />
              </td>
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                <div className="flex justify-center items-center space-x-2 sm:space-x-3">
                  <button
                    onClick={() => onViewPayslip(p)}
                    className="text-indigo-600 hover:text-indigo-800 transform hover:scale-110 transition p-1"
                    title={t('view')}
                  >
                    <Eye size={18} className="sm:w-5 sm:h-5" />
                  </button>

                  {isAdmin && p._id && (
                    <button
                      onClick={() => onEditPayslip?.(p)}
                      className="text-amber-600 hover:text-amber-800 transform hover:scale-110 transition p-1"
                      title={t('editPayslip') || t('edit')}
                    >
                      <Edit3 size={18} className="sm:w-5 sm:h-5" />
                    </button>
                  )}

                  {!isAdmin && p.status === 'pending' && isGenerated && p._id && onUpdatePayslip && (
                    <button
                      onClick={() => handleMarkAsPaid(p._id)}
                      className="text-green-600 hover:text-green-900 transform hover:scale-110 transition p-1"
                      title={t('markAsPaid')}
                    >
                      <Check size={18} className="sm:w-5 sm:h-5" />
                    </button>
                  )}
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}*/