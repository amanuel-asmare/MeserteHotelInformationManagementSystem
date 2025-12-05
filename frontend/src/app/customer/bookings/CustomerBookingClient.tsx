'use client';

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
  room: Room | null; // Room might be null if deleted
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
          setSuccess(res.data.message || 'Payment confirmed!');
          fetchBookings(); // Refresh list
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
  }, [searchParams]);

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
      alert('Please select check-in date, check-out date and number of guests');
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
      setSuccess('Booking cancelled – 95% refund initiated');
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
            {/* Crown Icon Animation */}
            <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity }}>
               <Crown size={80} className="text-yellow-400 drop-shadow-2xl" />
            </motion.div>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-amber-300 tracking-widest mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            LUXURY HOTEL
          </h2>
          <p className="text-2xl text-amber-100 font-light tracking-widest">
            Preparing Your Royal Suite...
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
            <h1 className="text-3xl font-bold text-gray-900">Book a Room</h1>
            <p className="text-gray-600">Find and book your perfect stay</p>
          </div>
        </div>
        <div className="flex gap-2 relative">
          <button onClick={() => setTab('rooms')} className={`px-4 py-2 rounded-xl ${tab === 'rooms' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Browse Rooms</button>
          <button onClick={() => setTab('bookings')} className={`px-4 py-2 rounded-xl ${tab === 'bookings' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700'}`}>My Bookings</button>
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
              <input type="text" placeholder="Search rooms..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl appearance-none bg-white">
                <option value="all">All Types</option>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="triple">Triple</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showAvailableOnly} onChange={e => setShowAvailableOnly(e.target.checked)} className="w-4 h-4 text-amber-600 rounded" />
              <span className="text-sm font-medium text-gray-700">Show Available Only</span>
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
                        {room.availability ? 'Available' : 'Occupied'}
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
                  <button onClick={() => { if (!room.availability) { alert('Room is already reserved'); return; } setShowBookingModal(room); }} className="w-full py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition font-medium" disabled={!room.availability || room.status !== 'clean'}>
                    {room.availability && room.status === 'clean' ? 'Book Now' : 'Not Available'}
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500"><Bed size={48} className="mx-auto mb-3 text-gray-300" /><p>No rooms available matching your criteria.</p></div>
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
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredBookings.length > 0 ? (
              filteredBookings.map(booking => {
                // --- FIX: SAFETY CHECK FOR DELETED ROOMS ---
                // If booking.room is null (deleted from DB), use fallback values to prevent crash
                const roomNumber = booking.room?.roomNumber || 'Deleted Room';
                const roomType = booking.room?.type || 'Unknown';
                const roomImage = booking.room?.images?.[0] ? getImageUrl(booking.room.images[0]) : null;

                const isCheckoutPast = isPast(parseISO(booking.checkOut));
                const shouldShowCheckoutWarning = isCheckoutPast && booking.status !== 'completed' && booking.status !== 'cancelled';

                return (
                  <motion.div key={booking._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 relative">
                    {shouldShowCheckoutWarning && (
                      <div className="absolute top-3 right-3 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"><Clock size={16} /> Checkout Passed!</div>
                    )}
                    <div className="w-full sm:w-48">
                      {roomImage ? (
                        <img src={roomImage} alt={`Room ${roomNumber}`} className="w-full h-32 object-cover rounded-xl" />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center"><ImageIcon size={40} className="text-gray-400" /></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Room {roomNumber}</h3>
                      <p className="text-sm text-gray-600 capitalize">{roomType} Room</p>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
                        <p><Calendar size={16} className="inline mr-1" /> Check-in: {format(new Date(booking.checkIn), 'MMM dd, yyyy')}</p>
                        <p><Calendar size={16} className="inline mr-1" /> Check-out: {format(new Date(booking.checkOut), 'MMM dd, yyyy')}</p>
                        <p><Users size={16} className="inline mr-1" /> Guests: {booking.guests}</p>
                        <p><DollarSign size={16} className="inline mr-1" /> Total: ETB {booking.totalPrice}</p>
                        <p><CheckCircle size={16} className="inline mr-1" /> Status: <span className={`font-medium ${booking.status === 'confirmed' ? 'text-green-600' : booking.status === 'pending' ? 'text-yellow-600' : booking.status === 'cancelled' ? 'text-red-600' : 'text-gray-600'}`}>{booking.status}</span></p>
                        <p><CreditCard size={16} className="inline mr-1" /> Payment: <span className={`font-medium ${booking.paymentStatus === 'completed' ? 'text-green-600' : 'text-orange-600'}`}>{booking.paymentStatus}</span></p>
                      </div>
                    </div>
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <button onClick={() => setCancelConfirmation(booking._id)} className="py-2 px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition self-center sm:self-auto">Cancel Booking</button>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12 text-gray-500"><Bed size={48} className="mx-auto mb-3 text-gray-300" /><p>No {bookingStatusTab === 'all' ? '' : bookingStatusTab} bookings found.</p></div>
            )}
          </div>
        </>
      )}

      <AnimatePresence>
        {cancelConfirmation && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setCancelConfirmation(null)}>
            <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }} className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-red-600 mb-4">Confirm Cancellation</h3>
              <p className="text-gray-600 mb-6">Are you sure? You’ll be refunded 95% of the amount.</p>
              <div className="flex gap-3">
                <button onClick={() => setCancelConfirmation(null)} className="flex-1 py-3 border border-gray-300 rounded-xl font-medium">No, Keep Booking</button>
                <button onClick={() => { handleCancelBooking(cancelConfirmation); setCancelConfirmation(null); }} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium">Yes, Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showBookingModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowBookingModal(null)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Book Room {showBookingModal.roomNumber}</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" required /></div>
              <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" required /></div>
              <div className="relative col-span-2"><Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="number" min="1" max={showBookingModal.capacity} value={guests} onChange={e => setGuests(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" required /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowBookingModal(null)} className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium">Cancel</button>
              <button onClick={() => handleBooking(showBookingModal._id)} className="flex-1 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-medium">Proceed to Payment</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}/*'use client';

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