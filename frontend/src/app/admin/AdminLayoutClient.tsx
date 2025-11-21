// src/app/admin/AdminLayoutClient.tsx
'use client';

import { useState } from 'react';
import { Menu, X, Globe, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'am', name: 'Amharic (አማርኛ)' },
    { code: 'om', name: 'Oromo (Afaan Oromoo)' },
    { code: 'ti', name: 'Tigrinya (ትግርኛ)' },
    { code: 'so', name: 'Somali (Af Soomaali)' },
    { code: 'fr', name: 'French (Français)' },
    { code: 'ar', name: 'Arabic (العربية)' },
    { code: 'es', name: 'Spanish (Español)' },
    { code: 'de', name: 'German (Deutsch)' },
    { code: 'it', name: 'Italian (Italiano)' },
  ];

  const [selectedLang, setSelectedLang] = useState(languages[0].code);

  const menuItems = [
    { icon: 'LayoutDashboard', label: 'Dashboard', href: '/admin' },
    { icon: 'BedDouble', label: 'Room Management', href: '/admin/rooms' },
    { icon: 'Users', label: 'Staff Management', href: '/admin/staff' },
    { icon: 'MenuSquare', label: 'Menu Management', href: '/admin/menu' },
    { icon: 'ShoppingCart', label: 'Food Orders', href: '/admin/food-orders' },
    { icon: 'FileBarChart', label: 'Generate Report', href: '/admin/reports' },
    { icon: 'UploadCloud', label: 'Upload Documentation', href: '/admin/upload-docs' },
     // --- THIS IS THE LINE THAT WAS ADDED ---
    { icon: 'FileText', label: 'FeedBack', href: '/admin/feedback' },
    { icon: 'Settings', label: 'Settings', href: '/admin/settings' },
    { icon: 'MessageCircle', label: 'Chat', href: '/admin/chat' },
  ];

  const currentPage = menuItems.find(item => item.href === pathname)?.label.toLowerCase() || 'dashboard';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 transition md:hidden">
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm">A</div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Admin Portal</h1>
                <p className="text-xs text-gray-500">Meseret Hotel</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                <Globe size={16} />
                <span className="hidden sm:inline">{languages.find(l => l.code === selectedLang)?.name}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                  {languages.map(lang => (
                    <button key={lang.code} onClick={() => { setSelectedLang(lang.code); setLangOpen(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>

            <img src={user?.profileImage || '/default-avatar.png'} alt="Profile" className="w-9 h-9 rounded-full object-cover border-2 border-amber-600" />

            <button onClick={logout} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium">
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 shadow-lg transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-5">
            <h2 className="text-lg font-bold text-amber-600 mb-6">Navigation</h2>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = require('lucide-react')[item.icon];
                return (
                  <Link key={item.label} href={item.href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${currentPage === item.label.toLowerCase() ? 'bg-amber-600 text-white shadow-md' : 'text-gray-700 hover:bg-amber-50 hover:text-amber-600'}`}>
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}