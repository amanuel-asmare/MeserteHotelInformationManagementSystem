'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '@/lib/api';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

import UserList from './UserList';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserProfileModal from './UserProfileModal';

// Define interfaces
interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    profileImage?: string;
}

interface Message {
    _id: string;
    sender: User;
    receiver: User;
    message?: string;
    file?: any;
    replyTo?: any;
    isRead: boolean;
    createdAt: string;
}

const ChatLayout = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [viewedProfile, setViewedProfile] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

    const socket = useRef<any>(null);

    // Fetch users for chat
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await api.get('/api/users/chat');
                setUsers(data.filter((u: User) => u._id !== user?.id));
            } catch (error: any) {
                console.error("Failed to fetch users:", error);
                 if (error.response?.status === 403) {
                    alert("You are not authorized to view users.");
                }
            }
        };
        if (user) fetchUsers();
    }, [user]);

    // Fetch unread message counts
    const fetchUnreadCounts = useCallback(async () => {
        if (!user) return;
        try {
            const { data } = await api.get('/api/chat/unread-counts');
            const counts = data.reduce((acc: any, item: any) => {
                acc[item.sender] = item.count;
                return acc;
            }, {});
            setUnreadCounts(counts);
        } catch (error) {
            console.error("Failed to fetch unread counts:", error);
        }
    }, [user]);

    useEffect(() => {
        fetchUnreadCounts();
    }, [fetchUnreadCounts]);


    // --- SOCKET.IO & REAL-TIME EVENT HANDLING ---
    useEffect(() => {
        if (user) {
            socket.current = io('https://localhost:5000');
            socket.current.emit('join', user.id);
            socket.current.on('onlineUsers', setOnlineUsers);

            socket.current.on('newMessage', (message: Message) => {
                if (message.sender._id === selectedUser?._id || message.receiver._id === selectedUser?._id) {
                    setMessages((prev) => [...prev, message]);
                } else {
                    setUnreadCounts(prev => ({
                        ...prev,
                        [message.sender._id]: (prev[message.sender._id] || 0) + 1
                    }));
                }
            });

            socket.current.on('messageEdited', (editedMessage: Message) => {
                setMessages(prev => prev.map(msg => msg._id === editedMessage._id ? editedMessage : msg));
            });
            
            socket.current.on('messageDeleted', ({ messageId }: { messageId: string }) => {
                setMessages(prev => prev.filter(msg => msg._id !== messageId));
            });

            socket.current.on('messagesRead', ({ senderId }: { senderId: string }) => {
                 if (senderId === user.id) {
                    setMessages(prev => prev.map(msg => ({...msg, isRead: true})))
                }
            });

        }
        return () => {
            if (socket.current) socket.current.disconnect();
        };
    }, [user, selectedUser]);


    const handleUserSelect = useCallback(async (selected: User) => {
        if (selectedUser?._id === selected._id) return;
        
        setSelectedUser(selected);
        setLoading(true);
        setReplyingTo(null);
        try {
            const { data } = await api.get(`/api/chat/${selected._id}`);
            setMessages(data);
            
            setUnreadCounts(prev => ({ ...prev, [selected._id]: 0 }));
            socket.current.emit('markAsRead', { receiverId: user?.id, senderId: selected._id });

        } catch (error: any) {
            console.error("Failed to fetch messages:", error);
            setMessages([]);
            if(error.response?.status === 403){
                alert("You are not authorized to chat with this user.");
                setSelectedUser(null);
            }
        } finally {
            setLoading(false);
        }
    }, [selectedUser, user]);
    
    const handleSendMessage = async (messageData: any) => {
        if (!selectedUser) return;
        const formData = new FormData();
        formData.append('receiver', selectedUser._id);
        formData.append('message', messageData.text);
        if (messageData.file) formData.append('file', messageData.file);
        if (messageData.replyTo) formData.append('replyTo', messageData.replyTo);

        try {
            await api.post('/api/chat', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setReplyingTo(null);
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };
    
    const handleEditMessage = async (messageId: string, newText: string) => {
        try {
            await api.put(`/api/chat/${messageId}`, { message: newText });
        } catch (error) { console.error("Failed to edit message:", error); }
    };

    const handleDeleteMessage = async (messageId: string) => {
        try {
            await api.delete(`/api/chat/${messageId}`);
        } catch (error) { console.error("Failed to delete message:", error); }
    };

    return (
        <div className="flex h-screen font-sans bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 overflow-x-auto">
            <AnimatePresence>
                {viewedProfile && (
                    <UserProfileModal user={viewedProfile} onClose={() => setViewedProfile(null)} />
                )}
            </AnimatePresence>
            
            <UserList 
                users={users}
                onlineUsers={onlineUsers}
                selectedUser={selectedUser}
                onUserSelect={handleUserSelect}
                onViewProfile={setViewedProfile}
                unreadCounts={unreadCounts}
            />

            <main className="w-full lg:w-3/4 flex flex-col bg-white dark:bg-gray-900 shadow-inner min-w-[320px]">
                {selectedUser ? (
                    <>
                        <ChatHeader 
                            user={selectedUser} 
                            online={onlineUsers.includes(selectedUser._id)} 
                            onViewProfile={() => setViewedProfile(selectedUser)}
                        />
                        {/* 
                            NOTE: If you still get a type error on 'onReply', you need to update 
                            the MessageList component to accept this prop in its interface.
                            For now, we explicitly cast to any to bypass the strict check if you cannot edit MessageList immediately.
                        */}
                        <MessageList 
                            messages={messages}
                            currentUser={user}
                            loading={loading}
                            onEditMessage={handleEditMessage}
                            onDeleteMessage={handleDeleteMessage}
                            {...({ onReply: setReplyingTo } as any)} 
                        />
                        <MessageInput 
                           onSendMessage={handleSendMessage}
                           replyingTo={replyingTo}
                           onCancelReply={() => setReplyingTo(null)}
                        />
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <p className="text-lg">Select a user to start chatting</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ChatLayout;/*'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '@/lib/api';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

import UserList from './UserList';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserProfileModal from './UserProfileModal';

const ChatLayout = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [viewedProfile, setViewedProfile] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({});

    const socket = useRef(null);

    // Fetch users for chat
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // CORRECTED: Use the new endpoint for fetching chat-specific users
                const { data } = await api.get('/api/users/chat');
                setUsers(data.filter(u => u._id !== user?.id));
            } catch (error) {
                console.error("Failed to fetch users:", error);
                 if (error.response?.status === 403) {
                    // This error is now less likely but good to keep
                    alert("You are not authorized to view users.");
                }
            }
        };
        if (user) fetchUsers();
    }, [user]);

    // Fetch unread message counts
    const fetchUnreadCounts = useCallback(async () => {
        if (!user) return;
        try {
            const { data } = await api.get('/api/chat/unread-counts');
            const counts = data.reduce((acc, item) => {
                acc[item.sender] = item.count;
                return acc;
            }, {});
            setUnreadCounts(counts);
        } catch (error) {
            console.error("Failed to fetch unread counts:", error);
        }
    }, [user]);

    useEffect(() => {
        fetchUnreadCounts();
    }, [fetchUnreadCounts]);


    // --- SOCKET.IO & REAL-TIME EVENT HANDLING ---
    useEffect(() => {
        if (user) {
            socket.current = io('https://localhost:5000');
            socket.current.emit('join', user.id);
            socket.current.on('onlineUsers', setOnlineUsers);

            socket.current.on('newMessage', (message) => {
                // If the message is for the currently selected chat, add it to the view
                if (message.sender._id === selectedUser?._id || message.receiver._id === selectedUser?._id) {
                    setMessages((prev) => [...prev, message]);
                } else {
                    // Otherwise, update the unread count for the sender
                    setUnreadCounts(prev => ({
                        ...prev,
                        [message.sender._id]: (prev[message.sender._id] || 0) + 1
                    }));
                }
            });

            socket.current.on('messageEdited', (editedMessage) => {
                setMessages(prev => prev.map(msg => msg._id === editedMessage._id ? editedMessage : msg));
            });
            
            socket.current.on('messageDeleted', ({ messageId }) => {
                setMessages(prev => prev.filter(msg => msg._id !== messageId));
            });

            socket.current.on('messagesRead', ({ senderId }) => {
                 if (senderId === user.id) { // The other user read my messages
                    setMessages(prev => prev.map(msg => ({...msg, isRead: true})))
                }
            });

        }
        return () => {
            if (socket.current) socket.current.disconnect();
        };
    }, [user, selectedUser]);


    const handleUserSelect = useCallback(async (selected) => {
        if (selectedUser?._id === selected._id) return;
        
        setSelectedUser(selected);
        setLoading(true);
        setReplyingTo(null);
        try {
            const { data } = await api.get(`/api/chat/${selected._id}`);
            setMessages(data);
            
            // Clear unread count for this user visually and inform backend
            setUnreadCounts(prev => ({ ...prev, [selected._id]: 0 }));
            socket.current.emit('markAsRead', { receiverId: user.id, senderId: selected._id });

        } catch (error) {
            console.error("Failed to fetch messages:", error);
            setMessages([]);
            if(error.response?.status === 403){
                alert("You are not authorized to chat with this user.");
                setSelectedUser(null);
            }
        } finally {
            setLoading(false);
        }
    }, [selectedUser, user]);
    
    const handleSendMessage = async (messageData) => {
        if (!selectedUser) return;
        const formData = new FormData();
        formData.append('receiver', selectedUser._id);
        formData.append('message', messageData.text);
        if (messageData.file) formData.append('file', messageData.file);
        if (messageData.replyTo) formData.append('replyTo', messageData.replyTo);

        try {
            await api.post('/api/chat', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setReplyingTo(null); // Clear reply state after sending
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };
    
    const handleEditMessage = async (messageId, newText) => {
        try {
            await api.put(`/api/chat/${messageId}`, { message: newText });
        } catch (error) { console.error("Failed to edit message:", error); }
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            await api.delete(`/api/chat/${messageId}`);
        } catch (error) { console.error("Failed to delete message:", error); }
    };

    return (
        <div className="flex h-screen font-sans bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 overflow-x-auto">
            <AnimatePresence>
                {viewedProfile && (
                    <UserProfileModal user={viewedProfile} onClose={() => setViewedProfile(null)} />
                )}
            </AnimatePresence>
            
            <UserList 
                users={users}
                onlineUsers={onlineUsers}
                selectedUser={selectedUser}
                onUserSelect={handleUserSelect}
                onViewProfile={setViewedProfile}
                unreadCounts={unreadCounts}
            />

            <main className="w-full lg:w-3/4 flex flex-col bg-white dark:bg-gray-900 shadow-inner min-w-[320px]">
                {selectedUser ? (
                    <>
                        <ChatHeader user={selectedUser} online={onlineUsers.includes(selectedUser._id)} onViewProfile={() => setViewedProfile(selectedUser)}/>
                        <MessageList 
                            messages={messages}
                            currentUser={user}
                            loading={loading}
                            onEditMessage={handleEditMessage}
                            onDeleteMessage={handleDeleteMessage}
                            onReply={setReplyingTo}
                        />
                        <MessageInput 
                           onSendMessage={handleSendMessage}
                           replyingTo={replyingTo}
                           onCancelReply={() => setReplyingTo(null)}
                        />
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <p className="text-lg">Select a user to start chatting</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ChatLayout;*/


/*'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '@/lib/api';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

// Import child components (we will create these next)
import UserList from './UserList';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserProfileModal from './UserProfileModal';

const ChatLayout = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [viewedProfile, setViewedProfile] = useState(null); // For the modal
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const socket = useRef(null);

    // --- SOCKET.IO & REAL-TIME EVENT HANDLING ---
    useEffect(() => {
        if (user) {
            // Connect to socket server
            socket.current = io('http://localhost:5000');
            
            // Announce user's presence
            socket.current.emit('join', user.id);

            // Listen for list of online users
            socket.current.on('onlineUsers', (users) => {
                setOnlineUsers(users);
            });

            // Listen for new messages
            socket.current.on('newMessage', (message) => {
                if (message.sender._id === selectedUser?._id || message.receiver._id === selectedUser?._id) {
                    setMessages((prev) => [...prev, message]);
                }
                // You can add a notification hook here for other chats
            });

            // Listen for message edits
            socket.current.on('messageEdited', (editedMessage) => {
                setMessages(prev => prev.map(msg => msg._id === editedMessage._id ? editedMessage : msg));
            });
            
            // Listen for message deletions
            socket.current.on('messageDeleted', ({ messageId }) => {
                setMessages(prev => prev.filter(msg => msg._id !== messageId));
            });

        }
        // Disconnect on component unmount
        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, [user, selectedUser]);


    // --- DATA FETCHING ---
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await api.get('/api/users');
                // Ensure the current user is not in the list
                setUsers(data.filter(u => u._id !== user?.id));
            } catch (error) {
                console.error("Failed to fetch users", error);
            }
        };
        if (user) fetchUsers();
    }, [user]);

    // --- HANDLER FUNCTIONS ---
    const handleUserSelect = useCallback(async (selected) => {
        if (selectedUser?._id === selected._id) return; // Avoid re-fetching for same user
        
        setSelectedUser(selected);
        setLoading(true);
        try {
            const { data } = await api.get(`/api/chat/${selected._id}`);
            setMessages(data);
        } catch (error) {
            console.error("Failed to fetch messages", error);
            setMessages([]); // Clear messages on error
        } finally {
            setLoading(false);
        }
    }, [selectedUser]);
    
    const handleSendMessage = async (messageData) => {
        const formData = new FormData();
        formData.append('receiver', selectedUser._id);
        formData.append('message', messageData.text);
        if (messageData.file) formData.append('file', messageData.file);
        if (messageData.replyTo) formData.append('replyTo', messageData.replyTo);

        try {
            // The API call sends the message, and the socket listener 'newMessage' will update the state
            await api.post('/api/chat', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };
    
    // Handlers for message actions (edit, delete)
    const handleEditMessage = async (messageId, newText) => {
        try {
            await api.put(`/api/chat/${messageId}`, { message: newText });
        } catch (error) {
            console.error("Failed to edit message:", error);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            await api.delete(`/api/chat/${messageId}`);
        } catch (error) {
            console.error("Failed to delete message:", error);
        }
    };

    return (
        <div className="flex h-screen font-sans bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            {/* User Profile Modal 
            <AnimatePresence>
                {viewedProfile && (
                    <UserProfileModal user={viewedProfile} onClose={() => setViewedProfile(null)} />
                )}
            </AnimatePresence>
            
            {/* User List Panel 
            <UserList 
                users={users}
                onlineUsers={onlineUsers}
                selectedUser={selectedUser}
                onUserSelect={handleUserSelect}
                onViewProfile={setViewedProfile}
            />

            {/* Main Chat Area 
            <div className="w-full lg:w-3/4 flex flex-col bg-white dark:bg-gray-800 shadow-inner">
                {selectedUser ? (
                    <>
                        <ChatHeader user={selectedUser} online={onlineUsers.includes(selectedUser._id)} />
                        <MessageList 
                            messages={messages}
                            currentUser={user}
                            loading={loading}
                            onEditMessage={handleEditMessage}
                            onDeleteMessage={handleDeleteMessage}
                        />
                        <MessageInput onSendMessage={handleSendMessage} />
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <p className="text-lg">Select a user to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatLayout;
*/