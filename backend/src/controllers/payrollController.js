const Payslip = require('../models/Payslip');
const User = require('../models/User');
const { calculateEthiopianTax } = require('../utils/taxCalculator');

// Helper function to ensure image URLs are always correct.
const getFullImageUrl = (imagePath) => {
    if (!imagePath || imagePath.startsWith('http')) return imagePath || '/default-avatar.png';
    const API_BASE = process.env.API_URL || 'http://localhost:5000';
    // This now correctly handles paths from the upload middleware
    if (imagePath.startsWith('/uploads')) {
        return `${API_BASE}${imagePath}`;
    }
    // Fallback for older or different path structures
    return `${API_BASE}/uploads/avatars/${imagePath}`;
};

// GET /api/payroll/:year/:month - Get payroll data for a specific period
exports.getPayrollForMonth = async(req, res) => {
    try {
        const { year, month } = req.params;
        const payslips = await Payslip.find({ year, month })
            .populate('user', 'firstName lastName profileImage role')
            .lean(); // Use .lean() for better performance

        // ✅ THE CRITICAL FIX: Manually format the profileImage URL for each populated user.
        const formattedPayslips = payslips.map(p => {
            if (p.user && p.user.profileImage) {
                p.user.profileImage = getFullImageUrl(p.user.profileImage);
            }
            return p;
        });

        res.json(formattedPayslips);
    } catch (error) {
        console.error("Error fetching payroll for month:", error);
        res.status(500).json({ message: 'Failed to fetch payroll data.' });
    }
};

// POST /api/payroll/generate - Generate payslips for all staff for a given month
exports.generateMonthlyPayroll = async(req, res) => {
    const { year, month } = req.body;
    try {
        const existingPayslip = await Payslip.findOne({ year, month });
        if (existingPayslip) {
            return res.status(400).json({ message: `Payroll for ${month}/${year} has already been generated.` });
        }

        const staff = await User.find({ role: { $ne: 'customer' }, isActive: true, salary: { $gt: 0 } });
        if (staff.length === 0) {
            return res.status(404).json({ message: 'No active staff with a valid salary found to generate payroll for.' });
        }

        const payslipsToCreate = staff.map(employee => {
            const { tax, pension } = calculateEthiopianTax(employee.salary);
            const netPay = employee.salary - tax - pension;
            return {
                user: employee._id,
                month,
                year,
                baseSalary: employee.salary,
                tax,
                pension,
                netPay,
                generatedBy: req.user.id,
                status: 'pending'
            };
        });

        await Payslip.insertMany(payslipsToCreate);
        res.status(201).json({ message: `Successfully generated payroll for ${staff.length} employees.` });

    } catch (error) {
        console.error("Error generating payroll:", error);
        res.status(500).json({ message: 'Server error during payroll generation.' });
    }
};

// PUT /api/payroll/:payslipId - Update a single payslip
exports.updatePayslip = async(req, res) => {
    try {
        const { bonus, deductions, status, notes } = req.body;
        const payslip = await Payslip.findById(req.params.payslipId);
        if (!payslip) return res.status(404).json({ message: 'Payslip not found' });

        if (bonus !== undefined) payslip.bonus = parseFloat(bonus);
        if (deductions !== undefined) payslip.deductions = parseFloat(deductions);
        if (status) payslip.status = status;
        if (notes) payslip.notes = notes;
        if (status === 'paid' && !payslip.paidAt) payslip.paidAt = new Date();

        const grossSalary = payslip.baseSalary + (payslip.bonus || 0);
        const { tax, pension } = calculateEthiopianTax(grossSalary);
        payslip.tax = tax;
        payslip.pension = pension;
        payslip.netPay = grossSalary - tax - pension - (payslip.deductions || 0);

        await payslip.save();

        const updatedPayslip = await Payslip.findById(payslip._id)
            .populate('user', 'firstName lastName profileImage role')
            .lean();

        if (updatedPayslip.user && updatedPayslip.user.profileImage) {
            updatedPayslip.user.profileImage = getFullImageUrl(updatedPayslip.user.profileImage);
        }

        res.json(updatedPayslip);
    } catch (error) {
        console.error("Error updating payslip:", error);
        res.status(400).json({ message: 'Failed to update payslip.' });
    }
};