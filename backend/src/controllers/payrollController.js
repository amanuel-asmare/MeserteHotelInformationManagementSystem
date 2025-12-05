// backend/src/controllers/payrollController.js
const Payslip = require('../models/Payslip');
const User = require('../models/User');
const { calculateEthiopianTax } = require('../utils/taxCalculator');

const getFullImageUrl = (imagePath) => {
    if (!imagePath || imagePath.startsWith('http')) return imagePath || '/default-avatar.png';
    const API_BASE = process.env.API_URL || 'https://localhost:5000';
    return imagePath.startsWith('/uploads') ?
        `${API_BASE}${imagePath}` :
        `${API_BASE}/uploads/avatars/${imagePath}`;
};

// GET payroll for month/year
exports.getPayrollForMonth = async(req, res) => {
    try {
        const { year, month } = req.params;
        const payslips = await Payslip.find({
                year: parseInt(year),
                month: parseInt(month)
            })
            .populate('user', 'firstName lastName profileImage role salary')
            .populate('generatedBy', 'firstName lastName')
            .lean();

        const formatted = payslips.map(p => ({
            ...p,
            user: {
                ...p.user,
                profileImage: p.user && p.user.profileImage ?
                    getFullImageUrl(p.user.profileImage) : getFullImageUrl(null)
            },
            generatedBy: p.generatedBy ? {
                _id: p.generatedBy._id,
                name: `${p.generatedBy.firstName} ${p.generatedBy.lastName}`
            } : null
        }));

        res.json(formatted);
    } catch (error) {
        console.error("Error fetching payroll:", error);
        res.status(500).json({ message: 'Failed to fetch payroll data.' });
    }
};

// backend/src/controllers/payrollController.js
exports.generateMonthlyPayroll = async(req, res) => {
    const { year, month } = req.body;
    const numericYear = parseInt(year);
    const numericMonth = parseInt(month);

    if (!numericYear || !numericMonth || numericMonth < 1 || numericMonth > 12) {
        return res.status(400).json({ message: 'Invalid year or month' });
    }

    try {
        // Check if payroll already exists for this period
        const existing = await Payslip.findOne({ year: numericYear, month: numericMonth });
        if (existing) {
            return res.status(400).json({
                message: `Payroll for ${new Date(numericYear, numericMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })} already exists.`,
            });
        }

        // Include 'admin' role too + be more lenient on salary
        const staff = await User.find({
            role: { $in: ['manager', 'cashier', 'receptionist', 'admin'] },
            isActive: true,
        }).select('firstName lastName salary _id');

        if (staff.length === 0) {
            return res.status(400).json({
                message: 'No active staff found. Please check staff roles and active status.',
            });
        }

        const validStaff = staff
            .map(emp => {
                const salary = parseFloat(emp.salary);
                if (isNaN(salary) || salary <= 0) return null;
                return {...emp.toObject(), salary };
            })
            .filter(Boolean);

        if (validStaff.length === 0) {
            return res.status(400).json({
                message: 'No staff with valid salary found. Please set salaries in Staff Management.',
            });
        }

        const payslips = validStaff.map(employee => {
            const gross = employee.salary;
            const { tax, pension } = calculateEthiopianTax(gross);
            const netPay = gross - tax - pension;

            return new Payslip({
                user: employee._id,
                month: numericMonth,
                year: numericYear,
                baseSalary: gross,
                bonus: 0,
                deductions: 0,
                tax,
                pension,
                netPay: Math.round(netPay),
                status: 'pending',
                generatedBy: req.user.id,
            });
        });

        await Payslip.insertMany(payslips);

        res.status(201).json({
            message: `Payroll generated successfully for ${payslips.length} employees!`,
            count: payslips.length,
        });
    } catch (error) {
        console.error("Payroll generation error:", error);
        res.status(500).json({ message: 'Server error during payroll generation.' });
    }
};
// UPDATE payslip
exports.updatePayslip = async(req, res) => {
    try {
        const { bonus, deductions, status, notes } = req.body;
        const payslip = await Payslip.findById(req.params.payslipId).populate('user');

        if (!payslip) return res.status(404).json({ message: 'Payslip not found' });

        if (bonus !== undefined) payslip.bonus = parseFloat(bonus) || 0;
        if (deductions !== undefined) payslip.deductions = parseFloat(deductions) || 0;
        if (status) payslip.status = status;
        if (notes) payslip.notes = notes;

        if (status === 'paid' && payslip.status !== 'paid') {
            payslip.paidAt = new Date();
        }

        const grossSalary = payslip.baseSalary + payslip.bonus;
        const { tax, pension } = calculateEthiopianTax(grossSalary);
        payslip.tax = tax;
        payslip.pension = pension;
        payslip.netPay = grossSalary - tax - pension - payslip.deductions;

        await payslip.save();

        const populated = await Payslip.findById(payslip._id)
            .populate('user', 'firstName lastName profileImage role')
            .populate('generatedBy', 'firstName lastName')
            .lean();

        populated.user.profileImage = populated.user && populated.user.profileImage ?
            getFullImageUrl(populated.user.profileImage) :
            getFullImageUrl(null);

        res.json(populated);
    } catch (error) {
        console.error("Error updating payslip:", error);
        res.status(400).json({ message: 'Failed to update payslip.' });
    }
};

// Get payroll history
exports.getPayrollHistory = async(req, res) => {
    try {
        const history = await Payslip.aggregate([
            { $group: { _id: { year: "$year", month: "$month" }, count: { $sum: 1 } } },
            { $sort: { "_id.year": -1, "_id.month": -1 } }
        ]);

        const formatted = history.map(h => ({
            year: h._id.year,
            month: h._id.month,
            monthName: new Date(h._id.year, h._id.month - 1).toLocaleString('default', { month: 'long' }),
            count: h.count
        }));

        res.json(formatted);
    } catch (error) {
        console.error("Error fetching payroll history:", error);
        res.status(500).json({ message: 'Failed to fetch payroll history' });
    }
};
// GET MY PAYROLL HISTORY (For any staff member)
exports.getMyPayroll = async(req, res) => {
    try {
        const payslips = await Payslip.find({ user: req.user.id })
            .sort({ year: -1, month: -1 }) // Newest first
            .populate('user', 'firstName lastName profileImage role')
            .lean();

        const formatted = payslips.map(p => ({
            ...p,
            // Re-calculate local tax logic just for display consistency if needed, 
            // or trust DB values.
            user: {
                ...p.user,
                profileImage: getFullImageUrl(p.user.profileImage)
            }
        }));

        res.json(formatted);
    } catch (error) {
        console.error("Error fetching my payroll:", error);
        res.status(500).json({ message: 'Failed to fetch personal payroll history.' });
    }
};
/*const Payslip = require('../models / Payslip ');
const User = require('../models/User');
const { calculateEthiopianTax } = require('../utils/taxCalculator');

// Helper function to ensure image URLs are always correct.
const getFullImageUrl = (imagePath) => {
    if (!imagePath || imagePath.startsWith('http')) return imagePath || '/default-avatar.png';
    const API_BASE = process.env.API_URL || 'https://localhost:5000';
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
};*/