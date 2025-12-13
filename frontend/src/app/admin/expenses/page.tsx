'use client';
import { Button, Modal } from 'react-native';
import { useState, useEffect, useMemo } from 'react';

import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, Trash2, X, CheckCircle2, 
  Zap, Wrench, Shirt, Megaphone, Receipt, Coffee, 
  Fuel, Wifi, Landmark, Utensils, Briefcase, Droplets
} from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext'; // Import Hook

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mesertehotelinformationmanagementsystem.onrender.com';
export default function ExpensesPage() {
  const { t, language } = useLanguage(); // Use Hook

  // --- ETHIOPIAN CONTEXT CONFIGURATION (Moved inside component for translation) ---
  const CATEGORIES = useMemo(() => [
    { id: 'Utilities (Water/Elec/Internet)', label: t('utilities'), icon: <Zap size={18}/>, color: 'text-blue-600 bg-blue-50' },
    { id: 'Generator Fuel & Oil', label: t('fuelOil'), icon: <Fuel size={18}/>, color: 'text-orange-600 bg-orange-50' },
    { id: 'Maintenance & Repair', label: t('maintenanceRepair'), icon: <Wrench size={18}/>, color: 'text-gray-600 bg-gray-50' },
    { id: 'Food & Beverage Cost', label: t('foodBeverageCost'), icon: <Utensils size={18}/>, color: 'text-amber-600 bg-amber-50' },
    { id: 'Staff Costs (Uniform/Transport)', label: t('staffCosts'), icon: <Shirt size={18}/>, color: 'text-purple-600 bg-purple-50' },
    { id: 'Taxes & Government Fees', label: t('taxesFees'), icon: <Landmark size={18}/>, color: 'text-red-600 bg-red-50' },
    { id: 'Guest Amenities (Coffee/Decor)', label: t('guestAmenities'), icon: <Coffee size={18}/>, color: 'text-pink-600 bg-pink-50' },
    { id: 'Marketing & Promo', label: t('marketingPromo'), icon: <Megaphone size={18}/>, color: 'text-green-600 bg-green-50' },
    { id: 'Housekeeping Supplies', label: t('housekeepingSupplies'), icon: <Droplets size={18}/>, color: 'text-cyan-600 bg-cyan-50' },
    { id: 'Miscellaneous', label: t('miscellaneous'), icon: <Receipt size={18}/>, color: 'text-slate-600 bg-slate-50' },
  ], [t]); // Depend on t

  const PAYMENT_METHODS = [
      { id: 'Cash', label: t('cash') },
      { id: 'Telebirr/CBE Birr', label: t('telebirr') },
      { id: 'Bank Transfer', label: t('bankTransfer') },
      { id: 'Check', label: t('check') },
      { id: 'Credit', label: t('credit') },
  ];

  const [expenses, setExpenses] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    title: '', category: 'Utilities (Water/Elec/Internet)', amount: '', payee: '', description: '', paymentMethod: 'Cash', referenceNumber: ''
  });

  useEffect(() => { fetchExpenses(); }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/finance/expenses`, { withCredentials: true });
      setExpenses(res.data);
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/finance/expenses`, formData, { withCredentials: true });
      setIsFormOpen(false);
      fetchExpenses();
      // Reset
      setFormData({ title: '', category: 'Utilities (Water/Elec/Internet)', amount: '', payee: '', description: '', paymentMethod: 'Cash', referenceNumber: '' });
    } catch (err) { alert(t('failedRecordExpense')); }
  };

  const handleDelete = async (id: string) => {
    if(!confirm(t('deleteExpenseConfirm'))) return;
    try {
      await axios.delete(`${API_URL}/api/finance/expenses/${id}`, { withCredentials: true });
      fetchExpenses();
    } catch(err) { alert(t('errorDeletingItem')); }
  };

  // --- ANALYTICS CALCULATIONS ---
  const totalSpent = expenses.reduce((acc, curr: any) => acc + curr.amount, 0);
  
  const categoryStats = useMemo(() => {
    const stats: any = {};
    expenses.forEach((exp: any) => {
      stats[exp.category] = (stats[exp.category] || 0) + exp.amount;
    });
    // Find highest spender
    const topCategoryId = Object.keys(stats).reduce((a, b) => stats[a] > stats[b] ? a : b, 'None');
    // Translate the ID back to label for display
    const topCategoryObj = CATEGORIES.find(c => c.id === topCategoryId);
    const topCategoryLabel = topCategoryObj ? topCategoryObj.label : 'None';

    return { topCategory: topCategoryLabel, topAmount: stats[topCategoryId] || 0 };
  }, [expenses, CATEGORIES]);

  // --- FILTERING ---
  const filteredExpenses = expenses.filter((exp: any) => {
    const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase()) || exp.payee?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || exp.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. TOP HEADER & SUMMARY CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Welcome Block */}
        <div className="lg:col-span-1 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-black mb-2">{t('expenseTracker')}</h1>
            <p className="text-gray-400 text-sm mb-6">{t('manageCosts')}</p>
            <button onClick={() => setIsFormOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition transform hover:scale-105 shadow-lg shadow-amber-500/20">
              <Plus size={20} /> {t('recordNewExpense')}
            </button>
          </div>
          {/* Abstract Background Decoration */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gray-700 rounded-full opacity-30 blur-2xl"></div>
        </div>

        {/* Analytics Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><Landmark size={24}/></div>
            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{t('thisMonth')}</span>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-semibold mt-4">{t('totalSpending')}</p>
            <h3 className="text-3xl font-black text-gray-900">ETB {totalSpent.toLocaleString()}</h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><Fuel size={24}/></div>
            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{t('highestCost')}</span>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-semibold mt-4 truncate">{categoryStats.topCategory}</p>
            <h3 className="text-3xl font-black text-gray-900">ETB {categoryStats.topAmount.toLocaleString()}</h3>
          </div>
        </motion.div>
      </div>

      {/* 2. FILTERS & SEARCH */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder={t('searchByTitle')} 
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          <button 
            onClick={() => setFilterCategory('All')} 
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition ${filterCategory === 'All' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {t('allItems')}
          </button>
          {CATEGORIES.slice(0, 4).map(cat => (
             <button key={cat.id} onClick={() => setFilterCategory(cat.id)} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition ${filterCategory === cat.id ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {cat.label}
             </button>
          ))}
        </div>
      </div>

      {/* 3. EXPENSE LIST (GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredExpenses.map((exp: any, index: number) => {
            const catStyle = CATEGORIES.find(c => c.id === exp.category) || CATEGORIES[9];
            // Find label for payment method
            const paymentMethodLabel = PAYMENT_METHODS.find(pm => pm.id === exp.paymentMethod)?.label || exp.paymentMethod;

            return (
              <motion.div
                key={exp._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-all group relative overflow-hidden"
              >
                {/* Delete Button (Hidden by default, shows on hover) */}
                <button 
                  onClick={() => handleDelete(exp._id)}
                  className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                >
                  <Trash2 size={16} />
                </button>

                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-2xl ${catStyle.color}`}>
                    {catStyle.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 line-clamp-1">{exp.title}</h3>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{new Date(exp.date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm border-b border-gray-50 pb-2">
                    <span className="text-gray-500">{t('payee')}</span>
                    <span className="font-semibold text-gray-800">{exp.payee || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-gray-50 pb-2">
                    <span className="text-gray-500">{t('method')}</span>
                    <span className="font-semibold text-gray-800">{paymentMethodLabel}</span>
                  </div>
                  {exp.referenceNumber && (
                     <div className="flex justify-between text-sm border-b border-gray-50 pb-2">
                       <span className="text-gray-500">{t('refNo')}</span>
                       <span className="font-mono text-gray-600 text-xs bg-gray-100 px-2 py-0.5 rounded">{exp.referenceNumber}</span>
                     </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex justify-between items-center">
                   <span className="text-xs font-bold text-gray-400 uppercase line-clamp-1 max-w-[150px]">{catStyle.label}</span>
                   <span className="text-xl font-black text-gray-900">ETB {exp.amount.toLocaleString()}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {filteredExpenses.length === 0 && !isLoading && (
        <div className="text-center py-20 text-gray-400">
           <Receipt size={48} className="mx-auto mb-4 opacity-20" />
           <p>{t('noExpensesFound')}</p>
        </div>
      )}

      {/* 4. ADD EXPENSE MODAL */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gray-900 p-6 flex justify-between items-center">
                <div>
                   <h2 className="text-2xl font-bold text-white">{t('recordExpense')}</h2>
                   <p className="text-gray-400 text-sm">{t('fillDetails')}</p>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-white transition"><X size={24}/></button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                
                {/* Row 1 */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('expenseTitle')}</label>
                  <input required type="text" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none transition" 
                    placeholder={t('expenseTitlePlaceholder')} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('categoryLabel')}</label>
                      <div className="relative">
                        <select className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none appearance-none cursor-pointer" 
                          value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><Filter size={16}/></div>
                      </div>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('amountETB')}</label>
                      <input required type="number" min="0" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold text-gray-900 focus:ring-2 focus:ring-amber-500 outline-none" 
                        value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                   </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('payeeLabel')}</label>
                      <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none" 
                        placeholder={t('payeePlaceholder')} value={formData.payee} onChange={e => setFormData({...formData, payee: e.target.value})} />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('referenceLabel')}</label>
                      <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none" 
                        placeholder={t('referencePlaceholder')} value={formData.referenceNumber} onChange={e => setFormData({...formData, referenceNumber: e.target.value})} />
                   </div>
                </div>

                {/* Payment Method Bubbles */}
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t('paymentMethod')}</label>
                   <div className="flex flex-wrap gap-2">
                     {PAYMENT_METHODS.map(method => (
                       <button 
                         key={method.id} 
                         type="button"
                         onClick={() => setFormData({...formData, paymentMethod: method.id})}
                         className={`px-4 py-2 rounded-full text-sm font-bold border transition ${
                           formData.paymentMethod === method.id 
                           ? 'bg-gray-900 text-white border-gray-900' 
                           : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                         }`}
                       >
                         {method.label}
                       </button>
                     ))}
                   </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition">{t('cancel')}</button>
                  <button type="submit" className="px-6 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition flex items-center gap-2 shadow-lg shadow-green-200">
                    <CheckCircle2 size={18}/> {t('saveExpense')}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}/*'use client';

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, Trash2, X, CheckCircle2, 
  Zap, Wrench, Shirt, Megaphone, Receipt, Coffee, 
  Fuel, Wifi, Landmark, Utensils, Briefcase, Droplets
} from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext'; // Import Hook

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

export default function ExpensesPage() {
  const { t, language } = useLanguage(); // Use Hook

  // --- ETHIOPIAN CONTEXT CONFIGURATION (Moved inside component for translation) ---
  const CATEGORIES = useMemo(() => [
    { id: 'Utilities (Water/Elec/Internet)', label: t('utilities'), icon: <Zap size={18}/>, color: 'text-blue-600 bg-blue-50' },
    { id: 'Generator Fuel & Oil', label: t('fuelOil'), icon: <Fuel size={18}/>, color: 'text-orange-600 bg-orange-50' },
    { id: 'Maintenance & Repair', label: t('maintenanceRepair'), icon: <Wrench size={18}/>, color: 'text-gray-600 bg-gray-50' },
    { id: 'Food & Beverage Cost', label: t('foodBeverageCost'), icon: <Utensils size={18}/>, color: 'text-amber-600 bg-amber-50' },
    { id: 'Staff Costs (Uniform/Transport)', label: t('staffCosts'), icon: <Shirt size={18}/>, color: 'text-purple-600 bg-purple-50' },
    { id: 'Taxes & Government Fees', label: t('taxesFees'), icon: <Landmark size={18}/>, color: 'text-red-600 bg-red-50' },
    { id: 'Guest Amenities (Coffee/Decor)', label: t('guestAmenities'), icon: <Coffee size={18}/>, color: 'text-pink-600 bg-pink-50' },
    { id: 'Marketing & Promo', label: t('marketingPromo'), icon: <Megaphone size={18}/>, color: 'text-green-600 bg-green-50' },
    { id: 'Housekeeping Supplies', label: t('housekeepingSupplies'), icon: <Droplets size={18}/>, color: 'text-cyan-600 bg-cyan-50' },
    { id: 'Miscellaneous', label: t('miscellaneous'), icon: <Receipt size={18}/>, color: 'text-slate-600 bg-slate-50' },
  ], [t]); // Depend on t

  const PAYMENT_METHODS = [
      { id: 'Cash', label: t('cash') },
      { id: 'Telebirr/CBE Birr', label: t('telebirr') },
      { id: 'Bank Transfer', label: t('bankTransfer') },
      { id: 'Check', label: t('check') },
      { id: 'Credit', label: t('credit') },
  ];

  const [expenses, setExpenses] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    title: '', category: 'Utilities (Water/Elec/Internet)', amount: '', payee: '', description: '', paymentMethod: 'Cash', referenceNumber: ''
  });

  useEffect(() => { fetchExpenses(); }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/finance/expenses`, { withCredentials: true });
      setExpenses(res.data);
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/finance/expenses`, formData, { withCredentials: true });
      setIsFormOpen(false);
      fetchExpenses();
      // Reset
      setFormData({ title: '', category: 'Utilities (Water/Elec/Internet)', amount: '', payee: '', description: '', paymentMethod: 'Cash', referenceNumber: '' });
    } catch (err) { alert(t('failedRecordExpense')); }
  };

  const handleDelete = async (id: string) => {
    if(!confirm(t('deleteExpenseConfirm'))) return;
    try {
      await axios.delete(`${API_URL}/api/finance/expenses/${id}`, { withCredentials: true });
      fetchExpenses();
    } catch(err) { alert(t('errorDeletingItem')); }
  };

  // --- ANALYTICS CALCULATIONS ---
  const totalSpent = expenses.reduce((acc, curr: any) => acc + curr.amount, 0);
  
  const categoryStats = useMemo(() => {
    const stats: any = {};
    expenses.forEach((exp: any) => {
      stats[exp.category] = (stats[exp.category] || 0) + exp.amount;
    });
    // Find highest spender
    const topCategoryId = Object.keys(stats).reduce((a, b) => stats[a] > stats[b] ? a : b, 'None');
    // Translate the ID back to label for display
    const topCategoryObj = CATEGORIES.find(c => c.id === topCategoryId);
    const topCategoryLabel = topCategoryObj ? topCategoryObj.label : 'None';

    return { topCategory: topCategoryLabel, topAmount: stats[topCategoryId] || 0 };
  }, [expenses, CATEGORIES]);

  // --- FILTERING ---
  const filteredExpenses = expenses.filter((exp: any) => {
    const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase()) || exp.payee?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || exp.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-12">
    
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
       
        <div className="lg:col-span-1 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-black mb-2">{t('expenseTracker')}</h1>
            <p className="text-gray-400 text-sm mb-6">{t('manageCosts')}</p>
            <button onClick={() => setIsFormOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition transform hover:scale-105 shadow-lg shadow-amber-500/20">
              <Plus size={20} /> {t('recordNewExpense')}
            </button>
          </div>
         
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gray-700 rounded-full opacity-30 blur-2xl"></div>
        </div>

      
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><Landmark size={24}/></div>
            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{t('thisMonth')}</span>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-semibold mt-4">{t('totalSpending')}</p>
            <h3 className="text-3xl font-black text-gray-900">ETB {totalSpent.toLocaleString()}</h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><Fuel size={24}/></div>
            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{t('highestCost')}</span>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-semibold mt-4 truncate">{categoryStats.topCategory}</p>
            <h3 className="text-3xl font-black text-gray-900">ETB {categoryStats.topAmount.toLocaleString()}</h3>
          </div>
        </motion.div>
      </div>

    
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder={t('searchByTitle')} 
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          <button 
            onClick={() => setFilterCategory('All')} 
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition ${filterCategory === 'All' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {t('allItems')}
          </button>
          {CATEGORIES.slice(0, 4).map(cat => (
             <button key={cat.id} onClick={() => setFilterCategory(cat.id)} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition ${filterCategory === cat.id ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {cat.label}
             </button>
          ))}
        </div>
      </div>

    
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredExpenses.map((exp: any, index: number) => {
            const catStyle = CATEGORIES.find(c => c.id === exp.category) || CATEGORIES[9];
            // Find label for payment method
            const paymentMethodLabel = PAYMENT_METHODS.find(pm => pm.id === exp.paymentMethod)?.label || exp.paymentMethod;

            return (
              <motion.div
                key={exp._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-all group relative overflow-hidden"
              >
                
                <button 
                  onClick={() => handleDelete(exp._id)}
                  className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                >
                  <Trash2 size={16} />
                </button>

                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-2xl ${catStyle.color}`}>
                    {catStyle.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 line-clamp-1">{exp.title}</h3>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{new Date(exp.date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm border-b border-gray-50 pb-2">
                    <span className="text-gray-500">{t('payee')}</span>
                    <span className="font-semibold text-gray-800">{exp.payee || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-gray-50 pb-2">
                    <span className="text-gray-500">{t('method')}</span>
                    <span className="font-semibold text-gray-800">{paymentMethodLabel}</span>
                  </div>
                  {exp.referenceNumber && (
                     <div className="flex justify-between text-sm border-b border-gray-50 pb-2">
                       <span className="text-gray-500">{t('refNo')}</span>
                       <span className="font-mono text-gray-600 text-xs bg-gray-100 px-2 py-0.5 rounded">{exp.referenceNumber}</span>
                     </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex justify-between items-center">
                   <span className="text-xs font-bold text-gray-400 uppercase line-clamp-1 max-w-[150px]">{catStyle.label}</span>
                   <span className="text-xl font-black text-gray-900">ETB {exp.amount.toLocaleString()}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {filteredExpenses.length === 0 && !isLoading && (
        <div className="text-center py-20 text-gray-400">
           <Receipt size={48} className="mx-auto mb-4 opacity-20" />
           <p>{t('noExpensesFound')}</p>
        </div>
      )}

   
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
             
              <div className="bg-gray-900 p-6 flex justify-between items-center">
                <div>
                   <h2 className="text-2xl font-bold text-white">{t('recordExpense')}</h2>
                   <p className="text-gray-400 text-sm">{t('fillDetails')}</p>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-white transition"><X size={24}/></button>
              </div>

             
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                
               
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('expenseTitle')}</label>
                  <input required type="text" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none transition" 
                    placeholder={t('expenseTitlePlaceholder')} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>

              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('categoryLabel')}</label>
                      <div className="relative">
                        <select className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none appearance-none cursor-pointer" 
                          value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><Filter size={16}/></div>
                      </div>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('amountETB')}</label>
                      <input required type="number" min="0" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold text-gray-900 focus:ring-2 focus:ring-amber-500 outline-none" 
                        value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                   </div>
                </div>

                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('payeeLabel')}</label>
                      <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none" 
                        placeholder={t('payeePlaceholder')} value={formData.payee} onChange={e => setFormData({...formData, payee: e.target.value})} />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('referenceLabel')}</label>
                      <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none" 
                        placeholder={t('referencePlaceholder')} value={formData.referenceNumber} onChange={e => setFormData({...formData, referenceNumber: e.target.value})} />
                   </div>
                </div>

             
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{t('paymentMethod')}</label>
                   <div className="flex flex-wrap gap-2">
                     {PAYMENT_METHODS.map(method => (
                       <button 
                         key={method.id} 
                         type="button"
                         onClick={() => setFormData({...formData, paymentMethod: method.id})}
                         className={`px-4 py-2 rounded-full text-sm font-bold border transition ${
                           formData.paymentMethod === method.id 
                           ? 'bg-gray-900 text-white border-gray-900' 
                           : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                         }`}
                       >
                         {method.label}
                       </button>
                     ))}
                   </div>
                </div>

                
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition">{t('cancel')}</button>
                  <button type="submit" className="px-6 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition flex items-center gap-2 shadow-lg shadow-green-200">
                    <CheckCircle2 size={18}/> {t('saveExpense')}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}*/