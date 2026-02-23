// sockets/online-users.js (or inside socket server file)

async function emitOnlineUsers(io, db) {
  try {
    // If your OnlineUser table already tracks who is online:
    const users = await db.OnlineUser.findAll({
      where: { is_online: true },
      include: [
        {
          model: db.User,
          as: 'User',
          attributes: ['id', 'name', 'username', 'role', 'avatar', 'status'],
        },
      ],
      order: [['updatedAt', 'DESC']],
    });

    io.emit('EmitOnlineUsers', users);
  } catch (err) {
    console.error('emitOnlineUsers error:', err.message);
  }
}

module.exports = { emitOnlineUsers };