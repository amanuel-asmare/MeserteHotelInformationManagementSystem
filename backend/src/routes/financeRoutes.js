const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    createPurchase,
    getAllPurchases,
    deletePurchase,
    createExpense,
    getAllExpenses,
    deleteExpense,
    getFinancialStats
} = require('../controllers/financeController');

// Only Admin and Managers should access finance
const authorized = authorize('admin', 'manager');

// Purchase Routes
router.route('/purchases')
    .get(protect, authorized, getAllPurchases)
    .post(protect, authorized, createPurchase);

router.route('/purchases/:id')
    .delete(protect, authorized, deletePurchase);

// Expense Routes
router.route('/expenses')
    .get(protect, authorized, getAllExpenses)
    .post(protect, authorized, createExpense);

router.route('/expenses/:id')
    .delete(protect, authorized, deleteExpense);
// NEW ANALYTICS ROUTE
router.get('/analytics', protect, authorized, getFinancialStats);
module.exports = router;