'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';

interface HotelConfig {
    hotelName: string;
    logoUrl: string;
}

interface HotelConfigContextType {
    config: HotelConfig;
    refreshConfig: () => Promise<void>;
}

const HotelConfigContext = createContext<HotelConfigContextType | null>(null);

export function HotelConfigProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<HotelConfig>({
        hotelName: 'Meseret Hotel',
        logoUrl: '/MHIMS_LOGO.png' // Default fallback
    });

    const refreshConfig = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/settings`);
            if (res.data) {
                // Add a timestamp to the logo URL to prevent caching issues
                const timestamp = new Date().getTime();
                const freshConfig = {
                    ...res.data,
                    logoUrl: `${res.data.logoUrl}?t=${timestamp}` 
                };
                setConfig(freshConfig);
            }
        } catch (err) {
            console.error("Failed to load hotel config", err);
        }
    };

    // Initial fetch
    useEffect(() => {
        refreshConfig();
    }, []);

    return (
        <HotelConfigContext.Provider value={{ config, refreshConfig }}>
            {children}
        </HotelConfigContext.Provider>
    );
}

export const useHotelConfig = () => {
    const ctx = useContext(HotelConfigContext);
    if (!ctx) throw new Error("useHotelConfig must be used within HotelConfigProvider");
    return ctx;
};