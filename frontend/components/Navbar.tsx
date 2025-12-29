'use client';
import { useState } from 'react';
import { Menu, X, LogIn, UserPlus, LogOut, Globe, Info, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import HotelLogo from './HotelLogo';
import LoginForm from './forms/LoginForm';
import RegisterForm from './forms/RegisterForm';
import AboutModal from './AboutModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  
  // UI States
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const languages = {
    en: { name: 'English', flag: 'EN' },
    am: { name: 'አማርኛ', flag: 'AM' }
  };

  const handleLanguageSelect = (code: 'en' | 'am') => {
    setLanguage(code);
    setLangOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0  left-0 right-0 z-[40] bg-black/80 backdrop-blur-xl border-b border-amber-600/20 shadow-2xl transition-all duration-300 mb-20">
        <div className="container mx-auto flex items-center justify-between px-6 py-3 lg:py-4">
          
          {/* 1. LOGO */}
          <HotelLogo className="scale-90 lg:scale-100 origin-left" />

          {/* 2. DESKTOP NAVIGATION */}
          <div className="hidden lg:flex items-center gap-8">
            
            {/* About Link */}
            <button 
              onClick={() => setShowAbout(true)} 
              className="flex items-center gap-2 text-sm font-bold text-amber-100 hover:text-amber-400 transition-all group"
            >
              <Info size={18} className="text-amber-500 group-hover:rotate-12 transition-transform" /> 
              {t('about' as any) || 'About Hotel'}
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all text-sm font-semibold"
              >
                <Globe size={16} className="text-amber-500" />
                {languages[language].name}
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full mt-2 right-0 w-32 bg-gray-900 border border-amber-500/30 rounded-xl shadow-2xl overflow-hidden overflow-y-hidden"
                  >
                    {Object.entries(languages).map(([code, lang]) => (
                      <button
                        key={code}
                        onClick={() => handleLanguageSelect(code as 'en' | 'am')}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-amber-600/20 transition-colors ${language === code ? 'text-amber-400 font-bold' : 'text-white'}`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Auth Actions */}
            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center font-bold text-xs">
                      {user.firstName[0]}
                    </div>
                    <span className="text-sm font-bold text-amber-50">{user.firstName}</span>
                  </div>
                  <button 
                    onClick={logout} 
                    className="flex items-center gap-2 px-5 py-2 bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold rounded-full transition-all shadow-lg"
                  >
                    <LogOut size={14} /> {t('logout' as any) || 'Logout'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowLogin(true)} 
                    className="text-sm font-bold text-white hover:text-amber-400 transition-colors"
                  >
                    {t('login' as any)}
                  </button>
                  <button 
                    onClick={() => setShowRegister(true)} 
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-bold rounded-full shadow-lg hover:shadow-amber-600/30 transition-all transform hover:scale-105"
                  >
                    {t('register' as any)}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 3. MOBILE TOGGLE */}
          <div className="lg:hidden flex items-center gap-4">
            <button 
               onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
               className="text-xs font-black text-amber-500 border border-amber-500/50 px-2 py-1 rounded"
            >
              {language.toUpperCase()}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="text-amber-500 p-1">
              {mobileOpen ? <X size={32} /> : <Menu size={32} />}
            </button>
          </div>
        </div>

        {/* 4. MOBILE MENU OVERLAY */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-gray-950 border-t border-white/5 overflow-hidden shadow-2xl"
            >
              <div className="flex flex-col p-6 gap-6">
                <button 
                  onClick={() => { setShowAbout(true); setMobileOpen(false); }}
                  className="flex items-center gap-3 text-lg font-bold text-amber-100"
                >
                  <Info size={24} className="text-amber-500" /> {t('about' as any) || 'About Hotel'}
                </button>
                
                <div className="h-px bg-white/5" />

                {user ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                       <User className="text-amber-500" />
                       <span className="text-xl font-bold text-white">{user.firstName} {user.lastName}</span>
                    </div>
                    <button onClick={logout} className="w-full py-4 bg-red-600 rounded-2xl font-bold flex items-center justify-center gap-2">
                      <LogOut size={20} /> {t('logout' as any)}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <button onClick={() => { setShowLogin(true); setMobileOpen(false); }} className="w-full py-4 border-2 border-amber-600 rounded-2xl font-bold text-amber-500">
                      {t('login' as any)}
                    </button>
                    <button onClick={() => { setShowRegister(true); setMobileOpen(false); }} className="w-full py-4 bg-amber-600 rounded-2xl font-bold text-white">
                      {t('register' as any)}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 5. MODAL TRIGGERS */}
      <AnimatePresence>
        {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
        
        {showLogin && (
          <LoginForm 
            onClose={() => setShowLogin(false)} 
            onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }} 
          />
        )}
        
        {showRegister && (
          <RegisterForm 
            onClose={() => setShowRegister(false)} 
            onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }} 
          />
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from hiding under sticky nav */}
      <div className="h-[72px] lg:h-[88px]" />
    </>
  );
}
/*'use client';

import { Menu, X, LogIn, UserPlus, LogOut, Globe } from 'lucide-react';
import Link from 'next/link';
import LoginForm from './forms/LoginForm';
import RegisterForm from './forms/RegisterForm';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'am'>('en');

  const languages = {
    en: { name: 'English', flag: 'GB' },
    am: { name: 'አማርኛ', flag: 'ET' }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl text-white border-b border-amber-600/20">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo /}
          <Link href="/" className="text-3xl font-black tracking-wider">
            <span className="text-amber-400">Meseret</span> Hotel
          </Link>

          <div className="flex items-center gap-6">
            {/* Language Selector - 
            Royal Golden Dropdown /}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-amber-600/20 to-orange-600/20 hover:from-amber-600/40 hover:to-orange-600/40 rounded-full border border-amber-500/50 backdrop-blur-sm transition-all duration-300 group"
              >
                <Globe size={20} className="text-amber-400 group-hover:rotate-12 transition-transform" />
                <span className="font-medium text-amber-300">
                  {languages[language].name}
                </span>
                <div className="w-6 h-4 rounded-sm overflow-hidden border border-amber-600">
                  <div className="w-full h-full bg-gradient-to-br from-green-500 via-yellow-400 to-red-500" />
                </div>
              </button>

              {/* Dropdown /}
              {langOpen && (
                <div className="absolute top-full mt-3 right-0 w-48 bg-black/95 backdrop-blur-2xl border-2 border-amber-600/50 rounded-2xl shadow-2xl overflow-hidden">
                  {Object.entries(languages).map(([code, lang]) => (
                    <button
                      key={code}
                      onClick={() => {
                        setLanguage(code as 'en' | 'am');
                        setLangOpen(false);
                        // Here you would integrate i18n later
                        // For now, just visual change
                      }}
                      className={`w-full px-5 py-4 flex items-center justify-between hover:bg-amber-600/30 transition-all duration-300 ${
                        language === code ? 'bg-amber-600/40' : ''
                      }`}
                    >
                      <span className="font-medium text-lg">{lang.name}</span>
                      <div className="w-8 h-5 rounded border border-amber-500 overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-green-500 via-yellow-400 to-red-500" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Auth Buttons /}
            {user ? (
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={user.profileImage || '/default-avatar.png'}
                    alt="avatar"
                    className="w-10 h-10 rounded-full ring-2 ring-amber-500"
                  />
                  <span className="font-medium text-amber-300">{user.firstName}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-600 to-rose-700 rounded-full hover:shadow-xl hover:shadow-red-600/30 transition-all duration-300 font-medium"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <button
                  onClick={() => setShowLogin(true)}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-amber-500 rounded-full hover:bg-amber-500/20 transition-all duration-300 font-medium"
                >
                  <LogIn size={18} /> Login
                </button>
                <button
                  onClick={() => setShowRegister(true)}
                  className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full hover:shadow-2xl hover:shadow-amber-600/50 transition-all duration-300 font-bold text-lg"
                >
                  <UserPlus size={20} /> Register
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle /}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden"
            >
              {mobileOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu /}
        {mobileOpen && !user && (
          <div className="md:hidden border-t border-amber-600/30 bg-black/95 backdrop-blur-xl">
            <div className="container mx-auto px-6 py-6 space-y-4">
              <button
                onClick={() => { setShowLogin(true); setMobileOpen(false); }}
                className="w-full text-left py-4 px-6 bg-amber-600/20 rounded-xl hover:bg-amber-600/40 transition"
              >
                Login
              </button>
              <button
                onClick={() => { setShowRegister(true); setMobileOpen(false); }}
                className="w-full text-left py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl hover:shadow-xl transition"
              >
                Register
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Click Outside to Close 
      Language Dropdown /}
      {langOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setLangOpen(false)}
        />
      )}

      {/* Modals /}
      {showLogin && <LoginForm onClose={() => setShowLogin(false)} />}
      {showRegister && <RegisterForm onClose={() => setShowRegister(false)} />}
    </>
  );
}*/