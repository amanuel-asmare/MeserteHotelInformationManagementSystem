'use client';
import { Image, Modal, Alert } from 'react-native';

import { useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Bed, CheckCircle, AlertCircle, X, 
  ChevronLeft, ChevronRight, KeyRound, Hotel, Bath, Users, DoorOpen, ImageIcon
} from 'lucide-react';
import axios from 'axios';
import ImageCarousel from '../../../../components/ui/ImageCarousel'; 
import AssignRoomModal from '../guestManagement/modals/AssignRoomModal';

interface Room {
  _id: string;
  roomNumber: string;
  type: string;
  price: number;
  availability: boolean;
  status: 'clean' | 'dirty' | 'maintenance';
  images: string[];
  floorNumber: number;
  capacity: number;
  amenities: string[];
  numberOfBeds: number;
  bathrooms: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

export default function ReceptionistRoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null); 
  const [imageCarousel, setImageCarousel] = useState<string[] | null>(null);
  
  // Fix Hydration: Store random values in state
  const [particles, setParticles] = useState<{x: number}[]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Show 6 rooms per page as requested

  // Royal loading delay & particle gen
  useEffect(() => {
    setParticles([
      { x: Math.random() * 100 - 50 },
      { x: Math.random() * 100 - 50 },
      { x: Math.random() * 100 - 50 }
    ]);

    const timer = setTimeout(() => setMinTimePassed(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/public/rooms`);
      setRooms(res.data);
    } catch (error) {
      console.error("Error fetching rooms", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtering
  const filteredRooms = rooms.filter(room => 
    room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const paginatedRooms = filteredRooms.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  // Reset to page 1 when search changes
  useEffect(() => { setCurrentPage(1) }, [searchTerm]);

  const getImageUrl = (path: string) => {
    if (!path) return '/placeholder-room.jpg';
    if (path.startsWith('http')) return path;
    return `${API_BASE}${path}`;
  };

  // --- ROYAL LOADING SCREEN ---
  if (loading || !minTimePassed) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-black flex items-center justify-center overflow-hidden z-50">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        {/* Use stable particle state */}
        {particles.length > 0 && [Bed, KeyRound, Bath].map((Icon, i) => (
           <motion.div
             key={i}
             className="absolute text-blue-400/20"
             initial={{ y: '100vh', x: `${particles[i].x}%`, opacity: 0 }}
             animate={{ y: '-20vh', opacity: [0, 0.6, 0] }}
             transition={{ duration: 7 + i, repeat: Infinity, delay: i * 1.2, ease: "linear" }}
             style={{ left: `${15 + i * 35}%` }}
           >
             <Icon size={60 + i * 10} />
           </motion.div>
        ))}

        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 text-center px-8">
          <div className="relative w-48 h-64 mx-auto mb-10 perspective-1000">
             <motion.div 
               animate={{ rotateY: 360 }}
               transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
               className="w-full h-full bg-gradient-to-br from-amber-400 to-yellow-600 rounded-2xl shadow-2xl border-2 border-yellow-200 flex flex-col items-center justify-center transform-style-3d"
             >
                <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center mb-4 shadow-inner">
                   <KeyRound size={40} className="text-amber-600" />
                </div>
                <div className="h-1 w-24 bg-white/50 rounded mb-2"></div>
                <div className="h-1 w-16 bg-white/30 rounded"></div>
                <div className="absolute bottom-4 text-white/80 text-xs font-mono tracking-widest">VIP ACCESS</div>
             </motion.div>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
            ROOM <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">MANAGEMENT</span>
          </h2>
          <p className="text-gray-400 font-mono text-sm tracking-widest uppercase">Synchronizing Floor Plans...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Image Carousel */}
      <AnimatePresence>
        {imageCarousel && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setImageCarousel(null)}
          >
            <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
               <ImageCarousel images={imageCarousel.map(getImageUrl)} />
               <button onClick={() => setImageCarousel(null)} className="absolute -top-12 right-0 text-white hover:text-gray-300"><X size={32}/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Modal */}
      {selectedRoom && (
        <AssignRoomModal 
          room={selectedRoom} 
          onClose={() => setSelectedRoom(null)} 
          onSuccess={() => { 
             fetchRooms(); 
             setSelectedRoom(null); 
          }} 
        />
      )}

      {/* Main Content */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
            <p className="text-gray-500">View status and assign rooms to guests</p>
          </div>
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search room number..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl w-full md:w-80 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode='popLayout'>
            {paginatedRooms.map(room => (
              <motion.div 
                key={room._id}
                layout
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Image Area */}
                <div className="h-48 bg-gray-100 relative group cursor-pointer" onClick={() => setImageCarousel(room.images)}>
                  {room.images?.[0] ? (
                    <img 
                      src={getImageUrl(room.images[0])} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      alt="Room" 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400"><ImageIcon size={48} /></div>
                  )}
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${
                    room.availability ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {room.availability ? 'Available' : 'Occupied'}
                  </span>
                </div>

                {/* Details */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Room {room.roomNumber}</h3>
                      <p className="text-sm text-gray-500 capitalize">{room.type} • Floor {room.floorNumber}</p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-bold uppercase border ${
                       room.status === 'clean' ? 'bg-green-50 text-green-700 border-green-200' :
                       room.status === 'dirty' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                       'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {room.status}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                     <p className="text-lg font-bold text-amber-600">ETB {room.price}<span className="text-sm text-gray-400 font-normal">/night</span></p>
                     <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Users size={12}/> {room.capacity}</span>
                        <span className="flex items-center gap-1"><Bed size={12}/> {room.numberOfBeds}</span>
                     </div>
                  </div>

                  <button 
                    disabled={!room.availability || room.status !== 'clean'}
                    onClick={() => setSelectedRoom(room)}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      room.availability && room.status === 'clean'
                      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-amber-500/30'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {room.availability && room.status === 'clean' ? <><DoorOpen size={18}/> Assign Room</> : 'Unavailable'}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredRooms.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              <Hotel size={48} className="mx-auto mb-2 opacity-50"/>
              <p>No rooms found matching your search.</p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-10 pb-10">
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
                      ? 'bg-amber-600 text-white scale-110 shadow-amber-500/30'
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
      </motion.div>
    </>
  );
}