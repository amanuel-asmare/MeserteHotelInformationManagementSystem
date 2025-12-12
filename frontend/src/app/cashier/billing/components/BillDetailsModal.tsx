'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { X, Plus, Hotel, Utensils, DollarSign, CreditCard, Receipt, Tag, ShoppingBag } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useLanguage } from '../../../../../context/LanguageContext';

export default function BillDetailsModal({ billId, onClose, onCheckoutSuccess }: any) {
  const [bill, setBill] = useState<any>(null);
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingCharge, setIsAddingCharge] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const { t } = useLanguage();

  useEffect(() => {
    const fetchDetails = async () => {
      if (!billId) return;
      setLoading(true);
      try {
        const { data } = await api.get(`/api/billing/${billId}`);
        setBill(data.invoice);
        setFoodItems(data.foodLineItems || []);
      } catch (error) {
        console.error("Failed to fetch bill details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [billId]);

  const handleAddCharge = async (data: any) => {
    try {
      const res = await api.post(`/api/billing/${billId}/items`, {
        description: data.description,
        quantity: parseInt(data.quantity, 10),
        unitPrice: parseFloat(data.price)
      });
      setBill(res.data);
      reset();
      setIsAddingCharge(false);
    } catch (error) {
      alert(t('failedToAddCharge'));
    }
  };

  const handleCheckout = async (paymentMethod: string) => {
    try {
      await api.post(`/api/billing/checkout/${billId}`, { paymentMethod });
      alert(t('checkoutSuccessful'));
      onCheckoutSuccess();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || t('checkoutFailed'));
    }
  };

  if (loading)
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );

  if (!bill) return null;

  const combinedLineItems = [...(bill.lineItems || []), ...foodItems];
  const subtotal = combinedLineItems.reduce((acc, item) => acc + (item.total || 0), 0);
  const tax = subtotal * 0.15;
  const total = subtotal + tax;
  const guestName = bill.booking?.user
    ? `${bill.booking.user.firstName} ${bill.booking.user.lastName}`
    : t('guest');
  const roomNumber = bill.room?.roomNumber || 'N/A';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="p-6 border-b border-gray-100 flex justify-between items-start bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100">
              <Receipt className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{guestName}</h2>
              <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                {t('room')} {roomNumber} • <span className="text-indigo-600">{t('invoiceNo')}{bill._id.slice(-6).toUpperCase()}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200/80 transition text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </header>

        {/* Scrollable Content */}
        <main className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
          <div className="space-y-3 mb-6">
            {combinedLineItems.length === 0 ? (
              <div className="text-center py-10 text-gray-400">{t('noItemsBilled')}</div>
            ) : (
              combinedLineItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2.5 rounded-lg ${item.isFood ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                      {item.isFood ? <Utensils size={18} /> : <Hotel size={18} />}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{item.description}</p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        {item.quantity} x ETB {item.unitPrice?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900">ETB {item.total?.toFixed(2)}</p>
                </motion.div>
              ))
            )}
          </div>

          {/* Add Charge Form */}
          <AnimatePresence>
            {isAddingCharge && (
              <motion.form
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="mt-6 p-5 border-2 border-dashed border-indigo-200 rounded-2xl bg-white shadow-inner overflow-hidden"
                onSubmit={handleSubmit(handleAddCharge)}
              >
                <div className="flex items-center gap-2 mb-4 text-indigo-700 font-bold text-sm uppercase tracking-wider">
                  <Tag size={16} /> {t('addNewCharge')}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block">
                      {t('itemDescription')}
                    </label>
                    <div className="relative">
                      <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        {...register("description")}
                        // FIX: Cast 'itemDescriptionPlaceholder' to any to bypass strict type check
                        placeholder={t('itemDescriptionPlaceholder' as any)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1/3">
                      <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block">
                        {t('quantity')}
                      </label>
                      <input
                        {...register("quantity")}
                        type="number"
                        placeholder="1"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-center font-bold text-gray-700"
                        required
                      />
                    </div>
                    <div className="w-2/3">
                      <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block">
                        {t('unitPrice')} (ETB)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">ETB</span>
                        <input
                          {...register("price")}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-gray-700"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-5 mt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsAddingCharge(false)}
                    className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition transform hover:-translate-y-0.5"
                  >
                    {t('addItem')}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="p-6 bg-white border-t border-gray-100 rounded-b-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm text-gray-500">
              <span>{t('subtotal')}</span>
              <span className="font-medium">ETB {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              {/* FIX: Cast 'tax' to any */}
              <span>{t('tax' as any)} (15%)</span>
              <span className="font-medium">ETB {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-2xl font-black text-gray-900 pt-3 border-t border-dashed border-gray-200 mt-2">
              <span>{t('totalDue')}</span>
              <span className="text-indigo-600">ETB {total.toFixed(2)}</span>
            </div>
          </div>

          {isCheckingOut ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-center"
            >
              <p className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">
                {t('confirmPaymentMethod')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleCheckout('cash')}
                  className="flex-1 py-3.5 px-4 bg-green-600 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 transition font-bold shadow-lg hover:shadow-green-200 transform hover:-translate-y-0.5"
                >
                  <DollarSign size={20} /> {t('cash')}
                </button>
                <button
                  onClick={() => handleCheckout('card')}
                  className="flex-1 py-3.5 px-4 bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition font-bold shadow-lg hover:shadow-blue-200 transform hover:-translate-y-0.5"
                >
                  <CreditCard size={20} /> {t('cardChapa')}
                </button>
              </div>
              <button
                onClick={() => setIsCheckingOut(false)}
                className="mt-3 text-xs font-medium text-gray-500 hover:underline"
              >
                {t('cancelCheckout')}
              </button>
            </motion.div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setIsAddingCharge(true)}
                className="flex-1 py-4 px-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition group"
              >
                <div className="bg-gray-100 p-1 rounded-md group-hover:bg-white transition">
                  <Plus size={16} />
                </div>
                {t('addCharge')}
              </button>
              <button
                onClick={() => setIsCheckingOut(true)}
                className="flex-[2] py-4 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                {t('proceedToCheckout')} <CreditCard size={18} className="opacity-80" />
              </button>
            </div>
          )}
        </footer>
      </motion.div>
    </motion.div>
  );
}/*'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { X, Plus, Hotel, Utensils, DollarSign, CreditCard, Receipt, Tag, ShoppingBag } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useLanguage } from '../../../../../context/LanguageContext';

export default function BillDetailsModal({ billId, onClose, onCheckoutSuccess }: any) {
  const [bill, setBill] = useState<any>(null);
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingCharge, setIsAddingCharge] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const { t } = useLanguage();

  useEffect(() => {
    const fetchDetails = async () => {
      if (!billId) return;
      setLoading(true);
      try {
        const { data } = await api.get(`/api/billing/${billId}`);
        setBill(data.invoice);
        setFoodItems(data.foodLineItems || []);
      } catch (error) {
        console.error("Failed to fetch bill details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [billId]);

  const handleAddCharge = async (data: any) => {
    try {
      const res = await api.post(`/api/billing/${billId}/items`, {
        description: data.description,
        quantity: parseInt(data.quantity, 10),
        unitPrice: parseFloat(data.price)
      });
      setBill(res.data);
      reset();
      setIsAddingCharge(false);
    } catch (error) {
      alert(t('failedToAddCharge'));
    }
  };

  const handleCheckout = async (paymentMethod: string) => {
    try {
      await api.post(`/api/billing/checkout/${billId}`, { paymentMethod });
      alert(t('checkoutSuccessful'));
      onCheckoutSuccess();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || t('checkoutFailed'));
    }
  };

  if (loading)
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );

  if (!bill) return null;

  const combinedLineItems = [...(bill.lineItems || []), ...foodItems];
  const subtotal = combinedLineItems.reduce((acc, item) => acc + (item.total || 0), 0);
  const tax = subtotal * 0.15;
  const total = subtotal + tax;
  const guestName = bill.booking?.user
    ? `${bill.booking.user.firstName} ${bill.booking.user.lastName}`
    : t('guest');
  const roomNumber = bill.room?.roomNumber || 'N/A';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        
        <header className="p-6 border-b border-gray-100 flex justify-between items-start bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100">
              <Receipt className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{guestName}</h2>
              <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                {t('room')} {roomNumber} • <span className="text-indigo-600">{t('invoiceNo')}{bill._id.slice(-6).toUpperCase()}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200/80 transition text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </header>

       
        <main className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
          <div className="space-y-3 mb-6">
            {combinedLineItems.length === 0 ? (
              <div className="text-center py-10 text-gray-400">{t('noItemsBilled')}</div>
            ) : (
              combinedLineItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2.5 rounded-lg ${item.isFood ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                      {item.isFood ? <Utensils size={18} /> : <Hotel size={18} />}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{item.description}</p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        {item.quantity} x ETB {item.unitPrice?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900">ETB {item.total?.toFixed(2)}</p>
                </motion.div>
              ))
            )}
          </div>

        
          <AnimatePresence>
            {isAddingCharge && (
              <motion.form
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="mt-6 p-5 border-2 border-dashed border-indigo-200 rounded-2xl bg-white shadow-inner overflow-hidden"
                onSubmit={handleSubmit(handleAddCharge)}
              >
                <div className="flex items-center gap-2 mb-4 text-indigo-700 font-bold text-sm uppercase tracking-wider">
                  <Tag size={16} /> {t('addNewCharge')}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block">
                      {t('itemDescription')}
                    </label>
                    <div className="relative">
                      <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        {...register("description")}
                        placeholder={t('itemDescriptionPlaceholder')}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1/3">
                      <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block">
                        {t('quantity')}
                      </label>
                      <input
                        {...register("quantity")}
                        type="number"
                        placeholder="1"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-center font-bold text-gray-700"
                        required
                      />
                    </div>
                    <div className="w-2/3">
                      <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block">
                        {t('unitPrice')} (ETB)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">ETB</span>
                        <input
                          {...register("price")}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-gray-700"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-5 mt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsAddingCharge(false)}
                    className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition transform hover:-translate-y-0.5"
                  >
                    {t('addItem')}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </main>

       
        <footer className="p-6 bg-white border-t border-gray-100 rounded-b-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm text-gray-500">
              <span>{t('subtotal')}</span>
              <span className="font-medium">ETB {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{t('tax')} (15%)</span>
              <span className="font-medium">ETB {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-2xl font-black text-gray-900 pt-3 border-t border-dashed border-gray-200 mt-2">
              <span>{t('totalDue')}</span>
              <span className="text-indigo-600">ETB {total.toFixed(2)}</span>
            </div>
          </div>

          {isCheckingOut ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-center"
            >
              <p className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">
                {t('confirmPaymentMethod')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleCheckout('cash')}
                  className="flex-1 py-3.5 px-4 bg-green-600 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 transition font-bold shadow-lg hover:shadow-green-200 transform hover:-translate-y-0.5"
                >
                  <DollarSign size={20} /> {t('cash')}
                </button>
                <button
                  onClick={() => handleCheckout('card')}
                  className="flex-1 py-3.5 px-4 bg-blue-600 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition font-bold shadow-lg hover:shadow-blue-200 transform hover:-translate-y-0.5"
                >
                  <CreditCard size={20} /> {t('cardChapa')}
                </button>
              </div>
              <button
                onClick={() => setIsCheckingOut(false)}
                className="mt-3 text-xs font-medium text-gray-500 hover:underline"
              >
                {t('cancelCheckout')}
              </button>
            </motion.div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setIsAddingCharge(true)}
                className="flex-1 py-4 px-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition group"
              >
                <div className="bg-gray-100 p-1 rounded-md group-hover:bg-white transition">
                  <Plus size={16} />
                </div>
                {t('addCharge')}
              </button>
              <button
                onClick={() => setIsCheckingOut(true)}
                className="flex-[2] py-4 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                {t('proceedToCheckout')} <CreditCard size={18} className="opacity-80" />
              </button>
            </div>
          )}
        </footer>
      </motion.div>
    </motion.div>
  );
}*/