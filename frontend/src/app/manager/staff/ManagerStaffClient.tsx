// src/app/manager/staff/ManagerStaffClient.tsx
'use client';
import StaffManagementClient from '../../admin/staff/StaffManagementClient';
export default function ManagerStaffClient() {
  // MAIN CONTENT — After Loading
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-gray-900 dark:to-black p-4 lg:p-8">
      <StaffManagementClient
            allowedRoles={['receptionist', 'cashier']}
            title="Team Members"
            showAddButton={true}
          />
    </div>
  );
}/*// src/app/manager/staff/ManagerStaffClient.tsx
'use client';

import { useRouter } from 'next/navigation';
import StaffManagementClient from '../../admin/staff/StaffManagementClient';
import { Users, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ManagerStaffClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ x: -4, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-sm"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back
            </motion.button>

            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
                <Users size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Staff</h1>
                <p className="text-gray-600 dark:text-gray-400">Oversee receptionists and cashiers</p>
              </div>
            </div>
          </div>
        </div>

        <StaffManagementClient
          allowedRoles={['receptionist', 'cashier']}
          title="Team Members"
          showAddButton={true}
        />
      </div>
    </div>
  );
}*/