
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
import { 
  Search, Calendar, Users, Wifi, Waves, Utensils, Car, ScanLine, X, 
  Smartphone, MapPin, Phone, Mail, Award, Clock, ShieldCheck, 
  Facebook, Instagram, Twitter, Linkedin, ArrowRight, HeartHandshake, Hotel
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react'; 
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext'; 
import RegisterForm from '../../components/forms/RegisterForm'; 
import LoginForm from '../../components/forms/LoginForm'; 
import HotelLogo from '../../components/HotelLogo';

// Fix: Modal container with overflow handling
const QRModal = ({ onClose, url, t }: { onClose: () => void; url: string; t: any }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      className="relative w-full max-w-sm bg-white rounded-3xl p-6 md:p-8 text-center shadow-2xl my-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors">
        <X size={24} />
      </button>

      <div className="mb-4 flex justify-center">
        <div className="p-3 bg-amber-100 rounded-full text-amber-600">
          <ScanLine size={32} />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('scanForMenu' as any) || 'Scan for Menu'}</h3>
      <p className="text-gray-500 mb-6 text-sm">{t('pointCamera' as any)}</p>

      <div className="flex justify-center p-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl mb-6 shadow-inner">
        <QRCodeSVG 
          value={url} 
          size={200} 
          level={"H"} 
          includeMargin={true}
        />
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-amber-600 font-bold bg-amber-50 py-3 rounded-xl border border-amber-100">
        <Smartphone size={16} />
        <span>{t('worksOnMobile' as any)}</span>
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
    <main className="relative bg-white dark:bg-gray-950">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] lg:h-screen w-full overflow-hidden flex items-center">
        <Image
          src="/hotel-hero.jpg"
          alt="Meseret Hotel"
          fill
          className="object-cover brightness-[0.65]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        <div className="relative container mx-auto px-6 flex flex-col items-center justify-center text-center text-white z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-7xl lg:text-8xl drop-shadow-2xl"
          >
            {t('welcomeToMeseret'as any)} <span className="text-amber-400">{t('meseretHotel' as any)}</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-10 max-w-2xl text-lg sm:text-xl md:text-2xl font-light text-amber-50/80 drop-shadow-lg"
          >
            {t('experienceLuxury' as any)}
          </motion.p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowQR(true)}
            className="mb-12 flex items-center gap-3 bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 lg:px-12 lg:py-5 rounded-full font-black text-lg shadow-2xl transition-all"
          >
            <ScanLine size={24} />
            {t('scanMenuQR' as any)}
          </motion.button>

          {/* SEARCH BOX 
          <div className="w-full max-w-5xl rounded-3xl bg-white p-4 lg:p-6 shadow-2xl ring-1 ring-black/5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col text-left group">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 tracking-widest">{t('checkInLabel'as any)}</label>
                <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4 border border-transparent group-focus-within:border-amber-500 transition-all">
                  <Calendar className="text-amber-600 shrink-0" size={20} />
                  <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="w-full bg-transparent text-gray-900 outline-none text-sm font-bold"/>
                </div>
              </div>

              <div className="flex flex-col text-left group">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 tracking-widest">{t('checkOutLabel' as any)}</label>
                <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4 border border-transparent group-focus-within:border-amber-500 transition-all">
                  <Calendar className="text-amber-600 shrink-0" size={20} />
                  <input type="date" value={checkOut} min={checkIn} onChange={e => setCheckOut(e.target.value)} className="w-full bg-transparent text-gray-900 outline-none text-sm font-bold"/>
                </div>
              </div>

              <div className="flex flex-col text-left group">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 tracking-widest">{t('guestsLabel' as any)}</label>
                <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4 border border-transparent group-focus-within:border-amber-500 transition-all">
                  <Users className="text-amber-600 shrink-0" size={20} />
                  <select value={guests} onChange={e => setGuests(e.target.value)} className="w-full bg-transparent text-gray-900 outline-none text-sm font-bold cursor-pointer">
                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n} className="text-black">{n} {n > 1 ? t('guestsPlural' as any) : t('guestSingle' as any)}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-end">
                <button onClick={handleSearch} className="w-full h-[58px] flex items-center justify-center gap-3 rounded-2xl bg-amber-600 px-6 py-3 font-black text-white shadow-xl hover:bg-amber-700 transition-all active:scale-[0.98]">
                  <Search size={22} /> {t('searchRoomsButton' as any)}
                </button>
              </div>
            </div>
          </div>*/}
        </div>
      </section>

      {/* 2. ABOUT SECTION */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2 relative"
            >
              <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-gray-50 dark:border-gray-900">
                <Image src="/meserethotelbackground.jpg" width={700} height={900} alt="Meseret Experience" className="w-full h-[400px] lg:h-[550px] object-cover" />
              </div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -z-10" />
              <div className="relative top-10 -left-10 p-6 bg-amber-600 rounded-3xl shadow-2xl hidden md:block text-white">
                <Award size={40} className="mb-2" />
                <p className="text-4xl font-black">12+</p>
                <p className="text-[10px] uppercase font-black tracking-widest opacity-80 ">{t('yearsExcellence' as any)}</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <h4 className="text-amber-600 font-black uppercase tracking-[0.2em] mb-4 text-sm">{t('aboutTitle' as any)}</h4>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-8 leading-tight">
                {t('aboutHeading' as any)}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl mb-10 leading-relaxed font-medium">
                {t('aboutDescription' as any)}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-5 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                  <ShieldCheck className="text-amber-600 shrink-0" size={32} />
                  <div>
                    <h5 className="font-black text-gray-900 dark:text-white">{t('certifiedTitle' as any) || 'Secure'}</h5>
                    <p className="text-xs font-bold text-gray-500 uppercase">{t('certifiedDesc' as any)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-5 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                  <HeartHandshake className="text-amber-600 shrink-0" size={32} />
                  <div>
                    <h5 className="font-black text-gray-900 dark:text-white">{t('supportTitle' as any) || 'Service'}</h5>
                    <p className="text-xs font-bold text-gray-500 uppercase">{t('supportDesc' as any)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. SERVICES SECTION */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6">
              {t('whyChooseMeseret'as any)}
            </h2>
            <div className="h-1.5 w-24 bg-amber-500 mx-auto rounded-full mb-6"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Wifi, title: 'freeWifi', desc: 'highSpeedInternet' },
              // { icon: Waves, title: 'swimmingPool', desc: 'rooftopRelaxation' },
              { icon: Utensils, title: 'fineDining', desc: 'roomService247' },
              { icon: Car, title: 'parking', desc: 'secureParking' },
            ].map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -12 }}
                className="flex flex-col items-center bg-white dark:bg-gray-800 p-10 rounded-[2.5rem] text-center shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300"
              >
                <div className="mb-6 p-5 rounded-3xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 ring-4 ring-amber-50/50">
                  <f.icon size={40} />
                </div>
                <h3 className="mb-3 text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t(f.title as any)}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-bold">{t(f.desc as any)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CTA SECTION */}
      <section className="relative py-24 bg-amber-600 overflow-hidden text-center text-white px-6">
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
          <Hotel size={400} />
        </div>
        <div className="relative z-10">
          <h2 className="mb-6 text-4xl lg:text-6xl font-black">{t('readyToBook' as any)}</h2>
          <p className="mb-12 text-xl md:text-2xl font-light text-amber-100 max-w-2xl mx-auto">{t('joinHappyGuests' as any)}</p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowRegister(true)} 
            className="rounded-full bg-white text-amber-700 px-12 py-5 font-black text-xl shadow-2xl hover:bg-gray-100 transition-all"
          >
            {t('contactUsButton' as any) || 'Start Reservation'}
          </motion.button>
        </div>
      </section>

      {/* 5. ENHANCED FOOTER */}
      <footer className="bg-gray-950 text-gray-400 pt-20 pb-10 border-t border-white/5 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16">
            
            <div className="space-y-6">
              <HotelLogo className="brightness-200" />
              <p className="text-sm leading-relaxed font-medium">
                {t('footerBio' as any) || 'Experience world-class luxury and traditional Ethiopian warmth at Meseret Hotel.'}
              </p>
              <div className="flex gap-4">
                {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="p-3 bg-white/5 hover:bg-amber-600 hover:text-white transition-all rounded-2xl border border-white/10 group">
                    <Icon size={18} className="group-hover:scale-110 transition-transform" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-black uppercase tracking-widest text-sm mb-8">{t('quickLinks' as any) || 'Explore'}</h3>
              <ul className="space-y-4 text-sm font-bold">
                {['rooms', 'dining', 'contact'].map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-amber-500 transition-all flex items-center gap-2 group">
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      {t(link as any)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-black uppercase tracking-widest text-sm mb-8">{t('ourServices' as any)}</h3>
              <ul className="space-y-4 text-sm font-bold">
                {[
                  { icon: Clock, label: '24/7 Front Desk' },
                  { icon: Car, label: 'Valet Parking' },
                  { icon: Utensils, label: 'In-room Dining' }
                ].map((s, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-500">
                    <s.icon size={18} className="text-amber-600" /> {s.label}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-black uppercase tracking-widest text-sm mb-8">{t('contactUs' as any)}</h3>
              <ul className="space-y-5 text-sm font-bold">
                <li className="flex items-start gap-4">
                  <MapPin className="text-amber-500 shrink-0 mt-1" size={20} />
                  <span className="leading-relaxed">{t('hotelAddress' as any)}</span>
                </li>
                <li className="flex items-center gap-4">
                  <Phone className="text-amber-500 shrink-0" size={20} />
                  <span>+251 911 000 000</span>
                </li>
                <li className="flex items-center gap-4">
                  <Mail className="text-amber-500 shrink-0" size={20} />
                  <span className="truncate">contact@meserethotel.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em]">
            <p>{t('footerRights' as any)}</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* 6. MODAL SYSTEM */}
      <AnimatePresence>
        {showQR && <QRModal onClose={() => setShowQR(false)} url={menuUrl} t={t} />}
        
        {showRegister && (
          <RegisterForm 
            onClose={() => setShowRegister(false)} 
            onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }} 
          />
        )}
        
        {showLogin && (
          <LoginForm 
            onClose={() => setShowLogin(false)} 
            onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }} 
          />
        )}
      </AnimatePresence>

    </main>
  );
}