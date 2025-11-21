'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Bed, Search, Filter, ChevronDown, CheckCircle, RefreshCw, Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

interface Room {
  _id: string;
  roomNumber: string;
  type: 'single' | 'double' | 'triple';
  availability: boolean;
  status: 'clean' | 'dirty' | 'maintenance';
  floorNumber: number;
  images: string[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// A professional pagination component
const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) => {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  // Logic to create smart page numbers (e.g., 1 ... 4 5 6 ... 10)
  const createPageNumbers = () => {
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1);
      if (currentPage > 3) pageNumbers.push('...');
      if (currentPage > 2) pageNumbers.push(currentPage - 1);
      if (currentPage !== 1 && currentPage !== totalPages) pageNumbers.push(currentPage);
      if (currentPage < totalPages - 1) pageNumbers.push(currentPage + 1);
      if (currentPage < totalPages - 2) pageNumbers.push('...');
      pageNumbers.push(totalPages);
    }
    return [...new Set(pageNumbers)]; // Remove duplicates
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition">
        <ChevronLeft size={20} />
      </button>
      {createPageNumbers().map((num, index) => (
        <React.Fragment key={index}>
          {num === '...' ? (
            <span className="px-4 py-2 text-gray-500">...</span>
          ) : (
            <button
              onClick={() => onPageChange(num as number)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                currentPage === num ? 'bg-amber-600 text-white shadow-md' : 'hover:bg-amber-100'
              }`}
            >
              {num}
            </button>
          )}
        </React.Fragment>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition">
        <ChevronRight size={20} />
      </button>
    </div>
  );
};


export default function ManagerRoomStatusClient() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'clean' | 'dirty' | 'maintenance'>('all');
  const [updating, setUpdating] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [carouselImages, setCarouselImages] = useState<string[] | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // === PAGINATION STATE ===
  const [currentPage, setCurrentPage] = useState(1);
  const [roomsPerPage] = useState(8); // Display 8 rooms per page
  const [animationDirection, setAnimationDirection] = useState(1);

  const fetchRooms = useCallback(async () => {
    // This function remains the same
    const isRefresh = !loading;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await axios.get('/api/rooms', { withCredentials: true });
      setRooms(res.data);
      setCurrentPage(1); // Reset to first page on refresh
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchRooms();
  }, []); // Note: Removed fetchRooms from dependency array to prevent re-fetching on every state change

  const updateStatus = async (id: string, newStatus: 'clean' | 'dirty' | 'maintenance') => {
    // This function remains the same
    setUpdating(id);
    try {
      await axios.put(`/api/rooms/${id}/status`, { status: newStatus }, { withCredentials: true });
      setRooms(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  // === PAGINATION LOGIC ===
  const filteredRooms = useMemo(() => rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [rooms, searchTerm, statusFilter]);

  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);
  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber > currentPage) {
      setAnimationDirection(1); // Sliding in from the right
    } else {
      setAnimationDirection(-1); // Sliding in from the left
    }
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);


  // === ANIMATION VARIANTS FOR PAGE TURN EFFECT ===
  const pageTurnVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  // Other functions (getStatusColor, getImageUrl, carousel logic) remain the same...
  const getStatusColor = (status: string) => { /* ... unchanged ... */ };
  const getImageUrl = (img: string) => { /* ... unchanged ... */ };
  const openCarousel = (images: string[], startIndex: number = 0) => { /* ... unchanged ... */ };
  const closeCarousel = () => { /* ... unchanged ... */ };
  const nextImage = () => { /* ... unchanged ... */ };
  const prevImage = () => { /* ... unchanged ... */ };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!carouselImages) return;
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') closeCarousel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [carouselImages]);

  if (loading) {
    // Loading screen remains the same
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-8 border-amber-200 animate-spin"></div>
          <div className="absolute inset-0 w-24 h-24 rounded-full border-8 border-amber-600 animate-ping"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-amber-600 rounded-full animate-pulse flex items-center justify-center">
              <Bed className="w-8 h-8 text-white" />
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-amber-700 animate-pulse">Loading Room Status...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Success Toast and Carousel remain the same */}
      <AnimatePresence>
        {success && (
          <motion.div /* ... unchanged ... */ />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {carouselImages && (
          <motion.div /* ... unchanged ... */ />
        )}
      </AnimatePresence>

      {/* HEADER remains the same */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* ... unchanged ... */}
      </div>

      {/* SEARCH & FILTER remains the same */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        {/* ... unchanged ... */}
      </div>
      
      {/* Informative Display */}
      <div className="mb-4 text-sm text-gray-600">
        Showing <span className="font-bold">{Math.min(indexOfFirstRoom + 1, filteredRooms.length)}</span> 
        - <span className="font-bold">{Math.min(indexOfLastRoom, filteredRooms.length)}</span> of 
        <span className="font-bold"> {filteredRooms.length}</span> rooms.
      </div>


      {/* ANIMATED ROOM GRID */}
      <AnimatePresence initial={false} custom={animationDirection}>
        <motion.div
          key={currentPage}
          custom={animationDirection}
          variants={pageTurnVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {currentRooms.map((room) => (
            <motion.div
              key={room._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* The content of each room card remains exactly the same */}
              <div
                className="h-40 bg-gray-100 relative overflow-hidden group cursor-pointer"
                onClick={() => openCarousel(room.images, 0)}
              >
                {/* ... image and overlay ... */}
              </div>
              <div className="p-4">
                {/* ... room details and status buttons ... */}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* No rooms found message */}
      {filteredRooms.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Bed size={48} className="mx-auto mb-3 text-gray-300" />
          <p>No rooms found matching your filters.</p>
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </>
  );
}/*// src/app/manager/rooms/ManagerRoomStatusClient.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bed, Search, Filter, ChevronDown, CheckCircle, RefreshCw, Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

interface Room {
  _id: string;
  roomNumber: string;
  type: 'single' | 'double' | 'triple';
  availability: boolean;
  status: 'clean' | 'dirty' | 'maintenance';
  floorNumber: number;
  images: string[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ManagerRoomStatusClient() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'clean' | 'dirty' | 'maintenance'>('all');
  const [updating, setUpdating] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // CAROUSEL
  const [carouselImages, setCarouselImages] = useState<string[] | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const fetchRooms = useCallback(async () => {
    const isRefresh = !loading;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await axios.get('/api/rooms', { withCredentials: true });
      setRooms(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const updateStatus = async (id: string, newStatus: 'clean' | 'dirty' | 'maintenance') => {
    setUpdating(id);
    try {
      await axios.put(`/api/rooms/${id}/status`, { status: newStatus }, { withCredentials: true });
      setRooms(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'clean': return 'bg-green-100 text-green-700 border-green-200';
      case 'dirty': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'maintenance': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getImageUrl = (img: string) => {
    if (!img) return '/default-room.jpg';
    return img.startsWith('http') ? img : `${API_BASE}${img}`;
  };

  const openCarousel = (images: string[], startIndex: number = 0) => {
    setCarouselImages(images);
    setCarouselIndex(startIndex);
  };

  const closeCarousel = () => {
    setCarouselImages(null);
    setCarouselIndex(0);
  };

  const nextImage = () => {
    if (carouselImages) {
      setCarouselIndex((prev) => (prev + 1) % carouselImages.length);
    }
  };

  const prevImage = () => {
    if (carouselImages) {
      setCarouselIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!carouselImages) return;
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') closeCarousel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [carouselImages]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-8 border-amber-200 animate-spin"></div>
          <div className="absolute inset-0 w-24 h-24 rounded-full border-8 border-amber-600 animate-ping"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-amber-600 rounded-full animate-pulse flex items-center justify-center">
              <Bed className="w-8 h-8 text-white" />
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-amber-700 animate-pulse">Loading Room Status...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SUCCESS TOAST /}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
          >
            <CheckCircle size={20} />
            Status updated successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL-SCREEN CAROUSEL /}
      <AnimatePresence>
        {carouselImages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={closeCarousel}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative w-full h-full max-w-6xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={getImageUrl(carouselImages[carouselIndex])}
                alt={`Room image ${carouselIndex + 1}`}
                className="w-full h-full object-contain rounded-2xl"
              />

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 text-white px-5 py-2 rounded-full text-sm font-medium">
                {carouselIndex + 1} / {carouselImages.length}
              </div>

              <button
                onClick={prevImage}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-sm transition"
              >
                <ChevronLeft size={32} className="text-white" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-sm transition"
              >
                <ChevronRight size={32} className="text-white" />
              </button>

              <button
                onClick={closeCarousel}
                className="absolute top-6 right-6 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg"
              >
                <X size={28} className="text-gray-800" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER /}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
            <Bed size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Room Status</h1>
            <p className="text-gray-600">Monitor and update room cleaning status</p>
          </div>
        </div>

        <button
          onClick={fetchRooms}
          disabled={refreshing}
          className="flex items-center gap-2 px-5 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all shadow-md disabled:opacity-70"
        >
          {refreshing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* SEARCH & FILTER /}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by room number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 appearance-none bg-white"
          >
            <option value="all">All Status</option>
            <option value="clean">Clean</option>
            <option value="dirty">Dirty</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>
      </div>

      {/* ROOM GRID /}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredRooms.map((room) => (
          <motion.div
            key={room._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            <div
              className="h-40 bg-gray-100 relative overflow-hidden group cursor-pointer"
              onClick={() => openCarousel(room.images, 0)}
            >
              {room.images[0] ? (
                <img
                  src={getImageUrl(room.images[0])}
                  alt={room.roomNumber}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <Bed size={40} />
                </div>
              )}

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-white text-sm font-medium bg-black/60 px-3 py-1 rounded">
                  Click to view full
                </div>
              </div>

              <div className="absolute top-2 left-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  room.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {room.availability ? 'Available' : 'Occupied'}
                </span>
              </div>

              {room.images.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  {room.images.length} photos
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-gray-900">Room {room.roomNumber}</h3>
                <span className="text-sm text-gray-500">Floor {room.floorNumber}</span>
              </div>

              <p className="text-sm text-gray-600 capitalize mb-3">{room.type} Room</p>

              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium mb-3 ${getStatusColor(room.status)}`}>
                <div className="w-2 h-2 rounded-full bg-current"></div>
                {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
              </div>

              <div className="grid grid-cols-3 gap-1">
                {(['clean', 'dirty', 'maintenance'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(room._id, status)}
                    disabled={updating === room._id || room.status === status}
                    className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-all ${
                      room.status === status
                        ? 'bg-amber-600 text-white cursor-default'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                    }`}
                  >
                    {updating === room._id ? (
                      <Loader2 size={14} className="animate-spin mx-auto" />
                    ) : (
                      status.charAt(0).toUpperCase() + status.slice(1)
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Bed size={48} className="mx-auto mb-3 text-gray-300" />
          <p>No rooms found matching your filters.</p>
        </div>
      )}
    </>
  );
}*/