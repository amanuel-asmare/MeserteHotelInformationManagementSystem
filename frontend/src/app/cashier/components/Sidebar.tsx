// frontend/src/app/cashier/components/Sidebar.tsx
'use client'; // <-- Add this if it's not there, as usePathname is a client hook

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  DashboardIcon,
  BillingIcon,
  PayrollIcon,
  ReportIcon,
  FeedbackIcon,
  AttendanceIcon,
  ChatIcon,
  SettingsIcon
} from './icons'; // Corrected import path

interface SidebarProps {
  isOpen: boolean;
}

const navItems = [
  { href: '/cashier', label: 'Dashboard', icon: <DashboardIcon /> },
  { href: '/cashier/billing', label: 'Billing Management', icon: <BillingIcon /> },
  { href: '/cashier/payroll', label: 'Payroll', icon: <PayrollIcon /> },
  { href: '/cashier/reports', label: 'Generate Report', icon: <ReportIcon /> },
  { href: '/cashier/feedback', label: 'View Feedback', icon: <FeedbackIcon /> },
  { href: '/cashier/attendance', label: 'My Attendance', icon: <AttendanceIcon /> },
  { href: '/cashier/chat', label: 'Chat Online', icon: <ChatIcon />},
  { href: '/cashier/settings', label: 'Settings', icon: <SettingsIcon /> },
];

export default function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={`absolute lg:relative w-64 h-screen bg-gray-800 text-white shadow-lg transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 z-20`}
    >
      <div className="p-4 text-2xl font-bold border-b border-gray-700">Meseret Hotel</div>
      <nav className="mt-8">
        {navItems.map((item) => (
          // THE FIX IS HERE:
          // 1. We removed the <a> tag.
          // 2. We moved the `className` directly to the <Link> component.
          // 3. We added the `key` prop to the <Link> component.
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-colors duration-200 text-gray-300 hover:bg-gray-700 hover:text-white ${
              // Logic to highlight the active link
              pathname === item.href ? 'bg-gray-900 text-white' : ''
            }`}
          >
            {item.icon}
            <span className="mx-4 font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}