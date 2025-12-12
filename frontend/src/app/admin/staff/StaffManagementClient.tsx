'use client';

import { useState, useEffect, useMemo } from 'react';

import {
  Search, Plus, Edit, Trash2, Filter, ChevronDown, Users,
  CheckCircle, Upload, Mail, Phone, DollarSign,
  User, GraduationCap, Image as ImageIcon, Briefcase,
  ToggleLeft, ToggleRight, X, XCircle, ChevronLeft, ChevronRight, ArrowUpDown, Key, Utensils, BadgeCheck, Camera
} from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useLanguage } from '../../../../context/LanguageContext';

// Animation Variants for the Container (Holds the letters)
// FIX: Explicitly type as Variants to satisfy TypeScript
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // Delay between each letter
      delayChildren: 0.2,
    },
  },
};

// Animation Variants for each Letter
// FIX: Explicitly type as Variants to satisfy TypeScript
const letterVariants: Variants = {
  hidden: { y: 20, opacity: 0, rotateX: -90 },
  visible: {
    y: 0,
    opacity: 1,
    rotateX: 0,
    transition: {
      type: "spring", // Valid literal type for animation
      damping: 12,
      stiffness: 100,
    },
  },
};

// --- INTERFACES & TYPES ---
interface Staff {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage: string;
  role: 'admin' | 'manager' | 'cashier' | 'receptionist';
  isActive: boolean;
  createdAt: string;
  salary?: number;
  shift?: { start: string; end: string };
  city?: string;
  kebele?: string;
  country?: string;
  gender?: string;
  educationLevel?: string;
  educationField?: string;
  educationInstitution?: string;
  education?: { level: string; field: string; institution: string };
  address?: { country: string; city: string; kebele: string };
}

interface StaffManagementClientProps {
  allowedRoles?: ('manager' | 'cashier' | 'receptionist' | 'admin')[];
  title?: string;
  showAddButton?: boolean;
}

type SortConfig = {
  key: keyof Staff | 'name';
  direction: 'ascending' | 'descending';
};

// --- CONSTANTS ---
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ITEMS_PER_PAGE = 8;

const getImageUrl = (image: string | null | undefined): string => {
  if (!image) return '/default-avatar.png';
  if (image.startsWith('http')) return image;
  if (image.startsWith('/uploads')) return `${API_BASE}${image}`;
  return `${API_BASE}/uploads/avatars/${image}`;
};

export default function StaffManagementClient({
  allowedRoles = ['receptionist', 'cashier'],
  title = 'Staff Management',
  showAddButton = true
}: StaffManagementClientProps) {

  // --- STATE MANAGEMENT ---
  const { t, language } = useLanguage();
   // Get the text based on language
  const titleText = t('staffManagement');
  const descriptionText = t('manageEmployeesDesc');
  // Split text into array of letters for animation
  const titleLetters = titleText.split("");

  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [minTimePassed, setMinTimePassed] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
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

  // Store particle configuration in state to avoid hydration mismatch
  const [particles, setParticles] = useState<{ x: number, size: number, duration: number, delay: number }[]>([]);

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: '',
    country: 'Ethiopia', city: '', kebele: '', salary: '',
    gender: '', educationLevel: '', educationField: '', educationInstitution: '',
    shiftStart: '', shiftEnd: '', role: 'receptionist' as string,
    profileImage: null as File | null,
    isActive: true
  });

  // --- EFFECTS ---
  
  // 1. Initialize particles on mount
  useEffect(() => {
    const newParticles = [0, 1, 2, 3].map((i) => ({
      x: Math.random() * 100 - 50,
      size: 60 + Math.random() * 40,
      duration: 10 + Math.random() * 5,
      delay: i * 2
    }));
    setParticles(newParticles);
  }, []);

  // 2. Minimum Loading Timer (4 Seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, 4000); 
    return () => clearTimeout(timer);
  }, []);

  // 3. Fetch Data
  useEffect(() => {
    fetchStaff();
  }, []);

  // 4. Keyboard Listener
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
    try {
      const res = await axios.get(`${API_BASE}/api/users`, { withCredentials: true });
      const filtered = res.data.filter((u: any) => allowedRoles.includes(u.role));
      setStaff(filtered);
    } catch (err: any) {
      console.error('Fetch error:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  // --- SORTING & FILTERING ---
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
        
        if (!aValue) aValue = '';
        if (!bValue) bValue = '';

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

  // --- FORM SUBMISSION ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== '' && value !== null) formData.append(key, value as any);
    });

    setUploading(true);
    try {
      if (editingStaff) {
        await axios.put(`${API_BASE}/api/users/${editingStaff._id}`, formData, { withCredentials: true });
        setSuccess(t('updateSuccessfully'));
      } else {
        await axios.post(`${API_BASE}/api/users`, formData, { withCredentials: true });
        setSuccess(t('addSuccessfully'));
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
      await axios.delete(`${API_BASE}/api/users/${id}`, { withCredentials: true });
      setStaff(prev => prev.filter(s => s._id !== id));
      setShowDeleteModal(null);
      setViewingStaff(null); 
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const toggleActive = async (e: React.MouseEvent, id: string, currentStatus: boolean) => {
    e.stopPropagation();
    try {
      await axios.put(`${API_BASE}/api/users/${id}`, { isActive: !currentStatus }, { withCredentials: true });
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
      firstName: s.firstName, 
      lastName: s.lastName, 
      email: s.email, 
      password: '', 
      phone: s.phone || '',
      country: s.address?.country || s.country || 'Ethiopia', 
      city: s.address?.city || s.city || '', 
      kebele: s.address?.kebele || s.kebele || '', 
      salary: s.salary?.toString() || '',
      gender: s.gender || '', 
      educationLevel: s.education?.level || s.educationLevel || '', 
      educationField: s.education?.field || s.educationField || '', 
      educationInstitution: s.education?.institution || s.educationInstitution || '',
      shiftStart: s.shift?.start || '', 
      shiftEnd: s.shift?.end || '', 
      role: s.role, 
      profileImage: null,
      isActive: s.isActive
    });
    setViewingStaff(null);
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
      shiftStart: '', shiftEnd: '', role: allowedRoles[0], profileImage: null, isActive: true
    });
    setActiveTab('personal');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'am' ? 'am-ET' : 'en-US', {
      style: 'currency',
      currency: 'ETB'
    }).format(amount);
  };

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
        <div className="absolute inset-0 opacity-20">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>
        
        {/* Render particles ONLY when client-side state is ready */}
        {particles.length > 0 && [Key, Utensils, Users, BadgeCheck].map((Icon, i) => (
           <motion.div
             key={i}
             className="absolute text-blue-400/20"
             initial={{ y: '100vh', x: `${particles[i].x}%`, rotate: 0 }}
             animate={{ y: '-20vh', rotate: 360 }}
             transition={{ 
               duration: particles[i].duration, 
               repeat: Infinity, 
               delay: particles[i].delay,
               ease: "linear"
             }}
             style={{ left: `${20 + i * 20}%` }}
           >
             <Icon size={particles[i].size} />
           </motion.div>
        ))}

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 text-center px-10"
        >
          <div className="perspective-1000 mx-auto mb-12 w-64 h-40 relative">
             <motion.div
               animate={{ rotateY: [0, 360] }}
               transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
               className="w-full h-full bg-gradient-to-br from-amber-300 to-yellow-600 rounded-2xl shadow-2xl border-2 border-yellow-200 flex items-center justify-center transform-style-3d"
               style={{ transformStyle: 'preserve-3d' }}
             >
                <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-4">
                   <div className="w-16 h-16 bg-white rounded-full mb-2 border-4 border-blue-900 flex items-center justify-center">
                      <Users size={32} className="text-blue-900"/>
                   </div>
                   <div className="h-2 w-24 bg-blue-900/20 rounded mb-1"></div>
                   <div className="h-2 w-16 bg-blue-900/20 rounded"></div>
                </div>
             </motion.div>
          </div>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-blue-200 mb-4 tracking-tighter"
          >
            {language === 'am' ? 'ሰራተኖች' : 'STAFF'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">{language === 'am' ? 'ፖርታል' : 'PORTAL'}</span>
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
            {language === 'am' ? 'ማረጋገጫ በመካሄድ ላይ...' : 'Verifying Credentials...'}
          </motion.p>
        </motion.div>
      </div>
    );
  }
  
  // --- MAIN CONTENT ---
  return (
    <>
      {/* ... (Modals & Overlays code remains unchanged) ... */}
      <AnimatePresence>
        {zoomedImage && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setZoomedImage(null)}><motion.img initial={{ scale: 0.7 }} animate={{ scale: 1 }} exit={{ scale: 0.7 }} src={zoomedImage} className="max-w-4xl max-h-[90vh] rounded-lg shadow-2xl object-contain"/></motion.div>)}
        {success && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"><motion.div initial={{ scale: 0.7 }} animate={{ scale: 1 }} exit={{ scale: 0.7 }} className="bg-white rounded-2xl p-10 shadow-2xl text-center flex flex-col items-center gap-4"><CheckCircle className="w-20 h-20 text-green-500" /><p className="text-xl font-bold text-gray-800">{success}</p></motion.div></motion.div>)}
        {showDeleteModal && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"><motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full"><h3 className="text-lg font-bold">{t('deleteStaff')}</h3><p className="text-gray-600 my-4">{t('deleteStaffConfirm')}</p><div className="flex justify-end gap-3"><button onClick={() => setShowDeleteModal(null)} className="px-4 py-2 border rounded-md hover:bg-gray-100">{t('cancel')}</button><button onClick={() => handleDelete(showDeleteModal)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">{t('yesDelete')}</button></div></motion.div></motion.div>)}
      </AnimatePresence>
      
      <AnimatePresence>
        {viewingStaff && (
          <div className="fixed inset-0 z-40">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50" onClick={() => setViewingStaff(null)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="absolute right-0 top-0 h-full bg-white w-full max-w-lg shadow-2xl flex flex-col overflow-y-auto">
              <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-xl font-bold text-gray-800">{t('employee')} Details</h3>
                <button onClick={() => setViewingStaff(null)} className="p-2 rounded-full hover:bg-gray-100"><X size={20}/></button>
              </div>
              <div className="flex-grow p-6 space-y-6">
                 <div className="flex items-center gap-4">
                    <img src={getImageUrl(viewingStaff.profileImage)} className="w-24 h-24 rounded-full object-cover ring-4 ring-amber-100"/>
                    <div>
                      <h2 className="text-2xl font-bold">{viewingStaff.firstName} {viewingStaff.lastName}</h2>
                      <p className="text-gray-500 capitalize">{t(viewingStaff.role)}</p>
                      <span className={`mt-2 inline-block px-3 py-1 text-xs font-medium rounded-full ${viewingStaff.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{viewingStaff.isActive ? t('activeStaff') : t('inactiveStaff')}</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-4 bg-gray-50 rounded-lg"><strong>{t('email')}:</strong><span className="block text-gray-600">{viewingStaff.email}</span></div>
                    <div className="p-4 bg-gray-50 rounded-lg"><strong>{t('phone')}:</strong><span className="block text-gray-600">{viewingStaff.phone || '—'}</span></div>
                    <div className="p-4 bg-gray-50 rounded-lg"><strong>{t('salary')}:</strong><span className="block text-gray-600">{viewingStaff.salary ? formatCurrency(viewingStaff.salary) : '—'}</span></div>
                    <div className="p-4 bg-gray-50 rounded-lg"><strong>Joined:</strong><span className="block text-gray-600">{format(new Date(viewingStaff.createdAt), 'dd MMM yyyy')}</span></div>
                 </div>
              </div>
              <div className="p-6 border-t bg-gray-50 flex gap-3 sticky bottom-0">
                <button onClick={() => openEditModal(viewingStaff)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"><Edit size={16}/> {t('edit')}</button>
                <button onClick={() => setShowDeleteModal(viewingStaff._id)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"><Trash2 size={16}/> {t('delete')}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
 {/* --- ANIMATED HEADER SECTION --- */}
        <div className="mb-10 flex items-center gap-5">
          
          {/* Animated Icon Container */}
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="relative w-16 h-16"
          >
            {/* Pulsing Glow Effect behind icon */}
            <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
            
            <div className="relative w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-2xl border border-blue-400/30">
              <Users size={32} />
            </div>
          </motion.div>

          <div>
            {/* Letter-by-Letter Animated Title */}
            <motion.h1 
              className="text-4xl font-black text-gray-900 dark:text-white flex flex-wrap"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {titleLetters.map((char, index) => (
                <motion.span key={index} variants={letterVariants} className="inline-block">
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </motion.h1>

            {/* Sliding Description */}
            <motion.p 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="text-gray-600 dark:text-gray-400 text-lg mt-1 font-medium"
            >
              {descriptionText}
            </motion.p>
          </div>
        </div>
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div>
            {/* The titleText and descriptionText variables are available here if needed */}
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="text-amber-600" /> {t('staffList')}
            </h1>
            <p className="text-gray-500 mt-1">{t('manageHotelStaff')}</p>
        </div>
        {showAddButton && (<button onClick={openAddModal} className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition shadow hover:shadow-lg transform hover:-translate-y-0.5 mr-2"><Plus size={20} /> {t('addStaff')}</button>)}
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder={t('searchStaff')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" /></div>
        <div className="relative"><Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)} className="pl-11 pr-8 py-2.5 border rounded-lg appearance-none bg-white focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"><option value="all">{t('allRoles')}</option>{allowedRoles.map(r => <option key={r} value={r}>{t(r as any)}</option>)}</select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} /></div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
                <SortableHeader label={t('employee')} sortKey="name" />
                <SortableHeader label={t('email')} sortKey="email" />
                <th className="p-4">{t('role')}</th>
                <th className="p-4">{t('status')}</th>
                <SortableHeader label={t('salary')} sortKey="salary" />
                <th className="p-4">{t('date')}</th>
                <th className="p-4 text-center">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStaff.map((s) => (
              <tr key={s._id} onClick={() => setViewingStaff(s)} className={`border-b hover:bg-amber-50/50 transition-all cursor-pointer ${!s.isActive && 'opacity-70'}`}>
                <td className="p-4"><div className="flex items-center gap-3"><img src={getImageUrl(s.profileImage)} className="w-10 h-10 rounded-full object-cover"/><div><div className="font-medium text-gray-800">{s.firstName} {s.lastName}</div><div className="text-xs text-gray-500">{s.phone || 'No phone'}</div></div></div></td>
                <td className="p-4">{s.email}</td>
                <td className="p-4"><span className="capitalize">{t(s.role)}</span></td>
                <td className="p-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${s.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{s.isActive ? t('activeStaff') : t('inactiveStaff')}</span></td>
                <td className="p-4">{s.salary ? formatCurrency(s.salary) : <span className="text-gray-400">—</span>}</td>
                <td className="p-4">{format(new Date(s.createdAt), 'dd MMM yyyy')}</td>
                <td className="p-4"><div className="flex justify-center gap-2"><button onClick={(e) => {e.stopPropagation(); openEditModal(s)}} className="p-2 text-gray-500 hover:text-amber-600 hover:bg-gray-100 rounded-md" title={t('edit')}><Edit size={16} /></button><button onClick={(e) => toggleActive(e, s._id, s.isActive)} title="Toggle Status" className={`p-2 rounded-md transition-colors ${s.isActive ? 'text-green-600 hover:bg-green-100' : 'text-gray-500 hover:bg-gray-100'}`}>{s.isActive ? <ToggleRight size={20}/> : <ToggleLeft size={20}/>}</button></div></td>
              </tr>
            ))}
             {paginatedStaff.length === 0 && (<tr><td colSpan={7} className="text-center py-16 text-gray-500"><p className="font-semibold text-lg">{t('noStaffFound')}</p></td></tr>)}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-600">Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong></span>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-3 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 flex items-center gap-1"><ChevronLeft size={16}/> Prev</button>
            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="px-3 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 flex items-center gap-1">Next <ChevronRight size={16}/></button>
          </div>
        </div>
      )}

    <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b flex justify-between items-center bg-white z-10 sticky top-0 rounded-t-xl">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingStaff ? t('updateStaff') : t('addStaff')}
                </h2>
                <button onClick={closeAndResetModal} className="p-1 hover:bg-gray-100 rounded-full"><XCircle size={24} className="text-gray-500"/></button>
              </div>

              <div className="flex border-b bg-gray-50/50">
                {[{id: 'personal', icon: User}, {id: 'contact', icon: Briefcase}, {id: 'education', icon: GraduationCap}].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors capitalize ${activeTab === tab.id ? 'text-amber-600 border-b-2 border-amber-600 bg-white' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        <tab.icon size={16} /> {tab.id === 'personal' ? 'Personal' : tab.id === 'contact' ? 'Contact & Job' : 'Education'}
                    </button>
                ))}
              </div>

              <form id="add-edit-form" onSubmit={handleSubmit} className="flex-grow p-6 overflow-y-auto space-y-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
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
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600">{t('firstName')} *</label>
                                <input required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600">{t('lastName')} *</label>
                                <input required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600">{t('gender')}</label>
                            <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-amber-500 outline-none">
                                <option value="">Select Gender</option><option value="male">{t('male')}</option><option value="female">{t('female')}</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600">{t('email')} *</label>
                            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                        </div>
                        {!editingStaff && (
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600">{t('password')} *</label>
                            <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                          </div>
                        )}
                      </div>
                    )}
                    {activeTab === 'contact' && (
                       <div className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600">{t('phone')}</label>
                                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600">{t('city')}</label>
                                    <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600">{t('kebele')}</label>
                                    <input value={form.kebele} onChange={e => setForm({ ...form, kebele: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600">{t('country')}</label>
                                    <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-amber-500 outline-none"><option>Ethiopia</option></select>
                                </div>
                            </div>
                            <div className="p-4 border rounded-lg">
                               <p className="text-sm font-medium mb-3">{t('role')}</p>
                               <div className="grid grid-cols-3 gap-3">
                                  {allowedRoles.map(r => (
                                      <label key={r} className={`p-3 border rounded-lg text-center cursor-pointer transition-all ${form.role === r ? 'bg-amber-600 text-white shadow-md' : 'hover:border-amber-500 hover:bg-gray-50'}`}>
                                          <input type="radio" name="role" value={r} checked={form.role === r} onChange={e => setForm({ ...form, role: e.target.value })} className="sr-only" />
                                          <span className="capitalize font-medium text-sm">{t(r as any)}</span>
                                      </label>
                                  ))}
                                </div>
                            </div>
                            {(form.role === 'receptionist' || form.role === 'cashier') && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600">{t('shiftStart')} (e.g., 08:00)</label>
                                        <input value={form.shiftStart} onChange={e => setForm({ ...form, shiftStart: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600">{t('shiftEnd')} (e.g., 17:00)</label>
                                        <input value={form.shiftEnd} onChange={e => setForm({ ...form, shiftEnd: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                                    </div>
                                </div>
                            )}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600">{t('salaryAmount')} (ETB)</label>
                                <input type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                            </div>
                       </div>
                    )}
                    {activeTab === 'education' && (
                        <div className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600">{t('educationLevel')}</label>
                                <select value={form.educationLevel} onChange={e => setForm({ ...form, educationLevel: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white">
                                    <option value="">Select Level</option>
                                    <option value="9-12">{t('grade9_12')}</option>
                                    <option value="diploma">{t('diploma')}</option>
                                    <option value="degree">{t('degree')}</option>
                                    <option value="master">{t('master')}</option>
                                    <option value="phd">{t('phd')}</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600">{t('fieldOfStudy')}</label>
                                <input value={form.educationField} onChange={e => setForm({ ...form, educationField: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600">{t('institution')}</label>
                                <input value={form.educationInstitution} onChange={e => setForm({ ...form, educationInstitution: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                            </div>
                        </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </form>

              <div className="flex gap-3 p-6 border-t bg-gray-50/50 sticky bottom-0 rounded-b-xl">
                <button type="button" onClick={closeAndResetModal} className="flex-1 py-3 border rounded-lg hover:bg-gray-100 transition font-medium">{t('cancel')}</button>
                <button type="submit" form="add-edit-form" disabled={uploading} className="flex-1 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium disabled:opacity-50">
                  {uploading ? t('saving') : editingStaff ? t('updateStaff') : t('saveStaff')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}/*'use client';
import { Image, Keyboard } from 'react-native';

import { useState, useEffect, useMemo } from 'react';

import {
  Search, Plus, Edit, Trash2, Filter, ChevronDown, Users,
  CheckCircle, Upload, Mail, Phone, DollarSign,
  User, GraduationCap, Image as ImageIcon, Briefcase,
  ToggleLeft, ToggleRight, X, XCircle, ChevronLeft, ChevronRight, ArrowUpDown, Key, Utensils, BadgeCheck, Camera
} from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../../context/LanguageContext';
// Animation Variants for the Container (Holds the letters)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // Delay between each letter
      delayChildren: 0.2,
    },
  },
};

// Animation Variants for each Letter
const letterVariants = {
  hidden: { y: 20, opacity: 0, rotateX: -90 },
  visible: {
    y: 0,
    opacity: 1,
    rotateX: 0,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 100,
    },
  },
};

// --- INTERFACES & TYPES ---
interface Staff {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage: string;
  role: 'admin' | 'manager' | 'cashier' | 'receptionist';
  isActive: boolean;
  createdAt: string;
  salary?: number;
  shift?: { start: string; end: string };
  city?: string;
  kebele?: string;
  country?: string;
  gender?: string;
  educationLevel?: string;
  educationField?: string;
  educationInstitution?: string;
  education?: { level: string; field: string; institution: string };
  address?: { country: string; city: string; kebele: string };
}

interface StaffManagementClientProps {
  allowedRoles?: ('manager' | 'cashier' | 'receptionist' | 'admin')[];
  title?: string;
  showAddButton?: boolean;
}

type SortConfig = {
  key: keyof Staff | 'name';
  direction: 'ascending' | 'descending';
};

// --- CONSTANTS ---
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ITEMS_PER_PAGE = 8;

const getImageUrl = (image: string | null | undefined): string => {
  if (!image) return '/default-avatar.png';
  if (image.startsWith('http')) return image;
  if (image.startsWith('/uploads')) return `${API_BASE}${image}`;
  return `${API_BASE}/uploads/avatars/${image}`;
};

export default function StaffManagementClient({
  allowedRoles = ['receptionist', 'cashier'],
  title = 'Staff Management',
  showAddButton = true
}: StaffManagementClientProps) {

  // --- STATE MANAGEMENT ---
  const { t, language } = useLanguage();
   // Get the text based on language
  const titleText = t('staffManagement');
  const descriptionText = t('manageEmployeesDesc');
  // Split text into array of letters for animation
  const titleLetters = titleText.split("");



  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [minTimePassed, setMinTimePassed] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
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

  // Store particle configuration in state to avoid hydration mismatch
  const [particles, setParticles] = useState<{ x: number, size: number, duration: number, delay: number }[]>([]);

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: '',
    country: 'Ethiopia', city: '', kebele: '', salary: '',
    gender: '', educationLevel: '', educationField: '', educationInstitution: '',
    shiftStart: '', shiftEnd: '', role: 'receptionist' as string,
    profileImage: null as File | null,
    isActive: true
  });

  // --- EFFECTS ---
  
  // 1. Initialize particles on mount
  useEffect(() => {
    const newParticles = [0, 1, 2, 3].map((i) => ({
      x: Math.random() * 100 - 50,
      size: 60 + Math.random() * 40,
      duration: 10 + Math.random() * 5,
      delay: i * 2
    }));
    setParticles(newParticles);
  }, []);

  // 2. Minimum Loading Timer (4 Seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, 4000); 
    return () => clearTimeout(timer);
  }, []);

  // 3. Fetch Data
  useEffect(() => {
    fetchStaff();
  }, []);

  // 4. Keyboard Listener
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
    // Note: We don't reset loading to true here to prevent flickering on refetch
    try {
      const res = await axios.get(`${API_BASE}/api/users`, { withCredentials: true });
      const filtered = res.data.filter((u: any) => allowedRoles.includes(u.role));
      setStaff(filtered);
    } catch (err: any) {
      console.error('Fetch error:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  // --- SORTING & FILTERING ---
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
        
        if (!aValue) aValue = '';
        if (!bValue) bValue = '';

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

  // --- FORM SUBMISSION ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== '' && value !== null) formData.append(key, value as any);
    });

    setUploading(true);
    try {
      if (editingStaff) {
        await axios.put(`${API_BASE}/api/users/${editingStaff._id}`, formData, { withCredentials: true });
        setSuccess(t('updateSuccessfully'));
      } else {
        await axios.post(`${API_BASE}/api/users`, formData, { withCredentials: true });
        setSuccess(t('addSuccessfully'));
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
      await axios.delete(`${API_BASE}/api/users/${id}`, { withCredentials: true });
      setStaff(prev => prev.filter(s => s._id !== id));
      setShowDeleteModal(null);
      setViewingStaff(null); 
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const toggleActive = async (e: React.MouseEvent, id: string, currentStatus: boolean) => {
    e.stopPropagation();
    try {
      await axios.put(`${API_BASE}/api/users/${id}`, { isActive: !currentStatus }, { withCredentials: true });
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
      firstName: s.firstName, 
      lastName: s.lastName, 
      email: s.email, 
      password: '', 
      phone: s.phone || '',
      country: s.address?.country || s.country || 'Ethiopia', 
      city: s.address?.city || s.city || '', 
      kebele: s.address?.kebele || s.kebele || '', 
      salary: s.salary?.toString() || '',
      gender: s.gender || '', 
      educationLevel: s.education?.level || s.educationLevel || '', 
      educationField: s.education?.field || s.educationField || '', 
      educationInstitution: s.education?.institution || s.educationInstitution || '',
      shiftStart: s.shift?.start || '', 
      shiftEnd: s.shift?.end || '', 
      role: s.role, 
      profileImage: null,
      isActive: s.isActive
    });
    setViewingStaff(null);
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
      shiftStart: '', shiftEnd: '', role: allowedRoles[0], profileImage: null, isActive: true
    });
    setActiveTab('personal');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'am' ? 'am-ET' : 'en-US', {
      style: 'currency',
      currency: 'ETB'
    }).format(amount);
  };

  const SortableHeader = ({ label, sortKey }: { label: string; sortKey: keyof Staff | 'name' }) => (
    <th className="p-4 text-left cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => requestSort(sortKey)}>
      <div className="flex items-center gap-2">
        {label}
        {sortConfig?.key === sortKey && <motion.div animate={{ rotate: sortConfig.direction === 'ascending' ? 0 : 180 }}><ArrowUpDown size={14} /></motion.div>}
      </div>
    </th>
  );
  
  // --- ROYAL LOADING SCREEN ---
  // Display this while data is loading OR minimum time hasn't passed
  if (loading || !minTimePassed) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 flex items-center justify-center overflow-hidden z-50">
        <div className="absolute inset-0 opacity-20">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>
        
      
        {particles.length > 0 && [Key, Utensils, Users, BadgeCheck].map((Icon, i) => (
           <motion.div
             key={i}
             className="absolute text-blue-400/20"
             initial={{ y: '100vh', x: `${particles[i].x}%`, rotate: 0 }}
             animate={{ y: '-20vh', rotate: 360 }}
             transition={{ 
               duration: particles[i].duration, 
               repeat: Infinity, 
               delay: particles[i].delay,
               ease: "linear"
             }}
             style={{ left: `${20 + i * 20}%` }}
           >
             <Icon size={particles[i].size} />
           </motion.div>
        ))}

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 text-center px-10"
        >
          <div className="perspective-1000 mx-auto mb-12 w-64 h-40 relative">
             <motion.div
               animate={{ rotateY: [0, 360] }}
               transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
               className="w-full h-full bg-gradient-to-br from-amber-300 to-yellow-600 rounded-2xl shadow-2xl border-2 border-yellow-200 flex items-center justify-center transform-style-3d"
               style={{ transformStyle: 'preserve-3d' }}
             >
                <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-4">
                   <div className="w-16 h-16 bg-white rounded-full mb-2 border-4 border-blue-900 flex items-center justify-center">
                      <Users size={32} className="text-blue-900"/>
                   </div>
                   <div className="h-2 w-24 bg-blue-900/20 rounded mb-1"></div>
                   <div className="h-2 w-16 bg-blue-900/20 rounded"></div>
                </div>
             </motion.div>
          </div>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-blue-200 mb-4 tracking-tighter"
          >
            {language === 'am' ? 'ሰራተኖች' : 'STAFF'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">{language === 'am' ? 'ፖርታል' : 'PORTAL'}</span>
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
            {language === 'am' ? 'ማረጋገጫ በመካሄድ ላይ...' : 'Verifying Credentials...'}
          </motion.p>
        </motion.div>
      </div>
    );
  }
  
  // --- MAIN CONTENT ---
  return (
    <>
      
      <AnimatePresence>
        {zoomedImage && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setZoomedImage(null)}><motion.img initial={{ scale: 0.7 }} animate={{ scale: 1 }} exit={{ scale: 0.7 }} src={zoomedImage} className="max-w-4xl max-h-[90vh] rounded-lg shadow-2xl object-contain"/></motion.div>)}
        {success && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"><motion.div initial={{ scale: 0.7 }} animate={{ scale: 1 }} exit={{ scale: 0.7 }} className="bg-white rounded-2xl p-10 shadow-2xl text-center flex flex-col items-center gap-4"><CheckCircle className="w-20 h-20 text-green-500" /><p className="text-xl font-bold text-gray-800">{success}</p></motion.div></motion.div>)}
        {showDeleteModal && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"><motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full"><h3 className="text-lg font-bold">{t('deleteStaff')}</h3><p className="text-gray-600 my-4">{t('deleteStaffConfirm')}</p><div className="flex justify-end gap-3"><button onClick={() => setShowDeleteModal(null)} className="px-4 py-2 border rounded-md hover:bg-gray-100">{t('cancel')}</button><button onClick={() => handleDelete(showDeleteModal)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">{t('yesDelete')}</button></div></motion.div></motion.div>)}
      </AnimatePresence>
      
      <AnimatePresence>
        {viewingStaff && (
          <div className="fixed inset-0 z-40">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50" onClick={() => setViewingStaff(null)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="absolute right-0 top-0 h-full bg-white w-full max-w-lg shadow-2xl flex flex-col overflow-y-auto">
              <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-xl font-bold text-gray-800">{t('employee')} Details</h3>
                <button onClick={() => setViewingStaff(null)} className="p-2 rounded-full hover:bg-gray-100"><X size={20}/></button>
              </div>
              <div className="flex-grow p-6 space-y-6">
                 <div className="flex items-center gap-4">
                    <img src={getImageUrl(viewingStaff.profileImage)} className="w-24 h-24 rounded-full object-cover ring-4 ring-amber-100"/>
                    <div>
                      <h2 className="text-2xl font-bold">{viewingStaff.firstName} {viewingStaff.lastName}</h2>
                      <p className="text-gray-500 capitalize">{t(viewingStaff.role)}</p>
                      <span className={`mt-2 inline-block px-3 py-1 text-xs font-medium rounded-full ${viewingStaff.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{viewingStaff.isActive ? t('activeStaff') : t('inactiveStaff')}</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-4 bg-gray-50 rounded-lg"><strong>{t('email')}:</strong><span className="block text-gray-600">{viewingStaff.email}</span></div>
                    <div className="p-4 bg-gray-50 rounded-lg"><strong>{t('phone')}:</strong><span className="block text-gray-600">{viewingStaff.phone || '—'}</span></div>
                    <div className="p-4 bg-gray-50 rounded-lg"><strong>{t('salary')}:</strong><span className="block text-gray-600">{viewingStaff.salary ? formatCurrency(viewingStaff.salary) : '—'}</span></div>
                    <div className="p-4 bg-gray-50 rounded-lg"><strong>Joined:</strong><span className="block text-gray-600">{format(new Date(viewingStaff.createdAt), 'dd MMM yyyy')}</span></div>
                 </div>
              </div>
              <div className="p-6 border-t bg-gray-50 flex gap-3 sticky bottom-0">
                <button onClick={() => openEditModal(viewingStaff)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"><Edit size={16}/> {t('edit')}</button>
                <button onClick={() => setShowDeleteModal(viewingStaff._id)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"><Trash2 size={16}/> {t('delete')}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

        <div className="mb-10 flex items-center gap-5">
          
         
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="relative w-16 h-16"
          >
            
            <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
            
            <div className="relative w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-2xl border border-blue-400/30">
              <Users size={32} />
            </div>
          </motion.div>

          <div>
           
            <motion.h1 
              className="text-4xl font-black text-gray-900 dark:text-white flex flex-wrap"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {titleLetters.map((char, index) => (
                <motion.span key={index} variants={letterVariants} className="inline-block">
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </motion.h1>

          
            <motion.p 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="text-gray-600 dark:text-gray-400 text-lg mt-1 font-medium"
            >
              {descriptionText}
            </motion.p>
          </div>
        </div>
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div>
            
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="text-amber-600" /> {t('staffList')}
            </h1>
            <p className="text-gray-500 mt-1">{t('manageHotelStaff')}</p>
        </div>
        {showAddButton && (<button onClick={openAddModal} className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition shadow hover:shadow-lg transform hover:-translate-y-0.5 mr-2"><Plus size={20} /> {t('addStaff')}</button>)}
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder={t('searchStaff')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" /></div>
        <div className="relative"><Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)} className="pl-11 pr-8 py-2.5 border rounded-lg appearance-none bg-white focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"><option value="all">{t('allRoles')}</option>{allowedRoles.map(r => <option key={r} value={r}>{t(r as any)}</option>)}</select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} /></div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
                <SortableHeader label={t('employee')} sortKey="name" />
                <SortableHeader label={t('email')} sortKey="email" />
                <th className="p-4">{t('role')}</th>
                <th className="p-4">{t('status')}</th>
                <SortableHeader label={t('salary')} sortKey="salary" />
                <th className="p-4">{t('date')}</th>
                <th className="p-4 text-center">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStaff.map((s) => (
              <tr key={s._id} onClick={() => setViewingStaff(s)} className={`border-b hover:bg-amber-50/50 transition-all cursor-pointer ${!s.isActive && 'opacity-70'}`}>
                <td className="p-4"><div className="flex items-center gap-3"><img src={getImageUrl(s.profileImage)} className="w-10 h-10 rounded-full object-cover"/><div><div className="font-medium text-gray-800">{s.firstName} {s.lastName}</div><div className="text-xs text-gray-500">{s.phone || 'No phone'}</div></div></div></td>
                <td className="p-4">{s.email}</td>
                <td className="p-4"><span className="capitalize">{t(s.role)}</span></td>
                <td className="p-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${s.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{s.isActive ? t('activeStaff') : t('inactiveStaff')}</span></td>
                <td className="p-4">{s.salary ? formatCurrency(s.salary) : <span className="text-gray-400">—</span>}</td>
                <td className="p-4">{format(new Date(s.createdAt), 'dd MMM yyyy')}</td>
                <td className="p-4"><div className="flex justify-center gap-2"><button onClick={(e) => {e.stopPropagation(); openEditModal(s)}} className="p-2 text-gray-500 hover:text-amber-600 hover:bg-gray-100 rounded-md" title={t('edit')}><Edit size={16} /></button><button onClick={(e) => toggleActive(e, s._id, s.isActive)} title="Toggle Status" className={`p-2 rounded-md transition-colors ${s.isActive ? 'text-green-600 hover:bg-green-100' : 'text-gray-500 hover:bg-gray-100'}`}>{s.isActive ? <ToggleRight size={20}/> : <ToggleLeft size={20}/>}</button></div></td>
              </tr>
            ))}
             {paginatedStaff.length === 0 && (<tr><td colSpan={7} className="text-center py-16 text-gray-500"><p className="font-semibold text-lg">{t('noStaffFound')}</p></td></tr>)}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-600">Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong></span>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-3 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 flex items-center gap-1"><ChevronLeft size={16}/> Prev</button>
            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="px-3 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 flex items-center gap-1">Next <ChevronRight size={16}/></button>
          </div>
        </div>
      )}

    <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b flex justify-between items-center bg-white z-10 sticky top-0 rounded-t-xl">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingStaff ? t('updateStaff') : t('addStaff')}
                </h2>
                <button onClick={closeAndResetModal} className="p-1 hover:bg-gray-100 rounded-full"><XCircle size={24} className="text-gray-500"/></button>
              </div>

              <div className="flex border-b bg-gray-50/50">
                {[{id: 'personal', icon: User}, {id: 'contact', icon: Briefcase}, {id: 'education', icon: GraduationCap}].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors capitalize ${activeTab === tab.id ? 'text-amber-600 border-b-2 border-amber-600 bg-white' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        <tab.icon size={16} /> {tab.id === 'personal' ? 'Personal' : tab.id === 'contact' ? 'Contact & Job' : 'Education'}
                    </button>
                ))}
              </div>

              <form id="add-edit-form" onSubmit={handleSubmit} className="flex-grow p-6 overflow-y-auto space-y-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
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
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600">{t('firstName')} *</label>
                                <input required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600">{t('lastName')} *</label>
                                <input required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600">{t('gender')}</label>
                            <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-amber-500 outline-none">
                                <option value="">Select Gender</option><option value="male">{t('male')}</option><option value="female">{t('female')}</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600">{t('email')} *</label>
                            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                        </div>
                        {!editingStaff && (
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-600">{t('password')} *</label>
                            <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                          </div>
                        )}
                      </div>
                    )}
                    {activeTab === 'contact' && (
                       <div className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600">{t('phone')}</label>
                                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600">{t('city')}</label>
                                    <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600">{t('kebele')}</label>
                                    <input value={form.kebele} onChange={e => setForm({ ...form, kebele: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600">{t('country')}</label>
                                    <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-amber-500 outline-none"><option>Ethiopia</option></select>
                                </div>
                            </div>
                            <div className="p-4 border rounded-lg">
                               <p className="text-sm font-medium mb-3">{t('role')}</p>
                               <div className="grid grid-cols-3 gap-3">
                                  {allowedRoles.map(r => (
                                      <label key={r} className={`p-3 border rounded-lg text-center cursor-pointer transition-all ${form.role === r ? 'bg-amber-600 text-white shadow-md' : 'hover:border-amber-500 hover:bg-gray-50'}`}>
                                          <input type="radio" name="role" value={r} checked={form.role === r} onChange={e => setForm({ ...form, role: e.target.value })} className="sr-only" />
                                          <span className="capitalize font-medium text-sm">{t(r as any)}</span>
                                      </label>
                                  ))}
                                </div>
                            </div>
                            {(form.role === 'receptionist' || form.role === 'cashier') && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600">{t('shiftStart')} (e.g., 08:00)</label>
                                        <input value={form.shiftStart} onChange={e => setForm({ ...form, shiftStart: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600">{t('shiftEnd')} (e.g., 17:00)</label>
                                        <input value={form.shiftEnd} onChange={e => setForm({ ...form, shiftEnd: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                                    </div>
                                </div>
                            )}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600">{t('salaryAmount')} (ETB)</label>
                                <input type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                            </div>
                       </div>
                    )}
                    {activeTab === 'education' && (
                        <div className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600">{t('educationLevel')}</label>
                                <select value={form.educationLevel} onChange={e => setForm({ ...form, educationLevel: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white">
                                    <option value="">Select Level</option>
                                    <option value="9-12">{t('grade9_12')}</option>
                                    <option value="diploma">{t('diploma')}</option>
                                    <option value="degree">{t('degree')}</option>
                                    <option value="master">{t('master')}</option>
                                    <option value="phd">{t('phd')}</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600">{t('fieldOfStudy')}</label>
                                <input value={form.educationField} onChange={e => setForm({ ...form, educationField: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600">{t('institution')}</label>
                                <input value={form.educationInstitution} onChange={e => setForm({ ...form, educationInstitution: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                            </div>
                        </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </form>

              <div className="flex gap-3 p-6 border-t bg-gray-50/50 sticky bottom-0 rounded-b-xl">
                <button type="button" onClick={closeAndResetModal} className="flex-1 py-3 border rounded-lg hover:bg-gray-100 transition font-medium">{t('cancel')}</button>
                <button type="submit" form="add-edit-form" disabled={uploading} className="flex-1 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium disabled:opacity-50">
                  {uploading ? t('saving') : editingStaff ? t('updateStaff') : t('saveStaff')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
*/