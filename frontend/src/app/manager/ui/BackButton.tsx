//src/app/manager/ui/BackButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BackButton() {
  const router = useRouter();

  return (
    <motion.button
      whileHover={{ x: -4, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => router.back()}
      className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-sm"
    >
      <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
      Back
    </motion.button>
  );
}