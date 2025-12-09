'use client';
import React from 'react';
import StaffAttendancePage from '@/app/(staff-roles)/attendance/attendanceManagement';
import { motion } from 'framer-motion';
import { useLanguage } from '../../../../context/LanguageContext';
import { Crown } from 'lucide-react';
function ReceptionAttendanceManagement() {
  const { t } = useLanguage();
  const title = t('receptionAttendanceManagement') || "Reception Attendance Management";

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 dark:from-gray-900 dark:via-amber-950 dark:to-gray-900">
      {/* EPIC ANIMATED TITLE */}
      <div className="relative overflow-hidden py-20 text-center">
        {/* Floating Golden Particles Background */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -60, 0],
              x: [0, i % 2 === 0 ? -40 : 40, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 8 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut"
            }}
            className="absolute w-4 h-4 bg-yellow-400/60 rounded-full blur-xl"
            style={{
              top: `${20 + i * 5}%`,
              left: `${10 + i * 6}%`,
            }}
          />
        ))}

        {/* Main Title with Royal Entrance */}
        <motion.h1
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, type: "spring", stiffness: 80 }}
          className="relative inline-block text-5xl md:text-7xl lg:text-8xl font-black tracking-wider"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {/* Letter-by-Letter Animation + Golden Glow + Float */}
          {title.split('').map((char, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 120, rotateX: -90 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                rotateX: 0 
              }}
              transition={{
                delay: index * 0.08,
                duration: 1,
                type: "spring",
                stiffness: 100,
                damping: 12
              }}
              whileHover={{ 
                y: -15,
                scale: 1.2,
                textShadow: "0 0 40px rgba(251,191,36,1)",
                transition: { duration: 0.3 }
              }}
              className="inline-block relative"
              style={{
                textShadow: "0 10px 30px rgba(0,0,0,0.4), 0 0 60px rgba(251,191,36,0.7)",
                background: "linear-gradient(45deg, #f59e0b, #fbbf24, #f59e0b)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              {char === ' ' ? '\u00A0' : char}
              
              {/* Floating Crown on First Letter */}
              {index === 0 && (
                <motion.div
                  animate={{ 
                    y: [0, -20, 0],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute -top-20 left-1/2 -translate-x-1/2"
                >
                  <Crown className="w-16 h-16 md:w-20 md:h-20 text-yellow-400 drop-shadow-2xl" />
                </motion.div>
              )}
            </motion.span>
          ))}

          {/* Golden Underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.5, duration: 1.8, ease: "easeOut" }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-3 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80 blur-sm"
            style={{ transformOrigin: "center" }}
          />
        </motion.h1>

        {/* Subtle Floating Effect on Whole Title */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="mt-8"
        >
          <p className="text-xl md:text-2xl font-light text-amber-700 dark:text-amber-300 tracking-widest">
            {t('trackYourDuty') || "Track Your Duty with Royal Precision"}
          </p>
        </motion.div>
      </div>

      {/* Your Existing Attendance Component */}
      <div className="mt-10">
        <StaffAttendancePage />
      </div>
    </div>
  );
}

export default ReceptionAttendanceManagement;