'use client';
import { View } from 'react-native';

import { useState, useEffect, useMemo } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { Star, Tag, ShieldCheck, MessageSquareWarning, Search, X, ChevronLeft, ChevronRight, History, Eye, EyeOff, Calendar, MessageSquare, Crown } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import BackButton from '@/app/manager/ui/BackButton';
import { useLanguage } from '../../../context/LanguageContext'; // Import Hook

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

// --- HELPER FUNCTION ---
const getFullImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return '/default-avatar.png';
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${API_BASE_URL}${cleanPath}`;
};

const isToday = (someDate: Date) => {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear();
};

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

const FeedbackDetailModal = ({ feedback, onClose }: { feedback: Feedback | null; onClose: () => void }) => {
    const { t } = useLanguage(); // Use Translation Hook
    
    if (!feedback) return null;

    const { user, category, rating, message, target, createdAt, isAnonymous } = feedback;
    const userName = isAnonymous || !user ? t('anonymous') : `${user.firstName} ${user.lastName}`;
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
                                <img 
                                    src={userImage} 
                                    alt={userName} 
                                    className="w-16 h-16 rounded-full object-cover ring-4 ring-gray-200 dark:ring-gray-700"
                                    onError={(e) => (e.currentTarget.src = '/default-avatar.png')}
                                />
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{userName}</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                                        <Calendar size={14} /> {new Date(createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('rating')}</h3>
                            <div className="flex items-center space-x-2">
                                <RatingStars rating={rating} />
                                <span className="font-bold text-lg text-gray-700 dark:text-gray-200">{rating}.0</span>
                            </div>
                        </div>

                        <div className="mb-6">
                             <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <MessageSquare size={20} /> {t('feedbackMessage')}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg whitespace-pre-wrap leading-relaxed">
                                {message}
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 capitalize">
                            <Tag size={16} />
                            <strong>{t('category')}:</strong> <span>{category}</span>
                        </div>
                        <div className="flex items-center gap-2 capitalize">
                            <ShieldCheck size={16} />
                            <strong>{t('sentTo')}:</strong> <span>{target}</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const ViewFeedbackPage = () => {
    const { t } = useLanguage(); // Use Translation Hook

    const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [showHistory, setShowHistory] = useState(false);
    const [minTimePassed, setMinTimePassed] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMinTimePassed(true), 4500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const response = await api.get('/api/feedback');
                const sortedFeedback = response.data.data.sort((a: Feedback, b: Feedback) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setFeedbackList(sortedFeedback);
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Could not fetch feedback.');
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

    const paginatedHistory = historyFeedback.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(historyFeedback.length / itemsPerPage);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    
    const handleToggleHistory = () => {
        setShowHistory(!showHistory);
        setCurrentPage(1);
    };

    if (loading || !minTimePassed) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-amber-950 via-black to-amber-900 flex items-center justify-center overflow-hidden z-50">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15),transparent_70%)]" />
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-2xl ring-4 ring-amber-900/50">
                        <Crown className="text-white w-12 h-12" />
                    </div>
                    <h2 className="text-4xl font-black text-amber-400 tracking-widest mb-2">{t('feedbackCenter')}</h2>
                    <p className="text-amber-200/80 tracking-wide">{t('royalAttention')}</p>
                </motion.div>
            </div>
        );
    }

    const renderTable = (data: Feedback[], title: string) => (
        <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center gap-3">
                    {title === t('historyFeedback') && <History />}
                    {title}
                </h2>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('customer')}</th>
                                <th scope="col" className="px-6 py-3">{t('rating')}</th>
                                <th scope="col" className="px-6 py-3">{t('category')}</th>
                                <th scope="col" className="px-6 py-3">{t('comment')}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('date')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(fb => {
                                const userName = fb.isAnonymous || !fb.user ? t('anonymous') : `${fb.user.firstName} ${fb.user.lastName}`;
                                const userImage = fb.isAnonymous || !fb.user ? '/shield-avatar.png' : getFullImageUrl(fb.user.profileImage);
                                
                                return (
                                    <tr key={fb._id} onClick={() => setSelectedFeedback(fb)} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <img 
                                                    src={userImage} 
                                                    alt={userName} 
                                                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                                    onError={(e) => (e.currentTarget.src = '/default-avatar.png')}
                                                />
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
                <BackButton />
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t('customerFeedback')}</h1>
                    <div className="relative w-full md:w-80">
                        <Search className="w-5 h-5 text-gray-500 dark:text-gray-400 absolute inset-y-0 left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t('searchFeedback')}
                            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full pl-10 p-2.5 transition"
                        />
                    </div>
                </div>

                {feedbackList.length > 0 ? (
                    <>
                        {todayFeedback.length > 0 ? (
                             renderTable(todayFeedback, t('todaysFeedback'))
                        ) : (
                             <div className="text-center py-10 my-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('noFeedbackToday')}</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('checkBackLater')}</p>
                             </div>
                        )}
                       
                        {historyFeedback.length > 0 && (
                             <div className="my-8 text-center">
                                <button onClick={handleToggleHistory} className="inline-flex items-center gap-2 px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-transform transform hover:scale-105">
                                    {showHistory ? <EyeOff size={18}/> : <Eye size={18} />}
                                    {showHistory ? t('hideHistory') : t('viewHistory')}
                                </button>
                             </div>
                        )}

                        <AnimatePresence>
                            {showHistory && paginatedHistory.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {renderTable(paginatedHistory, t('historyFeedback'))}

                                    {totalPages > 1 && (
                                        <div className="flex justify-between items-center mt-6">
                                            <span className="text-sm text-gray-700 dark:text-gray-400">
                                                {t('page')} {currentPage} {t('of')} {totalPages}
                                            </span>
                                            <div className="inline-flex items-center -space-x-px">
                                                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 transition">
                                                    <ChevronLeft size={16} />
                                                </button>
                                                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 transition">
                                                    <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                ) : (
                    <div className="text-center py-20">
                        <MessageSquareWarning className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">{t('noFeedbackYet')}</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('whenCustomersSubmit')}</p>
                    </div>
                )}
            </div>

            <FeedbackDetailModal feedback={selectedFeedback} onClose={() => setSelectedFeedback(null)} />
        </div>
    );
};

export default ViewFeedbackPage;