'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Users, Bed, FileText, MessageSquare, Calendar,
  Settings, ChevronDown, CircleDollarSign, 
} from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext'; // Import Language Hook

interface SidebarItem {
  icon: any;
  label: string;
  href: string;
  subItems?: SubItem[];
}

interface SubItem {
  label: string;
  href: string;
}

interface ReceptionSidebarProps {
  isSidebarOpen: boolean;
}

export default function ReceptionSidebar({ isSidebarOpen }: ReceptionSidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage(); // Initialize translation
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  
  // Defined inside component to access 't'
  const sidebarItems: SidebarItem[] = [
    { icon: Home, label: t('dashboard'), href: '/receptionist' },
   
    {
      icon: Users,
      label: t('gusetmanagement') , // specialized combination
      href: '/receptionist/guestManagement',
      subItems: [
        { label: t('guest'), href: '/receptionist/guestManagement/guestList' },
        { label: t('add') + ' ' + t('guest'), href: '/receptionist/guestManagement' }
      ]
    },
    {
      icon: Bed,
      label: t('roomManagement'),
      href: '/receptionist/rooms',
      subItems: [
        { label: t('view'), href: '/receptionist/rooms/view' },
        { label: t('roomControl'), href: '/receptionist/rooms' }
      ]
    },
    {
      icon: FileText,
      label: t('reportingHub'),
      href: '/reception/reports',
      subItems: [
        { label: t('daily'), href: '/receptionist/reports/daily' },
        { label: t('occupancy'), href: '/receptionist/reports/occupancy' },
        { label: t('revenue'), href: '/receptionist/reports/revenue' },
        { label: t('guest'), href: '/receptionist/reports/guests' }
      ]
    },
    {
      icon: Calendar,
      label: t('attendance'),
      href: '/receptionist/attendance',
      subItems: [
        { label: t('attendance'), href: '/receptionist/attendance' },
      ]
    },
    {
      icon: MessageSquare,
      label: t('chat'),
      href: '/reception/chat',
      subItems: [
         { label: t('chat'), href: '/receptionist/chat' },
      ]
    }, 
    {
      icon: FileText,
      label: t('feedback'),
      href: '/receptionist/feedback',
      subItems: [
        { label: t('view') + ' ' + t('feedback'), href: '/receptionist/feedback' },
      ]
    },
    {
      icon: CircleDollarSign, 
      label: t('salarymanagement'),
      href: '/receptionist/ownSalary',
      subItems: [
        { label: t('salary'), href: '/receptionist/ownSalary' },
      ]
    },
    {
      icon: Settings,
      label: t('settings'),
      href: '/reception/settings',
      subItems: [
        { label: t('profile'), href: '/receptionist/settings' },
     ]
    }
  ];

  const isActive = (href: string) => pathname === href || (itemHasSubItems(href) && pathname.startsWith(href));

  const itemHasSubItems = (itemHref: string) => {
    return sidebarItems.some(item =>
      item.href === itemHref && item.subItems?.some(sub => pathname.startsWith(sub.href))
    );
  };

  useEffect(() => {
    sidebarItems.forEach(item => {
      if (item.subItems && item.subItems.some(sub => pathname.startsWith(sub.href))) {
        setOpenSubmenu(item.href);
      }
    });
  }, [pathname]);

  return (
    <motion.aside
      initial={false}
      animate={{ x: isSidebarOpen ? 0 : -300 }}
      transition={{ duration: 0.3 }}
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700 overflow-y-auto pt-16 lg:block ${isSidebarOpen ? 'block' : 'hidden'}`}
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 ">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('receptionPortal')}</h2>
          <p className="text-xs text-gray-600 dark:text-gray-400">{t('meseretHotel')}</p>
        </div>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => (
            <li key={item.href}>
              <motion.button
                whileHover={{ x: 5, backgroundColor: 'rgba(251, 191, 36, 0.1)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (item.subItems) {
                    setOpenSubmenu(openSubmenu === item.href ? null : item.href);
                  } else {
                    window.location.href = item.href; 
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                  isActive(item.href)
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-semibold'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <item.icon size={20} />
                <span className="flex-1">{item.label}</span>
                {item.subItems && (
                  <motion.div
                    animate={{ rotate: openSubmenu === item.href ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={16} />
                  </motion.div>
                )}
              </motion.button>

              <AnimatePresence>
                {item.subItems && openSubmenu === item.href && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-6 mt-2 space-y-1 overflow-hidden"
                  >
                    {item.subItems.map((sub) => (
                      <li key={sub.href}>
                        <Link
                          href={sub.href}
                          className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                            isActive(sub.href)
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-medium'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {sub.label}
                        </Link>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ul>
      </nav>
    </motion.aside>
  );
}