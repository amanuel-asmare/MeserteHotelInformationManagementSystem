// src/app/receptionist/guestmanagement/modals/GuestProfileModal.tsx
'use client';

import { Modal } from '../../../../../components/ui/Modal';
import { User, Mail, Phone, MapPin, Calendar, Home } from 'lucide-react';

interface Guest {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage: string;
  address: { country: string; city: string; kebele?: string };
  createdAt: string;
}

interface Props {
  guest: Guest | null;
  onClose: () => void;
}

export default function GuestProfileModal({ guest, onClose }: Props) {
  if (!guest) return null;

  return (
    <Modal title="Guest Profile" onClose={onClose} className="max-w-2xl">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <img
            src={guest.profileImage}
            alt={guest.firstName}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-amber-500"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {guest.firstName} {guest.lastName}
            </h2>
            <p className="text-sm text-amber-600 dark:text-amber-400">Hotel Guest</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <Mail className="text-amber-600" size={18} />
            <span>{guest.email}</span>
          </div>
          {guest.phone && (
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Phone className="text-amber-600" size={18} />
              <span>{guest.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <MapPin className="text-amber-600" size={18} />
            <span>{guest.address.city}, {guest.address.country}</span>
          </div>
          {guest.address.kebele && (
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Home className="text-amber-600" size={18} />
              <span>Kebele {guest.address.kebele}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <Calendar className="text-amber-600" size={18} />
            <span>Registered: {new Date(guest.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}