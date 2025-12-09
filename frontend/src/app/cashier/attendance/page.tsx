'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Clock, CalendarCheck } from 'lucide-react';
import StaffAttendancePage from '../../(staff-roles)/attendance/attendanceManagement';
import { useLanguage } from '../../../../context/LanguageContext'; // Import translation

export default function CashierAttendanceManagement() {
  const { t, language } = useLanguage(); // Use translation hook

  const [minTimePassed, setMinTimePassed] = useState(false);

  // ROYAL LOADING — 4.5 seconds of pure luxury
  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), 4500);
    return () => clearTimeout(timer);
  }, []);

  // === LUXURY LOADING SCREEN ===
  if (!minTimePassed) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-amber-950 via-black to-amber-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-amber-950/50 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15),transparent_70%)]" />
          
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -100, 0], x: [0, Math.sin(i) * 100, 0], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 8 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
              className="absolute w-96 h-96 bg-gradient-to-r from-yellow-400/20 to-orange-600/20 rounded-full blur-3xl"
              style={{ top: `${20 + i * 10}%`, left: i % 2 === 0 ? "-20%" : "80%" }}
            />
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.85 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 1.5 }} 
          className="relative z-10 text-center px-8"
        >
          {/* 3D Golden Logo */}
          <motion.div
            animate={{ rotateY: [0, 360], scale: [1, 1.15, 1] }}
            transition={{ rotateY: { duration: 20, repeat: Infinity, ease: "linear" }, scale: { duration: 8, repeat: Infinity } }}
            className="relative mx-auto w-64 h-64 mb-12 perspective-1000"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-orange-600 shadow-2xl ring-8 ring-yellow-400/30" />
            <div className="absolute inset-8 rounded-full bg-gradient-to-tr from-amber-950 to-black flex items-center justify-center shadow-inner">
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="text-8xl font-black text-yellow-400 tracking-widest drop-shadow-2xl"
                style={{ textShadow: "0 0 60px rgba(251,191,36,0.9)" }}
              >
                MH
              </motion.div>
            </div>
            <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -top-10 left-1/2 -translate-x-1/2 text-yellow-300">
              <Crown className="w-16 h-16" />
            </motion.div>
          </motion.div>

          {/* MESERET Letters */}
          <div className="flex justify-center gap-3 mb-6">
            {["M","E","S","E","R","E","T"].map((letter, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 100, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 1 + i * 0.15, duration: 0.8 }}
                className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500"
                style={{ textShadow: "0 0 80px rgba(251,191,36,0.9)", fontFamily: "'Playfair Display', serif" }}
              >
                {letter}
              </motion.span>
            ))}
          </div>

          {/* Translated Title */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 2.5, duration: 1.2 }} 
            className="flex items-center justify-center gap-6 mb-6"
          >
            <CalendarCheck className="w-16 h-16 text-amber-300" />
            <h2 
              className="text-5xl md:text-7xl font-bold text-amber-300 tracking-wider"
              style={{ fontFamily: language === 'am' ? "'Noto Sans Ethiopic', serif" : "'Playfair Display', serif" }}
            >
              {t('attendanceSystem') || "ATTENDANCE SYSTEM"}
            </h2>
            <Clock className="w-16 h-16 text-amber-300" />
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 3.2, duration: 1.5 }} 
            className="text-2xl text-amber-100 font-light tracking-widest"
            style={{ fontFamily: language === 'am' ? "'Noto Sans Ethiopic', serif" : "inherit" }}
          >
            {t('honoringCommitment') || "Honoring Commitment with Royal Precision"}
          </motion.p>

          <div className="mt-20 w-96 mx-auto">
            <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-amber-600/50 backdrop-blur-xl">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 shadow-2xl relative overflow-hidden"
              >
                <motion.div
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
              </motion.div>
            </div>

            <motion.div 
              animate={{ opacity: [0.6, 1, 0.6] }} 
              transition={{ duration: 3, repeat: Infinity }} 
              className="text-center mt-8 text-2xl font-medium text-amber-200 tracking-wider"
              style={{ fontFamily: language === 'am' ? "'Noto Sans Ethiopic', serif" : "inherit" }}
            >
              {t('recordingPresence') || "Recording Your Royal Presence..."}
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // === MAIN ATTENDANCE CONTENT WITH LUXURY BACKGROUND ===
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-gray-900 dark:to-black p-6 lg:p-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="max-w-7xl mx-auto"
      >
        {/* Royal Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 mb-6 leading-tight"
            style={{ 
              fontFamily: language === 'am' ? "'Noto Sans Ethiopic', serif" : "'Playfair Display', serif",
              fontSize: language === 'am' ? '3.5rem' : 'inherit'
            }}
          >
            {t('attendanceManagement') || "ATTENDANCE MANAGEMENT"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl text-amber-700 dark:text-amber-300 font-medium tracking-wider"
          >
            {t('everyCheckInIsCrown') || "Every Check-in is a Crown • Meseret Hotel"}
          </motion.p>
        </div>

        {/* Your original attendance component */}
        <StaffAttendancePage />
      </motion.div>
    </div>
  );
}