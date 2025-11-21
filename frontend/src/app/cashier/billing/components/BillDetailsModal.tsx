'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../../lib/api';
import { X, Plus, Trash2, Hotel, Utensils, DollarSign, CreditCard } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function BillDetailsModal({ billId, onClose, onCheckoutSuccess }) {
    const [bill, setBill] = useState(null);
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddingCharge, setIsAddingCharge] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const { register, handleSubmit, reset } = useForm();
    
    useEffect(() => {
        const fetchDetails = async () => {
            if (!billId) return;
            setLoading(true);
            try {
                const { data } = await api.get(`/api/billing/${billId}`);
                setBill(data.invoice);
                setFoodItems(data.foodLineItems);
            } catch (error) {
                console.error("Failed to fetch bill details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [billId]);

    const handleAddCharge = async (data) => {
        try {
            const res = await api.post(`/api/billing/${billId}/items`, {
                description: data.description,
                quantity: parseInt(data.quantity, 10),
                unitPrice: parseFloat(data.price)
            });
            setBill(res.data);
            reset();
            setIsAddingCharge(false);
        } catch (error) {
            alert("Failed to add charge.");
        }
    };

    const handleCheckout = async (paymentMethod) => {
        try {
            await api.post(`/api/billing/checkout/${billId}`, { paymentMethod });
            alert("Checkout successful!");
            onCheckoutSuccess(); // This will refetch all data on the main page
            onClose();
        } catch(error) {
            alert(error.response?.data?.message || "Checkout failed.");
        }
    };

    if (loading || !bill) return <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><p className="text-white">Loading Bill...</p></div>;
    
    const combinedLineItems = [...bill.lineItems, ...foodItems];
    const subtotal = combinedLineItems.reduce((acc, item) => acc + item.total, 0);
    const tax = subtotal * 0.15;
    const total = subtotal + tax;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }} className="bg-gray-50 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Bill for {bill.booking.user.firstName} {bill.booking.user.lastName}</h2>
                        <p className="text-sm text-gray-500">Room {bill.room.roomNumber}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><X size={20} /></button>
                </header>

                <main className="p-6 overflow-y-auto flex-1">
                    <div className="space-y-3">
                        {combinedLineItems.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-gray-100">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gray-200 rounded-full">{item.isFood ? <Utensils size={16}/> : <Hotel size={16} />}</div>
                                    <div>
                                        <p className="font-medium text-gray-700">{item.description}</p>
                                        <p className="text-xs text-gray-500">{item.quantity} x ETB {item.unitPrice.toFixed(2)}</p>
                                    </div>
                                </div>
                                <p className="font-semibold text-gray-800">ETB {item.total.toFixed(2)}</p>
                            </div>
                        ))}
                    </div>

                    {isAddingCharge && (
                        <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={handleSubmit(handleAddCharge)} className="mt-4 p-4 border rounded-lg bg-white space-y-2">
                             <input {...register("description")} placeholder="Description (e.g., Laundry Service)" className="w-full p-2 border rounded" required />
                             <div className="flex space-x-2">
                                <input {...register("quantity")} type="number" placeholder="Qty" className="w-1/3 p-2 border rounded" required />
                                <input {...register("price")} type="number" step="0.01" placeholder="Unit Price" className="w-2/3 p-2 border rounded" required />
                             </div>
                             <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setIsAddingCharge(false)} className="px-3 py-1 text-sm bg-gray-200 rounded">Cancel</button>
                                <button type="submit" className="px-3 py-1 text-sm bg-indigo-600 text-white rounded">Add</button>
                             </div>
                        </motion.form>
                    )}
                </main>

                <footer className="p-4 border-t bg-white rounded-b-lg">
                    <div className="space-y-1 text-sm mb-4">
                        <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-medium">ETB {subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Tax (15%)</span><span className="font-medium">ETB {tax.toFixed(2)}</span></div>
                        <div className="flex justify-between text-lg font-bold"><span className="text-gray-800">Total Due</span><span>ETB {total.toFixed(2)}</span></div>
                    </div>
                    {isCheckingOut ? (
                         <div className="text-center">
                            <p className="font-semibold mb-2">Select Payment Method:</p>
                             <div className="flex gap-4">
                                <button onClick={() => handleCheckout('cash')} className="flex-1 p-3 bg-green-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-green-600"><DollarSign size={18}/>Pay with Cash</button>
                                <button onClick={() => handleCheckout('card')} className="flex-1 p-3 bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600"><CreditCard size={18}/>Pay with Card</button>
                             </div>
                         </div>
                    ) : (
                         <div className="flex gap-4">
                            <button onClick={() => setIsAddingCharge(true)} className="flex-1 p-3 bg-gray-200 text-gray-800 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-300"><Plus size={18}/>Add Charge</button>
                            <button onClick={() => setIsCheckingOut(true)} className="flex-1 p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Proceed to Checkout</button>
                         </div>
                    )}
                </footer>
            </motion.div>
        </motion.div>
    );
}