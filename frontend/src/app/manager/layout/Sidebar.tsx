'use client';

import Link from 'next/link';
import { Home, Users, FileText, Coffee, Bed, UserCheck, Settings, MessageCircle, Book } from 'lucide-react';

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
        
        // --- THIS IS THE CORRECTED LOGIC ---
        // For the Dashboard link, we need an EXACT match.
        // For all other links, we check if the current path starts with the link's href.
        // This ensures parent links stay active even on child pages (e.g., /manager/staff/add).
        const isActive = item.href === '/manager' 
          ? activePath === item.href 
          : activePath.startsWith(item.href);

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