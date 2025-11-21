// src/app/admin/staff/StaffPageClient.tsx
'use client';

import StaffManagementClient from './StaffManagementClient';
import { Users } from 'lucide-react';

export default function StaffPageClient() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Staff Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Add, edit, or remove hotel employees</p>
          </div>
        </div>

        <StaffManagementClient
          allowedRoles={['manager', 'receptionist', 'cashier']}
          title="Staff Management"
          showAddButton={true}
        />
      </div>
    </div>
  );
}