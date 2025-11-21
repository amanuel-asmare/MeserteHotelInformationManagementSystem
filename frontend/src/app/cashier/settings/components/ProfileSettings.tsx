import React from 'react'
import Setting from '../../../admin/settings/page'
function ProfileSettings() {
  return (
    <div><Setting/></div>
  )
}

export default ProfileSettings
/*'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../../../../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../../../../lib/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const profileSchema = z.object({
    firstName: z.string().min(2, 'First name is too short'),
    lastName: z.string().min(2, 'Last name is too short'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    profileImage: z.any().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const SettingsCard = ({ title, description, children, footer }) => (
    <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <div className="p-6">{children}</div>
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end">
            {footer}
        </div>
    </div>
);

export default function ProfileSettings() {
    // ✅ FIX #1: Use `updateUser` from the context, as shown in your working example.
    const { user, updateUser } = useAuth();
    const [previewUrl, setPreviewUrl] = useState(user?.profileImage || '');
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
    });

    useEffect(() => {
        if (user) {
            reset({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
            });
            setPreviewUrl(user.profileImage);
        }
    }, [user, reset]);

    const onSubmit = async (data: ProfileFormData) => {
        const formData = new FormData();
        formData.append('firstName', data.firstName);
        formData.append('lastName', data.lastName);
        formData.append('email', data.email);
        if (data.phone) formData.append('phone', data.phone);
        if (data.profileImage && data.profileImage[0]) {
            formData.append('profileImage', data.profileImage[0]);
        }
        
        const promise = api.put('/api/users/me', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        await toast.promise(promise, {
            loading: 'Updating profile...',
            success: 'Profile updated successfully!',
            error: (err) => err.response?.data?.message || 'Update failed.',
        });
        
        try {
            const response = await promise;
            if (response.data) {
                // ✅ FIX #2: Call `updateUser` with the new data from the API.
                // This will correctly update the global state and re-render the header.
                updateUser(response.data);
            }
        } catch (error) {
            // Error is already handled by toast.promise
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <SettingsCard
                title="Personal Information"
                description="Update your photo and personal details here."
                footer={
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md disabled:bg-indigo-300">
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                }
            >
                <div className="space-y-4">
                    {/* Profile Picture /}
                    <div className="flex items-center gap-4">
                         <img src={previewUrl || '/default-avatar.png'} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
                         <label htmlFor="profileImage" className="cursor-pointer px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50">
                            Change Photo
                         </label>
                         <input id="profileImage" type="file" {...register('profileImage')} className="hidden" onChange={(e) => {
                             if(e.target.files && e.target.files[0]) setPreviewUrl(URL.createObjectURL(e.target.files[0]));
                         }}/>
                    </div>
                    {/* Form Fields /}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <input {...register('firstName')} placeholder="First Name" className="p-2 border rounded-md" />
                       <input {...register('lastName')} placeholder="Last Name" className="p-2 border rounded-md" />
                       <input {...register('email')} placeholder="Email" className="p-2 border rounded-md md:col-span-2" />
                       <input {...register('phone')} placeholder="Phone Number (Optional)" className="p-2 border rounded-md md:col-span-2" />
                    </div>
                </div>
            </SettingsCard>
        </form>
    );
}*/