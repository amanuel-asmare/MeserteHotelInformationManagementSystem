'use client';

import { Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';

// Define the User interface based on what you are using
interface User {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
}

interface ChatHeaderProps {
    user: User | null;
    online: boolean;
    onViewProfile?: () => void; // Optional if not always passed
    onBack?: () => void;        // Added for mobile back functionality
}

const ChatHeader = ({ user, online, onBack, onViewProfile }: ChatHeaderProps) => {
    if (!user) return null;

    return (
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm shrink-0 h-16">
            <div className="flex items-center gap-3">
                {/* Back button - visible only on mobile/tablet (md:hidden) */}
                {onBack && (
                    <button 
                        onClick={onBack} 
                        className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    >
                        <ArrowLeft size={24} />
                    </button>
                )}

                <div 
                    className="flex items-center cursor-pointer" 
                    onClick={onViewProfile}
                >
                    <img
                        src={user.profileImage || '/default-avatar.png'}
                        alt={user.firstName}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="ml-3">
                        <p className="font-bold text-gray-900 dark:text-white leading-tight">
                            {user.firstName} {user.lastName}
                        </p>
                        <p className={`text-sm ${online ? 'text-green-500' : 'text-gray-500'} leading-tight`}>
                            {online ? 'Online' : 'Offline'}
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 text-gray-500 dark:text-gray-400">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full hover:text-amber-600 transition-colors">
                    <Phone size={20} />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full hover:text-amber-600 transition-colors">
                    <Video size={20} />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full hover:text-amber-600 transition-colors">
                    <MoreVertical size={20} />
                </button>
            </div>
        </div>
    );
};

export default ChatHeader;/*'use client';

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

export default ChatHeader;*/