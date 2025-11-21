// src/app/admin/menu/MenuManagementClient.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Search, Plus, Edit, Trash2, Filter, ChevronDown,
  CheckCircle, Utensils, Image as ImageIcon, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

const API_BASE = 'http://localhost:5000';

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
  const [zoomedImage, setZoomedImage] = useState<string | null>(null); // FULLSCREEN ZOOM

  const [form, setForm] = useState({
    name: '', description: '', price: '', category: 'breakfast' as any,
    tags: '', image: null as File | null
  });

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
              className="bg-white rounded-2xl p-10 shadow-2xl text-center"
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

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }} className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full">
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

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600 mt-1">Manage breakfast, lunch, dinner & drinks</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
          <Plus size={20} /> Add Menu Item
        </button>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Search menu items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as any)} className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 appearance-none bg-white">
            <option value="all">All Categories</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="drinks">Drinks</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['all', 'breakfast', 'lunch', 'dinner', 'drinks'].map((cat) => (
              <button key={cat} onClick={() => setCategoryFilter(cat as any)} className={`pb-2 px-1 border-b-2 font-medium text-sm ${categoryFilter === cat ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* MENU GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMenu.map((item) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* IMAGE SECTION — ALWAYS VISIBLE + CLICK TO ZOOM */}
<div className="relative mb-4 rounded-xl overflow-hidden">
  {item.image ? (
    <div
      className="relative cursor-pointer"
      onClick={() => setZoomedImage(getImageUrl(item.image))}
    >
      {/* MAIN IMAGE — ALWAYS VISIBLE */}
      <img
        src={getImageUrl(item.image)}
        alt={item.name}
        className="w-full h-48 object-cover rounded-xl"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = '/default-menu.jpg';
        }}
      />

      {/* HOVER ICON ONLY — NO DARK OVERLAY */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-white/90 p-2 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200">
          <ImageIcon size={20} className="text-amber-600" />
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-48 text-gray-400 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300">
      No image uploaded
    </div>
  )}

  {/* CATEGORY BADGE */}
  <div className="absolute top-2 right-2">
    <span className={`px-2 py-1 text-xs rounded-full font-medium shadow-sm ${
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
              <span className={`px-2 py-1 text-xs rounded-full ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
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
                className="flex-1 flex items-center justify-center gap-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
              >
                <Edit size={16} /> Edit
              </button>
              <button
                onClick={() => setShowDeleteModal(item._id)}
                className="flex-1 flex items-center justify-center gap-1 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-medium"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ADD/EDIT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 my-8 max-h-screen overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Menu Image</label>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                    {form.image ? (
                      <img src={URL.createObjectURL(form.image)} className="w-full h-full object-cover rounded-lg" />
                    ) : editingItem?.image ? (
                      <img
                        src={getImageUrl(editingItem.image)}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/no-image.png';
                        }}
                      />
                    ) : (
                      <div className="text-xs text-gray-400 text-center px-1">No image</div>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input placeholder="e.g., Ethiopian Coffee" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea placeholder="Brief description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (ETB) *</label>
                <input type="number" placeholder="e.g., 45" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="drinks">Drinks</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input placeholder="e.g., vegetarian, spicy, popular" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
              </div>

              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => { setShowAddModal(false); setEditingItem(null); resetForm(); }} className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium">Cancel</button>
                <button type="submit" disabled={uploading} className="flex-1 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition font-medium disabled:opacity-50">
                  {uploading ? 'Saving...' : editingItem ? 'Update' : 'Add'} Item
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
}
  /*// src/app/admin/menu/MenuManagementClient.tsx
'use client';

import { useState, useEffect } from 'react';
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