'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../../../../context/LanguageContext';
import {
  DashboardIcon, BillingIcon, PayrollIcon, ReportIcon, 
  FeedbackIcon, AttendanceIcon, ChatIcon, SettingsIcon 
} from './icons';
import { CircleDollarSign, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export default function Sidebar({ isOpen, onClose, isMobile }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: '/cashier', label: t("dashboard"), icon: <DashboardIcon /> },
    { href: '/cashier/billing', label: t('billing'), icon: <BillingIcon /> },
    { href: '/cashier/payroll', label: t('pyroll'), icon: <PayrollIcon /> },
    { href: '/cashier/reports', label: t('generateReport'), icon: <ReportIcon /> },
    { href: '/cashier/feedback', label: t('feedback'), icon: <FeedbackIcon /> },
    { href: '/cashier/attendance', label: t('attendance'), icon: <AttendanceIcon /> },
    { href: '/cashier/chat', label: t('chat'), icon: <ChatIcon />},
    { href: '/cashier/settings', label: t('settings'), icon: <SettingsIcon /> },
    { href: '/cashier/ownSalary', label: t("salarymanagement"), icon: <CircleDollarSign size={20} /> }
  ];

  return (
    <aside className="h-full bg-gray-800 dark:bg-gray-900 text-white shadow-xl flex flex-col w-64">
      {/* Sidebar Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-gray-700 dark:border-gray-800">
        <span className="text-2xl font-bold tracking-wider text-amber-500">Cashier</span>
        
        {/* CLOSE BUTTON - Visible ONLY on Mobile */}
        {isMobile && (
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto custom-scrollbar pb-20">
        {navItems.map((item) => {
           const isActive = pathname === item.href;
           return (
            <Link
              key={item.href}
              href={item.href}
              onClick={isMobile ? onClose : undefined} // Auto close on click for mobile only
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                isActive 
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20' 
                : 'text-gray-400 hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className={`mr-3 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}