const Purchase = require('../models/Purchase');
const Expense = require('../models/Expense');

// --- PURCHASE CONTROLLERS ---
const Booking = require('../models/Booking');
const Order = require('../models/orderModel');
const Payslip = require('../models/Payslip');
exports.createPurchase = async(req, res) => {
    try {
        const { supplier, referenceNo, items, hasVat, paymentMethod, notes, date } = req.body;

        // Calculate Totals
        let subTotal = 0;
        const processedItems = items.map(item => {
            const itemTotal = item.quantity * item.unitPrice;
            subTotal += itemTotal;
            return {...item, total: itemTotal };
        });

        const taxAmount = hasVat ? (subTotal * 0.15) : 0;
        const grandTotal = subTotal + taxAmount;

        const purchase = await Purchase.create({
            supplier,
            referenceNo,
            items: processedItems,
            hasVat,
            subTotal,
            taxAmount,
            grandTotal,
            paymentMethod,
            notes,
            date,
            createdBy: req.user.id
        });

        res.status(201).json(purchase);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllPurchases = async(req, res) => {
    try {
        const purchases = await Purchase.find().sort({ date: -1 }).populate('createdBy', 'firstName lastName');
        res.json(purchases);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deletePurchase = async(req, res) => {
    try {
        await Purchase.findByIdAndDelete(req.params.id);
        res.json({ message: 'Purchase record deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// --- EXPENSE CONTROLLERS ---

exports.createExpense = async(req, res) => {
    try {
        const expense = await Expense.create({
            ...req.body,
            approvedBy: req.user.id
        });
        res.status(201).json(expense);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllExpenses = async(req, res) => {
    try {
        const expenses = await Expense.find().sort({ date: -1 }).populate('approvedBy', 'firstName lastName');
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteExpense = async(req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: 'Expense deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



// --- ANALYTICS CONTROLLER ---
exports.getFinancialStats = async(req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31);

        // Helper for aggregation
        const aggregateByMonth = async(Model, dateField, amountField, matchQuery = {}) => {
            const data = await Model.aggregate([{
                    $match: {
                        ...matchQuery,
                        [dateField]: { $gte: startOfYear, $lte: endOfYear }
                    }
                },
                {
                    $group: {
                        _id: { $month: `$${dateField}` },
                        total: { $sum: `$${amountField}` }
                    }
                }
            ]);
            return data;
        };

        // 1. CALCULATE INCOME
        const bookingsIncome = await aggregateByMonth(Booking, 'updatedAt', 'totalPrice', { paymentStatus: 'completed' });
        const ordersIncome = await aggregateByMonth(Order, 'updatedAt', 'totalAmount', { paymentStatus: 'completed' });

        // 2. CALCULATE EXPENSES
        const expensesCost = await aggregateByMonth(Expense, 'date', 'amount');
        const purchasesCost = await aggregateByMonth(Purchase, 'date', 'grandTotal', { status: 'received' });
        // Payroll Cost (Base Salary + Bonus)
        const payrollCost = await Payslip.aggregate([
            { $match: { year: currentYear, status: 'paid' } },
            { $group: { _id: "$month", total: { $sum: { $add: ["$baseSalary", "$bonus"] } } } }
        ]);

        // 3. MERGE DATA FOR 12 MONTHS
        const monthlyData = Array.from({ length: 12 }, (_, i) => {
            const monthIndex = i + 1;

            // ✅ FIX: Replaced optional chaining (?.) with standard ternary check
            const getVal = (arr) => {
                const foundItem = arr.find(x => x._id === monthIndex);
                return foundItem ? foundItem.total : 0;
            };

            const income = getVal(bookingsIncome) + getVal(ordersIncome);
            const expense = getVal(expensesCost) + getVal(purchasesCost) + getVal(payrollCost);

            return {
                name: new Date(0, i).toLocaleString('en-US', { month: 'short' }), // Jan, Feb...
                Income: income,
                Expense: expense,
                Profit: income - expense
            };
        });

        // 4. TOTALS
        const totalIncome = monthlyData.reduce((acc, curr) => acc + curr.Income, 0);
        const totalExpense = monthlyData.reduce((acc, curr) => acc + curr.Expense, 0);
        const netProfit = totalIncome - totalExpense;

        res.json({
            chartData: monthlyData,
            summary: { totalIncome, totalExpense, netProfit }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};