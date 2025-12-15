/*
'use client';
import RoomManagementClient from './RoomManagementClient';
import { Bed } from 'lucide-react';

export default function RoomsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          
        </div>

        <RoomManagementClient />
      </div>
    </div>
  );
}*/
//frontend/src/app/admin/rooms/page.tsx
'use client';
import RoomManagementClient from './RoomManagementClient';
import { Bed } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';

export default function RoomsPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
       
        <RoomManagementClient />
      </div>
    </div>
  );
}