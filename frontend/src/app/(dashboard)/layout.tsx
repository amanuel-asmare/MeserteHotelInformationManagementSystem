// app/(dashboard)/layout.tsx
'use client';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/');
    if (user) {
      const paths: any = {
        customer: '/customer',
        receptionist: '/receptionist',
        cashier: '/cashier',
        manager: '/manager',
        admin: '/admin'
      };
      router.replace(paths[user.role] || '/');
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <div className="min-h-screen bg-gray-50">{children}</div>;
}