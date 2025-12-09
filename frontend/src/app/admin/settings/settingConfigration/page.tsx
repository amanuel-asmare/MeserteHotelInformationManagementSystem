'use client';
import { Alert } from 'react-native';

import { useState, useRef } from 'react';

import { useHotelConfig } from '../../../../../context/HotelConfigContext'; // Adjusted path based on typical structure
import { Upload, Save, Building } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../../../../../context/LanguageContext'; // Import Hook

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

export default function AdminSettings() {
    const { t } = useLanguage(); // Use Translation Hook
    const { config, refreshConfig } = useHotelConfig();
    
    const [name, setName] = useState(config.hotelName);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState(config.logoUrl);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
            setPreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleSave = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append('hotelName', name);
        if (file) formData.append('logo', file);

        try {
            const res = await axios.put(`${API_BASE}/api/settings`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // THIS IS CRITICAL: Update the global context so all other components know
            await refreshConfig(); 

            if (res.data.logoUrl) {
                setPreview(`${res.data.logoUrl}?t=${Date.now()}`);
            }

            setFile(null);
            alert(t('settingsSaved')); // Translated Alert
        } catch (error) {
            console.error(error);
            alert(t('settingsFailed')); // Translated Alert
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <Building className="text-amber-600"/> {t('hotelSettings')}
            </h1>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Logo Upload */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-40 h-40 rounded-2xl overflow-hidden border-4 border-amber-100 shadow-inner bg-gray-50">
                            <img src={preview} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                        </div>
                        <label className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition flex items-center gap-2">
                            <Upload size={16} /> {t('changeLogo')}
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                    </div>

                    {/* Name Input */}
                    <div className="flex-1 w-full space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">{t('hotelNameLabel')}</label>
                            <input 
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition"
                            />
                        </div>
                        
                        <div className="pt-4">
                            <button 
                                onClick={handleSave} 
                                disabled={loading}
                                className="px-8 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? t('saving') : <><Save size={20}/> {t('saveChanges')}</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}/*'use client';

import { useHotelConfig } from '../../../../../context/HotelConfigContext';
import { Upload, Save, Building } from 'lucide-react';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

export default function AdminSettings() {
    const { config, refreshConfig } = useHotelConfig();
    const [name, setName] = useState(config.hotelName);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState(config.logoUrl);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
            setPreview(URL.createObjectURL(e.target.files[0]));
        }
    };

   // ... inside the component ...
    const handleSave = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append('hotelName', name);
        if (file) formData.append('logo', file);

        try {
            const res = await axios.put(`${API_BASE}/api/settings`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // THIS IS CRITICAL: Update the global context so all other components know
            await refreshConfig(); 

            if (res.data.logoUrl) {
                setPreview(`${res.data.logoUrl}?t=${Date.now()}`);
            }

            setFile(null);
            alert('Settings Saved Successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };
// ...
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <Building className="text-amber-600"/> Hotel Settings
            </h1>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                 
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-40 h-40 rounded-2xl overflow-hidden border-4 border-amber-100 shadow-inner bg-gray-50">
                            <img src={preview} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                        </div>
                        <label className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition flex items-center gap-2">
                            <Upload size={16} /> Change Logo
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                    </div>

                   
                    <div className="flex-1 w-full space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Hotel Name</label>
                            <input 
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition"
                            />
                        </div>
                        
                        <div className="pt-4">
                            <button 
                                onClick={handleSave} 
                                disabled={loading}
                                className="px-8 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : <><Save size={20}/> Save Changes</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}*/