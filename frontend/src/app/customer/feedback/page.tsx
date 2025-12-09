'use client';
import { Button } from 'react-native';

import { useState, useEffect } from 'react';

import { motion } from 'framer-motion';
import { Star, Send, Crown } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';
import { useLanguage } from '../../../../context/LanguageContext'; // Import Hook

const FeedbackPage = () => {
  const { t } = useLanguage(); // Use Translation Hook
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState('general');
  const [target, setTarget] = useState('all');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(true);

  // MINIMUM 4.5 SECONDS OF PURE LUXURY
  useEffect(() => {
    const timer = setTimeout(() => setShowLoading(false), 4500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error(t('selectStarRating'));
      return;
    }
    if (!message.trim()) {
      toast.error(t('writeMessage'));
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

      toast.success(
        t('feedbackReceived'),
        { duration: 6000, icon: 'Crown' }
      );

      // Reset form
      setRating(0);
      setCategory('general');
      setTarget('all');
      setMessage('');
      setIsAnonymous(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t('failedSubmitFeedback');
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ROYAL LOADING SCREEN — SAME AS DASHBOARD & BOOKING
  if (showLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-amber-950 via-black to-amber-900 flex items-center justify-center overflow-hidden">
        {/* ... (Existing Animation Code Unchanged) ... */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-amber-950/50 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15),transparent_70%)]" />

          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -100, 0], x: [0, Math.sin(i) * 100, 0], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 8 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
              className="absolute w-96 h-96 bg-gradient-to-r from-yellow-400/20 to-orange-600/20 rounded-full blur-3xl"
              style={{ top: `${20 + i * 10}%`, left: i % 2 === 0 ? "-20%" : "80%" }}
            />
          ))}
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5, ease: "easeOut" }} className="relative z-10 text-center px-8">
          {/* 3D Golden Logo */}
          <motion.div
            animate={{ rotateY: [0, 360], scale: [1, 1.15, 1] }}
            transition={{ rotateY: { duration: 20, repeat: Infinity, ease: "linear" }, scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }}}
            className="relative mx-auto w-64 h-64 mb-12 perspective-1000"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-orange-600 shadow-2xl ring-8 ring-yellow-400/30" />
            <div className="absolute inset-8 rounded-full bg-gradient-to-tr from-amber-950 to-black flex items-center justify-center shadow-inner">
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="text-8xl font-black text-yellow-400 tracking-widest drop-shadow-2xl"
                style={{ textShadow: "0 0 60px rgba(251,191,36,0.9)" }}
              >
                MH
              </motion.div>
            </div>
            <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -top-10 left-1/2 -translate-x-1/2 text-yellow-300">
              <Crown size={60} />
            </motion.div>
          </motion.div>

          {/* Letter-by-letter MESERET */}
          <div className="flex justify-center gap-3 mb-6">
            {["M","E","S","E","R","E","T"].map((letter, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 100, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 1 + i * 0.15, duration: 0.8, ease: "easeOut" }}
                className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500"
                style={{ textShadow: "0 0 80px rgba(251,191,36,0.9), 0 10px 30px rgba(0,0,0,0.5)", fontFamily: "'Playfair Display', serif" }}
              >
                {letter}
              </motion.span>
            ))}
          </div>

          <motion.h2 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.5, duration: 1.2 }} className="text-5xl md:text-7xl font-bold text-amber-300 tracking-wider mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            {t('luxuryHotel')}
          </motion.h2>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.2, duration: 1.5 }} className="text-2xl text-amber-100 font-light tracking-widest">
            {t('yourVoiceMatters')}
          </motion.p>

          <div className="mt-20 w-96 mx-auto">
            <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-amber-600/50 backdrop-blur-xl">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 shadow-2xl relative overflow-hidden"
              >
                <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              </motion.div>
            </div>

            <motion.div animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 3, repeat: Infinity }} className="text-center mt-8 text-2xl font-medium text-amber-200 tracking-wider">
              {t('preparingFeedback')}
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-black p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-3xl w-full mx-auto"
      >
        {/* Luxury Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block"
          >
            <Crown className="w-20 h-20 text-amber-600 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 mb-4">
            {t('yourFeedbackMatters')}
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 font-light tracking-wide">
            {t('helpUsServeBetter')}
          </p>
        </motion.div>

        {/* Feedback Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-200 dark:border-amber-800 p-8 md:p-12"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Star Rating */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 dark:text-white mb-4">
                {t('howRateStay')}
              </label>
              <div className="flex items-center justify-center gap-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    whileHover={{ scale: 1.3, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none"
                  >
                    <Star
                      size={56}
                      className={`transition-all duration-300 ${
                        (hoverRating || rating) >= star
                          ? 'text-yellow-400 fill-yellow-400 drop-shadow-lg'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
              <p className="text-center mt-4 text-gray-600 dark:text-gray-400">
                {rating === 5 && t('outstanding')}
                {rating === 4 && t('greatThankYou')}
                {rating === 3 && t('goodCanDoBetter')}
                {rating === 2 && t('sorryTellUsMore')}
                {rating === 1 && t('veryDisappointed')}
                {rating === 0 && t('tapStars')}
              </p>
            </div>

            {/* Category & Target */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t('feedbackCategory')}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-5 py-4 bg-amber-50 dark:bg-gray-700 border border-amber-200 dark:border-amber-800 rounded-xl focus:ring-4 focus:ring-amber-300 dark:focus:ring-amber-700 transition-all"
                >
                  <option value="general">{t('generalExperience')}</option>
                  <option value="room">{t('roomFacilities')}</option>
                  <option value="food">{t('foodDining')}</option>
                  <option value="service">{t('staffService')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t('sendTo')}</label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full px-5 py-4 bg-amber-50 dark:bg-gray-700 border border-amber-200 dark:border-amber-800 rounded-xl focus:ring-4 focus:ring-amber-300 dark:focus:ring-amber-700 transition-all"
                >
                  <option value="all">{t('allDepartments')}</option>
                  <option value="admin">{t('hotelManagement')}</option>
                  <option value="manager">{t('generalManager')}</option>
                  <option value="receptionist">{t('frontDesk')}</option>
                  <option value="cashier">{t('restaurantStaff')}</option>
                </select>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t('yourMessage')}</label>
              <textarea
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('shareThoughts')}
                className="w-full px-5 py-4 bg-amber-50 dark:bg-gray-700 border border-amber-200 dark:border-amber-800 rounded-xl focus:ring-4 focus:ring-amber-300 dark:focus:ring-amber-700 transition-all resize-none"
              />
            </div>

            {/* Anonymous */}
            <div className="flex items-center justify-center">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-6 h-6 text-amber-600 rounded focus:ring-amber-500"
                />
                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {t('submitAnonymously')}
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-6 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl font-bold text-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4"
            >
              {isLoading ? (
                <>{t('submitting')}</>
              ) : (
                <>
                  <Send size={28} />
                  {t('sendFeedback')}
                </>
              )}
            </motion.button>
          </form>

          {/* Footer Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center mt-10"
          >
            <p className="text-gray-600 dark:text-gray-400 italic">
              {t('feedbackQuote')}
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FeedbackPage;/*// src/app/feedback/page.tsx
'use client';
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

export default FeedbackPage;*/