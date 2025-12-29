'use client';
import { motion } from 'framer-motion';
import { Award, ShieldCheck, MapPin, Users, X, Crown, HeartHandshake } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AboutModalProps {
  onClose: () => void;
}

export default function AboutModal({ onClose }: AboutModalProps) {
  const { t } = useLanguage();

  const stats = [
    { icon: Users, label: 'Happy Guests', value: '10k+' },
    { icon: Award, label: 'Luxury Awards', value: '15' },
    { icon: ShieldCheck, label: 'Years Excellence', value: '12+' },
    { icon: MapPin, label: 'Prime Locations', value: 'Woldia' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 bg-black/20 hover:bg-red-500 text-white rounded-full transition-all">
          <X size={24} />
        </button>

        {/* Image Side */}
        <div className="md:w-5/12 relative h-64 md:h-auto">
          <img src="/hotel-background.png" alt="Hotel Interior" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-amber-900/60 to-transparent" />
          <div className="absolute bottom-8 left-8 text-white">
            <Crown className="w-12 h-12 text-amber-400 mb-2" />
            <h3 className="text-2xl font-black italic">Meseret Hotel</h3>
            <p className="text-amber-100 text-sm opacity-80">Since 2010 E.C</p>
          </div>
        </div>

        {/* Content Side */}
        <div className="md:w-7/12 p-8 md:p-12 overflow-y-auto custom-scrollbar">
          <h4 className="text-amber-600 font-bold uppercase tracking-widest mb-2 text-sm">{t('aboutTitle' as any) || 'Discover Our Story'}</h4>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
            {t('aboutHeading' as any) || 'A Legacy of Ethiopian Hospitality'}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 text-md mb-8 leading-relaxed">
            {t('aboutDescription' as any) || 'Founded on the principles of grace and comfort, Meseret Hotel has been the cornerstone of luxury in the region for over a decade. We combine traditional Ethiopian warmth with modern architectural elegance to provide an experience that is both authentic and world-class.'}
          </p>

          <div className="grid grid-cols-2 gap-6 mb-10">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <stat.icon className="text-amber-600 mb-2" size={24} />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-tighter">{t(stat.label as any) || stat.label}</span>
              </div>
            ))}
          </div>

          <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800 flex items-center gap-4">
             <HeartHandshake className="text-amber-600 w-10 h-10 shrink-0" />
             <div>
                <p className="text-sm font-bold text-amber-900 dark:text-amber-200">{t('commitmentTitle' as any) || 'Our Commitment'}</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 opacity-80">{t('commitmentDesc' as any) || 'Your comfort and safety are our highest priorities.'}</p>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}