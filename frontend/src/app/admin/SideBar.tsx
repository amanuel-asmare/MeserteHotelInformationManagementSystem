/*//`frontend/src/app/admin/SideBar.tsx`**


'use client';

import Link from 'next/link';
import {
  LayoutDashboard,
  BedDouble,
  Users,
  MenuSquare,
  ShoppingCart,
  FileBarChart,
  UploadCloud,
  FileText,
  Settings,
  MessageCircle,
} from 'lucide-react';

interface SideBarProps {
  activeItem: string;
}

export default function SideBar({ activeItem }: SideBarProps) {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: BedDouble, label: 'Room Management', href: '/admin/rooms' },
    { icon: Users, label: 'Staff Management', href: '/admin/staff' },
    { icon: MenuSquare, label: 'Menu Management', href: '/admin/menu' },
    { icon: ShoppingCart, label: 'View menu Orders', href: '/admin/food-orders' },
    { icon: FileBarChart, label: 'View Report', href: '/admin/reports' }, // Corrected path
    { icon: UploadCloud, label: 'Upload Documentation', href: '/admin/upload-docs' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
    { icon: FileText, label: 'FeedBack', href: '/admin/feedback' },
    { icon: MessageCircle, label: 'Chat', href: '/admin/chat' },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 shadow-lg z-40 hidden md:block">
      <div className="p-6">
        <h2 className="text-xl font-bold text-amber-600 mb-8">Admin Panel</h2>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeItem === item.label.toLowerCase() || (item.label === 'View Report' && activeItem.includes('report'))
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-amber-50 hover:text-amber-600'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
*/