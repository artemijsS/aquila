let userSessions = require('../user_sessions')
const io = require('../socket').get();

module.exports = class signalSocket {

    sendSignal(userId, signal) {
        Object.keys(userSessions[userId]).map(socket => {
            io.to(socket).emit('newSignal', signal)
        })
    }

    closeSignal(userId, signal) {
        Object.keys(userSessions[userId]).map(socket => {
            io.to(socket).emit('closeSignal', signal)
        })
    }

    deleteSignal(userId, signalId) {
        Object.keys(userSessions[userId]).map(socket => {
            io.to(socket).emit('deleteSignal', signalId)
        })
    }

};
