/*'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Bed, Users, DollarSign } from 'lucide-react';
import AddRoomModal from './AddRoomModal';
import RoomGallery from './RoomGallery';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';
import ConfirmDialog from '../../../../components/ui/ConfirmDialog';
import { Room } from '../../../../types/room';
import { roomApi } from '../../../../lib/api';
import {  ArrowLeft } from 'lucide-react';
export default function RoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const data = await roomApi.getAll();
      setRooms(data);
    } catch (err) {
      alert('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: Omit<Room, 'id' | 'createdAt'>) => {
    try {
      if (editingRoom) {
        const updated = await roomApi.update(editingRoom.id, data);
        setRooms(rooms.map(r => r.id === updated.id ? updated : r));
      } else {
        const newRoom = await roomApi.create(data);
        setRooms([...rooms, newRoom]);
      }
    } catch (err) {
      alert('Save failed');
    }
  };

  const handleDelete = async () => {
    if (!deletingRoom) return;
    try {
      await roomApi.delete(deletingRoom.id);
      setRooms(rooms.filter(r => r.id !== deletingRoom.id));
      setDeletingRoom(null);
    } catch (err) {
      alert('Delete failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="mb-8 flex justify-between items-center">
      {/* BEAST BACK BUTTON 
                  <motion.button
                    whileHover={{ x: -4, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.back()}
                    className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-sm "
                  >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform  " />
                    Back
                  </motion.button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
          <p className="text-gray-600 mt-1">Manage all hotel rooms</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
        >
          <Plus size={20} />
          Add New Room
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room, i) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
          >
            <RoomGallery images={room.images} />

            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Room {room.roomNumber}</h3>
                  <p className="text-sm text-amber-600 capitalize">{room.type}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  room.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {room.availability ? 'Available' : 'Occupied'}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{room.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1"><Bed size={16} /> Floor {room.floor}</span>
                <span className="flex items-center gap-1"><Users size={16} /> {room.type}</span>
                <span className="flex items-center gap-1 font-bold text-amber-600">
                  <DollarSign size={16} /> {room.price.toLocaleString()} ETB
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingRoom(room);
                    setShowAddModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition"
                >
                  <Edit size={16} /> Edit
                </button>
                <button
                  onClick={() => setDeletingRoom(room)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modals 
      <AddRoomModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingRoom(null);
        }}
        onSave={handleSave}
        initialData={editingRoom || undefined}
      />

      <ConfirmDialog
        isOpen={!!deletingRoom}
        title="Delete Room"
        message={`Are you sure you want to delete Room ${deletingRoom?.roomNumber}? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingRoom(null)}
      />
    </>
  );
}*/
'use client';
import RoomManagementClient from './RoomManagementClient';
import { Bed } from 'lucide-react';

export default function RoomsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          
        </div>

        <RoomManagementClient />
      </div>
    </div>
  );
}