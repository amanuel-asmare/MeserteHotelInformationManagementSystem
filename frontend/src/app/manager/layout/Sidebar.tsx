'use client';

import Link from 'next/link';
import { Home, Users, FileText, CircleDollarSign, Coffee, Bed, UserCheck, Settings, MessageCircle, Book } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext'; // Import Hook

interface SidebarProps {
  activePath: string;
}

export default function Sidebar({ activePath }: SidebarProps) {
  const { t } = useLanguage(); // Use Hook

  // Define items inside the component to access t()
  const menuItems = [
    { icon: Home, label: t('dashboard'), href: '/manager', key: 'dashboard' },
    { icon: Users, label: t('manageStaff'), href: '/manager/staff', key: 'staff' },
    { icon: FileText, label: t('feedback'), href: '/manager/feedback', key: 'feedback' },
    { icon: Coffee, label: t('menuOrders'), href: '/manager/menu', key: 'menu' },
    { icon: Bed, label: t('roomStatus'), href: '/manager/rooms', key: 'rooms' },
    { icon: Book, label: t('viewReport'), href: '/manager/reports', key: 'report' },
    { icon: UserCheck, label: t('attendance'), href: '/manager/attendance', key: 'attendance' },
    { icon: Settings, label: t('settings'), href: '/manager/settings', key: 'settings' },
    { icon: MessageCircle, label: t('chat'), href: '/manager/chat', key: 'chat' },
    {
      icon: CircleDollarSign, 
      label: t('salaryManagement') || 'Salary Management', // Fallback if key missing
      href: '/manager/ownSalary',
      key: 'salary'
    },
  ];

  return (
    <nav className="p-4 space-y-1 h-full overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-colors duration-300">
      {menuItems.map((item) => {
        const Icon = item.icon;
        
        const isActive = item.href === '/manager' 
          ? activePath === item.href 
          : activePath.startsWith(item.href);

        return (
          <Link
            key={item.key}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              isActive
                ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Icon 
              size={20} 
              className={`transition-transform duration-200 ${
                isActive ? 'scale-110' : 'group-hover:scale-110'
              }`} 
            />
            <span>{item.label}</span>
            
            {isActive && (
              <div className="ml-auto w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse"></div>
            )}
          </Link>
        );
      })}
    </nav>
  );
}/*//`frontend/src/app/manager/layout/Sidebar.tsx`**


'use client';

import Link from 'next/link';
import { Home, Users, FileText, Coffee, Bed, UserCheck, Settings, MessageCircle,Book } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  activePath: string;
}

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/manager', key: 'dashboard' },
  { icon: Users, label: 'Manage Staff', href: '/manager/staff', key: 'staff' },
   { icon: FileText, label: 'Customer Feedback', href: '/manager/feedback', key: 'feedback' },
  { icon: Coffee, label: 'Menu Orders', href: '/manager/menu', key: 'menu' },
  { icon: Bed, label: 'Room Status', href: '/manager/rooms', key: 'rooms' },
  { icon: Book, label: 'View Report', href: '/manager/reports', key: 'report' }, // Corrected path
  { icon: UserCheck, label: 'Attendance', href: '/manager/attendance', key: 'attendance' },
  { icon: Settings, label: 'Settings', href: '/manager/settings', key: 'settings' },
  { icon: MessageCircle, label: 'Chat', href: '/manager/chat', key: 'chat' },
];

export default function Sidebar({ activePath }: SidebarProps) {
  return (
    <nav className="p-4 space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activePath === item.href;

        return (
          <Link
            key={item.key}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              isActive
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Icon size={20} className="group-hover:scale-110 transition-transform" />
            <span>{item.label}</span>
            {isActive && <div className="ml-auto w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>}
          </Link>
        );
      })}
    </nav>
  );
}*/
/*//src/app/manager/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { Home, Users, FileText, Coffee, Bed, UserCheck, Settings, MessageCircle,Book } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  activePath: string;
}

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/manager', key: 'dashboard' },
  { icon: Users, label: 'Manage Staff', href: '/manager/staff', key: 'staff' },
  { icon: FileText, label: 'Customer Feedback', href: '/manager/feedback', key: 'feedback' },
  { icon: Coffee, label: 'Menu Orders', href: '/manager/menu', key: 'menu' },
  { icon: Bed, label: 'Room Status', href: '/manager/rooms', key: 'rooms' },
  { icon: Book, label: 'View Report', href: '/manager/reports', key: 'report' },
  { icon: UserCheck, label: 'Attendance', href: '/manager/attendance', key: 'attendance' },
  { icon: Settings, label: 'Settings', href: '/manager/settings', key: 'settings' },
  { icon: MessageCircle, label: 'Chat', href: '/manager/chat', key: 'chat' },
];

export default function Sidebar({ activePath }: SidebarProps) {
  return (
    <nav className="p-4 space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activePath === item.href;

        return (
          <Link
            key={item.key}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              isActive
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Icon size={20} className="group-hover:scale-110 transition-transform" />
            <span>{item.label}</span>
            {isActive && <div className="ml-auto w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>}
          </Link>
        );
      })}
    </nav>
  );
}*/