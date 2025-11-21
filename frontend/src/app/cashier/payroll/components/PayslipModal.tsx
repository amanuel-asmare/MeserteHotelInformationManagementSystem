// frontend/src/app/cashier/payroll/components/PayslipModal.tsx
import { motion } from 'framer-motion';
import { X, Printer, Edit, Save, PlusCircle, MinusCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function PayslipModal({ payslip, onClose, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const { register, handleSubmit, watch } = useForm({
        defaultValues: {
            bonus: payslip.bonus || 0,
            deductions: payslip.deductions || 0,
        }
    });

    const handleSave = async (data) => {
        const success = await onUpdate(payslip._id, {
            bonus: parseFloat(data.bonus),
            deductions: parseFloat(data.deductions)
        });
        if(success) setIsEditing(false);
    };
    
    // Recalculate totals for live preview in edit mode
    const watchedBonus = parseFloat(watch('bonus')) || 0;
    const watchedDeductions = parseFloat(watch('deductions')) || 0;
    const grossPay = payslip.baseSalary + (isEditing ? watchedBonus : payslip.bonus);
    const totalDeductions = payslip.tax + payslip.pension + (isEditing ? watchedDeductions : payslip.deductions);
    const netPay = grossPay - totalDeductions;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">Payslip Details</h2>
                    <div className="flex items-center space-x-2">
                        {isEditing ? (
                             <button onClick={handleSubmit(handleSave)} className="p-2 rounded-full hover:bg-gray-200"><Save size={18} className="text-green-600" /></button>
                        ) : (
                             <button onClick={() => setIsEditing(true)} className="p-2 rounded-full hover:bg-gray-200"><Edit size={18} /></button>
                        )}
                        <button onClick={() => window.print()} className="p-2 rounded-full hover:bg-gray-200"><Printer size={18} /></button>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><X size={20} /></button>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                     {/* Header */}
                     <div>
                        <h3 className="font-bold text-xl">{payslip.user.firstName} {payslip.user.lastName}</h3>
                        <p className="text-sm text-gray-500">{`Payslip for ${new Date(payslip.year, payslip.month - 1).toLocaleString('default', { month: 'long' })} ${payslip.year}`}</p>
                     </div>
                     {/* Earnings */}
                     <div className="border-t pt-4">
                        <h4 className="font-semibold text-green-600 mb-2">Earnings</h4>
                        <div className="flex justify-between text-sm"><p>Base Salary</p><p>ETB {payslip.baseSalary.toLocaleString()}</p></div>
                        <div className="flex justify-between text-sm items-center">
                            <p className="flex items-center gap-2"><PlusCircle size={14} /> Bonus</p>
                            {isEditing ? <input type="number" {...register('bonus')} className="w-24 p-1 border rounded text-right" /> : <p>ETB {payslip.bonus.toLocaleString()}</p>}
                        </div>
                        <div className="flex justify-between text-sm font-bold mt-2 border-t pt-1"><p>Gross Pay</p><p>ETB {grossPay.toLocaleString()}</p></div>
                     </div>
                     {/* Deductions */}
                     <div className="border-t pt-4">
                        <h4 className="font-semibold text-red-600 mb-2">Deductions</h4>
                        <div className="flex justify-between text-sm"><p>Income Tax</p><p>ETB {payslip.tax.toLocaleString()}</p></div>
                        <div className="flex justify-between text-sm"><p>Pension (7%)</p><p>ETB {payslip.pension.toLocaleString()}</p></div>
                         <div className="flex justify-between text-sm items-center">
                            <p className="flex items-center gap-2"><MinusCircle size={14} /> Other Deductions</p>
                            {isEditing ? <input type="number" {...register('deductions')} className="w-24 p-1 border rounded text-right" /> : <p>ETB {payslip.deductions.toLocaleString()}</p>}
                        </div>
                        <div className="flex justify-between text-sm font-bold mt-2 border-t pt-1"><p>Total Deductions</p><p>ETB {totalDeductions.toLocaleString()}</p></div>
                     </div>
                     {/* Net Pay */}
                     <div className="bg-gray-100 p-4 rounded-lg mt-4">
                        <div className="flex justify-between font-bold text-lg"><p>Net Pay</p><p>ETB {netPay.toLocaleString()}</p></div>
                     </div>
                </div>
            </motion.div>
        </motion.div>
    );
}