'use client';

import { motion, Variants } from 'framer-motion';
import { X, Mail, Phone, MapPin } from 'lucide-react';

// 1. Define Interfaces
interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    profileImage?: string;
    phone?: string;
    address?: {
        city?: string;
    };
}

interface UserProfileModalProps {
    user: User | null;
    onClose: () => void;
}

const UserProfileModal = ({ user, onClose }: UserProfileModalProps) => {
    if (!user) return null;
    
    // Stop propagation to prevent closing when clicking inside the modal content
    const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

    // Explicitly type variants to fix "type: string" inference error
    const backdropVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    // Explicitly type variants to fix "type: string" inference error
    const modalVariants: Variants = {
        hidden: { opacity: 0, scale: 0.8, y: "-50%" },
        visible: { 
            opacity: 1, 
            scale: 1, 
            y: 0, 
            transition: { type: "spring", stiffness: 300, damping: 30 } 
        },
        exit: { opacity: 0, scale: 0.8, y: "50%" },
    };

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
            onClick={onClose}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
                onClick={stopPropagation}
                variants={modalVariants}
            >
                <div className="relative">
                    <div className="h-28 bg-gradient-to-r from-amber-400 to-orange-500" />
                    <img
                        src={user.profileImage || '/default-avatar.png'}
                        alt={user.firstName}
                        className="absolute top-16 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                        onError={(e) => (e.currentTarget.src = '/default-avatar.png')}
                    />
                    <button onClick={onClose} className="absolute top-3 right-3 p-1 bg-black/20 text-white rounded-full hover:bg-black/40">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="pt-20 pb-8 px-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                    </h2>
                    <p className="text-amber-600 dark:text-amber-400 font-semibold capitalize mt-1">
                        {user.role}
                    </p>
                    
                    <div className="mt-6 text-left space-y-4 text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-4">
                            <Mail size={18} className="text-gray-400" />
                            <a href={`mailto:${user.email}`} className="hover:underline truncate">{user.email}</a>
                        </div>
                        <div className="flex items-center gap-4">
                            <Phone size={18} className="text-gray-400" />
                            <span>{user.phone || 'Not available'}</span>
                        </div>
                         <div className="flex items-center gap-4">
                            <MapPin size={18} className="text-gray-400" />
                            <span>{user.address?.city || 'City not specified'}</span>
                        </div>
                    </div>

                    <button className="mt-8 w-full py-3 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-transform transform hover:scale-105">
                        Send Message
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default UserProfileModal;/*'use client';

import { motion } from 'framer-motion';
import { X, Mail, Phone, MapPin, User as UserIcon } from 'lucide-react';

const UserProfileModal = ({ user, onClose }) => {
    if (!user) return null;
    
    // Stop propagation to prevent closing when clicking inside the modal content
    const stopPropagation = (e) => e.stopPropagation();

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.8, y: "-50%" },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
        exit: { opacity: 0, scale: 0.8, y: "50%" },
    };

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
            onClick={onClose}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
                onClick={stopPropagation}
                variants={modalVariants}
            >
                <div className="relative">
                    <div className="h-28 bg-gradient-to-r from-amber-400 to-orange-500" />
                    <img
                        src={user.profileImage || '/default-avatar.png'}
                        alt={user.firstName}
                        className="absolute top-16 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                    />
                    <button onClick={onClose} className="absolute top-3 right-3 p-1 bg-black/20 text-white rounded-full hover:bg-black/40">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="pt-20 pb-8 px-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                    </h2>
                    <p className="text-amber-600 dark:text-amber-400 font-semibold capitalize mt-1">
                        {user.role}
                    </p>
                    
                    <div className="mt-6 text-left space-y-4 text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-4">
                            <Mail size={18} className="text-gray-400" />
                            <a href={`mailto:${user.email}`} className="hover:underline">{user.email}</a>
                        </div>
                        <div className="flex items-center gap-4">
                            <Phone size={18} className="text-gray-400" />
                            <span>{user.phone || 'Not available'}</span>
                        </div>
                         <div className="flex items-center gap-4">
                            <MapPin size={18} className="text-gray-400" />
                            <span>{user.address?.city || 'City not specified'}</span>
                        </div>
                    </div>

                    <button className="mt-8 w-full py-3 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-transform transform hover:scale-105">
                        Send Message
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default UserProfileModal;*/