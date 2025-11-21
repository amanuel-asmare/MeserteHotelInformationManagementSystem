'use client'; // Added 'use client' as it uses client-side hooks

import { ReactNode, useState } from 'react';
import ReceptionNavbar from './components/ReceptionNavbar';
import ReceptionSidebar from './components/ReceptionSidebar';
import ReceptionFooter from './components/ReceptionFooter';
//import Logo from './components/logo';

export default function ReceptionLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
    
      {/* Static Navbar */}
      <ReceptionNavbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      {/* Sidebar + Main Content */}
      <div className="flex flex-1 pt-16"> {/* Add padding-top equal to navbar height */}
      
        {/* Fixed Sidebar */}
        {/*
          The sidebar 'lg:ml-64' transition logic should be handled by the sidebar itself
          or the main content, not the container, to avoid layout shifts.
          The `pt-16` on this div correctly pushes content below the navbar.
          The sidebar itself has `pt-16` to ensure its internal content also starts below the navbar.
        */}
        <ReceptionSidebar isSidebarOpen={isSidebarOpen} />

        {/* Main Content - Scrollable */}
        {/* Ensure main content correctly accounts for sidebar width */}
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <ReceptionFooter />
    </div>
  );
}