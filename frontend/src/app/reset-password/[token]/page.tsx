'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Schema for password reset
const resetSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetFormData = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token;
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mesertehotelinformationmanagementsystem.onrender.com';
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    try {
      await axios.put(`${API_URL}/api/auth/resetpassword/${token}`, {
        password: data.password,
      });
      setStatus('success');
      setMessage('Password has been successfully reset!');
      setTimeout(() => {
        router.push('/'); // Redirect to home/login
      }, 3000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Invalid or expired token.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-amber-600 to-amber-800 p-8 text-center">
            <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm mb-4 border border-white/30 shadow-lg">
                <Lock className="text-white w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Reset Password</h2>
            <p className="text-amber-100 text-sm mt-2">Create a new strong password</p>
        </div>

        <div className="p-8">
          {status === 'success' ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Success!</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {status === 'error' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                  <AlertCircle size={20} />
                  <p className="text-sm font-medium">{message}</p>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-amber-600 transition-colors" size={20} />
                  <input
                    type="password"
                    placeholder="New password"
                    {...register('password')}
                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 ${errors.password ? 'border-red-400' : 'border-gray-100 dark:border-gray-600'} rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all`}
                  />
                </div>
                {errors.password && <p className="text-red-500 text-xs ml-1">{errors.password.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-amber-600 transition-colors" size={20} />
                  <input
                    type="password"
                    placeholder="Confirm password"
                    {...register('confirmPassword')}
                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 ${errors.confirmPassword ? 'border-red-400' : 'border-gray-100 dark:border-gray-600'} rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all`}
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs ml-1">{errors.confirmPassword.message}</p>}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl shadow-lg shadow-amber-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Resetting...' : 'Update Password'}
              </motion.button>
              
              <div className="text-center">
                 <Link href="/" className="text-sm text-gray-500 hover:text-amber-600">Cancel</Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}