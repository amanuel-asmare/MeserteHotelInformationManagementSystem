'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password too short'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onClose: () => void;
}

export default function LoginForm({ onClose }: LoginFormProps) {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // src/components/LoginForm.tsx
const onSubmit = async (data: LoginFormData) => {
  try {
    await login(data.email, data.password);
    onClose();
  } catch (err: any) {
    const msg = err.message;
    if (msg.includes('deactivated')) {
      alert('Your account is deactivated. Please contact admin.');
    } else {
      alert(msg || 'Invalid credentials');
    }
  }
};

  return (
    <Modal title="Login" onClose={onClose} className="mt-20 md:mt-24">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        <Button type="submit" loading={isSubmitting} className="w-full">
          Login
        </Button>
      </form>
    </Modal>
  );
}
/*'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../context/AuthContext';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type Form = z.infer<typeof schema>;

export default function LoginForm({ onClose }: { onClose: () => void }) {
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (d: Form) => {
    try {
      await login(d.email, d.password);
      onClose();               // modal closes – redirect is handled in AuthProvider
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-2xl font-bold">Login</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            {...register('email')}
            placeholder="email"
            className="w-full rounded border p-2"
          />
          {errors.email && <p className="text-red-600">{errors.email.message}</p>}

          <input
            {...register('password')}
            type="password"
            placeholder="password"
            className="w-full rounded border p-2"
          />
          {errors.password && <p className="text-red-600">{errors.password.message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded bg-amber-600 py-2 text-white hover:bg-amber-700"
          >
            {isSubmitting ? 'Logging in…' : 'Login'}
          </button>
        </form>
        <button
          onClick={onClose}
          className="mt-4 w-full text-center text-sm text-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}*//*// src/components/forms/LoginForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onClose: () => void;
}

export default function LoginForm({ onClose }: LoginFormProps) {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      onClose();
      // Redirect handled in Navbar or page
    } catch (err: any) {
      alert(err.message || 'Login failed');
    }
  };

  return (
    <Modal title="Login" onClose={onClose} className="mt-20 md:mt-24">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="admin@meseret.com"
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
        <Button type="submit" loading={isSubmitting} className="w-full">
          Login
        </Button>
      </form>
    </Modal>
  );
}*/