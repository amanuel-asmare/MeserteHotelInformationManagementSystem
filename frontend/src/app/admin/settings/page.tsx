'use client';

import { useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  CheckCircle, Lock, User, Mail, LogOut, 
  Camera, Eye, EyeOff, ShieldCheck, Sparkles 
} from 'lucide-react';
import axios from 'axios';
import BackButton from '../../manager/ui/BackButton';

// --- ANIMATION VARIANTS (Typed correctly) ---
const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const inputVariants: Variants = {
  focus: { scale: 1.02, borderColor: "#F59E0B", boxShadow: "0px 4px 20px rgba(245, 158, 11, 0.1)" },
  blur: { scale: 1, borderColor: "#E5E7EB", boxShadow: "none" }
};

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
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://mesertehotelinformationmanagementsystem.onrender.com';

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
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 transition-colors duration-300">
      
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-r from-amber-600 to-orange-700 rounded-b-[3rem] shadow-lg z-0"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-8">
        <div className="flex justify-between items-center mb-8">
          <BackButton />
          
          {/* Header Logout Button - Visible & Styled */}
          <button 
            onClick={logout} 
            className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md border border-white/40 text-white rounded-full hover:bg-white/30 hover:scale-105 transition-all font-bold shadow-md"
          >
            <LogOut size={20} /> 
            <span>Logout</span>
          </button>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700"
        >
          {/* Header & Tabs */}
          <div className="flex flex-col md:flex-row border-b border-gray-100 dark:border-gray-700">
            {/* Sidebar / Tabs */}
            <div className="w-full md:w-1/3 bg-gray-50 dark:bg-gray-800/50 p-6 md:p-8 flex flex-col gap-2">
              <div className="mb-8 text-center md:text-left">
                 <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2 justify-center md:justify-start">
                   <Sparkles className="text-amber-500" /> Account
                 </h1>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your personal details.</p>
              </div>
              
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-medium ${
                  activeTab === 'profile' 
                    ? 'bg-white dark:bg-gray-700 text-amber-600 shadow-md transform scale-105' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <User size={20} /> Profile Information
              </button>

              <button 
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-medium ${
                  activeTab === 'security' 
                    ? 'bg-white dark:bg-gray-700 text-amber-600 shadow-md transform scale-105' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <ShieldCheck size={20} /> Security & Password
              </button>

              {/* Mobile Logout Button (Visible only on small screens inside sidebar) */}
              <button 
                onClick={logout} 
                className=" mt-4 flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40"
              >
                <LogOut size={20} /> Logout
              </button>
            </div>

            {/* Form Area */}
            <div className="w-full md:w-2/3 p-8 md:p-10 relative">
               <form onSubmit={handleSubmit} className="space-y-8">
                  
                  <AnimatePresence mode="wait">
                    {activeTab === 'profile' ? (
                      <motion.div 
                        key="profile"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                      >
                         {/* Avatar Upload */}
                         <div className="flex flex-col items-center">
                            <div className="relative group cursor-pointer">
                              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-2xl ring-4 ring-amber-100 dark:ring-amber-900/30">
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
                              <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 backdrop-blur-sm">
                                <Camera size={28} className="text-white drop-shadow-md" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => setForm({ ...form, profileImage: e.target.files?.[0] || null })}
                                  className="hidden"
                                />
                              </label>
                            </div>
                            <div className="mt-4 text-center">
                              <p className="text-lg font-bold text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</p>
                              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider">
                                {user?.role}
                              </span>
                            </div>
                         </div>

                         {/* Profile Fields */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">First Name</label>
                               <motion.div variants={inputVariants} whileFocus="focus" animate="blur" className="relative group">
                                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition" size={20} />
                                  <input
                                    value={form.firstName}
                                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none transition-all font-medium"
                                  />
                                </motion.div>
                            </div>
                            <div className="space-y-2">
                               <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Last Name</label>
                               <motion.div variants={inputVariants} whileFocus="focus" animate="blur" className="relative group">
                                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition" size={20} />
                                  <input
                                    value={form.lastName}
                                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none transition-all font-medium"
                                  />
                                </motion.div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                               <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email Address</label>
                               <motion.div variants={inputVariants} whileFocus="focus" animate="blur" className="relative group">
                                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition" size={20} />
                                  <input
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none transition-all font-medium"
                                  />
                                </motion.div>
                            </div>
                         </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="security"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                         <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/50 flex items-start gap-3">
                            <Lock className="text-amber-600 mt-1" size={20} />
                            <div>
                               <h4 className="font-bold text-amber-800 dark:text-amber-200 text-sm">Secure Your Account</h4>
                               <p className="text-xs text-amber-700 dark:text-amber-300/70 mt-1">Ensure your password is strong. Leave blank if you don't want to change it.</p>
                            </div>
                         </div>

                         <div className="space-y-4">
                            {['old', 'new', 'confirm'].map((type) => (
                              <div key={type} className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                  {type === 'old' ? 'Current Password' : type === 'new' ? 'New Password' : 'Confirm Password'}
                                </label>
                                <motion.div variants={inputVariants} whileFocus="focus" animate="blur" className="relative group">
                                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition" size={18} />
                                  <input
                                    type={showPassword[type as keyof typeof showPassword] ? 'text' : 'password'}
                                    value={form[(type + 'Password') as keyof typeof form] as string}
                                    onChange={e => setForm({ ...form, [`${type}Password`]: e.target.value })}
                                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none transition-all font-medium"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword({ ...showPassword, [type]: !showPassword[type as keyof typeof showPassword] })}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                  >
                                    {showPassword[type as keyof typeof showPassword] ? <EyeOff size={18} /> : <Eye size={18} />}
                                  </button>
                                </motion.div>
                              </div>
                            ))}
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                    <button
                      type="submit"
                      disabled={uploading}
                      className="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {uploading ? (
                         <>Processing...</>
                      ) : (
                         <>{activeTab === 'profile' ? 'Save Changes' : 'Update Password'} <CheckCircle size={18} /></>
                      )}
                    </button>
                  </div>

               </form>

               {/* Success Notification */}
               <AnimatePresence>
                 {success && (
                   <motion.div
                     initial={{ opacity: 0, y: 50, scale: 0.9 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 20, scale: 0.9 }}
                     className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50"
                   >
                     <div className="bg-white/20 p-1 rounded-full"><CheckCircle size={20} /></div>
                     <span className="font-bold tracking-wide">Update Successful!</span>
                   </motion.div>
                 )}
               </AnimatePresence>

            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}/*'use client';

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

  // const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://mesertehotelinformationmanagementsystem.onrender.com';
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
}*/