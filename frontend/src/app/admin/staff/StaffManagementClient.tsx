'use client';
import { Text, Image, Alert, Keyboard } from 'react-native';

import { useState, useEffect, useMemo } from 'react';

import {
  Search, Plus, Edit, Trash2, Filter, ChevronDown, Users,
  CheckCircle, Upload, Mail, Lock, Phone, MapPin, DollarSign,
  User, GraduationCap, Clock, Image as ImageIcon, Briefcase,
  ToggleLeft, ToggleRight, X, AlertTriangle, ArrowUpDown,
  ChevronLeft, ChevronRight, Crown, BadgeCheck, Key, Utensils
} from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// --- INTERFACES & TYPES ---
interface Staff {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage: string;
  role: 'manager' | 'cashier' | 'receptionist';
  isActive: boolean;
  createdAt: string;
  salary?: number;
  shift?: { start: string; end: string };
  city?: string;
  kebele?: string;
  gender?: string;
  educationLevel?: string;
  educationField?: string;
  educationInstitution?: string;
}

interface StaffManagementClientProps {
  allowedRoles?: ('manager' | 'cashier' | 'receptionist')[];
  title?: string;
  showAddButton?: boolean;
}

type SortConfig = {
  key: keyof Staff | 'name';
  direction: 'ascending' | 'descending';
};

// --- CONSTANTS ---
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ITEMS_PER_PAGE = 8; // Set how many staff members per page

// --- HELPER FUNCTIONS ---
const getImageUrl = (image: string | null | undefined): string => {
  if (!image) return '/default-avatar.png';
  if (image.startsWith('http')) return image;
  if (image.startsWith('/uploads')) return `${API_BASE}${image}`;
  return `${API_BASE}/uploads/avatars/${image}`;
};


// --- MAIN COMPONENT ---
export default function StaffManagementClient({
  allowedRoles = ['receptionist', 'cashier'],
  title = 'Staff Management',
  showAddButton = true
}: StaffManagementClientProps) {

  // --- STATE MANAGEMENT ---
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [minTimePassed, setMinTimePassed] = useState(false); // For Royal Loading
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'manager' | 'cashier' | 'receptionist'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [viewingStaff, setViewingStaff] = useState<Staff | null>(null);
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'ascending' });
  const [activeTab, setActiveTab] = useState('personal');
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: '',
    country: 'Ethiopia', city: '', kebele: '', salary: '',
    gender: '', educationLevel: '', educationField: '', educationInstitution: '',
    shiftStart: '', shiftEnd: '', role: 'receptionist' as any,
    profileImage: null as File | null
  });

  // --- DATA FETCHING & SIDE EFFECTS ---
  
  // Royal Loading Delay
  useEffect(() => {
    const timer = setTimeout(() => setMinTimePassed(true), 4000); // 4 seconds of luxury
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setZoomedImage(null);
        setViewingStaff(null);
        if (showAddModal) closeAndResetModal();
        if (showDeleteModal) setShowDeleteModal(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showAddModal, showDeleteModal]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/users?t=' + Date.now(), { withCredentials: true });
      const filtered = res.data.filter((u: any) => allowedRoles.includes(u.role));
      setStaff(filtered);
    } catch (err: any) {
      console.error('Fetch error:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  // --- DATA PROCESSING, SORTING, & PAGINATION ---
  const filteredAndSortedStaff = useMemo(() => {
    let sortedStaff = [...staff].filter(s => {
      const name = `${s.firstName} ${s.lastName}`.toLowerCase();
      return (name.includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
             (roleFilter === 'all' || s.role === roleFilter);
    });

    if (sortConfig) {
      sortedStaff.sort((a, b) => {
        let aValue: any = sortConfig.key === 'name' ? `${a.firstName} ${a.lastName}` : a[sortConfig.key as keyof Staff];
        let bValue: any = sortConfig.key === 'name' ? `${b.firstName} ${b.lastName}` : b[sortConfig.key as keyof Staff];
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortedStaff;
  }, [staff, searchTerm, roleFilter, sortConfig]);

  const paginatedStaff = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedStaff.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedStaff, currentPage]);
  
  const totalPages = Math.ceil(filteredAndSortedStaff.length / ITEMS_PER_PAGE);

  const requestSort = (key: keyof Staff | 'name') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig?.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };


  // --- EVENT HANDLERS & ACTIONS ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== '' && value !== null) formData.append(key, value as any);
    });

    setUploading(true);
    try {
      if (editingStaff) {
        await axios.put(`/api/users/${editingStaff._id}`, formData, { withCredentials: true });
        setSuccess('Staff Updated Successfully!');
      } else {
        await axios.post('/api/users', formData, { withCredentials: true });
        setSuccess('Staff Added Successfully!');
      }
      setTimeout(() => {
        setSuccess('');
        closeAndResetModal();
        fetchStaff();
      }, 2000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving staff');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/users/${id}`, { withCredentials: true });
      setStaff(prev => prev.filter(s => s._id !== id));
      setShowDeleteModal(null);
      setViewingStaff(null); // Close detail view if open
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const toggleActive = async (e: React.MouseEvent, id: string, currentStatus: boolean) => {
    e.stopPropagation(); // Prevent row click
    try {
      const { data } = await axios.put(`/api/users/${id}`, { isActive: !currentStatus }, { withCredentials: true });
      setStaff(prev => prev.map(s => s._id === id ? { ...s, isActive: !currentStatus } : s));
      if (viewingStaff?._id === id) {
        setViewingStaff({ ...viewingStaff, isActive: !currentStatus });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };
  
  const openEditModal = (s: Staff) => {
    setEditingStaff(s);
    setForm({
      firstName: s.firstName, lastName: s.lastName, email: s.email, password: '', phone: s.phone || '',
      country: 'Ethiopia', city: s.city || '', kebele: s.kebele || '', salary: s.salary?.toString() || '',
      gender: s.gender || '', educationLevel: s.educationLevel || '', educationField: s.educationField || '', educationInstitution: s.educationInstitution || '',
      shiftStart: s.shift?.start || '', shiftEnd: s.shift?.end || '', role: s.role, profileImage: null
    });
    setViewingStaff(null); // Close detail view
    setShowAddModal(true);
  };
  
  const openAddModal = () => {
    closeAndResetModal();
    setShowAddModal(true);
  }

  const closeAndResetModal = () => {
    setShowAddModal(false);
    setEditingStaff(null);
    setForm({
      firstName: '', lastName: '', email: '', password: '', phone: '',
      country: 'Ethiopia', city: '', kebele: '', salary: '',
      gender: '', educationLevel: '', educationField: '', educationInstitution: '',
      shiftStart: '', shiftEnd: '', role: allowedRoles[0], profileImage: null
    });
    setActiveTab('personal');
  };

  // --- SUB-COMPONENTS ---
  const SortableHeader = ({ label, sortKey }: { label: string; sortKey: keyof Staff | 'name' }) => (
    <th className="p-4 text-left cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => requestSort(sortKey)}>
      <div className="flex items-center gap-2">
        {label}
        {sortConfig?.key === sortKey && <motion.div animate={{ rotate: sortConfig.direction === 'ascending' ? 0 : 180 }}><ArrowUpDown size={14} /></motion.div>}
      </div>
    </th>
  );
  
  // --- ROYAL LOADING SCREEN ---
  if (loading || !minTimePassed) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 flex items-center justify-center overflow-hidden z-50">
        
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 opacity-20">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>

        {/* Floating Role Icons */}
        {[Key, Utensils, Users, BadgeCheck].map((Icon, i) => (
           <motion.div
             key={i}
             className="absolute text-blue-400/20"
             initial={{ y: '100vh', x: Math.random() * 100 - 50 + '%', rotate: 0 }}
             animate={{ y: '-20vh', rotate: 360 }}
             transition={{ 
               duration: 10 + Math.random() * 5, 
               repeat: Infinity, 
               delay: i * 2,
               ease: "linear"
             }}
             style={{ left: `${20 + i * 20}%` }}
           >
             <Icon size={60 + Math.random() * 40} />
           </motion.div>
        ))}

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 text-center px-10"
        >
          {/* 3D Rotating Badge Card */}
          <div className="perspective-1000 mx-auto mb-12 w-64 h-40 relative">
             <motion.div
               animate={{ rotateY: [0, 360] }}
               transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
               className="w-full h-full bg-gradient-to-br from-amber-300 to-yellow-600 rounded-2xl shadow-2xl border-2 border-yellow-200 flex items-center justify-center transform-style-3d"
               style={{ transformStyle: 'preserve-3d' }}
             >
                {/* Front Side */}
                <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-4">
                   <div className="w-16 h-16 bg-white rounded-full mb-2 border-4 border-blue-900 flex items-center justify-center">
                      <Users size={32} className="text-blue-900"/>
                   </div>
                   <div className="h-2 w-24 bg-blue-900/20 rounded mb-1"></div>
                   <div className="h-2 w-16 bg-blue-900/20 rounded"></div>
                </div>
                
                {/* Back Side (Simulated by transparency for simple effect or duplicate div) */}
             </motion.div>
          </div>

          {/* Text */}
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-blue-200 mb-4 tracking-tighter"
          >
            STAFF PORTAL
          </motion.h2>

          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 3.5, ease: "easeInOut" }}
            className="h-1 bg-blue-500/50 mx-auto rounded-full mb-6 max-w-md relative overflow-hidden"
          >
             <div className="absolute top-0 left-0 h-full w-1/3 bg-white blur-sm animate-slide"></div>
          </motion.div>

          <motion.p 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-blue-200 font-mono text-lg tracking-widest uppercase"
          >
            Verifying Credentials...
          </motion.p>

        </motion.div>
      </div>
    );
  }
  
  return (
    <>
      {/* --- MODALS & OVERLAYS --- */}
      <AnimatePresence>
        {zoomedImage && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setZoomedImage(null)}><motion.img initial={{ scale: 0.7 }} animate={{ scale: 1 }} exit={{ scale: 0.7 }} src={zoomedImage} className="max-w-4xl max-h-[90vh] rounded-lg shadow-2xl object-contain"/></motion.div>)}
        {success && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"><motion.div initial={{ scale: 0.7 }} animate={{ scale: 1 }} exit={{ scale: 0.7 }} className="bg-white rounded-2xl p-10 shadow-2xl text-center flex flex-col items-center gap-4"><CheckCircle className="w-20 h-20 text-green-500" /><p className="text-xl font-bold text-gray-800">{success}</p></motion.div></motion.div>)}
        {showDeleteModal && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"><motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full"><h3 className="text-lg font-bold">Confirm Deletion</h3><p className="text-gray-600 my-4">Are you sure? This action is irreversible.</p><div className="flex justify-end gap-3"><button onClick={() => setShowDeleteModal(null)} className="px-4 py-2 border rounded-md hover:bg-gray-100">Cancel</button><button onClick={() => handleDelete(showDeleteModal)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button></div></motion.div></motion.div>)}
      </AnimatePresence>
      
      {/* --- STAFF DETAIL DRAWER --- */}
      <AnimatePresence>
        {viewingStaff && (
          <div className="fixed inset-0 z-40">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50" onClick={() => setViewingStaff(null)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="absolute right-0 top-0 h-full bg-white w-full max-w-lg shadow-2xl flex flex-col">
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">Staff Details</h3>
                <button onClick={() => setViewingStaff(null)} className="p-2 rounded-full hover:bg-gray-100"><X size={20}/></button>
              </div>
              <div className="flex-grow p-6 overflow-y-auto space-y-6">
                 <div className="flex items-center gap-4">
                    <img src={getImageUrl(viewingStaff.profileImage)} className="w-24 h-24 rounded-full object-cover ring-4 ring-amber-100"/>
                    <div>
                      <h2 className="text-2xl font-bold">{viewingStaff.firstName} {viewingStaff.lastName}</h2>
                      <p className="text-gray-500 capitalize">{viewingStaff.role}</p>
                      <span className={`mt-2 inline-block px-3 py-1 text-xs font-medium rounded-full ${viewingStaff.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{viewingStaff.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-4 bg-gray-50 rounded-lg"><strong>Email:</strong><span className="block text-gray-600">{viewingStaff.email}</span></div>
                    <div className="p-4 bg-gray-50 rounded-lg"><strong>Phone:</strong><span className="block text-gray-600">{viewingStaff.phone || '—'}</span></div>
                    <div className="p-4 bg-gray-50 rounded-lg"><strong>Salary:</strong><span className="block text-gray-600">{viewingStaff.salary ? `ETB ${viewingStaff.salary.toLocaleString()}`: '—'}</span></div>
                    <div className="p-4 bg-gray-50 rounded-lg"><strong>Joined:</strong><span className="block text-gray-600">{format(new Date(viewingStaff.createdAt), 'dd MMM yyyy')}</span></div>
                 </div>
                 {/* Add more details as needed */}
              </div>
              <div className="p-6 border-t bg-gray-50 flex gap-3">
                <button onClick={() => openEditModal(viewingStaff)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"><Edit size={16}/> Edit</button>
                <button onClick={() => setShowDeleteModal(viewingStaff._id)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"><Trash2 size={16}/> Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- HEADER & CONTROLS --- */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div><h1 className="text-3xl font-bold text-gray-800"></h1><p className="text-gray-500 mt-1"></p></div>
        {showAddButton && (<button onClick={openAddModal} className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition shadow hover:shadow-lg transform hover:-translate-y-0.5 mr-2"><Plus size={20} /> Add New Staff</button>)}
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-2.5 border rounded-lg" /></div>
        <div className="relative"><Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)} className="pl-11 pr-8 py-2.5 border rounded-lg appearance-none bg-white"><option value="all">All Roles</option>{allowedRoles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}</select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} /></div>
      </div>

      {/* --- STAFF TABLE --- */}
      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><SortableHeader label="Name" sortKey="name" /><SortableHeader label="Email" sortKey="email" /><th className="p-4">Role</th><th className="p-4">Status</th><SortableHeader label="Salary" sortKey="salary" /><th className="p-4">Joined On</th><th className="p-4 text-center">Actions</th></tr></thead>
          <tbody>
            {paginatedStaff.map((s) => (
              <tr key={s._id} onClick={() => setViewingStaff(s)} className={`border-b hover:bg-amber-50/50 transition-all cursor-pointer ${!s.isActive && 'opacity-70'}`}>
                <td className="p-4"><div className="flex items-center gap-3"><img src={getImageUrl(s.profileImage)} className="w-10 h-10 rounded-full object-cover"/><div><div className="font-medium text-gray-800">{s.firstName} {s.lastName}</div><div className="text-xs text-gray-500">{s.phone || 'No phone'}</div></div></div></td>
                <td className="p-4">{s.email}</td><td className="p-4 capitalize">{s.role}</td>
                <td className="p-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${s.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                <td className="p-4">{s.salary ? `ETB ${s.salary.toLocaleString()}` : <span className="text-gray-400">—</span>}</td><td className="p-4">{format(new Date(s.createdAt), 'dd MMM yyyy')}</td>
                <td className="p-4"><div className="flex justify-center gap-2"><button onClick={(e) => {e.stopPropagation(); openEditModal(s)}} className="p-2 text-gray-500 hover:text-amber-600 hover:bg-gray-100 rounded-md" title="Edit"><Edit size={16} /></button><button onClick={(e) => toggleActive(e, s._id, s.isActive)} title="Toggle Status" className={`p-2 rounded-md transition-colors ${s.isActive ? 'text-green-600 hover:bg-green-100' : 'text-gray-500 hover:bg-gray-100'}`}>{s.isActive ? <ToggleRight size={20}/> : <ToggleLeft size={20}/>}</button></div></td>
              </tr>
            ))}
             {paginatedStaff.length === 0 && (<tr><td colSpan={7} className="text-center py-16 text-gray-500"><p className="font-semibold text-lg">No Staff Found</p><p>Try adjusting your search or filter criteria.</p></td></tr>)}
          </tbody>
        </table>
      </div>

      {/* --- PAGINATION CONTROLS --- */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-600">Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong></span>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-3 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 flex items-center gap-1"><ChevronLeft size={16}/> Prev</button>
            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="px-3 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 flex items-center gap-1">Next <ChevronRight size={16}/></button>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT MODAL --- */}
    <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingStaff ? 'Edit Staff Details' : 'Add New Staff'}
                </h2>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b bg-gray-50/50">
                {[{id: 'personal', icon: User}, {id: 'contact', icon: Briefcase}, {id: 'education', icon: GraduationCap}].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors capitalize ${activeTab === tab.id ? 'text-amber-600 border-b-2 border-amber-600 bg-white' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        <tab.icon size={16} /> {tab.id}
                    </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="flex-grow p-6 overflow-y-auto space-y-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Personal Details Tab */}
                    {activeTab === 'personal' && (
                      <div className="space-y-5">
                        <div className="flex items-center gap-4">
                            <label className="relative cursor-pointer group">
                                <div className="w-24 h-24 bg-gray-100 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden group-hover:border-amber-500">
                                    {form.profileImage ? <img src={URL.createObjectURL(form.profileImage)} className="w-full h-full object-cover" alt="Preview"/>
                                    : editingStaff?.profileImage ? <img src={getImageUrl(editingStaff.profileImage)} className="w-full h-full object-cover" alt="Current"/>
                                    : <ImageIcon className="text-gray-400" size={32}/>}
                                </div>
                                <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, profileImage: e.target.files?.[0] || null })} className="hidden" />
                                <div className="absolute bottom-0 right-0 bg-amber-600 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition"><Upload size={14}/></div>
                            </label>
                            <div><p className="font-medium text-gray-700">Profile Photo</p><p className="text-xs text-gray-500">JPG, PNG up to 5MB</p></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input placeholder="First Name *" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="w-full p-3 border rounded-lg" />
                            <input placeholder="Last Name *" required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="w-full p-3 border rounded-lg" />
                        </div>
                        <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="w-full p-3 border rounded-lg bg-white">
                            <option value="">Select Gender</option><option value="male">Male</option><option value="female">Female</option>
                        </select>
                        <input type="email" placeholder="Email *" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full p-3 border rounded-lg" />
                        {!editingStaff && (
                          <input type="password" placeholder="Password *" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full p-3 border rounded-lg" />
                        )}
                      </div>
                    )}
                    {/* Contact & Job Tab */}
                    {activeTab === 'contact' && (
                       <div className="space-y-5">
                            <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full p-3 border rounded-lg" />
                            <div className="grid grid-cols-3 gap-3">
                                <input placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full p-3 border rounded-lg" />
                                <input placeholder="Kebele" value={form.kebele} onChange={e => setForm({ ...form, kebele: e.target.value })} className="w-full p-3 border rounded-lg" />
                                <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="w-full p-3 border rounded-lg bg-white"><option>Ethiopia</option></select>
                            </div>
                            <div className="p-4 border rounded-lg">
                               <p className="text-sm font-medium mb-3">Job Role</p>
                               <div className="grid grid-cols-3 gap-3">
                                  {allowedRoles.map(r => (
                                      <label key={r} className={`p-3 border rounded-lg text-center cursor-pointer ${form.role === r ? 'bg-amber-600 text-white' : 'hover:border-amber-500'}`}>
                                          <input type="radio" name="role" value={r} checked={form.role === r} onChange={e => setForm({ ...form, role: e.target.value })} className="sr-only" />
                                          <span className="capitalize font-medium text-sm">{r}</span>
                                      </label>
                                  ))}
                                </div>
                            </div>
                            {(form.role === 'receptionist' || form.role === 'cashier') && (
                                <div className="grid grid-cols-2 gap-3">
                                    <input placeholder="Shift Start (e.g., 08:00)" value={form.shiftStart} onChange={e => setForm({ ...form, shiftStart: e.target.value })} className="w-full p-3 border rounded-lg" />
                                    <input placeholder="Shift End (e.g., 17:00)" value={form.shiftEnd} onChange={e => setForm({ ...form, shiftEnd: e.target.value })} className="w-full p-3 border rounded-lg" />
                                </div>
                            )}
                            <input type="number" placeholder="Salary (ETB)" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} className="w-full p-3 border rounded-lg" />
                       </div>
                    )}
                    {/* Education Tab */}
                    {activeTab === 'education' && (
                        <div className="space-y-5">
                            <input placeholder="Education Level (e.g., Bachelor's Degree)" value={form.educationLevel} onChange={e => setForm({ ...form, educationLevel: e.target.value })} className="w-full p-3 border rounded-lg" />
                            <input placeholder="Field of Study (e.g., Hospitality Management)" value={form.educationField} onChange={e => setForm({ ...form, educationField: e.target.value })} className="w-full p-3 border rounded-lg" />
                            <input placeholder="Institution Name" value={form.educationInstitution} onChange={e => setForm({ ...form, educationInstitution: e.target.value })} className="w-full p-3 border rounded-lg" />
                        </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </form>

              <div className="flex gap-3 p-6 border-t bg-gray-50/50">
                <button type="button" onClick={closeAndResetModal} className="flex-1 py-3 border rounded-lg hover:bg-gray-100 transition font-medium">Cancel</button>
                <button type="submit" form="add-edit-form" disabled={uploading} className="flex-1 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium disabled:opacity-50" onClick={handleSubmit}>
                  {uploading ? 'Saving...' : editingStaff ? 'Update Staff' : 'Add Staff'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

/*//
'use client';

import {
  Search, Plus, Edit, Trash2, Filter, ChevronDown, Users,
  CheckCircle, Upload, Mail, Lock, Phone, MapPin, DollarSign,
  User, GraduationCap, Clock, Calendar, Image as ImageIcon,
  ToggleLeft, ToggleRight, X
} from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

interface Staff {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage: string;
  role: 'manager' | 'cashier' | 'receptionist';
  isActive: boolean;
  createdAt: string;
  salary?: number;
  shift?: { start: string; end: string };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface StaffManagementClientProps {
  allowedRoles?: ('manager' | 'cashier' | 'receptionist')[];
  title?: string;
  showAddButton?: boolean;
}

export default function StaffManagementClient({
  allowedRoles = ['receptionist', 'cashier'],
  title = 'Staff Management',
  showAddButton = true
}: StaffManagementClientProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'manager' | 'cashier' | 'receptionist'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: '',
    country: 'Ethiopia', city: '', kebele: '', salary: '',
    gender: '', educationLevel: '', educationField: '', educationInstitution: '',
    shiftStart: '', shiftEnd: '', role: 'receptionist' as any,
    profileImage: null as File | null
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomedImage(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await axios.get('/api/users?t=' + Date.now(), { withCredentials: true });
      const filtered = res.data.filter((u: any) => allowedRoles.includes(u.role));
      setStaff(filtered);
      setLoading(false);
    } catch (err: any) {
      console.error('Fetch error:', err.response?.data || err);
      alert(err.response?.data?.message || 'Failed to load staff');
      setLoading(false);
    }
  };

  const filteredStaff = staff.filter(s => {
    const name = `${s.firstName} ${s.lastName}`.toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== '' && v !== null) formData.append(k, v as any);
    });

    try {
      setUploading(true);
      if (editingStaff) {
        await axios.put(`/api/users/${editingStaff._id}`, formData, { withCredentials: true });
      } else {
        await axios.post('/api/users', formData, { withCredentials: true });
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowAddModal(false);
        setEditingStaff(null);
        resetForm();
        fetchStaff();
      }, 3500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving staff');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setForm({
      firstName: '', lastName: '', email: '', password: '', phone: '',
      country: 'Ethiopia', city: '', kebele: '', salary: '',
      gender: '', educationLevel: '', educationField: '', educationInstitution: '',
      shiftStart: '', shiftEnd: '', role: allowedRoles[0], profileImage: null
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/users/${id}`, { withCredentials: true });
      setStaff(prev => prev.filter(s => s._id !== id));
      setShowDeleteModal(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await axios.put(`/api/users/${id}`, { isActive: !current }, { withCredentials: true });
      setStaff(prev => prev.map(s => s._id === id ? { ...s, isActive: !current } : s));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const getImageUrl = (image: string | null | undefined): string => {
    if (!image) return '/default-avatar.png';
    if (image.startsWith('http')) return image;
    if (image.startsWith('/uploads')) return `${API_BASE}${image}`;
    return `${API_BASE}/uploads/avatars/${image}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-8 border-amber-200 animate-spin"></div>
          <div className="absolute inset-0 w-24 h-24 rounded-full border-8 border-amber-600 animate-ping"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-amber-600 rounded-full animate-pulse flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-amber-700 animate-pulse">Loading Staff...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* FULLSCREEN ZOOM /}
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
              className="relative max-w-5xl w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={zoomedImage}
                alt="Zoomed Profile"
                className="w-full h-auto max-h-screen rounded-2xl shadow-2xl object-contain"
              />
              <button
                onClick={() => setZoomedImage(null)}
                className="absolute top-4 right-4 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
              >
                <X size={24} className="text-gray-800" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal /}
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
                Staff {editingStaff ? 'Updated' : 'Added'} Successfully!
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal /}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }} className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-red-600">Confirm Delete</h3>
                <button onClick={() => setShowDeleteModal(null)} className="p-1 hover:bg-gray-100 rounded-lg transition"><X size={20} /></button>
              </div>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this staff member? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(null)} className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium">Cancel</button>
                <button onClick={() => handleDelete(showDeleteModal)} className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header /}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
         
          <p className="text-gray-600 mt-1">Add, edit, or remove hotel employees</p>
        </div>
        {showAddButton && (
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            <Plus size={20} /> Add Staff
          </button>
        )}
      </div>

      {/* Search & Filter /}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)} className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 appearance-none bg-white">
            <option value="all">All Roles</option>
            {allowedRoles.map(r => (
              <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>
      </div>

      {/* Staff Grid /}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((s) => (
          <motion.div
            key={s._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="relative cursor-pointer"
                  onClick={() => setZoomedImage(getImageUrl(s.profileImage))}
                >
                  <img
                    src={getImageUrl(s.profileImage)}
                    alt={`${s.firstName} ${s.lastName}`}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-amber-100"
                    onError={(e) => e.currentTarget.src = '/default-avatar.png'}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-white/90 p-1.5 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200">
                      <ImageIcon size={16} className="text-amber-600" />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{s.firstName} {s.lastName}</h3>
                  <p className="text-sm text-gray-500 capitalize">{s.role}</p>
                </div>
              </div>
              <button
                onClick={() => toggleActive(s._id, s.isActive)}
                className={`p-2 rounded-full transition-all ${s.isActive ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
              >
                {s.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
              </button>
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              <p className="flex items-center gap-1"><Mail size={14} /> {s.email}</p>
              <p className="flex items-center gap-1"><Phone size={14} /> {s.phone || '—'}</p>
              <p className="text-xs text-gray-500 mt-2">Joined: {format(new Date(s.createdAt), 'MMM dd, yyyy')}</p>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setEditingStaff(s);
                  setForm({
                    firstName: s.firstName,
                    lastName: s.lastName,
                    email: s.email,
                    password: '',
                    phone: s.phone,
                    country: 'Ethiopia',
                    city: '',
                    kebele: '',
                    salary: s.salary?.toString() || '',
                    gender: '',
                    educationLevel: '',
                    educationField: '',
                    educationInstitution: '',
                    shiftStart: s.shift?.start || '',
                    shiftEnd: s.shift?.end || '',
                    role: s.role,
                    profileImage: null
                  });
                  setShowAddModal(true);
                }}
                className="flex-1 flex items-center justify-center gap-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                <Edit size={16} /> Edit
              </button>
              <button
                onClick={() => setShowDeleteModal(s._id)}
                className="flex-1 flex items-center justify-center gap-1 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal /}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 my-8 max-h-screen overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingStaff ? 'Edit Staff' : 'Add New Staff'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Profile Upload /}
              <div className="flex items-center gap-4">
                <label className="relative cursor-pointer group">
                  <div className="w-28 h-28 bg-gray-100 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden group-hover:border-amber-500 transition">
                    {form.profileImage ? (
                      <img src={URL.createObjectURL(form.profileImage)} className="w-full h-full object-cover rounded-full" alt="Preview" />
                    ) : editingStaff?.profileImage ? (
                      <img
                        src={getImageUrl(editingStaff.profileImage)}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => e.currentTarget.src = '/default-avatar.png'}
                        alt="Current"
                      />
                    ) : (
                      <ImageIcon className="text-gray-400 group-hover:text-amber-600" size={36} />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm({ ...form, profileImage: e.target.files?.[0] || null })}
                    className="hidden"
                  />
                  <div className="absolute bottom-0 right-0 bg-amber-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition">
                    <Upload size={16} />
                  </div>
                </label>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Profile Photo</p>
                  <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
                </div>
              </div>

              {/* Form Fields /}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input placeholder="First Name *" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input placeholder="Last Name *" required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="email" placeholder="Email *" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
              </div>

              {!editingStaff && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="password" placeholder="Password *" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
                </div>
              )}

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl" />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input placeholder="Kebele" value={form.kebele} onChange={e => setForm({ ...form, kebele: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl" />
                </div>
                <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl">
                  <option>Ethiopia</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {allowedRoles.map(r => (
                  <label key={r} className={`p-3 border rounded-xl text-center cursor-pointer transition-all ${form.role === r ? 'bg-amber-600 text-white border-amber-600' : 'border-gray-300 hover:border-amber-500'}`}>
                    <input type="radio" name="role" value={r} checked={form.role === r} onChange={e => setForm({ ...form, role: e.target.value })} className="sr-only" />
                    <span className="capitalize font-medium">{r}</span>
                  </label>
                ))}
              </div>

              {(form.role === 'receptionist' || form.role === 'cashier') && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input placeholder="Shift Start (08:00)" value={form.shiftStart} onChange={e => setForm({ ...form, shiftStart: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl" />
                  </div>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input placeholder="Shift End (17:00)" value={form.shiftEnd} onChange={e => setForm({ ...form, shiftEnd: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl" />
                  </div>
                </div>
              )}

              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="number" placeholder="Salary (ETB)" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl" />
              </div>

              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => { setShowAddModal(false); setEditingStaff(null); resetForm(); }} className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium">Cancel</button>
                <button type="submit" disabled={uploading} className="flex-1 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition font-medium disabled:opacity-50">
                  {uploading ? 'Saving...' : editingStaff ? 'Update' : 'Add'} Staff
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
}*/