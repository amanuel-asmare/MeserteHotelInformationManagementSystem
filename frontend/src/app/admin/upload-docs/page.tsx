'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, FileText, Video, Image as ImageIcon, Music, 
  Send, Trash2, Megaphone, CheckCircle, X, Radio, Activity  
} from 'lucide-react';
import axios from 'axios';
import ReactCanvasConfetti from 'react-canvas-confetti';
import { useLanguage } from '../../../../context/LanguageContext'; // Import Hook

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

// --- SUCCESS MODAL COMPONENT ---
const SuccessModal = ({ message, onClose }: { message: string, onClose: () => void }) => {
  const { t } = useLanguage();
  const refAnimationInstance = useRef<any>(null);

  const getInstance = (instance: any) => {
    refAnimationInstance.current = instance;
  };

  const makeShot = (particleRatio: number, opts: any) => {
    if (refAnimationInstance.current) {
      refAnimationInstance.current({
        ...opts,
        origin: { y: 0.7 },
        particleCount: Math.floor(200 * particleRatio),
      });
    }
  };

  useEffect(() => {
    const fire = () => {
      makeShot(0.25, { spread: 26, startVelocity: 55 });
      makeShot(0.2, { spread: 60 });
      makeShot(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      makeShot(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      makeShot(0.1, { spread: 120, startVelocity: 45 });
    };
    fire();
    const interval = setInterval(fire, 2000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <ReactCanvasConfetti
        refConfetti={getInstance}
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          zIndex: 60,
        }}
      />
      
      <motion.div
        initial={{ scale: 0.5, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.5, y: 100 }}
        className="bg-white rounded-3xl p-10 shadow-2xl text-center max-w-sm w-full border-4 border-amber-400 relative z-50"
      >
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="text-green-600 w-12 h-12" />
        </motion.div>
        
        <h2 className="text-3xl font-black text-gray-800 mb-2">{t('success')}</h2>
        <p className="text-gray-600 mb-8 text-lg">{message}</p>
        
        <button 
          onClick={onClose}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition transform"
        >
          {t('continue')}
        </button>
      </motion.div>
    </motion.div>
  );
};

export default function AdminNewsPage() {
  const { t, language } = useLanguage(); // Use Hook

  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
  const [loading, setLoading] = useState(true);
  const [newsList, setNewsList] = useState<any[]>([]);
  
  // --- Success State ---
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('promotion'); // Default changed to promotion
  const [target, setTarget] = useState('all');
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/news`, { withCredentials: true });
      setNewsList(res.data);
    } catch (err) {
      console.error(err);
    } finally {
        if(newsList.length > 0) setLoading(false); 
        setTimeout(() => setLoading(false), 2000); 
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('category', category);
    formData.append('targetAudience', target);
    files.forEach(f => formData.append('files', f));

    try {
      await axios.post(`${API_BASE}/api/news`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      
      setShowSuccess(true);
      
      // Reset Form
      setTitle(''); 
      setContent(''); 
      setFiles([]);
      fetchNews();
      
    } catch (err: any) {
      alert('Failed to post news');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setActiveTab('history'); 
  };

  const handleDelete = async (id: string) => {
    if(!confirm(t('deletePostConfirm'))) return;
    try {
      await axios.delete(`${API_BASE}/api/news/${id}`, { withCredentials: true });
      setNewsList(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      alert('Failed delete');
    }
  };

  if (loading && newsList.length === 0) { 
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-orange-900 via-amber-900 to-black flex items-center justify-center overflow-hidden z-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15),transparent_70%)]" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="relative z-10 text-center"
        >
            {/* Pulsing Radio Icon */}
            <div className="relative w-32 h-32 mx-auto mb-8 flex items-center justify-center">
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-amber-500/30 rounded-full"
                />
                <motion.div 
                  animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="absolute inset-0 bg-orange-500/20 rounded-full"
                />
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full flex items-center justify-center shadow-2xl relative z-10">
                   <Radio className="text-white w-10 h-10 animate-pulse" />
                </div>
            </div>

            <h2 className="text-4xl font-black text-white tracking-widest mb-2">{t('newsCenter').toUpperCase()}</h2>
            <div className="flex items-center justify-center gap-2 text-amber-400 font-mono text-sm uppercase tracking-widest">
               <Activity size={16} className="animate-bounce" />
               <span>{t('establishingUplink')}</span>
            </div>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="space-y-8 p-4 relative">
      
      {/* --- Success Overlay --- */}
      <AnimatePresence>
        {showSuccess && (
          <SuccessModal 
            message={t('announcementBroadcasted')} 
            onClose={handleSuccessClose} 
          />
        )}
      </AnimatePresence>

      {/* Royal Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
              <Megaphone className="animate-bounce" size={36} /> {t('newsCenter')}
            </h1>
            <p className="text-amber-100 text-lg">{t('broadcastUpdates')}</p>
          </div>
          <div className="bg-white/10 p-1 rounded-xl backdrop-blur-md flex gap-1">
            <button 
              onClick={() => setActiveTab('compose')}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'compose' ? 'bg-white text-amber-700 shadow-lg' : 'text-white hover:bg-white/10'}`}
            >
              {t('compose')}
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'history' ? 'bg-white text-amber-700 shadow-lg' : 'text-white hover:bg-white/10'}`}
            >
              {t('history')}
            </button>
          </div>
        </div>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'compose' ? (
          <motion.div 
            key="compose"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
              {/* Headline & Target Audience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">{t('headline')}</label>
                  <input 
                    required 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-amber-500 focus:bg-white focus:ring-0 transition text-lg font-semibold"
                    placeholder={t('enterHeadline')} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">{t('targetAudience')}</label>
                  <div className="flex bg-gray-100 p-1 rounded-2xl">
                    {['all', 'staff', 'customer'].map(tr => (
                      <button
                        type="button"
                        key={tr}
                        onClick={() => setTarget(tr)}
                        className={`flex-1 py-3 rounded-xl font-bold capitalize transition-all ${target === tr ? 'bg-white text-amber-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        {t(tr as any)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Category (Removed Announcement) */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">{t('category')}</label>
                <div className="flex flex-wrap gap-3">
                  {['promotion', 'event', 'urgent'].map(c => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`px-6 py-2 rounded-full font-bold capitalize border-2 transition-all ${
                        category === c 
                        ? 'border-amber-500 bg-amber-50 text-amber-700' 
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {t(c as any)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">{t('content')}</label>
                <textarea 
                  required 
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={6}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-amber-500 focus:bg-white focus:ring-0 transition resize-none text-base"
                  placeholder={t('whatsHappening')} 
                />
              </div>

              {/* Upload Zone */}
              <div className="relative group">
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-3 border-dashed border-gray-200 rounded-3xl p-10 text-center group-hover:border-amber-400 group-hover:bg-amber-50 transition-all duration-300">
                  <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
                    <UploadCloud size={32} />
                  </div>
                  <p className="text-gray-900 font-bold text-lg">{t('clickToUploadAttachments')}</p>
                  <p className="text-gray-500 text-sm mt-1">{t('supportsMedia')}</p>
                  
                  {files.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2 justify-center">
                      {files.map((f, i) => (
                        <div key={i} className="bg-white border border-gray-200 px-3 py-1 rounded-lg shadow-sm text-xs font-medium text-gray-700 flex items-center gap-2">
                          <CheckCircle size={12} className="text-green-500" /> {f.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button 
                disabled={loading}
                type="submit"
                className="w-full py-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? t('broadcasting') : <><Send size={24} /> {t('publishAnnouncement')}</>}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            key="history"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {newsList.map((news) => (
              <NewsCard key={news._id} news={news} isAdmin={true} onDelete={() => handleDelete(news._id)} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Reusable News Card
export const NewsCard = ({ news, isAdmin, onDelete }: any) => {
  const { t } = useLanguage();

  const getIcon = (type: string) => {
    if(type === 'video') return <Video size={16} />;
    if(type === 'audio') return <Music size={16} />;
    if(type === 'image') return <ImageIcon size={16} />;
    return <FileText size={16} />;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col h-full group">
      {/* Media Preview */}
      {news.attachments.length > 0 && (
        <div className="h-56 bg-gray-100 overflow-hidden relative">
          {news.attachments[0].type === 'image' ? (
            <img src={news.attachments[0].url} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" alt="attachment" />
          ) : news.attachments[0].type === 'video' ? (
            <video src={news.attachments[0].url} className="w-full h-full object-cover" controls />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50">
              <FileText size={48} className="mb-2 opacity-50" />
              <span className="text-xs font-bold uppercase tracking-widest">{t('document')}</span>
            </div>
          )}
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg text-xs font-bold">
            {news.attachments.length} {news.attachments.length > 1 ? t('attachments') : t('attachment')}
          </div>
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${
            news.category === 'urgent' ? 'bg-red-100 text-red-600' : 
            news.category === 'event' ? 'bg-purple-100 text-purple-600' : 
            news.category === 'promotion' ? 'bg-green-100 text-green-600' :
            'bg-blue-100 text-blue-600'
          }`}>
            {t(news.category as any)}
          </span>
          <span className="text-xs text-gray-400 font-bold">
            {new Date(news.createdAt).toLocaleDateString()}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight line-clamp-2">{news.title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1 line-clamp-4">{news.content}</p>

        {/* Attachments List */}
        {news.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {news.attachments.map((att: any, i: number) => (
              <a 
                key={i} 
                href={att.url} 
                target="_blank"
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition"
              >
                {getIcon(att.type)} {t('view')}
              </a>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-gray-100 flex justify-between items-center mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs font-black text-gray-600">
              {news.createdBy?.firstName?.[0] || 'A'}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">{news.createdBy?.firstName || 'Admin'}</p>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{t(news.targetAudience as any)} {t('only')}</p>
            </div>
          </div>
          {isAdmin && (
            <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition">
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};/*'use client';
import { View, Image } from 'react-native';

import { useState, useEffect, useRef } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, FileText, Video, Image as ImageIcon, Music, 
  Send, Trash2, Megaphone, CheckCircle, X,Radio, Activity  
} from 'lucide-react';
import axios from 'axios';
import ReactCanvasConfetti from 'react-canvas-confetti';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

// --- SUCCESS MODAL COMPONENT ---
const SuccessModal = ({ message, onClose }: { message: string, onClose: () => void }) => {
  const refAnimationInstance = useRef<any>(null);

  const getInstance = (instance: any) => {
    refAnimationInstance.current = instance;
  };

  const makeShot = (particleRatio: number, opts: any) => {
    if (refAnimationInstance.current) {
      refAnimationInstance.current({
        ...opts,
        origin: { y: 0.7 },
        particleCount: Math.floor(200 * particleRatio),
      });
    }
  };

  useEffect(() => {
    const fire = () => {
      makeShot(0.25, { spread: 26, startVelocity: 55 });
      makeShot(0.2, { spread: 60 });
      makeShot(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      makeShot(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      makeShot(0.1, { spread: 120, startVelocity: 45 });
    };
    fire();
    const interval = setInterval(fire, 2000); // Repeat fireworks
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <ReactCanvasConfetti
        refConfetti={getInstance}
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          zIndex: 60,
        }}
      />
      
      <motion.div
        initial={{ scale: 0.5, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.5, y: 100 }}
        className="bg-white rounded-3xl p-10 shadow-2xl text-center max-w-sm w-full border-4 border-amber-400 relative z-50"
      >
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="text-green-600 w-12 h-12" />
        </motion.div>
        
        <h2 className="text-3xl font-black text-gray-800 mb-2">Success!</h2>
        <p className="text-gray-600 mb-8 text-lg">{message}</p>
        
        <button 
          onClick={onClose}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition transform"
        >
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
};

export default function AdminNewsPage() {
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
  const [loading, setLoading] = useState(true);
  const [newsList, setNewsList] = useState<any[]>([]);
  
  // --- Success State ---
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('announcement');
  const [target, setTarget] = useState('all');
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/news`, { withCredentials: true });
      setNewsList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('category', category);
    formData.append('targetAudience', target);
    files.forEach(f => formData.append('files', f));

    try {
      await axios.post(`${API_BASE}/api/news`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      
      // --- SHOW SUCCESS MODAL INSTEAD OF ALERT ---
      setShowSuccess(true);
      
      // Reset Form
      setTitle(''); 
      setContent(''); 
      setFiles([]);
      fetchNews();
      
      // Don't change tab immediately, let them enjoy the success screen
    } catch (err: any) {
      alert('Failed to post news');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setActiveTab('history'); // Move to history ONLY after clicking continue
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this news post?")) return;
    try {
      await axios.delete(`${API_BASE}/api/news/${id}`, { withCredentials: true });
      setNewsList(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      alert('Failed delete');
    }
  };
if (loading && newsList.length === 0) { // Show only on initial load
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-orange-900 via-amber-900 to-black flex items-center justify-center overflow-hidden z-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15),transparent_70%)]" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="relative z-10 text-center"
        >
         
            <div className="relative w-32 h-32 mx-auto mb-8 flex items-center justify-center">
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-amber-500/30 rounded-full"
                />
                <motion.div 
                  animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="absolute inset-0 bg-orange-500/20 rounded-full"
                />
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full flex items-center justify-center shadow-2xl relative z-10">
                   <Radio className="text-white w-10 h-10 animate-pulse" />
                </div>
            </div>

            <h2 className="text-4xl font-black text-white tracking-widest mb-2">NEWS CENTER</h2>
            <div className="flex items-center justify-center gap-2 text-amber-400 font-mono text-sm uppercase tracking-widest">
               <Activity size={16} className="animate-bounce" />
               <span>Establishing Uplink...</span>
            </div>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="space-y-8 p-4 relative">
      
  
      <AnimatePresence>
        {showSuccess && (
          <SuccessModal 
            message="Your announcement has been broadcasted successfully!" 
            onClose={handleSuccessClose} 
          />
        )}
      </AnimatePresence>

    
      <div className="bg-gradient-to-r from-amber-600 to-orange-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
              <Megaphone className="animate-bounce" size={36} /> News Center
            </h1>
            <p className="text-amber-100 text-lg">Broadcast updates to your hotel empire.</p>
          </div>
          <div className="bg-white/10 p-1 rounded-xl backdrop-blur-md flex gap-1">
            <button 
              onClick={() => setActiveTab('compose')}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'compose' ? 'bg-white text-amber-700 shadow-lg' : 'text-white hover:bg-white/10'}`}
            >
              Compose
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'history' ? 'bg-white text-amber-700 shadow-lg' : 'text-white hover:bg-white/10'}`}
            >
              History
            </button>
          </div>
        </div>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'compose' ? (
          <motion.div 
            key="compose"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
             
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Headline</label>
                  <input 
                    required 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-amber-500 focus:bg-white focus:ring-0 transition text-lg font-semibold"
                    placeholder="Enter catchy headline..." 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Target Audience</label>
                  <div className="flex bg-gray-100 p-1 rounded-2xl">
                    {['all', 'staff', 'customer'].map(t => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setTarget(t)}
                        className={`flex-1 py-3 rounded-xl font-bold capitalize transition-all ${target === t ? 'bg-white text-amber-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

           
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Category</label>
                <div className="flex flex-wrap gap-3">
                  {['announcement', 'event', 'promotion', 'urgent'].map(c => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`px-6 py-2 rounded-full font-bold capitalize border-2 transition-all ${
                        category === c 
                        ? 'border-amber-500 bg-amber-50 text-amber-700' 
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

            
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Content</label>
                <textarea 
                  required 
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={6}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-amber-500 focus:bg-white focus:ring-0 transition resize-none text-base"
                  placeholder="What's happening?" 
                />
              </div>

          
              <div className="relative group">
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-3 border-dashed border-gray-200 rounded-3xl p-10 text-center group-hover:border-amber-400 group-hover:bg-amber-50 transition-all duration-300">
                  <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
                    <UploadCloud size={32} />
                  </div>
                  <p className="text-gray-900 font-bold text-lg">Click to Upload Attachments</p>
                  <p className="text-gray-500 text-sm mt-1">Supports Images, Video, Audio & Documents</p>
                  
                  {files.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2 justify-center">
                      {files.map((f, i) => (
                        <div key={i} className="bg-white border border-gray-200 px-3 py-1 rounded-lg shadow-sm text-xs font-medium text-gray-700 flex items-center gap-2">
                          <CheckCircle size={12} className="text-green-500" /> {f.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button 
                disabled={loading}
                type="submit"
                className="w-full py-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Broadcasting...' : <><Send size={24} /> Publish Announcement</>}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            key="history"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {newsList.map((news) => (
              <NewsCard key={news._id} news={news} isAdmin={true} onDelete={() => handleDelete(news._id)} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Reusable News Card
export const NewsCard = ({ news, isAdmin, onDelete }: any) => {
  const getIcon = (type: string) => {
    if(type === 'video') return <Video size={16} />;
    if(type === 'audio') return <Music size={16} />;
    if(type === 'image') return <ImageIcon size={16} />;
    return <FileText size={16} />;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col h-full group">
   
      {news.attachments.length > 0 && (
        <div className="h-56 bg-gray-100 overflow-hidden relative">
          {news.attachments[0].type === 'image' ? (
            <img src={news.attachments[0].url} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" alt="attachment" />
          ) : news.attachments[0].type === 'video' ? (
            <video src={news.attachments[0].url} className="w-full h-full object-cover" controls />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50">
              <FileText size={48} className="mb-2 opacity-50" />
              <span className="text-xs font-bold uppercase tracking-widest">Document</span>
            </div>
          )}
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg text-xs font-bold">
            {news.attachments.length} Attachment{news.attachments.length > 1 ? 's' : ''}
          </div>
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${
            news.category === 'urgent' ? 'bg-red-100 text-red-600' : 
            news.category === 'event' ? 'bg-purple-100 text-purple-600' : 
            news.category === 'promotion' ? 'bg-green-100 text-green-600' :
            'bg-blue-100 text-blue-600'
          }`}>
            {news.category}
          </span>
          <span className="text-xs text-gray-400 font-bold">
            {new Date(news.createdAt).toLocaleDateString()}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight line-clamp-2">{news.title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1 line-clamp-4">{news.content}</p>

     
        {news.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {news.attachments.map((att: any, i: number) => (
              <a 
                key={i} 
                href={att.url} 
                target="_blank"
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition"
              >
                {getIcon(att.type)} View
              </a>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-gray-100 flex justify-between items-center mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs font-black text-gray-600">
              {news.createdBy?.firstName?.[0] || 'A'}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">{news.createdBy?.firstName || 'Admin'}</p>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{news.targetAudience} Only</p>
            </div>
          </div>
          {isAdmin && (
            <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition">
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};*/