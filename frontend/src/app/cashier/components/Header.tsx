'use client';

import { useAuth } from '../../../../context/AuthContext';
import { Menu, Transition } from '@headlessui/react';
// ✅ ADD useState and useEffect
import { Fragment, useState, useEffect } from 'react';

// CORRECTED IMPORTS for Heroicons v2
import { ChevronDownIcon, BellIcon } from '@heroicons/react/24/solid';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';


interface HeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function Header({ isSidebarOpen, toggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  // ✅ STATE TO PREVENT HYDRATION MISMATCH
  const [isMounted, setIsMounted] = useState(false);

  // ✅ EFFECT TO RUN ONLY ON THE CLIENT
  useEffect(() => {
    setIsMounted(true);
  }, []);


  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b-2 border-gray-200 shadow-sm z-10">
      <div className="flex items-center">
        {/* Sidebar toggle button for mobile/tablet */}
        <button 
          onClick={toggleSidebar} 
          className="text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 lg:hidden"
          aria-label="Toggle sidebar"
        >
          {/* Switched to more standard icons: Bars3Icon and XMarkIcon */}
          {isSidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <span className="absolute top-0 right-0 h-2 w-2 mt-1 mr-2 bg-red-500 rounded-full"></span>
          <span className="absolute top-0 right-0 h-2 w-2 mt-1 mr-2 bg-red-500 rounded-full animate-ping"></span>
          <BellIcon className="h-6 w-6" />
        </button>

        {/* ✅ WRAP THE MENU IN THE isMounted CHECK */}
        {isMounted && (
          <Menu as="div" className="relative">
            <div>
              <Menu.Button className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <img
                  className="h-9 w-9 rounded-full object-cover"
                  src={user?.profileImage || '/default-avatar.png'}
                  alt="User profile"
                />
                <span className="hidden md:inline font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </span>
                <ChevronDownIcon className="hidden md:inline h-5 w-5 text-gray-500" />
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="/cashier/settings" // This should be a <Link> component if using Next.js routing
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } block px-4 py-2 text-sm text-gray-700`}
                      >
                        My Profile
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={logout}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                      >
                        Sign Out
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        )}
      </div>
    </header>
  );
}