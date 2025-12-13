
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
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Search, Calendar, Users, Wifi, Waves, Utensils, Car, ScanLine, X, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react'; // Import QR Library
import { AnimatePresence, motion } from 'framer-motion';
import { View, Modal } from 'react-native';
// Simple Modal Component (Inline for safety, or use your existing ../ui/Modal)
import {useState,useEffect} from 'react'
const QRModal = ({ onClose, url }: { onClose: () => void; url: string }) => (
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

      <h3 className="text-2xl font-bold text-gray-900 mb-2">Scan for Menu</h3>
      <p className="text-gray-500 mb-6 text-sm">Point your camera at the code below to access the menu & order.</p>

      <div className="flex justify-center p-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl mb-6">
        {/* Generates the QR Code pointing to the Menu URL */}
        <QRCodeSVG 
          value={url} 
          size={220} 
          level={"H"} 
          includeMargin={true}
          imageSettings={{
            src: "/logo-small.png", // Optional: If you have a logo in public folder
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
        <span>Works on iOS & Android</span>
      </div>
    </motion.div>
  </div>
);

export default function Home() {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  
  // QR Code Logic
  const [showQR, setShowQR] = useState(false);
  const [menuUrl, setMenuUrl] = useState('');

  useEffect(() => {
    // Get the current domain (localhost or production domain)
    // and append the path to the customer menu
    if (typeof window !== 'undefined') {
      setMenuUrl(`${'https://mesertehotelinformationmanagementsystem.onrender.com'}/customer/menu`);
    }
  }, []);

  const handleSearch = () => {
    if (!checkIn || !checkOut) {
      alert('Please select check-in and check-out dates');
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
            Welcome to <span className="text-amber-400">Meseret Hotel</span>
          </h1>
          <p className="mb-8 max-w-2xl text-lg sm:text-xl">
            Experience luxury, comfort, and exceptional service.
          </p>

          {/* === QR CODE BUTTON === */}
          <button
            onClick={() => setShowQR(true)}
            className="mb-10 flex items-center gap-3 bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-amber-500/30 transition-all transform hover:scale-105"
          >
            <ScanLine size={24} />
            Scan Menu QR
          </button>

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

      {/* === REST OF SECTIONS (Unchanged) === */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <h2 className="mb-12 text-center text-3xl font-bold">
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
                <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      {/* === QR CODE MODAL DISPLAY === */}
      <AnimatePresence>
        {showQR && (
          <QRModal onClose={() => setShowQR(false)} url={menuUrl} />
        )}
      </AnimatePresence>
    </>
  );
}