'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { CheckCheck, Edit, Trash2, Reply, Copy, MoreVertical, FileText } from 'lucide-react';

// Helper to determine file type for display
const getFileType = (mimeType) => {
    if (!mimeType) return 'document';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
};

const Message = ({ message, isCurrentUser, onEdit, onDelete, onReply, }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(message.message);

    const menuRef = useRef(null);
    const messageRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.message);
        setIsMenuOpen(false);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (editedText.trim() !== message.message) {
            onEdit(message._id, editedText.trim());
        }
        setIsEditing(false);
    };

    const fileType = message.file ? getFileType(message.file.mimeType) : null;
    const alignment = isCurrentUser ? 'justify-end' : 'justify-start';
    const bgColor = isCurrentUser ? 'bg-amber-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    const fileUrl = `http://localhost:5000${message.file?.url}`;

    return (
        <motion.div
            ref={messageRef}
            className={`flex items-end gap-2 my-2 ${alignment}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {!isCurrentUser && (
                <img
                    src={`http://localhost:5000${message.sender.profileImage}` || '/default-avatar.png'}
                    alt={message.sender.firstName}
                    className="w-8 h-8 rounded-full object-cover self-start"
                />
            )}

            <div className={`relative max-w-lg rounded-xl px-4 py-2 shadow-md ${bgColor}`}>
                {/* Reply Context */}
                {message.replyTo && (
                    <div className="border-l-4 border-amber-300 dark:border-amber-600 pl-2 mb-2 text-sm opacity-80">
                        <p className="font-bold">{message.replyTo.sender.firstName}</p>
                        <p className="truncate">{message.replyTo.message || 'Attachment'}</p>
                    </div>
                )}
                
                {/* Message Content */}
                {isEditing ? (
                    <form onSubmit={handleEditSubmit} className="flex flex-col gap-2">
                         <textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className="w-full p-2 bg-white/20 text-current dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                            rows={3}
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setIsEditing(false)} className="text-xs px-2 py-1 rounded">Cancel</button>
                            <button type="submit" className="text-xs font-bold px-2 py-1 bg-white/30 rounded">Save</button>
                        </div>
                    </form>
                ) : (
                    <div>
                        {/* File Content */}
                        {message.file && (
                           <div className="mb-2">
                                {fileType === 'image' && (
                                    <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                        <img src={fileUrl} alt="attachment" className="rounded-lg max-w-xs max-h-64 object-cover"/>
                                    </a>
                                )}
                                {fileType === 'audio' && (
                                     <audio controls src={fileUrl} className="w-full max-w-xs" />
                                )}
                                {fileType !== 'image' && fileType !== 'audio' && (
                                    <div className="flex items-center gap-3 p-3 bg-white/20 dark:bg-gray-800/50 rounded-lg">
                                        <FileText size={32} className="text-current opacity-70" />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold truncate">{message.file.originalName}</p>
                                            <a href={fileUrl} download className="text-xs hover:underline">Download</a>
                                        </div>
                                    </div>
                                )}
                           </div>
                        )}
                        {/* Text Message */}
                        {message.message && <p className="whitespace-pre-wrap">{message.message}</p>}
                    </div>
                )}
                
                {/* Timestamp and Status */}
                <div className="flex justify-end items-center gap-1.5 text-xs pt-1 opacity-70">
                    {message.isEdited && !isEditing && <span>edited</span>}
                    <span>{format(new Date(message.createdAt), 'h:mm a')}</span>
                    {isCurrentUser && <CheckCheck size={16} className={message.isRead ? 'text-blue-400' : 'text-gray-400'} />}
                </div>
            </div>

            {/* Message Actions Menu */}
            <AnimatePresence>
                {(isHovered || isMenuOpen) && (
                     <div ref={menuRef} className="relative self-center">
                        <motion.button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                        >
                            <MoreVertical size={16} />
                        </motion.button>
                        
                        {isMenuOpen && (
                             <motion.div
                                 className="absolute z-10 w-40 bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                                 style={{ [isCurrentUser ? 'right' : 'left']: '100%', top: 0 }}
                                 initial={{ opacity: 0, x: isCurrentUser ? 10 : -10 }}
                                 animate={{ opacity: 1, x: 0 }}
                             >
                                <ul className="text-sm text-gray-700 dark:text-gray-200">
                                    <li onClick={() => { onReply(); setIsMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"><Reply size={16} /> Reply</li>
                                    {message.message && <li onClick={handleCopy} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"><Copy size={16} /> Copy</li>}
                                    {isCurrentUser && !message.file && message.message && (
                                        <li onClick={() => { setIsEditing(true); setIsMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"><Edit size={16} /> Edit</li>
                                    )}
                                    {isCurrentUser && (
                                        <li onClick={() => { onDelete(message._id); setIsMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"><Trash2 size={16} /> Delete</li>
                                    )}
                                </ul>
                             </motion.div>
                        )}
                     </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Message;/*//frontend/components/chat/Message.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Check, CheckCheck, Edit, Trash2, Reply, Copy, MoreVertical, FileText, Download, Image as ImageIcon, X } from 'lucide-react';

// Helper to determine file type for display
const getFileType = (mimeType) => {
    if (!mimeType) return 'document';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
};

const Message = ({ message, isCurrentUser, onEdit, onDelete, onReply, }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(message.message);

    const menuRef = useRef(null);
    const messageRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.message);
        setIsMenuOpen(false);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (editedText.trim() !== message.message) {
            onEdit(message._id, editedText.trim());
        }
        setIsEditing(false);
    };

    const fileType = message.file ? getFileType(message.file.mimeType) : null;
    const alignment = isCurrentUser ? 'justify-end' : 'justify-start';
    const bgColor = isCurrentUser ? 'bg-amber-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200';

    return (
        <motion.div
            ref={messageRef}
            className={`flex items-end gap-2 my-2 ${alignment}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {!isCurrentUser && (
                <img
                    src={message.sender.profileImage || '/default-avatar.png'}
                    alt={message.sender.firstName}
                    className="w-8 h-8 rounded-full object-cover self-start"
                />
            )}

            <div className={`relative max-w-lg rounded-xl px-4 py-2 shadow-md ${bgColor}`}>
                {/* Reply Context 
                {message.replyTo && (
                    <div className="border-l-4 border-amber-300 dark:border-amber-600 pl-2 mb-2 text-sm opacity-80">
                        <p className="font-bold">{message.replyTo.sender.firstName}</p>
                        <p className="truncate">{message.replyTo.message}</p>
                    </div>
                )}
                
                {/* Message Content 
                {isEditing ? (
                    <form onSubmit={handleEditSubmit} className="flex flex-col gap-2">
                         <textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className="w-full p-2 bg-white/20 dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                            rows={3}
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setIsEditing(false)} className="text-xs px-2 py-1 rounded">Cancel</button>
                            <button type="submit" className="text-xs font-bold px-2 py-1 bg-white/30 rounded">Save</button>
                        </div>
                    </form>
                ) : (
                    <div>
                        {/* File Content 
                        {message.file && (
                           <div className="mb-2">
                                {fileType === 'image' ? (
                                    <a href={`http://localhost:5000${message.file.url}`} target="_blank" rel="noopener noreferrer">
                                        <img src={`http://localhost:5000${message.file.url}`} alt="attachment" className="rounded-lg max-w-xs max-h-64 object-cover"/>
                                    </a>
                                ) : (
                                    <div className="flex items-center gap-3 p-3 bg-white/20 dark:bg-gray-800/50 rounded-lg">
                                        <FileText size={32} className="text-current opacity-70" />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold truncate">{message.file.originalName}</p>
                                            <a href={`http://localhost:5000${message.file.url}`} download className="text-xs hover:underline">Download</a>
                                        </div>
                                    </div>
                                )}
                           </div>
                        )}
                        {/* Text Message 
                        {message.message && <p className="whitespace-pre-wrap">{message.message}</p>}
                    </div>
                )}
                
                {/* Timestamp and Status 
                <div className="flex justify-end items-center gap-1.5 text-xs pt-1 opacity-70">
                    {message.isEdited && !isEditing && <span>edited</span>}
                    <span>{format(new Date(message.createdAt), 'h:mm a')}</span>
                    {isCurrentUser && <CheckCheck size={16} className="text-blue-300" />}
                </div>
            </div>

            {/* Message Actions Menu 
            <AnimatePresence>
                {(isHovered || isMenuOpen) && (
                     <div ref={menuRef} className="relative self-center">
                        <motion.button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                        >
                            <MoreVertical size={16} />
                        </motion.button>
                        
                        {isMenuOpen && (
                             <motion.div
                                 className="absolute z-10 w-40 bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                                 style={{ [isCurrentUser ? 'right' : 'left']: '100%', top: 0 }}
                                 initial={{ opacity: 0, x: -10 }}
                                 animate={{ opacity: 1, x: 0 }}
                             >
                                <ul className="text-sm text-gray-700 dark:text-gray-200">
                                    <li onClick={() => { onReply(); setIsMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"><Reply size={16} /> Reply</li>
                                    <li onClick={handleCopy} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"><Copy size={16} /> Copy</li>
                                    {isCurrentUser && !message.file && (
                                        <li onClick={() => { setIsEditing(true); setIsMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"><Edit size={16} /> Edit</li>
                                    )}
                                    {isCurrentUser && (
                                        <li onClick={() => { onDelete(message._id); setIsMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"><Trash2 size={16} /> Delete</li>
                                    )}
                                </ul>
                             </motion.div>
                        )}
                     </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Message;*/