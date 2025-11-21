'use client';

import { useState, useRef } from 'react';
import { motion,AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Mic, X, CornerUpLeft, Square } from 'lucide-react';

const MessageInput = ({ onSendMessage, replyingTo, onCancelReply }) => {
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [isRecording, setIsRecording] = useState(false);

    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => setFilePreview(reader.result);
                reader.readAsDataURL(selectedFile);
            } else {
                 setFilePreview(selectedFile.name);
            }
        }
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (text.trim() || file) {
            onSendMessage({
                text: text.trim(),
                file: file,
                replyTo: replyingTo?._id || null,
            });
            setText('');
            removeAttachment();
            if (onCancelReply) onCancelReply();
        }
    };
    
    const removeAttachment = () => {
        setFile(null);
        setFilePreview(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = null; // Reset file input
        }
    };

    const handleMicClick = async () => {
        if (isRecording) {
            // Stop recording
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        } else {
            // Start recording
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                audioChunksRef.current = []; // Clear previous chunks

                mediaRecorderRef.current.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };

                mediaRecorderRef.current.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
                    setFile(audioFile);
                    setFilePreview("Audio Recording.webm");
                    // Stop mic stream
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorderRef.current.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Microphone access denied:", err);
                alert("Microphone access is required to record audio.");
            }
        }
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            {/* Replying To Preview */}
            <AnimatePresence>
                {replyingTo && (
                    <motion.div
                        className="relative p-2 mb-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center gap-3 text-sm"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                    >
                        <CornerUpLeft size={16} className="text-amber-600" />
                        <div className="flex-1">
                            <p className="font-bold text-amber-600">{replyingTo.sender.firstName}</p>
                            <p className="truncate text-gray-600 dark:text-gray-300">{replyingTo.message || 'Attachment'}</p>
                        </div>
                        <button onClick={onCancelReply} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full">
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* File Preview */}
            <AnimatePresence>
                {filePreview && (
                     <motion.div
                        className="relative w-max max-w-xs p-2 mb-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                     >
                        {file?.type?.startsWith('image/') ? (
                            <img src={filePreview} alt="preview" className="w-24 h-auto rounded-md" />
                        ) : (
                            <div className="p-2 text-center text-xs text-gray-600 dark:text-gray-300 truncate">{filePreview}</div>
                        )}
                         <button onClick={removeAttachment} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-md">
                            <X size={14} />
                         </button>
                     </motion.div>
                )}
            </AnimatePresence>
            
            <form onSubmit={handleSend} className="flex items-center gap-3">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-amber-600 rounded-full transition-colors"
                    aria-label="Attach file"
                >
                    <Paperclip size={22} />
                </button>
                
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow resize-none"
                    rows={1}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSend(e); }}
                />

                <button
                    type="button"
                    onClick={handleMicClick}
                    className={`p-2 rounded-full transition-colors ${
                        isRecording 
                        ? 'text-red-500 animate-pulse' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-amber-600'}`
                    }
                    aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                >
                    {isRecording ? <Square size={22} /> : <Mic size={22} />}
                </button>
                
                <motion.button
                    type="submit"
                    className="p-3 bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600 transition-colors disabled:bg-gray-400"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={!text.trim() && !file}
                    aria-label="Send message"
                >
                    <Send size={20} />
                </motion.button>
            </form>
        </div>
    );
};

export default MessageInput;/*'use client';

import { useState, useRef } from 'react';
import { motion,AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Mic, Video, X, CornerUpLeft } from 'lucide-react';

const MessageInput = ({ onSendMessage, replyingTo, onCancelReply }) => {
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [isRecordingAudio, setIsRecordingAudio] = useState(true);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => setFilePreview(reader.result);
                reader.readAsDataURL(selectedFile);
            } else {
                 setFilePreview(selectedFile.name);
            }
        }
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (text.trim() || file) {
            onSendMessage({
                text: text.trim(),
                file: file,
                replyTo: replyingTo?._id || null,
            });
            setText('');
            setFile(null);
            setFilePreview(null);
            if (onCancelReply) onCancelReply();
        }
    };
    
    const removeAttachment = () => {
        setFile(null);
        setFilePreview(null);
        fileInputRef.current.value = null; // Reset file input
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            {/* Replying To Preview 
            <AnimatePresence>
                {replyingTo && (
                    <motion.div
                        className="relative p-2 mb-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center gap-3 text-sm"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                    >
                        <CornerUpLeft size={16} className="text-amber-600" />
                        <div className="flex-1">
                            <p className="font-bold text-amber-600">{replyingTo.sender.firstName}</p>
                            <p className="truncate text-gray-600 dark:text-gray-300">{replyingTo.message}</p>
                        </div>
                        <button onClick={onCancelReply} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full">
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* File Preview 
            <AnimatePresence>
                {filePreview && (
                     <motion.div
                        className="relative w-32 p-1 mb-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                     >
                        {file.type.startsWith('image/') ? (
                            <img src={filePreview} alt="preview" className="w-full h-auto rounded-md" />
                        ) : (
                            <div className="p-2 text-center text-xs text-gray-600 dark:text-gray-300">{filePreview}</div>
                        )}
                         <button onClick={removeAttachment} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5">
                            <X size={14} />
                         </button>
                     </motion.div>
                )}
            </AnimatePresence>
            
            <form onSubmit={handleSend} className="flex items-center gap-3">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-amber-600 rounded-full transition-colors"
                >
                    <Paperclip size={22} />
                </button>
                
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow resize-none"
                    rows={1}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSend(e); }}
                />

                <button
                    type="button"
                    onClick={() => setIsRecordingAudio(!isRecordingAudio)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-amber-600 rounded-full transition-colors"
                >
                    {isRecordingAudio ? <Mic size={22} /> : <Video size={22} />}
                </button>
                
                <motion.button
                    type="submit"
                    className="p-3 bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <Send size={20} />
                </motion.button>
            </form>
        </div>
    );
};

export default MessageInput;*/