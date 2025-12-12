import { Phone, Mail, Bed, MapPin, Clock, Facebook, Twitter, Instagram, Youtube, Utensils, Car, Wifi, Star, GraduationCap } from 'lucide-react';
// FIX: Changed import path to the component that supports 'variant' and 'size'
import { Button } from '../../../../components/ui/receptionistUI/button'; 
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ReceptionFooter() {
  return (
    <footer className="bg-gray-900 text-white dark:bg-gray-950 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Hotel Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/MHIMS_LOGO.png"
                alt="Meseret Hotel Logo"
                width={40}
                height={40}
                className="rounded-lg shadow-md"
              />
              <div>
                <h3 className="text-xl font-bold">Meseret Hotel</h3>
                <p className="text-amber-400">Luxury & Comfort</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4 text-sm">Experience the perfect blend of Ethiopian hospitality and modern luxury at Meseret Hotel.</p>
            <div className="flex gap-2">
              {['Facebook', 'Twitter', 'Instagram', 'Youtube'].map((social, index) => (
                <motion.a
                  key={social}
                  href="#"
                  whileHover={{ scale: 1.1, backgroundColor: '#eab308' }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 bg-white text-gray-900 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
                >
                  {social === 'Facebook' && <Facebook size={14} />}
                  {social === 'Twitter' && <Twitter size={14} />}
                  {social === 'Instagram' && <Instagram size={14} />}
                  {social === 'Youtube' && <Youtube size={14} />}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Our Services</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              {[
                { icon: Bed, label: 'Room Booking' },
                { icon: Utensils, label: 'Food & Drinks' },
                { icon: Car, label: 'Airport Shuttle' },
                { icon: Wifi, label: 'Free WiFi' },
                { icon: Star, label: 'Spa & Wellness' },
                { icon: GraduationCap, label: 'Business Center' }
              ].map((service, index) => (
                <motion.li
                  key={service.label}
                  whileHover={{ x: 5, color: '#fcd34d' }}
                  className="flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <service.icon size={16} />
                  {service.label}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              {[
                { label: 'Dashboard', href: '/reception' },
                { label: 'Check-in', href: '/reception/checkin' },
                { label: 'Room Status', href: '/reception/rooms/status' },
                { label: 'Reservations', href: '/reception/reservations' },
                { label: 'Reports', href: '/reception/reports' },
                { label: 'Settings', href: '/reception/settings' },
                { label: 'Help', href: '#' },
                { label: 'Privacy Policy', href: '#' }
              ].map((link, index) => (
                <motion.li
                  key={link.label}
                  whileHover={{ x: 5, color: '#fcd34d' }}
                  className="transition-colors"
                >
                  <Link href={link.href} className="hover:text-amber-400 transition">
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Information</h4>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <span>+251 911 123 456</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span>info@meseret.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>Bole Road, Addis Ababa, Ethiopia</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>24/7 Service Available</span>
              </div>
            </div>
            <div className="mt-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                {/* Variant prop now works because we import from receptionistUI/button */}
                <Button variant="outline" size="sm" className="w-full bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 border-transparent hover:border-transparent transition">
                  <Mail size={14} className="mr-2" />
                  Send Inquiry
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-400">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">
                © 2025 Meseret Hotel Management System. All rights reserved.
              </p>
            </div>
            <div className="flex gap-4 text-sm">
              <Link href="#" className="hover:text-amber-400 transition">Privacy Policy</Link>
              <Link href="#" className="hover:text-amber-400 transition">Terms of Service</Link>
              <Link href="#" className="hover:text-amber-400 transition">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}/*import { Phone, Mail, Bed, MapPin, Clock, Facebook, Twitter, Instagram, Youtube, Utensils, Car, Wifi, Star, GraduationCap } from 'lucide-react';
import { Button } from '../../../../components/ui/Button'; // Assuming this path is correct
import Image from 'next/image';
import Link from 'next/link'
import { motion } from 'framer-motion'; // Import motion

export default function ReceptionFooter() {
  return (
    <footer className="bg-gray-900 text-white dark:bg-gray-950 mt-auto"> 
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
     
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/MHIMS_LOGO.png" // Path to your public folder image
                alt="Meseret Hotel Logo"
                width={40} // Consistent logo size with the original request, could be 50 like navbar/sidebar if desired
                height={40}
                className="rounded-lg shadow-md"
              />
              <div>
                <h3 className="text-xl font-bold">Meseret Hotel</h3>
                <p className="text-amber-400">Luxury & Comfort</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4 text-sm">Experience the perfect blend of Ethiopian hospitality and modern luxury at Meseret Hotel.</p>
            <div className="flex gap-2">
              {['Facebook', 'Twitter', 'Instagram', 'Youtube'].map((social, index) => (
                <motion.a
                  key={social}
                  href="#"
                  whileHover={{ scale: 1.1, backgroundColor: '#eab308' }} // Hover animation
                  whileTap={{ scale: 0.9 }} // Click animation
                  className="w-8 h-8 bg-white text-gray-900 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
                >
                  {social === 'Facebook' && <Facebook size={14} />}
                  {social === 'Twitter' && <Twitter size={14} />}
                  {social === 'Instagram' && <Instagram size={14} />}
                  {social === 'Youtube' && <Youtube size={14} />}
                </motion.a>
              ))}
            </div>
          </div>

         
          <div>
            <h4 className="text-lg font-semibold mb-4">Our Services</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              {[
                { icon: Bed, label: 'Room Booking' },
                { icon: Utensils, label: 'Food & Drinks' },
                { icon: Car, label: 'Airport Shuttle' },
                { icon: Wifi, label: 'Free WiFi' },
                { icon: Star, label: 'Spa & Wellness' },
                { icon: GraduationCap, label: 'Business Center' }
              ].map((service, index) => (
                <motion.li
                  key={service.label}
                  whileHover={{ x: 5, color: '#fcd34d' }} // Amber-300 on hover
                  className="flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <service.icon size={16} />
                  {service.label}
                </motion.li>
              ))}
            </ul>
          </div>

      
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              {[
                { label: 'Dashboard', href: '/reception' },
                { label: 'Check-in', href: '/reception/checkin' },
                { label: 'Room Status', href: '/reception/rooms/status' },
                { label: 'Reservations', href: '/reception/reservations' },
                { label: 'Reports', href: '/reception/reports' },
                { label: 'Settings', href: '/reception/settings' },
                { label: 'Help', href: '#' },
                { label: 'Privacy Policy', href: '#' }
              ].map((link, index) => (
                <motion.li
                  key={link.label}
                  whileHover={{ x: 5, color: '#fcd34d' }} // Amber-300 on hover
                  className="transition-colors"
                >
                  <Link href={link.href} className="hover:text-amber-400 transition">
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

       
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Information</h4>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <span>+251 911 123 456</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span>info@meseret.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>Bole Road, Addis Ababa, Ethiopia</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>24/7 Service Available</span>
              </div>
            </div>
            <div className="mt-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" size="sm" className="w-full bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 border-transparent hover:border-transparent transition">
                  <Mail size={14} className="mr-2" />
                  Send Inquiry
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-400">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">
                © 2025 Meseret Hotel Management System. All rights reserved.
              </p>
            </div>
            <div className="flex gap-4 text-sm">
              <Link href="#" className="hover:text-amber-400 transition">Privacy Policy</Link>
              <Link href="#" className="hover:text-amber-400 transition">Terms of Service</Link>
              <Link href="#" className="hover:text-amber-400 transition">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}*/