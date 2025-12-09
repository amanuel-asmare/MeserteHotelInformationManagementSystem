'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, Phone, Lock, MapPin, Building, Globe, Camera, 
  ArrowRight, ArrowLeft, CheckCircle2, Sparkles, X, LogIn 
} from 'lucide-react';
import { Modal } from '../ui/Modal'; 

// --- Schema ---
const registerSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be 6+ chars'),
  // Allow empty strings or undefined for optional fields
  phone: z.string().optional().or(z.literal('')), 
  country: z.string().default('Ethiopia'),
  city: z.string().min(2, 'City required'),
  kebele: z.string().optional().or(z.literal('')),
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onClose: () => void;
  forceRole?: 'customer';
  onSwitchToLogin?: () => void;
  onSwitch?: () => void; 
}

// --- Fireworks Component ---
const Fireworks = () => {
  const particles = Array.from({ length: 20 });
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [1, 0], 
            scale: [0, 1.5], 
            x: (Math.random() - 0.5) * 400, 
            y: (Math.random() - 0.5) * 400,
            rotate: Math.random() * 360
          }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: ['#FCD34D', '#F59E0B', '#D97706', '#EF4444', '#3B82F6'][Math.floor(Math.random() * 5)]
          }}
        />
      ))}
    </div>
  );
};

export default function RegisterForm({ onClose, forceRole, onSwitchToLogin, onSwitch }: RegisterFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'personal' | 'address'>('personal');
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle switching to login (support both prop names)
  const handleSwitchToLogin = onSwitch || onSwitchToLogin;

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ // <--- FIXED: Removed explicit <RegisterFormData> to allow automatic type inference
    resolver: zodResolver(registerSchema),
    defaultValues: {
      country: 'Ethiopia',
      phone: '',
      kebele: ''
    }
  });

  const firstName = watch('firstName');
  const isReceptionistMode = !!forceRole;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleNextStep = async () => {
    const isValid = await trigger(['firstName', 'lastName', 'email', 'password']);
    if (isValid) {
      setActiveTab('address');
    }
  };

  // --- SAFE CLOSE HANDLER ---
  const handleClose = () => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
    if (isReceptionistMode) {
      router.push('/receptionist');
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      // Ensure we don't send undefined
      if (value !== undefined && value !== null) formData.append(key, value);
    });
    if (imageFile) formData.append('profileImage', imageFile);
    if (forceRole) formData.append('role', forceRole);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? 'Registration failed');
      
      setShowSuccess(true);
      
      setTimeout(() => {
        if (!forceRole && handleSwitchToLogin) {
            handleSwitchToLogin(); 
        } else {
            handleClose();
        }
      }, 4000); 

    } catch (err: any) {
      alert(err.message || 'Failed to register');
    }
  };

  // --- Success View ---
  if (showSuccess) {
    return (
      <Modal onClose={handleClose} className="max-w-md w-full p-0 overflow-hidden rounded-3xl bg-white border-0 relative shadow-2xl">
        <Fireworks />
        <div className="flex flex-col items-center justify-center p-12 text-center bg-gradient-to-br from-amber-50 to-white min-h-[400px] relative">
            <button 
                type="button"
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition z-50"
            >
                <X size={24} />
            </button>

            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-28 h-28 bg-gradient-to-tr from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-200 z-10"
            >
                <CheckCircle2 className="w-14 h-14 text-white" strokeWidth={3} />
            </motion.div>
            
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-gray-800 mb-2 font-serif"
            >
                Registration Complete!
            </motion.h2>
            
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-600 mb-8 max-w-[250px]"
            >
                {isReceptionistMode 
                  ? <>Guest <span className="font-bold text-amber-600">{firstName}</span> added successfully.</>
                  : "Account created. Redirecting to login..."
                }
            </motion.p>
        </div>
      </Modal>
    );
  }

  // --- Main Form View ---
  return (
    <Modal
      title="" 
      onClose={handleClose}
      className="max-h-[90vh] w-full max-w-2xl flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-2xl p-0 border border-amber-100 dark:border-gray-800"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden relative">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-amber-600 to-amber-800 p-6 md:p-8 shrink-0">
            {/* DUPLICATE X BUTTON REMOVED - Relying on Modal's onClose */}
            
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Sparkles size={100} className="text-white" />
            </div>
            
            <div className="relative z-10 flex items-center gap-6">
                <div className="relative group shrink-0">
                    <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl backdrop-blur-sm transition-all ${preview ? 'bg-black' : 'bg-white/10'}`}>
                        {preview ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-white/80">
                                <User size={32} />
                            </div>
                        )}
                    </div>
                    <label className="absolute bottom-0 right-0 p-2 bg-white text-amber-700 rounded-full shadow-lg cursor-pointer hover:bg-amber-50 hover:scale-110 transition-all z-20">
                        <Camera size={16} />
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                </div>

                <div className="text-white">
                    <h2 className="text-2xl font-bold font-serif tracking-wide">
                        {isReceptionistMode ? 'New Guest' : 'Create Account'}
                    </h2>
                    <p className="text-amber-100 text-sm opacity-90">
                        Please fill in the details below.
                    </p>
                </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
            <button
                type="button"
                onClick={() => setActiveTab('personal')}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all relative ${
                    activeTab === 'personal' ? 'text-amber-600 bg-amber-50/50' : 'text-gray-400 hover:bg-gray-50'
                }`}
            >
                1. Personal Details
                {activeTab === 'personal' && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-amber-600" />
                )}
            </button>
            <button
                type="button"
                onClick={handleNextStep}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all relative ${
                    activeTab === 'address' ? 'text-amber-600 bg-amber-50/50' : 'text-gray-400 hover:bg-gray-50'
                }`}
            >
                2. Contact & Address
                {activeTab === 'address' && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-amber-600" />
                )}
            </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 bg-gray-50/30 dark:bg-gray-900 relative">
            <AnimatePresence mode="wait">
                {activeTab === 'personal' && (
                    <motion.div
                        key="personal"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-5"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div className="group">
                                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">First Name</label>
                                <input
                                    placeholder="Abebe"
                                    {...register('firstName')}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
                                />
                                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                            </div>
                            <div className="group">
                                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Last Name</label>
                                <input
                                    placeholder="Kebede"
                                    {...register('lastName')}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
                                />
                                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                            </div>
                        </div>

                        <div className="group relative">
                            <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Email Address</label>
                            <Mail className="absolute left-4 top-[2.1rem] text-gray-400" size={18} />
                            <input
                                type="email"
                                placeholder="guest@example.com"
                                {...register('email')}
                                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        <div className="group relative">
                            <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Password</label>
                            <Lock className="absolute left-4 top-[2.1rem] text-gray-400" size={18} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                {...register('password')}
                                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'address' && (
                    <motion.div
                        key="address"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-5"
                    >
                         <div className="group relative">
                            <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Phone Number</label>
                            <Phone className="absolute left-4 top-[2.1rem] text-gray-400" size={18} />
                            <input
                                type="tel"
                                placeholder="+251 911..."
                                {...register('phone')}
                                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Country</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3 text-gray-400" size={16} />
                                    <input
                                        value="Ethiopia"
                                        disabled
                                        {...register('country')}
                                        className="w-full pl-9 pr-3 py-3 bg-gray-100 text-gray-500 border border-gray-200 rounded-xl cursor-not-allowed text-sm font-medium"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">City</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-3 text-gray-400" size={16} />
                                    <input
                                        placeholder="Addis Ababa"
                                        {...register('city')}
                                        className="w-full pl-9 pr-3 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
                                    />
                                </div>
                                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Kebele / District</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                                <input
                                    placeholder="01"
                                    {...register('kebele')}
                                    className="w-full pl-9 pr-3 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="shrink-0 p-5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center gap-4 z-20">
          
          <div className="flex items-center">
            {activeTab === 'address' ? (
                <button
                    type="button"
                    onClick={() => setActiveTab('personal')}
                    className="flex items-center gap-2 text-gray-500 font-bold hover:text-amber-600 transition px-2"
                >
                    <ArrowLeft size={18} /> Back
                </button>
            ) : (
                isReceptionistMode ? (
                    // --- RECEPTIONIST: Functional Cancel Button ---
                    <button 
                        type="button" 
                        onClick={(e) => {
                            e.preventDefault();
                            handleClose();
                        }}
                        className="text-gray-500 font-bold hover:text-red-500 transition px-2"
                    >
                        Cancel
                    </button>
                ) : (
                    // --- PUBLIC: Login Link ---
                    handleSwitchToLogin && (
                        <button 
                            type="button" 
                            onClick={handleSwitchToLogin} 
                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-amber-700 font-bold"
                        >
                             Already have an account? <span className="underline text-amber-600">Login</span>
                        </button>
                    )
                )
            )}
          </div>
          
          {activeTab === 'personal' ? (
             <button
                type="button"
                onClick={handleNextStep}
                className="px-8 py-3 bg-amber-100 text-amber-800 hover:bg-amber-200 font-bold rounded-xl transition flex items-center gap-2"
             >
                Next Step <ArrowRight size={18} />
             </button>
          ) : (
             <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-xl shadow-lg shadow-amber-600/20 transition-all flex items-center gap-2"
             >
                 {isSubmitting ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Registering...
                    </>
                 ) : (
                    <>Create Account <CheckCircle2 size={18} /></>
                 )}
             </motion.button>
          )}
        </div>
      </form>
    </Modal>
  );
}/*'use client';
import { View } from 'react-native';

import { useState } from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, Phone, Lock, MapPin, Building, Globe, Camera, 
  ArrowRight, ArrowLeft, CheckCircle2, Sparkles, X, LogIn 
} from 'lucide-react';
import { Modal } from '../ui/Modal'; 

// --- Schema ---
const registerSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be 6+ chars'),
  phone: z.string().optional(),
  country: z.string().default('Ethiopia'),
  city: z.string().min(2, 'City required'),
  kebele: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onClose: () => void;
  forceRole?: 'customer';
  onSwitchToLogin?: () => void;
}

// --- Fireworks Component ---
const Fireworks = () => {
  const particles = Array.from({ length: 20 });
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [1, 0], 
            scale: [0, 1.5], 
            x: (Math.random() - 0.5) * 400, 
            y: (Math.random() - 0.5) * 400,
            rotate: Math.random() * 360
          }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: ['#FCD34D', '#F59E0B', '#D97706', '#EF4444', '#3B82F6'][Math.floor(Math.random() * 5)]
          }}
        />
      ))}
    </div>
  );
};

export default function RegisterForm({ onClose, forceRole, onSwitchToLogin }: RegisterFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'personal' | 'address'>('personal');
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const firstName = watch('firstName');
  const isReceptionistMode = !!forceRole;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleNextStep = async () => {
    const isValid = await trigger(['firstName', 'lastName', 'email', 'password']);
    if (isValid) {
      setActiveTab('address');
    }
  };

  // --- SAFE CLOSE HANDLER ---
  const handleClose = () => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
    if (isReceptionistMode) {
      router.push('/receptionist');
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, value);
    });
    if (imageFile) formData.append('profileImage', imageFile);
    if (forceRole) formData.append('role', forceRole);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? 'Registration failed');
      
      setShowSuccess(true);
      
      setTimeout(() => {
        if (!forceRole && onSwitchToLogin) {
            onSwitchToLogin(); 
        } else {
            handleClose();
        }
      }, 4000); 

    } catch (err: any) {
      alert(err.message || 'Failed to register');
    }
  };

  // --- Success View ---
  if (showSuccess) {
    return (
      <Modal onClose={handleClose} className="max-w-md w-full p-0 overflow-hidden rounded-3xl bg-white border-0 relative shadow-2xl">
        <Fireworks />
        <div className="flex flex-col items-center justify-center p-12 text-center bg-gradient-to-br from-amber-50 to-white min-h-[400px] relative">
            <button 
                type="button"
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition z-50"
            >
                <X size={24} />
            </button>

            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-28 h-28 bg-gradient-to-tr from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-200 z-10"
            >
                <CheckCircle2 className="w-14 h-14 text-white" strokeWidth={3} />
            </motion.div>
            
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-gray-800 mb-2 font-serif"
            >
                Registration Complete!
            </motion.h2>
            
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-600 mb-8 max-w-[250px]"
            >
                {isReceptionistMode 
                  ? <>Guest <span className="font-bold text-amber-600">{firstName}</span> added successfully.</>
                  : "Account created. Redirecting to login..."
                }
            </motion.p>
        </div>
      </Modal>
    );
  }

  // --- Main Form View ---
  return (
    <Modal
      title="" 
      onClose={handleClose}
      className="max-h-[90vh] w-full max-w-2xl flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-2xl p-0 border border-amber-100 dark:border-gray-800"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden relative">
        
      
        <div className="relative bg-gradient-to-r from-amber-600 to-amber-800 p-6 md:p-8 shrink-0">
          
            
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Sparkles size={100} className="text-white" />
            </div>
            
            <div className="relative z-10 flex items-center gap-6">
                <div className="relative group shrink-0">
                    <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl backdrop-blur-sm transition-all ${preview ? 'bg-black' : 'bg-white/10'}`}>
                        {preview ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-white/80">
                                <User size={32} />
                            </div>
                        )}
                    </div>
                    <label className="absolute bottom-0 right-0 p-2 bg-white text-amber-700 rounded-full shadow-lg cursor-pointer hover:bg-amber-50 hover:scale-110 transition-all z-20">
                        <Camera size={16} />
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                </div>

                <div className="text-white">
                    <h2 className="text-2xl font-bold font-serif tracking-wide">
                        {isReceptionistMode ? 'New Guest' : 'Create Account'}
                    </h2>
                    <p className="text-amber-100 text-sm opacity-90">
                        Please fill in the details below.
                    </p>
                </div>
            </div>
        </div>


        <div className="flex border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
            <button
                type="button"
                onClick={() => setActiveTab('personal')}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all relative ${
                    activeTab === 'personal' ? 'text-amber-600 bg-amber-50/50' : 'text-gray-400 hover:bg-gray-50'
                }`}
            >
                1. Personal Details
                {activeTab === 'personal' && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-amber-600" />
                )}
            </button>
            <button
                type="button"
                onClick={handleNextStep}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all relative ${
                    activeTab === 'address' ? 'text-amber-600 bg-amber-50/50' : 'text-gray-400 hover:bg-gray-50'
                }`}
            >
                2. Contact & Address
                {activeTab === 'address' && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-amber-600" />
                )}
            </button>
        </div>

       
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 bg-gray-50/30 dark:bg-gray-900 relative">
            <AnimatePresence mode="wait">
                {activeTab === 'personal' && (
                    <motion.div
                        key="personal"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-5"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div className="group">
                                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">First Name</label>
                                <input
                                    placeholder="Abebe"
                                    {...register('firstName')}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
                                />
                                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                            </div>
                            <div className="group">
                                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Last Name</label>
                                <input
                                    placeholder="Kebede"
                                    {...register('lastName')}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
                                />
                                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                            </div>
                        </div>

                        <div className="group relative">
                            <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Email Address</label>
                            <Mail className="absolute left-4 top-[2.1rem] text-gray-400" size={18} />
                            <input
                                type="email"
                                placeholder="guest@example.com"
                                {...register('email')}
                                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        <div className="group relative">
                            <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Password</label>
                            <Lock className="absolute left-4 top-[2.1rem] text-gray-400" size={18} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                {...register('password')}
                                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'address' && (
                    <motion.div
                        key="address"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-5"
                    >
                         <div className="group relative">
                            <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Phone Number</label>
                            <Phone className="absolute left-4 top-[2.1rem] text-gray-400" size={18} />
                            <input
                                type="tel"
                                placeholder="+251 911..."
                                {...register('phone')}
                                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Country</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3 text-gray-400" size={16} />
                                    <input
                                        value="Ethiopia"
                                        disabled
                                        {...register('country')}
                                        className="w-full pl-9 pr-3 py-3 bg-gray-100 text-gray-500 border border-gray-200 rounded-xl cursor-not-allowed text-sm font-medium"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">City</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-3 text-gray-400" size={16} />
                                    <input
                                        placeholder="Addis Ababa"
                                        {...register('city')}
                                        className="w-full pl-9 pr-3 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
                                    />
                                </div>
                                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Kebele / District</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                                <input
                                    placeholder="01"
                                    {...register('kebele')}
                                    className="w-full pl-9 pr-3 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

       
        <div className="shrink-0 p-5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center gap-4 z-20">
          
          <div className="flex items-center">
            {activeTab === 'address' ? (
                <button
                    type="button"
                    onClick={() => setActiveTab('personal')}
                    className="flex items-center gap-2 text-gray-500 font-bold hover:text-amber-600 transition px-2"
                >
                    <ArrowLeft size={18} /> Back
                </button>
            ) : (
                isReceptionistMode ? (
                    // --- RECEPTIONIST: Functional Cancel Button ---
                    <button 
                        type="button" 
                        onClick={(e) => {
                            e.preventDefault();
                            handleClose();
                        }}
                        className="text-gray-500 font-bold hover:text-red-500 transition px-2"
                    >
                        Cancel
                    </button>
                ) : (
                    // --- PUBLIC: Login Link ---
                    onSwitchToLogin && (
                        <button 
                            type="button" 
                            onClick={onSwitchToLogin} 
                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-amber-700 font-bold"
                        >
                             Already have an account? <span className="underline text-amber-600">Login</span>
                        </button>
                    )
                )
            )}
          </div>
          
          {activeTab === 'personal' ? (
             <button
                type="button"
                onClick={handleNextStep}
                className="px-8 py-3 bg-amber-100 text-amber-800 hover:bg-amber-200 font-bold rounded-xl transition flex items-center gap-2"
             >
                Next Step <ArrowRight size={18} />
             </button>
          ) : (
             <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-xl shadow-lg shadow-amber-600/20 transition-all flex items-center gap-2"
             >
                 {isSubmitting ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Registering...
                    </>
                 ) : (
                    <>Create Account <CheckCircle2 size={18} /></>
                 )}
             </motion.button>
          )}
        </div>
      </form>
    </Modal>
  );
}
*/



/*
// src/components/RegisterForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Upload, ArrowLeft } from 'lucide-react';
import BackButton from '@/app/manager/ui/BackButton';
const registerSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be 6+ chars'),
  phone: z.string().optional(),
  country: z.string().default('Ethiopia'),
  city: z.string().min(2, 'City required'),
  kebele: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onClose: () => void;
  forceRole?: 'customer';
}

export default function RegisterForm({ onClose, forceRole }: RegisterFormProps) {
  const [preview, setPreview] = useState('/default-avatar.png');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, value);
    });
    if (imageFile) formData.append('profileImage', imageFile);
    if (forceRole) formData.append('role', forceRole);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? 'Registration failed');
      alert('Guest registered successfully!');
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to register');
    }
  };

  return (
    <Modal
      title={forceRole ? 'Add New Guest' : 'Customer Registration'}
      onClose={onClose}
      className="mt-16 md:mt-20 max-h-[90vh] overflow-hidden"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 overflow-y-auto px-1 pb-20"
        style={{ maxHeight: 'calc(90vh - 140px)' }}
      >
        <div className="flex justify-center">
          <label className="relative cursor-pointer group">
            <img
              src={preview}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-300 shadow-md"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Upload className="text-white" size={24} />
            </div>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="First Name" placeholder="Abebe" {...register('firstName')} error={errors.firstName?.message} />
          <Input label="Last Name" placeholder="Kebede" {...register('lastName')} error={errors.lastName?.message} />
        </div>

        <Input label="Email" type="email" placeholder="abebe@meseret.com" {...register('email')} error={errors.email?.message} />
        <Input label="Password" type="password" placeholder="••••••••" {...register('password')} error={errors.password?.message} />
        <Input label="Phone (Optional)" type="tel" placeholder="+251911223344" {...register('phone')} error={errors.phone?.message} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Country" value="Ethiopia" disabled {...register('country')} />
          <Input label="City" placeholder="Addis Ababa" {...register('city')} error={errors.city?.message} />
          <Input label="Kebele (Optional)" placeholder="12" {...register('kebele')} error={errors.kebele?.message} />
        </div>
      </form>

      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 px-6 -mx-6 -mb-6 bg-gray-50 dark:bg-gray-800">
       <BackButton/>
        <Button type="submit" loading={isSubmitting} onClick={handleSubmit(onSubmit)} className="min-w-[140px]">
          {forceRole ? 'Add Guest' : 'Create Account'}
        </Button>
      </div>
    </Modal>
  );
}*/