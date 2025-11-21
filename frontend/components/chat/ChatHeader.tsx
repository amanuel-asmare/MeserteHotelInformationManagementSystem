'use client';

import { Phone, Video, MoreVertical } from 'lucide-react';

const ChatHeader = ({ user, online }) => {
    if (!user) return null;

    return (
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div className="flex items-center">
                <img
                    src={user.profileImage || '/default-avatar.png'}
                    alt={user.firstName}
                    className="w-10 h-10 rounded-full object-cover"
                />
                <div className="ml-3">
                    <p className="font-bold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
                    <p className={`text-sm ${online ? 'text-green-500' : 'text-gray-500'}`}>
                        {online ? 'Online' : 'Offline'}
                    </p>
                </div>
            </div>
            <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
                <button className="hover:text-amber-600"><Phone size={20} /></button>
                <button className="hover:text-amber-600"><Video size={20} /></button>
                <button className="hover:text-amber-600"><MoreVertical size={20} /></button>
            </div>
        </div>
    );
};

export default ChatHeader;