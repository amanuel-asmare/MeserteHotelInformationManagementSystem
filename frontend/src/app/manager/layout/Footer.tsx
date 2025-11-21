'use client';

import { motion } from 'framer-motion';
import {
  Phone, Mail, MapPin, Clock, Facebook, Twitter, Instagram, Linkedin, ChevronUp
} from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // REAL SOCIAL MEDIA LINKS (Update with your actual pages)
  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/meserethotel', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/meserethotel', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com/meserethotel', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com/company/meserethotel', label: 'LinkedIn' },
  ];

  return (
    <footer className="mt-20 bg-gradient-to-t from-gray-100 to-white dark:from-gray-900 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* === MAIN GRID === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          
          {/* === HOTEL INFO === */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                M
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Meseret Hotel</h3>
                <p className="text-sm text-amber-600 dark:text-amber-400">Luxury Redefined</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Experience world-class hospitality in the heart of Woldia, Ethiopia. Your comfort is our priority.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition shadow-sm"
                  aria-label={`Follow us on ${label}`}
                >
                  <Icon size={18} className="text-amber-600 dark:text-amber-400" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* === CONTACT INFO === */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Phone size={20} className="text-amber-600 dark:text-amber-400" />
              Contact Us
            </h4>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <a href="tel:+251911234567" className="flex items-center gap-2 hover:text-amber-600 dark:hover:text-amber-400 transition group">
                <div className="w-1 h-1 bg-amber-500 rounded-full group-hover:scale-150 transition"></div>
                +251 911 234 567
              </a>
              <a href="tel:+251987654321" className="flex items-center gap-2 hover:text-amber-600 dark:hover:text-amber-400 transition group">
                <div className="w-1 h-1 bg-amber-500 rounded-full group-hover:scale-150 transition"></div>
                +251 987 654 321
              </a>
              <a href="mailto:info@meserethotel.com" className="flex items-center gap-2 hover:text-amber-600 dark:hover:text-amber-400 transition group">
                <Mail size={16} />
                info@meserethotel.com
              </a>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 text-amber-600 dark:text-amber-400" />
                <p>P.O. Box 1234, Woldia, Ethiopia</p>
              </div>
            </div>
          </motion.div>

          {/* === SERVICES === */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock size={20} className="text-amber-600 dark:text-amber-400" />
              Our Services
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {[
                '24/7 Room Service',
                'Fine Dining Restaurant',
                'Conference & Events',
                'Free High-Speed WiFi',
                'Laundry & Dry Cleaning',
                'Business Center'
              ].map((service) => (
                <li key={service} className="flex items-center gap-2 hover:text-amber-600 dark:hover:text-amber-400 transition cursor-default group">
                  <div className="w-1 h-1 bg-amber-500 rounded-full group-hover:scale-150 transition"></div>
                  {service}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* === QUICK LINKS === */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {[
                { label: 'Manager Portal', href: '/manager' },
                { label: 'Staff Login', href: '/staff' },
                { label: 'Book a Room', href: '/booking' },
                { label: 'Menu & Orders', href: '/menu' },
                { label: 'Feedback', href: '/feedback' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' }
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="hover:text-amber-600 dark:hover:text-amber-400 transition flex items-center gap-2 group"
                  >
                    <div className="w-1 h-1 bg-amber-500 rounded-full opacity-0 group-hover:opacity-100 transition"></div>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* === BOTTOM BAR === */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 md:mb-0">
            <p>
              © 2025 <span className="font-semibold text-amber-600 dark:text-amber-400">Meseret Hotel</span>. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                System Online
              </span>
              <span className="hidden sm:inline">•</span>
              <span>Manager Portal v2.1</span>
            </div>
          </div>

          {/* Back to Top */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <ChevronUp size={18} />
            Back to Top
          </motion.button>
        </div>
      </div>
    </footer>
  );
}