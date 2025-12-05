// src/app/manager/staff/ManagerStaffClient.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StaffManagementClient from '../../admin/staff/StaffManagementClient';
import { Users, ArrowLeft, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ManagerStaffClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Royal Loading for 4.5 seconds — just like your other pages
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 4500);
    return () => clearTimeout(timer);
  }, []);

  // ROYAL LOADING SCREEN — PURE MESERET GOLD
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-amber-950 via-black to-amber-900 flex items-center justify-center overflow-hidden">
        {/* Animated Golden Particles */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-amber-950/60 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.25),transparent_70%)]" />
          
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -150, 0],
                x: [0, Math.sin(i) * 120, 0],
                opacity: [0.1, 0.7, 0.1]
              }}
              transition={{
                duration: 12 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.7
              }}
              className="absolute w-96 h-96 bg-gradient-to-r from-yellow-400/20 via-orange-600/20 to-transparent rounded-full blur-3xl"
              style={{
                top: `${15 + i * 9}%`,
                left: i % 2 === 0 ? "-25%" : "100%"
              }}
            />
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.8 }}
          className="relative z-10 text-center px-8"
        >
          {/* 3D Crown + MH Logo */}
          <motion.div
            animate={{ 
              rotateY: [0, 360],
              scale: [1, 1.18, 1]
            }}
            transition={{ 
              rotateY: { duration: 28, repeat: Infinity, ease: "linear" },
              scale: { duration: 12, repeat: Infinity }
            }}
            className="relative mx-auto w-80 h-80 mb-12 perspective-1000"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-orange-700 shadow-2xl ring-12 ring-yellow-400/50 blur-md" />
            <div className="absolute inset-8 rounded-full bg-gradient-to-tr from-amber-950 to-black flex items-center justify-center shadow-inner">
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="text-9xl font-black text-yellow-400 tracking-widest drop-shadow-2xl"
                style={{ textShadow: "0 0 100px rgba(251,191,36,1)" }}
              >
                MH
              </motion.div>
            </div>
            <motion.div 
              animate={{ y: [0, -30, 0] }} 
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute -top-16 left-1/2 -translate-x-1/2"
            >
              <Crown className="w-32 h-32 text-yellow-300 drop-shadow-2xl" />
            </motion.div>
          </motion.div>

          {/* Royal Title */}
          <div className="flex justify-center gap-5 mb-10">
            {["M","A","N","A","G","E","R"].map((letter, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 140, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 1.5 + i * 0.2, duration: 1.2 }}
                className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-600"
                style={{ 
                  textShadow: "0 0 120px rgba(251,191,36,0.9)",
                  fontFamily: "'Playfair Display', serif"
                }}
              >
                {letter}
              </motion.span>
            ))}
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.2, duration: 1.8 }}
            className="text-6xl md:text-8xl font-black text-amber-300 tracking-widest mb-8"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            STAFF MANAGEMENT
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4.5, duration: 2 }}
            className="text-3xl text-amber-100 font-light tracking-widest mb-20"
          >
            Command Your Royal Team with Dignity
          </motion.p>

          {/* Golden Progress Bar */}
          <div className="w-full max-w-2xl mx-auto">
            <div className="h-4 bg-black/60 rounded-full overflow-hidden border-4 border-amber-700/80 backdrop-blur-2xl shadow-2xl">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 5.5, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-700 relative overflow-hidden"
              >
                <motion.div
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2.8, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                />
              </motion.div>
            </div>
            <motion.div 
              animate={{ opacity: [0.6, 1, 0.6] }} 
              transition={{ duration: 3.5, repeat: Infinity }}
              className="text-center mt-12 text-3xl font-medium text-amber-200 tracking-widest"
            >
              Preparing Your Royal Command Center...
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // MAIN CONTENT — After Loading
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-gray-900 dark:to-black p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ x: -4, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="group flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 font-bold text-lg"
            >
              <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
              Back
            </motion.button>
            <div className="flex items-center gap-4 flex-1">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-2xl ring-8 ring-blue-500/20">
                <Users size={32} />
              </div>
              <div>
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-700">
                  Manage Staff
                </h1>
                <p className="text-xl text-amber-700 dark:text-amber-300 font-medium mt-2">
                  Oversee Your Royal Receptionists & Cashiers
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
        >
          <StaffManagementClient
            allowedRoles={['receptionist', 'cashier']}
            title="Team Members"
            showAddButton={true}
          />
        </motion.div>
      </div>
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