'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bed, Search, Filter, ChevronDown, CheckCircle, Calendar, Users, DollarSign,
  Image as ImageIcon, X, Bath, CreditCard, Clock, History, ListChecks, Crown, PartyPopper, ArrowRight
} from 'lucide-react';
import axios from 'axios';
import ImageCarousel from '../../../../components/ui/ImageCarousel';
import { useAuth } from '../../../../context/AuthContext';
import { format, isPast, parseISO, isSameDay } from 'date-fns';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLanguage } from '../../../../context/LanguageContext';

// --- TYPES ---
interface Room {
  _id: string;
  roomNumber: string;
  type: 'single' | 'double' | 'triple';
  price: number;
  availability: boolean;
  floorNumber: number;
  description: string;
  images?: string[];
  status: 'clean' | 'dirty' | 'maintenance';
  capacity: number;
  amenities: string[];
  numberOfBeds: number;
  bathrooms: number;
}

interface Booking {
  _id: string;
  room: Room | null;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  },
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  guests: number;
  paymentId?: string;
  createdAt: string;
}

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://mesertehotelinformationmanagementsystem.onrender.com';
// --- FIREWORKS COMPONENT ---
const FireworkParticle = ({ delay, x, color }: { delay: number; x: number; color: string }) => (
  <motion.div
    initial={{ y: 0, x: x, opacity: 1, scale: 0 }}
    animate={{
      y: [0, -window.innerHeight * 0.6],
      x: [x, x + (Math.random() - 0.5) * 100],
      opacity: [1, 1, 0],
      scale: [1, 2, 0],
    }}
    transition={{ duration: 1.5, delay, ease: "easeOut" }}
    className="absolute bottom-0 w-3 h-3 rounded-full"
    style={{ backgroundColor: color, left: '50%' }}
  >
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1, 0], x: (Math.random() - 0.5) * 200, y: (Math.random() - 0.5) * 200 }}
        transition={{ duration: 0.8, delay: delay + 1, repeat: Infinity }}
        className="absolute w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
    ))}
  </motion.div>
);

const FireworksDisplay = () => {
  const colors = ['#FFD700', '#FF4500', '#00FF00', '#00BFFF', '#FF00FF'];
  return (
    <div className="fixed inset-0 pointer-events-none z-[60]">
      {[...Array(15)].map((_, i) => (
        <FireworkParticle 
          key={i} 
          delay={i * 0.3} 
          x={(Math.random() - 0.5) * window.innerWidth * 0.8} 
          color={colors[i % colors.length]} 
        />
      ))}
    </div>
  );
};

export default function CustomerBookingClient() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'single' | 'double' | 'triple'>('all');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('1');
  const [showBookingModal, setShowBookingModal] = useState<Room | null>(null);
  const [imageCarousel, setImageCarousel] = useState<string[] | null>(null);
  const [tab, setTab] = useState<'rooms' | 'bookings'>('rooms');
  const [bookingStatusTab, setBookingStatusTab] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');
  const [showAvailableOnly, setShowAvailableOnly] = useState(true);
  const [cancelConfirmation, setCancelConfirmation] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/public/rooms`);
      setRooms(res.data);
    } catch (err) {
      console.error("Failed to load rooms", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/bookings/my-bookings`, { withCredentials: true });
      setBookings(res.data);
    } catch (err) {
      console.warn('Could not load bookings');
    }
  };

  // --- PAYMENT VERIFICATION ---
  useEffect(() => {
    const tx_ref = searchParams.get('verify_tx_ref');
    
    if (tx_ref) {
      const verify = async () => {
        try {
          const res = await axios.post(`${API_BASE}/api/bookings/verify-payment`, 
            { tx_ref },
            { withCredentials: true }
          );

          if (res.data.status === 'success' || res.status === 200) {
            setSuccessMessage(t('paymentConfirmed') || 'Payment Successful! Room Booked.');
            setShowSuccessModal(true); 
            await fetchRooms();
            await fetchBookings();
            setTab('bookings'); 
          }
        } catch (error: any) {
          console.error("Failed to verify payment:", error);
          alert(error.response?.data?.message || 'Payment verification failed. Room might be taken.');
        } finally {
          router.replace('/customer/bookings', { scroll: false });
        }
      };
      verify();
    }
  }, [searchParams, t]);

  useEffect(() => {
    fetchRooms();
    fetchBookings();
  }, []);

  useEffect(() => {
    const passedCheckouts = bookings.filter(booking =>
      isPast(parseISO(booking.checkOut)) &&
      booking.status !== 'completed' &&
      booking.status !== 'cancelled'
    ).length;
    setNotificationCount(passedCheckouts);
  }, [bookings]);

  // --- CREATE NEW BOOKING ---
  const handleBooking = async (roomId: string) => {
    if (!checkIn || !checkOut || !guests) {
      alert(t('selectDatesGuests' as any) || "Please select dates");
      return;
    }
    try {
      // 1. Create Booking (Pending)
      const bookingRes = await axios.post(
        `${API_BASE}/api/bookings/`,
        { roomId, checkIn, checkOut, guests: Number(guests) },
        { withCredentials: true }
      );
      const booking = bookingRes.data;

      // 2. Initiate Payment directly
      await handlePayNow(booking._id);

    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create booking');
    }
  };

  // --- PAY NOW FOR EXISTING PENDING BOOKING ---
  const handlePayNow = async (bookingId: string) => {
    try {
      const paymentRes = await axios.post(
        `${API_BASE}/api/bookings/payment`,
        { bookingId: bookingId }, // Send the existing booking ID
        { withCredentials: true }
      );
      
      if(paymentRes.data.checkoutUrl) {
          window.location.href = paymentRes.data.checkoutUrl;
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to initiate payment');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await axios.put(`${API_BASE}/api/bookings/${bookingId}/cancel`, {}, { withCredentials: true });
      alert(t('bookingCancelled' as any) || "Booking Cancelled");
      fetchBookings();
      fetchRooms();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || room.type === typeFilter;
    const matchesAvailability = !showAvailableOnly || (room.availability && room.status === 'clean');
    return matchesSearch && matchesType && matchesAvailability;
  });

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      if (bookingStatusTab === 'all') return true;
      return booking.status === bookingStatusTab;
    });
  }, [bookings, bookingStatusTab]);

  const getImageUrl = (image: string) => {
    if (!image) return '/placeholder-room.jpg';
    if (image.startsWith('http')) return image;
    return `${API_BASE}${image}`;
  };

  // Helper to format date ranges
  const renderDateRange = (start: string, end: string) => {
    const startDate = parseISO(start);
    const endDate = parseISO(end);

    if (isSameDay(startDate, endDate)) {
      return (
        <div className="bg-gray-50 p-3 rounded-xl col-span-2">
            <p className="text-xs text-gray-400 uppercase font-bold mb-1">{t('date' as any) || "Date"}</p>
            <p className="font-bold text-gray-700">{format(startDate, 'MMM dd, yyyy')}</p>
        </div>
      );
    } else {
      return (
        <>
            <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">{t('checkInLabel') || "Check In"}</p>
                <p className="font-bold text-gray-700">{format(startDate, 'MMM dd')}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-xs text-gray-400 uppercase font-bold mb-1">{t('checkOutLabel') || "Check Out"}</p>
                <p className="font-bold text-gray-700">{format(endDate, 'MMM dd')}</p>
            </div>
        </>
      );
    }
  };

  if (loading || !minTimePassed) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-amber-950 via-black to-amber-900 flex items-center justify-center overflow-hidden z-[100]">
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5 }} className="relative z-10 text-center px-8">
          <div className="flex justify-center mb-6">
            <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity }}>
               <Crown size={80} className="text-yellow-400 drop-shadow-2xl" />
            </motion.div>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-amber-300 tracking-widest mb-4 font-serif">
            {t('luxuryHotel' as any) || "MESERET"}
          </h2>
          <p className="text-2xl text-amber-100 font-light tracking-widest">
            {t('preparingSuite' as any) || "Experience Luxury"}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50 pb-20">
      
      <AnimatePresence>
        {showSuccessModal && <FireworksDisplay />}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.5, y: 100, rotate: -10 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.5, y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100/50 to-transparent pointer-events-none" />
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1, rotate: 360 }} 
                transition={{ delay: 0.2, duration: 0.8 }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
              >
                <PartyPopper size={48} className="text-green-600" />
              </motion.div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">
                {t('paymentConfirmed') || "Payment Successful!"}
              </h2>
              <p className="text-gray-600 mb-8 font-medium">
                {successMessage}
              </p>
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                {t('continue' as any) || "View My Booking"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {imageCarousel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setImageCarousel(null)}
          >
            <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
              <ImageCarousel images={imageCarousel.map(getImageUrl)} />
              <button onClick={() => setImageCarousel(null)} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white">
                <X size={24} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Bed size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('bookRoomTitle') || "Book a Stay"}</h1>
            <p className="text-gray-600">{t('bookRoomDesc') || "Find your perfect room"}</p>
          </div>
        </div>
        <div className="flex p-1 bg-white rounded-xl border border-gray-200 shadow-sm">
          <button onClick={() => setTab('rooms')} className={`px-6 py-2.5 rounded-lg font-bold transition-all ${tab === 'rooms' ? 'bg-amber-100 text-amber-800' : 'text-gray-500 hover:bg-gray-50'}`}>
            {t('browseRooms') || "Rooms"}
          </button>
          <button onClick={() => setTab('bookings')} className={`px-6 py-2.5 rounded-lg font-bold transition-all relative ${tab === 'bookings' ? 'bg-amber-100 text-amber-800' : 'text-gray-500 hover:bg-gray-50'}`}>
            {t('myBookings') || "My Bookings"}
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {notificationCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {tab === 'rooms' && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-8 flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder={t('searchRooms') || "Search rooms..."} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-amber-500 rounded-xl transition outline-none" />
            </div>
            <div className="flex gap-4">
               <div className="relative min-w-[180px]">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="w-full pl-12 pr-10 py-3 bg-gray-50 border-transparent focus:bg-white border-2 focus:border-amber-500 rounded-xl appearance-none cursor-pointer">
                  <option value="all">{t('allTypes') || "All Types"}</option>
                  <option value="single">{t('single') || "Single"}</option>
                  <option value="double">{t('double') || "Double"}</option>
                  <option value="triple">{t('triple') || "Triple"}</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
              <label className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition border-2 border-transparent hover:border-gray-200">
                <input type="checkbox" checked={showAvailableOnly} onChange={e => setShowAvailableOnly(e.target.checked)} className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500" />
                <span className="font-medium text-gray-700">{t('showAvailableOnly') || "Available Only"}</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
            {filteredRooms.length > 0 ? (
              filteredRooms.map(room => (
                <motion.div 
                  key={room._id} 
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="relative h-64 overflow-hidden">
                    {room.images?.[0] ? (
                      <img src={getImageUrl(room.images[0])} alt={`Room ${room.roomNumber}`} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 cursor-pointer" onClick={() => setImageCarousel(room.images!)} />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300"><ImageIcon size={48} /></div>
                    )}
                    <div className="absolute top-4 left-4 flex gap-2">
                       <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full backdrop-blur-md shadow-sm ${room.availability ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                        {room.availability ? (t('available') || "Available") : (t('occupied') || "Occupied")}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{t('room') || "Room"} {room.roomNumber}</h3>
                        <div className="text-right">
                            <span className="block text-2xl font-black text-amber-600">ETB {room.price}</span>
                            <span className="text-xs text-gray-400">{language === 'am' ? '' : '/night'}</span>
                        </div>
                    </div>
                    
                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 h-10">{room.description}</p>
                    
                    <div className="flex items-center gap-4 mb-6 text-gray-400 text-sm border-t border-b border-gray-50 py-4">
                      <div className="flex items-center gap-1"><Users size={16} className="text-amber-500" /> {room.capacity}</div>
                      <div className="flex items-center gap-1"><Bed size={16} className="text-amber-500" /> {room.numberOfBeds}</div>
                      <div className="flex items-center gap-1"><Bath size={16} className="text-amber-500" /> {room.bathrooms}</div>
                    </div>

                    <button 
                      onClick={() => { if (!room.availability) { alert(t('alreadyReserved')); return; } setShowBookingModal(room); }} 
                      disabled={!room.availability}
                      className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                        room.availability 
                        ? 'bg-gray-900 text-white hover:bg-amber-600 shadow-lg hover:shadow-amber-200' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {room.availability ? (t('bookNow') || "Book Now") : (t('notAvailable') || "Unavailable")}
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <Search size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">No rooms found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {tab === 'bookings' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="max-w-5xl mx-auto">
          <div className="flex overflow-x-auto gap-4 pb-4 mb-6 border-b border-gray-200 no-scrollbar">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
              <button key={s} className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold whitespace-nowrap transition-all ${bookingStatusTab === s ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-500 ring-offset-2' : 'bg-white text-gray-500 hover:bg-gray-50'}`} onClick={() => setBookingStatusTab(s as any)}>
                 {s === 'all' ? <ListChecks size={18} /> : s === 'pending' ? <Clock size={18} /> : s === 'confirmed' ? <CheckCircle size={18} /> : s === 'completed' ? <History size={18} /> : <X size={18} />} 
                 <span className="capitalize">{t(s as any) || s}</span>
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {filteredBookings.length > 0 ? (
              filteredBookings.map(booking => {
                const roomImage = booking.room?.images?.[0] ? getImageUrl(booking.room.images[0]) : null;
                return (
                  <motion.div key={booking._id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 relative overflow-hidden">
                    <div className="w-full md:w-56 h-40 bg-gray-100 rounded-2xl overflow-hidden shrink-0">
                       {roomImage ? <img src={roomImage} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full"><ImageIcon className="text-gray-300" /></div>}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                             <h3 className="text-xl font-bold text-gray-900">{t('room') || "Room"} {booking.room?.roomNumber || 'N/A'}</h3>
                             <p className="text-amber-600 font-medium capitalize">{booking.room?.type} Suite</p>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                            {booking.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                        {/* Dynamic Date Rendering */}
                        {renderDateRange(booking.checkIn, booking.checkOut)}

                         <div className="bg-gray-50 p-3 rounded-xl">
                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">{t('guestsLabel') || "Guests"}</p>
                            <p className="font-bold text-gray-700">{booking.guests}</p>
                        </div>
                         <div className="bg-gray-50 p-3 rounded-xl">
                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">{t('total') || "Total"}</p>
                            <p className="font-bold text-amber-600">ETB {booking.totalPrice}</p>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end gap-3">
                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                            <button onClick={() => setCancelConfirmation(booking._id)} className="text-red-500 hover:text-red-700 font-bold text-sm px-4 py-2 hover:bg-red-50 rounded-lg transition">
                                {t('cancelBooking') || "Cancel Booking"}
                            </button>
                        )}
                        
                        {/* PAY NOW BUTTON FOR PENDING BOOKINGS */}
                        {booking.status === 'pending' && (
                            <button 
                              onClick={() => handlePayNow(booking._id)}
                              className="bg-amber-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:shadow-lg hover:bg-amber-700 transition flex items-center gap-2"
                            >
                                <span>{t('payNow' as any) || "Pay Now"}</span>
                                <ArrowRight size={16} />
                            </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <ListChecks size={32} />
                </div>
                <h3 className="text-gray-900 font-bold text-lg">No bookings found</h3>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {cancelConfirmation && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setCancelConfirmation(null)}>
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-3xl p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                        <X size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('confirmCancellation') || "Cancel Booking?"}</h3>
                    <p className="text-gray-500 mb-6">{t('refundNotice') || "This action cannot be undone."}</p>
                    <div className="flex gap-3">
                        <button onClick={() => setCancelConfirmation(null)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition">{t('keepBooking') || "No, Keep"}</button>
                        <button onClick={() => { handleCancelBooking(cancelConfirmation); setCancelConfirmation(null); }} className="flex-1 py-3 bg-red-600 text-white hover:bg-red-700 rounded-xl font-bold shadow-lg transition">{t('yesCancel') || "Yes, Cancel"}</button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBookingModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowBookingModal(null)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-gray-900">{t('bookRoomTitle') || "Book Room"} <span className="text-amber-600">{showBookingModal.roomNumber}</span></h2>
                  <button onClick={() => setShowBookingModal(null)} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={20} /></button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('checkInLabel') || "Check In"}</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none font-medium" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('checkOutLabel') || "Check Out"}</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none font-medium" />
                        </div>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('guestsLabel') || "Guests"}</label>
                    <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="number" min="1" max={showBookingModal.capacity} value={guests} onChange={e => setGuests(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none font-medium" />
                    </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
                <button onClick={() => setShowBookingModal(null)} className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition">{t('cancel') || "Cancel"}</button>
                <button onClick={() => handleBooking(showBookingModal._id)} className="flex-[2] py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-amber-600 shadow-xl hover:shadow-amber-200 transition flex items-center justify-center gap-2">
                    <span>{t('proceedPayment' as any) || "Proceed to Payment"}</span>
                    <CreditCard size={18} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
  



/*'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bed, Search, Filter, ChevronDown, CheckCircle, Calendar, Users, DollarSign,
  Image as ImageIcon, X, Bath, Coffee, CreditCard, Clock, Bell, History, ListChecks, Hotel, Crown
} from 'lucide-react';
import axios from 'axios';
import ImageCarousel from '../../../../components/ui/ImageCarousel';
import { useAuth } from '../../../../context/AuthContext';
import { format, isPast, parseISO } from 'date-fns';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLanguage } from '../../../../context/LanguageContext'; // Import Hook

interface Room {
  _id: string;
  roomNumber: string;
  type: 'single' | 'double' | 'triple';
  price: number;
  availability: boolean;
  floorNumber: number;
  description: string;
  images?: string[];
  status: 'clean' | 'dirty' | 'maintenance';
  capacity: number;
  amenities: string[];
  numberOfBeds: number;
  bathrooms: number;
}

interface Booking {
  _id: string;
  room: Room | null;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  },
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  guests: number;
  paymentId?: string;
  createdAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

export default function CustomerBookingClient() {
  const { t, language } = useLanguage(); // Use Translation Hook
  const { user } = useAuth();
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'single' | 'double' | 'triple'>('all');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('1');
  const [showBookingModal, setShowBookingModal] = useState<Room | null>(null);
  const [success, setSuccess] = useState('');
  const [imageCarousel, setImageCarousel] = useState<string[] | null>(null);
  const [tab, setTab] = useState<'rooms' | 'bookings'>('rooms');
  const [bookingStatusTab, setBookingStatusTab] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');
  const [showAvailableOnly, setShowAvailableOnly] = useState(true);
  const [cancelConfirmation, setCancelConfirmation] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [minTimePassed, setMinTimePassed] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  // --- ROYAL LOADING DELAY ---
  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), 4500);
    return () => clearTimeout(timer);
  }, []);

  // --- FETCH DATA ---
  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/public/rooms`);
      setRooms(res.data);
    } catch (err: any) {
      console.error("Failed to load rooms", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/bookings/my-bookings`, { withCredentials: true });
      setBookings(res.data);
    } catch (err: any) {
      console.warn('Could not load bookings:', err.response?.data?.message);
    }
  };

  // --- PAYMENT VERIFICATION ---
  useEffect(() => {
    const tx_ref = searchParams.get('verify_tx_ref');
    if (tx_ref) {
      const verify = async () => {
        try {
          const res = await axios.post(`${API_BASE}/api/bookings/verify-from-client`, 
            { tx_ref },
            { withCredentials: true }
          );
          setSuccess(res.data.message || t('paymentConfirmed')); // Translated
          fetchBookings(); 
        } catch (error) {
          console.error("Failed to verify payment:", error);
          alert('There was an issue confirming your payment. Please contact support.');
        } finally {
          router.replace('/customer/bookings', { scroll: false });
        }
      };
      verify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, t]);

  // Initial Load
  useEffect(() => {
    fetchRooms();
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Notifications
  useEffect(() => {
    const passedCheckouts = bookings.filter(booking =>
      isPast(parseISO(booking.checkOut)) &&
      booking.status !== 'completed' &&
      booking.status !== 'cancelled'
    ).length;
    setNotificationCount(passedCheckouts);
  }, [bookings]);

  // --- HANDLERS ---
  const handleBooking = async (roomId: string) => {
    if (!checkIn || !checkOut || !guests) {
      // FIX: Cast 'selectDatesGuests' to any
      alert(t('selectDatesGuests' as any));
      return;
    }
    try {
      const bookingRes = await axios.post(
        `${API_BASE}/api/bookings/`,
        { roomId, checkIn, checkOut, guests: Number(guests) },
        { withCredentials: true }
      );
      const booking = bookingRes.data;
      const paymentRes = await axios.post(
        `${API_BASE}/api/bookings/payment`,
        { bookingId: booking._id },
        { withCredentials: true }
      );
      window.location.href = paymentRes.data.checkoutUrl;
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create booking');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await axios.put(`${API_BASE}/api/bookings/${bookingId}/cancel`, {}, { withCredentials: true });
      // FIX: Cast 'bookingCancelled' to any
      setSuccess(t('bookingCancelled' as any));
      fetchBookings();
      fetchRooms();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  // --- FILTERS ---
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || room.type === typeFilter;
    const matchesAvailability = !showAvailableOnly || (room.availability && room.status === 'clean');
    return matchesSearch && matchesType && matchesAvailability;
  });

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      if (bookingStatusTab === 'all') return true;
      return booking.status === bookingStatusTab;
    });
  }, [bookings, bookingStatusTab]);

  const getImageUrl = (image: string) => {
    if (!image) return '/placeholder-room.jpg';
    if (image.startsWith('http')) return image;
    return image;
  };

  // --- ROYAL LOADING SCREEN ---
  if (loading || !minTimePassed) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-amber-950 via-black to-amber-900 flex items-center justify-center overflow-hidden">
        
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-amber-950/50 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15),transparent_70%)]" />
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -100, 0], x: [0, Math.sin(i) * 100, 0], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 8 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
              className="absolute w-96 h-96 bg-gradient-to-r from-yellow-400/20 to-orange-600/20 rounded-full blur-3xl"
              style={{ top: `${20 + i * 10}%`, left: i % 2 === 0 ? "-20%" : "80%" }}
            />
          ))}
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5 }} className="relative z-10 text-center px-8">
          <div className="flex justify-center mb-6">
            <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity }}>
               <Crown size={80} className="text-yellow-400 drop-shadow-2xl" />
            </motion.div>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-amber-300 tracking-widest mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            
            {t('luxuryHotel' as any)}
          </h2>
          <p className="text-2xl text-amber-100 font-light tracking-widest">
           
            {t('preparingSuite' as any)}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
          >
            <CheckCircle size={20} />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {imageCarousel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setImageCarousel(null)}
          >
            <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
              <ImageCarousel images={imageCarousel.map(getImageUrl)} />
              <button onClick={() => setImageCarousel(null)} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white">
                <X size={24} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
            <Bed size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('bookRoomTitle')}</h1>
            <p className="text-gray-600">{t('bookRoomDesc')}</p>
          </div>
        </div>
        <div className="flex gap-2 relative">
          <button onClick={() => setTab('rooms')} className={`px-4 py-2 rounded-xl ${tab === 'rooms' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{t('browseRooms')}</button>
          <button onClick={() => setTab('bookings')} className={`px-4 py-2 rounded-xl ${tab === 'bookings' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{t('myBookings')}</button>
          {notificationCount > 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
              {notificationCount}
            </motion.div>
          )}
        </div>
      </div>

      {tab === 'rooms' && (
        <>
          <div className="mb-6 flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder={t('searchRooms')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl appearance-none bg-white">
                <option value="all">{t('allTypes')}</option>
                <option value="single">{t('single')}</option>
                <option value="double">{t('double')}</option>
                <option value="triple">{t('triple')}</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showAvailableOnly} onChange={e => setShowAvailableOnly(e.target.checked)} className="w-4 h-4 text-amber-600 rounded" />
              <span className="text-sm font-medium text-gray-700">{t('showAvailableOnly')}</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.length > 0 ? (
              filteredRooms.map(room => (
                <motion.div key={room._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
                  <div className="relative mb-4">
                    {room.images?.[0] ? (
                      <img src={getImageUrl(room.images[0])} alt={`Room ${room.roomNumber}`} className="w-full h-48 object-cover rounded-xl cursor-pointer" onClick={() => setImageCarousel(room.images!)} />
                    ) : (
                      <div className="flex items-center justify-center h-48 text-gray-400 bg-gray-100 rounded-xl"><ImageIcon size={40} /></div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium shadow-sm ${room.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {room.availability ? t('available') : t('occupied')}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('room')} {room.roomNumber}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{room.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-amber-600">ETB {room.price}/{language === 'am' ? '' : 'night'}</span>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                 
                      <Users size={16} /> {room.capacity} {t('guests' as any).toLowerCase()}
                      <Bed size={16} /> {room.numberOfBeds} {t('beds' as any).toLowerCase()}
                      <Bath size={16} /> {room.bathrooms} {t('baths' as any).toLowerCase()}
                    </div>
                  </div>
                  <button onClick={() => { if (!room.availability) { alert(t('alreadyReserved')); return; } setShowBookingModal(room); }} className="w-full py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition font-medium" disabled={!room.availability || room.status !== 'clean'}>
                    {room.availability && room.status === 'clean' ? t('bookNow') : t('notAvailable')}
                  </button>
                </motion.div>
              ))
            ) : (
              // FIX: Cast 'noRoomsFound' to any
              <div className="col-span-full text-center py-12 text-gray-500"><Bed size={48} className="mx-auto mb-3 text-gray-300" /><p>{t('noRoomsFound' as any)}</p></div>
            )}
          </div>
        </>
      )}

      {tab === 'bookings' && (
        <>
          <div className="mb-6 flex gap-4 border-b border-gray-200 overflow-x-auto">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
              <button key={s} className={`pb-3 px-4 flex items-center gap-2 font-medium text-lg whitespace-nowrap ${bookingStatusTab === s ? 'border-b-2 border-amber-600 text-amber-600' : 'text-gray-500'}`} onClick={() => setBookingStatusTab(s as any)}>
                {s === 'all' ? <ListChecks size={20} /> : s === 'pending' ? <Clock size={20} /> : s === 'confirmed' ? <CheckCircle size={20} /> : s === 'completed' ? <History size={20} /> : <X size={20} />} 
                {t(s as any)}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredBookings.length > 0 ? (
              filteredBookings.map(booking => {
                const roomNumber = booking.room?.roomNumber || 'Deleted Room';
                const roomType = booking.room?.type || 'Unknown';
                const roomImage = booking.room?.images?.[0] ? getImageUrl(booking.room.images[0]) : null;

                const isCheckoutPast = isPast(parseISO(booking.checkOut));
                const shouldShowCheckoutWarning = isCheckoutPast && booking.status !== 'completed' && booking.status !== 'cancelled';

                return (
                  <motion.div key={booking._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 relative">
                    {shouldShowCheckoutWarning && (
                      // FIX: Cast 'checkoutPassed' to any
                      <div className="absolute top-3 right-3 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"><Clock size={16} /> {t('checkoutPassed' as any)}</div>
                    )}
                    <div className="w-full sm:w-48">
                      {roomImage ? (
                        <img src={roomImage} alt={`Room ${roomNumber}`} className="w-full h-32 object-cover rounded-xl" />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center"><ImageIcon size={40} className="text-gray-400" /></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{t('room')} {roomNumber}</h3>
                      <p className="text-sm text-gray-600 capitalize">{t(roomType as any)} {t('room')}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
                        
                        <p><Calendar size={16} className="inline mr-1" /> {t('checkInLabel' as any)}: {format(new Date(booking.checkIn), 'MMM dd, yyyy')}</p>
                       
                        <p><Calendar size={16} className="inline mr-1" /> {t('checkOutLabel' as any)}: {format(new Date(booking.checkOut), 'MMM dd, yyyy')}</p>
                       
                        <p><Users size={16} className="inline mr-1" /> {t('guestsLabel' as any)}: {booking.guests}</p>
                        <p><DollarSign size={16} className="inline mr-1" /> {t('total')}: ETB {booking.totalPrice}</p>
                        <p><CheckCircle size={16} className="inline mr-1" /> {t('status')}: <span className={`font-medium ${booking.status === 'confirmed' ? 'text-green-600' : booking.status === 'pending' ? 'text-yellow-600' : booking.status === 'cancelled' ? 'text-red-600' : 'text-gray-600'}`}>{t(booking.status as any)}</span></p>
             
                        <p><CreditCard size={16} className="inline mr-1" /> {t('payment' as any)}: <span className={`font-medium ${booking.paymentStatus === 'completed' ? 'text-green-600' : 'text-orange-600'}`}>{t(booking.paymentStatus as any)}</span></p>
                      </div>
                    </div>
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      // FIX: Cast 'cancelBooking' to any
                      <button onClick={() => setCancelConfirmation(booking._id)} className="py-2 px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition self-center sm:self-auto">{t('cancelBooking' as any)}</button>
                    )}
                  </motion.div>
                );
              })
            ) : (
              // FIX: Cast 'noBookingsFound' to any
              <div className="text-center py-12 text-gray-500"><Bed size={48} className="mx-auto mb-3 text-gray-300" /><p>{t('noBookingsFound' as any)}</p></div>
            )}
          </div>
        </>
      )}

      <AnimatePresence>
        {cancelConfirmation && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setCancelConfirmation(null)}>
            <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }} className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>

              <h3 className="text-xl font-bold text-red-600 mb-4">{t('confirmCancellation' as any)}</h3>
             
              <p className="text-gray-600 mb-6">{t('refundNotice' as any)}</p>
              <div className="flex gap-3">

                <button onClick={() => setCancelConfirmation(null)} className="flex-1 py-3 border border-gray-300 rounded-xl font-medium">{t('keepBooking' as any)}</button>
                <button onClick={() => { handleCancelBooking(cancelConfirmation); setCancelConfirmation(null); }} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium">{t('yesCancel')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showBookingModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowBookingModal(null)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('bookRoomTitle')} {showBookingModal.roomNumber}</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" required /></div>
              <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" required /></div>
              <div className="relative col-span-2"><Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="number" min="1" max={showBookingModal.capacity} value={guests} onChange={e => setGuests(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" required /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowBookingModal(null)} className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium">{t('cancel')}</button>
              
              <button onClick={() => handleBooking(showBookingModal._id)} className="flex-1 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-medium">{t('proceedPayment' as any)}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
 */ 
  
  



/*'use client';
import { Image } from 'react-native';

import { useState, useEffect, useMemo } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Bed, Search, Filter, ChevronDown, CheckCircle, Calendar, Users, DollarSign,
  Image as ImageIcon, X, Bath, Coffee, CreditCard, Clock, Bell, History, ListChecks, Hotel, Crown
} from 'lucide-react';
import axios from 'axios';
import ImageCarousel from '../../../../components/ui/ImageCarousel';
import { useAuth } from '../../../../context/AuthContext';
import { format, isPast, parseISO } from 'date-fns';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLanguage } from '../../../../context/LanguageContext'; // Import Hook

interface Room {
  _id: string;
  roomNumber: string;
  type: 'single' | 'double' | 'triple';
  price: number;
  availability: boolean;
  floorNumber: number;
  description: string;
  images?: string[];
  status: 'clean' | 'dirty' | 'maintenance';
  capacity: number;
  amenities: string[];
  numberOfBeds: number;
  bathrooms: number;
}

interface Booking {
  _id: string;
  room: Room | null;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  },
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  guests: number;
  paymentId?: string;
  createdAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

export default function CustomerBookingClient() {
  const { t, language } = useLanguage(); // Use Translation Hook
  const { user } = useAuth();
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'single' | 'double' | 'triple'>('all');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('1');
  const [showBookingModal, setShowBookingModal] = useState<Room | null>(null);
  const [success, setSuccess] = useState('');
  const [imageCarousel, setImageCarousel] = useState<string[] | null>(null);
  const [tab, setTab] = useState<'rooms' | 'bookings'>('rooms');
  const [bookingStatusTab, setBookingStatusTab] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');
  const [showAvailableOnly, setShowAvailableOnly] = useState(true);
  const [cancelConfirmation, setCancelConfirmation] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [minTimePassed, setMinTimePassed] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  // --- ROYAL LOADING DELAY ---
  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), 4500);
    return () => clearTimeout(timer);
  }, []);

  // --- FETCH DATA ---
  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/public/rooms`);
      setRooms(res.data);
    } catch (err: any) {
      console.error("Failed to load rooms", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/bookings/my-bookings`, { withCredentials: true });
      setBookings(res.data);
    } catch (err: any) {
      console.warn('Could not load bookings:', err.response?.data?.message);
    }
  };

  // --- PAYMENT VERIFICATION ---
  useEffect(() => {
    const tx_ref = searchParams.get('verify_tx_ref');
    if (tx_ref) {
      const verify = async () => {
        try {
          const res = await axios.post(`${API_BASE}/api/bookings/verify-from-client`, 
            { tx_ref },
            { withCredentials: true }
          );
          setSuccess(res.data.message || t('paymentConfirmed')); // Translated
          fetchBookings(); 
        } catch (error) {
          console.error("Failed to verify payment:", error);
          alert('There was an issue confirming your payment. Please contact support.');
        } finally {
          router.replace('/customer/bookings', { scroll: false });
        }
      };
      verify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, t]);

  // Initial Load
  useEffect(() => {
    fetchRooms();
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Notifications
  useEffect(() => {
    const passedCheckouts = bookings.filter(booking =>
      isPast(parseISO(booking.checkOut)) &&
      booking.status !== 'completed' &&
      booking.status !== 'cancelled'
    ).length;
    setNotificationCount(passedCheckouts);
  }, [bookings]);

  // --- HANDLERS ---
  const handleBooking = async (roomId: string) => {
    if (!checkIn || !checkOut || !guests) {
      alert(t('selectDatesGuests'));
      return;
    }
    try {
      const bookingRes = await axios.post(
        `${API_BASE}/api/bookings/`,
        { roomId, checkIn, checkOut, guests: Number(guests) },
        { withCredentials: true }
      );
      const booking = bookingRes.data;
      const paymentRes = await axios.post(
        `${API_BASE}/api/bookings/payment`,
        { bookingId: booking._id },
        { withCredentials: true }
      );
      window.location.href = paymentRes.data.checkoutUrl;
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create booking');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await axios.put(`${API_BASE}/api/bookings/${bookingId}/cancel`, {}, { withCredentials: true });
      setSuccess(t('bookingCancelled'));
      fetchBookings();
      fetchRooms();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  // --- FILTERS ---
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || room.type === typeFilter;
    const matchesAvailability = !showAvailableOnly || (room.availability && room.status === 'clean');
    return matchesSearch && matchesType && matchesAvailability;
  });

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      if (bookingStatusTab === 'all') return true;
      return booking.status === bookingStatusTab;
    });
  }, [bookings, bookingStatusTab]);

  const getImageUrl = (image: string) => {
    if (!image) return '/placeholder-room.jpg';
    if (image.startsWith('http')) return image;
    return image;
  };

  // --- ROYAL LOADING SCREEN ---
  if (loading || !minTimePassed) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-amber-950 via-black to-amber-900 flex items-center justify-center overflow-hidden">
       
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-amber-950/50 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15),transparent_70%)]" />
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -100, 0], x: [0, Math.sin(i) * 100, 0], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 8 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
              className="absolute w-96 h-96 bg-gradient-to-r from-yellow-400/20 to-orange-600/20 rounded-full blur-3xl"
              style={{ top: `${20 + i * 10}%`, left: i % 2 === 0 ? "-20%" : "80%" }}
            />
          ))}
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5 }} className="relative z-10 text-center px-8">
          <div className="flex justify-center mb-6">
            <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity }}>
               <Crown size={80} className="text-yellow-400 drop-shadow-2xl" />
            </motion.div>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-amber-300 tracking-widest mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            {t('luxuryHotel')}
          </h2>
          <p className="text-2xl text-amber-100 font-light tracking-widest">
            {t('preparingSuite')}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
          >
            <CheckCircle size={20} />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {imageCarousel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setImageCarousel(null)}
          >
            <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
              <ImageCarousel images={imageCarousel.map(getImageUrl)} />
              <button onClick={() => setImageCarousel(null)} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white">
                <X size={24} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
            <Bed size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('bookRoomTitle')}</h1>
            <p className="text-gray-600">{t('bookRoomDesc')}</p>
          </div>
        </div>
        <div className="flex gap-2 relative">
          <button onClick={() => setTab('rooms')} className={`px-4 py-2 rounded-xl ${tab === 'rooms' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{t('browseRooms')}</button>
          <button onClick={() => setTab('bookings')} className={`px-4 py-2 rounded-xl ${tab === 'bookings' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{t('myBookings')}</button>
          {notificationCount > 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
              {notificationCount}
            </motion.div>
          )}
        </div>
      </div>

      {tab === 'rooms' && (
        <>
          <div className="mb-6 flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder={t('searchRooms')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl appearance-none bg-white">
                <option value="all">{t('allTypes')}</option>
                <option value="single">{t('single')}</option>
                <option value="double">{t('double')}</option>
                <option value="triple">{t('triple')}</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showAvailableOnly} onChange={e => setShowAvailableOnly(e.target.checked)} className="w-4 h-4 text-amber-600 rounded" />
              <span className="text-sm font-medium text-gray-700">{t('showAvailableOnly')}</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.length > 0 ? (
              filteredRooms.map(room => (
                <motion.div key={room._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
                  <div className="relative mb-4">
                    {room.images?.[0] ? (
                      <img src={getImageUrl(room.images[0])} alt={`Room ${room.roomNumber}`} className="w-full h-48 object-cover rounded-xl cursor-pointer" onClick={() => setImageCarousel(room.images!)} />
                    ) : (
                      <div className="flex items-center justify-center h-48 text-gray-400 bg-gray-100 rounded-xl"><ImageIcon size={40} /></div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium shadow-sm ${room.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {room.availability ? t('available') : t('occupied')}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('room')} {room.roomNumber}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{room.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-amber-600">ETB {room.price}/{language === 'am' ? '' : 'night'}</span>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users size={16} /> {room.capacity} {t('guests').toLowerCase()}
                      <Bed size={16} /> {room.numberOfBeds} {t('beds').toLowerCase()}
                      <Bath size={16} /> {room.bathrooms} {t('baths').toLowerCase()}
                    </div>
                  </div>
                  <button onClick={() => { if (!room.availability) { alert(t('alreadyReserved')); return; } setShowBookingModal(room); }} className="w-full py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition font-medium" disabled={!room.availability || room.status !== 'clean'}>
                    {room.availability && room.status === 'clean' ? t('bookNow') : t('notAvailable')}
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500"><Bed size={48} className="mx-auto mb-3 text-gray-300" /><p>{t('noRoomsFound')}</p></div>
            )}
          </div>
        </>
      )}

      {tab === 'bookings' && (
        <>
          <div className="mb-6 flex gap-4 border-b border-gray-200 overflow-x-auto">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
              <button key={s} className={`pb-3 px-4 flex items-center gap-2 font-medium text-lg whitespace-nowrap ${bookingStatusTab === s ? 'border-b-2 border-amber-600 text-amber-600' : 'text-gray-500'}`} onClick={() => setBookingStatusTab(s as any)}>
                {s === 'all' ? <ListChecks size={20} /> : s === 'pending' ? <Clock size={20} /> : s === 'confirmed' ? <CheckCircle size={20} /> : s === 'completed' ? <History size={20} /> : <X size={20} />} 
                {t(s as any)}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredBookings.length > 0 ? (
              filteredBookings.map(booking => {
                const roomNumber = booking.room?.roomNumber || 'Deleted Room';
                const roomType = booking.room?.type || 'Unknown';
                const roomImage = booking.room?.images?.[0] ? getImageUrl(booking.room.images[0]) : null;

                const isCheckoutPast = isPast(parseISO(booking.checkOut));
                const shouldShowCheckoutWarning = isCheckoutPast && booking.status !== 'completed' && booking.status !== 'cancelled';

                return (
                  <motion.div key={booking._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 relative">
                    {shouldShowCheckoutWarning && (
                      <div className="absolute top-3 right-3 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"><Clock size={16} /> {t('checkoutPassed')}</div>
                    )}
                    <div className="w-full sm:w-48">
                      {roomImage ? (
                        <img src={roomImage} alt={`Room ${roomNumber}`} className="w-full h-32 object-cover rounded-xl" />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center"><ImageIcon size={40} className="text-gray-400" /></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{t('room')} {roomNumber}</h3>
                      <p className="text-sm text-gray-600 capitalize">{t(roomType as any)} {t('room')}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
                        <p><Calendar size={16} className="inline mr-1" /> {t('checkInLabel')}: {format(new Date(booking.checkIn), 'MMM dd, yyyy')}</p>
                        <p><Calendar size={16} className="inline mr-1" /> {t('checkOutLabel')}: {format(new Date(booking.checkOut), 'MMM dd, yyyy')}</p>
                        <p><Users size={16} className="inline mr-1" /> {t('guestsLabel')}: {booking.guests}</p>
                        <p><DollarSign size={16} className="inline mr-1" /> {t('total')}: ETB {booking.totalPrice}</p>
                        <p><CheckCircle size={16} className="inline mr-1" /> {t('status')}: <span className={`font-medium ${booking.status === 'confirmed' ? 'text-green-600' : booking.status === 'pending' ? 'text-yellow-600' : booking.status === 'cancelled' ? 'text-red-600' : 'text-gray-600'}`}>{t(booking.status as any)}</span></p>
                        <p><CreditCard size={16} className="inline mr-1" /> {t('payment')}: <span className={`font-medium ${booking.paymentStatus === 'completed' ? 'text-green-600' : 'text-orange-600'}`}>{t(booking.paymentStatus as any)}</span></p>
                      </div>
                    </div>
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <button onClick={() => setCancelConfirmation(booking._id)} className="py-2 px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition self-center sm:self-auto">{t('cancelBooking')}</button>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12 text-gray-500"><Bed size={48} className="mx-auto mb-3 text-gray-300" /><p>{t('noBookingsFound')}</p></div>
            )}
          </div>
        </>
      )}

      <AnimatePresence>
        {cancelConfirmation && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setCancelConfirmation(null)}>
            <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }} className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-red-600 mb-4">{t('confirmCancellation')}</h3>
              <p className="text-gray-600 mb-6">{t('refundNotice')}</p>
              <div className="flex gap-3">
                <button onClick={() => setCancelConfirmation(null)} className="flex-1 py-3 border border-gray-300 rounded-xl font-medium">{t('keepBooking')}</button>
                <button onClick={() => { handleCancelBooking(cancelConfirmation); setCancelConfirmation(null); }} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium">{t('yesCancel')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showBookingModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowBookingModal(null)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('bookRoomTitle')} {showBookingModal.roomNumber}</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" required /></div>
              <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" required /></div>
              <div className="relative col-span-2"><Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="number" min="1" max={showBookingModal.capacity} value={guests} onChange={e => setGuests(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" required /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowBookingModal(null)} className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium">{t('cancel')}</button>
              <button onClick={() => handleBooking(showBookingModal._id)} className="flex-1 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-medium">{t('proceedPayment')}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}*/



/*'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Bed, Search, Filter, ChevronDown, CheckCircle, Calendar, Users, DollarSign,
  Image as ImageIcon, X, Bath, CreditCard
} from 'lucide-react';
import axios from 'axios';
import ImageCarousel from '../../../../components/ui/ImageCarousel';
import { useAuth } from '../../../../context/AuthContext';
import { format } from 'date-fns';

interface Room {
  _id: string;
  roomNumber: string;
  type: 'single' | 'double' | 'triple';
  price: number;
  availability: boolean;
  floorNumber: number;
  description: string;
  images?: string[];
  status: 'clean' | 'dirty' | 'maintenance';
  capacity: number;
  amenities: string[];
  numberOfBeds: number;
  bathrooms: number;
}

interface Booking {
  _id: string;
  room: Room;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'completed' | 'failed';
  guests: number;
  paymentId?: string;          // <-- added (used by Chapa)
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function CustomerBookingClient() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'single' | 'double' | 'triple'>('all');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('1');
  const [showBookingModal, setShowBookingModal] = useState<Room | null>(null);
  const [success, setSuccess] = useState('');
  const [imageCarousel, setImageCarousel] = useState<string[] | null>(null);
  const [tab, setTab] = useState<'rooms' | 'bookings'>('rooms');
  const [showAvailableOnly, setShowAvailableOnly] = useState(true);
  const [cancelConfirmation, setCancelConfirmation] = useState<string | null>(null);

  /* ------------------------------------------------------------------ */
  /*  FETCH DATA                                                       */
  /* ------------------------------------------------------------------ 
  const fetchRooms = async () => {
    try {
      const res = await axios.get('/api/public/rooms');   // public, only available rooms
      setRooms(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get('/api/bookings/my-bookings', { withCredentials: true });
      setBookings(res.data);
    } catch (err: any) {
      console.warn('Could not load bookings:', err.response?.data?.message);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------------------------------------------ */
  /*  BOOKING HANDLERS                                                 */
  /* ------------------------------------------------------------------ 
  const handleBooking = async (roomId: string) => {
    if (!checkIn || !checkOut || !guests) {
      alert('Please select check-in date, check-out date and number of guests');
      return;
    }

    try {
      // 1. CREATE BOOKING (protected route)
      const bookingRes = await axios.post(
        '/api/bookings/',                     // <-- **fixed URL**
        { roomId, checkIn, checkOut, guests: Number(guests) },
        { withCredentials: true }
      );

      const booking = bookingRes.data;

      // 2. INITIATE PAYMENT – backend now stores `paymentId = tx_ref`
      const paymentRes = await axios.post(
        '/api/bookings/payment',
        { bookingId: booking._id },
        { withCredentials: true }
      );

      // 3. Redirect to Chapa checkout
      window.location.href = paymentRes.data.checkoutUrl;
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create booking');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await axios.put(`/api/bookings/${bookingId}/cancel`, {}, { withCredentials: true });
      setSuccess('Booking cancelled – 95% refund initiated');
      fetchBookings();
      fetchRooms();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  /* ------------------------------------------------------------------ */
  /*  FILTERS                                                          */
  /* ------------------------------------------------------------------ /
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || room.type === typeFilter;
    const matchesAvailability = !showAvailableOnly || (room.availability && room.status === 'clean');
    return matchesSearch && matchesType && matchesAvailability;
  });

const getImageUrl = (image: string) => {
    if (!image) return '/placeholder-room.jpg';
    if (image.startsWith('http')) return image;
    return image; // Already full URL from backend
};
/*const getImageUrl = (image: string) => {
  if (!image) return '/placeholder-room.jpg';
  if (image.startsWith('http')) return image;

  // When the backend runs behind ngrok the URL already contains the full path
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5000';
  return `${base}${image.startsWith('/') ? '' : '/'}${image}`;
};*/
  /* ------------------------------------------------------------------ */
  /*  RENDER                                                           */
  /* ------------------------------------------------------------------ /
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-8 border-amber-200 animate-spin"></div>
          <div className="absolute inset-0 w-24 h-24 rounded-full border-8 border-amber-600 animate-ping"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-amber-600 rounded-full animate-pulse flex items-center justify-center">
              <Bed size={32} className="text-white" />
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-amber-700 animate-pulse">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ---------- SUCCESS TOAST ---------- 
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
          >
            <CheckCircle size={20} />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- IMAGE CAROUSEL MODAL ---------- 
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
                <X size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- HEADER ---------- 
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
            <Bed size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Book a Room</h1>
            <p className="text-gray-600">Find and book your perfect stay</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('rooms')}
            className={`px-4 py-2 rounded-xl ${tab === 'rooms' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Browse Rooms
          </button>
          <button
            onClick={() => setTab('bookings')}
            className={`px-4 py-2 rounded-xl ${tab === 'bookings' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            My Bookings
          </button>
        </div>
      </div>

      {/* ---------- FILTERS (rooms tab) ---------- 
      {tab === 'rooms' && (
        <div className="mb-6 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 appearance-none bg-white"
            >
              <option value="all">All Types</option>
              <option value="single">Single</option>
              <option value="single">Double</option>
              <option value="triple">Triple</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showAvailableOnly}
              onChange={e => setShowAvailableOnly(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Show Available Only</span>
          </label>
        </div>
      )}

      {/* ---------- ROOMS GRID ---------- 
      {tab === 'rooms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map(room => (
            <motion.div
              key={room._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="relative mb-4">
                {room.images?.[0] ? (
                  <img
                    src={getImageUrl(room.images[0])}
                    alt={`Room ${room.roomNumber}`}
                    className="w-full h-48 object-cover rounded-xl cursor-pointer"
                    onClick={() => setImageCarousel(room.images!)}
                  />
                ) : (
                  <div className="flex items-center justify-center h-48 text-gray-400 bg-gray-100 rounded-xl">
                    <ImageIcon size={40} />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium shadow-sm ${
                    room.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {room.availability ? 'Available' : 'Occupied'}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium shadow-sm ${
                    room.type === 'single' ? 'bg-blue-100 text-blue-800' :
                    room.type === 'double' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
                  </span>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2">Room {room.roomNumber}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{room.description}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-amber-600">ETB {room.price}/night</span>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users size={16} /> {room.capacity} guests
                  <Bed size={16} /> {room.numberOfBeds} bed{room.numberOfBeds > 1 ? 's' : ''}
                  <Bath size={16} /> {room.bathrooms} bath{room.bathrooms > 1 ? 's' : ''}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">Amenities: {room.amenities.join(', ')}</p>
              <button
                onClick={() => {
                  if (!room.availability) {
                    alert('Room is already reserved');
                    return;
                  }
                  setShowBookingModal(room);
                }}
                className="w-full py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition font-medium"
              >
                Book Now
              </button>
            </motion.div>
          ))}
          {filteredRooms.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <Bed size={48} className="mx-auto mb-3 text-gray-300" />
              <p>No rooms available matching your criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* ---------- BOOKINGS LIST ---------- 
      {tab === 'bookings' && (
        <div className="space-y-4">
          {bookings.map(booking => (
            <motion.div
              key={booking._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4"
            >
              <div className="w-full sm:w-48">
                {booking.room.images?.[0] ? (
                  <img
                    src={getImageUrl(booking.room.images[0])}
                    alt={`Room ${booking.room.roomNumber}`}
                    className="w-full h-32 object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center">
                    <ImageIcon size={40} className="text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Room {booking.room.roomNumber}</h3>
                <p className="text-sm text-gray-600 capitalize">{booking.room.type} Room</p>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
                  <p><Calendar size={16} className="inline mr-1" /> Check-in: {format(new Date(booking.checkIn), 'MMM dd, yyyy')}</p>
                  <p><Calendar size={16} className="inline mr-1" /> Check-out: {format(new Date(booking.checkOut), 'MMM dd, yyyy')}</p>
                  <p><Users size={16} className="inline mr-1" /> Guests: {booking.guests}</p>
                  <p><DollarSign size={16} className="inline mr-1" /> Total: ETB {booking.totalPrice}</p>
                  <p><CheckCircle size={16} className="inline mr-1" /> Status: {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</p>
                  <p><CreditCard size={16} className="inline mr-1" /> Payment: {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}</p>
                </div>
              </div>

              {(booking.status === 'pending' || booking.status === 'confirmed') && (
                <button
                  onClick={() => setCancelConfirmation(booking._id)}
                  className="py-2 px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                >
                  Cancel Booking
                </button>
              )}
            </motion.div>
          ))}
          {bookings.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Bed size={48} className="mx-auto mb-3 text-gray-300" />
              <p>No bookings found.</p>
            </div>
          )}
        </div>
      )}

      {/* ---------- CANCEL CONFIRMATION MODAL ---------- 
      <AnimatePresence>
        {cancelConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setCancelConfirmation(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-red-600 mb-4">Confirm Cancellation</h3>
              <p className="text-gray-600 mb-6">Are you sure? You’ll be refunded 95% of the amount (5% cancellation fee).</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCancelConfirmation(null)}
                  className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium"
                >
                  No, Keep Booking
                </button>
                <button
                  onClick={() => {
                    handleCancelBooking(cancelConfirmation);
                    setCancelConfirmation(null);
                  }}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
                >
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- BOOKING MODAL ---------- 
      {showBookingModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Book Room {showBookingModal.roomNumber}
            </h2>

            <div className="flex gap-4 mb-6">
              {showBookingModal.images?.[0] ? (
                <img
                  src={getImageUrl(showBookingModal.images[0])}
                  alt={`Room ${showBookingModal.roomNumber}`}
                  className="w-48 h-32 object-cover rounded-xl"
                />
              ) : (
                <div className="w-48 h-32 bg-gray-100 rounded-xl flex items-center justify-center">
                  <ImageIcon size={40} className="text-gray-400" />
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 capitalize">{showBookingModal.type} Room</p>
                <p className="text-sm text-gray-600">ETB {showBookingModal.price}/night</p>
                <p className="text-sm text-gray-600">Capacity: {showBookingModal.capacity} guests</p>
                <p className="text-sm text-gray-600">Amenities: {showBookingModal.amenities.join(', ')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="date"
                  value={checkIn}
                  onChange={e => setCheckIn(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="date"
                  value={checkOut}
                  onChange={e => setCheckOut(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  min="1"
                  max={showBookingModal.capacity}
                  value={guests}
                  onChange={e => setGuests(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBookingModal(null)}
                className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleBooking(showBookingModal._id);
                  setShowBookingModal(null);
                }}
                className="flex-1 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition font-medium"
              >
                Proceed to Payment
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}*/