'use client';
import { Button, Image } from 'react-native';

import { useState, useEffect } from 'react';


import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

import { NewsCard } from '../src/app/admin/upload-docs/page'; // Import the card we made aboveimport { NewsCard } from '../app/admin/news/page'; // Reusing the card!

import { BellRing, ChevronDown, ChevronUp, X, FileText, Video, Image as ImageIcon, Music } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

// --- ZOOM DETAIL MODAL COMPONENT ---
const NewsDetailModal = ({ news, onClose }: { news: any, onClose: () => void }) => {
  if (!news) return null;

  const getIcon = (type: string) => {
    if(type === 'video') return <Video size={20} />;
    if(type === 'audio') return <Music size={20} />;
    if(type === 'image') return <ImageIcon size={20} />;
    return <FileText size={20} />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full z-10 transition">
          <X size={24} />
        </button>

        {/* Header Image/Video if available */}
        {news.attachments && news.attachments.length > 0 && (
          <div className="w-full h-64 sm:h-80 bg-gray-100 relative">
            {news.attachments[0].type === 'image' ? (
              <img src={news.attachments[0].url} className="w-full h-full object-cover" alt="Cover" />
            ) : news.attachments[0].type === 'video' ? (
              <video src={news.attachments[0].url} className="w-full h-full object-contain bg-black" controls />
            ) : (
               <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <FileText size={64} />
               </div>
            )}
            <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-lg text-sm font-medium backdrop-blur-md">
              {new Date(news.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        )}

        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide ${
              news.category === 'urgent' ? 'bg-red-100 text-red-700' : 
              news.category === 'event' ? 'bg-purple-100 text-purple-700' : 
              news.category === 'promotion' ? 'bg-green-100 text-green-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {news.category}
            </span>
            <span className="text-gray-500 text-sm font-medium">
              Posted by {news.createdBy?.firstName || 'Admin'}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6 leading-tight">
            {news.title}
          </h2>

          <div className="prose prose-lg text-gray-600 whitespace-pre-wrap leading-relaxed mb-8">
            {news.content}
          </div>

          {/* All Attachments List */}
          {news.attachments && news.attachments.length > 0 && (
            <div className="border-t pt-6">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Attachments</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {news.attachments.map((att: any, i: number) => (
                  <a 
                    key={i} 
                    href={att.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition group"
                  >
                    <div className="p-2 bg-gray-100 group-hover:bg-white rounded-lg text-gray-600 group-hover:text-blue-600 transition">
                      {getIcon(att.type)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-gray-800 truncate">{att.originalName || `Attachment ${i+1}`}</p>
                      <p className="text-xs text-gray-500 uppercase">{att.type}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// --- MAIN NEWS FEED COMPONENT ---
export default function NewsFeed() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [selectedNews, setSelectedNews] = useState<any>(null); // State for zoom modal

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/news`, { withCredentials: true });
        setNews(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) return (
    <div className="flex justify-center py-10">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber-200 border-t-amber-600"></div>
    </div>
  );

  if (news.length === 0) return (
    <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
      <BellRing className="mx-auto text-gray-300 mb-3" size={40} />
      <p className="text-gray-500 font-bold">No announcements yet.</p>
    </div>
  );

  const displayedNews = showAll ? news : news.slice(0, 3);

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
            <BellRing size={20} />
          </div>
          <h2 className="text-xl font-black text-gray-800">Latest Updates</h2>
        </div>
        
        {news.length > 3 && (
          <button 
            onClick={() => setShowAll(!showAll)}
            className="text-sm font-bold text-amber-600 hover:text-amber-800 transition flex items-center gap-1"
          >
            {showAll ? (
              <>Less <ChevronUp size={16} /></>
            ) : (
              <>All ({news.length}) <ChevronDown size={16} /></>
            )}
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
        <AnimatePresence initial={false}>
          {displayedNews.map((item: any, i: number) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="h-full w-full cursor-pointer"
              onClick={() => setSelectedNews(item)} // CLICK TO OPEN MODAL
            >
              {/* Using pointer-events-none on children to let the parent div handle the click comfortably */}
              <div className="pointer-events-none h-full">
                 <NewsCard news={item} isAdmin={false} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {news.length > 3 && !showAll && (
        <div className="text-center pt-4">
           <button 
            onClick={() => setShowAll(true)}
            className="w-full py-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl shadow-sm hover:bg-gray-100 font-bold text-sm transition"
          >
            Load More Updates
          </button>
        </div>
      )}

      {/* --- MODAL RENDER --- */}
      <AnimatePresence>
        {selectedNews && (
          <NewsDetailModal news={selectedNews} onClose={() => setSelectedNews(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}