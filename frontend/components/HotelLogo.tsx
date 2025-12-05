'use client';
import { useHotelConfig } from '../context/HotelConfigContext';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HotelLogo({ className = "" }: { className?: string }) {
  const { config } = useHotelConfig();

  return (
    <Link href="/" className={`flex items-center gap-4 group ${className}`}>
      {/* LOGO CONTAINER */}
      <motion.div 
        whileHover={{ scale: 1.05, rotate: 2 }}
        className="relative w-14 h-14 lg:w-16 lg:h-16 flex-shrink-0 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-amber-100 dark:border-amber-900/50 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:shadow-amber-500/20"
      >
        {/* Use standard img to handle dynamic external URLs reliably */}
        <img 
            key={config.logoUrl} 
            src={config.logoUrl} 
            alt={config.hotelName} 
            className="w-full h-full object-cover p-0.5" // Changed to cover for fuller look
            onError={(e) => { e.currentTarget.src = '/MHIMS_LOGO.png'; }} 
        />
        
        {/* Shine Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </motion.div>

      {/* TEXT CONTAINER */}
      <div className="flex flex-col justify-center">
        <h1 className="font-black text-xl lg:text-2xl leading-none text-gray-900 dark:text-white tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300">
            {config.hotelName}
        </h1>
        <div className="flex items-center gap-2 mt-1">
            <span className="h-0.5 w-8 bg-amber-500 rounded-full group-hover:w-12 transition-all duration-500"></span>
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                Management System
            </span>
        </div>
      </div>
    </Link>
  );
}