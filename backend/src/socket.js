const ChatMessage = require('./models/ChatMessage'); // Make sure to import the model

module.exports = (server) => {
    const io = require('socket.io')(server, {
        cors: { origin: 'http://localhost:3000', credentials: true }
    });

    const onlineUsers = new Map();

    const getUserIdFromSocket = (socket) => {
        for (let [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) return userId;
        }
        return null;
    };

    io.on('connection', (socket) => {
        socket.on('join', (userId) => {
            socket.join(userId);
            onlineUsers.set(userId, socket.id);
            io.emit('onlineUsers', Array.from(onlineUsers.keys()));
        });

        // --- NEW SOCKET EVENT LISTENER ---
        socket.on('markAsRead', async({ receiverId, senderId }) => {
            try {
                await ChatMessage.updateMany({ receiver: receiverId, sender: senderId, isRead: false }, { $set: { isRead: true } });

                // Notify the original sender that their messages have been read
                const senderSocketId = onlineUsers.get(senderId);
                if (senderSocketId) {
                    // The 'readerId' is the person who just read the messages (receiverId)
                    io.to(senderSocketId).emit('messagesRead', { readerId: receiverId });
                }
            } catch (error) {
                console.error("Error in 'markAsRead' socket event:", error);
            }
        });

        socket.on('disconnect', () => {
            const userId = getUserIdFromSocket(socket);
            if (userId) {
                onlineUsers.delete(userId);
                io.emit('onlineUsers', Array.from(onlineUsers.keys()));
            }
        });
    });

    return io;
};
/*const jwt = require('jsonwebtoken');
const User = require('./models/User');

module.exports = (server) => {
    const io = require('socket.io')(server, {
        cors: { origin: 'http://localhost:3000', credentials: true }
    });

    // Use a Map for efficient lookups of online users
    const onlineUsers = new Map();

    const getUserIdFromSocket = (socket) => {
        // Simple helper to find userId from socketId
        for (let [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                return userId;
            }
        }
        return null;
    };

    io.on('connection', (socket) => {
        // User joins and is added to the online list
        socket.on('join', (userId) => {
            socket.join(userId); // Join a room with their own user ID
            onlineUsers.set(userId, socket.id);
            // Broadcast the updated list of online users to everyone
            io.emit('onlineUsers', Array.from(onlineUsers.keys()));
        });

        // Handle user disconnection
        socket.on('disconnect', () => {
            const userId = getUserIdFromSocket(socket);
            if (userId) {
                onlineUsers.delete(userId);
                // Broadcast the updated list of online users
                io.emit('onlineUsers', Array.from(onlineUsers.keys()));
            }
        });
    });

    return io;
};*/
/*const jwt = require('jsonwebtoken');
const User = require('./models/User');

module.exports = (server) => {
    const io = require('socket.io')(server, {
        cors: { origin: 'http://localhost:3000', credentials: true }
    });

    let onlineUsers = new Map();

    io.on('connection', (socket) => {
        // User joins the chat
        socket.on('join', (userId) => {
            socket.join(userId);
            onlineUsers.set(userId, socket.id);
            io.emit('onlineUsers', Array.from(onlineUsers.keys()));
        });

        // Private messaging
        socket.on('privateMessage', ({ receiverId, message }) => {
            const receiverSocketId = onlineUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('privateMessage', { senderId: socket.id, message });
            }
        });

        // User disconnects
        socket.on('disconnect', () => {
            onlineUsers.forEach((socketId, userId) => {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                }
            });
            io.emit('onlineUsers', Array.from(onlineUsers.keys()));
        });
    });

    return io;
};*/