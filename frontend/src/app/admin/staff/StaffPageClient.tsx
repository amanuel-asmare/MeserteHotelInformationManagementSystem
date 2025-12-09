'use client';

import StaffManagementClient from './StaffManagementClient'; // Check path based on your folder structure
import { Users } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';
import { motion } from 'framer-motion';

// Animation Variants for the Container (Holds the letters)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // Delay between each letter
      delayChildren: 0.2,
    },
  },
};

// Animation Variants for each Letter
const letterVariants = {
  hidden: { y: 20, opacity: 0, rotateX: -90 },
  visible: {
    y: 0,
    opacity: 1,
    rotateX: 0,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 100,
    },
  },
};

export default function StaffPageClient() {
  const { t, language } = useLanguage();


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
       
        {/* --- MAIN CONTENT --- */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <StaffManagementClient
            allowedRoles={['manager', 'receptionist', 'cashier']}
            title={t('staffManagement')}
            showAddButton={true}
          />
        </motion.div>
      </div>
    </div>
  );
}