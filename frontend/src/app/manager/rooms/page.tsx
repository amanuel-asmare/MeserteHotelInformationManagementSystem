'use client';
import React from 'react'; // Added React import for the Pagination component
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
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition">
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
                currentPage === num ? 'bg-amber-600 text-white shadow-md' : 'hover:bg-amber-100 dark:hover:bg-amber-900/50'
              }`}
            >
              {num}
            </button>
          )}
        </React.Fragment>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition">
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
    const isRefresh = !loading;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await axios.get('/api/rooms', { withCredentials: true });
      setRooms(res.data);
      if (!isRefresh) setCurrentPage(1); // Reset to first page only on initial load
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchRooms();
  }, []);

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
  };
  
  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);


  // === ANIMATION VARIANTS FOR PAGE TURN EFFECT ===
  const pageTurnVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '50px' : '-50px',
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '50px' : '-50px',
      opacity: 0,
    }),
  };

  // === HELPER FUNCTIONS (RESTORED) ===
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'clean': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'dirty': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'maintenance': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
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
      <div className="flex items-center justify-center h-full">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-8 border-t-amber-600 border-amber-200 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <Bed className="w-10 h-10 text-amber-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SUCCESS TOAST (RESTORED) */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50, transition: { duration: 0.2 } }}
            className="fixed top-24 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
          >
            <CheckCircle size={20} />
            Status updated successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL-SCREEN CAROUSEL (RESTORED) */}
      <AnimatePresence>
        {carouselImages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
            onClick={closeCarousel}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="relative w-full h-full max-w-5xl max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence initial={false}>
                <motion.img
                  key={carouselIndex}
                  src={getImageUrl(carouselImages[carouselIndex])}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0.5 }}
                  transition={{ duration: 0.3 }}
                  alt={`Room image ${carouselIndex + 1}`}
                  className="w-full h-full object-contain rounded-2xl"
                />
              </AnimatePresence>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                {carouselIndex + 1} / {carouselImages.length}
              </div>

              <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-sm transition-colors">
                <ChevronLeft size={28} className="text-white" />
              </button>
              <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-sm transition-colors">
                <ChevronRight size={28} className="text-white" />
              </button>

              <button onClick={closeCarousel} className="absolute top-4 right-4 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-transform hover:scale-110">
                <X size={24} className="text-gray-800" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER (RESTORED) */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Bed size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Room Status</h1>
            <p className="text-gray-600 dark:text-gray-400">Monitor and update room cleaning status in real-time.</p>
          </div>
        </div>

        <button onClick={fetchRooms} disabled={refreshing} className="flex items-center gap-2 px-5 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed">
          {refreshing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* SEARCH & FILTER (RESTORED) */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Search by room number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-800" />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="w-full sm:w-auto pl-12 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 appearance-none bg-white dark:bg-gray-800">
            <option value="all">All Statuses</option>
            <option value="clean">Clean</option>
            <option value="dirty">Dirty</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
        </div>
      </div>
      
      {/* Informative Display */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing <span className="font-bold text-gray-800 dark:text-gray-200">{filteredRooms.length > 0 ? indexOfFirstRoom + 1 : 0}</span> 
        - <span className="font-bold text-gray-800 dark:text-gray-200">{Math.min(indexOfLastRoom, filteredRooms.length)}</span> of 
        <span className="font-bold text-gray-800 dark:text-gray-200"> {filteredRooms.length}</span> rooms.
      </div>


      {/* ANIMATED ROOM GRID */}
      <AnimatePresence initial={false} custom={animationDirection} mode="wait">
        <motion.div
          key={currentPage}
          custom={animationDirection}
          variants={pageTurnVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.3 }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {currentRooms.map((room, index) => (
            <motion.div
              key={room._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300 flex flex-col"
            >
              {/* === ROOM CARD CONTENT (RESTORED) === */}
              <div className="h-44 bg-gray-100 dark:bg-gray-700 relative overflow-hidden group cursor-pointer" onClick={() => openCarousel(room.images, 0)}>
                <img src={getImageUrl(room.images[0])} alt={`Room ${room.roomNumber}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-sm font-medium bg-black/60 px-3 py-1 rounded-full">View Photos</p>
                </div>
                {room.images.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-bold">{room.images.length} photos</div>
                )}
              </div>

              <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Room {room.roomNumber}</h3>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${room.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {room.availability ? 'Available' : 'Occupied'}
                  </span>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mb-3">Floor {room.floorNumber} • {room.type} Room</p>

                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium mb-4 self-start ${getStatusColor(room.status)}`}>
                  <div className="w-2 h-2 rounded-full bg-current"></div>
                  {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
                  {(['clean', 'dirty', 'maintenance'] as const).map((status) => (
                    <button key={status} onClick={() => updateStatus(room._id, status)} disabled={updating === room._id || room.status === status}
                      className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all duration-200 disabled:opacity-100 disabled:cursor-default ${
                        room.status === status ? 'bg-amber-600 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {updating === room._id && room.status !== status ? (
                        <Loader2 size={14} className="animate-spin mx-auto" />
                      ) : ( status.charAt(0).toUpperCase() + status.slice(1) )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* No rooms found message */}
      {filteredRooms.length === 0 && !loading && (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400 col-span-full">
          <Bed size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-xl font-semibold mb-1">No Rooms Found</h3>
          <p>Try adjusting your search or filter criteria.</p>
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
}