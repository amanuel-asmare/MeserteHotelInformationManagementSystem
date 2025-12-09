'use client';

import { Mail, Phone, MapPin, Calendar, Home, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../../../context/LanguageContext'; // Import Language Hook

interface Guest {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage: string;
  address: { country: string; city: string; kebele?: string };
  createdAt: string;
}

interface Props {
  guest: Guest | null;
  onClose: () => void;
}

const backdrop = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const modalVariants = {
  hidden: { y: 100, opacity: 0, scale: 0.9 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: { y: 100, opacity: 0, scale: 0.9 },
};

export default function GuestProfileModal({ guest, onClose }: Props) {
  const { t } = useLanguage();

  if (!guest) return null;

  return (
    <AnimatePresence>
      <motion.div
        variants={backdrop}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          variants={modalVariants}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-amber-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl border border-amber-300 dark:border-amber-800 max-w-2xl w-full mx-auto my-auto overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-amber-600 to-amber-700 dark:from-amber-800 dark:to-amber-900 p-6 text-white">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/20 hover:bg-white/30 transition z-10"
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
              <motion.img
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, type: "spring" }}
                src={guest.profileImage || "https://via.placeholder.com/150"}
                alt={guest.firstName}
                className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover ring-8 ring-white/30 shadow-2xl shrink-0"
              />
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-wide break-all">
                  {guest.firstName} {guest.lastName}
                </h2>
                <p className="text-amber-100 text-base md:text-lg opacity-90 mt-1">{t('vipHotelGuest')}</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 md:p-8 space-y-4 md:space-y-5 bg-white/70 dark:bg-gray-800/70">
            {[
              { icon: Mail, label: guest.email },
              { icon: Phone, label: guest.phone || t('notProvided'), condition: !!guest.phone },
              { icon: MapPin, label: `${guest.address.city}, ${guest.address.country || ''}` },
              { icon: Home, label: `${t('kebele')} ${guest.address.kebele}`, condition: !!guest.address.kebele },
              { icon: Calendar, label: `${t('joined')} ${new Date(guest.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` },
            ].map((item, i) => (
              item.condition !== false && (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  className="flex items-center gap-4 p-3 md:p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-white dark:from-amber-900/30 dark:to-gray-800 shadow-md hover:shadow-lg transition overflow-hidden"
                  whileHover={{ scale: 1.01, x: 5 }}
                >
                  <div className="p-2 md:p-3 rounded-full bg-amber-600 text-white shrink-0">
                    <item.icon size={20} className="md:w-[22px] md:h-[22px]" />
                  </div>
                  <span className="text-gray-800 dark:text-gray-200 font-medium text-sm md:text-lg break-all truncate">
                    {item.label}
                  </span>
                </motion.div>
              )
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}