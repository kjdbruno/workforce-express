const { Sequelize } = require('sequelize');
const jwt = require('jsonwebtoken'); // Need jwt for socket auth
const { User, UserLog, Office, Notification } = require("../models");

const userSocketMap = new Map(); // userId -> socketId
const onlineUsers = {};

// Store mapping from userId to Set<socket.id>
const connectedUsers = new Map();

// Store mapping from socket.id to its expiration timer
const socketExpirationTimers = new Map();

module.exports = function (io) {

    io.on('connection', (socket) => {

        console.log(`Socket ${socket} connected`);

        // Function to clear existing timer for a socket
        const clearSocketTimer = (socketId) => {

            if (socketExpirationTimers.has(socketId)) {

                clearTimeout(socketExpirationTimers.get(socketId));

                socketExpirationTimers.delete(socketId);

                console.log(`Cleared expiration timer for socket ${socketId}`);

            }
        };

        // Event to authenticate the socket connection with a JWT
        socket.on('authenticate', (data) => {

            clearSocketTimer(socket.id); // Clear any previous timer if re-authenticating

            const token = data.token;

            if (!token) {
                socket.emit('auth_error', { 
                    message: 'No token provided' 
                });
                socket.emit('force_logout', { 
                    reason: 'no_token_provided' 
                }); // Force logout if no token
                return;
            }

            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {

                if (err) {

                    console.error('Socket authentication failed for', socket.id, ':', err.message);
                    
                    socket.emit('auth_error', { 
                        message: 'Invalid or expired token', 
                        error: err.name 
                    });
                    
                    socket.emit('force_logout', { 
                        reason: 'invalid_token' 
                    }); // Force logout if invalid/expired
                    
                    return;

                }

                const userId = decoded.id;

                socket.userId = userId; // Attach userId to the socket

                // Add socket to connected users
                if (!connectedUsers.has(userId)) {

                    connectedUsers.set(userId, new Set());

                }

                connectedUsers.get(userId).add(socket.id);

                console.log(`Socket ${socket.id} authenticated as user ${userId}. Total sockets for user ${userId}: ${connectedUsers.get(userId).size}`);

                socket.emit('authenticated', { userId: userId });

                CreateUserLogged(userId, socket.id);

                EmitOnlineUsers();

                EmitNotifications(userId);

                // Set a timer for token expiration
                const expiresInSeconds = decoded.exp - (Date.now() / 1000); // Calculate remaining time in seconds

                if (expiresInSeconds > 0) {

                    const timer = setTimeout(() => {

                        console.log(`Socket ${socket.id} (user ${userId}) token expired. Forcing logout.`);

                        socket.emit('force_logout', { reason: 'token_expired' });

                        // Optionally, you might want to disconnect the socket from the server side too:
                        // socket.disconnect(true);
                    }, expiresInSeconds * 1000); // Convert to milliseconds

                    socketExpirationTimers.set(socket.id, timer);

                    console.log(`Set expiration timer for socket ${socket.id} to ${expiresInSeconds} seconds.`);

                } else {

                    console.log(`Token for socket ${socket.id} (user ${userId}) already expired on authentication.`);

                    socket.emit('force_logout', { 
                        reason: 'token_already_expired' 
                    });

                }
            });
        });

        //on register socket
        socket.on('register', async (data ) => {

            const token = data.token;

            if (!token) {

                socket.emit('auth_error', { 
                    message: 'No token provided' 
                });

                socket.emit('force_logout', { 
                    reason: 'no_token_provided' 
                }); // Force logout if no token
                
                return;

            }

            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {

                if (err) {

                    console.error('Socket authentication failed for', socket.id, ':', err.message);
                    
                    socket.emit('auth_error', { 
                        message: 'Invalid or expired token', error: err.name 
                    });
                    
                    socket.emit('force_logout', { 
                        reason: 'invalid_token' 
                    }); // Force logout if invalid/expired
                    
                    return;

                }

                const userId = decoded.id;

                console.log(`Socket ${socket.id} registered for user ${userId}`);
                
                EmitOnlineUsers(userId, socket.id);

                EmitNotifications(userId);

            });
        });

        //disconnect socket
        socket.on('disconnect', async () => {

            console.log(`Socket disconnected: ${socket.id}`);

            const log = await UserLog.findOne(
                { 
                    where: { 
                        socketId: socket.id 
                    } 
                });

            if (log) {

                await log.update({ 
                    isOnline: false, 
                    socketId: null 
                });
                
                EmitOnlineUsers();

            }
      
            for (const [uid, sid] of Object.entries(onlineUsers)) {

              if (sid === socket.id) delete onlineUsers[uid];

            }
    
        });

        socket.on('ReadNotification', async ({ id }) => {

            await Notification.update(
                { 
                    isRead: true 
                },
                { 
                    where: { 
                        receiverId: id 
                    } 
                }
            );
            
            EmitNotifications(id);

        });

    });

    async function CreateUserLogged(userId, socketId) {

        try {

            await UserLog.upsert({
                userId,
                socketId,
                isOnline: true
            });

        } catch (e) {

            console.log(e);

        }

    };

    async function EmitOnlineUsers() {

        try {

            const users = await UserLog.findAll({
                where: { 
                    isOnline: true 
                },
                include: {
                    model: User,
                    as: 'User'
                }
            });

            io.emit('EmitOnlineUsers', users);

        } catch (e) {

            console.log(e);

        }

    };

    async function EmitNotifications(receiverId) {

        const notificationCount = await Notification.count({
            where: {
                receiverId: receiverId,
                isRead: false
            }
        });

        const notifications = await Notification.findAll({
            where: { 
                isRead: false,
                receiverId
            },
            include: [
                {
                    model: User,
                    as: 'Receiver'
                }
            ],
            order: [
                ['createdAt', 'DESC']
            ]
        });

        io.emit('EmitNotifications', notificationCount, notifications);
        
    }

}