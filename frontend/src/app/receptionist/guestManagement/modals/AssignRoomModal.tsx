// src/app/receptionist/guestManagement/modals/AssignRoomModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Calendar, Users, DollarSign, CreditCard, X } from 'lucide-react';
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
   * ------------------------------------------------------------- */
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
   * ------------------------------------------------------------- */
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
   * ------------------------------------------------------------- */
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
            {/* Guest */}
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

            {/* Dates */}
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

            {/* Guests */}
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

            {/* Payment */}
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

            {/* Total */}
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
}