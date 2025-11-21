// src/app/manager/components/ManagerNavbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bed, Settings, LogOut, Home, Users, FileText } from 'lucide-react';

const navItems = [
  { href: '/manager', label: 'Dashboard', icon: Home },
  { href: '/manager/rooms', label: 'Room Status', icon: Bed },
  { href: '/manager/settings', label: 'Settings', icon: Settings },
  { href: '/logout', label: 'Logout', icon: LogOut },
];

export default function ManagerNavbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/manager" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-white">
              <Bed size={20} />
            </div>
            <span className="text-xl font-bold text-gray-900">Meseret Hotel</span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                    isActive
                      ? 'bg-amber-100 text-amber-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}