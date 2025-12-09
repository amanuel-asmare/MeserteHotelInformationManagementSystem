'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Printer, Edit, Save, XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useLanguage } from '../../../../../context/LanguageContext';

export default function PayslipModal({
  payslip,
  onClose,
  onUpdate,
}: {
  payslip: any;
  onClose: () => void;
  onUpdate?: (id: string, updates: any) => Promise<boolean>;
}) {
  const { t, language } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      bonus: payslip.bonus || 0,
      deductions: payslip.deductions || 0,
    },
  });

  const bonus = parseFloat(watch('bonus')) || 0;
  const deductions = parseFloat(watch('deductions')) || 0;

  // Ethiopian Tax Calculation (unchanged)
  const calculateEthiopianTax = (gross: number) => {
    let tax = 0;
    const pension = gross * 0.07;
    if (gross <= 600) tax = 0;
    else if (gross <= 1650) tax = gross * 0.10 - 60;
    else if (gross <= 3200) tax = gross * 0.15 - 142.50;
    else if (gross <= 5250) tax = gross * 0.20 - 302.50;
    else if (gross <= 7800) tax = gross * 0.25 - 565;
    else if (gross <= 10900) tax = gross * 0.30 - 955;
    else tax = gross * 0.35 - 1500;
    return { tax: Math.round(tax), pension: Math.round(pension) };
  };

  const grossPay = payslip.baseSalary + bonus;
  const { tax: recalculatedTax, pension } = calculateEthiopianTax(grossPay);
  const totalDeductions = recalculatedTax + pension + deductions;
  const netPay = grossPay - totalDeductions;

  const handleSave = async (data: any) => {
    if (!onUpdate || !payslip?._id) {
      toast.error(t('cannotSave') || 'Cannot save: no update handler available');
      return;
    }
    const updates = {
      bonus: parseFloat(data.bonus) || 0,
      deductions: parseFloat(data.deductions) || 0,
    };
    const success = await onUpdate(payslip._id, updates);
    if (success) {
      toast.success(t('payslipUpdated') || 'Payslip updated successfully!');
      setIsEditing(false);
      reset(data);
    }
  };

  const showEditButton = onUpdate && payslip._id;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-[95%] sm:w-full max-w-md border border-gray-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-none bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 sm:p-5 flex justify-between items-center shadow-md rounded-t-3xl">
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-wide">{t('payslipDetails')}</h2>
            <p className="text-amber-100 text-xs sm:text-sm font-medium">
              {payslip.user.firstName} {payslip.user.lastName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto">
          {/* Period */}
          <div className="text-center border-b border-gray-100 pb-4">
            <p className="text-base sm:text-lg font-bold text-gray-800 uppercase tracking-wider">
              {new Date(payslip.year, payslip.month - 1).toLocaleString(
                language === 'am' ? 'am-ET' : 'en-US',
                { month: 'long', year: 'numeric' }
              )}
            </p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase ${
              payslip.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {payslip.status === 'paid' ? t('paid') : t('pending')}
            </span>
          </div>

          {/* Earnings */}
          <div>
            <h3 className="font-bold text-green-600 mb-3 text-xs sm:text-sm uppercase tracking-wider">
              {t('earnings')}
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-700">
                <span>{t('baseSalary')}</span>
                <span className="font-mono font-medium">
                  ETB {payslip.baseSalary.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-700">
                <span>{t('bonus')}</span>
                {isEditing ? (
                  <input
                    {...register('bonus')}
                    type="number"
                    className="w-24 sm:w-32 px-2 sm:px-3 py-1 border border-amber-300 rounded-lg text-right focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                  />
                ) : (
                  <span className="font-mono font-medium">
                    ETB {bonus.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="flex justify-between font-bold text-gray-900 border-t border-dashed border-gray-300 pt-2 mt-2">
                <span>{t('grossPay')}</span>
                <span>ETB {grossPay.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <h3 className="font-bold text-red-600 mb-3 text-xs sm:text-sm uppercase tracking-wider">
              {t('deductionsSection')}
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-700">
                <span>{t('incomeTax')}</span>
                <span className={`font-mono font-medium ${isEditing && recalculatedTax !== payslip.tax ? 'text-blue-600' : ''}`}>
                  ETB {recalculatedTax.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>{t('pension')} (7%)</span>
                <span className="font-mono font-medium">
                  ETB {pension.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-700">
                <span>{t('deductions')}</span>
                {isEditing ? (
                  <input
                    {...register('deductions')}
                    type="number"
                    className="w-24 sm:w-32 px-2 sm:px-3 py-1 border border-amber-300 rounded-lg text-right focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                  />
                ) : (
                  <span className="font-mono font-medium">
                    ETB {deductions.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="flex justify-between font-bold text-gray-900 border-t border-dashed border-gray-300 pt-2 mt-2">
                <span>{t('totalDeductions')}</span>
                <span>ETB {totalDeductions.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Net Pay */}
          <div className="bg-amber-50 p-4 sm:p-5 rounded-2xl text-center border border-amber-100">
            <p className="text-xs text-amber-600 uppercase font-bold tracking-widest mb-1">
              {t('netPay')}
            </p>
            <p className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              ETB {netPay.toLocaleString()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    reset();
                  }}
                  className="w-full sm:flex-1 py-3 border border-gray-300 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <XCircle size={18} /> {t('cancel')}
                </button>
                <button
                  onClick={handleSubmit(handleSave)}
                  className="w-full sm:flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition flex items-center justify-center gap-2"
                >
                  <Save size={18} /> {t('saveChanges')}
                </button>
              </>
            ) : (
              <>
                {showEditButton && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full sm:flex-1 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 shadow-lg shadow-amber-200 transition flex items-center justify-center gap-2"
                  >
                    <Edit size={18} /> {t('editPayslip')}
                  </button>
                )}
                <button
                  onClick={() => window.print()}
                  className={`w-full sm:flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:border-gray-300 hover:bg-gray-50 transition flex items-center justify-center gap-2 ${!showEditButton ? 'w-full' : ''}`}
                >
                  <Printer size={18} /> {t('printPayslip')}
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
/*// src/app/cashier/payroll/components/PayslipModal.tsx
'use client';

import { motion } from 'framer-motion';
import { X, Printer, Edit, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function PayslipModal({
  payslip,
  onClose,
  onUpdate, // ← now optional
}: {
  payslip: any;
  onClose: () => void;
  onUpdate?: (id: string, updates: any) => Promise<boolean>; // made optional + returns boolean
}) {
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      bonus: payslip.bonus || 0,
      deductions: payslip.deductions || 0,
    },
  });

  const bonus = parseFloat(watch('bonus')) || 0;
  const deductions = parseFloat(watch('deductions')) || 0;

  const grossPay = payslip.baseSalary + bonus;
  const totalDeductions = payslip.tax + payslip.pension + deductions;
  const netPay = grossPay - totalDeductions;

  const handleSave = async (data: any) => {
    // If no onUpdate was provided → we cannot save (admin view-only case)
    if (!onUpdate || !payslip?._id) {
      toast.error('Cannot save: no update handler available');
      return;
    }

    const updates = {
      bonus: parseFloat(data.bonus) || 0,
      deductions: parseFloat(data.deductions) || 0,
    };

    const success = await onUpdate(payslip._id, updates);

    if (success) {
      toast.success('Payslip updated successfully!');
      setIsEditing(false);
      reset(data); // keep the new values in the form
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header /}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            Payslip - {payslip.user.firstName} {payslip.user.lastName}
          </h2>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-1">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Period /}
          <div className="text-center border-b pb-3">
            <p className="text-lg font-semibold">
              {new Date(payslip.year, payslip.month - 1).toLocaleString('default', {
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* Earnings /}
          <div>
            <h3 className="font-bold text-green-600 mb-2">Earnings</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Base Salary</span>
                <span>ETB {payslip.baseSalary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Bonus</span>
                {isEditing ? (
                  <input
                    {...register('bonus')}
                    type="number"
                    className="w-28 px-2 py-1 border rounded text-right"
                  />
                ) : (
                  <span>ETB {bonus.toLocaleString()}</span>
                )}
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Gross Pay</span>
                <span>ETB {grossPay.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Deductions /}
          <div>
            <h3 className="font-bold text-red-600 mb-2">Deductions</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Income Tax</span>
                <span>ETB {payslip.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Pension (7%)</span>
                <span>ETB {payslip.pension.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Other Deductions</span>
                {isEditing ? (
                  <input
                    {...register('deductions')}
                    type="number"
                    className="w-28 px-2 py-1 border rounded text-right"
                  />
                ) : (
                  <span>ETB {deductions.toLocaleString()}</span>
                )}
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total Deductions</span>
                <span>ETB {totalDeductions.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Net Pay /}
          <div className="bg-amber-50 p-4 rounded-xl text-center">
            <p className="text-sm text-amber-700">Net Pay</p>
            <p className="text-3xl font-black text-amber-900">
              ETB {netPay.toLocaleString()}
            </p>
          </div>

          {/* Buttons /}
          <div className="flex justify-end gap-3 pt-4 border-t">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    reset();
                  }}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit(handleSave)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
                >
                  <Save size={18} /> Save Changes
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 border rounded-lg flex items-center gap-2"
                >
                  <Printer size={18} /> Print
                </button>
                {payslip._id && onUpdate && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 bg-amber-600 text-white rounded-lg flex items-center gap-2"
                  >
                    <Edit size={18} /> Edit
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}*/