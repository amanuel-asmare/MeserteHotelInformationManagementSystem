'use client';
import { Modal } from 'react-native';

import { useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Crown } from 'lucide-react';
import GuestProfileModal from '../modals/GuestProfileModal';
import AddGuestModal from '../modals/AddGuestModal';
import axios from 'axios';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Avatar } from '@mui/material';

interface Guest {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage: string;
  address: { country?: string; city: string; kebele?: string };
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

export default function GuestList() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filtered, setFiltered] = useState<Guest[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Guest | null>(null);
  const [showAddModal, setShowAddModal] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [minTimePassed, setMinTimePassed] = useState(false);

  // Minimum 4.5s luxury loading
  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), 4500);
    return () => clearTimeout(timer);
  }, []);

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
      console.error('Failed to load guests', err);
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
    setFiltered(result);
  }, [search, guests]);

  // Luxury Loading Screen
  if (loading || !minTimePassed) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-amber-950 via-black to-amber-900 flex items-center justify-center overflow-hidden z-[100]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-amber-950/40 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.18),transparent_70%)]" />
          {[...Array(7)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -120, 0], x: [0, Math.sin(i) * 120, 0], opacity: [0.2, 0.9, 0.2] }}
              transition={{ duration: 10 + i * 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.7 }}
              className="absolute w-80 h-80 bg-gradient-to-r from-yellow-400/30 to-orange-600/20 rounded-full blur-3xl"
              style={{ top: `${15 + i * 12}%`, left: i % 2 === 0 ? "-15%" : "85%" }}
            />
          ))}
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2 }} className="relative z-10 text-center px-4 md:px-8">
          <motion.div animate={{ rotateY: [0, 360], scale: [1, 1.18, 1] }} transition={{ rotateY: { duration: 22, repeat: Infinity, ease: "linear" }, scale: { duration: 9, repeat: Infinity } }}
            className="relative mx-auto w-40 h-40 md:w-60 md:h-60 mb-10 perspective-1000" style={{ transformStyle: "preserve-3d" }}>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-orange-700 shadow-2xl ring-4 md:ring-8 ring-yellow-400/40" />
            <div className="absolute inset-4 md:inset-6 rounded-full bg-gradient-to-tr from-amber-950 to-black flex items-center justify-center shadow-inner">
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                className="text-6xl md:text-8xl font-black text-yellow-400 tracking-widest drop-shadow-2xl"
                style={{ textShadow: "0 0 70px rgba(251,191,36,1)" }}>MH</motion.div>
            </div>
            <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity }}>
              <Crown className="w-10 h-10 md:w-14 md:h-14 text-yellow-300 absolute -top-8 left-1/2 -translate-x-1/2" />
            </motion.div>
          </motion.div>

          <div className="flex justify-center gap-2 md:gap-4 mb-6">
            {["G", "U", "E", "S", "T", "S"].map((letter, i) => (
              <motion.span key={i} initial={{ opacity: 0, y: 80, rotateX: -80 }} animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.8 + i * 0.15, duration: 0.9, ease: "backOut" }}
                className="text-4xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500"
                style={{ textShadow: "0 0 90px rgba(251,191,36,0.9)", fontFamily: "'Playfair Display', serif" }}>
                {letter}
              </motion.span>
            ))}
          </div>
          
          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 1.5 }}
            className="text-2xl md:text-6xl font-bold text-amber-200 tracking-widest mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}>LOADING GUEST PROFILES</motion.h2>

          <div className="mt-16 w-64 md:w-96 mx-auto">
            <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-amber-600/60 backdrop-blur-xl">
              <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 relative overflow-hidden">
                <motion.div animate={{ x: ["-100%", "120%"] }} transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const columns: GridColDef[] = [
    {
      field: 'profileImage',
      headerName: 'PHOTO',
      width: 100,
      renderCell: (params) => (
        <div className="flex items-center justify-center h-full">
           <Avatar src={params.value || ""} sx={{ width: 44, height: 44, border: '2px solid #FCD34D' }} />
        </div>
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: 'name',
      headerName: 'GUEST NAME',
      minWidth: 200,
      flex: 1,
      valueGetter: (_, row) => `${row.firstName} ${row.lastName}`,
      renderCell: (params) => (
        <div className="font-bold text-amber-900 dark:text-amber-100 text-base md:text-lg self-center">{params.value}</div>
      ),
    },
    { field: 'email', headerName: 'EMAIL ADDRESS', width: 250 },
    { field: 'phone', headerName: 'PHONE', width: 160 },
    {
      field: 'address',
      headerName: 'LOCATION',
      width: 250,
      valueGetter: (_, row) => {
        const parts = [row.address.city];
        if (row.address.country) parts.push(row.address.country);
        if (row.address.kebele) parts.push(`Keb ${row.address.kebele}`);
        return parts.join(' • ');
      },
    },
    {
      field: 'createdAt',
      headerName: 'REGISTERED ON',
      width: 180,
      valueGetter: (value) => new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8 min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 bg-clip-text text-transparent leading-tight">
             Guest Directory
          </h1>
          <p className="text-sm md:text-lg text-amber-700 dark:text-amber-300 mt-2">Excellence in Every Guest Experience</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto items-stretch md:items-center">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600" size={20} />
            <input
              type="text"
              placeholder="Search distinguished guests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-4 py-3 border-2 border-amber-300 dark:border-amber-700 rounded-2xl w-full md:w-80 lg:w-96 text-base focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/30 transition-all duration-300 bg-white/70 dark:bg-gray-800/70 backdrop-blur"
            />
          </div>

          <button
            onClick={() => setShowAddModal(false)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-base md:text-lg rounded-2xl shadow-xl hover:shadow-amber-600/50 transform hover:scale-105 transition-all duration-300 whitespace-nowrap"
          >
            <Plus size={24} /> Add Guest
          </button>
        </div>
      </div>

      {/* Premium DataGrid - Responsive Container */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border-2 border-amber-300 dark:border-amber-800 overflow-hidden"
      >
        <div className="w-full overflow-x-auto">
          {/* We remove fixed height and use autoHeight. minWidth ensures horizontal scroll on mobile */}
          <div style={{ minWidth: 800, width: '100%' }}>
            <DataGrid
              rows={filtered}
              columns={columns}
              getRowId={(row) => row._id}
              pageSizeOptions={[10]} 
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10, page: 0 },
                },
              }}
              pagination
              autoHeight // This minimizes height if list is short
              paginationMode="client"
              disableRowSelectionOnClick
              onRowClick={(params) => setSelected(params.row as Guest)}
              sx={{
                border: 'none',
                fontFamily: '"Inter", sans-serif',
                minHeight: 150, // Ensures table doesn't collapse completely if empty

                '& .MuiDataGrid-columnHeaders': {
                  background: 'linear-gradient(135deg, rgba(252, 211, 77, 0.98) 0%, rgba(251, 146, 60, 0.98) 100%)',
                  backdropFilter: 'blur(16px)',
                  borderBottom: '4px solid #D97706',
                  boxShadow: '0 10px 40px rgba(217, 119, 6, 0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: '#451A03',
                  fontFamily: '"Playfair Display", serif',
                  '& .MuiDataGrid-columnHeaderTitle': {
                    fontWeight: 900,
                  },
                },

                '& .MuiDataGrid-row': {
                  backgroundColor: 'transparent',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(252, 211, 77, 0.18)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 5px 15px rgba(252, 211, 77, 0.2)',
                    zIndex: 10,
                    '& .MuiDataGrid-cell': { color: '#92400E', fontWeight: 700 },
                  },
                },

                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid rgba(251, 191, 36, 0.25)',
                  fontSize: '0.95rem',
                  color: '#1F2937',
                  fontWeight: 500,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                },

                '& .MuiTablePagination-root': {
                  color: '#92400E',
                  fontWeight: 700,
                  borderTop: '2px solid rgba(251, 191, 36, 0.3)',
                },
                
                '& .MuiTablePagination-toolbar': {
                   padding: '16px',
                },

                '.dark &': {
                  '& .MuiDataGrid-columnHeaders': {
                    background: 'linear-gradient(135deg, #92400E 0%, #451A03 100%)',
                    color: '#FCD34D',
                    borderBottom: '4px solid #F59E0B',
                  },
                  '& .MuiDataGrid-row:hover': { backgroundColor: 'rgba(251, 191, 36, 0.2)' },
                  '& .MuiDataGrid-cell': { color: '#E5E7EB' },
                  '& .MuiTablePagination-root': { color: '#FCD34D' },
                },
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-20 md:py-32">
          <Crown className="w-16 h-16 md:w-24 md:h-24 text-amber-400 mx-auto mb-6" />
          <p className="text-xl md:text-2xl text-amber-600 dark:text-amber-400 font-medium">
            No guests found matching your search.
          </p>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {selected && <GuestProfileModal guest={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
      {/*<AddGuestModal open={showAddModal} onClose={() => setShowAddModal(false)} />*/}
    </div>
  );
}/*// src/components/receptionist/guestList/GuestAll.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mail, Phone, MapPin, Calendar, Plus,Crown } from 'lucide-react';
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';


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
   const [minTimePassed, setMinTimePassed] = useState(false);
  // Minimum 4.5 seconds of luxury loading
  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), 4500);
    return () => clearTimeout(timer);
  }, []);

 // Inside GuestAll.tsx – Replace the loading check with this:
if (loading || !minTimePassed) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-950 via-black to-amber-900 flex items-center justify-center overflow-hidden z-50">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-amber-950/40 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.18),transparent_70%)]" />
        
        {/* Floating Golden Orbs /}
        {[...Array(7)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -120, 0], 
              x: [0, Math.sin(i) * 120, 0], 
              opacity: [0.2, 0.9, 0.2] 
            }}
            transition={{ duration: 10 + i * 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.7 }}
            className="absolute w-80 h-80 bg-gradient-to-r from-yellow-400/30 to-orange-600/20 rounded-full blur-3xl"
            style={{ top: `${15 + i * 12}%`, left: i % 2 === 0 ? "-15%" : "85%" }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 1.2 }}
        className="relative z-10 text-center px-8"
      >
        {/* 3D MH Logo /}
        <motion.div
          animate={{ rotateY: [0, 360], scale: [1, 1.18, 1] }}
          transition={{ rotateY: { duration: 22, repeat: Infinity, ease: "linear" }, scale: { duration: 9, repeat: Infinity } }}
          className="relative mx-auto w-60 h-60 mb-10 perspective-1000"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-orange-700 shadow-2xl ring-8 ring-yellow-400/40" />
          <div className="absolute inset-6 rounded-full bg-gradient-to-tr from-amber-950 to-black flex items-center justify-center shadow-inner">
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
              className="text-8xl font-black text-yellow-400 tracking-widest drop-shadow-2xl"
              style={{ textShadow: "0 0 70px rgba(251,191,36,1)" }}
            >
              MH
            </motion.div>
          </div>
          <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity }}>
            <Crown className="w-14 h-14 text-yellow-300 absolute -top-8 left-1/2 -translate-x-1/2" />
          </motion.div>
        </motion.div>

        {/* Elegant Title /}
        <div className="flex justify-center gap-4 mb-6">
          {["G", "U", "E", "S", "T", "S"].map((letter, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 80, rotateX: -80 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: 0.8 + i * 0.15, duration: 0.9, ease: "backOut" }}
              className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500"
              style={{ textShadow: "0 0 90px rgba(251,191,36,0.9)", fontFamily: "'Playfair Display', serif" }}
            >
              {letter}
            </motion.span>
          ))}
        </div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 1.5 }}
          className="text-4xl md:text-6xl font-bold text-amber-200 tracking-widest mb-6"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          LOADING GUEST PROFILES
        </motion.h2>

        {/* Progress Bar /}
        <div className="mt-16 w-96 mx-auto">
          <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-amber-600/60 backdrop-blur-xl">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 shadow-glow relative overflow-hidden"
            >
              <motion.div
                animate={{ x: ["-100%", "120%"] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              />
            </motion.div>
          </div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-center mt-8 text-xl font-medium text-amber-100 tracking-wider"
          >
            Preparing Royal Guest Directory...
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
  return (
    <div className="p-6 space-y-6">
      {/* Header /}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Guests</h1>
        
        <div className="flex gap-3 w-full md:w-auto items-center">
          {/* Search /}
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

          {/* Sort /}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="name">Name</option>
            <option value="date">Registration Date</option>
          </select>

          {/* Add Guest Button /}
          <button
            onClick={() => setShowAddModal(false)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Add Guest
          </button>
        </div>
      </div>

      {/* Guest Grid /}
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

      {/* Modals /}
      <GuestProfileModal guest={selected} onClose={() => setSelected(null)} />
      <AddGuestModal open={showAddModal} onClose={() => setShowAddModal(true)} />
    </div>
  );
}*/