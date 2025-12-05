'use client';

import { useState } from 'react';
import { Menu, X, LogIn, UserPlus, LogOut, Globe } from 'lucide-react';
import Link from 'next/link';
import LoginForm from './forms/LoginForm';
import RegisterForm from './forms/RegisterForm';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext'; // Import Hook

export default function Navbar() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage(); // Use Hook
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const languages = {
    en: { name: 'English', flag: 'GB' },
    am: { name: 'አማርኛ', flag: 'ET' }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl text-white border-b border-amber-600/20">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="text-3xl font-black tracking-wider">
            <span className="text-amber-400">Meseret</span> Hotel
          </Link>

          <div className="flex items-center gap-6">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-amber-600/20 to-orange-600/20 hover:from-amber-600/40 hover:to-orange-600/40 rounded-full border border-amber-500/50 transition-all"
              >
                <Globe size={20} className="text-amber-400" />
                <span className="font-medium text-amber-300">
                  {languages[language].name}
                </span>
              </button>

              {langOpen && (
                <div className="absolute top-full mt-3 right-0 w-48 bg-black/95 border-2 border-amber-600/50 rounded-2xl shadow-2xl overflow-hidden z-50">
                  {Object.entries(languages).map(([code, lang]) => (
                    <button
                      key={code}
                      onClick={() => {
                        setLanguage(code as 'en' | 'am');
                        setLangOpen(false);
                      }}
                      className={`w-full px-5 py-4 flex items-center justify-between hover:bg-amber-600/30 transition-all ${
                        language === code ? 'bg-amber-600/40' : ''
                      }`}
                    >
                      <span className="font-medium text-lg">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            {user ? (
              <div className="hidden md:flex items-center gap-4">
                <span className="font-medium text-amber-300">{user.firstName}</span>
                <button onClick={logout} className="flex items-center gap-2 px-5 py-3 bg-red-600/80 rounded-full hover:bg-red-700 transition">
                  <LogOut size={18} /> {t('logout')}
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <button onClick={() => setShowLogin(true)} className="flex items-center gap-2 px-6 py-3 border-2 border-amber-500 rounded-full hover:bg-amber-500/20 transition">
                  <LogIn size={18} /> {t('login')}
                </button>
                <button onClick={() => setShowRegister(true)} className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full hover:shadow-2xl transition">
                  <UserPlus size={20} /> {t('register')}
                </button>
              </div>
            )}
            
            {/* Mobile Toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden">
              {mobileOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>
      {/* ... rest of modals ... */}
      {showLogin && <LoginForm onClose={() => setShowLogin(false)} onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }} />}
      {showRegister && <RegisterForm onClose={() => setShowRegister(false)} onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }} />}
    </>
  );
}
/*'use client';
import { Button, Modal } from 'react-native';

import { useState } from 'react';
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