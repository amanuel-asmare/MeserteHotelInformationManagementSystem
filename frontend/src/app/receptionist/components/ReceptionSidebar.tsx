'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Clock, Users, Bed, CreditCard, FileText, BarChart3, MessageSquare,Calendar,
  Settings, Phone, MapPin, ChevronDown, Hotel
} from 'lucide-react';
import Image from 'next/image'; // Import Image component

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

const sidebarItems: SidebarItem[] = [
  { icon: Home, label: 'Dashboard', href: '/receptionist' },
 
  {
    icon: Users,
    label: 'Guest Management',
    href: '/receptionist/guestManagement',
    subItems: [
      { label: 'All Guests', href: '/receptionist/guestManagement/guestList' },
      { label: 'Add Guest', href: '/receptionist/guestManagement' }
    ]
  },
  {
    icon: Bed,
    label: 'Room Management',
    href: '/receptionist/rooms',
    subItems: [
     
      { label: 'View reservation', href: '/receptionist/rooms/view' },
      { label: 'Assign Room', href: '/receptionist/rooms' }
    ]
  },

  {
    icon: FileText,
    label: 'Reports',
    href: '/reception/reports',
    subItems: [
      { label: 'Daily Report', href: '/receptionist/reports/daily' },
      { label: 'Occupancy', href: '/receptionist/reports/occupancy' },
      { label: 'Revenue', href: '/receptionist/reports/revenue' },
      { label: 'Guest Report', href: '/receptionist/reports/guests' }
    ]
  },,

  {
    icon: Calendar,
    label: 'Attendance',
    href: '/receptionist/attendance',
    subItems: [
      { label: 'Mark Attendance', href: '/receptionist/attendance' },
     
    ]
  },
  {
    icon: MessageSquare,
    label: 'Communication',
    href: '/reception/chat',
    subItems: [
       { label: 'Oline Chat', href: '/receptionist/chat' },
      // { label: 'Messages', href: '/reception/communication/messages' },
      // { label: 'Emails', href: '/reception/communication/emails' },
      // { label: 'SMS', href: '/reception/communication/sms' }
    ]
  }, {
    icon: FileText,
    label: 'feedBack',
    href: '/receptionist/feedback',
    subItems: [
    { 
     label: 'View Feedback', href: '/receptionist/feedback' },
    
    ]
  },
  
  {
    icon: Phone,
    label: 'Phone System',
    href: '/reception/phone',
    subItems: [
      { label: 'Call Log', href: '/reception/phone/log' },
      { label: 'Wake-up Calls', href: '/reception/phone/wakeup' },
      { label: 'Extensions', href: '/reception/phone/extensions' }
    ]
  },
  {
    icon: Settings,
    label: 'Settings',
    href: '/reception/settings',
    subItems: [
      { label: 'Profile', href: '/admin/settings' },
      { label: 'Preferences', href: '/reception/settings/preferences' },
      { label: 'System', href: '/reception/settings/system' }
    ]
  }
];

export default function ReceptionSidebar({ isSidebarOpen }: ReceptionSidebarProps) {
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const isActive = (href: string) => pathname === href || (itemHasSubItems(href) && pathname.startsWith(href));

  // Function to check if the current path is a subitem of a given item.href
  const itemHasSubItems = (itemHref: string) => {
    return sidebarItems.some(item =>
      item.href === itemHref && item.subItems?.some(sub => pathname.startsWith(sub.href))
    );
  };

  useEffect(() => {
    // Automatically open submenu if a subitem is active
    sidebarItems.forEach(item => {
      if (item.subItems && item.subItems.some(sub => pathname.startsWith(sub.href))) {
        setOpenSubmenu(item.href);
      }
    });
  }, [pathname]);


  return (
    <motion.aside
      initial={false}
      // Animate sidebar position
      animate={{ x: isSidebarOpen ? 0 : -300 }}
      transition={{ duration: 0.3 }}
      // Fixed positioning and z-index to stay on top
      className={`fixed  inset-y-0 left-0 z-40 w-64 bg-white  dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700 overflow-y-auto pt-16 lg:block ${isSidebarOpen ? 'block' : 'hidden'}`} // pt-16 for navbar height
    >
      {/* Header (always visible in sidebar, pushes content below navbar) */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 ">
        <Image
          src="/MHIMS_LOGO.png" // Path to your public folder image
          alt="Meseret Hotel Logo"
          width={40} // Adjusted width for better fit within sidebar
          height={40} // Adjusted height
          className="rounded-lg shadow-md flex-shrink-0"
        />
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Reception</h2> {/* Slightly smaller text */}
          <p className="text-xs text-gray-600 dark:text-gray-400">Hotel Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => (
            <li key={item.href}>
              <motion.button
                whileHover={{ x: 5, backgroundColor: 'rgba(251, 191, 36, 0.1)' }} // Hover animation
                whileTap={{ scale: 0.98 }} // Click animation
                onClick={() => {
                  if (item.subItems) {
                    setOpenSubmenu(openSubmenu === item.href ? null : item.href);
                  } else {
                    // For direct links, use Next.js Link for SPA navigation
                    // For full page reload behavior, keep window.location.href
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

              {/* Submenu */}
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

      {/* Footer in Sidebar */}
   
    </motion.aside>
  );
}