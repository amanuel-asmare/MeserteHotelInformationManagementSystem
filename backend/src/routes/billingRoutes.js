// backend/src/routes/billingRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getActiveBills,
    getInvoiceHistory,
    getBillDetails,
    addCharge,
    processCheckout
} = require('../controllers/billingController');

const cashierOrManager = authorize('cashier', 'manager', 'admin');

router.get('/active', protect, cashierOrManager, getActiveBills);
router.get('/history', protect, cashierOrManager, getInvoiceHistory);
router.get('/:invoiceId', protect, cashierOrManager, getBillDetails);
router.post('/:invoiceId/items', protect, cashierOrManager, addCharge);
router.post('/checkout/:invoiceId', protect, cashierOrManager, processCheckout);

module.exports = router;