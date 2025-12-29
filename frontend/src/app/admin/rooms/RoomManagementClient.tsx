//frontend/src/app/admin/rooms/RoomManagementClient.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Search, Plus, Edit, Trash2, Filter, ChevronDown, CheckCircle, DollarSign, FileText,
  Image as ImageIcon, ArrowUpDown, X, Bed, Bath,
  BedSingle, BedDouble, Users as Triple, Users,
  ChevronLeft, ChevronRight, KeyRound
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ImageCarousel from '../../../../components/ui/ImageCarousel'; // Ensure path is correct
import { useLanguage } from '../../../../context/LanguageContext'; // Import Hook
import ReactCanvasConfetti from 'react-canvas-confetti';

interface Room {
  _id: string;
  roomNumber: string;
  type: 'single' | 'double' | 'triple';
  price: number;
  availability: boolean;
  floorNumber: number;
  description: string;
  images: string[];
  status: 'clean' | 'dirty' | 'maintenance';
  capacity: number;
  amenities: string[];
  numberOfBeds: number;
  bathrooms: number;
  createdAt: string;
}

// Interface for the floating animation icons to resolve hydration error
interface FloatingIconData {
  Icon: any;
  key: number;
  x: string;
  duration: number;
  delay: number;
  left: string;
  size: number;
}

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://mesertehotelinformationmanagementsystem.onrender.com';
// --- SUCCESS MODAL WITH FIREWORKS ---
const SuccessModal = ({ message, onClose }: { message: string, onClose: () => void }) => {
  const refAnimationInstance = useRef<any>(null);

  // Updated for react-canvas-confetti v2 compatibility
  const getInstance = ({ confetti }: { confetti: any }) => {
    refAnimationInstance.current = confetti;
  };

  const makeShot = (particleRatio: number, opts: any) => {
    if (refAnimationInstance.current) {
      refAnimationInstance.current({
        ...opts,
        origin: { y: 0.7 },
        particleCount: Math.floor(200 * particleRatio),
      });
    }
  };

  useEffect(() => {
    const fire = () => {
      makeShot(0.25, { spread: 26, startVelocity: 55 });
      makeShot(0.2, { spread: 60 });
      makeShot(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      makeShot(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      makeShot(0.1, { spread: 120, startVelocity: 45 });
    };
    fire();
    const interval = setInterval(fire, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <ReactCanvasConfetti
        onInit={getInstance}
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          zIndex: 70,
        }}
      />
      
      <motion.div
        initial={{ scale: 0.5, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.5, y: 100 }}
        className="bg-white rounded-3xl p-10 shadow-2xl text-center max-w-sm w-full border-4 border-amber-400 relative z-60"
      >
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="text-green-600 w-12 h-12" />
        </motion.div>
        
        <h2 className="text-3xl font-black text-gray-800 mb-2">Success!</h2>
        <p className="text-gray-600 mb-8 text-lg">{message}</p>
        
        <button 
          onClick={onClose}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition transform"
        >
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
};

export default function RoomManagementClient() {
  const { t, language } = useLanguage(); 

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [minTimePassed, setMinTimePassed] = useState(false);

  // State to hold random values for animation to prevent hydration mismatch
  const [floatingIcons, setFloatingIcons] = useState<FloatingIconData[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'single' | 'double' | 'triple'>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'occupied'>('all');
  const [sortBy, setSortBy] = useState<'roomNumber' | 'price' | 'floorNumber'>('roomNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [imageCarousel, setImageCarousel] = useState<string[] | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [form, setForm] = useState({
    roomNumber: '',
    type: 'single' as 'single' | 'double' | 'triple',
    price: '',
    floorNumber: '',
    description: '',
    images: [] as File[],
    status: 'clean' as 'clean' | 'dirty' | 'maintenance',
    capacity: '',
    amenities: '',
    numberOfBeds: '',
    bathrooms: ''
  });

  // Calculate random values once on mount to fix hydration error
  useEffect(() => {
    const icons = [BedDouble, KeyRound, Bath];
    const generatedIcons = icons.map((Icon, i) => ({
      Icon: Icon,
      key: i,
      x: (Math.random() * 100 - 50) + '%',
      size: 60 + Math.random() * 30,
      duration: 7 + Math.random() * 4,
      delay: i * 1.2,
      left: `${15 + i * 35}%`
    }));
    setFloatingIcons(generatedIcons);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), 3000); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/rooms`, { withCredentials: true });
      setRooms(res.data);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          room.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || room.type === typeFilter;
    const matchesAvailability = availabilityFilter === 'all' ||
                                 (availabilityFilter === 'available' && room.availability) ||
                                 (availabilityFilter === 'occupied' && !room.availability);
    return matchesSearch && matchesType && matchesAvailability;
  }).sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const paginatedRooms = filteredRooms.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, availabilityFilter]);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   const formData = new FormData();
  //   formData.append('roomNumber', form.roomNumber);
  //   formData.append('type', form.type);
  //   formData.append('price', form.price);
  //   formData.append('floorNumber', form.floorNumber);
  //   formData.append('description', form.description);
  //   formData.append('capacity', form.capacity);
  //   formData.append('amenities', form.amenities);
  //   formData.append('status', form.status);
  //   formData.append('numberOfBeds', form.numberOfBeds);
  //   formData.append('bathrooms', form.bathrooms);
  //   form.images.forEach(file => formData.append('images', file));

  //   try {
  //     setUploading(true);
  //     if (editingRoom) {
  //       await axios.put(`${API_BASE}/api/rooms/${editingRoom._id}`, formData, { withCredentials: true });
  //     } else {
  //       await axios.post(`${API_BASE}/api/rooms`, formData, { withCredentials: true });
  //     }

  //     setShowAddModal(false);
  //     setSuccessMessage(editingRoom ? t('updateSuccessfully') : t('addSuccessfully'));
  //     resetForm();
  //     fetchRooms();
  //     setEditingRoom(null);

  //   } catch (err: any) {
  //     alert(err.response?.data?.message || 'Error saving room');
  //   } finally {
  //     setUploading(false);
  //   }
  // };
// frontend/src/app/admin/rooms/RoomManagementClient.tsx

// Replace your handleSubmit function with this:

// frontend/src/app/admin/rooms/RoomManagementClient.tsx

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formData = new FormData();
      
      // text fields
      formData.append('roomNumber', form.roomNumber);
      formData.append('type', form.type);
      formData.append('price', form.price);
      formData.append('floorNumber', form.floorNumber);
      formData.append('description', form.description);
      formData.append('capacity', form.capacity);
      formData.append('amenities', form.amenities);
      formData.append('status', form.status);
      formData.append('numberOfBeds', form.numberOfBeds);
      formData.append('bathrooms', form.bathrooms);
      
      // Images - Append files to the 'images' key
      if (form.images && form.images.length > 0) {
        form.images.forEach((file) => {
          formData.append('images', file);
        });
      }

      // CRITICAL: REMOVED 'Content-Type' header. 
      // Axios + FormData handles this automatically with the required boundary string.
      const config = {
        withCredentials: true,
      };

      if (editingRoom) {
        await axios.put(`${API_BASE}/api/rooms/${editingRoom._id}`, formData, config);
      } else {
        await axios.post(`${API_BASE}/api/rooms`, formData, config);
      }

      setShowAddModal(false);
      setSuccessMessage(editingRoom ? t('updateSuccessfully') : t('addSuccessfully'));
      resetForm();
      fetchRooms();
      setEditingRoom(null);

    } catch (err: any) {
      console.error("Submission error details:", err.response?.data);
      // Display the actual error message from the backend if it exists
      const errorMessage = err.response?.data?.message || 'Error saving room. Please try again.';
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
};
  const resetForm = () => {
    setForm({
      roomNumber: '',
      type: 'single',
      price: '',
      floorNumber: '',
      description: '',
      images: [],
      status: 'clean',
      capacity: '',
      amenities: '',
      numberOfBeds: '',
      bathrooms: ''
    });
  };

  const handleDelete = async () => {
    if (!showDeleteModal) return;
    try {
      await axios.delete(`${API_BASE}/api/rooms/${showDeleteModal}`, { withCredentials: true });
      setRooms(prev => prev.filter(r => r._id !== showDeleteModal));
      setShowDeleteModal(null);
      if (paginatedRooms.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

   const getImageUrl = (image: string) => {
    if (image.startsWith('http')) return image;
    return `${API_BASE}${image}`;
  };
// const getImageUrl = (image: string) => {
//     if (!image) return '/default-room.jpg';
//     if (image.startsWith('http')) return image; // Use Cloudinary link directly
//     return `${API_BASE}${image.startsWith('/') ? '' : '/'}${image}`; // Legacy local path
// };
  // --- ROYAL LOADING SCREEN ---
  if (loading || !minTimePassed) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-black flex items-center justify-center overflow-hidden z-50">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Render floating icons from state to avoid hydration mismatch */}
        {floatingIcons.map((data) => (
           <motion.div
             key={data.key}
             className="absolute text-blue-400/20"
             initial={{ y: '100vh', x: data.x, opacity: 0 }}
             animate={{ y: '-20vh', opacity: [0, 0.6, 0] }}
             transition={{ 
               duration: data.duration, 
               repeat: Infinity, 
               delay: data.delay,
               ease: "linear"
             }}
             style={{ left: data.left }}
           >
             <data.Icon size={data.size} />
           </motion.div>
        ))}

        <motion.div 
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 text-center px-8"
        >
          <div className="relative w-48 h-64 mx-auto mb-10 perspective-1000">
             <motion.div 
               animate={{ rotateY: 360 }}
               transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
               className="w-full h-full bg-gradient-to-br from-amber-400 to-yellow-600 rounded-2xl shadow-2xl border-2 border-yellow-200 flex flex-col items-center justify-center transform-style-3d"
               style={{ transformStyle: 'preserve-3d' }}
             >
                <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center">
                   <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center mb-4 shadow-inner">
                      <KeyRound size={40} className="text-amber-600" />
                   </div>
                   <div className="h-1 w-24 bg-white/50 rounded mb-2"></div>
                   <div className="h-1 w-16 bg-white/30 rounded"></div>
                   <div className="absolute bottom-4 text-white/80 text-xs font-mono tracking-widest">VIP ACCESS</div>
                </div>
             </motion.div>
             <motion.div
               animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="absolute inset-0 border-2 border-amber-500/50 rounded-2xl"
             />
          </div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2"
          >
            {language === 'am' ? 'ክፍል' : 'ROOM'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">{language === 'am' ? 'አስተዳደር' : 'MANAGEMENT'}</span>
          </motion.h2>

          <motion.div 
            className="h-1 w-40 mx-auto bg-blue-600 rounded-full mb-6 relative overflow-hidden"
          >
             <motion.div 
               animate={{ x: [-160, 160] }}
               transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 bg-white/50 w-1/2 blur-sm"
             />
          </motion.div>

          <motion.p 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-gray-400 font-mono text-sm tracking-widest uppercase"
          >
            {language === 'am' ? 'ፕላኖችን በማመሳሰል ላይ...' : 'Synchronizing Floor Plans...'}
          </motion.p>

        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* SUCCESS MODAL */}
      <AnimatePresence>
        {successMessage && (
          <SuccessModal 
            message={successMessage} 
            onClose={() => setSuccessMessage(null)} 
          />
        )}
      </AnimatePresence>

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setZoomedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={getImageUrl(zoomedImage)} alt="Zoomed Room" className="w-full h-auto rounded-2xl shadow-2xl" />
              <button onClick={() => setZoomedImage(null)} className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-lg">
                <X size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Carousel Modal */}
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
              className="relative max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <ImageCarousel images={imageCarousel.map(getImageUrl)} />
              <button onClick={() => setImageCarousel(null)} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white">
                <X size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('deleteRoom')}</h3>
              <p className="text-gray-500 mb-6">{t('deleteRoomConfirm')}</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                  {t('cancel')}
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
                >
                  {t('yesDelete')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
             <Bed size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t('roomManagement')}</h1>
            <p className="text-gray-500 font-medium">{t('manageRoomsDesc')}</p>
          </div>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-bold">
          <Plus size={20} /> {t('addRoom')}
        </button>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder={t('searchRooms')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition bg-gray-50 focus:bg-white" />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 sm:pb-0">
           <div className="relative min-w-[140px]">
             <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 appearance-none bg-gray-50 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition">
               <option value="all">{t('allTypes')}</option>
               <option value="single">{t('single')}</option>
               <option value="double">{t('double')}</option>
               <option value="triple">{t('triple')}</option>
             </select>
             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
           </div>
           <div className="relative min-w-[140px]">
             <select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value as any)} className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 appearance-none bg-gray-50 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition">
               <option value="all">{t('allAvailability')}</option>
               <option value="available">{t('available')}</option>
               <option value="occupied">{t('occupied')}</option>
             </select>
             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
           </div>
           <div className="relative min-w-[160px]">
             <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 appearance-none bg-gray-50 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition">
               <option value="roomNumber">{t('sortByRoomNumber')}</option>
               <option value="price">{t('sortByPrice')}</option>
               <option value="floorNumber">{t('sortByFloor')}</option>
             </select>
             <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
           </div>
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        <AnimatePresence mode="popLayout">
          {paginatedRooms.map((room) => (
            <motion.div
              key={room._id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="relative mb-5 overflow-hidden rounded-xl">
                {room.images.length > 0 ? (
                  <img
                    src={getImageUrl(room.images[0])}
                    alt={`Room ${room.roomNumber}`}
                    className="w-full h-56 object-cover transform group-hover:scale-105 transition duration-700 cursor-pointer"
                    onClick={() => setImageCarousel(room.images)}
                  />
                ) : (
                  <div className="flex items-center justify-center h-56 text-gray-400 bg-gray-50">
                    <ImageIcon size={48} className="opacity-20" />
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                   <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full shadow-sm backdrop-blur-md ${
                    room.availability ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
                  }`}>
                    {room.availability ? t('available') : t('occupied')}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20">
                     {t(room.type)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-start mb-2">
                 <div>
                    <h3 className="text-xl font-black text-gray-900">{t('Room')} {room.roomNumber}</h3>
                    {/* FIX: Cast 'floorNumber' to any */}
                    <p className="text-sm text-gray-500 font-medium">{t('floorNumber' as any)} {room.floorNumber}</p>
                 </div>
                 <div className="text-right">
                    <span className="block text-2xl font-bold text-amber-600">ETB {room.price}</span>
                    <span className="text-xs text-gray-400">{t('perNight')}</span>
                 </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px] leading-relaxed">{room.description}</p>
              
              <div className="flex gap-4 border-t border-gray-100 pt-4 mb-4">
                  <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                     {/* FIX: Cast 'guests' to any */}
                     <Users size={14} /> {room.capacity} {t('guests' as any)}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                     {/* FIX: Cast 'beds' to any */}
                     <Bed size={14} /> {room.numberOfBeds} {t('beds' as any)}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                     {/* FIX: Cast 'baths' to any */}
                     <Bath size={14} /> {room.bathrooms} {t('baths' as any)}
                  </div>
                 
              </div>
              <div>    <span className={`px-2 py-1 text-xs rounded-full ${
  room.status === 'clean' ? 'bg-green-100 text-green-700' : 
  room.status === 'dirty' ? 'bg-yellow-100 text-yellow-700' : 
  'bg-red-100 text-red-700'
}`}>
  {t(room.status)}
</span></div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditingRoom(room);
                    setForm({
                      roomNumber: room.roomNumber,
                      type: room.type,
                      price: room.price.toString(),
                      floorNumber: room.floorNumber.toString(),
                      description: room.description,
                      images: [],
                      status: room.status,
                      capacity: room.capacity.toString(),
                      amenities: room.amenities.join(', '),
                      numberOfBeds: room.numberOfBeds.toString(),
                      bathrooms: room.bathrooms.toString()
                    });
                    setShowAddModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition font-bold text-sm"
                >
                  <Edit size={16} /> {t('edit')}
                </button>
                <button
                  onClick={() => setShowDeleteModal(room._id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition font-bold text-sm"
                >
                  <Trash2 size={16} /> {t('delete')}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-3 rounded-xl bg-white shadow-md border border-gray-100 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-xl font-bold transition shadow-sm ${
                  currentPage === i + 1
                    ? 'bg-amber-600 text-white scale-110'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-3 rounded-xl bg-white shadow-md border border-gray-100 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 my-8 max-h-screen overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingRoom ? t('updateRoom') : t('addNewRoom')}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Bed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500">
                      <option value="single">{t('single')}</option>
                      <option value="double">{t('double')}</option>
                      <option value="triple">{t('triple')}</option>
                    </select>
                  </div>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input placeholder={`${t('capacity')} *`} type="number" required value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Bed size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input placeholder={`${t('numberOfBeds')} *`} type="number" required value={form.numberOfBeds} onChange={e => setForm({ ...form, numberOfBeds: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
                  </div>
                  <div className="relative">
                    <Bath size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input placeholder={`${t('numberOfBathrooms')} *`} type="number" required value={form.bathrooms} onChange={e => setForm({ ...form, bathrooms: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
                  </div>
                </div>

                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input placeholder={`${t('priceAmount')} *`} type="number" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input placeholder={`${t('roomNumber')} *`} required value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
                  </div>
                  <div className="relative">
                    <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    {/* FIX: Cast 'floorNumber' to any inside placeholder */}
                    <input type="number" placeholder={`${t('floorNumber' as any)} *`} required value={form.floorNumber} onChange={e => setForm({ ...form, floorNumber: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
                  </div>
                </div>

                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-gray-400" size={20} />
                  {/* FIX: Cast 'description' to any inside placeholder */}
                  <textarea placeholder={`${t('description' as any)} *`} required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} className="w-full pl-10 pt-3 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 resize-none" />
                </div>

                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  {/* FIX: Cast 'amenities' to any inside placeholder */}
                  <input placeholder={t('amenities' as any)} value={form.amenities} onChange={e => setForm({ ...form, amenities: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('roomStatus')}</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500">
                    <option value="clean">{t('clean')}</option>
                    <option value="dirty">{t('dirty')}</option>
                    <option value="maintenance">{t('maintenance')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('roomImages')}</label>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                      {form.images.length > 0 ? (
                        <img src={URL.createObjectURL(form.images[0])} className="w-full h-full object-cover rounded-lg" />
                      ) : editingRoom?.images[0] ? (
                        <img src={getImageUrl(editingRoom.images[0])} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="text-xs text-gray-400 text-center px-1">{t('noImage')}</div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setForm({ ...form, images: Array.from(e.target.files || []).slice(0, 3) })}
                      className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                    />
                  </div>
                  {editingRoom && editingRoom.images.length > 0 && (
                    <p className="text-xs text-gray-500">{t('existingImagesReplaced')}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-6">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium">{t('cancel')}</button>
                  <button type="submit" disabled={uploading} className="flex-1 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition font-medium disabled:opacity-50">
                    {uploading ? t('saving') : editingRoom ? t('updateRoom') : t('addRoom')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}/*'use client';
import { Image, Modal } from 'react-native';

import { useState, useEffect, useRef } from 'react';

import {
  Search, Plus, Edit, Trash2, Filter, ChevronDown, CheckCircle, DollarSign, FileText,
  Image as ImageIcon, ArrowUpDown, X, Bed, Bath,
  BedSingle, BedDouble, Users as Triple, Users,
  ChevronLeft, ChevronRight, KeyRound
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ImageCarousel from '../../../../components/ui/ImageCarousel'; // Ensure path is correct
import { useLanguage } from '../../../../context/LanguageContext'; // Import Hook
import ReactCanvasConfetti from 'react-canvas-confetti';

interface Room {
  _id: string;
  roomNumber: string;
  type: 'single' | 'double' | 'triple';
  price: number;
  availability: boolean;
  floorNumber: number;
  description: string;
  images: string[];
  status: 'clean' | 'dirty' | 'maintenance';
  capacity: number;
  amenities: string[];
  numberOfBeds: number;
  bathrooms: number;
  createdAt: string;
}

// Interface for the floating animation icons to resolve hydration error
interface FloatingIconData {
  Icon: any;
  key: number;
  x: string;
  duration: number;
  delay: number;
  left: string;
  size: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

// --- SUCCESS MODAL WITH FIREWORKS ---
const SuccessModal = ({ message, onClose }: { message: string, onClose: () => void }) => {
  const refAnimationInstance = useRef<any>(null);

  const getInstance = (instance: any) => {
    refAnimationInstance.current = instance;
  };

  const makeShot = (particleRatio: number, opts: any) => {
    if (refAnimationInstance.current) {
      refAnimationInstance.current({
        ...opts,
        origin: { y: 0.7 },
        particleCount: Math.floor(200 * particleRatio),
      });
    }
  };

  useEffect(() => {
    const fire = () => {
      makeShot(0.25, { spread: 26, startVelocity: 55 });
      makeShot(0.2, { spread: 60 });
      makeShot(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      makeShot(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      makeShot(0.1, { spread: 120, startVelocity: 45 });
    };
    fire();
    const interval = setInterval(fire, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <ReactCanvasConfetti
        refConfetti={getInstance}
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          zIndex: 70,
        }}
      />
      
      <motion.div
        initial={{ scale: 0.5, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.5, y: 100 }}
        className="bg-white rounded-3xl p-10 shadow-2xl text-center max-w-sm w-full border-4 border-amber-400 relative z-60"
      >
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="text-green-600 w-12 h-12" />
        </motion.div>
        
        <h2 className="text-3xl font-black text-gray-800 mb-2">Success!</h2>
        <p className="text-gray-600 mb-8 text-lg">{message}</p>
        
        <button 
          onClick={onClose}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition transform"
        >
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
};

export default function RoomManagementClient() {
  const { t, language } = useLanguage(); // Use Translation Hook

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [minTimePassed, setMinTimePassed] = useState(false);

  // State to hold random values for animation to prevent hydration mismatch
  const [floatingIcons, setFloatingIcons] = useState<FloatingIconData[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'single' | 'double' | 'triple'>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'occupied'>('all');
  const [sortBy, setSortBy] = useState<'roomNumber' | 'price' | 'floorNumber'>('roomNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [imageCarousel, setImageCarousel] = useState<string[] | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [form, setForm] = useState({
    roomNumber: '',
    type: 'single' as 'single' | 'double' | 'triple',
    price: '',
    floorNumber: '',
    description: '',
    images: [] as File[],
    status: 'clean' as 'clean' | 'dirty' | 'maintenance',
    capacity: '',
    amenities: '',
    numberOfBeds: '',
    bathrooms: ''
  });

  // Calculate random values once on mount to fix hydration error
  useEffect(() => {
    const icons = [BedDouble, KeyRound, Bath];
    const generatedIcons = icons.map((Icon, i) => ({
      Icon: Icon,
      key: i,
      x: (Math.random() * 100 - 50) + '%',
      size: 60 + Math.random() * 30,
      duration: 7 + Math.random() * 4,
      delay: i * 1.2,
      left: `${15 + i * 35}%`
    }));
    setFloatingIcons(generatedIcons);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), 3000); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/rooms`, { withCredentials: true });
      setRooms(res.data);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          room.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || room.type === typeFilter;
    const matchesAvailability = availabilityFilter === 'all' ||
                                 (availabilityFilter === 'available' && room.availability) ||
                                 (availabilityFilter === 'occupied' && !room.availability);
    return matchesSearch && matchesType && matchesAvailability;
  }).sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const paginatedRooms = filteredRooms.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, availabilityFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('roomNumber', form.roomNumber);
    formData.append('type', form.type);
    formData.append('price', form.price);
    formData.append('floorNumber', form.floorNumber);
    formData.append('description', form.description);
    formData.append('capacity', form.capacity);
    formData.append('amenities', form.amenities);
    formData.append('status', form.status);
    formData.append('numberOfBeds', form.numberOfBeds);
    formData.append('bathrooms', form.bathrooms);
    form.images.forEach(file => formData.append('images', file));

    try {
      setUploading(true);
      if (editingRoom) {
        await axios.put(`${API_BASE}/api/rooms/${editingRoom._id}`, formData, { withCredentials: true });
      } else {
        await axios.post(`${API_BASE}/api/rooms`, formData, { withCredentials: true });
      }

      setShowAddModal(false);
      setSuccessMessage(editingRoom ? t('updateSuccessfully') : t('addSuccessfully'));
      resetForm();
      fetchRooms();
      setEditingRoom(null);

    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving room');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setForm({
      roomNumber: '',
      type: 'single',
      price: '',
      floorNumber: '',
      description: '',
      images: [],
      status: 'clean',
      capacity: '',
      amenities: '',
      numberOfBeds: '',
      bathrooms: ''
    });
  };

  const handleDelete = async () => {
    if (!showDeleteModal) return;
    try {
      await axios.delete(`${API_BASE}/api/rooms/${showDeleteModal}`, { withCredentials: true });
      setRooms(prev => prev.filter(r => r._id !== showDeleteModal));
      setShowDeleteModal(null);
      if (paginatedRooms.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const getImageUrl = (image: string) => {
    if (image.startsWith('http')) return image;
    return `${API_BASE}${image}`;
  };

  // --- ROYAL LOADING SCREEN ---
  if (loading || !minTimePassed) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-black flex items-center justify-center overflow-hidden z-50">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        
        {floatingIcons.map((data) => (
           <motion.div
             key={data.key}
             className="absolute text-blue-400/20"
             initial={{ y: '100vh', x: data.x, opacity: 0 }}
             animate={{ y: '-20vh', opacity: [0, 0.6, 0] }}
             transition={{ 
               duration: data.duration, 
               repeat: Infinity, 
               delay: data.delay,
               ease: "linear"
             }}
             style={{ left: data.left }}
           >
             <data.Icon size={data.size} />
           </motion.div>
        ))}

        <motion.div 
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 text-center px-8"
        >
          <div className="relative w-48 h-64 mx-auto mb-10 perspective-1000">
             <motion.div 
               animate={{ rotateY: 360 }}
               transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
               className="w-full h-full bg-gradient-to-br from-amber-400 to-yellow-600 rounded-2xl shadow-2xl border-2 border-yellow-200 flex flex-col items-center justify-center transform-style-3d"
               style={{ transformStyle: 'preserve-3d' }}
             >
                <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center">
                   <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center mb-4 shadow-inner">
                      <KeyRound size={40} className="text-amber-600" />
                   </div>
                   <div className="h-1 w-24 bg-white/50 rounded mb-2"></div>
                   <div className="h-1 w-16 bg-white/30 rounded"></div>
                   <div className="absolute bottom-4 text-white/80 text-xs font-mono tracking-widest">VIP ACCESS</div>
                </div>
             </motion.div>
             <motion.div
               animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="absolute inset-0 border-2 border-amber-500/50 rounded-2xl"
             />
          </div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2"
          >
            {language === 'am' ? 'ክፍል' : 'ROOM'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">{language === 'am' ? 'አስተዳደር' : 'MANAGEMENT'}</span>
          </motion.h2>

          <motion.div 
            className="h-1 w-40 mx-auto bg-blue-600 rounded-full mb-6 relative overflow-hidden"
          >
             <motion.div 
               animate={{ x: [-160, 160] }}
               transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 bg-white/50 w-1/2 blur-sm"
             />
          </motion.div>

          <motion.p 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-gray-400 font-mono text-sm tracking-widest uppercase"
          >
            {language === 'am' ? 'ፕላኖችን በማመሳሰል ላይ...' : 'Synchronizing Floor Plans...'}
          </motion.p>

        </motion.div>
      </div>
    );
  }

  return (
    <>
     
      <AnimatePresence>
        {successMessage && (
          <SuccessModal 
            message={successMessage} 
            onClose={() => setSuccessMessage(null)} 
          />
        )}
      </AnimatePresence>

      
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setZoomedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={getImageUrl(zoomedImage)} alt="Zoomed Room" className="w-full h-auto rounded-2xl shadow-2xl" />
              <button onClick={() => setZoomedImage(null)} className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-lg">
                <X size={24} />
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
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <ImageCarousel images={imageCarousel.map(getImageUrl)} />
              <button onClick={() => setImageCarousel(null)} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white">
                <X size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('deleteRoom')}</h3>
              <p className="text-gray-500 mb-6">{t('deleteRoomConfirm')}</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                  {t('cancel')}
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
                >
                  {t('yesDelete')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
             <Bed size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t('roomManagement')}</h1>
            <p className="text-gray-500 font-medium">{t('manageRoomsDesc')}</p>
          </div>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-bold">
          <Plus size={20} /> {t('addRoom')}
        </button>
      </div>

      
      <div className="mb-8 flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder={t('searchRooms')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition bg-gray-50 focus:bg-white" />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 sm:pb-0">
           <div className="relative min-w-[140px]">
             <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 appearance-none bg-gray-50 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition">
               <option value="all">{t('allTypes')}</option>
               <option value="single">{t('single')}</option>
               <option value="double">{t('double')}</option>
               <option value="triple">{t('triple')}</option>
             </select>
             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
           </div>
           <div className="relative min-w-[140px]">
             <select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value as any)} className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 appearance-none bg-gray-50 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition">
               <option value="all">{t('allAvailability')}</option>
               <option value="available">{t('available')}</option>
               <option value="occupied">{t('occupied')}</option>
             </select>
             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
           </div>
           <div className="relative min-w-[160px]">
             <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 appearance-none bg-gray-50 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition">
               <option value="roomNumber">{t('sortByRoomNumber')}</option>
               <option value="price">{t('sortByPrice')}</option>
               <option value="floorNumber">{t('sortByFloor')}</option>
             </select>
             <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
           </div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        <AnimatePresence mode="popLayout">
          {paginatedRooms.map((room) => (
            <motion.div
              key={room._id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="relative mb-5 overflow-hidden rounded-xl">
                {room.images.length > 0 ? (
                  <img
                    src={getImageUrl(room.images[0])}
                    alt={`Room ${room.roomNumber}`}
                    className="w-full h-56 object-cover transform group-hover:scale-105 transition duration-700 cursor-pointer"
                    onClick={() => setImageCarousel(room.images)}
                  />
                ) : (
                  <div className="flex items-center justify-center h-56 text-gray-400 bg-gray-50">
                    <ImageIcon size={48} className="opacity-20" />
                  </div>
                )}
                
               
                <div className="absolute top-3 left-3 flex gap-2">
                   <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full shadow-sm backdrop-blur-md ${
                    room.availability ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
                  }`}>
                    {room.availability ? t('available') : t('occupied')}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20">
                     {t(room.type)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-start mb-2">
                 <div>
                    <h3 className="text-xl font-black text-gray-900">{t('Room')} {room.roomNumber}</h3>
                    <p className="text-sm text-gray-500 font-medium">{t('floorNumber')} {room.floorNumber}</p>
                 </div>
                 <div className="text-right">
                    <span className="block text-2xl font-bold text-amber-600">ETB {room.price}</span>
                    <span className="text-xs text-gray-400">{t('perNight')}</span>
                 </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px] leading-relaxed">{room.description}</p>
              
              <div className="flex gap-4 border-t border-gray-100 pt-4 mb-4">
                  <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                     <Users size={14} /> {room.capacity} {t('guests')}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                     <Bed size={14} /> {room.numberOfBeds} {t('beds')}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                     <Bath size={14} /> {room.bathrooms} {t('baths')}
                  </div>
                 
              </div>
              <div>    <span className={`px-2 py-1 text-xs rounded-full ${
  room.status === 'clean' ? 'bg-green-100 text-green-700' : 
  room.status === 'dirty' ? 'bg-yellow-100 text-yellow-700' : 
  'bg-red-100 text-red-700'
}`}>
  {t(room.status)}
</span></div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditingRoom(room);
                    setForm({
                      roomNumber: room.roomNumber,
                      type: room.type,
                      price: room.price.toString(),
                      floorNumber: room.floorNumber.toString(),
                      description: room.description,
                      images: [],
                      status: room.status,
                      capacity: room.capacity.toString(),
                      amenities: room.amenities.join(', '),
                      numberOfBeds: room.numberOfBeds.toString(),
                      bathrooms: room.bathrooms.toString()
                    });
                    setShowAddModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition font-bold text-sm"
                >
                  <Edit size={16} /> {t('edit')}
                </button>
                <button
                  onClick={() => setShowDeleteModal(room._id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition font-bold text-sm"
                >
                  <Trash2 size={16} /> {t('delete')}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-3 rounded-xl bg-white shadow-md border border-gray-100 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-xl font-bold transition shadow-sm ${
                  currentPage === i + 1
                    ? 'bg-amber-600 text-white scale-110'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-3 rounded-xl bg-white shadow-md border border-gray-100 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      )}

     
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 my-8 max-h-screen overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingRoom ? t('updateRoom') : t('addNewRoom')}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Bed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500">
                      <option value="single">{t('single')}</option>
                      <option value="double">{t('double')}</option>
                      <option value="triple">{t('triple')}</option>
                    </select>
                  </div>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input placeholder={`${t('capacity')} *`} type="number" required value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Bed size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input placeholder={`${t('numberOfBeds')} *`} type="number" required value={form.numberOfBeds} onChange={e => setForm({ ...form, numberOfBeds: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
                  </div>
                  <div className="relative">
                    <Bath size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input placeholder={`${t('numberOfBathrooms')} *`} type="number" required value={form.bathrooms} onChange={e => setForm({ ...form, bathrooms: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
                  </div>
                </div>

                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input placeholder={`${t('priceAmount')} *`} type="number" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input placeholder={`${t('roomNumber')} *`} required value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
                  </div>
                  <div className="relative">
                    <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="number" placeholder={`${t('floorNumber')} *`} required value={form.floorNumber} onChange={e => setForm({ ...form, floorNumber: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
                  </div>
                </div>

                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-gray-400" size={20} />
                  <textarea placeholder={`${t('description')} *`} required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} className="w-full pl-10 pt-3 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 resize-none" />
                </div>

                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input placeholder={t('amenities')} value={form.amenities} onChange={e => setForm({ ...form, amenities: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('roomStatus')}</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500">
                    <option value="clean">{t('clean')}</option>
                    <option value="dirty">{t('dirty')}</option>
                    <option value="maintenance">{t('maintenance')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('roomImages')}</label>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                      {form.images.length > 0 ? (
                        <img src={URL.createObjectURL(form.images[0])} className="w-full h-full object-cover rounded-lg" />
                      ) : editingRoom?.images[0] ? (
                        <img src={getImageUrl(editingRoom.images[0])} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="text-xs text-gray-400 text-center px-1">{t('noImage')}</div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setForm({ ...form, images: Array.from(e.target.files || []).slice(0, 3) })}
                      className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                    />
                  </div>
                  {editingRoom && editingRoom.images.length > 0 && (
                    <p className="text-xs text-gray-500">{t('existingImagesReplaced')}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-6">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium">{t('cancel')}</button>
                  <button type="submit" disabled={uploading} className="flex-1 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition font-medium disabled:opacity-50">
                    {uploading ? t('saving') : editingRoom ? t('updateRoom') : t('addRoom')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}*/
  



/*
'use client';

import {
  Search, Plus, Edit, Trash2, Filter, ChevronDown, CheckCircle, DollarSign, FileText,
  Image as ImageIcon, ArrowUpDown, X, Bed, Bath,
  BedSingle, BedDouble, Users as Triple,Users // FIXED: Added missing imports
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ImageCarousel from '../../../../components/ui/ImageCarousel';
import { useLanguage } from '../../../../context/LanguageContext';
interface Room {
  _id: string;
  roomNumber: string;
  type: 'single' | 'double' | 'triple';
  price: number;
  availability: boolean;
  floorNumber: number;
  description: string;
  images: string[];
  status: 'clean' | 'dirty' | 'maintenance';
  capacity: number;
  amenities: string[];
  numberOfBeds: number;
  bathrooms: number;
  createdAt: string;
}

const API_BASE = 'https://localhost:5000';

export default function RoomManagementClient() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'single' | 'double' | 'triple'>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'occupied'>('all');
  const [sortBy, setSortBy] = useState<'roomNumber' | 'price' | 'floorNumber'>('roomNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [imageCarousel, setImageCarousel] = useState<string[] | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
const {t, language } = useLanguage();
  const [form, setForm] = useState({
    roomNumber: '',
    type: 'single' as 'single' | 'double' | 'triple',
    price: '',
    floorNumber: '',
    description: '',
    images: [] as File[],
    status: 'clean' as 'clean' | 'dirty' | 'maintenance',
    capacity: '',
    amenities: '',
    numberOfBeds: '',
    bathrooms: ''
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await axios.get('/api/rooms');
      setRooms(res.data);
      setLoading(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load rooms');
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          room.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || room.type === typeFilter;
    const matchesAvailability = availabilityFilter === 'all' ||
                                 (availabilityFilter === 'available' && room.availability) ||
                                 (availabilityFilter === 'occupied' && !room.availability);
    return matchesSearch && matchesType && matchesAvailability;
  }).sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('roomNumber', form.roomNumber);
    formData.append('type', form.type);
    formData.append('price', form.price);
    formData.append('floorNumber', form.floorNumber);
    formData.append('description', form.description);
    formData.append('capacity', form.capacity);
    formData.append('amenities', form.amenities);
    formData.append('status', form.status);
    formData.append('numberOfBeds', form.numberOfBeds);
    formData.append('bathrooms', form.bathrooms);
    form.images.forEach(file => formData.append('images', file));

    try {
      setUploading(true);
      if (editingRoom) {
        await axios.put(`/api/rooms/${editingRoom._id}`, formData, { withCredentials: true });
      } else {
        await axios.post('/api/rooms', formData, { withCredentials: true });
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowAddModal(false);
        setEditingRoom(null);
        resetForm();
        fetchRooms();
      }, 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving room');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setForm({
      roomNumber: '',
      type: 'single',
      price: '',
      floorNumber: '',
      description: '',
      images: [],
      status: 'clean',
      capacity: '',
      amenities: '',
      numberOfBeds: '',
      bathrooms: ''
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/rooms/${id}`, { withCredentials: true });
      setRooms(prev => prev.filter(r => r._id !== id));
      setShowDeleteModal(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const getImageUrl = (image: string) => {
    if (image.startsWith('http')) return image;
    return `${API_BASE}${image}`;
  };

  // FIXED: Now icons are properly imported
  const roomIcons = {
    single: BedSingle,
    double: BedDouble,
    triple: Triple
  };

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
          <p className="mt-6 text-lg font-medium text-amber-700 animate-pulse">Loading Rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <>
     
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setZoomedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={getImageUrl(zoomedImage)} alt="Zoomed Room" className="w-full h-auto rounded-2xl shadow-2xl" />
              <button onClick={() => setZoomedImage(null)} className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-lg">
                <X size={24} />
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
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <ImageCarousel images={imageCarousel.map(getImageUrl)} />
              <button onClick={() => setImageCarousel(null)} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white">
                <X size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-white rounded-2xl p-10 shadow-2xl text-center"
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
              </motion.div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-2xl font-bold text-gray-800">
                Room {editingRoom ? t('updateSuccessfully') : t('addSuccessfully')} !!!!
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

  
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
        <Bed size={24} className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-white"/>
          <h1 className="text-3xl font-bold text-gray-900">{t('roomManagement')}</h1>
          <p className="text-gray-600 mt-1">{t('Add, edit, or delete hotel rooms')}</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
          <Plus size={20} /> {t('addRoom')}
        </button>
      </div>

     
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Search rooms..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 appearance-none bg-white">
  <option value="all">{t('allTypes')}</option>
  <option value="single">{t('single')}</option>
  <option value="double">{t('double')}</option>
  <option value="triple">{t('triple')}</option>
</select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value as any)} className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 appearance-none bg-white">
  <option value="all">{t('allAvailability')}</option>
  <option value="available">{t('available')}</option>
  <option value="occupied">{t('occupied')}</option>
</select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>
        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
         <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 appearance-none bg-white">
  <option value="roomNumber">{t('sortByRoomNumber')}</option>
  <option value="price">{t('sortByPrice')}</option>
  <option value="floorNumber">{t('sortByFloor')}</option>
</select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => {
          const TypeIcon = roomIcons[room.type];
          return (
            <motion.div
              key={room._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="relative mb-4">
                {room.images.length > 0 ? (
                  <img
                    src={getImageUrl(room.images[0])}
                    alt={`Room ${room.roomNumber}`}
                    className="w-full h-48 object-cover rounded-xl cursor-pointer"
                    onClick={() => setImageCarousel(room.images)}
                  />
                ) : (
                  <div className="flex items-center justify-center h-48 text-gray-400 bg-gray-100 rounded-xl">
                    No image
                  </div>
                )}
                <div className="absolute top-2 left-2">
                 <span className={`px-2 py-1 text-xs rounded-full font-medium shadow-sm ${
  room.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
}`}>
  {room.availability ? t('available') : t('occupied')}
</span>
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium shadow-sm ${
                    room.type === 'single' ? 'bg-blue-100 text-blue-800' :
                    room.type === 'double' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
         {t(room.type)}
                  </span>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2">{t('Room')}{room.roomNumber}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{room.description}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-amber-600">ETB {room.price}</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
  room.status === 'clean' ? 'bg-green-100 text-green-700' : 
  room.status === 'dirty' ? 'bg-yellow-100 text-yellow-700' : 
  'bg-red-100 text-red-700'
}`}>
  {t(room.status)}
</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingRoom(room);
                    setForm({
                      roomNumber: room.roomNumber,
                      type: room.type,
                      price: room.price.toString(),
                      floorNumber: room.floorNumber.toString(),
                      description: room.description,
                      images: [],
                      status: room.status,
                      capacity: room.capacity.toString(),
                      amenities: room.amenities.join(', '),
                      numberOfBeds: room.numberOfBeds.toString(),
                      bathrooms: room.bathrooms.toString()
                    });
                    setShowAddModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                >
                  <Edit size={16} /> {t('edit')}
                </button>
                <button
                  onClick={() => setShowDeleteModal(room._id)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-medium"
                >
                  <Trash2 size={16} /> {t('delete')}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

   
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 my-8 max-h-screen overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingRoom ? t('update') : t('addNewRoom')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Bed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500">
                    <option value="single">{t('single')}</option>
                    <option value="double">{t('double')}</option>
                    <option value="triple">{t('triple')}</option>
                  </select>
                </div>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input placeholder="Capacity *" type="number" required value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Bed size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input placeholder="Number of Beds *" type="number" required value={form.numberOfBeds} onChange={e => setForm({ ...form, numberOfBeds: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
                </div>
                <div className="relative">
                  <Bath size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input placeholder="Number of Bathrooms *" type="number" required value={form.bathrooms} onChange={e => setForm({ ...form, bathrooms: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>

              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input placeholder="Price (ETB) *" type="number" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input placeholder="Room Number *" required value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
                </div>
                <div className="relative">
                  <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="number" placeholder="Floor Number *" required value={form.floorNumber} onChange={e => setForm({ ...form, floorNumber: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>

              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400" size={20} />
                <textarea placeholder="Description *" required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} className="w-full pl-10 pt-3 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 resize-none" />
              </div>

              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input placeholder="Amenities (comma-separated, e.g., WiFi,TV,AC)" value={form.amenities} onChange={e => setForm({ ...form, amenities: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500">
                  <option value="clean">{t('clean')}</option>
                  <option value="dirty">{t('dirty')}</option>
                  <option value="maintenance">{t('maintenance')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Images (up to 3)</label>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                    {form.images.length > 0 ? (
                      <img src={URL.createObjectURL(form.images[0])} className="w-full h-full object-cover rounded-lg" />
                    ) : editingRoom?.images[0] ? (
                      <img src={getImageUrl(editingRoom.images[0])} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="text-xs text-gray-400 text-center px-1">No image</div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setForm({ ...form, images: Array.from(e.target.files || []).slice(0, 3) })}
                    className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                  />
                </div>
                {editingRoom && editingRoom.images.length > 0 && (
                  <p className="text-xs text-gray-500">Existing images will be replaced if new ones are uploaded</p>
                )}
              </div>

              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => { setShowAddModal(false); setEditingRoom(null); resetForm(); }} className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium">Cancel</button>
                <button type="submit" disabled={uploading} className="flex-1 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition font-medium disabled:opacity-50">
                  {uploading ? 'Saving...' : editingRoom ? t('updateRoom') : t('addRoom')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
}*/