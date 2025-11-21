// src/app/receptionist/rooms/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Edit, Trash2, DoorOpen } from 'lucide-react';
import axios from 'axios';
import AssignRoomModal from '../guestManagement/modals/AssignRoomModal';

interface Room {
  _id: string;
  roomNumber: string;
  type: 'single' | 'double' | 'triple';
  price: number;
  availability: boolean;
  status: 'clean' | 'dirty' | 'maintenance';
  floorNumber: number;
  capacity: number;
  images?: string[];
}

export default function RoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState('');
  const [assignModalRoom, setAssignModalRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  /* ------------------------------------------------------------------ */
  /*  FETCH ALL ROOMS (protected) – receptionist sees EVERY room          */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      // Correct protected endpoint – returns ALL rooms (incl. images with full URLs)
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/public/rooms`);
      setRooms(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  FILTER – only by search term (receptionist needs to see all)       */
  /* ------------------------------------------------------------------ */
  const filteredRooms = rooms.filter((r) =>
    r.roomNumber.toLowerCase().includes(search.toLowerCase())
  );

  /* ------------------------------------------------------------------ */
  /*  IMAGE URL helper – same as customer page (backend returns full URLs) */
  /* ------------------------------------------------------------------ */
  const getImageUrl = (image: string) => {
    if (!image) return '/placeholder-room.jpg';
    if (image.startsWith('http')) return image;
    return image; // already a full URL from backend
  };

  if (loading) return <p className="text-center py-8">Loading rooms...</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">Room Management</h1>
       
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search rooms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-80"
        />
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredRooms.map((room) => (
            <motion.div
              key={room._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-4 rounded-xl shadow-sm border cursor-pointer hover:shadow-md transition"
            >
              {/* Image preview (same as customer page) */}
              <div className="relative mb-3 h-32 rounded-lg overflow-hidden">
                {room.images?.[0] ? (
                  <img
                    src={getImageUrl(room.images[0])}
                    alt={`Room ${room.roomNumber}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium shadow-sm ${
                      room.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {room.availability ? 'Available' : 'Occupied'}
                  </span>
                </div>
              </div>

              <div className="flex justify-between mb-2">
                <h3 className="font-bold">Room {room.roomNumber}</h3>
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
                </span>
              </div>

              <p className="text-sm capitalize">{room.type} • Floor {room.floorNumber}</p>
              <p className="text-sm text-gray-600 capitalize">{room.status}</p>
              <p className="text-sm font-semibold text-amber-600 mt-2">
                ETB {room.price}/night
              </p>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setAssignModalRoom(room)}
                  className="flex-1 p-2 bg-amber-600 text-white rounded hover:bg-amber-700 flex items-center justify-center gap-1"
                >
                  <DoorOpen size={16} /> Assign
                </button>
                
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredRooms.length === 0 && (
          <p className="col-span-full text-center py-8 text-gray-500">
            No rooms match your search.
          </p>
        )}
      </div>

      {/* Assign Modal */}
      <AssignRoomModal
        room={assignModalRoom}
        onClose={() => setAssignModalRoom(null)}
        onSuccess={fetchRooms}
      />
    </div>
  );
}