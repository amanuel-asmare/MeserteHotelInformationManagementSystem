import { motion } from 'framer-motion';
import { Eye, Check } from 'lucide-react';

const StatusBadge = ({ status }) => {
    const styles = {
        paid: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        cancelled: 'bg-red-100 text-red-800'
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>;
};

// This component is now only responsible for rendering the table.
// All loading and empty state logic is handled by its parent.
export default function PayrollTable({ payslips, onViewPayslip, onUpdatePayslip }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {payslips.map(p => (
                        <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <img className="h-10 w-10 rounded-full object-cover" src={p.user.profileImage} alt={`${p.user.firstName}'s profile`} />
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{p.user.firstName} {p.user.lastName}</div>
                                        <div className="text-sm text-gray-500 capitalize">{p.user.role}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-800">ETB {p.netPay.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center"><StatusBadge status={p.status} /></td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                <div className="flex justify-center space-x-2">
                                    <button onClick={() => onViewPayslip(p)} className="text-indigo-600 hover:text-indigo-900" title="View Details"><Eye size={18} /></button>
                                    {p.status === 'pending' && (
                                        <button onClick={() => onUpdatePayslip(p._id, { status: 'paid' })} className="text-green-600 hover:text-green-900" title="Mark as Paid"><Check size={18} /></button>
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