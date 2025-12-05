'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, Trash2, X, CheckCircle2, 
  ShoppingBag, Truck, FileText, ChevronRight, 
  Package, DollarSign, Calendar, Eye 
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

// Format Currency Helper
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(amount);
};

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null); // For Detail View
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    supplier: '',
    referenceNo: '',
    hasVat: true,
    items: [{ name: '', category: 'Food & Beverage', quantity: 1, unitPrice: 0 }]
  });

  const categories = ['Food & Beverage', 'Housekeeping', 'Furniture', 'Electronics', 'Linens', 'Maintenance Material'];

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/finance/purchases`, { withCredentials: true });
      setPurchases(res.data);
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  // --- FORM HANDLERS ---
  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems: any = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', category: 'Food & Beverage', quantity: 1, unitPrice: 0 }]
    });
  };

  const removeItemRow = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/finance/purchases`, formData, { withCredentials: true });
      setIsFormOpen(false);
      fetchPurchases();
      // Reset form
      setFormData({ supplier: '', referenceNo: '', hasVat: true, items: [{ name: '', category: 'Food & Beverage', quantity: 1, unitPrice: 0 }] });
    } catch (err) { alert('Failed to save purchase'); }
  };

  const handleDelete = async (id: string, e: any) => {
    e.stopPropagation(); // Prevent opening detail modal
    if(!confirm('Delete this purchase record?')) return;
    try {
      await axios.delete(`${API_URL}/api/finance/purchases/${id}`, { withCredentials: true });
      fetchPurchases();
    } catch(err) { alert('Failed to delete'); }
  };

  // --- CALCULATIONS ---
  const formSubTotal = formData.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const formTax = formData.hasVat ? formSubTotal * 0.15 : 0;
  const formTotal = formSubTotal + formTax;

  // --- FILTERING ---
  const filteredPurchases = purchases.filter((p: any) => 
    p.supplier.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.referenceNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. HEADER SECTION */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Purchase Inventory</h1>
          <p className="text-gray-500">Track stock acquisitions, assets, and supplier invoices.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search supplier..." 
              className="pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-amber-500 outline-none w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-amber-200"
          >
            <Plus size={20} /> New Purchase
          </button>
        </div>
      </div>

      {/* 2. PURCHASES LIST (Interactive Cards) */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-20"><div className="animate-spin w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full mx-auto"></div></div>
        ) : filteredPurchases.length === 0 ? (
          <div className="text-center py-20 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
            <ShoppingBag size={48} className="mx-auto mb-4 opacity-20"/>
            <p>No purchase records found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Supplier Info</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Items Summary</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence>
                  {filteredPurchases.map((p: any) => (
                    <motion.tr 
                      key={p._id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => setSelectedPurchase(p)}
                      className="hover:bg-amber-50/30 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                          <Calendar size={16} className="text-gray-400" />
                          {new Date(p.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg">
                            {p.supplier.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{p.supplier}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <FileText size={12}/> {p.referenceNo || 'No Ref'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex -space-x-2 overflow-hidden mb-1">
                          {p.items.slice(0,3).map((item:any, i:number) => (
                             <div key={i} className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 ring-2 ring-white text-[10px] font-bold text-gray-600" title={item.name}>
                                {item.name.charAt(0)}
                             </div>
                          ))}
                          {p.items.length > 3 && (
                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 ring-2 ring-white text-[10px] font-bold text-gray-500">
                              +{p.items.length - 3}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{p.items.length} Items Purchased</span>
                      </td>
                      <td className="px-6 py-5">
                         <span className="block text-sm font-black text-gray-900">{formatCurrency(p.grandTotal)}</span>
                         <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Paid via {p.paymentMethod}</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-full transition">
                              <Eye size={18} />
                           </button>
                           <button 
                             onClick={(e) => handleDelete(p._id, e)}
                             className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition opacity-0 group-hover:opacity-100"
                           >
                              <Trash2 size={18} />
                           </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. NEW PURCHASE MODAL (FORM) - SCROLL ENABLED */}
      <AnimatePresence>
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} 
          className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Fixed Header */}
          <div className="bg-gray-900 p-6 flex justify-between items-center text-white shrink-0">
            <div>
               <h2 className="text-2xl font-bold">New Purchase</h2>
               <p className="text-gray-400 text-sm">Record incoming stock or assets</p>
            </div>
            <button onClick={() => setIsFormOpen(false)}><X size={24} className="text-gray-400 hover:text-white"/></button>
          </div>
          
          {/* Scrollable Body */}
          <div className="overflow-y-auto p-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Supplier Name</label>
                <input required type="text" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none" 
                  value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} placeholder="e.g. Fresh Foods Ltd" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Invoice / Ref #</label>
                <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none" 
                  value={formData.referenceNo} onChange={e => setFormData({...formData, referenceNo: e.target.value})} placeholder="INV-001" />
              </div>
              <div className="flex items-end pb-3">
                 <label className="flex items-center gap-3 cursor-pointer p-3 bg-amber-50 rounded-xl w-full border border-amber-100 hover:bg-amber-100 transition">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.hasVat ? 'bg-amber-600 border-amber-600' : 'bg-white border-gray-300'}`}>
                      {formData.hasVat && <CheckCircle2 size={14} className="text-white"/>}
                    </div>
                    <input type="checkbox" checked={formData.hasVat} onChange={e => setFormData({...formData, hasVat: e.target.checked})} className="hidden" />
                    <span className="font-bold text-gray-800 text-sm">Includes VAT (15%)</span>
                 </label>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 mb-6">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><ShoppingBag size={18}/> Items List</h3>
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-3 items-end bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="md:col-span-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Item Name</label>
                    <input required type="text" placeholder="Item Name" className="w-full p-2 bg-transparent border-b border-gray-200 focus:border-amber-500 outline-none font-medium" 
                      value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)} />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Category</label>
                    <select className="w-full p-2 bg-transparent border-b border-gray-200 focus:border-amber-500 outline-none text-sm" value={item.category} onChange={e => handleItemChange(index, 'category', e.target.value)}>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Qty</label>
                    <input required type="number" min="1" className="w-full p-2 bg-transparent border-b border-gray-200 focus:border-amber-500 outline-none font-bold" 
                      value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Unit Price</label>
                    <input required type="number" min="0" className="w-full p-2 bg-transparent border-b border-gray-200 focus:border-amber-500 outline-none font-bold" 
                      value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', Number(e.target.value))} />
                  </div>
                  <div className="md:col-span-1 text-right">
                    <button type="button" onClick={() => removeItemRow(index)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addItemRow} className="mt-4 w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-amber-500 hover:text-amber-600 font-bold transition flex items-center justify-center gap-2">
                <Plus size={18}/> Add Another Item
              </button>
            </div>

            <div className="flex justify-end items-center gap-8 border-t border-gray-100 pt-6">
              <div className="text-right space-y-1">
                <p className="text-sm text-gray-500">Subtotal: <span className="font-bold text-gray-800">{formatCurrency(formSubTotal)}</span></p>
                <p className="text-sm text-gray-500">VAT (15%): <span className="font-bold text-gray-800">{formatCurrency(formTax)}</span></p>
                <p className="text-2xl font-black text-gray-900 mt-2">{formatCurrency(formTotal)}</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200">Cancel</button>
                <button type="submit" className="px-6 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 flex items-center gap-2 shadow-lg shadow-green-200"><CheckCircle2 size={18}/> Save Purchase</button>
              </div>
            </div>
          </form>
          </div>
        </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* 4. DETAIL VIEW MODAL (SCROLLABLE INVOICE) */}
      <AnimatePresence>
        {selectedPurchase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
            >
              {/* Receipt Header (Fixed) */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white relative overflow-hidden shrink-0">
                <button onClick={() => setSelectedPurchase(null)} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition"><X size={20}/></button>
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-black mb-1">INVOICE</h2>
                    <p className="text-gray-400 font-mono text-sm tracking-wider">#{selectedPurchase.referenceNo || 'NO-REF'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs uppercase font-bold">Total Amount</p>
                    <p className="text-3xl font-bold text-amber-400">{formatCurrency(selectedPurchase.grandTotal)}</p>
                  </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              </div>

              {/* Receipt Body (Scrollable) */}
              <div className="p-8 overflow-y-auto">
                {/* Meta Info */}
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
                   <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">Supplier</p>
                      <h3 className="text-xl font-bold text-gray-900">{selectedPurchase.supplier}</h3>
                   </div>
                   <div className="text-right">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">Date</p>
                      <p className="text-lg font-bold text-gray-800">{new Date(selectedPurchase.date).toLocaleDateString()}</p>
                   </div>
                </div>

                {/* Items Table */}
                <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-200">
                        <th className="pb-3 text-left font-bold uppercase text-[10px]">Item</th>
                        <th className="pb-3 text-center font-bold uppercase text-[10px]">Qty</th>
                        <th className="pb-3 text-right font-bold uppercase text-[10px]">Price</th>
                        <th className="pb-3 text-right font-bold uppercase text-[10px]">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedPurchase.items.map((item: any, i: number) => (
                        <tr key={i}>
                          <td className="py-3 font-medium text-gray-800">
                            {item.name}
                            <span className="block text-[10px] text-gray-400 font-normal">{item.category}</span>
                          </td>
                          <td className="py-3 text-center text-gray-600">{item.quantity}</td>
                          <td className="py-3 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                          <td className="py-3 text-right font-bold text-gray-900">{formatCurrency(item.quantity * item.unitPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer Totals */}
                <div className="flex justify-end">
                  <div className="w-1/2 space-y-2">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal</span>
                      <span>{formatCurrency(selectedPurchase.subTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>VAT (15%)</span>
                      <span>{formatCurrency(selectedPurchase.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-black text-gray-900 pt-3 border-t border-gray-100">
                      <span>Grand Total</span>
                      <span>{formatCurrency(selectedPurchase.grandTotal)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                   <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold uppercase">
                      <CheckCircle2 size={14} /> Status: Received
                   </div>
                   <button onClick={() => setSelectedPurchase(null)} className="text-gray-500 hover:text-gray-900 text-sm font-bold underline">Close Receipt</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}/*'use client';
import { View } from 'react-native';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, ShoppingBag, Truck, FileText } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    supplier: '',
    referenceNo: '',
    hasVat: true,
    items: [{ name: '', category: 'Food & Beverage', quantity: 1, unitPrice: 0 }]
  });

  const categories = ['Food & Beverage', 'Housekeeping', 'Furniture', 'Electronics', 'Linens', 'Maintenance Material'];

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/finance/purchases`, { withCredentials: true });
      setPurchases(res.data);
    } catch (err) { console.error(err); }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems: any = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', category: 'Food & Beverage', quantity: 1, unitPrice: 0 }]
    });
  };

  const removeItemRow = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/finance/purchases`, formData, { withCredentials: true });
      setIsFormOpen(false);
      fetchPurchases();
      // Reset form
      setFormData({ supplier: '', referenceNo: '', hasVat: true, items: [{ name: '', category: 'Food & Beverage', quantity: 1, unitPrice: 0 }] });
    } catch (err) { alert('Failed to save purchase'); }
  };

  // Calculations
  const subTotal = formData.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const tax = formData.hasVat ? subTotal * 0.15 : 0;
  const total = subTotal + tax;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Purchase Management</h1>
          <p className="text-gray-500">Track inventory and asset purchases</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-3 rounded-xl font-bold transition shadow-lg shadow-amber-200"
        >
          <Plus size={20} /> New Purchase
        </button>
      </div>

      {isFormOpen && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-3xl shadow-xl border border-amber-100">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Supplier Name</label>
                <input required type="text" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none" 
                  value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} placeholder="e.g. Fresh Foods Ltd" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Reference / Invoice #</label>
                <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none" 
                  value={formData.referenceNo} onChange={e => setFormData({...formData, referenceNo: e.target.value})} placeholder="INV-001" />
              </div>
              <div className="flex items-center pt-8">
                 <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.hasVat} onChange={e => setFormData({...formData, hasVat: e.target.checked})} className="w-6 h-6 text-amber-600 rounded focus:ring-amber-500" />
                    <span className="font-bold text-gray-800">Includes VAT (15%)</span>
                 </label>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl mb-6">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><ShoppingBag size={18}/> Items List</h3>
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-3 items-end">
                  <div className="md:col-span-4">
                    <label className="text-xs font-bold text-gray-500 ml-1">Item Name</label>
                    <input required type="text" placeholder="Item Name" className="w-full p-2 rounded-lg border border-gray-200" 
                      value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)} />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-xs font-bold text-gray-500 ml-1">Category</label>
                    <select className="w-full p-2 rounded-lg border border-gray-200" value={item.category} onChange={e => handleItemChange(index, 'category', e.target.value)}>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 ml-1">Qty</label>
                    <input required type="number" min="1" className="w-full p-2 rounded-lg border border-gray-200" 
                      value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 ml-1">Unit Price</label>
                    <input required type="number" min="0" className="w-full p-2 rounded-lg border border-gray-200" 
                      value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', Number(e.target.value))} />
                  </div>
                  <div className="md:col-span-1 text-right">
                    <button type="button" onClick={() => removeItemRow(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addItemRow} className="mt-2 text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">+ Add Another Item</button>
            </div>

            <div className="flex justify-end items-center gap-8 border-t border-gray-100 pt-6">
              <div className="text-right">
                <p className="text-sm text-gray-500">Subtotal: <span className="font-bold text-gray-800">ETB {subTotal.toLocaleString()}</span></p>
                <p className="text-sm text-gray-500">VAT (15%): <span className="font-bold text-gray-800">ETB {tax.toLocaleString()}</span></p>
                <p className="text-xl font-black text-amber-600 mt-1">Total: ETB {total.toLocaleString()}</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200">Cancel</button>
                <button type="submit" className="px-6 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 flex items-center gap-2"><Save size={18}/> Save Purchase</button>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      {/* List View /}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Supplier</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Items</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {purchases.map((p: any) => (
              <tr key={p._id} className="hover:bg-amber-50/20 transition">
                <td className="px-6 py-4 text-sm text-gray-600">{new Date(p.date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{p.supplier}</div>
                  <div className="text-xs text-gray-500">{p.referenceNo}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {p.items.length} items ({p.items[0]?.category})
                </td>
                <td className="px-6 py-4 font-bold text-gray-800">ETB {p.grandTotal.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}*/