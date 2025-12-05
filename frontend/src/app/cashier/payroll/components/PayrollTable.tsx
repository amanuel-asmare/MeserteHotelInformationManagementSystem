/*// src/app/cashier/payroll/components/PayrollTable.tsx
'use client';

import { motion } from 'framer-motion';
import { Eye, Check } from 'lucide-react';

// SINGLE StatusBadge component (supports "not-generated" state)
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    'not-generated': 'bg-gray-100 text-gray-600',
  };

  const label =
    status === 'not-generated'
      ? 'Not Generated'
      : status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
        styles[status] || styles['not-generated']
      }`}
    >
      {label}
    </span>
  );
};

// Main PayrollTable component
interface PayrollTableProps {
  payslips: any[];
  onViewPayslip: (payslip: any) => void;
  onUpdatePayslip: (id: string, updates: any) => Promise<void>;
  isGenerated?: boolean;
}

export default function PayrollTable({
  payslips,
  onViewPayslip,
  onUpdatePayslip,
  isGenerated = true,
}: PayrollTableProps) {
  return (
    <div className="overflow-x-auto bg-white rounded-2xl shadow-xl">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Employee
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Net Pay
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {payslips.map((p) => (
            <motion.tr
              key={p._id || p.user._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hover:bg-amber-50 transition-colors"
            >
              {/* Employee Info /}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={p.user.profileImage || '/default-avatar.png'}
                    alt={`${p.user.firstName} ${p.user.lastName}`}
                  />
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {p.user.firstName} {p.user.lastName}
                    </div>
                    <div className="text-sm text-gray-500 capitalize">
                      {p.user.role}
                    </div>
                  </div>
                </div>
              </td>

              {/* Net Pay /}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-800">
                ETB {p.netPay.toLocaleString()}
              </td>

              {/* Status Badge /}
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <StatusBadge
                  status={
                    p.isGenerated === false || !p._id
                      ? 'not-generated'
                      : p.status || 'pending'
                  }
                />
              </td>

              {/* Actions /}
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <div className="flex justify-center items-center space-x-4">
                  <button
                    onClick={() => onViewPayslip(p)}
                    className="text-indigo-600 hover:text-indigo-900 transition"
                    title="View Payslip"
                  >
                    <Eye size={18} />
                  </button>

                  {/* Mark as Paid – only for generated pending payslips /}
                  {p.status === 'pending' && isGenerated && p._id && (
                    <button
                      onClick={() => onUpdatePayslip(p._id, { status: 'paid' })}
                      className="text-green-600 hover:text-green-900 transition"
                      title="Mark as Paid"
                    >
                      <Check size={18} />
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
}*/// src/app/cashier/payroll/components/PayrollTable.tsx
'use client';
import { motion } from 'framer-motion';
import { Eye, Check, Edit3 } from 'lucide-react';

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    'not-generated': 'bg-gray-100 text-gray-600',
  };
  const label = status === 'not-generated' ? 'Not Generated' : status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${styles[status] || styles['not-generated']}`}>
      {label}
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
  const handleMarkAsPaid = (id: string) => {
    onUpdatePayslip?.(id, { status: 'paid' });
  };

  return (
    <div className="overflow-x-auto bg-white rounded-2xl shadow-2xl border border-amber-100">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-amber-50 to-orange-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-amber-900 uppercase tracking-wider">Employee</th>
            <th className="px-6 py-4 text-right text-xs font-bold text-amber-900 uppercase tracking-wider">Net Pay</th>
            <th className="px-6 py-4 text-center text-xs font-bold text-amber-900 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-center text-xs font-bold text-amber-900 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {payslips.map((p) => (
            <motion.tr
              key={p._id || p.user._id}
              whileHover={{ backgroundColor: '#fffbeb' }}
              className="hover:shadow-md transition-all"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <img
                    className="h-12 w-12 rounded-full object-cover border-4 border-amber-200 shadow-md"
                    src={p.user.profileImage || '/default-avatar.png'}
                    alt={p.user.firstName}
                  />
                  <div className="ml-4">
                    <div className="text-sm font-bold text-gray-900">{p.user.firstName} {p.user.lastName}</div>
                    <div className="text-sm text-amber-600 font-medium capitalize">{p.user.role}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-lg font-bold text-amber-700">
                ETB {p.netPay.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <StatusBadge status={p._id && isGenerated ? p.status : 'not-generated'} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex justify-center items-center space-x-3">
                  <button onClick={() => onViewPayslip(p)} className="text-indigo-600 hover:text-indigo-800 transform hover:scale-110 transition">
                    <Eye size={20} />
                  </button>

                  {isAdmin && p._id && (
                    <button
                      onClick={() => onEditPayslip?.(p)}
                      className="text-amber-600 hover:text-amber-800 transform hover:scale-110 transition"
                      title="Edit Payslip"
                    >
                      <Edit3 size={20} />
                    </button>
                  )}

                  {!isAdmin && p.status === 'pending' && isGenerated && p._id && onUpdatePayslip && (
                    <button
                      onClick={() => handleMarkAsPaid(p._id)}
                      className="text-green-600 hover:text-green-900 transform hover:scale-110 transition"
                      title="Mark as Paid"
                    >
                      <Check size={20} />
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
}