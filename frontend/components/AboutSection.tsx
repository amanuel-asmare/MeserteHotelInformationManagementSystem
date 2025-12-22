'use client';
import { motion } from 'framer-motion';
import { Award, ShieldCheck, MapPin, Users } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AboutSection() {
  const { t } = useLanguage();

  const stats = [
    { icon: Users, label: 'Happy Guests', value: '10k+' },
    { icon: Award, label: 'Luxury Awards', value: '15' },
    { icon: ShieldCheck, label: 'Years Excellence', value: '12' },
    { icon: MapPin, label: 'Prime Locations', value: '1' },
  ];

  return (
    <section id="about" className="py-24 bg-white dark:bg-gray-950 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Image Side */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2 relative"
          >
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
              <img src="/hotel-interior.jpg" alt="Interior" className="w-full h-[500px] object-cover" />
            </div>
            <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-amber-500/10 rounded-2xl -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 border-l-4 border-t-4 border-amber-600 -z-10" />
          </motion.div>

          {/* Text Side */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <h4 className="text-amber-600 font-bold uppercase tracking-widest mb-4">{t('aboutTitle') || 'Our Story'}</h4>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              {t('aboutHeading') || 'A Legacy of Ethiopian Hospitality'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 leading-relaxed">
              {t('aboutDescription') || 'Founded on the principles of grace and comfort, Meseret Hotel has been the cornerstone of luxury in the region for over a decade. We combine traditional Ethiopian warmth with modern architectural elegance to provide an experience that is both authentic and world-class.'}
            </p>

            <div className="grid grid-cols-2 gap-8">
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col">
                  <stat.icon className="text-amber-600 mb-2" size={28} />
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                  <span className="text-gray-500 text-sm font-medium uppercase tracking-tighter">{t(stat.label as any) || stat.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}