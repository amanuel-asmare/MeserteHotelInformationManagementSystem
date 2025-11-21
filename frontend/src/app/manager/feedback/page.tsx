import React from 'react'
import ViewFeedbackPage from '@/app/viewFeedback/feedbackList'
function ManagerFeedbackPage() {
  return (
   <ViewFeedbackPage/>
  )
}

export default ManagerFeedbackPage;
/*'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Tag, ShieldCheck, MessageSquareWarning, Search, X, ChevronLeft, ChevronRight, User, Calendar, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import BackButton from '../ui/BackButton';

// --- INTERFACES ---
interface User {
    firstName: string;
    lastName: string;
    profileImage: string;
}

interface Feedback {
    _id: string;
    user: User | null;
    category: string;
    rating: number;
    message: string;
    target: string;
    createdAt: string;
    isAnonymous: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// --- HELPER FUNCTIONS ---
const getFullImageUrl = (imagePath: string) => {
    if (!imagePath) return '/default-avatar.png';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL}${imagePath}`;
};

const isToday = (someDate: Date) => {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear();
};


// --- RATING STARS COMPONENT ---
const RatingStars = ({ rating, className = '' }: { rating: number; className?: string }) => (
    <div className={`flex items-center ${className}`}>
        {[1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                size={16}
                className={`transition-colors duration-200 ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
            />
        ))}
    </div>
);


// --- FEEDBACK DETAIL MODAL COMPONENT ---
const FeedbackDetailModal = ({ feedback, onClose }: { feedback: Feedback | null; onClose: () => void }) => {
    if (!feedback) return null;

    const { user, category, rating, message, target, createdAt, isAnonymous } = feedback;
    const userName = isAnonymous || !user ? 'Anonymous' : `${user.firstName} ${user.lastName}`;
    const userImage = isAnonymous || !user ? '/shield-avatar.png' : getFullImageUrl(user.profileImage);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-8">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                <Image src={userImage} alt={userName} width={64} height={64} className="rounded-full object-cover ring-4 ring-gray-200 dark:ring-gray-700" />
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{userName}</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                                        <Calendar size={14} /> {new Date(createdAt).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Rating</h3>
                            <div className="flex items-center space-x-2">
                                <RatingStars rating={rating} />
                                <span className="font-bold text-lg text-gray-700 dark:text-gray-200">{rating}.0</span>
                            </div>
                        </div>

                        <div className="mb-6">
                             <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <MessageSquare size={20} /> Feedback Message
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg whitespace-pre-wrap leading-relaxed">
                                {message}
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 capitalize">
                            <Tag size={16} />
                            <strong>Category:</strong> <span>{category}</span>
                        </div>
                        <div className="flex items-center gap-2 capitalize">
                            <ShieldCheck size={16} />
                            <strong>Sent To:</strong> <span>{target}</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// --- MAIN FEEDBACK PAGE COMPONENT ---
const ViewFeedbackPage = () => {
    const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const response = await api.get('/api/feedback');
                setFeedbackList(response.data.data);
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || 'Could not fetch feedback.';
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedback();
    }, []);

    const { todayFeedback, historyFeedback } = useMemo(() => {
        const filtered = feedbackList.filter(fb => {
            const userName = fb.isAnonymous || !fb.user ? 'anonymous' : `${fb.user.firstName} ${fb.user.lastName}`;
            return (
                userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                fb.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                fb.message.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });

        return {
            todayFeedback: filtered.filter(fb => isToday(new Date(fb.createdAt))),
            historyFeedback: filtered.filter(fb => !isToday(new Date(fb.createdAt))),
        };
    }, [feedbackList, searchTerm]);


    // Pagination Logic
    const paginatedHistory = historyFeedback.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(historyFeedback.length / itemsPerPage);
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-lg font-semibold text-gray-600 dark:text-gray-300">Loading feedback...</div>
            </div>
        );
    }

    const renderTable = (data: Feedback[], title: string) => (
        <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">{title}</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Customer</th>
                                <th scope="col" className="px-6 py-3">Rating</th>
                                <th scope="col" className="px-6 py-3">Category</th>
                                <th scope="col" className="px-6 py-3 truncate">Comment</th>
                                <th scope="col" className="px-6 py-3 text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(fb => {
                                const userName = fb.isAnonymous || !fb.user ? 'Anonymous' : `${fb.user.firstName} ${fb.user.lastName}`;
                                const userImage = fb.isAnonymous || !fb.user ? '/shield-avatar.png' : getFullImageUrl(fb.user.profileImage);
                                return (
                                    <tr key={fb._id} onClick={() => setSelectedFeedback(fb)} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <Image src={userImage} alt={userName} width={40} height={40} className="rounded-full object-cover" />
                                                {userName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><RatingStars rating={fb.rating} /></td>
                                        <td className="px-6 py-4"><span className="bg-amber-100 text-amber-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-amber-900 dark:text-amber-300 capitalize">{fb.category}</span></td>
                                        <td className="px-6 py-4 max-w-sm truncate">{fb.message}</td>
                                        <td className="px-6 py-4 text-right">{new Date(fb.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
    
            <div className="max-w-7xl mx-auto">
<BackButton/>
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Customer Feedback</h1>
                    <div className="relative w-full md:w-80">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search feedback..."
                            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full pl-10 p-2.5"
                        />
                    </div>
                </div>

                {feedbackList.length > 0 ? (
                    <>
                        {todayFeedback.length > 0 && renderTable(todayFeedback, "Today's Feedback")}
                        {paginatedHistory.length > 0 && renderTable(paginatedHistory, "History")}
                        
                        {/* Pagination Controls /}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center mt-6">
                                <span className="text-sm text-gray-700 dark:text-gray-400">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <div className="inline-flex items-center -space-x-px">
                                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50">
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50">
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20">
                        <MessageSquareWarning className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No Feedback Yet</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">When customers submit feedback, it will appear here.</p>
                    </div>
                )}
            </div>
            
            <FeedbackDetailModal feedback={selectedFeedback} onClose={() => setSelectedFeedback(null)} />
        </div>
    );
};

export default ViewFeedbackPage;*/