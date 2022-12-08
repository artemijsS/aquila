let userSessions = require('../user_sessions')
const io = require('../socket').get();

module.exports = class signalSocket {

    sendSignal(userId, signal) {
        try {
            Object.keys(userSessions[userId]).map(socket => {
                io.to(socket).emit('newSignal', signal)
            })
        } catch (e) {}
    }

    closeSignal(userId, signal) {
        try {
            Object.keys(userSessions[userId]).map(socket => {
                io.to(socket).emit('closeSignal', signal)
            })
        } catch (e) {}
    }

    deleteSignal(userId, signalId) {
        try {
            Object.keys(userSessions[userId]).map(socket => {
                io.to(socket).emit('deleteSignal', signalId)
            })
        } catch (e) {}
    }

};
