'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, Phone, Lock, MapPin, Building, Globe, Camera, 
  ArrowRight, ArrowLeft, CheckCircle2, Sparkles, X
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Modal } from '../ui/Modal'; 

// --- Schema ---
const registerSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be 6+ chars'),
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
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'personal' | 'address'>('personal');
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSwitchToLogin = onSwitch || onSwitchToLogin;

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
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

  if (showSuccess) {
    return (
      <Modal title="" onClose={handleClose}>
        <div className="relative z-[70] max-w-md w-full p-0 overflow-hidden rounded-3xl bg-white border-0 shadow-2xl mx-auto my-auto">
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
                    {t('registrationComplete')}
                </motion.h2>
                
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-gray-600 mb-8 max-w-[250px]"
                >
                    {isReceptionistMode 
                    ? <>{t('guestAddedSuccess').replace('{name}', firstName)}</>
                    : t('accountCreatedRedirect')
                    }
                </motion.p>
            </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="" onClose={handleClose}>
     col
      <div className="relative z-[70] w-full max-w-2xl mx-auto my-4 overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-amber-100 dark:border-gray-800 max-h-[calc(100vh-60px)] flex flex-col">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex- h-full overflow-hidden relative">
            
       
            <div className="sticky top-0 z-30 bg-gradient-to-r from-amber-600 to-amber-800 p-6 md:p-8 shrink-0 shadow-lg transition-all">
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
                            {isReceptionistMode ? t('newGuest') : t('createAccount')}
                        </h2>
                        <p className="text-amber-100 text-sm opacity-90">
                            {t('fillDetailsBelow')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="sticky top-0 z-20 flex border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 shadow-sm">
                <button
                    type="button"
                    onClick={() => setActiveTab('personal')}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all relative ${
                        activeTab === 'personal' ? 'text-amber-600 bg-amber-50/50' : 'text-gray-400 hover:bg-gray-50'
                    }`}
                >
                    1. {t('personalDetails')}
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
                    2. {t('contactAddress')}
                    {activeTab === 'address' && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-amber-600" />
                    )}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 bg-gray-50/30 dark:bg-gray-900">
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
                                    <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">{t('firstName')}</label>
                                    <input
                                        placeholder={`${t('firstName')}...`}
                                        {...register('firstName')}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
                                    />
                                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                                </div>
                                <div className="group">
                                    <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">{t('lastName')}</label>
                                    <input
                                        placeholder={`${t('lastName')}...`}
                                        {...register('lastName')}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
                                    />
                                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                                </div>
                            </div>

                            <div className="group relative">
                                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">{t('email')}</label>
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
                                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">{t('password')}</label>
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
                                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">{t('phoneNumber')}</label>
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
                                    <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">{t('country')}</label>
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
                                    <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">{t('city')}</label>
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
                                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">{t('kebele')}</label>
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

       
            <div className="sticky bottom-0 z-30 p-5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center gap-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            
            <div className="flex items-center">
                {activeTab === 'address' ? (
                    <button
                        type="button"
                        onClick={() => setActiveTab('personal')}
                        className="flex items-center gap-2 text-gray-500 font-bold hover:text-amber-600 transition px-2"
                    >
                        <ArrowLeft size={18} /> {t('viewHistory')} 
                    </button>
                ) : (
                    isReceptionistMode ? (
                        <button 
                            type="button" 
                            onClick={(e) => {
                                e.preventDefault();
                                handleClose();
                            }}
                            className="text-gray-500 font-bold hover:text-red-500 transition px-2"
                        >
                            {t('cancel')}
                        </button>
                    ) : (
                        handleSwitchToLogin && (
                            <button 
                                type="button" 
                                onClick={handleSwitchToLogin} 
                                className="flex items-center gap-2 text-sm text-gray-500 hover:text-amber-700 font-bold"
                            >
                                {t('alreadyHaveAccount')} <span className="underline text-amber-600">{t('login')}</span>
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
                    {t('nextStep')} <ArrowRight size={18} />
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
                            {t('saving')}
                        </>
                    ) : (
                        <>{t('createAccount')} <CheckCircle2 size={18} /></>
                    )}
                </motion.button>
            )}
            </div>
        </form>
      </div>
    </Modal>
  );
}