// src/components/receptionist/guestList/GuestAll.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mail, Phone, MapPin, Calendar, Plus } from 'lucide-react';
import GuestProfileModal from '../modals/GuestProfileModal';
import AddGuestModal from '../modals/AddGuestModal'; // Import modal
import axios from 'axios';

interface Guest {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage: string;
  address: { city: string; kebele?: string };
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function GuestList() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filtered, setFiltered] = useState<Guest[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
  const [selected, setSelected] = useState<Guest | null>(null);
  const [showAddModal, setShowAddModal] = useState(true); // Modal state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/users`, { withCredentials: true });
      const customers = res.data.filter((u: any) => u.role === 'customer');
      setGuests(customers);
      setFiltered(customers);
    } catch (err) {
      alert('Failed to load guests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...guests];

    if (search) {
      result = result.filter(g =>
        `${g.firstName} ${g.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        g.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortBy === 'name') {
      result.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    setFiltered(result);
  }, [search, sortBy, guests]);

  if (loading) return <div className="p-8 text-center">Loading guests...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Guests</h1>
        
        <div className="flex gap-3 w-full md:w-auto items-center">
          {/* Search */}
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search guests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="name">Name</option>
            <option value="date">Registration Date</option>
          </select>

          {/* Add Guest Button */}
          <button
            onClick={() => setShowAddModal(false)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Add Guest
          </button>
        </div>
      </div>

      {/* Guest Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((guest) => (
            <motion.div
              key={guest._id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -4 }}
              onClick={() => setSelected(guest)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 cursor-pointer transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <img
                  src={guest.profileImage}
                  alt={guest.firstName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-500"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {guest.firstName} {guest.lastName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <Mail size={12} /> {guest.email}
                  </p>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                {guest.phone && (
                  <p className="flex items-center gap-1">
                    <Phone size={12} /> {guest.phone}
                  </p>
                )}
                <p className="flex items-center gap-1">
                  <MapPin size={12} /> {guest.address.city}{guest.address.kebele ? `, ${guest.address.kebele}` : ''}
                </p>
                <p className="flex items-center gap-1">
                  <Calendar size={12} /> {new Date(guest.createdAt).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No guests found matching your search.
        </div>
      )}

      {/* Modals */}
      <GuestProfileModal guest={selected} onClose={() => setSelected(null)} />
      <AddGuestModal open={showAddModal} onClose={() => setShowAddModal(true)} />
    </div>
  );
}