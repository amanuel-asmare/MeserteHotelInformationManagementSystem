'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Search, Calendar, Users, Wifi, Waves, Utensils, Car } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');

  const handleSearch = () => {
    if (!checkIn || !checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }
    // In a real app you would send the data to a server or use a query string
    window.location.href = `/rooms?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`;
  };

  return (
    <>
      {/* ---------- HERO ---------- */}
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

          {/* ---------- SEARCH BAR ---------- */}
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

      {/* ---------- FEATURES ---------- */}
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

      {/* ---------- CTA ---------- */}
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
}/*// src/app/page.tsx
'use client';

import Image from 'next/image';
import { Search, Calendar, Users, Wifi, Waves, Utensils, Car } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');

  const handleSearch = () => {
    if (!checkIn || !checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }
    console.log('Search:', { checkIn, checkOut, guests });
  };

  return (
    <>
      {/* Hero Section - Only on Home 
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

          {/* Search Bar 
          <div className="w-full max-w-4xl rounded-xl bg-white p-4 shadow-2xl">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <Calendar className="text-amber-600" size={20} />
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full border-none outline-none text-black"
                  placeholder="Check-in"
                />
              </div>

              <div className="flex items-center gap-2 rounded-lg border p-3">
                <Calendar className="text-amber-600" size={20} />
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn}
                  className="w-full border-none outline-none text-black"
                  placeholder="Check-out"
                />
              </div>

              <div className="flex items-center gap-2 rounded-lg border p-3">
                <Users className="text-amber-600" size={20} />
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full border-none outline-none text-black"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
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
                <Search size={20} />
                Search Rooms
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features 
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
            ].map((feature, i) => (
              <div
                key={i}
                className="flex flex-col items-center rounded-lg bg-white p-6 text-center shadow-md"
              >
                <feature.icon className="mb-3 text-amber-600" size={32} />
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 
      <section className="bg-amber-600 py-16 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Book?</h2>
          <p className="mb-8 text-lg">Join thousands of happy guests.</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <a href="/rooms" className="rounded-full bg-white px-8 py-3 font-semibold text-amber-600 hover:bg-gray-100">
              View Rooms
            </a>
            <a href="/contact" className="rounded-full border-2 border-white px-8 py-3 font-semibold hover:bg-white hover:text-amber-600">
              Contact Us
            </a>
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
}*/