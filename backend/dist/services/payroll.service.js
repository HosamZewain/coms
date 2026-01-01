"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePayroll = void 0;
const prisma_1 = require("../utils/prisma");
const calculatePayroll = async (month, year) => {
    // 1. Get all employees with profiles
    const employees = await prisma_1.prisma.user.findMany({
        include: {
            employeeProfile: true,
            compensations: {
                where: {
                    // Filter compensations for the specified month/year if needed, 
                    // dependent on how date is stored. Assuming 'date' field.
                    // Complex date filtering might be needed, for now getting all in the month range.
                    date: {
                        gte: new Date(year, month - 1, 1),
                        lt: new Date(year, month, 1)
                    }
                }
            }
        }
    });
    // 2. Calculate salary for each
    const payroll = employees.map(emp => {
        const baseSalary = emp.employeeProfile?.salary || 0;
        const additions = emp.compensations
            .filter(c => c.type === 'AWARD' || c.type === 'BONUS')
            .reduce((sum, c) => sum + c.amount, 0);
        const deductions = emp.compensations
            .filter(c => c.type === 'DEDUCTION')
            .reduce((sum, c) => sum + c.amount, 0);
        // Allow customized "Other" types if any, treating unknown as addition for now or ignored.
        // Stick to AWARD/DEDUCTION from schema enum if strict, but schema has String type for Compensation.type.
        const netSalary = baseSalary + additions - deductions;
        return {
            id: emp.id,
            employeeName: `${emp.firstName} ${emp.lastName}`,
            baseSalary,
            additions,
            deductions,
            netSalary,
            currency: 'SAR' // Default currency
        };
    });
    return payroll;
};
exports.calculatePayroll = calculatePayroll;
