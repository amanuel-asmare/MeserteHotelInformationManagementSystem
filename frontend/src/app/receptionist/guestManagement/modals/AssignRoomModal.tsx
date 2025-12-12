'use client';

import { Modal } from 'react-native';
import { useState, useEffect, useRef } from 'react';


import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Users, DollarSign, CreditCard, X, 
  KeyRound, UserCheck, Luggage, ScanLine, CheckCircle 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import ReactCanvasConfetti from 'react-canvas-confetti';

// UI Components
import { Button } from '../../../../../components/ui/receptionistUI/button';
import { Input } from '../../../../../components/ui/receptionistUI/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../components/ui/receptionistUI/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../../../components/ui/receptionistUI/dialog';
import { useLanguage } from '../../../../../context/LanguageContext'; // Import Language Hook

const assignSchema = z.object({
  customerId: z.string().min(1, 'Select a guest'),
  checkIn: z.string().min(1, 'Check-in required'),
  checkOut: z.string().min(1, 'Check-out required'),
  guests: z.coerce.number().min(1, 'Min 1 guest'),
  paymentType: z.enum(['cash', 'chapa']),
});

type AssignFormData = z.infer<typeof assignSchema>;

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Room {
  _id: string;
  roomNumber: string;
  price: number;
  capacity: number;
  availability: boolean;
}

interface Props {
  room: Room | null;
  onClose: () => void;
  onSuccess: () => void;
}

// --- SUCCESS MODAL COMPONENT ---
const SuccessModal = ({ message, onClose }: { message: string, onClose: () => void }) => {
  const { t } = useLanguage();
  const refAnimationInstance = useRef<any>(null);

  // FIX: Destructure 'confetti' instead of just passing instance directly (v2+ API change)
  const getInstance = ({ confetti }: { confetti: any }) => {
    refAnimationInstance.current = confetti;
  };

  const makeShot = (particleRatio: number, opts: any) => {
    if (refAnimationInstance.current) {
      refAnimationInstance.current({
        ...opts,
        origin: { y: 0.7 },
        particleCount: Math.floor(200 * particleRatio),
      });
    }
  };

  useEffect(() => {
    const fire = () => {
      makeShot(0.25, { spread: 26, startVelocity: 55 });
      makeShot(0.2, { spread: 60 });
      makeShot(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      makeShot(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      makeShot(0.1, { spread: 120, startVelocity: 45 });
    };
    fire();
    // Fire more confetti every 2 seconds
    const interval = setInterval(fire, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      {/* Confetti Layer */}
      <ReactCanvasConfetti
        // FIX: Changed from refConfetti to onInit for v2 compatibility
        onInit={getInstance}
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          zIndex: 100,
        }}
      />
      
      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.5, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.5, y: 100 }}
        className="bg-white rounded-3xl p-10 shadow-2xl text-center max-w-sm w-full border-4 border-amber-400 relative z-[101]"
      >
        {/* X Close Button */}
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose(); 
          }}
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
        >
          <X size={20} />
        </button>

        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="text-green-600 w-12 h-12" />
        </motion.div>
        
        <h2 className="text-3xl font-black text-gray-800 mb-2">{t('success')}</h2>
        <p className="text-gray-600 mb-8 text-lg">{message}</p>
        
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose(); 
          }}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition transform"
        >
          {t('done')}
        </button>
      </motion.div>
    </motion.div>
  );
};

export default function AssignRoomModal({ room, onClose, onSuccess }: Props) {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  // FIX: Removed explicit <AssignFormData> generic to allow auto-inference and fix type error
  } = useForm({
    resolver: zodResolver(assignSchema),
  });

  const watchCheckIn = watch('checkIn');
  const watchCheckOut = watch('checkOut');

  // Fetch Customers when modal opens
  useEffect(() => {
    if (!room) {
      setLoading(false);
      return;
    }

    const fetchCustomers = async () => {
      setLoading(true);
      try {
        // Artificial delay for the Royal Loading Animation
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
          { withCredentials: true }
        );
        const customerList = res.data.filter((u: any) => u.role === 'customer');
        setCustomers(customerList);
      } catch {
        alert('Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [room]);

  // Calculate Price
  useEffect(() => {
    if (watchCheckIn && watchCheckOut && room) {
      const nights = Math.max(
        1,
        Math.ceil(
          (new Date(watchCheckOut).getTime() - new Date(watchCheckIn).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );
      setTotalPrice(room.price * nights);
    }
  }, [watchCheckIn, watchCheckOut, room]);

  // Form Submit
  const onSubmit = async (data: AssignFormData) => {
    if (!room) return;
    setSubmitting(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/receptionist`,
        {
          roomId: room._id,
          userId: data.customerId,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          guests: data.guests,
          paymentType: data.paymentType,
        },
        { withCredentials: true }
      );

      if (data.paymentType === 'chapa' && res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else {
        // Show Success Modal for Cash Payments
        setSuccessMessage(`${t('room')} ${room.roomNumber} ${t('updateSuccessfully').replace('Updated', 'Assigned')}!`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Assignment failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Logic to close Success Modal and refresh page data
  const handleSuccessClose = () => {
    setSuccessMessage(null); // Remove modal from DOM
    onSuccess();             // Tell parent component to refresh room list
    onClose();               // Close the AssignRoom Dialog
    router.refresh();        // Ensure Next.js revalidates data
  };

  if (!room) return null;

  return (
    <>
      {/* Main Assign Dialog */}
      <Dialog open={!!room} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="sm:max-w-md bg-white rounded-xl overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {t('assignRoom')} <span className="text-amber-600">#{room.roomNumber}</span>
            </DialogTitle>
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100 transition"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </DialogHeader>

          {loading ? (
            // --- ROYAL LOADING SCREEN ---
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
               <motion.div 
                 animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full blur-3xl"
               />
               <div className="relative z-10">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white p-4 rounded-2xl shadow-xl border border-amber-200 relative"
                  >
                     <div className="w-32 h-20 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-inner relative overflow-hidden">
                        <KeyRound size={32} />
                        <div className="absolute bottom-2 left-3 text-[10px] font-mono opacity-80">{t('vipAccess')}</div>
                        <motion.div 
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          className="absolute top-0 left-0 w-1/3 h-full bg-white/30 blur-md skew-x-12"
                        />
                     </div>
                  </motion.div>
                  <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -top-4 -right-4 bg-blue-100 p-2 rounded-full text-blue-600 shadow-sm"><UserCheck size={20} /></motion.div>
                  <motion.div animate={{ y: [5, -5, 5] }} transition={{ duration: 2.5, repeat: Infinity }} className="absolute -bottom-2 -left-4 bg-green-100 p-2 rounded-full text-green-600 shadow-sm"><Luggage size={20} /></motion.div>
               </div>
               <div className="relative z-10">
                  <h3 className="text-lg font-bold text-gray-800">{t('retrievingGuestList')}</h3>
                  <p className="text-sm text-gray-500 flex items-center justify-center gap-2 mt-1"><ScanLine size={14} className="animate-pulse text-amber-600"/> {t('syncingDatabase')}</p>
               </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-2">
              {/* Guest */}
              <div>
                <label className="text-sm font-medium text-gray-700">{t('guest')}</label>
                <Select onValueChange={(v) => setValue('customerId', v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('choose')} />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.firstName} {c.lastName} ({c.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.customerId && (
                  <p className="text-red-500 text-xs mt-1">{errors.customerId.message}</p>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium flex items-center gap-1 text-gray-700">
                    <Calendar className="h-4 w-4 text-gray-500" /> {t('checkInLabel')}
                  </label>
                  <Input type="date" {...register('checkIn')} className="w-full" />
                  {errors.checkIn && (
                    <p className="text-red-500 text-xs mt-1">{errors.checkIn.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium flex items-center gap-1 text-gray-700">
                    <Calendar className="h-4 w-4 text-gray-500" /> {t('checkOutLabel')}
                  </label>
                  <Input type="date" {...register('checkOut')} className="w-full" />
                  {errors.checkOut && (
                    <p className="text-red-500 text-xs mt-1">{errors.checkOut.message}</p>
                  )}
                </div>
              </div>

              {/* Guests */}
              <div>
                <label className="text-sm font-medium flex items-center gap-1 text-gray-700">
                  <Users className="h-4 w-4 text-gray-500" /> {t('guestsLabel')}
                </label>
                <Input
                  type="number"
                  min="1"
                  max={room.capacity}
                  {...register('guests')}
                  placeholder={`${t('max')} ${room.capacity}`}
                  className="w-full"
                />
                {errors.guests && (
                  <p className="text-red-500 text-xs mt-1">{errors.guests.message}</p>
                )}
              </div>

              {/* Payment */}
              <div>
                <label className="text-sm font-medium text-gray-700">{t('paymentMethod')}</label>
                <Select
                  onValueChange={(v) =>
                    setValue('paymentType', v as 'cash' | 'chapa')
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('choose')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" /> {t('cashPayment')}
                      </div>
                    </SelectItem>
                    <SelectItem value="chapa">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-blue-600" /> {t('chapaOnline')}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Total */}
              {watchCheckIn && watchCheckOut && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm shadow-sm"
                >
                  <div className="flex justify-between font-bold text-lg text-amber-900">
                    <span className="flex items-center gap-1 text-sm font-normal">
                      {t('totalPrice')}
                    </span>
                    <span>ETB {totalPrice.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-amber-700 mt-1 text-right">
                    {Math.max(
                      1,
                      Math.ceil(
                        (new Date(watchCheckOut).getTime() -
                          new Date(watchCheckIn).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    )}{' '}
                    {t('night')}
                    {totalPrice / room.price > 1 ? 's' : ''} × ETB {room.price}
                  </p>
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                {submitting ? t('processing') : t('confirmAssignment')}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* SUCCESS OVERLAY (Rendered Outside Dialog to be visible) */}
      <AnimatePresence>
        {successMessage && (
          <SuccessModal 
            message={successMessage} 
            onClose={handleSuccessClose} 
          />
        )}
      </AnimatePresence>
    </>
  );
}/*'use client';

import { Modal } from 'react-native';
import { useState, useEffect, useRef } from 'react';


import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Users, DollarSign, CreditCard, X, 
  KeyRound, UserCheck, Luggage, ScanLine, CheckCircle 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import ReactCanvasConfetti from 'react-canvas-confetti';

// UI Components
import { Button } from '../../../../../components/ui/receptionistUI/button';
import { Input } from '../../../../../components/ui/receptionistUI/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../components/ui/receptionistUI/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../../../components/ui/receptionistUI/dialog';
import { useLanguage } from '../../../../../context/LanguageContext'; // Import Language Hook

const assignSchema = z.object({
  customerId: z.string().min(1, 'Select a guest'),
  checkIn: z.string().min(1, 'Check-in required'),
  checkOut: z.string().min(1, 'Check-out required'),
  guests: z.coerce.number().min(1, 'Min 1 guest'),
  paymentType: z.enum(['cash', 'chapa']),
});

type AssignFormData = z.infer<typeof assignSchema>;

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Room {
  _id: string;
  roomNumber: string;
  price: number;
  capacity: number;
  availability: boolean;
}

interface Props {
  room: Room | null;
  onClose: () => void;
  onSuccess: () => void;
}

// --- SUCCESS MODAL COMPONENT ---
const SuccessModal = ({ message, onClose }: { message: string, onClose: () => void }) => {
  const { t } = useLanguage();
  const refAnimationInstance = useRef<any>(null);

  const getInstance = (instance: any) => {
    refAnimationInstance.current = instance;
  };

  const makeShot = (particleRatio: number, opts: any) => {
    if (refAnimationInstance.current) {
      refAnimationInstance.current({
        ...opts,
        origin: { y: 0.7 },
        particleCount: Math.floor(200 * particleRatio),
      });
    }
  };

  useEffect(() => {
    const fire = () => {
      makeShot(0.25, { spread: 26, startVelocity: 55 });
      makeShot(0.2, { spread: 60 });
      makeShot(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      makeShot(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      makeShot(0.1, { spread: 120, startVelocity: 45 });
    };
    fire();
    // Fire more confetti every 2 seconds
    const interval = setInterval(fire, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >

      <ReactCanvasConfetti
        refConfetti={getInstance}
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          zIndex: 100,
        }}
      />
      
   
      <motion.div
        initial={{ scale: 0.5, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.5, y: 100 }}
        className="bg-white rounded-3xl p-10 shadow-2xl text-center max-w-sm w-full border-4 border-amber-400 relative z-[101]"
      >
  
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose(); 
          }}
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
        >
          <X size={20} />
        </button>

        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="text-green-600 w-12 h-12" />
        </motion.div>
        
        <h2 className="text-3xl font-black text-gray-800 mb-2">{t('success')}</h2>
        <p className="text-gray-600 mb-8 text-lg">{message}</p>
        
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose(); 
          }}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition transform"
        >
          {t('done')}
        </button>
      </motion.div>
    </motion.div>
  );
};

export default function AssignRoomModal({ room, onClose, onSuccess }: Props) {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AssignFormData>({
    resolver: zodResolver(assignSchema),
  });

  const watchCheckIn = watch('checkIn');
  const watchCheckOut = watch('checkOut');

  // Fetch Customers when modal opens
  useEffect(() => {
    if (!room) {
      setLoading(false);
      return;
    }

    const fetchCustomers = async () => {
      setLoading(true);
      try {
        // Artificial delay for the Royal Loading Animation
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
          { withCredentials: true }
        );
        const customerList = res.data.filter((u: any) => u.role === 'customer');
        setCustomers(customerList);
      } catch {
        alert('Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [room]);

  // Calculate Price
  useEffect(() => {
    if (watchCheckIn && watchCheckOut && room) {
      const nights = Math.max(
        1,
        Math.ceil(
          (new Date(watchCheckOut).getTime() - new Date(watchCheckIn).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );
      setTotalPrice(room.price * nights);
    }
  }, [watchCheckIn, watchCheckOut, room]);

  // Form Submit
  const onSubmit = async (data: AssignFormData) => {
    if (!room) return;
    setSubmitting(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/receptionist`,
        {
          roomId: room._id,
          userId: data.customerId,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          guests: data.guests,
          paymentType: data.paymentType,
        },
        { withCredentials: true }
      );

      if (data.paymentType === 'chapa' && res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else {
        // Show Success Modal for Cash Payments
        setSuccessMessage(`${t('room')} ${room.roomNumber} ${t('updateSuccessfully').replace('Updated', 'Assigned')}!`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Assignment failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Logic to close Success Modal and refresh page data
  const handleSuccessClose = () => {
    setSuccessMessage(null); // Remove modal from DOM
    onSuccess();             // Tell parent component to refresh room list
    onClose();               // Close the AssignRoom Dialog
    router.refresh();        // Ensure Next.js revalidates data
  };

  if (!room) return null;

  return (
    <>
    
      <Dialog open={!!room} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="sm:max-w-md bg-white rounded-xl overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {t('assignRoom')} <span className="text-amber-600">#{room.roomNumber}</span>
            </DialogTitle>
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100 transition"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </DialogHeader>

          {loading ? (
            // --- ROYAL LOADING SCREEN ---
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
               <motion.div 
                 animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full blur-3xl"
               />
               <div className="relative z-10">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white p-4 rounded-2xl shadow-xl border border-amber-200 relative"
                  >
                     <div className="w-32 h-20 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-inner relative overflow-hidden">
                        <KeyRound size={32} />
                        <div className="absolute bottom-2 left-3 text-[10px] font-mono opacity-80">{t('vipAccess')}</div>
                        <motion.div 
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          className="absolute top-0 left-0 w-1/3 h-full bg-white/30 blur-md skew-x-12"
                        />
                     </div>
                  </motion.div>
                  <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -top-4 -right-4 bg-blue-100 p-2 rounded-full text-blue-600 shadow-sm"><UserCheck size={20} /></motion.div>
                  <motion.div animate={{ y: [5, -5, 5] }} transition={{ duration: 2.5, repeat: Infinity }} className="absolute -bottom-2 -left-4 bg-green-100 p-2 rounded-full text-green-600 shadow-sm"><Luggage size={20} /></motion.div>
               </div>
               <div className="relative z-10">
                  <h3 className="text-lg font-bold text-gray-800">{t('retrievingGuestList')}</h3>
                  <p className="text-sm text-gray-500 flex items-center justify-center gap-2 mt-1"><ScanLine size={14} className="animate-pulse text-amber-600"/> {t('syncingDatabase')}</p>
               </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-2">
             
              <div>
                <label className="text-sm font-medium text-gray-700">{t('guest')}</label>
                <Select onValueChange={(v) => setValue('customerId', v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('choose')} />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.firstName} {c.lastName} ({c.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.customerId && (
                  <p className="text-red-500 text-xs mt-1">{errors.customerId.message}</p>
                )}
              </div>

            
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium flex items-center gap-1 text-gray-700">
                    <Calendar className="h-4 w-4 text-gray-500" /> {t('checkInLabel')}
                  </label>
                  <Input type="date" {...register('checkIn')} className="w-full" />
                  {errors.checkIn && (
                    <p className="text-red-500 text-xs mt-1">{errors.checkIn.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium flex items-center gap-1 text-gray-700">
                    <Calendar className="h-4 w-4 text-gray-500" /> {t('checkOutLabel')}
                  </label>
                  <Input type="date" {...register('checkOut')} className="w-full" />
                  {errors.checkOut && (
                    <p className="text-red-500 text-xs mt-1">{errors.checkOut.message}</p>
                  )}
                </div>
              </div>

            
              <div>
                <label className="text-sm font-medium flex items-center gap-1 text-gray-700">
                  <Users className="h-4 w-4 text-gray-500" /> {t('guestsLabel')}
                </label>
                <Input
                  type="number"
                  min="1"
                  max={room.capacity}
                  {...register('guests')}
                  placeholder={`${t('max')} ${room.capacity}`}
                  className="w-full"
                />
                {errors.guests && (
                  <p className="text-red-500 text-xs mt-1">{errors.guests.message}</p>
                )}
              </div>

            
              <div>
                <label className="text-sm font-medium text-gray-700">{t('paymentMethod')}</label>
                <Select
                  onValueChange={(v) =>
                    setValue('paymentType', v as 'cash' | 'chapa')
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('choose')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" /> {t('cashPayment')}
                      </div>
                    </SelectItem>
                    <SelectItem value="chapa">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-blue-600" /> {t('chapaOnline')}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

             
              {watchCheckIn && watchCheckOut && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm shadow-sm"
                >
                  <div className="flex justify-between font-bold text-lg text-amber-900">
                    <span className="flex items-center gap-1 text-sm font-normal">
                      {t('totalPrice')}
                    </span>
                    <span>ETB {totalPrice.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-amber-700 mt-1 text-right">
                    {Math.max(
                      1,
                      Math.ceil(
                        (new Date(watchCheckOut).getTime() -
                          new Date(watchCheckIn).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    )}{' '}
                    {t('night')}
                    {totalPrice / room.price > 1 ? 's' : ''} × ETB {room.price}
                  </p>
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                {submitting ? t('processing') : t('confirmAssignment')}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      
      <AnimatePresence>
        {successMessage && (
          <SuccessModal 
            message={successMessage} 
            onClose={handleSuccessClose} 
          />
        )}
      </AnimatePresence>
    </>
  );
}*/





/*// src/app/receptionist/guestManagement/modals/AssignRoomModal.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Calendar, Users, DollarSign, CreditCard, X, KeyRound, UserCheck, Luggage, ScanLine  } from 'lucide-react';
import { Button } from '../../../../../components/ui/receptionistUI/button';
import { Input } from '../../../../../components/ui/receptionistUI/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../components/ui/receptionistUI/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../../../components/ui/receptionistUI/dialog';
import axios from 'axios';

const assignSchema = z.object({
  customerId: z.string().min(1, 'Select a guest'),
  checkIn: z.string().min(1, 'Check-in required'),
  checkOut: z.string().min(1, 'Check-out required'),
  guests: z.coerce.number().min(1, 'Min 1 guest'),
  paymentType: z.enum(['cash', 'chapa']),
});

type AssignFormData = z.infer<typeof assignSchema>;

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Room {
  _id: string;
  roomNumber: string;
  price: number;
  capacity: number;
  availability: boolean;
}

interface Props {
  room: Room | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignRoomModal({ room, onClose, onSuccess }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AssignFormData>({
    resolver: zodResolver(assignSchema),
  });

  const watchCheckIn = watch('checkIn');
  const watchCheckOut = watch('checkOut');

  /* -------------------------------------------------------------
   *  Load customers **only when the modal opens** (room !== null)
   *  Use same endpoint as GuestAll.tsx
   * ------------------------------------------------------------- /
  useEffect(() => {
    if (!room) {
      setLoading(false);
      return;
    }

    const fetchCustomers = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
          { withCredentials: true }
        );
        const customerList = res.data.filter((u: any) => u.role === 'customer');
        setCustomers(customerList);
      } catch {
        alert('Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [room]);

  /* -------------------------------------------------------------
   *  Calculate total price
   * ------------------------------------------------------------- /
  useEffect(() => {
    if (watchCheckIn && watchCheckOut && room) {
      const nights = Math.max(
        1,
        Math.ceil(
          (new Date(watchCheckOut).getTime() - new Date(watchCheckIn).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );
      setTotalPrice(room.price * nights);
    }
  }, [watchCheckIn, watchCheckOut, room]);

  /* -------------------------------------------------------------
   *  Submit – create booking for the selected customer
   * ------------------------------------------------------------- /
  const onSubmit = async (data: AssignFormData) => {
    if (!room) return;
    setSubmitting(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/receptionist`,
        {
          roomId: room._id,
          userId: data.customerId,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          guests: data.guests,
          paymentType: data.paymentType,
        },
        { withCredentials: true }
      );

      if (data.paymentType === 'chapa' && res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else {
        alert(`Room ${room.roomNumber} assigned & paid in cash!`);
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Assignment failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!room) return null;

  return (
    <Dialog open={!!room} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            Assign Room <span className="text-amber-600">#{room.roomNumber}</span>
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        {loading ? (
          <p className="text-center py-8">Loading guests...</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Guest /}
            <div>
              <label className="text-sm font-medium">Guest</label>
              <Select onValueChange={(v) => setValue('customerId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select guest..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.firstName} {c.lastName} ({c.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.customerId && (
                <p className="text-red-500 text-xs mt-1">{errors.customerId.message}</p>
              )}
            </div>

            {/* Dates /}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> Check-in
                </label>
                <Input type="date" {...register('checkIn')} />
                {errors.checkIn && (
                  <p className="text-red-500 text-xs mt-1">{errors.checkIn.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> Check-out
                </label>
                <Input type="date" {...register('checkOut')} />
                {errors.checkOut && (
                  <p className="text-red-500 text-xs mt-1">{errors.checkOut.message}</p>
                )}
              </div>
            </div>

            {/* Guests /}
            <div>
              <label className="text-sm font-medium flex items-center gap-1">
                <Users className="h-4 w-4" /> Guests
              </label>
              <Input
                type="number"
                min="1"
                max={room.capacity}
                {...register('guests')}
                placeholder={`Max ${room.capacity}`}
              />
              {errors.guests && (
                <p className="text-red-500 text-xs mt-1">{errors.guests.message}</p>
              )}
            </div>

            {/* Payment /}
            <div>
              <label className="text-sm font-medium">Payment</label>
              <Select
                onValueChange={(v) =>
                  setValue('paymentType', v as 'cash' | 'chapa')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" /> Cash
                    </div>
                  </SelectItem>
                  <SelectItem value="chapa">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> Chapa
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Total /}
            {watchCheckIn && watchCheckOut && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm"
              >
                <div className="flex justify-between font-semibold text-amber-800">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" /> Total
                  </span>
                  <span>ETB {totalPrice.toLocaleString()}</span>
                </div>
                <p className="text-xs text-amber-600 mt-1">
                  {Math.max(
                    1,
                    Math.ceil(
                      (new Date(watchCheckOut).getTime() -
                        new Date(watchCheckIn).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  )}{' '}
                  night
                  {totalPrice / room.price > 1 ? 's' : ''} × ETB {room.price}
                </p>
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              {submitting ? 'Assigning...' : 'Assign Room'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}*/