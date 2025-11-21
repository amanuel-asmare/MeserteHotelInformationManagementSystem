'use client';

import { useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const { user } = useAuth();
  const pathname = usePathname();

  // Show navbar **only** on public pages when the user is NOT logged-in
  const publicPages = ['/', '/rooms', '/contact'];
  const show = !user && publicPages.some(p => pathname.startsWith(p));

  if (!show) return null;
  return <Navbar />;
}/*// src/components/ConditionalNavbar.tsx
'use client';

import { useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const { user } = useAuth();
  const pathname = usePathname();

  // Hide navbar on any dashboard
  const isDashboard =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/manager') ||
    pathname.startsWith('/reception') ||
    pathname.startsWith('/cashier') ||
    pathname.startsWith('/dashboard');

  if (isDashboard || !user) return null;

  return <Navbar />;
}*/