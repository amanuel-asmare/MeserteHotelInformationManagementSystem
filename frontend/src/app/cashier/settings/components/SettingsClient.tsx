'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, SunMoon, LogOut } from 'lucide-react';
import { useAuth } from '../../../../../context/AuthContext';
import { Toaster } from 'react-hot-toast'; // For notifications

import ProfileSettings from './ProfileSettings';

import AppearanceSettings from './AppearanceSettings';

const navItems = [
    { id: 'profile', label: 'My Profile', icon: <User size={18} /> },

    { id: 'appearance', label: 'Appearance', icon: <SunMoon size={18} /> },
];

export default function SettingsClient() {
    const [activeTab, setActiveTab] = useState('profile');
    const { logout } = useAuth();

    const renderContent = () => {
        switch (activeTab) {
            case 'profile': return <ProfileSettings />;
            
            case 'appearance': return <AppearanceSettings />;
            default: return null;
        }
    };

    return (
        <>
            {/* This component handles showing the toast notifications */}
            <Toaster position="top-right" />

            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
                <p className="text-gray-500 mt-1">Manage your account settings and preferences.</p>
            </motion.div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Left Side Navigation */}
                <aside>
                    <nav className="flex flex-col space-y-2">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                    activeTab === item.id ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100 text-gray-700'
                                }`}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        ))}
                         <button
                            onClick={logout}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-red-600 hover:bg-red-50 mt-4"
                        >
                            <LogOut size={18} />
                            Sign Out
                        </button>
                    </nav>
                </aside>

                {/* Right Side Content */}
                <main className="md:col-span-3">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </>
    );
}

