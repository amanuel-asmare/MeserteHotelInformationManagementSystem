'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, Facebook, Github, Chrome, ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Modal } from '../ui/Modal';
import axios from 'axios';

// --- Login Schema ---
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// --- Forgot Password Schema ---
const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type ForgotFormData = z.infer<typeof forgotSchema>;

interface LoginFormProps {
  onClose: () => void;
  onSwitch?: () => void;
  onSwitchToRegister?: () => void;
}

export default function LoginForm({ onClose, onSwitch, onSwitchToRegister }: LoginFormProps) {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [view, setView] = useState<'login' | 'forgot'>('login');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mesertehotelinformationmanagementsystem.onrender.com';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    formState: { errors: errorsForgot, isSubmitting: isSubmittingForgot },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setGlobalError(null);
    try {
      await login(data.email, data.password);
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Login failed';
      if (msg.includes('deactivated')) {
        setGlobalError('Your account is deactivated. Please contact admin.');
      } else {
        setGlobalError('Invalid email or password.');
      }
    }
  };

  const onForgotSubmit = async (data: ForgotFormData) => {
    setGlobalError(null);
    setGlobalSuccess(null);
    try {
      await axios.post(`${API_URL}/api/auth/forgotpassword`, { email: data.email });
      let message = t('emailSentMessage') || `Reset link sent to {email}.`;
      message = message.replace('{email}', data.email);
      setGlobalSuccess(message);
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'Failed to send email.');
    }
  };

  const handleSwitch = onSwitch || onSwitchToRegister;

  const handleSocialLogin = (provider: string) => {
    window.location.href = `${API_URL}/api/auth/${provider}`;
  };

  return (
    <Modal title="" onClose={onClose}>
      {/* 
        FIXED CONTAINER STYLES:
        1. z-[70] to stay above navbar
        2. relative + flex flex-col for proper layout
        3. custom-scrollbar for attractive UI
      */}
      <div className="relative z-[70] w-full max-w-md mx-auto my-4 overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 max-h-[calc(100vh-60px)] flex flex-col">
        
        {/* Header - Made Sticky and shrink-0 */}
        <div className="sticky top-0 z-30 bg-gradient-to-r from-amber-600 to-amber-800 p-8 text-center relative overflow-hidden shrink-0 shadow-lg transition-all duration-500">
          <motion.div
            key={view}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm mb-4 border border-white/30 shadow-lg">
              {view === 'login' ? <LogIn className="text-white w-8 h-8" /> : <Mail className="text-white w-8 h-8" />}
            </div>
            <h2 className="text-3xl font-bold text-white tracking-wide font-serif">
              {view === 'login' ? t('welcomeBack') : t('recoverAccount')} 
            </h2>
            <p className="text-amber-100 mt-2 text-sm">
              {view === 'login' ? t('signInAccessDashboard') : t('enterEmailReset')}
            </p>
          </motion.div>
          <div className="absolute top-[-50%] left-[-20%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-40 h-40 bg-amber-400/20 rounded-full blur-2xl"></div>
        </div>

        {/* Form Body - Made Scrollable */}
        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {view === 'login' && (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                onSubmit={handleSubmit(onSubmit)} 
                className="space-y-6"
              >
                {globalError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                    {globalError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">{t('email')}</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-amber-600 transition-colors" size={20} />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      {...register('email')}
                      className={`w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 ${errors.email ? 'border-red-400' : 'border-gray-100 dark:border-gray-700'} rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email.message}</p>}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t('password')}</label>
                    <button type="button" onClick={() => setView('forgot')} className="text-xs text-amber-600 hover:underline">
                      {t('forgotPassword' as any) || "Forgot password?"}
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-amber-600 transition-colors" size={20} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      {...register('password')}
                      className={`w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 ${errors.password ? 'border-red-400' : 'border-gray-100 dark:border-gray-700'} rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all`}
                    />
                  </div>
                  {errors.password && <p className="text-red-500 text-xs ml-1">{errors.password.message}</p>}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-2xl shadow-lg shadow-amber-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : t('login')}
                </motion.button>

                {handleSwitch && (
                  <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                    {t('dontHaveAccount')} <button type="button" onClick={handleSwitch} className="text-amber-600 hover:underline font-semibold">{t('register')}</button>
                  </div>
                )}

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700"></div></div>
                  <div className="relative flex justify-center text-sm"><span className="px-3 bg-white dark:bg-gray-900 text-gray-500">{t('orContinueWith')}</span></div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button type="button" onClick={() => handleSocialLogin('google')} className="flex items-center justify-center py-2.5 border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <Chrome className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                  <button type="button" onClick={() => handleSocialLogin('facebook')} className="flex items-center justify-center py-2.5 border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <Facebook className="w-5 h-5 text-blue-600" />
                  </button>
                  <button type="button" onClick={() => handleSocialLogin('github')} className="flex items-center justify-center py-2.5 border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <Github className="w-5 h-5 text-gray-900 dark:text-white" />
                  </button>
                </div>
              </motion.form>
            )}

            {view === 'forgot' && (
              <motion.form
                key="forgot-form"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                onSubmit={handleSubmitForgot(onForgotSubmit)} 
                className="space-y-6"
              >
                {globalSuccess ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-center">
                      <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                          <Send className="text-green-600 w-6 h-6" />
                      </div>
                      <h3 className="text-green-800 font-bold mb-1">{t('emailSentTitle')}</h3>
                      <p className="text-green-600 text-sm">{globalSuccess}</p>
                      <button 
                          type="button" 
                          onClick={() => setView('login')}
                          className="mt-4 text-sm font-semibold text-green-700 hover:underline"
                      >
                          {t('backToLogin')}
                      </button>
                  </div>
                ) : (
                  <>
                      {globalError && (
                          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                          {globalError}
                          </div>
                      )}
                      <div className="space-y-1">
                          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">{t('registeredEmail')}</label>
                          <div className="relative group">
                          <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-amber-600 transition-colors" size={20} />
                          <input
                              type="email"
                              placeholder="name@example.com"
                              {...registerForgot('email')}
                              className={`w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 ${errorsForgot.email ? 'border-red-400' : 'border-gray-100 dark:border-gray-700'} rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all`}
                          />
                          </div>
                          {errorsForgot.email && <p className="text-red-500 text-xs ml-1">{errorsForgot.email.message}</p>}
                      </div>

                      <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={isSubmittingForgot}
                          className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-2xl shadow-lg shadow-amber-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                          {isSubmittingForgot ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : t('sendResetLink')}
                      </motion.button>

                      <button 
                          type="button" 
                          onClick={() => setView('login')}
                          className="w-full py-3 border-2 border-gray-100 dark:border-gray-700 rounded-2xl text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center justify-center gap-2"
                      >
                          <ArrowLeft size={18} /> {t('backToLogin')}
                      </button>
                  </>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
}/*'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, Facebook, Github, Chrome, ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../ui/Modal';
import axios from 'axios';

// --- Login Schema ---
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// --- Forgot Password Schema ---
const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type ForgotFormData = z.infer<typeof forgotSchema>;

interface LoginFormProps {
  onClose: () => void;
  onSwitch?: () => void;
  onSwitchToRegister?: () => void;
}

export default function LoginForm({ onClose, onSwitch, onSwitchToRegister }: LoginFormProps) {
  const { login } = useAuth();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [view, setView] = useState<'login' | 'forgot'>('login');

  // const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mesertehotelinformationmanagementsystem.onrender.com';
   

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    formState: { errors: errorsForgot, isSubmitting: isSubmittingForgot },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setGlobalError(null);
    try {
      await login(data.email, data.password);
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Login failed';
      if (msg.includes('deactivated')) {
        setGlobalError('Your account is deactivated. Please contact admin.');
      } else {
        setGlobalError('Invalid email or password.');
      }
    }
  };

  const onForgotSubmit = async (data: ForgotFormData) => {
    setGlobalError(null);
    setGlobalSuccess(null);
    try {
      await axios.post(`${API_URL}/api/auth/forgotpassword`, { email: data.email });
      setGlobalSuccess(`Reset link sent to ${data.email}. Check your inbox!`);
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'Failed to send email.');
    }
  };

  const handleSwitch = onSwitch || onSwitchToRegister;

  // --- SOCIAL LOGIN HANDLERS ---
  const handleSocialLogin = (provider: string) => {
    // Redirects browser to backend route which initiates OAuth
    window.location.href = `${API_URL}/api/auth/${provider}`;
  };

  return (
    <Modal title="" onClose={onClose}>
      <div className="max-w-md w-full mx-auto overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-xl min-h-[500px]">
        <div className="flex flex-col h-full">
          
         
          <div className="bg-gradient-to-r from-amber-600 to-amber-800 p-8 text-center relative overflow-hidden transition-all duration-500">
            <motion.div
              key={view}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative z-10"
            >
              <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm mb-4 border border-white/30 shadow-lg">
                {view === 'login' ? <LogIn className="text-white w-8 h-8" /> : <Mail className="text-white w-8 h-8" />}
              </div>
              <h2 className="text-3xl font-bold text-white tracking-wide font-serif">
                {view === 'login' ? 'Welcome Back' : 'Recover Account'}
              </h2>
              <p className="text-amber-100 mt-2 text-sm">
                {view === 'login' ? 'Sign in to access your dashboard' : 'Enter your email to reset password'}
              </p>
            </motion.div>
            
            <div className="absolute top-[-50%] left-[-20%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-20%] right-[-20%] w-40 h-40 bg-amber-400/20 rounded-full blur-2xl"></div>
          </div>

          <div className="p-8 flex-1">
            <AnimatePresence mode="wait">
              {view === 'login' && (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  onSubmit={handleSubmit(onSubmit)} 
                  className="space-y-6"
                >
                  {globalError && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                      {globalError}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-amber-600 transition-colors" size={20} />
                      <input
                        type="email"
                        placeholder="name@example.com"
                        {...register('email')}
                        className={`w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 ${errors.email ? 'border-red-400' : 'border-gray-100 dark:border-gray-700'} rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all`}
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Password</label>
                      <button type="button" onClick={() => setView('forgot')} className="text-xs text-amber-600 hover:underline">
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-amber-600 transition-colors" size={20} />
                      <input
                        type="password"
                        placeholder="••••••••"
                        {...register('password')}
                        className={`w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 ${errors.password ? 'border-red-400' : 'border-gray-100 dark:border-gray-700'} rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all`}
                      />
                    </div>
                    {errors.password && <p className="text-red-500 text-xs ml-1">{errors.password.message}</p>}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-2xl shadow-lg shadow-amber-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In'}
                  </motion.button>

                  {handleSwitch && (
                    <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                      Don't have an account? <button type="button" onClick={handleSwitch} className="text-amber-600 hover:underline font-semibold">Sign up</button>
                    </div>
                  )}

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-3 bg-white dark:bg-gray-900 text-gray-500">Or continue with</span></div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button type="button" onClick={() => handleSocialLogin('google')} className="flex items-center justify-center py-2.5 border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <Chrome className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <button type="button" onClick={() => handleSocialLogin('facebook')} className="flex items-center justify-center py-2.5 border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <Facebook className="w-5 h-5 text-blue-600" />
                    </button>
                    <button type="button" onClick={() => handleSocialLogin('github')} className="flex items-center justify-center py-2.5 border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <Github className="w-5 h-5 text-gray-900 dark:text-white" />
                    </button>
                  </div>
                </motion.form>
              )}

              {view === 'forgot' && (
                <motion.form
                  key="forgot-form"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  onSubmit={handleSubmitForgot(onForgotSubmit)} 
                  className="space-y-6"
                >
                  {globalSuccess ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-center">
                        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                            <Send className="text-green-600 w-6 h-6" />
                        </div>
                        <h3 className="text-green-800 font-bold mb-1">Email Sent!</h3>
                        <p className="text-green-600 text-sm">{globalSuccess}</p>
                        <button 
                            type="button" 
                            onClick={() => setView('login')}
                            className="mt-4 text-sm font-semibold text-green-700 hover:underline"
                        >
                            Back to Login
                        </button>
                    </div>
                  ) : (
                    <>
                        {globalError && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                            {globalError}
                            </div>
                        )}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">Registered Email</label>
                            <div className="relative group">
                            <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-amber-600 transition-colors" size={20} />
                            <input
                                type="email"
                                placeholder="name@example.com"
                                {...registerForgot('email')}
                                className={`w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 ${errorsForgot.email ? 'border-red-400' : 'border-gray-100 dark:border-gray-700'} rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all`}
                            />
                            </div>
                            {errorsForgot.email && <p className="text-red-500 text-xs ml-1">{errorsForgot.email.message}</p>}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isSubmittingForgot}
                            className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-2xl shadow-lg shadow-amber-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmittingForgot ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Reset Link'}
                        </motion.button>

                        <button 
                            type="button" 
                            onClick={() => setView('login')}
                            className="w-full py-3 border-2 border-gray-100 dark:border-gray-700 rounded-2xl text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={18} /> Back to Login
                        </button>
                    </>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Modal>
  );
}*/
  
/*'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, Facebook, Github, Chrome, ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../ui/Modal';
import axios from 'axios';

// --- Login Schema ---
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// --- Forgot Password Schema ---
const forgotSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type ForgotFormData = z.infer<typeof forgotSchema>;

interface LoginFormProps {
  onClose: () => void;
  onSwitch?: () => void;
  onSwitchToRegister?: () => void;
}

export default function LoginForm({ onClose, onSwitch, onSwitchToRegister }: LoginFormProps) {
  const { login } = useAuth();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [view, setView] = useState<'login' | 'forgot'>('login'); // Toggle views

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // --- Login Form Hooks ---
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // --- Forgot Form Hooks ---
  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    formState: { errors: errorsForgot, isSubmitting: isSubmittingForgot },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  // Login Handler
  const onSubmit = async (data: LoginFormData) => {
    setGlobalError(null);
    try {
      await login(data.email, data.password);
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Login failed';
      if (msg.includes('deactivated')) {
        setGlobalError('Your account is deactivated. Please contact admin.');
      } else {
        setGlobalError('Invalid email or password.');
      }
    }
  };

  // Forgot Password Handler
  const onForgotSubmit = async (data: ForgotFormData) => {
    setGlobalError(null);
    setGlobalSuccess(null);
    try {
      await axios.post(`${API_URL}/api/auth/forgotpassword`, { email: data.email });
      setGlobalSuccess(`Reset link sent to ${data.email}. Check your inbox!`);
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'Failed to send email.');
    }
  };

  const handleSwitch = onSwitch || onSwitchToRegister;

  return (
    <Modal title="" onClose={onClose}>
      <div className="max-w-md w-full mx-auto overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-xl min-h-[500px]">
        <div className="flex flex-col h-full">
          
         
          <div className="bg-gradient-to-r from-amber-600 to-amber-800 p-8 text-center relative overflow-hidden transition-all duration-500">
            <motion.div
              key={view}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative z-10"
            >
              <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm mb-4 border border-white/30 shadow-lg">
                {view === 'login' ? <LogIn className="text-white w-8 h-8" /> : <Mail className="text-white w-8 h-8" />}
              </div>
              <h2 className="text-3xl font-bold text-white tracking-wide font-serif">
                {view === 'login' ? 'Welcome Back' : 'Recover Account'}
              </h2>
              <p className="text-amber-100 mt-2 text-sm">
                {view === 'login' ? 'Sign in to access your dashboard' : 'Enter your email to reset password'}
              </p>
            </motion.div>
            
            <div className="absolute top-[-50%] left-[-20%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-20%] right-[-20%] w-40 h-40 bg-amber-400/20 rounded-full blur-2xl"></div>
          </div>

          
          <div className="p-8 flex-1">
            <AnimatePresence mode="wait">
              
            
              {view === 'login' && (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  onSubmit={handleSubmit(onSubmit)} 
                  className="space-y-6"
                >
                  {globalError && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                      {globalError}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-amber-600 transition-colors" size={20} />
                      <input
                        type="email"
                        placeholder="name@example.com"
                        {...register('email')}
                        className={`w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 ${errors.email ? 'border-red-400' : 'border-gray-100 dark:border-gray-700'} rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all`}
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Password</label>
                      <button type="button" onClick={() => setView('forgot')} className="text-xs text-amber-600 hover:underline">
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-amber-600 transition-colors" size={20} />
                      <input
                        type="password"
                        placeholder="••••••••"
                        {...register('password')}
                        className={`w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 ${errors.password ? 'border-red-400' : 'border-gray-100 dark:border-gray-700'} rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all`}
                      />
                    </div>
                    {errors.password && <p className="text-red-500 text-xs ml-1">{errors.password.message}</p>}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-2xl shadow-lg shadow-amber-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In'}
                  </motion.button>

                  {handleSwitch && (
                    <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                      Don't have an account? <button type="button" onClick={handleSwitch} className="text-amber-600 hover:underline font-semibold">Sign up</button>
                    </div>
                  )}

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-3 bg-white dark:bg-gray-900 text-gray-500">Or continue with</span></div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button type="button" className="flex items-center justify-center py-2.5 border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition"><Chrome className="w-5 h-5 text-gray-600 dark:text-gray-300" /></button>
                    <button type="button" className="flex items-center justify-center py-2.5 border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition"><Facebook className="w-5 h-5 text-blue-600" /></button>
                    <button type="button" className="flex items-center justify-center py-2.5 border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition"><Github className="w-5 h-5 text-gray-900 dark:text-white" /></button>
                  </div>
                </motion.form>
              )}

              
              {view === 'forgot' && (
                <motion.form
                  key="forgot-form"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  onSubmit={handleSubmitForgot(onForgotSubmit)} 
                  className="space-y-6"
                >
                  {globalSuccess ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-center">
                        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                            <Send className="text-green-600 w-6 h-6" />
                        </div>
                        <h3 className="text-green-800 font-bold mb-1">Email Sent!</h3>
                        <p className="text-green-600 text-sm">{globalSuccess}</p>
                        <button 
                            type="button" 
                            onClick={() => setView('login')}
                            className="mt-4 text-sm font-semibold text-green-700 hover:underline"
                        >
                            Back to Login
                        </button>
                    </div>
                  ) : (
                    <>
                        {globalError && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                            {globalError}
                            </div>
                        )}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">Registered Email</label>
                            <div className="relative group">
                            <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-amber-600 transition-colors" size={20} />
                            <input
                                type="email"
                                placeholder="name@example.com"
                                {...registerForgot('email')}
                                className={`w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 ${errorsForgot.email ? 'border-red-400' : 'border-gray-100 dark:border-gray-700'} rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all`}
                            />
                            </div>
                            {errorsForgot.email && <p className="text-red-500 text-xs ml-1">{errorsForgot.email.message}</p>}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isSubmittingForgot}
                            className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-2xl shadow-lg shadow-amber-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmittingForgot ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Reset Link'}
                        </motion.button>

                        <button 
                            type="button" 
                            onClick={() => setView('login')}
                            className="w-full py-3 border-2 border-gray-100 dark:border-gray-700 rounded-2xl text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={18} /> Back to Login
                        </button>
                    </>
                  )}
                </motion.form>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </Modal>
  );
}

*/

/*'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Facebook, Github, Chrome } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../ui/Modal';

// --- Schema ---
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onClose: () => void;
  onSwitch?: () => void; // Fixed prop name to match AuthModal usage
  onSwitchToRegister?: () => void; // Kept for compatibility if used elsewhere
}

export default function LoginForm({ onClose, onSwitch, onSwitchToRegister }: LoginFormProps) {
  const { login } = useAuth();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setGlobalError(null);
    try {
      await login(data.email, data.password);
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Login failed';
      if (msg.includes('deactivated')) {
        setGlobalError('Your account is deactivated. Please contact admin.');
      } else {
        setGlobalError('Invalid email or password.');
      }
    }
  };

  const handleSwitch = onSwitch || onSwitchToRegister;

  return (
    <Modal 
      title="" // We create a custom header inside for better visuals
      onClose={onClose} 
      // Removed className prop to fix build error
    >
     
      <div className="max-w-md w-full mx-auto overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-xl">
        <div className="flex flex-col">
         
          <div className="bg-gradient-to-r from-amber-600 to-amber-800 p-8 text-center relative overflow-hidden">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              transition={{ duration: 0.5 }}
              className="relative z-10"
            >
              <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm mb-4 border border-white/30 shadow-lg">
                <LogIn className="text-white w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-white tracking-wide font-serif">Welcome Back</h2>
              <p className="text-amber-100 mt-2 text-sm">Sign in to access your dashboard</p>
            </motion.div>
            
          
            <div className="absolute top-[-50%] left-[-20%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-20%] right-[-20%] w-40 h-40 bg-amber-400/20 rounded-full blur-2xl"></div>
          </div>

        
          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {globalError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center"
                >
                  {globalError}
                </motion.div>
              )}

            
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-amber-600 transition-colors" size={20} />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    {...register('email')}
                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 ${errors.email ? 'border-red-400' : 'border-gray-100 dark:border-gray-700'} rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email.message}</p>}
              </div>

            
              <div className="space-y-1">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Password</label>
                  <a href="#" className="text-xs text-amber-600 hover:underline">Forgot password?</a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-amber-600 transition-colors" size={20} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...register('password')}
                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 ${errors.password ? 'border-red-400' : 'border-gray-100 dark:border-gray-700'} rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all`}
                  />
                </div>
                {errors.password && <p className="text-red-500 text-xs ml-1">{errors.password.message}</p>}
              </div>

             
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-2xl shadow-lg shadow-amber-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Sign In'
                )}
              </motion.button>

              
              {handleSwitch && (
                <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <button type="button" onClick={handleSwitch} className="text-amber-600 hover:underline font-semibold">
                    Sign up
                  </button>
                </div>
              )}

              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white dark:bg-gray-900 text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button type="button" className="flex items-center justify-center py-2.5 border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <Chrome className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <button type="button" className="flex items-center justify-center py-2.5 border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <Facebook className="w-5 h-5 text-blue-600" />
                </button>
                <button type="button" className="flex items-center justify-center py-2.5 border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <Github className="w-5 h-5 text-gray-900 dark:text-white" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Modal>
  );
}*/





/*'use client';
import { Alert } from 'react-native';

import { useState } from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Facebook, Github, Chrome } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../ui/Modal';

// --- Schema ---
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onClose: () => void;
  onSwitchToRegister?: () => void; // Optional: to switch modes
}

export default function LoginForm({ onClose, onSwitchToRegister }: LoginFormProps) {
  const { login } = useAuth();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setGlobalError(null);
    try {
      await login(data.email, data.password);
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Login failed';
      if (msg.includes('deactivated')) {
        setGlobalError('Your account is deactivated. Please contact admin.');
      } else {
        setGlobalError('Invalid email or password.');
      }
    }
  };

  return (
    <Modal 
      title="" // We create a custom header inside for better visuals
      onClose={onClose} 
      className="max-w-md w-full p-0 overflow-hidden rounded-3xl"
    >
      <div className="flex flex-col">
      
        <div className="bg-gradient-to-r from-amber-600 to-amber-800 p-8 text-center relative overflow-hidden">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm mb-4 border border-white/30 shadow-lg">
              <LogIn className="text-white w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-wide font-serif">Welcome Back</h2>
            <p className="text-amber-100 mt-2 text-sm">Sign in to access your dashboard</p>
          </motion.div>
          
        
          <div className="absolute top-[-50%] left-[-20%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-40 h-40 bg-amber-400/20 rounded-full blur-2xl"></div>
        </div>

        
        <div className="p-8 bg-white dark:bg-gray-900">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            
            {globalError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center"
              >
                {globalError}
              </motion.div>
            )}

          
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-amber-600 transition-colors" size={20} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  {...register('email')}
                  className={`w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 ${errors.email ? 'border-red-400' : 'border-gray-100 dark:border-gray-700'} rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email.message}</p>}
            </div>

           
            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Password</label>
                <a href="#" className="text-xs text-amber-600 hover:underline">Forgot password?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-amber-600 transition-colors" size={20} />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 ${errors.password ? 'border-red-400' : 'border-gray-100 dark:border-gray-700'} rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all`}
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs ml-1">{errors.password.message}</p>}
            </div>

           
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold rounded-2xl shadow-lg shadow-amber-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </motion.button>

           
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white dark:bg-gray-900 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button type="button" className="flex items-center justify-center py-2.5 border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <Chrome className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button type="button" className="flex items-center justify-center py-2.5 border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <Facebook className="w-5 h-5 text-blue-600" />
              </button>
              <button type="button" className="flex items-center justify-center py-2.5 border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <Github className="w-5 h-5 text-gray-900 dark:text-white" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}*/
  
/*'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Facebook, Chrome } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password too short'),
});

type FormData = z.infer<typeof schema>;

export default function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log('Login:', data);
    // Your login logic
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-4xl font-black text-amber-400 tracking-wider">Login</h2>
        <p className="mt-3 text-amber-200">Access your royal account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-amber-300 mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-amber-500" size={20} />
            <input
              {...register('email')}
              type="email"
              placeholder="your@email.com"
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-amber-600/50 rounded-xl text-white placeholder-amber-300/50 focus:border-amber-400 focus:outline-none transition"
            />
          </div>
          {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-amber-300 mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-amber-500" size={20} />
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-amber-600/50 rounded-xl text-white placeholder-amber-300/50 focus:border-amber-400 focus:outline-none transition"
            />
          </div>
          {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xl rounded-xl shadow-xl hover:shadow-amber-600/50 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
        >
          <LogIn size={24} />
          {isSubmitting ? 'Logging in...' : 'Enter Palace'}
        </button>
      </form>

      <div className="text-center">
        <a href="#" className="text-amber-400 hover:text-amber-300 text-sm">Forgot password?</a>
      </div>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-amber-600/30"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-gradient-to-br from-amber-900 to-black text-amber-300">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button className="py-4 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center gap-3 text-white font-medium transition">
          <Facebook size={20} /> Facebook
        </button>
        <button className="py-4 bg-white hover:bg-gray-100 rounded-xl flex items-center justify-center gap-3 text-gray-800 font-medium transition">
          <Chrome size={20} /> Google
        </button>
      </div>
    </motion.div>
  );
}*/
/*'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password too short'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onClose: () => void;
}

export default function LoginForm({ onClose }: LoginFormProps) {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // src/components/LoginForm.tsx
const onSubmit = async (data: LoginFormData) => {
  try {
    await login(data.email, data.password);
    onClose();
  } catch (err: any) {
    const msg = err.message;
    if (msg.includes('deactivated')) {
      alert('Your account is deactivated. Please contact admin.');
    } else {
      alert(msg || 'Invalid credentials');
    }
  }
};

  return (
    <Modal title="Login" onClose={onClose} className="mt-20 md:mt-24">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="abebe@meseret.com"
          {...register('email')}
          error={errors.email?.message}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          error={errors.password?.message}
        />
        <Button type="submit" loading={isSubmitting} className="w-full">
          Login
        </Button>
      </form>
    </Modal>
  );
}*/
