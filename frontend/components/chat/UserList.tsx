'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

// 1. Define Interfaces
interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    profileImage?: string;
}

interface UserListProps {
    users: User[];
    onlineUsers: string[];
    selectedUser: User | null;
    onUserSelect: (user: User) => void;
    onViewProfile: (user: User) => void;
    unreadCounts: Record<string, number>;
}

const UserList = ({ users, onlineUsers, selectedUser, onUserSelect, onViewProfile, unreadCounts }: UserListProps) => {
    // 1. State to hold the search term
    const [searchTerm, setSearchTerm] = useState('');

    // Helper to constructing image URLs correctly
    const getImageUrl = (path?: string) => {
        if (!path) return '/default-avatar.png';
        if (path.startsWith('http')) return path;
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';
        return `${API_BASE}${path}`;
    };

    // 2. Filter users based on the search term
    const filteredUsers = useMemo(() => {
        if (!searchTerm) {
            return users; 
        }
        return users.filter(user =>
            `${user.firstName} ${user.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    return (
        <aside className="w-full md:w-1/3 lg:w-1/4 bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-amber-600">Chats</h2>
                <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-gray-100"
                    />
                </div>
            </div>
            <div className="flex-grow overflow-y-auto">
                {/* 4. Render a message if no users are found */}
                {filteredUsers.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 mt-8 px-4">
                        <p>No users found matching "{searchTerm}"</p>
                    </div>
                ) : (
                    <ul>
                        {/* 5. Map over the filtered list of users */}
                        {filteredUsers.map((u) => {
                            const isOnline = onlineUsers.includes(u._id);
                            const isSelected = selectedUser?._id === u._id;
                            const unreadCount = unreadCounts[u._id] || 0;

                            return (
                                <li key={u._id}>
                                    <motion.div
                                        onClick={() => onUserSelect(u)}
                                        className={`flex items-center p-3 cursor-pointer transition-colors duration-200 ${
                                            isSelected ? 'bg-amber-100 dark:bg-amber-900/30' : 'hover:bg-gray-200 dark:hover:bg-gray-800'
                                        }`}
                                        whileHover={{ x: 5 }}
                                    >
                                        <div className="relative shrink-0">
                                            <img
                                                src={getImageUrl(u.profileImage)}
                                                alt={u.firstName}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                                                onClick={(e) => { e.stopPropagation(); onViewProfile(u); }}
                                                onError={(e) => (e.currentTarget.src = '/default-avatar.png')}
                                            />
                                            {isOnline && (
                                                <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-900" />
                                            )}
                                        </div>
                                        <div className="ml-4 flex-grow overflow-hidden">
                                            <div className="flex justify-between items-center">
                                                <p className={`font-semibold truncate ${isSelected ? 'text-amber-700 dark:text-amber-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                                    {u.firstName} {u.lastName}
                                                </p>
                                                {unreadCount > 0 && (
                                                    <span className="bg-amber-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shrink-0">
                                                        {unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize truncate">{u.role}</p>
                                        </div>
                                    </motion.div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </aside>
    );
};

export default UserList;/*'use client';

import { useState, useMemo } from 'react'; // Import useState and useMemo
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const UserList = ({ users, onlineUsers, selectedUser, onUserSelect, onViewProfile, unreadCounts }) => {
    // 1. State to hold the search term
    const [searchTerm, setSearchTerm] = useState('');

    // 2. Filter users based on the search term
    // useMemo ensures this expensive filtering only runs when users or searchTerm change
    const filteredUsers = useMemo(() => {
        if (!searchTerm) {
            return users; // Return all users if search is empty
        }
        return users.filter(user =>
            `${user.firstName} ${user.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    return (
        <aside className="w-full md:w-1/3 lg:w-1/4 bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-amber-600">Chats</h2>
                <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        // 3. Bind input value to state and update on change
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-amber-500"
                    />
                </div>
            </div>
            <div className="flex-grow overflow-y-auto">
               
                {filteredUsers.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 mt-8 px-4">
                        <p>No users found matching "{searchTerm}"</p>
                    </div>
                ) : (
                    <ul>
     
                        {filteredUsers.map((u) => {
                            const isOnline = onlineUsers.includes(u._id);
                            const isSelected = selectedUser?._id === u._id;
                            const unreadCount = unreadCounts[u._id] || 0;

                            return (
                                <li key={u._id}>
                                    <motion.div
                                        onClick={() => onUserSelect(u)}
                                        className={`flex items-center p-3 cursor-pointer transition-colors duration-200 ${
                                            isSelected ? 'bg-amber-100 dark:bg-amber-900/30' : 'hover:bg-gray-200 dark:hover:bg-gray-800'
                                        }`}
                                        whileHover={{ x: 5 }}
                                    >
                                        <div className="relative">
                                            <img
                                                src={u.profileImage || '/default-avatar.png'}
                                                alt={u.firstName}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                                                onClick={(e) => { e.stopPropagation(); onViewProfile(u); }}
                                            />
                                            {isOnline && (
                                                <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-900" />
                                            )}
                                        </div>
                                        <div className="ml-4 flex-grow">
                                            <div className="flex justify-between items-center">
                                                <p className={`font-semibold ${isSelected ? 'text-amber-700 dark:text-amber-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                                    {u.firstName} {u.lastName}
                                                </p>
                                                {unreadCount > 0 && (
                                                    <span className="bg-amber-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                                        {unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{u.role}</p>
                                        </div>
                                    </motion.div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </aside>
    );
};

export default UserList;*/





/*'use client';

import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const UserList = ({ users, onlineUsers, selectedUser, onUserSelect, onViewProfile }) => {
    return (
        <aside className="w-full md:w-1/3 lg:w-1/4 bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-amber-600">Chats</h2>
                <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search users..."
                        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-amber-500"
                    />
                </div>
            </div>
            <div className="flex-grow overflow-y-auto">
                <ul>
                    {users.map((u) => {
                        const isOnline = onlineUsers.includes(u._id);
                        const isSelected = selectedUser?._id === u._id;
                        return (
                            <li key={u._id}>
                                <motion.div
                                    onClick={() => onUserSelect(u)}
                                    className={`flex items-center p-3 cursor-pointer transition-colors duration-200 ${
                                        isSelected ? 'bg-amber-100 dark:bg-amber-900/30' : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                    whileHover={{ x: 5 }}
                                >
                                    <div className="relative">
                                        <img
                                            src={u.profileImage || '/default-avatar.png'}
                                            alt={u.firstName}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                                            onClick={(e) => { e.stopPropagation(); onViewProfile(u); }}
                                        />
                                        {isOnline && (
                                            <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-900" />
                                        )}
                                    </div>
                                    <div className="ml-4 flex-grow">
                                        <p className={`font-semibold ${isSelected ? 'text-amber-700 dark:text-amber-400' : ''}`}>
                                            {u.firstName} {u.lastName}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{u.role}</p>
                                    </div>
                                </motion.div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </aside>
    );
};

export default UserList;*/