'use client';
import { Image } from 'react-native';

import { useState } from 'react';

import { useAuth } from '../../../../../context/AuthContext'; // Adjust path based on file location
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { User, Phone, Home, Save, Camera } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '../../../../../context/LanguageContext'; // Import Hook

export default function CustomerSettings() {
  const { t } = useLanguage(); // Use Translation Hook
  const { user, updateUser } = useAuth();
  
  // const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://mesertehotelinformationmanagementsystem.onrender.com';
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    roomNumber: user?.roomNumber || '',
    profileImage: null as File | null,
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('firstName', form.firstName);
      formData.append('lastName', form.lastName);
      formData.append('phone', form.phone);
      formData.append('roomNumber', form.roomNumber);
      
      if (form.profileImage) {
        formData.append('profileImage', form.profileImage);
      }

      const res = await api.put('/api/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateUser(res.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || t('failedUpdate'));
    } finally {
      setSaving(false);
    }
  };

  const getImageSrc = () => {
    if (form.profileImage) {
      return URL.createObjectURL(form.profileImage);
    }
    if (user?.profileImage) {
      return user.profileImage.startsWith('http') 
        ? user.profileImage 
        : `${API_BASE}${user.profileImage}`;
    }
    return '/default-avatar.png';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('roomSetTitle')}</h1>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-6">
          
          {/* Image Section */}
          <div className="flex items-center gap-6 mb-6">
            <label className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-amber-500 bg-gray-200">
                <img
                  src={getImageSrc()}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Camera size={20} className="text-white" />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setForm({ ...form, profileImage: e.target.files?.[0] || null })}
                className="hidden"
              />
            </label>

            <div>
              <h2 className="text-xl font-semibold dark:text-white">{user?.firstName} {user?.lastName}</h2>
              <p className="text-gray-600 dark:text-gray-400">{t('room')}: {user?.roomNumber || t('notSet')}</p>
              <p className="text-xs text-amber-600 mt-1">{t('clickToUpdate')}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User size={16} /> {t('firstName')}
              </label>
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User size={16} /> {t('lastName')}
              </label>
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone size={16} /> {t('phoneNumber')}
              </label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+251 911 123 456"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Home size={16} /> {t('roomNumberLabel')}
              </label>
              <input
                value={form.roomNumber}
                onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                placeholder={t('roomNumberPlaceholder')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white font-medium"
              />
              <p className="text-xs text-amber-600 mt-1">{t('optionalRoomService')}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-50 font-medium transition"
            >
              <Save size={18} />
              {saving ? t('saving') : t('saveChanges')}
            </button>
            
            <Link href="/customer/menu" className="px-4 py-3 text-gray-600 dark:text-gray-300 hover:underline">
              {t('backToMenu')}
            </Link>
          </div>

          {success && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-green-600 font-medium flex items-center gap-2"
            >
              {t('profileUpdated')}
            </motion.p>
          )}
        </div>
      </motion.div>
    </div>
  );
}/*'use client';

import { useAuth } from '../../../../context/AuthContext';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { User, Phone, Home, Save } from 'lucide-react';
import Link from 'next/link';
export default function CustomerSettings() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    roomNumber: user?.roomNumber || '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/api/users/me', form);
      updateUser(res.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Profile Settings</h1>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={user?.profileImage || '/default-avatar.png'}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover ring-4 ring-amber-500"
            />
            <div>
              <h2 className="text-xl font-semibold">{user?.firstName} {user?.lastName}</h2>
              <p className="text-gray-600 dark:text-gray-400">Room: {user?.roomNumber || 'Not set'}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User size={16} /> First Name
              </label>
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User size={16} /> Last Name
              </label>
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone size={16} /> Phone
              </label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+251 911 123 456"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Home size={16} /> Room Number *
              </label>
              <input
                value={form.roomNumber}
                onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                placeholder="e.g., 304"
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 font-medium"
              />
              <p className="text-xs text-amber-600 mt-1">Required for food delivery</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !form.roomNumber}
              className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-50 font-medium"
            ><Link href="/customer/menu" className="underline"> <Save size={18} />
              {saving ? 'Saving...' : 'Save Changes'}</Link>
             
            </button>
          </div>

          {success && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-green-600 font-medium flex items-center gap-2"
            >
              Profile updated successfully!
            </motion.p>
          )}
        </div>
      </motion.div>
    </div>
  );
}*/