// src/app/feedback/page.tsx
'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';


const FeedbackPage = () => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [category, setCategory] = useState('general');
    const [target, setTarget] = useState('all');
    const [message, setMessage] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Please select a star rating.');
            return;
        }
        if (!message.trim()) {
            toast.error('Please write a message for your feedback.');
            return;
        }
        setIsLoading(true);
        try {
            await api.post('/api/feedback', {
                rating,
                category,
                target,
                message,
                isAnonymous,
            });
console.log('success full feedback give')
            toast.success(
                "Feedback received! Thank you for helping us improve.",
                { duration: 5000 }
            );

            // Reset form
            setRating(0);
            setCategory('general');
            setTarget('all');
            setMessage('');
            setIsAnonymous(false);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to submit feedback. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl w-full mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
            >
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Share Your Feedback</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">We value your opinion and strive to improve our services.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">How would you rate your experience?</label>
                        <div className="flex items-center space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <motion.div
                                    key={star}
                                    whileHover={{ scale: 1.2, rotate: 10 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Star
                                        className={`cursor-pointer transition-colors duration-200 ${
                                            (hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-500'
                                        }`}
                                        size={32}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Feedback Category</label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        >
                            <option value="general">General</option>
                            <option value="room">Room</option>
                            <option value="food">Food</option>
                            <option value="service">Service</option>
                        </select>
                    </div>

                     <div>
                        <label htmlFor="target" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Send To</label>
                        <select
                            id="target"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        >
                            <option value="all">All Staff</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="receptionist">Receptionist</option>
                            <option value="cashier">Cashier</option>
                        </select>
                    </div>


                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Your Message</label>
                        <textarea
                            id="message"
                            rows={4}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            placeholder="Tell us more about your experience..."
                        ></textarea>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="anonymous"
                            type="checkbox"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                            className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 dark:focus:ring-amber-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor="anonymous" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Submit Anonymously</label>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center gap-2 text-white bg-amber-600 hover:bg-amber-700 focus:ring-4 focus:outline-none focus:ring-amber-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-amber-600 dark:hover:bg-amber-700 dark:focus:ring-amber-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Submitting...' : 'Send Feedback'}
                        <Send size={16} />
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default FeedbackPage;