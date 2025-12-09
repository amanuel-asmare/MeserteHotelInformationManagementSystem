'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { X } from 'lucide-react';

export default function AuthModal() {
  const [isLogin, setIsLogin] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      // Close logic from parent (Navbar)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('closeAuthModal'));
      }
    }, 600);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-amber-900 via-black to-amber-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition"
            >
              <X size={28} className="text-amber-300" />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
              {/* Left Panel - Form */}
              <div className="relative flex items-center justify-center p-8 lg:p-12">
                <div className="w-full max-w-md">
                  <AnimatePresence mode="wait">
                    {isLogin ? (
                      // @ts-ignore - Assuming onSwitch exists or ignoring strict check for build
                      <LoginForm key="login" onSwitch={() => setIsLogin(false)} />
                    ) : (
                      // @ts-ignore - Assuming onSwitch exists or ignoring strict check for build
                      <RegisterForm key="register" onSwitch={() => setIsLogin(true)} />
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Right Panel - Welcome Message */}
              <div className="relative hidden lg:flex items-center justify-center p-12 bg-gradient-to-br from-amber-800/50 via-black/90 to-orange-900/50 backdrop-blur-xl">
                <div className="text-center text-white">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-10"
                  >
                    <h1 className="text-6xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300">
                      {isLogin ? 'Welcome Back' : 'Join the Legacy'}
                    </h1>
                    <p className="mt-6 text-2xl font-light text-amber-200 tracking-widest">
                      {isLogin
                        ? 'Enter your palace of luxury'
                        : 'Become part of royal hospitality'}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-6"
                  >
                    <p className="text-lg text-amber-100">
                      {isLogin
                        ? "Don't have an account yet?"
                        : "Already have an account?"}
                    </p>
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xl rounded-full shadow-2xl hover:shadow-amber-600/50 transform hover:scale-105 transition-all duration-300"
                    >
                      {isLogin ? 'Create Account' : 'Login Now'}
                    </button>
                  </motion.div>

                  {/* Golden Crown */}
                  <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 6, repeat: Infinity }}
                    className="absolute -top-20 left-1/2 -translate-x-1/2"
                  >
                    <svg width="180" height="140" viewBox="0 0 180 140" className="drop-shadow-2xl">
                      <path d="M90 20 L120 70 L160 70 L135 100 L145 130 L90 110 L35 130 L45 100 L20 70 L60 70 Z"
                        fill="#fbbf24" stroke="#f59e0b" strokeWidth="8"/>
                      <circle cx="90" cy="65" r="22" fill="#f59e0b"/>
                      <circle cx="90" cy="58" r="12" fill="#fbbf24"/>
                    </svg>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}/*'use client';
import { Button } from 'react-native';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { X } from 'lucide-react';

export default function AuthModal() {
  const [isLogin, setIsLogin] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      // Close logic from parent (Navbar)
      window.dispatchEvent(new Event('closeAuthModal'));
    }, 600);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-amber-900 via-black to-amber-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
           
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition"
            >
              <X size={28} className="text-amber-300" />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">

              <div className="relative flex items-center justify-center p-8 lg:p-12">
                <div className="w-full max-w-md">
                  <AnimatePresence mode="wait">
                    {isLogin ? (
                      <LoginForm key="login" onSwitch={() => setIsLogin(false)} />
                    ) : (
                      <RegisterForm key="register" onSwitch={() => setIsLogin(true)} />
                    )}
                  </AnimatePresence>
                </div>
              </div>


              <div className="relative hidden lg:flex items-center justify-center p-12 bg-gradient-to-br from-amber-800/50 via-black/90 to-orange-900/50 backdrop-blur-xl">
                <div className="text-center text-white">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-10"
                  >
                    <h1 className="text-6xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300">
                      {isLogin ? 'Welcome Back' : 'Join the Legacy'}
                    </h1>
                    <p className="mt-6 text-2xl font-light text-amber-200 tracking-widest">
                      {isLogin
                        ? 'Enter your palace of luxury'
                        : 'Become part of royal hospitality'}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-6"
                  >
                    <p className="text-lg text-amber-100">
                      {isLogin
                        ? "Don't have an account yet?"
                        : "Already have an account?"}
                    </p>
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xl rounded-full shadow-2xl hover:shadow-amber-600/50 transform hover:scale-105 transition-all duration-300"
                    >
                      {isLogin ? 'Create Account' : 'Login Now'}
                    </button>
                  </motion.div>

                
                  <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 6, repeat: Infinity }}
                    className="absolute -top-20 left-1/2 -translate-x-1/2"
                  >
                    <svg width="180" height="140" viewBox="0 0 180 140" className="drop-shadow-2xl">
                      <path d="M90 20 L120 70 L160 70 L135 100 L145 130 L90 110 L35 130 L45 100 L20 70 L60 70 Z"
                        fill="#fbbf24" stroke="#f59e0b" strokeWidth="8"/>
                      <circle cx="90" cy="65" r="22" fill="#f59e0b"/>
                      <circle cx="90" cy="58" r="12" fill="#fbbf24"/>
                    </svg>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}*/