'use client';
import { ReactNode } from 'react';

// This is a UI-only component for now. Implementing a full theme switcher
// would require a ThemeContext, which is beyond this scope but easy to add later.

// 1. Define the interface for props
interface SettingsCardProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

// 2. Apply the interface to the component
const SettingsCard = ({ title, description, children, footer }: SettingsCardProps) => (
     <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <div className="p-6">{children}</div>
    </div>
);

export default function AppearanceSettings() {
    return (
        <SettingsCard
            title="Appearance"
            description="Customize the look and feel of the application."
        >
            <div className="space-y-4">
                <h4 className="font-medium">Theme</h4>
                <div className="flex space-x-4">
                    <button className="p-4 border-2 border-indigo-600 rounded-lg text-center">
                        <div className="w-16 h-10 bg-gray-100 rounded mb-2"></div>
                        <p className="text-sm font-semibold">Light</p>
                    </button>
                    <button className="p-4 border rounded-lg text-center">
                         <div className="w-16 h-10 bg-gray-800 rounded mb-2"></div>
                        <p className="text-sm">Dark</p>
                    </button>
                </div>
                <p className="text-xs text-gray-500">Note: Full dark mode functionality requires a theme provider setup.</p>
            </div>
        </SettingsCard>
    );
}