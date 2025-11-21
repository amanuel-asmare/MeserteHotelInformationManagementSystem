const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getPayrollForMonth,
    generateMonthlyPayroll,
    updatePayslip
} = require('../controllers/payrollController');

// ✅ FIX: Define more granular permissions.
// Managers, Admins, AND Cashiers can view payroll and update payslips (e.g., mark as paid).
const canAccessPayroll = authorize('manager', 'admin', 'cashier');

// Only Managers and Admins can generate the initial payroll for the month.
const canGeneratePayroll = authorize('manager', 'admin');

// ✅ FIX: Apply the correct authorization middleware to each route.
// Cashiers can now GET the list of payslips for a month.
router.get('/:year/:month', protect, canAccessPayroll, getPayrollForMonth);

// Generating payroll remains restricted to managers and admins.
router.post('/generate', protect, canGeneratePayroll, generateMonthlyPayroll);

// Cashiers can now PUT updates to a payslip (e.g., change status to 'paid').
router.put('/:payslipId', protect, canAccessPayroll, updatePayslip);

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