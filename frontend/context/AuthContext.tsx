/*// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'manager' | 'receptionist' | 'cashier' | 'customer';
  profileImage: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const API_URL = 'http://localhost:5000';

  // ----- check session on mount -----
  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // If 403 → deactivated
        if (res.status === 403) {
          setUser(null);
          alert('Your account has been deactivated by admin.');
        }
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ----- login -----
  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 403) {
        throw new Error('Your account is deactivated. Contact admin.');
      }
      throw new Error(data.message ?? 'Login failed');
    }
    setUser(data.user);
  };

  // ----- logout -----
  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } finally {
      setUser(null);
      router.push('/');
    }
  };

  // ----- auto-check -----
  useEffect(() => { checkAuth(); }, []);

  // ----- redirect after login -----
  useEffect(() => {
    if (!loading && user) {
      const map: Record<User['role'], string> = {
        admin: '/admin',
        manager: '/manager',
        receptionist: '/receptionist',
        cashier: '/cashier',
        customer: '/dashboard',
      };
      router.replace(map[user.role]);
    }
  }, [user, loading, router]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};*/
/*
// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'manager' | 'receptionist' | 'cashier' | 'customer';
  profileImage: string;
  roomNumber?:string;
  phone?:string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void; // NEW
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const API_URL = 'http://localhost:5000';

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else if (res.status === 403) {
        setUser(null);
        alert('Your account has been deactivated by admin.');
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 403) throw new Error('Your account is deactivated. Contact admin.');
      throw new Error(data.message ?? 'Login failed');
    }
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } finally {
      setUser(null);
      router.push('/');
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  useEffect(() => {
    if (!loading && user) {
      const map: Record<User['role'], string> = {
        admin: '/admin',
        manager: '/manager',
        receptionist: '/receptionist',
        cashier: '/cashier',
        customer: '/customer',
      };
      router.replace(map[user.role]);
    }
  }, [user, loading, router]);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};*/
// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'manager' | 'receptionist' | 'cashier' | 'customer';
  profileImage: string;
  roomNumber?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  //  const API_URL = 'https://localhost:5000';
const API_URL='https://mesertehotelinformationmanagementsystem.onrender.com'
  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else if (res.status === 403) {
        setUser(null);
        alert('Your account has been deactivated by admin.');
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 403) throw new Error('Your account is deactivated. Contact admin.');
      throw new Error(data.message ?? 'Login failed');
    }
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } finally {
      setUser(null);
      router.push('/');
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Redirect based on role after login
  // useEffect(() => {
  //   if (!loading && user) {
  //     const map: Record<User['role'], string> = {
  //       admin: '/admin',
  //       manager: '/manager',
  //       receptionist: '/receptionist',
  //       cashier: '/cashier',
  //       customer: '/customer',
  //     };
  //     // router.replace(map[user.role]);
  //    // ONLY REDIRECT if they are on the root "/" or "/login"
  //   // Do NOT redirect if they are already on "/customer/menu"
  //   const publicPaths = ['/', '/login', '/register'];
  //   if (publicPaths.includes(window.location.pathname)) {
  //      router.replace(map[user.role]);
  //   }
  //   }
  // }, [user, loading, router]);
 useEffect(() => {
    if (!loading && user) {
      const map: Record<string, string> = {
        admin: '/admin',
        manager: '/manager',
        receptionist: '/receptionist',
        cashier: '/cashier',
        customer: '/customer',
      };
      
      // LOGIC: Only auto-redirect if they are on a "Start" page (/, /login, /register)
      // Do NOT redirect if they are on /customer/menu (The QR Menu)
      const authRequiredPaths = ['/', '/login', '/register'];
      const currentPath = window.location.pathname;
      
      if (authRequiredPaths.includes(currentPath)) {
         router.replace(map[user.role] || '/');
      }
    }
  }, [user, loading, router]);
  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};