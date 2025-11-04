const mongoose = require('mongoose');
const foodOrderSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
    items: [{
        menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
        quantity: { type: Number, default: 1 }
    }],
    total: { type: Number },
    status: { type: String, enum: ['pending', 'preparing', 'delivered'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('FoodOrder', foodOrderSchema);