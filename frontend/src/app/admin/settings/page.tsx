'use client';

import { useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Upload, Lock, User, Mail, LogOut, Camera, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import BackButton from '../../manager/ui/BackButton'
export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    profileImage: null as File | null
  });
  const [showPassword, setShowPassword] = useState({ old: false, new: false, confirm: false });
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.newPassword || form.confirmPassword || form.oldPassword) {
      if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
        alert('All password fields are required');
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        alert('New passwords do not match');
        return;
      }
    }

    const formData = new FormData();
    formData.append('firstName', form.firstName);
    formData.append('lastName', form.lastName);
    formData.append('email', form.email);
    if (form.oldPassword) formData.append('oldPassword', form.oldPassword);
    if (form.newPassword) formData.append('newPassword', form.newPassword);
    if (form.confirmPassword) formData.append('confirmPassword', form.confirmPassword);
    if (form.profileImage) formData.append('profileImage', form.profileImage);

    try {
      setUploading(true);
      const res = await axios.put(`${API_BASE}/api/users/me`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      updateUser(res.data);
      setSuccess(true);
      setForm({ ...form, oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-6">
      <div><BackButton/></div>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Camera size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Update your profile and change password</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image */}
            <div className="flex items-center gap-5">
              <label className="relative group cursor-pointer">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-amber-200 shadow-lg group-hover:border-amber-500 transition">
                  {form.profileImage ? (
                    <img src={URL.createObjectURL(form.profileImage)} className="w-full h-full object-cover" />
                  ) : (
                    <img
                      src={user?.profileImage?.startsWith('http') ? user.profileImage : `${API_BASE}${user?.profileImage}`}
                      className="w-full h-full object-cover"
                      alt="Profile"
                    />
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <Upload size={20} className="text-white" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm({ ...form, profileImage: e.target.files?.[0] || null })}
                  className="hidden"
                />
              </label>
              <div>
                <p className="font-medium text-gray-800">{user?.firstName} {user?.lastName}</p>
                <p className="text-sm text-gray-500">{user?.role}</p>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 transition"
                />
              </div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 transition"
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>

            {/* Password Section */}
            <div className="space-y-4 p-5 bg-gray-50 rounded-xl">
              <p className="text-sm font-medium text-gray-700">Change Password (optional)</p>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword.old ? 'text' : 'password'}
                  placeholder="Current Password"
                  value={form.oldPassword}
                  onChange={e => setForm({ ...form, oldPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, old: !showPassword.old })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword.old ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword.new ? 'text' : 'password'}
                  placeholder="New Password"
                  value={form.newPassword}
                  onChange={e => setForm({ ...form, newPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword.confirm ? 'text' : 'password'}
                  placeholder="Confirm New Password"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={logout}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
              >
                <LogOut size={18} /> Logout
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition font-medium disabled:opacity-50"
              >
                {uploading ? 'Saving...' : 'Update Profile'}
              </button>
            </div>
          </form>

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 flex items-center gap-2 text-green-600"
              >
                <CheckCircle size={20} />
                <p>Profile updated successfully!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}