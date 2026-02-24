const jwt = require('jsonwebtoken');
const db = require('../models');

const fs = require('fs');
const path = require('path');

const connectedUsers = new Map(); // userId -> Set(socketIds)
const socketExpirationTimers = new Map(); // socketId -> timer

module.exports = function (io) {

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        const clearSocketTimer = (socketId) => {
            if (socketExpirationTimers.has(socketId)) {
                clearTimeout(socketExpirationTimers.get(socketId));
                socketExpirationTimers.delete(socketId);
                console.log(`Cleared expiration timer for socket ${socketId}`);
            }
        };

        // helper: attach socket to user's Set
        const addConnectedSocket = (userId, socketId) => {
            if (!connectedUsers.has(userId)) connectedUsers.set(userId, new Set());
            connectedUsers.get(userId).add(socketId);
        };

        // helper: remove socket from user's Set
        const removeConnectedSocket = (userId, socketId) => {
            const set = connectedUsers.get(userId);
            if (!set) return 0;
            set.delete(socketId);
            if (set.size === 0) connectedUsers.delete(userId);
            return set.size;
        };

        // AUTHENTICATE
        socket.on('authenticate', (data) => {
            clearSocketTimer(socket.id);

            const token = data?.token;
            if (!token) {
                socket.emit('auth_error', { message: 'No token provided' });
                socket.emit('force_logout', { reason: 'no_token_provided' });
                return;
            }

            jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
                if (err) {
                    console.error('Socket authentication failed for', socket.id, ':', err.message);
                    socket.emit('auth_error', { message: 'Invalid or expired token', error: err.name });
                    socket.emit('force_logout', { reason: 'invalid_token' });
                    return;
                }

                const userId = decoded.id;
                socket.userId = userId;

                // join personal room (so io.to(`user:${id}`) works)
                socket.join(`user:${userId}`);

                // track multi sockets
                addConnectedSocket(userId, socket.id);
                console.log( `Socket ${socket.id} authenticated as user ${userId}. Active sockets: ${connectedUsers.get(userId).size}` );

                socket.emit('authenticated', { userId });

                // Upsert user log online
                await CreateUserLogged(userId, socket.id);

                // Emit updates
                await EmitOnlineUsers();
                await EmitNotifications(userId);
                await EmitEmployee(userId);

                // token expiration timer
                const expiresInSeconds = decoded.exp - (Date.now() / 1000);
                if (expiresInSeconds > 0) {
                    const timer = setTimeout(() => {
                        console.log(`Socket ${socket.id} (user ${userId}) token expired. Forcing logout.`);
                        socket.emit('force_logout', { reason: 'token_expired' });
                    }, expiresInSeconds * 1000);

                    socketExpirationTimers.set(socket.id, timer);
                } else {
                    socket.emit('force_logout', { reason: 'token_already_expired' });
                }
            });
        });

        // REGISTER (optional in your client; keeping it)
        socket.on('register', (data) => {
            const token = data?.token;
            if (!token) {
                socket.emit('auth_error', { message: 'No token provided' });
                socket.emit('force_logout', { reason: 'no_token_provided' });
                return;
            }

            jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
                if (err) {
                    console.error('Socket register failed for', socket.id, ':', err.message);
                    socket.emit('auth_error', { message: 'Invalid or expired token', error: err.name });
                    socket.emit('force_logout', { reason: 'invalid_token' });
                    return;
                }

                const userId = decoded.id;
                socket.userId = userId;

                // ensure joined room
                socket.join(`user:${userId}`);

                // ensure in connected users (in case register happens before authenticate)
                addConnectedSocket(userId, socket.id);

                console.log(`Socket ${socket.id} registered for user ${userId}`);

                await CreateUserLogged(userId, socket.id);
                await EmitOnlineUsers();
                await EmitNotifications(userId);
            });
        });

        // READ NOTIFICATIONS
        socket.on('ReadNotification', async () => {
            const userId = socket.userId;
            if (!userId) return;

            await db.Notification.update(
                { status: 'read' },
                { where: { receiver_id: userId, status: 'unread' } }
            );

            const [count, notifications] = await Promise.all([
                db.Notification.count({ where: { receiver_id: userId, status: 'unread' } }),
                db.Notification.findAll({
                    where: { receiver_id: userId, status: 'unread' },
                    order: [['createdAt', 'DESC']],
                }),
            ]);

            io.to(`user:${userId}`).emit('EmitNotifications', { count, notifications });
        });

        // JOIN ROOM (kept for compatibility)
        socket.on('join', (userId) => {
            socket.join(`user:${userId}`);
        });

        // DISCONNECT
        socket.on('disconnect', async () => {
            console.log(`Socket disconnected: ${socket.id}`);

            clearSocketTimer(socket.id);

            const userId = socket.userId;
            if (!userId) return;

            // remove this socket from user's active set
            const remaining = removeConnectedSocket(userId, socket.id);

            // only set offline if no other sockets left
            if (remaining === 0) {
                await db.UserLog.update(
                    { is_online: false, socket_id: null },
                    { where: { user_id: userId } }
                );
            } else {
                // user still online on another tab/device
                // optionally update socket_id to latest active socket:
                const anySocketId = [...(connectedUsers.get(userId) || [])][0] || null;
                await db.UserLog.update(
                { is_online: true, socket_id: anySocketId },
                { where: { user_id: userId } }
                );
            }
            await EmitOnlineUsers();
        });
    });

    async function CreateUserLogged(userId, socketId) {
        try {
            await db.UserLog.upsert({
                user_id: userId,
                socket_id: socketId,
                is_online: true,
            });
        } catch (e) {
            console.log(e);
        }
    }

    // THIS is the function that emits the online users list
    async function EmitOnlineUsers() {
        try {
            const users = await db.UserLog.findAll({
                where: { 
                    is_online: true 
                },
                include: {
                    model: db.User,
                    as: 'User',
                    // optional: limit fields
                    // attributes: ['id','name','role','avatar','username','status']
                },
                order: [['updatedAt', 'DESC']],
            });
            io.emit('EmitOnlineUsers', users);
        } catch (e) {
            console.log(e);
        }
    }

    async function EmitNotifications(receiverId) {
        const [notificationCount, notifications] = await Promise.all([
            db.Notification.count({
                where: { receiver_id: receiverId, status: 'unread' },
            }),
            db.Notification.findAll({
                where: { receiver_id: receiverId, status: 'unread' },
                order: [['createdAt', 'DESC']],
            }),
        ]);
        io.to(`user:${receiverId}`).emit('EmitNotifications', {
            notifications,
            count: notificationCount,
        });
    }

    async function EmitEmployee(id) {
        const row = await db.EmployeeAccount.findOne({
            where: { user_id: id },
            include: [
                {
                model: db.Employee,
                as: "employee",
                include: [
                    {
                    model: db.Employment,
                    as: "employment",
                    include: [
                        {
                        model: db.Position,
                        as: "position",
                        },
                    ],
                    },
                    {
                    model: db.EmployeePhoto,
                    as: "photo",
                    },
                ],
                },
            ],
            });
            if (!row) {
  return res.status(404).json({ message: "Record not found" });
}

const employee = row.employee;
const photo = employee?.photo;

let photoBase64 = null;

if (photo?.avatar) {
  const mime = "image/png";
  photoBase64 = `data:${mime};base64,${photo.avatar.toString("base64")}`;
}

const record = {
  id: employee?.id,
  first_name: employee?.first_name,
  middle_name: employee?.middle_name,
  last_name: employee?.last_name,
  suffix: employee?.suffix,
  email: employee?.email,
  contact_number: employee?.contact_number,
  address: employee?.address,
  employment: employee?.employment,
  photo: photoBase64,
};

const data = record;
        io.emit('EmitEmployee', data);
    }
};