
/*'use client';
import { useState, useEffect } from 'react';


import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Calendar, Users, Wifi, Waves, Utensils, Car, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TableScanner from '../../components/TableScanner'; // Import the new component

export default function Home() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [showScanner, setShowScanner] = useState(false);

  const handleSearch = () => {
    if (!checkIn || !checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }
    window.location.href = `/rooms?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`;
  };

  // Logic to handle what happens when a QR code is successfully read
  const handleScanResult = (rawValue: string) => {
    if (!rawValue) return;

    console.log("Scanned Value:", rawValue);

    // 1. Check if it's a Full URL (e.g., https://meseret.com/customer/menu?table=5)
    if (rawValue.includes('table=')) {
      window.location.href = rawValue; 
      return;
    }

    // 2. Check if it's just a number or JSON (e.g., "5" or "Table 5")
    // Remove non-numeric characters to extract the table ID
    const tableNum = rawValue.replace(/[^0-9]/g, '');

    if (tableNum) {
      // Redirect to the menu page with the table number
      router.push(`/customer/menu?table=${tableNum}`);
      setShowScanner(false);
    } else {
      alert("Invalid QR Code. Please scan a valid table code.");
    }
  };

  return (
    <>
      {/* ---------- QR SCANNER MODAL
       ---------- /}
      <AnimatePresence>
        {showScanner && (
          <TableScanner 
            onScan={handleScanResult} 
            onClose={() => setShowScanner(false)} 
          />
        )}
      </AnimatePresence>

      {/* ---------- HERO SECTION 
      ---------- /}
      <section className="relative h-screen w-full overflow-hidden">
        <Image
          src="/hotel-hero.jpg"
          alt="Meseret Hotel"
          fill
          className="object-cover brightness-75"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <div className="relative flex h-full flex-col items-center justify-center px-6 text-center text-white">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Welcome to <span className="text-amber-400">Meseret Hotel</span>
          </h1>
          <p className="mb-8 max-w-2xl text-lg sm:text-xl">
            Experience luxury, comfort, and exceptional service.
          </p>

          {/* ---------- QR ACTION BUTTON 
          ---------- /}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowScanner(true)}
            className="mb-8 flex items-center gap-3 rounded-full bg-amber-600/90 px-8 py-4 text-lg font-bold text-white border-2 border-amber-500 hover:bg-amber-600 transition shadow-xl shadow-black/50"
          >
            <QrCode className="text-white" />
            Scan Menu QR
          </motion.button>

          {/* ---------- SEARCH BAR 
          ---------- /}
          <div className="w-full max-w-4xl rounded-xl bg-white p-4 shadow-2xl">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <Calendar className="text-amber-600" size={20} />
                <input
                  type="date"
                  value={checkIn}
                  onChange={e => setCheckIn(e.target.value)}
                  className="w-full border-none outline-none text-black"
                />
              </div>

              <div className="flex items-center gap-2 rounded-lg border p-3">
                <Calendar className="text-amber-600" size={20} />
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn}
                  onChange={e => setCheckOut(e.target.value)}
                  className="w-full border-none outline-none text-black"
                />
              </div>

              <div className="flex items-center gap-2 rounded-lg border p-3">
                <Users className="text-amber-600" size={20} />
                <select
                  value={guests}
                  onChange={e => setGuests(e.target.value)}
                  className="w-full border-none outline-none text-black"
                >
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={n}>
                      {n} Guest{n > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSearch}
                className="flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-6 py-3 font-semibold text-white transition hover:bg-amber-700"
              >
                <Search size={20} /> Search Rooms
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FEATURES ---------- /}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-800">
            Why Choose Meseret Hotel?
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Wifi, title: 'Free WiFi', desc: 'High-speed internet' },
              { icon: Waves, title: 'Swimming Pool', desc: 'Rooftop relaxation' },
              { icon: Utensils, title: 'Fine Dining', desc: '24/7 room service' },
              { icon: Car, title: 'Parking', desc: 'Secure parking' },
            ].map((f, i) => (
              <div
                key={i}
                className="flex flex-col items-center rounded-lg bg-white p-6 text-center shadow-md"
              >
                <f.icon className="mb-3 text-amber-600" size={32} />
                <h3 className="mb-2 text-lg font-semibold text-gray-800">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- /}
      <section className="bg-amber-600 py-16 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Book?</h2>
          <p className="mb-8 text-lg">Join thousands of happy guests.</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/rooms"
              className="rounded-full bg-white px-8 py-3 font-semibold text-amber-600 hover:bg-gray-100"
            >
              View Rooms
            </Link>
            <Link
              href="/contact"
              className="rounded-full border-2 border-white px-8 py-3 font-semibold hover:bg-white hover:text-amber-600"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-black py-8 text-white">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; 2025 Meseret Hotel. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
*/

/*
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Search, Calendar, Users, Wifi, Waves, Utensils, Car, ScanLine, X, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react'; 
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext'; // Import Language Hook
import RegisterForm from '../../components/forms/RegisterForm'; // Import Register Modal
import LoginForm from '../../components/forms/LoginForm'; // Import Login Modal just in case switching is needed

// Pass translation function 't' to the modal
const QRModal = ({ onClose, url, t }: { onClose: () => void; url: string; t: any }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="relative w-full max-w-sm bg-white rounded-3xl p-8 text-center shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition">
        <X size={24} />
      </button>

      <div className="mb-6 flex justify-center">
        <div className="p-4 bg-amber-100 rounded-full text-amber-600">
          <ScanLine size={40} />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('scanForMenu')}</h3>
      <p className="text-gray-500 mb-6 text-sm">{t('pointCamera')}</p>

      <div className="flex justify-center p-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl mb-6">
        <QRCodeSVG 
          value={url} 
          size={220} 
          level={"H"} 
          includeMargin={true}
          imageSettings={{
            src: "/logo-small.png", 
            x: undefined,
            y: undefined,
            height: 24,
            width: 24,
            excavate: true,
          }}
        />
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-amber-600 font-medium bg-amber-50 py-2 rounded-lg">
        <Smartphone size={16} />
        <span>{t('worksOnMobile')}</span>
      </div>
    </motion.div>
  </div>
);

export default function Home() {
  const { t } = useLanguage(); 
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  
  // Modal States
  const [showQR, setShowQR] = useState(false);
  const [showRegister, setShowRegister] = useState(false); // State for Register Modal
  const [showLogin, setShowLogin] = useState(false); // State for Login Modal (needed for switching)
  
  const [menuUrl, setMenuUrl] = useState('');

  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //      setMenuUrl(`${window.location.origin}/customer/menu`);
  //   }
  // }, []);
useEffect(() => {
  if (typeof window !== 'undefined') {
     // REAL WORLD QR URL:
     // If you want to hardcode a table for the demo, use:
     // setMenuUrl(`${window.location.origin}/customer/menu?table=5`);
     setMenuUrl(`${window.location.origin}/customer/menu`);
  }
}, []);
  const handleSearch = () => {
    if (!checkIn || !checkOut) {
      alert(t('selectDatesGuests'));
      return;
    }
    window.location.href = `/rooms?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`;
  };

  return (
    <>
      <section className="relative h-screen w-full overflow-hidden">
        <Image
          src="/hotel-hero.jpg"
          alt="Meseret Hotel"
          fill
          className="object-cover brightness-75"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <div className="relative flex h-full flex-col items-center justify-center px-6 text-center text-white">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {t('welcomeToMeseret')} <span className="text-amber-400">{t('meseretHotel')}</span>
          </h1>
          <p className="mb-8 max-w-2xl text-lg sm:text-xl">
            {t('experienceLuxury')}
          </p>


          <button
            onClick={() => setShowQR(true)}
            className="mb-10 flex items-center gap-3 bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-amber-500/30 transition-all transform hover:scale-105"
          >
            <ScanLine size={24} />
            {t('scanMenuQR')}
          </button>

          <div className="w-full max-w-4xl rounded-xl bg-white p-4 shadow-2xl">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <Calendar className="text-amber-600" size={20} />
                <input
                  type="date"
                  value={checkIn}
                  onChange={e => setCheckIn(e.target.value)}
                  className="w-full border-none outline-none text-black bg-transparent"
                  placeholder={t('checkInLabel')}
                />
              </div>

              <div className="flex items-center gap-2 rounded-lg border p-3">
                <Calendar className="text-amber-600" size={20} />
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn}
                  onChange={e => setCheckOut(e.target.value)}
                  className="w-full border-none outline-none text-black bg-transparent"
                  placeholder={t('checkOutLabel')}
                />
              </div>

              <div className="flex items-center gap-2 rounded-lg border p-3">
                <Users className="text-amber-600" size={20} />
                <select
                  value={guests}
                  onChange={e => setGuests(e.target.value)}
                  className="w-full border-none outline-none text-black bg-transparent"
                >
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={n}>
                      {n} {n > 1 ? t('guestsPlural') : t('guestSingle')}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSearch}
                className="flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-6 py-3 font-semibold text-white transition hover:bg-amber-700"
              >
                <Search size={20} /> {t('searchRoomsButton')}
              </button>
            </div>
          </div>
        </div>
      </section>


      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-800">
            {t('whyChooseMeseret')}
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Wifi, title: 'freeWifi', desc: 'highSpeedInternet' },
              { icon: Waves, title: 'swimmingPool', desc: 'rooftopRelaxation' },
              { icon: Utensils, title: 'fineDining', desc: 'roomService247' },
              { icon: Car, title: 'parking', desc: 'secureParking' },
            ].map((f, i) => (
              <div
                key={i}
                className="flex flex-col items-center rounded-lg bg-white p-6 text-center shadow-md hover:shadow-lg transition-shadow"
              >
                <f.icon className="mb-3 text-amber-600" size={32} />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{t(f.title as any)}</h3>
                <p className="text-sm text-gray-600">{t(f.desc as any)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="bg-amber-600 py-16 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold">{t('readyToBook')}</h2>
          <p className="mb-8 text-lg">{t('joinHappyGuests')}</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          
            
            
            <button
              onClick={() => setShowRegister(true)}
              className="rounded-full border-2 border-white px-8 py-3 font-semibold hover:bg-white hover:text-amber-600 transition-colors"
            >
             {t('contactUsButton')}
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-black py-8 text-white">
        <div className="container mx-auto px-6 text-center">
          <p>{t('footerRights')}</p>
        </div>
      </footer>

      
      <AnimatePresence>
        {showQR && (
          <QRModal onClose={() => setShowQR(false)} url={menuUrl} t={t} />
        )}
      </AnimatePresence>

    
      {showRegister && (
        <RegisterForm 
          onClose={() => setShowRegister(false)} 
          onSwitchToLogin={() => {
             setShowRegister(false);
             setShowLogin(true);
          }} 
        />
      )}

      
      {showLogin && (
        <LoginForm 
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}

    </>
  );
}*/

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { 
  Search, Calendar, Users, Wifi, Waves, Utensils, Car, ScanLine, X, 
  Smartphone, MapPin, Phone, Mail, Award, Clock, ShieldCheck, 
  Facebook, Instagram, Twitter, Linkedin, ArrowRight, HeartHandshake,Hotel
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react'; 
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext'; 
import RegisterForm from '../../components/forms/RegisterForm'; 
import LoginForm from '../../components/forms/LoginForm'; 
import HotelLogo from '../../components/HotelLogo';

// Modal for QR Code
const QRModal = ({ onClose, url, t }: { onClose: () => void; url: string; t: any }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="relative w-full max-w-sm bg-white rounded-3xl p-8 text-center shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition">
        <X size={24} />
      </button>

      <div className="mb-6 flex justify-center">
        <div className="p-4 bg-amber-100 rounded-full text-amber-600">
          <ScanLine size={40} />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('scanForMenu') || 'Scan for Menu'}</h3>
      <p className="text-gray-500 mb-6 text-sm">{t('pointCamera') || 'Point your camera at the QR code to view our digital menu.'}</p>

      <div className="flex justify-center p-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl mb-6">
        <QRCodeSVG 
          value={url} 
          size={220} 
          level={"H"} 
          includeMargin={true}
        />
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-amber-600 font-medium bg-amber-50 py-2 rounded-lg">
        <Smartphone size={16} />
        <span>{t('worksOnMobile') || 'Works on all smartphones'}</span>
      </div>
    </motion.div>
  </div>
);

export default function Home() {
  const { t } = useLanguage(); 
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  
  const [showQR, setShowQR] = useState(false);
  const [showRegister, setShowRegister] = useState(false); 
  const [showLogin, setShowLogin] = useState(false); 
  const [menuUrl, setMenuUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
       setMenuUrl(`${window.location.origin}/customer/menu`);
    }
  }, []);

  const handleSearch = () => {
    if (!checkIn || !checkOut) {
      alert(t('selectDatesGuests'));
      return;
    }
    window.location.href = `/rooms?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* --- HERO SECTION --- */}
      <section className="relative h-screen w-full overflow-hidden">
        <Image
          src="/hotel-hero.jpg"
          alt="Meseret Hotel"
          fill
          className="object-cover brightness-75"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="relative flex h-full flex-col items-center justify-center px-6 text-center text-white">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-7xl"
          >
            {t('welcomeToMeseret')} <span className="text-amber-400">{t('meseretHotel')}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 max-w-2xl text-lg sm:text-xl font-light italic"
          >
            {t('experienceLuxury')}
          </motion.p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowQR(true)}
            className="mb-10 flex items-center gap-3 bg-amber-500 hover:bg-amber-600 text-white px-10 py-5 rounded-full font-bold text-lg shadow-2xl shadow-amber-500/40 transition-all"
          >
            <ScanLine size={24} />
            {t('scanMenuQR')}
          </motion.button>

          <div className="w-full max-w-5xl rounded-2xl bg-white p-5 shadow-2xl ring-8 ring-white/10">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="flex flex-col text-left">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1">{t('checkInLabel')}</label>
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-50 bg-gray-50 p-3 focus-within:border-amber-500 transition-all">
                  <Calendar className="text-amber-600" size={20} />
                  <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="w-full bg-transparent text-black outline-none text-sm font-medium"/>
                </div>
              </div>

              <div className="flex flex-col text-left">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1">{t('checkOutLabel')}</label>
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-50 bg-gray-50 p-3 focus-within:border-amber-500 transition-all">
                  <Calendar className="text-amber-600" size={20} />
                  <input type="date" value={checkOut} min={checkIn} onChange={e => setCheckOut(e.target.value)} className="w-full bg-transparent text-black outline-none text-sm font-medium"/>
                </div>
              </div>

              <div className="flex flex-col text-left">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1">{t('guestsLabel') || 'Guests'}</label>
                <div className="flex items-center gap-2 rounded-xl border-2 border-gray-50 bg-gray-50 p-3 focus-within:border-amber-500 transition-all">
                  <Users className="text-amber-600" size={20} />
                  <select value={guests} onChange={e => setGuests(e.target.value)} className="w-full bg-transparent text-black outline-none text-sm font-medium">
                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} {n > 1 ? t('guestsPlural') : t('guestSingle')}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col justify-end">
                <button onClick={handleSearch} className="h-[52px] flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-6 py-3 font-bold text-white shadow-lg hover:bg-amber-700 transition-all transform active:scale-95">
                  <Search size={20} /> {t('searchRoomsButton')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- NEW: LUXURY ABOUT SECTION --- */}
      <section className="py-24 bg-white dark:bg-gray-950 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2 relative"
            >
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
                <Image src="/hotel-hero.jpg" width={600} height={800} alt="Meseret Luxury" className="w-full h-[500px] object-cover" />
              </div>
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -z-10" />
              <div className="absolute top-1/2 -left-12 transform -translate-y-1/2 p-8 bg-amber-600 rounded-3xl shadow-2xl hidden md:block">
                <Award className="text-white w-12 h-12 mb-4" />
                <p className="text-white text-3xl font-black">12+</p>
                <p className="text-amber-100 text-xs uppercase font-bold tracking-widest">{t('yearsExcellence' as any) || 'Years Excellence'}</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <h4 className="text-amber-600 font-bold uppercase tracking-widest mb-4">{t('aboutTitle' as any) || 'Discover Our Story'}</h4>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                {t('aboutHeading' as any) || 'Where Tradition Meets Modern Elegance'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 leading-relaxed">
                {t('aboutDescription' as any) || 'Since our inception, Meseret Hotel has been dedicated to providing a sanctuary of luxury in Ethiopia. We pride ourselves on offering more than just a room; we offer a curated experience of cultural richness, comfort, and world-class hospitality.'}
              </p>

              <div className="grid grid-cols-2 gap-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-amber-600"><ShieldCheck size={28} /></div>
                  <div><h5 className="font-bold dark:text-white">{t('certifiedTitle' as any) || 'Safe & Secure'}</h5><p className="text-sm text-gray-500">{t('certifiedDesc') || '24/7 Security Protocols'}</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-amber-600"><HeartHandshake size={28} /></div>
                  <div><h5 className="font-bold dark:text-white">{t('supportTitle' as any) || 'Guest First'}</h5><p className="text-sm text-gray-500">{t('supportDesc') || 'Personalized Concierge'}</p></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- SERVICES SECTION (Improved Why Choose Us) --- */}
      <section className="bg-gray-50 dark:bg-gray-900 py-24 transition-colors">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-800 dark:text-white mb-4">
              {t('whyChooseMeseret')}
            </h2>
            <div className="h-1 w-20 bg-amber-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Wifi, title: 'freeWifi', desc: 'highSpeedInternet', color: 'blue' },
              { icon: Waves, title: 'swimmingPool', desc: 'rooftopRelaxation', color: 'cyan' },
              { icon: Utensils, title: 'fineDining', desc: 'roomService247', color: 'amber' },
              { icon: Car, title: 'parking', desc: 'secureParking', color: 'green' },
            ].map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="flex flex-col items-center rounded-3xl bg-white dark:bg-gray-800 p-8 text-center shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 transition-all"
              >
                <div className={`mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600`}>
                  <f.icon size={36} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">{t(f.title as any)}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t(f.desc as any)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- READY TO BOOK (CTA) --- */}
      <section className="relative py-24 bg-amber-600 overflow-hidden">
        <div className="absolute top-0 right-0 p-24 opacity-10"><Hotel size={300} className="text-white" /></div>
        <div className="container mx-auto px-6 text-center relative z-10 text-white">
          <h2 className="mb-6 text-4xl md:text-5xl font-black">{t('readyToBook')}</h2>
          <p className="mb-10 text-xl font-light opacity-90">{t('joinHappyGuests')}</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={() => setShowRegister(true)}
              className="rounded-full bg-white text-amber-600 px-10 py-4 font-bold text-lg shadow-2xl hover:bg-gray-100 transition-all transform hover:scale-105"
            >
             {t('contactUsButton') || 'Start Reservation'}
            </button>
          </div>
        </div>
      </section>

      {/* --- ENHANCED FOOTER --- */}
      <footer className="bg-gray-950 text-gray-300 pt-20 pb-10 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            {/* Column 1: Brand */}
            <div className="space-y-6">
              <HotelLogo className="brightness-200" />
              <p className="text-sm leading-relaxed text-gray-400">
                {t('footerBio' as any) || 'Experience the heights of luxury and the warmth of Ethiopian hospitality at Meseret Hotel. Your sanctuary in the heart of the city.'}
              </p>
              <div className="flex gap-4">
                <a href="#" className="p-3 bg-white/5 hover:bg-amber-600 transition-all rounded-xl"><Facebook size={20} /></a>
                <a href="#" className="p-3 bg-white/5 hover:bg-amber-600 transition-all rounded-xl"><Instagram size={20} /></a>
                <a href="#" className="p-3 bg-white/5 hover:bg-amber-600 transition-all rounded-xl"><Twitter size={20} /></a>
                <a href="#" className="p-3 bg-white/5 hover:bg-amber-600 transition-all rounded-xl"><Linkedin size={20} /></a>
              </div>
            </div>

            {/* Column 2: Navigation */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6">{t('quickLinks') || 'Quick Links'}</h3>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-amber-500 transition flex items-center gap-2 group"><ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all"/>{t('rooms') || 'Our Rooms'}</a></li>
                <li><a href="#" className="hover:text-amber-500 transition flex items-center gap-2 group"><ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all"/>{t('dining') || 'Dining & Bar'}</a></li>
                <li><a href="#" className="hover:text-amber-500 transition flex items-center gap-2 group"><ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all"/>{t('events') || 'Meetings & Events'}</a></li>
                <li><a href="#" className="hover:text-amber-500 transition flex items-center gap-2 group"><ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all"/>{t('contact') || 'Get in Touch'}</a></li>
              </ul>
            </div>

            {/* Column 3: Services */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6">{t('ourServices') || 'Guest Services'}</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-2"><Clock size={16} className="text-amber-600"/> 24/7 Front Desk</li>
                <li className="flex items-center gap-2"><Car size={16} className="text-amber-600"/> Valet Parking</li>
                <li className="flex items-center gap-2"><Utensils size={16} className="text-amber-600"/> In-room Dining</li>
                <li className="flex items-center gap-2"><Wifi size={16} className="text-amber-600"/> Concierge Services</li>
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6">{t('contactUs') || 'Reach Us'}</h3>
              <ul className="space-y-6 text-sm">
                <li className="flex items-start gap-4">
                  <MapPin className="text-amber-500 shrink-0" size={20} />
                  <span>{t('hotelAddress' as any) || 'Woldia, North Wollo, Ethiopia'}</span>
                </li>
                <li className="flex items-center gap-4">
                  <Phone className="text-amber-500 shrink-0" size={20} />
                  <span>+251 911 000 000</span>
                </li>
                <li className="flex items-center gap-4">
                  <Mail className="text-amber-500 shrink-0" size={20} />
                  <span>contact@meserethotel.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium uppercase tracking-widest text-gray-500">
            <p>{t('footerRights') || '© 2025 Meseret Hotel. All Rights Reserved.'}</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {showQR && (
          <QRModal onClose={() => setShowQR(false)} url={menuUrl} t={t} />
        )}
      </AnimatePresence>

      {showRegister && (
        <RegisterForm 
          onClose={() => setShowRegister(false)} 
          onSwitchToLogin={() => {
             setShowRegister(false);
             setShowLogin(true);
          }} 
        />
      )}

      {showLogin && (
        <LoginForm 
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}
    </div>
  );
}