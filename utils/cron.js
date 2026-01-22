// cron/loginResetJob.js
const cron = require('node-cron');
const { Op } = require('sequelize');
const { User, EmployeeLeaveBalance, LeaveType } = require('../models');

/**
 * Automatically resets failed login attempts (and optionally reactivates users)
 * every hour (configurable).
 */
function loginResetJob(io) {
    cron.schedule('0 * * * *', async () => {
        console.log('🕒 [CRON] Running automatic login attempt reset check...');

        try {
            const users = await User.findAll({
                where: {
                [Op.or]: [
                    { failedLoginAttempts: { [Op.gt]: 0 } },
                    { status: 'suspended' }
                ]
                }
            });

            const now = new Date();

            for (const user of users) {
                if (!user.lastFailedLogin) continue;

                const lastFailedDate = new Date(user.lastFailedLogin);
                const isExpired = lastFailedDate.toDateString() !== now.toDateString();

                if (isExpired) {
                    user.failedLoginAttempts = 0;

                    // Optional: reactivate suspended users
                    if (user.status === 'suspended') {
                        user.status = 'active';
                    }

                    await user.save();

                    console.log(`🔁 [CRON] Auto-reset login attempts for: ${user.username}`);

                    // Optional: real-time notify connected clients
                    if (io) {
                        io.emit('loginAttemptsAutoReset', {
                        userId: user.id,
                        username: user.username,
                        status: user.status,
                        message: 'Login attempts automatically reset by system.',
                        });
                    }
                }
            }
        } catch (err) {
            console.error('❌ [CRON] Error during auto-reset:', err.message);
        }
    });
}

function yearlyLeaveBalance(io) {
    cron.schedule('0 0 1 1 *', async () => {
        console.log('🕒 [CRON] Running automatic yearly leave balance check...');

        try {
            const balances = await EmployeeLeaveBalance.findAll({
            include: [
                {
                model: LeaveType,
                    as: 'leaveType',
                    where: { 
                        is_active: true 
                    }
                }
            ]
            });

            for (const bal of balances) {
                const leaveType = bal.leaveType;

                if (!leaveType) continue;

                let newCredit = parseFloat(bal.credit);
                let newBalance = parseFloat(bal.balance);
                const leaveTypeCredit = parseFloat(leaveType.credit);

                if (leaveType.can_carry_over) {
                    // Carry over existing balance + add new credit
                    newCredit += leaveTypeCredit;
                    newBalance += leaveTypeCredit;
                } else {
                    // Reset and apply new yearly credit only
                    newCredit = leaveTypeCredit;
                    newBalance = leaveTypeCredit;
                }

                await bal.update({
                    credit: newCredit,
                    earned: leaveTypeCredit,
                    used: 0,
                    balance: newBalance
                });
            }

            console.log('✅ Yearly leave balance update completed!');
        } catch (error) {
            console.error('❌ Error updating leave balances:', error);
        }
    });
}

module.exports = {
    loginResetJob,
    yearlyLeaveBalance
};
