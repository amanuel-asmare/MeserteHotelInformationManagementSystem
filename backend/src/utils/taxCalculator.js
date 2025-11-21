// backend/src/utils/taxCalculator.js

/**
 * Calculates Ethiopian income tax based on the provided gross salary.
 * Brackets are as of late 2023/early 2024.
 * @param {number} grossSalary - The total monthly salary before tax.
 * @returns {{tax: number, pension: number}} - The calculated tax and employee pension contribution.
 */
exports.calculateEthiopianTax = (grossSalary) => {
    let tax = 0;
    const pension = grossSalary * 0.07; // Standard 7% employee pension contribution

    if (grossSalary <= 600) {
        tax = 0;
    } else if (grossSalary <= 1650) {
        tax = (grossSalary * 0.10) - 60;
    } else if (grossSalary <= 3200) {
        tax = (grossSalary * 0.15) - 142.50;
    } else if (grossSalary <= 5250) {
        tax = (grossSalary * 0.20) - 302.50;
    } else if (grossSalary <= 7800) {
        tax = (grossSalary * 0.25) - 565;
    } else if (grossSalary <= 10900) {
        tax = (grossSalary * 0.30) - 955;
    } else {
        tax = (grossSalary * 0.35) - 1500;
    }

    return { tax: parseFloat(tax.toFixed(2)), pension: parseFloat(pension.toFixed(2)) };
};