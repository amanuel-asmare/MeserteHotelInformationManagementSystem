'use client';

import { useState, useEffect } from 'react';
import {
  Search, Plus, Edit, Trash2, Filter, ChevronDown,
  CheckCircle, Utensils, Image as ImageIcon, X, ChevronLeft, ChevronRight, Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { useLanguage } from '../../../../context/LanguageContext'; // Import Hook

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'drinks';
  image: string;
  isActive: boolean;
  tags: string[];
  createdAt: string;
}

// Interface for the random particles to prevent hydration mismatch
interface Particle {
  id: number;
  top: string;
  left: string;
  duration: number;
}

export default function MenuManagementClient() {
  const { t, language } = useLanguage(); // Use Translation Hook
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  
  // State for particles to fix hydration error
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 

  const [form, setForm] = useState({
    name: '', description: '', price: '', category: 'breakfast' as any,
    tags: '', image: null as File | null
  });

  // Generate random particles only on the client side
  useEffect(() => {
    const generatedParticles = [...Array(6)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: 5 + i
    }));
    setParticles(generatedParticles);
  }, []);

  // Royal Loading Delay
  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchMenu();
  }, []);

  // ESC to close zoom
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomedImage(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await api.get('/api/menu');
      setMenuItems(res.data);
      setLoading(false);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setLoading(false);
    }
  };

  const filteredMenu = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredMenu.length / itemsPerPage);
  const paginatedItems = filteredMenu.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('category', form.category);
    if (form.tags) formData.append('tags', form.tags);
    if (form.image) formData.append('image', form.image);

    try {
      setUploading(true);
      if (editingItem) {
        await api.put(`/api/menu/${editingItem._id}`, formData);
      } else {
        await api.post('/api/menu', formData);
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowAddModal(false);
        setEditingItem(null);
        resetForm();
        fetchMenu();
      }, 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving menu');
    } finally {
      setUploading(false);
    }
  };

  const getImageUrl = (image: string | null | undefined): string => {
    if (!image) return '/default-menu.jpg';
    if (image.startsWith('http')) return image;
    if (image.startsWith('/uploads')) return `${API_BASE}${image}`;
    return `${API_BASE}/uploads/menu/${image}`;
  };

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', category: 'breakfast', tags: '', image: null });
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/menu/${id}`);
      setMenuItems(prev => prev.filter(item => item._id !== id));
      setShowDeleteModal(null);
      // Adjust page if needed
      if (paginatedItems.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  // --- ROYAL LOADING SCREEN ---
  if (loading || !minTimePassed) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-amber-950 via-black to-amber-900 flex items-center justify-center overflow-hidden z-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15),transparent_70%)]" />
        
        {/* Animated Particles - Now using state to prevent hydration error */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            animate={{ y: [0, -100, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: particle.duration, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"
            style={{ top: particle.top, left: particle.left }}
          />
        ))}

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="relative z-10 text-center"
        >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-2xl ring-4 ring-amber-900/50">
                <Utensils className="text-white w-12 h-12 animate-pulse" />
            </div>
            <h2 className="text-4xl font-black text-amber-400 tracking-widest mb-2">
               {language === 'am' ? 'የምግብ ጥበብ' : 'CULINARY ARTS'}
            </h2>
            <p className="text-amber-200/80 tracking-wide">
               {language === 'am' ? 'ምርጥ ምግቦችን በማዘጋጀት ላይ...' : 'Curating the finest menu...'}
            </p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* FULLSCREEN ZOOM LIGHTBOX */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setZoomedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-5xl w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={zoomedImage}
                alt="Zoomed"
                className="w-full h-auto max-h-screen rounded-2xl shadow-2xl object-contain"
              />
              <button
                onClick={() => setZoomedImage(null)}
                className="absolute top-4 right-4 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
              >
                <X size={24} className="text-gray-800" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-white rounded-2xl p-10 shadow-2xl text-center border-t-4 border-green-500"
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
              </motion.div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-2xl font-bold text-gray-800">
                {editingItem ? t('updateSuccessfully') : t('addSuccessfully')}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }} className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full border-t-4 border-red-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-red-600">{t('deleteItem')}</h3>
                <button onClick={() => setShowDeleteModal(null)} className="p-1 hover:bg-gray-100 rounded-lg transition">
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-600 mb-6">{t('deleteMenuConfirm')}</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(null)} className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium">{t('cancel')}</button>
                <button onClick={() => handleDelete(showDeleteModal)} className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium">{t('delete')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">{t('menuManagement')}</h1>
          <p className="text-gray-600 mt-1 font-medium">{t('manageMenuDesc')}</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-bold">
          <Plus size={20} /> {t('addMenuItem')}
        </button>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder={t('searchMenu')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition bg-gray-50 focus:bg-white" />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as any)} className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 appearance-none bg-gray-50 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition">
            <option value="all">{t('allCategories')}</option>
            <option value="breakfast">{t('breakfast')}</option>
            <option value="lunch">{t('lunch')}</option>
            <option value="dinner">{t('dinner')}</option>
            <option value="drinks">{t('drinks')}</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-xl w-fit overflow-x-auto">
          {['all', 'breakfast', 'lunch', 'dinner', 'drinks'].map((cat) => (
            <button 
              key={cat} 
              onClick={() => setCategoryFilter(cat as any)} 
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${categoryFilter === cat ? 'bg-white text-amber-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {cat === 'all' ? t('allTypes') : t(cat as any)}
            </button>
          ))}
        </div>
      </div>

      {/* MENU GRID WITH PAGINATION ANIMATION */}
      <div className="min-h-[600px] relative">
        <AnimatePresence mode="wait">
           <motion.div
             key={currentPage + categoryFilter + searchTerm} 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
             transition={{ duration: 0.3, ease: "easeInOut" }}
             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20"
           >
             {paginatedItems.map((item) => (
               <motion.div
                 key={item._id}
                 whileHover={{ y: -8, transition: { duration: 0.2 } }}
                 className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group"
               >
                 {/* IMAGE SECTION */}
                 <div className="relative mb-4 rounded-xl overflow-hidden">
                   <div className="relative cursor-pointer" onClick={() => setZoomedImage(getImageUrl(item.image))}>
                     <img
                       src={getImageUrl(item.image)}
                       alt={item.name}
                       className="w-full h-48 object-cover rounded-xl transform group-hover:scale-105 transition duration-700"
                       onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/default-menu.jpg'; }}
                     />
                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                     <div className="absolute top-3 right-3">
                       <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                         <ImageIcon size={16} className="text-amber-600" />
                       </div>
                     </div>
                   </div>
                   
                   <div className="absolute top-3 left-3">
                     <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full shadow-sm backdrop-blur-md ${
                       item.category === 'breakfast' ? 'bg-yellow-400/90 text-yellow-900' :
                       item.category === 'lunch' ? 'bg-blue-500/90 text-white' :
                       item.category === 'dinner' ? 'bg-purple-600/90 text-white' :
                       'bg-green-500/90 text-white'
                     }`}>
                       {t(item.category)}
                     </span>
                   </div>
                 </div>

                 <h3 className="font-bold text-lg text-gray-900 mb-1">{item.name}</h3>
                 <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">{item.description}</p>
                 
                 <div className="flex items-center justify-between mb-4 pt-4 border-t border-gray-100">
                   <div>
                      <span className="text-xs text-gray-400 font-bold uppercase">{t('amount')}</span>
                      <span className="block text-2xl font-black text-amber-600">ETB {item.price}</span>
                   </div>
                   <span className={`px-3 py-1 text-xs font-bold rounded-full ${item.isActive ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                     {item.isActive ? t('active') : t('inactive')}
                   </span>
                 </div>
                 
                 <div className="flex gap-3">
                   <button
                     onClick={() => {
                       setEditingItem(item);
                       setForm({
                         name: item.name,
                         description: item.description,
                         price: item.price.toString(),
                         category: item.category,
                         tags: item.tags.join(', '),
                         image: null
                       });
                       setShowAddModal(true);
                     }}
                     className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition text-sm font-bold text-gray-700"
                   >
                     <Edit size={16} /> {t('edit')}
                   </button>
                   <button
                     onClick={() => setShowDeleteModal(item._id)}
                     className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 border border-red-100 text-red-600 rounded-xl hover:bg-red-100 transition text-sm font-bold"
                   >
                     <Trash2 size={16} /> {t('delete')}
                   </button>
                 </div>
               </motion.div>
             ))}
           </motion.div>
        </AnimatePresence>

        {paginatedItems.length === 0 && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <Utensils size={64} className="mb-4 opacity-20"/>
                <p className="text-lg font-medium">{t('noMenuItems')}</p>
             </div>
        )}
      </div>

      {/* --- ROYAL PAGINATION --- */}
      {totalPages > 1 && (
        <div className="fixed bottom-8 left-0 right-0 flex justify-center z-10 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md shadow-2xl border border-gray-200 rounded-full p-2 flex items-center gap-4 pointer-events-auto transform hover:scale-105 transition-transform duration-300">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-amber-100 text-gray-600 hover:text-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex gap-2 px-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentPage === i + 1
                      ? 'bg-amber-600 w-8' 
                      : 'bg-gray-300 hover:bg-amber-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-amber-100 text-gray-600 hover:text-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}


      {/* ADD/EDIT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 my-8 max-h-screen overflow-y-auto border border-gray-100"
          >
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-gray-900">{editingItem ? t('updateItem') : t('addMenuItem')}</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                    <X size={24} />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{t('dishImage')}</label>
                <div className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-2xl hover:border-amber-400 hover:bg-amber-50 transition-colors relative group cursor-pointer">
                   <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-20 h-20 bg-white rounded-xl flex-shrink-0 overflow-hidden border border-gray-200 shadow-sm flex items-center justify-center">
                    {form.image ? (
                      <img src={URL.createObjectURL(form.image)} className="w-full h-full object-cover" />
                    ) : editingItem?.image ? (
                      <img src={getImageUrl(editingItem.image)} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-gray-300" />
                    )}
                  </div>
                  <div>
                      <p className="font-bold text-gray-700 group-hover:text-amber-700 transition-colors">{t('clickToUpload')}</p>
                      <p className="text-xs text-gray-400">{t('imageFormat')}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('dishName')}</label>
                <input placeholder={t('namePlaceholder')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-0 transition font-medium" required />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('dishDesc')}</label>
                <textarea placeholder={t('descPlaceholder')} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-0 transition resize-none" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('priceAmount')}</label>
                  <input type="number" placeholder={t('pricePlaceholder')} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-0 transition font-bold text-gray-800" required />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('category')}</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-0 transition font-medium cursor-pointer">
                    <option value="breakfast">{t('breakfast')}</option>
                    <option value="lunch">{t('lunch')}</option>
                    <option value="dinner">{t('dinner')}</option>
                    <option value="drinks">{t('drinks')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('tags')}</label>
                <input placeholder={t('tagsPlaceholder')} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-0 transition" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowAddModal(false); setEditingItem(null); resetForm(); }} className="flex-1 py-3.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition font-bold text-gray-600">{t('cancel')}</button>
                <button type="submit" disabled={uploading} className="flex-1 py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition font-bold disabled:opacity-70 disabled:cursor-not-allowed">
                  {uploading ? t('saving') : editingItem ? t('updateItem') : t('addToMenu')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
}
/*'use client';
import { Image, Modal, Keyboard } from 'react-native';

import { useState, useEffect } from 'react';

import {
  Search, Plus, Edit, Trash2, Filter, ChevronDown,
  CheckCircle, Utensils, Image as ImageIcon, X, ChevronLeft, ChevronRight, Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'drinks';
  image: string;
  isActive: boolean;
  tags: string[];
  createdAt: string;
}

export default function MenuManagementClient() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'breakfast' | 'lunch' | 'dinner' | 'drinks'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Show 8 items per page for a balanced grid

  const [form, setForm] = useState({
    name: '', description: '', price: '', category: 'breakfast' as any,
    tags: '', image: null as File | null
  });

  // Royal Loading Delay
  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchMenu();
  }, []);

  // ESC to close zoom
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomedImage(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await api.get('/api/menu');
      setMenuItems(res.data);
      setLoading(false);
    } catch (err: any) {
      console.error('Fetch error:', err);
      // alert('Failed to load menu'); // Suppress alert on load for smoother UX
      setLoading(false);
    }
  };

  const filteredMenu = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredMenu.length / itemsPerPage);
  const paginatedItems = filteredMenu.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('category', form.category);
    if (form.tags) formData.append('tags', form.tags);
    if (form.image) formData.append('image', form.image);

    try {
      setUploading(true);
      if (editingItem) {
        await api.put(`/api/menu/${editingItem._id}`, formData);
      } else {
        await api.post('/api/menu', formData);
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowAddModal(false);
        setEditingItem(null);
        resetForm();
        fetchMenu();
      }, 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving menu');
    } finally {
      setUploading(false);
    }
  };

  const getImageUrl = (image: string | null | undefined): string => {
    if (!image) return '/default-menu.jpg';
    if (image.startsWith('http')) return image;
    if (image.startsWith('/uploads')) return `${API_BASE}${image}`;
    return `${API_BASE}/uploads/menu/${image}`;
  };

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', category: 'breakfast', tags: '', image: null });
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/menu/${id}`);
      setMenuItems(prev => prev.filter(item => item._id !== id));
      setShowDeleteModal(null);
      // Adjust page if needed
      if (paginatedItems.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  // --- ROYAL LOADING SCREEN ---
  if (loading || !minTimePassed) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-amber-950 via-black to-amber-900 flex items-center justify-center overflow-hidden z-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15),transparent_70%)]" />
        
   
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -100, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
          />
        ))}

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="relative z-10 text-center"
        >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-2xl ring-4 ring-amber-900/50">
                <Utensils className="text-white w-12 h-12 animate-pulse" />
            </div>
            <h2 className="text-4xl font-black text-amber-400 tracking-widest mb-2">CULINARY ARTS</h2>
            <p className="text-amber-200/80 tracking-wide">Curating the finest menu...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
     
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setZoomedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-5xl w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={zoomedImage}
                alt="Zoomed"
                className="w-full h-auto max-h-screen rounded-2xl shadow-2xl object-contain"
              />
              <button
                onClick={() => setZoomedImage(null)}
                className="absolute top-4 right-4 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
              >
                <X size={24} className="text-gray-800" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

     
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-white rounded-2xl p-10 shadow-2xl text-center border-t-4 border-green-500"
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
              </motion.div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-2xl font-bold text-gray-800">
                Menu Item {editingItem ? 'Updated' : 'Added'} Successfully!
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }} className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full border-t-4 border-red-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-red-600">Confirm Delete</h3>
                <button onClick={() => setShowDeleteModal(null)} className="p-1 hover:bg-gray-100 rounded-lg transition">
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this menu item? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(null)} className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium">Cancel</button>
                <button onClick={() => handleDelete(showDeleteModal)} className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Menu Management</h1>
          <p className="text-gray-600 mt-1 font-medium">Manage breakfast, lunch, dinner & drinks</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-bold">
          <Plus size={20} /> Add Menu Item
        </button>
      </div>

   
      <div className="mb-6 flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Search menu items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition bg-gray-50 focus:bg-white" />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as any)} className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 appearance-none bg-gray-50 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition">
            <option value="all">All Categories</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="drinks">Drinks</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
      </div>

  
      <div className="mb-8">
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-xl w-fit">
          {['all', 'breakfast', 'lunch', 'dinner', 'drinks'].map((cat) => (
            <button 
              key={cat} 
              onClick={() => setCategoryFilter(cat as any)} 
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${categoryFilter === cat ? 'bg-white text-amber-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

    
      <div className="min-h-[600px] relative">
        <AnimatePresence mode="wait">
           <motion.div
             key={currentPage + categoryFilter + searchTerm} // Key change triggers animation
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
             transition={{ duration: 0.3, ease: "easeInOut" }}
             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20"
           >
             {paginatedItems.map((item) => (
               <motion.div
                 key={item._id}
                 whileHover={{ y: -8, transition: { duration: 0.2 } }}
                 className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group"
               >
                 
                 <div className="relative mb-4 rounded-xl overflow-hidden">
                   <div className="relative cursor-pointer" onClick={() => setZoomedImage(getImageUrl(item.image))}>
                     <img
                       src={getImageUrl(item.image)}
                       alt={item.name}
                       className="w-full h-48 object-cover rounded-xl transform group-hover:scale-105 transition duration-700"
                       onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/default-menu.jpg'; }}
                     />
                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                     <div className="absolute top-3 right-3">
                       <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                         <ImageIcon size={16} className="text-amber-600" />
                       </div>
                     </div>
                   </div>
                   
                   <div className="absolute top-3 left-3">
                     <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full shadow-sm backdrop-blur-md ${
                       item.category === 'breakfast' ? 'bg-yellow-400/90 text-yellow-900' :
                       item.category === 'lunch' ? 'bg-blue-500/90 text-white' :
                       item.category === 'dinner' ? 'bg-purple-600/90 text-white' :
                       'bg-green-500/90 text-white'
                     }`}>
                       {item.category}
                     </span>
                   </div>
                 </div>

                 <h3 className="font-bold text-lg text-gray-900 mb-1">{item.name}</h3>
                 <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">{item.description}</p>
                 
                 <div className="flex items-center justify-between mb-4 pt-4 border-t border-gray-100">
                   <div>
                      <span className="text-xs text-gray-400 font-bold uppercase">Price</span>
                      <span className="block text-2xl font-black text-amber-600">ETB {item.price}</span>
                   </div>
                   <span className={`px-3 py-1 text-xs font-bold rounded-full ${item.isActive ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                     {item.isActive ? 'Active' : 'Inactive'}
                   </span>
                 </div>
                 
                 <div className="flex gap-3">
                   <button
                     onClick={() => {
                       setEditingItem(item);
                       setForm({
                         name: item.name,
                         description: item.description,
                         price: item.price.toString(),
                         category: item.category,
                         tags: item.tags.join(', '),
                         image: null
                       });
                       setShowAddModal(true);
                     }}
                     className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition text-sm font-bold text-gray-700"
                   >
                     <Edit size={16} /> Edit
                   </button>
                   <button
                     onClick={() => setShowDeleteModal(item._id)}
                     className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 border border-red-100 text-red-600 rounded-xl hover:bg-red-100 transition text-sm font-bold"
                   >
                     <Trash2 size={16} /> Delete
                   </button>
                 </div>
               </motion.div>
             ))}
           </motion.div>
        </AnimatePresence>

        {paginatedItems.length === 0 && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <Utensils size={64} className="mb-4 opacity-20"/>
                <p className="text-lg font-medium">No menu items found.</p>
             </div>
        )}
      </div>

      
      {totalPages > 1 && (
        <div className="fixed bottom-8 left-0 right-0 flex justify-center z-10 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md shadow-2xl border border-gray-200 rounded-full p-2 flex items-center gap-4 pointer-events-auto transform hover:scale-105 transition-transform duration-300">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-amber-100 text-gray-600 hover:text-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex gap-2 px-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentPage === i + 1
                      ? 'bg-amber-600 w-8' // Active indicator is wide
                      : 'bg-gray-300 hover:bg-amber-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-amber-100 text-gray-600 hover:text-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}


     
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 my-8 max-h-screen overflow-y-auto border border-gray-100"
          >
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-gray-900">{editingItem ? 'Edit Item' : 'New Dish'}</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                    <X size={24} />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
             
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Dish Image</label>
                <div className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-2xl hover:border-amber-400 hover:bg-amber-50 transition-colors relative group cursor-pointer">
                   <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-20 h-20 bg-white rounded-xl flex-shrink-0 overflow-hidden border border-gray-200 shadow-sm flex items-center justify-center">
                    {form.image ? (
                      <img src={URL.createObjectURL(form.image)} className="w-full h-full object-cover" />
                    ) : editingItem?.image ? (
                      <img src={getImageUrl(editingItem.image)} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-gray-300" />
                    )}
                  </div>
                  <div>
                      <p className="font-bold text-gray-700 group-hover:text-amber-700 transition-colors">Click to upload</p>
                      <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Name</label>
                <input placeholder="e.g., Doro Wat" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-0 transition font-medium" required />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                <textarea placeholder="Briefly describe the dish..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-0 transition resize-none" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Price (ETB)</label>
                  <input type="number" placeholder="0.00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-0 transition font-bold text-gray-800" required />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-0 transition font-medium cursor-pointer">
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="drinks">Drinks</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tags</label>
                <input placeholder="e.g., spicy, vegan (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-0 transition" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowAddModal(false); setEditingItem(null); resetForm(); }} className="flex-1 py-3.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition font-bold text-gray-600">Cancel</button>
                <button type="submit" disabled={uploading} className="flex-1 py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition font-bold disabled:opacity-70 disabled:cursor-not-allowed">
                  {uploading ? 'Saving...' : editingItem ? 'Update Item' : 'Add to Menu'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
}

*/
/*// src/app/admin/menu/MenuManagementClient.tsx
'use client';

import {
  Search, Plus, Edit, Trash2, Filter, ChevronDown, Users,
  CheckCircle, Upload, Utensils, Coffee, Clock, MapPin, DollarSign,
  User, GraduationCap, Calendar, Image as ImageIcon,
  ToggleLeft, ToggleRight, X
} from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE from '../../../lib/api'
interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'drinks';
  image: string;
  isActive: boolean;
  tags: string[];
  createdAt: string;
}

export default function MenuManagementClient() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'breakfast' | 'lunch' | 'dinner' | 'drinks'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '', description: '', price: '', category: 'breakfast' as any,
    tags: '', image: null as File | null
  });

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await axios.get('/api/menu', { withCredentials: true });
      setMenuItems(res.data);
      setLoading(false);
    } catch (err: any) {
      console.error('Fetch error:', err);
      alert('Failed to load menu');
      setLoading(false);
    }
  };

  const filteredMenu = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('category', form.category);
    if (form.tags) formData.append('tags', form.tags);
    if (form.image) formData.append('image', form.image);

    try {
      setUploading(true);
      if (editingItem) {
        await axios.put(`/api/menu/${editingItem._id}`, formData, { withCredentials: true });
      } else {
        await axios.post('/api/menu', formData, { withCredentials: true });
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowAddModal(false);
        setEditingItem(null);
        resetForm();
        fetchMenu();
      }, 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving menu');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '', description: '', price: '', category: 'breakfast',
      tags: '', image: null
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/menu/${id}`, { withCredentials: true });
      setMenuItems(prev => prev.filter(item => item._id !== id));
      setShowDeleteModal(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-8 border-amber-200 animate-spin"></div>
          <div className="absolute inset-0 w-24 h-24 rounded-full border-8 border-amber-600 animate-ping"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-amber-600 rounded-full animate-pulse flex items-center justify-center">
              <Utensils className="w-8 h-8 text-white" />
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-amber-700 animate-pulse">Loading Menu...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Success Modal 
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-white rounded-2xl p-10 shadow-2xl text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-gray-800"
              >
                Menu Item {editingItem ? 'Updated' : 'Added'} Successfully!
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal 
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-red-600">Confirm Delete</h3>
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this menu item? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal)}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header 
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600 mt-1">Manage breakfast, lunch, dinner & drinks</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <Plus size={20} /> Add Menu Item
        </button>
      </div>

      {/* Search & Filter 
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 appearance-none bg-white"
          >
            <option value="all">All Categories</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="drinks">Drinks</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>
      </div>

      {/* Menu Categories Tabs 
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['all', 'breakfast', 'lunch', 'dinner', 'drinks'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat as any)}
                className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                  categoryFilter === cat
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Menu Grid 
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMenu.map((item) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="relative mb-4">
              <img
                src={item.image.startsWith('/uploads') 
                  ? `${API_BASE}${item.image}` 
                  : item.image.startsWith('http') 
                    ? item.image 
                    : '/default-menu.png'
                }
                alt={item.name}
                className="w-full h-48 object-cover rounded-xl"
                onError={(e) => e.currentTarget.src = '/default-menu.jpg'}
              />
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  item.category === 'breakfast' ? 'bg-yellow-100 text-yellow-800' :
                  item.category === 'lunch' ? 'bg-blue-100 text-blue-800' :
                  item.category === 'dinner' ? 'bg-purple-100 text-purple-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                </span>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-amber-600">ETB {item.price}</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {item.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingItem(item);
                  setForm({
                    name: item.name,
                    description: item.description,
                    price: item.price.toString(),
                    category: item.category,
                    tags: item.tags.join(', '),
                    image: null
                  });
                  setShowAddModal(true);
                }}
                className="flex-1 flex items-center justify-center gap-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                <Edit size={16} /> Edit
              </button>
              <button
                onClick={() => setShowDeleteModal(item._id)}
                className="flex-1 flex items-center justify-center gap-1 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal 
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 my-8 max-h-screen overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload 
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Menu Image
                </label>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    {form.image ? (
                      <img src={URL.createObjectURL(form.image)} className="w-full h-full object-cover rounded-lg" />
                    ) : editingItem?.image ? (
                      <img 
                        src={editingItem.image.startsWith('/uploads') 
                          ? `${API_BASE}${editingItem.image}` 
                          : editingItem.image
                        } 
                        className="w-full h-full object-cover rounded-lg" 
                      />
                    ) : (
                      <ImageIcon className="text-gray-400" size={32} />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
                    className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  placeholder="e.g., Ethiopian Coffee"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  placeholder="Brief description..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (ETB) *</label>
                <input
                  type="number"
                  placeholder="e.g., 45"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="drinks">Drinks</option>
                </select>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  placeholder="e.g., vegetarian, spicy, popular"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition font-medium disabled:opacity-50"
                >
                  {uploading ? 'Saving...' : editingItem ? 'Update' : 'Add'} Item
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
}*/