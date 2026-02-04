// cron/loginResetJob.js
const cron = require('node-cron');
const { Op } = require('sequelize');
const db = require('../models');
const { sequelize } = db;

/**
 * Automatically resets failed login attempts (and optionally reactivates users)
 * every hour (configurable).
 */
function loginResetJob(io) {
    cron.schedule('0 * * * *', async () => {
        console.log('🕒 [CRON] Running automatic login attempt reset check...');

        try {
            const users = await db.User.findAll({
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

                    console.log(`[CRON] Auto-reset login attempts for: ${user.username}`);

                    // Optional: real-time notify connected clients
                    // if (io) {
                    //     io.emit('loginAttemptsAutoReset', {
                    //     userId: user.id,
                    //     username: user.username,
                    //     status: user.status,
                    //     message: 'Login attempts automatically reset by system.',
                    //     });
                    // }
                }
            }
        } catch (err) {
            console.error('❌ [CRON] Error during auto-reset:', err.message);
        }
    });
}

function yearlyLeaveBalance(io) {
    cron.schedule('0 0 1 1 *', async () => {
        console.log('[CRON] Running automatic yearly leave balance check...');

        try {
            const balances = await db.EmployeeLeaveBalance.findAll({
            include: [
                {
                model: db.LeaveType,
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

function dailyAutoCancel(io) {
    // Every day at 6PM
    cron.schedule('0 18 * * *', async () => {
        const today = moment().format('YYYY-MM-DD');
        console.log(`[CRON] Daily auto-cancel check for ${today}`);
        try {
            // 1️ Cancel expired Attendances
            const cancelledAttendances = await db.Attendance.update(
                { status: 'Cancelled' },
                {
                    where: {
                        status: { [Op.in]: ['Pending'] },
                        date_to: { [Op.lt]: today }
                    }
                }
            );

        // 2️⃣ Cancel expired Leave Applications
        const cancelledLeaves = await db.EmployeeLeaveApplication.update(
            { status: 'Cancelled' },
            {
                where: {
                    status: { [Op.in]: ['Pending', 'Filed'] },
                    date_to: { [Op.lt]: today }
                }
            }
        );

        // 3️⃣ Cancel expired Overtimes
        const cancelledOvertimes = await db.Overtime.update(
            { status: 'Cancelled' },
            {
                where: {
                    status: { [Op.in]: ['Pending'] },
                    date: { [Op.lt]: today }
                }
            }
        );

        console.log('Daily auto-cancel completed');
        console.log(`Attendances cancelled: ${cancelledAttendances[0]}`);
        console.log(`Leave applications cancelled: ${cancelledLeaves[0]}`);
        console.log(`Overtimes cancelled: ${cancelledOvertimes[0]}`);

        // Optional: notify admins via socket
        //   if (io) {
        //     io.emit('cron:auto-cancel', {
        //       date: today,
        //       attendance: cancelledAttendances[0],
        //       leaves: cancelledLeaves[0],
        //       overtimes: cancelledOvertimes[0]
        //     });
        //   }

        } catch (error) {
            console.error('❌ Error during daily auto-cancel cron:', error);
        }
    });
}
module.exports = {
    loginResetJob,
    yearlyLeaveBalance,
    dailyAutoCancel
};
