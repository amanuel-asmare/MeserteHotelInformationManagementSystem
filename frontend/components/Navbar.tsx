'use client';

import { useState } from 'react';
import { Menu, X, LogIn, UserPlus, LogOut } from 'lucide-react';
import Link from 'next/link';
import LoginForm from './forms/LoginForm';
import RegisterForm from './forms/RegisterForm';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Meseret Hotel
          </Link>

          {/* ---------- LOGGED IN ---------- */}
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img
                  src={user.profileImage || '/default-avatar.png'}
                  alt="avatar"
                  className="w-8 h-8 rounded-full"
                />
                <span className="hidden md:inline">{user.firstName}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-1 border rounded-lg hover:bg-white hover:text-black transition"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          ) : (
            <>
              {/* ---------- MOBILE TOGGLE ---------- */}
              <button
                onClick={() => setMobileOpen(v => !v)}
                className="md:hidden"
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              {/* ---------- DESKTOP BUTTONS ---------- */}
              <div className="hidden md:flex gap-3">
                <button
                  onClick={() => setShowLogin(true)}
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-white hover:text-black transition"
                >
                  <LogIn size={18} /> Login
                </button>
                <button
                  onClick={() => setShowRegister(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 rounded-lg hover:bg-amber-700 transition"
                >
                  <UserPlus size={18} /> Register
                </button>
              </div>
            </>
          )}
        </div>

        {/* ---------- MOBILE MENU ---------- */}
        {mobileOpen && !user && (
          <div className="md:hidden mt-4 border-t border-white/20 pt-4 pb-2">
            <button
              onClick={() => { setShowLogin(true); setMobileOpen(false); }}
              className="w-full text-left py-2 px-3 hover:bg-white/10 rounded"
            >
              Login
            </button>
            <button
              onClick={() => { setShowRegister(true); setMobileOpen(false); }}
              className="w-full text-left py-2 px-3 hover:bg-white/10 rounded"
            >
              Register
            </button>
          </div>
        )}
      </nav>

      {/* ---------- MODALS ---------- */}
      {showLogin && <LoginForm onClose={() => setShowLogin(false)} />}
      {showRegister && <RegisterForm onClose={() => setShowRegister(false)} />}
    </>
  );
}/*// src/components/Navbar.tsx
'use client';

import { useState } from 'react';
import { Menu, X, LogIn, UserPlus } from 'lucide-react';
import LoginForm from './forms/LoginForm';
import RegisterForm from './forms/RegisterForm';

export default function Navbar() {
  const [showMenu, setShowMenu] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const closeMenu = () => setShowMenu(false);

  return (
    <>
      <nav className="bg-black/80 backdrop-blur-md text-white p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <a href="/" className="text-2xl font-bold">Meseret Hotel</a>

          {/* Desktop Buttons 
          <div className="hidden md:flex gap-3">
            <button
              onClick={() => setShowLogin(true)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-white hover:text-black transition"
            >
              <LogIn size={18} /> Login
            </button>
            <button
              onClick={() => setShowRegister(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 rounded-lg hover:bg-amber-700 transition"
            >
              <UserPlus size={18} /> Register
            </button>
          </div>

          {/* Mobile Menu Toggle 
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="md:hidden"
          >
            {showMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu 
        {showMenu && (
          <div className="md:hidden mt-4 border-t border-white/20 pt-4 pb-2">
            <button
              onClick={() => { setShowLogin(true); closeMenu(); }}
              className="w-full text-left py-2 px-3 hover:bg-white/10 rounded"
            >
              Login
            </button>
            <button
              onClick={() => { setShowRegister(true); closeMenu(); }}
              className="w-full text-left py-2 px-3 hover:bg-white/10 rounded"
            >
              Register
            </button>
          </div>
        )}
      </nav>

      {/* Modals 
      {showLogin && <LoginForm onClose={() => setShowLogin(false)} />}
      {showRegister && <RegisterForm onClose={() => setShowRegister(false)} />}
    </>
  );
}*//*// src/components/Navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import { Menu, X, LogIn, UserPlus, LogOut, User } from 'lucide-react';
import LoginForm from './forms/LoginForm';
import RegisterForm from './forms/RegisterForm';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Redirect after login
  useEffect(() => {
    if (user) {
      const role = user.role;
      if (role === 'admin' ) router.push('/admin');
      else if (role === 'receptionist') router.push('/reception');
      else if (role === 'cashier') router.push('/cashier');
      else if (role === 'customer') router.push('/dashboard');
      else if  (role === 'manager') router.push('/manager');
    }
  }, [user, router]);

  const closeMenu = () => setShowMenu(false);

  return (
    <>
      <nav className="bg-black/80 backdrop-blur-md text-white p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <a href="/" className="text-2xl font-bold">Meseret Hotel</a>

          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img
                  src={user.profileImage || '/default-avatar.png'}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
                <span className="hidden md:inline">{user.firstName}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-1 border rounded-lg hover:bg-white hover:text-black transition"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => setShowMenu(!showMenu)} className="md:hidden">
                {showMenu ? <X /> : <Menu />}
              </button>

              <div className="hidden md:flex gap-3">
                <button
                  onClick={() => setShowLogin(true)}
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-white hover:text-black"
                >
                  <LogIn size={18} /> Login
                </button>
                <button
                  onClick={() => setShowRegister(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 rounded-lg hover:bg-amber-700"
                >
                  <UserPlus size={18} /> Register
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu 
        {showMenu && !user && (
          <div className="md:hidden mt-4 border-t border-white/20 pt-4 pb-2">
            <button
              onClick={() => { setShowLogin(true); closeMenu(); }}
              className="w-full text-left py-2 px-3 hover:bg-white/10"
            >
              Login
            </button>
            <button
              onClick={() => { setShowRegister(true); closeMenu(); }}
              className="w-full text-left py-2 px-3 hover:bg-white/10"
            >
              Register
            </button>
          </div>
        )}
      </nav>

      {showLogin && <LoginForm onClose={() => setShowLogin(false)} />}
      {showRegister && <RegisterForm onClose={() => setShowRegister(false)} />}
    </>
  );
}*/