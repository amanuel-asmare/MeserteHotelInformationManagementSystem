/*'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Upload, ArrowLeft } from 'lucide-react';
import BackButton from '@/app/manager/ui/BackButton';
const registerSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be 6+ chars'),
  phone: z.string().optional(),
  country: z.string().default('Ethiopia'),
  city: z.string().min(2, 'City required'),
  kebele: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onClose: () => void;
}

export default function RegisterForm({ onClose }: RegisterFormProps) {
  const [preview, setPreview] = useState('/default-avatar.png');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    const formData = new FormData();
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('email', data.email);
    formData.append('password', data.password);
    if (data.phone) formData.append('phone', data.phone);
    formData.append('country', data.country);
    formData.append('city', data.city);
    if (data.kebele) formData.append('kebele', data.kebele);
    if (imageFile) formData.append('profileImage', imageFile);

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? 'Registration failed');

      alert('Registration successful! Please login.');
      onClose();
    } catch (err: any) {
      alert(err.message || 'Registration failed');
    }
  };

  return (
    <Modal
      title="Customer Registration"
      onClose={onClose}
      className="mt-16 md:mt-20 max-h-[90vh] overflow-hidden" // Modal height limit
    >
      {/* Scrollable Form Container 
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 overflow-y-auto px-1 pb-20 md:pb-6" // Scroll + padding for buttons
        style={{ maxHeight: 'calc(90vh - 140px)' }} // Leave space for header + buttons
      >
        {/* Profile Image 
        <div className="flex justify-center">
          <label className="relative cursor-pointer group">
            <img
              src={preview}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-300 shadow-md"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Upload className="text-white" size={24} />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Name Fields 
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            placeholder="Abebe"
            {...register('firstName')}
            error={errors.firstName?.message}
          />
          <Input
            label="Last Name"
            type="text"
            placeholder="Kebede"
            {...register('lastName')}
            error={errors.lastName?.message}
          />
        </div>

        <Input
          label="Email"
          type="email"
          placeholder="abebe@meseret.com"
          {...register('email')}
          error={errors.email?.message}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          error={errors.password?.message}
        />

        <Input
          label="Phone (Optional)"
          type="tel"
          placeholder="+251911223344"
          {...register('phone')}
          error={errors.phone?.message}
        />

        {/* Address Fields 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Country"
            type="text"
            value="Ethiopia"
            disabled
            {...register('country')}
          />
          <Input
            label="City"
            type="text"
            placeholder="Addis Ababa"
            {...register('city')}
            error={errors.city?.message}
          />
          <Input
            label="Kebele (Optional)"
            type="text"
            placeholder="12"
            {...register('kebele')}
            error={errors.kebele?.message}
          />
        </div>
      </form>

      {/* Fixed Button Bar at Bottom 
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 px-6 -mx-6 -mb-6 bg-gray-50 dark:bg-gray-800">
        <BackButton/>

        <Button
          type="submit"
          loading={isSubmitting}
          onClick={handleSubmit(onSubmit)}
          className="min-w-[140px]"
        >
          Create Account
        </Button>
      </div>
    </Modal>
  );
}*/
// src/components/RegisterForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Upload, ArrowLeft } from 'lucide-react';
import BackButton from '@/app/manager/ui/BackButton';
const registerSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be 6+ chars'),
  phone: z.string().optional(),
  country: z.string().default('Ethiopia'),
  city: z.string().min(2, 'City required'),
  kebele: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onClose: () => void;
  forceRole?: 'customer';
}

export default function RegisterForm({ onClose, forceRole }: RegisterFormProps) {
  const [preview, setPreview] = useState('/default-avatar.png');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, value);
    });
    if (imageFile) formData.append('profileImage', imageFile);
    if (forceRole) formData.append('role', forceRole);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? 'Registration failed');
      alert('Guest registered successfully!');
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to register');
    }
  };

  return (
    <Modal
      title={forceRole ? 'Add New Guest' : 'Customer Registration'}
      onClose={onClose}
      className="mt-16 md:mt-20 max-h-[90vh] overflow-hidden"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 overflow-y-auto px-1 pb-20"
        style={{ maxHeight: 'calc(90vh - 140px)' }}
      >
        <div className="flex justify-center">
          <label className="relative cursor-pointer group">
            <img
              src={preview}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-300 shadow-md"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Upload className="text-white" size={24} />
            </div>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="First Name" placeholder="Abebe" {...register('firstName')} error={errors.firstName?.message} />
          <Input label="Last Name" placeholder="Kebede" {...register('lastName')} error={errors.lastName?.message} />
        </div>

        <Input label="Email" type="email" placeholder="abebe@meseret.com" {...register('email')} error={errors.email?.message} />
        <Input label="Password" type="password" placeholder="••••••••" {...register('password')} error={errors.password?.message} />
        <Input label="Phone (Optional)" type="tel" placeholder="+251911223344" {...register('phone')} error={errors.phone?.message} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Country" value="Ethiopia" disabled {...register('country')} />
          <Input label="City" placeholder="Addis Ababa" {...register('city')} error={errors.city?.message} />
          <Input label="Kebele (Optional)" placeholder="12" {...register('kebele')} error={errors.kebele?.message} />
        </div>
      </form>

      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 px-6 -mx-6 -mb-6 bg-gray-50 dark:bg-gray-800">
       <BackButton/>
        <Button type="submit" loading={isSubmitting} onClick={handleSubmit(onSubmit)} className="min-w-[140px]">
          {forceRole ? 'Add Guest' : 'Create Account'}
        </Button>
      </div>
    </Modal>
  );
}