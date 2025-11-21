'use client';

import { useState, useEffect } from 'react';
import {
  Search, Plus, Edit, Trash2, Filter, ChevronDown, CheckCircle, DollarSign, FileText,
  Image as ImageIcon, ArrowUpDown, X, Bed, Bath,
  BedSingle, BedDouble, Users as Triple,Users // FIXED: Added missing imports
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ImageCarousel from '../../../../components/ui/ImageCarousel';

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

const API_BASE = 'http://localhost:5000';

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
      {/* ZOOM SINGLE IMAGE */}
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

      {/* IMAGE CAROUSEL MODAL */}
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

      {/* Success Modal */}
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
                Room {editingRoom ? 'Updated' : 'Added'} Successfully!
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
        <Bed size={24} className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-white"/>
          <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
          <p className="text-gray-600 mt-1">Add, edit, or delete hotel rooms</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
          <Plus size={20} /> Add Room
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Search rooms..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 appearance-none bg-white">
            <option value="all">All Types</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="triple">Triple</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value as any)} className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 appearance-none bg-white">
            <option value="all">All Availability</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>
        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 appearance-none bg-white">
            <option value="roomNumber">Sort by Room Number</option>
            <option value="price">Sort by Price</option>
            <option value="floorNumber">Sort by Floor</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>
      </div>

      {/* Rooms Grid */}
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
                <span className="text-2xl font-bold text-amber-600">ETB {room.price}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${room.status === 'clean' ? 'bg-green-100 text-green-700' : room.status === 'dirty' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                  {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
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
                  <Edit size={16} /> Edit
                </button>
                <button
                  onClick={() => setShowDeleteModal(room._id)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm font-medium"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 my-8 max-h-screen overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingRoom ? 'Edit Room' : 'Add New Room'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Bed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500">
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="triple">Triple</option>
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
                  <option value="clean">Clean</option>
                  <option value="dirty">Dirty</option>
                  <option value="maintenance">Maintenance</option>
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
                  {uploading ? 'Saving...' : editingRoom ? 'Update' : 'Add'} Room
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
}