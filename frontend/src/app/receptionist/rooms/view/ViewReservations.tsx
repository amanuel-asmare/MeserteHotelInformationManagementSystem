'use client';
import { Image } from 'react-native';

import { useState, useEffect, useMemo } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Calendar, Users, DollarSign, Image as ImageIcon,
  CheckCircle, CreditCard, Hotel, ArrowLeft, ArrowRight, Clock, History, ListChecks,
  Hourglass, XCircle, CheckSquare, Crown, BookOpenCheck
} from 'lucide-react';
import axios from 'axios';
import { format, isPast, parseISO, isToday } from 'date-fns';
import ImageCarousel from '../../../../../components/ui/ImageCarousel';
import { useAuth } from '../../../../../context/AuthContext';
import { Button } from '../../../../../components/ui/Button';

interface Room {
  _id: string;
  roomNumber: string;
  type: 'single' | 'double' | 'triple';
  price: number;
  images?: string[];
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

interface Booking {
  _id: string;
  user: User;
  room: Room;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  guests: number;
  createdAt: string;
  updatedAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

export default function ReceptionistViewReservations() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [imageCarousel, setImageCarousel] = useState<string[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategoryTab, setActiveCategoryTab] = useState<'active' | 'history'>('active');
  const [activeStatusFilter, setActiveStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [minTimePassed, setMinTimePassed] = useState(false);
  
  // FIX: Store random values in state to avoid hydration mismatch
  const [particles, setParticles] = useState<{x: number, rotate: number}[]>([]);

  const bookingsPerPage = 10;

  // Royal Loading Delay & Particle Generation
  useEffect(() => {
    // Generate stable random values for client-side only
    setParticles([
      { x: Math.random() * 100 - 50, rotate: 0 },
      { x: Math.random() * 100 - 50, rotate: 0 },
      { x: Math.random() * 100 - 50, rotate: 0 }
    ]);

    const timer = setTimeout(() => setMinTimePassed(true), 3000); // 3s luxury load
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user) {
      fetchAllBookings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAllBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/bookings/receptionist/all-bookings`, {
        withCredentials: true,
      });
      setBookings(res.data);
    } catch (err: any) {
      console.error('Failed to load all bookings:', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (image: string) => {
    if (!image) return '/placeholder-room.jpg';
    if (image.startsWith('http')) return image;
    return image;
  };

  const getBookingCategory = (booking: Booking) => {
    const isCheckoutDatePast = isPast(parseISO(booking.checkOut));
    if (booking.status === 'cancelled' || booking.status === 'completed' || isCheckoutDatePast) {
      return 'history';
    }
    return 'active';
  };

  const filteredAndCategorizedBookings = useMemo(() => {
    return bookings.filter(booking => {
      // Safety Checks
      const roomNum = booking.room?.roomNumber?.toLowerCase() || '';
      const fName = booking.user?.firstName?.toLowerCase() || '';
      const lName = booking.user?.lastName?.toLowerCase() || '';
      const email = booking.user?.email?.toLowerCase() || '';
      const status = booking.status?.toLowerCase() || '';
      const payment = booking.paymentStatus?.toLowerCase() || '';

      const searchLower = searchTerm.toLowerCase();
      
      const matchesSearch = (
        roomNum.includes(searchLower) ||
        fName.includes(searchLower) ||
        lName.includes(searchLower) ||
        email.includes(searchLower) ||
        status.includes(searchLower) ||
        payment.includes(searchLower)
      );

      const categoryMatches = getBookingCategory(booking) === activeCategoryTab;
      const statusMatches = activeStatusFilter === 'all' || booking.status === activeStatusFilter;

      return matchesSearch && categoryMatches && statusMatches;
    });
  }, [bookings, searchTerm, activeCategoryTab, activeStatusFilter]);

  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredAndCategorizedBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredAndCategorizedBookings.length / bookingsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleMarkAsCompleted = async (bookingId: string) => {
    if (!confirm("Are you sure you want to mark this booking as 'Completed'? This action cannot be undone.")) {
      return;
    }
    try {
      await axios.put(`${API_BASE}/api/bookings/receptionist/${bookingId}/complete`, {}, {
        withCredentials: true,
      });
      alert('Booking marked as completed successfully!');
      fetchAllBookings();
    } catch (err: any) {
      console.error('Failed to mark booking as completed:', err.response?.data?.message || err.message);
      alert(err.response?.data?.message || 'Failed to update booking status.');
    }
  };

  const statusFilterButtons = [
    { status: 'all', label: 'All', icon: ListChecks },
    { status: 'pending', label: 'Pending', icon: Hourglass },
    { status: 'confirmed', label: 'Confirmed', icon: CheckSquare },
    { status: 'cancelled', label: 'Cancelled', icon: XCircle },
    { status: 'completed', label: 'Completed', icon: CheckCircle },
  ];

  // --- ROYAL LOADING SCREEN ---
  if (loading || !minTimePassed) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-950 via-slate-900 to-black flex items-center justify-center overflow-hidden z-50">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        {/* Floating Icons - Using stable state 'particles' */}
        {particles.length > 0 && [BookOpenCheck, Hotel, Users].map((Icon, i) => (
           <motion.div
             key={i}
             className="absolute text-blue-500/20"
             // Use the stable 'x' value from state instead of Math.random() directly
             initial={{ y: '100vh', x: `${particles[i].x}%`, rotate: 0 }}
             animate={{ y: '-20vh', rotate: 360 }}
             transition={{ 
               duration: 10 + i * 2, 
               repeat: Infinity, 
               ease: "linear"
             }}
             style={{ left: `${20 + i * 30}%` }}
           >
             <Icon size={80 + i * 10} />
           </motion.div>
        ))}

        <motion.div 
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center px-8"
        >
            <div className="w-32 h-32 mx-auto mb-8 relative">
                <motion.div 
                   animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl"
                />
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-800 rounded-full flex items-center justify-center shadow-2xl border-4 border-blue-400/30 relative z-10">
                    <Crown className="text-white w-14 h-14 animate-pulse" />
                </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
              GUEST <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">RESERVATIONS</span>
            </h2>
            <p className="text-blue-200/70 font-medium text-lg tracking-widest uppercase">
              Syncing Booking Data...
            </p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {imageCarousel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setImageCarousel(null)}
          >
            <motion.div
              initial={{ scale: 0.7, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.7, y: 50 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-4xl w-full"
              onClick={e => e.stopPropagation()}
            >
              <ImageCarousel images={imageCarousel.map(getImageUrl)} />
              <button
                onClick={() => setImageCarousel(null)}
                className="absolute -top-10 right-0 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors duration-200"
                aria-label="Close image carousel"
              >
                <XCircle size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
              className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg"
            >
              <Hotel size={28} />
            </motion.div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Guest Reservations</h1>
              <p className="text-gray-600 text-lg">Efficiently manage all room bookings</p>
            </div>
          </div>
        </div>

        {/* Category Tabs for Active/History */}
        <div className="mb-6 flex gap-4 border-b border-gray-200">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`pb-3 px-4 flex items-center gap-2 font-semibold text-lg transition-colors duration-200 ${activeCategoryTab === 'active' ? 'border-b-3 border-blue-600 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setActiveCategoryTab('active'); setActiveStatusFilter('all'); setCurrentPage(1); }}
          >
            <ListChecks size={22} /> Active Reservations
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`pb-3 px-4 flex items-center gap-2 font-semibold text-lg transition-colors duration-200 ${activeCategoryTab === 'history' ? 'border-b-3 border-blue-600 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setActiveCategoryTab('history'); setActiveStatusFilter('all'); setCurrentPage(1); }}
          >
            <History size={22} /> Reservation History
          </motion.button>
        </div>

        {/* Status Filter Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          {statusFilterButtons.map((btn) => (
            <motion.button
              key={btn.status}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setActiveStatusFilter(btn.status as BookingStatus | 'all'); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                ${activeStatusFilter === btn.status
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <btn.icon size={18} /> {btn.label}
            </motion.button>
          ))}
        </div>

        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by room, guest name, email, or status..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
          />
        </motion.div>

        {/* Bookings List */}
        <div className="space-y-4">
          {currentBookings.length > 0 ? (
            <AnimatePresence>
              {currentBookings.map(booking => {
                const isCheckOutDatePast = isPast(parseISO(booking.checkOut));
                const isCheckOutToday = isToday(parseISO(booking.checkOut));
                const shouldShowCheckoutWarning = (isCheckOutDatePast || isCheckOutToday) && booking.status !== 'completed' && booking.status !== 'cancelled';

                // Safely access nested properties with defaults
                const roomNumber = booking.room?.roomNumber || 'Unknown';
                const roomType = booking.room?.type || 'Unknown';
                const roomPrice = booking.room?.price || 0;
                const guestName = booking.user ? `${booking.user.firstName} ${booking.user.lastName}` : 'Unknown Guest';
                const guestEmail = booking.user?.email || 'No Email';
                const guestPhone = booking.user?.phoneNumber;
                const roomImages = booking.room?.images;

                return (
                  <motion.div
                    key={booking._id}
                    layout
                    initial={{ opacity: 0, y: 30, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col lg:flex-row gap-6 relative overflow-hidden group hover:shadow-xl transition-shadow duration-300"
                  >
                    {shouldShowCheckoutWarning && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 shadow-md z-10"
                      >
                        <Clock size={16} /> {isCheckOutToday ? 'Check-out Today!' : 'Checkout Passed!'}
                      </motion.div>
                    )}

                    <div className="w-full lg:w-56 flex-shrink-0 relative overflow-hidden rounded-xl shadow-md">
                      {roomImages && roomImages[0] ? (
                        <motion.img
                          src={getImageUrl(roomImages[0])}
                          alt={`Room ${roomNumber}`}
                          className="w-full h-40 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                          onClick={() => setImageCarousel(roomImages!)}
                          whileHover={{ scale: 1.02 }}
                          tabIndex={0}
                          role="button"
                        />
                      ) : (
                        <div className="w-full h-40 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                          <ImageIcon size={50} />
                        </div>
                      )}
                      {roomImages && roomImages.length > 1 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1"
                        >
                          <ImageIcon size={12} /> {roomImages.length} photos
                        </motion.div>
                      )}
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6">
                      <div className="flex flex-col">
                        <h3 className="font-bold text-xl text-gray-900 mb-1">Room {roomNumber}</h3>
                        <p className="text-base text-gray-700"><Hotel size={16} className="inline mr-1 text-blue-500" /> {roomType.charAt(0).toUpperCase() + roomType.slice(1)} Room</p>
                        <p className="text-sm text-gray-500">ETB {roomPrice}/night</p>
                      </div>

                      <div className="flex flex-col">
                        <p className="text-sm text-gray-600 font-medium">Guest:</p>
                        <p className="text-base font-semibold text-gray-800">{guestName}</p>
                        <p className="text-sm text-gray-500">{guestEmail}</p>
                        {guestPhone && <p className="text-sm text-gray-500">{guestPhone}</p>}
                      </div>

                      <div className="flex flex-col">
                        <p className="text-sm text-gray-600 font-medium">Booking Period:</p>
                        <p className="text-base text-gray-800"><Calendar size={16} className="inline mr-1 text-purple-500" /> {format(parseISO(booking.checkIn), 'MMM dd, yyyy')} - {format(parseISO(booking.checkOut), 'MMM dd, yyyy')}</p>
                        <p className="text-base text-gray-800"><Users size={16} className="inline mr-1 text-green-500" /> {booking.guests} Guests</p>
                      </div>

                      <div className="flex flex-col">
                        <p className="text-sm text-gray-600 font-medium">Total Price:</p>
                        <p className="text-2xl font-extrabold text-amber-600"><DollarSign size={20} className="inline mr-1" /> ETB {booking.totalPrice.toLocaleString()}</p>
                      </div>

                      <div className="flex flex-col">
                        <p className="text-sm text-gray-600 font-medium">Booking Status:</p>
                        <span className={`px-3 py-1 text-sm rounded-full font-semibold inline-flex items-center gap-1 min-w-[100px] justify-center
                          ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                          {booking.status === 'pending' && <Hourglass size={16} />}
                          {booking.status === 'confirmed' && <CheckSquare size={16} />}
                          {booking.status === 'cancelled' && <XCircle size={16} />}
                          {booking.status === 'completed' && <CheckCircle size={16} />}
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <p className="text-sm text-gray-600 font-medium">Payment Status:</p>
                        <span className={`px-3 py-1 text-sm rounded-full font-semibold inline-flex items-center gap-1 min-w-[100px] justify-center
                          ${booking.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                            booking.paymentStatus === 'pending' ? 'bg-orange-100 text-orange-800' :
                            booking.paymentStatus === 'refunded' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          <CreditCard size={16} /> {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                        </span>
                      </div>
                    </div>

                    {activeCategoryTab === 'active' && shouldShowCheckoutWarning && booking.status !== 'completed' && booking.status !== 'cancelled' && (
                      <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4 lg:mt-0 flex items-center justify-end lg:self-center"
                      >
                        <Button
                          onClick={() => handleMarkAsCompleted(booking._id)}
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 px-5 py-2 rounded-lg text-base shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <CheckCircle size={20} /> Mark as Completed
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center py-16 bg-white rounded-xl shadow-md border border-gray-100"
            >
              <Hotel size={60} className="mx-auto mb-4 text-gray-300" />
              <p className="text-xl text-gray-500 font-medium">No {activeCategoryTab} reservations found matching your criteria.</p>
              <p className="text-md text-gray-400 mt-2">Try adjusting your search or filters.</p>
            </motion.div>
          )}
        </div>

        {/* Pagination Controls */}
        {filteredAndCategorizedBookings.length > bookingsPerPage && (
          <div className="flex justify-center items-center mt-10 space-x-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-3 border border-gray-300 rounded-full hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Previous page"
            >
              <ArrowLeft size={22} />
            </motion.button>
            <span className="text-lg font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-3 border border-gray-300 rounded-full hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Next page"
            >
              <ArrowRight size={22} />
            </motion.button>
          </div>
        )}
      </motion.div>
    </>
  );
}/*'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Calendar, Users, DollarSign, Image as ImageIcon,
  CheckCircle, CreditCard, Hotel, Loader2, ArrowLeft, ArrowRight, Clock, History, ListChecks
} from 'lucide-react';
import axios from 'axios';
import { format, isPast, parseISO } from 'date-fns';
import ImageCarousel from '../../../../../components/ui/ImageCarousel';
import { useAuth } from '../../../../../context/AuthContext';
import { Button } from '../../../../../components/ui/Button'; // Assuming you have a button component

interface Room {
  _id: string;
  roomNumber: string;
  type: 'single' | 'double' | 'triple';
  price: number;
  images?: string[];
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

interface Booking {
  _id: string;
  user: User;
  room: Room;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  guests: number;
  createdAt: string;
  updatedAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ReceptionistViewReservations() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [imageCarousel, setImageCarousel] = useState<string[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active'); // New state for tabs
  const bookingsPerPage = 10;

  useEffect(() => {
    if (user) {
      fetchAllBookings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAllBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/bookings/receptionist/all-bookings`, {
        withCredentials: true,
      });
      setBookings(res.data);
    } catch (err: any) {
      console.error('Failed to load all bookings:', err.response?.data?.message || err.message);
      alert(err.response?.data?.message || 'Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (image: string) => {
    if (!image) return '/placeholder-room.jpg';
    if (image.startsWith('http')) return image;
    return image;
  };

  const getBookingCategory = (booking: Booking) => {
    const isCheckoutPast = isPast(parseISO(booking.checkOut));
    if (booking.status === 'cancelled' || booking.status === 'completed' || isCheckoutPast) {
      return 'history';
    }
    return 'active';
  };

  const filteredAndCategorizedBookings = useMemo(() => {
    return bookings.filter(booking => {
      const searchLower = searchTerm.toLowerCase();
      return (
        booking.room.roomNumber.toLowerCase().includes(searchLower) ||
        booking.user.firstName.toLowerCase().includes(searchLower) ||
        booking.user.lastName.toLowerCase().includes(searchLower) ||
        booking.user.email.toLowerCase().includes(searchLower) ||
        booking.status.toLowerCase().includes(searchLower) ||
        booking.paymentStatus.toLowerCase().includes(searchLower)
      );
    }).filter(booking => {
      const category = getBookingCategory(booking);
      return activeTab === category;
    });
  }, [bookings, searchTerm, activeTab]);

  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredAndCategorizedBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredAndCategorizedBookings.length / bookingsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Function to handle "Mark as Completed" action
  const handleMarkAsCompleted = async (bookingId: string) => {
    if (!confirm("Are you sure you want to mark this booking as 'Completed'? This action cannot be undone.")) {
      return;
    }
    try {
      setLoading(true);
      // Assuming you have an API endpoint for this action
      await axios.put(`${API_BASE}/api/bookings/receptionist/${bookingId}/complete`, {}, {
        withCredentials: true,
      });
      alert('Booking marked as completed successfully!');
      fetchAllBookings(); // Refresh the list
    } catch (err: any) {
      console.error('Failed to mark booking as completed:', err.response?.data?.message || err.message);
      alert(err.response?.data?.message || 'Failed to update booking status.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100">
        <div className="flex items-center space-x-2 text-indigo-700">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-xl font-medium">Loading Reservations...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* IMAGE CAROUSEL MODAL 
      <AnimatePresence>
        {imageCarousel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setImageCarousel(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl w-full"
              onClick={e => e.stopPropagation()}
            >
              <ImageCarousel images={imageCarousel.map(getImageUrl)} />
              <button
                onClick={() => setImageCarousel(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white"
              >
                X
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white">
            <Hotel size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Guest Reservations</h1>
            <p className="text-gray-600">Manage and view all room bookings</p>
          </div>
        </div>
      </div>

      {/* Tabs for Active/History /}
      <div className="mb-6 flex gap-4 border-b border-gray-200">
        <button
          className={`pb-3 px-4 flex items-center gap-2 font-medium text-lg ${activeTab === 'active' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => { setActiveTab('active'); setCurrentPage(1); }}
        >
          <ListChecks size={20} /> Active Reservations
        </button>
        <button
          className={`pb-3 px-4 flex items-center gap-2 font-medium text-lg ${activeTab === 'history' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => { setActiveTab('history'); setCurrentPage(1); }}
        >
          <History size={20} /> Reservation History
        </button>
      </div>

      {/* Search /}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by room, guest name, email, or status..."
          value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Bookings List /}
      <div className="space-y-4">
        {currentBookings.length > 0 ? (
          currentBookings.map(booking => {
            const isCheckoutPast = isPast(parseISO(booking.checkOut));
            const shouldShowCheckoutWarning = isCheckoutPast && booking.status !== 'completed' && booking.status !== 'cancelled';

            return (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 relative"
              >
                {shouldShowCheckoutWarning && (
                  <div className="absolute top-3 right-3 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Clock size={16} /> Checkout Passed!
                  </div>
                )}

                <div className="w-full md:w-48 flex-shrink-0">
                  {booking.room.images?.[0] ? (
                    <img
                      src={getImageUrl(booking.room.images[0])}
                      alt={`Room ${booking.room.roomNumber}`}
                      className="w-full h-32 object-cover rounded-xl cursor-pointer"
                      onClick={() => setImageCarousel(booking.room.images!)}
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                      <ImageIcon size={40} />
                    </div>
                  )}
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Room {booking.room.roomNumber} ({booking.room.type})</h3>
                    <p className="text-sm text-gray-600">ETB {booking.room.price}/night</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 font-medium">Guest:</p>
                    <p className="text-sm text-gray-600">{booking.user.firstName} {booking.user.lastName}</p>
                    <p className="text-xs text-gray-500">{booking.user.email}</p>
                    {booking.user.phoneNumber && <p className="text-xs text-gray-500">{booking.user.phoneNumber}</p>}
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 font-medium">Dates:</p>
                    <p className="text-sm text-gray-600"><Calendar size={14} className="inline mr-1" /> {format(new Date(booking.checkIn), 'MMM dd, yyyy')} - {format(new Date(booking.checkOut), 'MMM dd, yyyy')}</p>
                    <p className="text-sm text-gray-600"><Users size={14} className="inline mr-1" /> {booking.guests} Guests</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 font-medium">Total Price:</p>
                    <p className="text-lg font-bold text-amber-600"><DollarSign size={16} className="inline mr-1" /> ETB {booking.totalPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 font-medium">Booking Status:</p>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 font-medium">Payment Status:</p>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      booking.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                      booking.paymentStatus === 'pending' ? 'bg-orange-100 text-orange-800' :
                      booking.paymentStatus === 'refunded' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      <CreditCard size={14} className="inline mr-1" /> {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                    </span>
                  </div>
                </div>

                {activeTab === 'active' && shouldShowCheckoutWarning && booking.status !== 'completed' && (
                  <div className="mt-4 md:mt-0 flex items-center justify-end">
                    <Button
                      onClick={() => handleMarkAsCompleted(booking._id)}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    >
                      <CheckCircle size={18} /> Mark as Completed
                    </Button>
                  </div>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Hotel size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No {activeTab} reservations found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls /}
      {filteredAndCategorizedBookings.length > bookingsPerPage && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 border rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 border rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      )}
    </>
  );
}*/