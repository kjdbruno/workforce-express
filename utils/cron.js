// cron/loginResetJob.js
const cron = require('node-cron');
const { Op } = require('sequelize');
const { User } = require('../models');

/**
 * Automatically resets failed login attempts (and optionally reactivates users)
 * every hour (configurable).
 */
function loginResetJob(io) {
    cron.schedule('* * * * *', async () => {
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

module.exports = loginResetJob;
