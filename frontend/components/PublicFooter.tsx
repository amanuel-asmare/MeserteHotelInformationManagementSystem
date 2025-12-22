'use client';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import HotelLogo from './HotelLogo';

export default function PublicFooter() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-950 text-gray-300 pt-20 pb-10 border-t border-white/5">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        
        {/* Brand Column */}
        <div className="space-y-6">
          <HotelLogo className="brightness-200" />
          <p className="text-sm leading-relaxed text-gray-400">
            {t('footerBio'as any) || 'Meseret Hotel offers a unique blend of luxury, comfort, and exceptional service in the heart of Ethiopia.'}
          </p>
          <div className="flex gap-4">
            <a href="#" className="p-2 bg-white/5 hover:bg-amber-600 transition rounded-lg"><Facebook size={18} /></a>
            <a href="#" className="p-2 bg-white/5 hover:bg-amber-600 transition rounded-lg"><Instagram size={18} /></a>
            <a href="#" className="p-2 bg-white/5 hover:bg-amber-600 transition rounded-lg"><Twitter size={18} /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-bold text-lg mb-6">{t('quickLinks') || 'Quick Links'}</h3>
          <ul className="space-y-4 text-sm">
            {['Rooms', 'Dining', 'About Us', 'Contact', 'Terms'].map((item) => (
              <li key={item}>
                <a href={`#${item.toLowerCase()}`} className="hover:text-amber-500 transition flex items-center gap-2 group">
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all" />
                  {t(item as any) || item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-white font-bold text-lg mb-6">{t('ourServices') || 'Our Services'}</h3>
          <ul className="space-y-4 text-sm">
            <li>{t('roomService247') || '24/7 Room Service'}</li>
            <li>{t('secureParking') || 'Secure Parking'}</li>
            <li>{t('eventHosting' as any) || 'Events & Weddings'}</li>
            <li>{t('airportShuttle' as any) || 'Airport Shuttle'}</li>
            <li>{t('wellnessSpa'as any) || 'Wellness & Spa'}</li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-white font-bold text-lg mb-6">{t('contactUs') || 'Contact Us'}</h3>
          <ul className="space-y-6 text-sm">
            <li className="flex items-start gap-4">
              <MapPin className="text-amber-500 shrink-0" size={20} />
              <span>{t('hotelAddress' as any) || 'Woldia, North Wollo, Amhara Region, Ethiopia'}</span>
            </li>
            <li className="flex items-center gap-4">
              <Phone className="text-amber-500 shrink-0" size={20} />
              <span>+251 911 234 567</span>
            </li>
            <li className="flex items-center gap-4">
              <Mail className="text-amber-500 shrink-0" size={20} />
              <span>info@meserethotel.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium uppercase tracking-widest text-gray-500">
        <p>&copy; 2025 Meseret Hotel. {t('allRightsReserved' as any) || 'All rights reserved.'}</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition">Privacy Policy</a>
          <a href="#" className="hover:text-white transition">Cookies Settings</a>
        </div>
      </div>
    </footer>
  );
}