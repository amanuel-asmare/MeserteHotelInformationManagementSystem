// backend/src/routes/payrollRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getPayrollForMonth,
    generateMonthlyPayroll,
    updatePayslip,
    getPayrollHistory,
    getMyPayroll // <--- Import this
} = require('../controllers/payrollController');

// Helper function
const allowPayrollAccess = (req) => {
    return ['manager', 'admin', 'cashier'].includes(req.user.role.toLowerCase());
};

// Middleware: Allow manager, admin, cashier
const canAccessPayroll = (req, res, next) => {
    if (!req.user || !allowPayrollAccess(req)) {
        return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }
    next();
};

// Middleware: Only manager/admin can generate payroll
const canGeneratePayroll = (req, res, next) => {
    if (!req.user || !['manager', 'admin'].includes(req.user.role.toLowerCase())) {
        return res.status(403).json({ message: 'Only managers and admins can generate payroll' });
    }
    next();
};
// Routes
router.get('/my-history', protect, getMyPayroll); // <--- NEW ROUTE (Accessible by any logged in user)
// Routes
router.get('/:year/:month', protect, canAccessPayroll, getPayrollForMonth);
router.post('/generate', protect, canGeneratePayroll, generateMonthlyPayroll);
router.put('/:payslipId', protect, canAccessPayroll, updatePayslip);
router.get('/history', protect, canAccessPayroll, getPayrollHistory);

module.exports = router;
/*// backend/src/routes/payrollRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getPayrollForMonth,
    generateMonthlyPayroll,
    updatePayslip
} = require('../controllers/payrollController');

// Only Managers and Admins can access payroll
const canManagePayroll = authorize('manager', 'admin');

router.get('/:year/:month', protect, canManagePayroll, getPayrollForMonth);
router.post('/generate', protect, canManagePayroll, generateMonthlyPayroll);
router.put('/:payslipId', protect, canManagePayroll, updatePayslip);

module.exports = router;*/