let userSessions = require('../user_sessions')
const usrController = require('../controllers/user.controller')
const usrContr = new usrController

module.exports = (socket, io) => {

    socket.on('userSessionStart', (user) => {
        if (userSessions[user.id])
            userSessions[user.id][socket.id] = user.token
        else
            userSessions[user.id] = { [socket.id]: user.token }

        socket.userId = user.id
        socket.token = user.token
        console.log("User session - " + user.id)
        console.log(userSessions)
    })

    socket.on('disconnect', () => {
        if (userSessions[socket.userId])
            delete userSessions[socket.userId][socket.id]
        console.log("Disconnected - " + socket.userId)
        console.log(userSessions)
    })

    socket.on('logout', async () => {
        if (userSessions[socket.userId]) {
            delete userSessions[socket.userId][socket.id]
        }
        await usrContr.deleteJWT(socket.userId, socket.token)
    })

}
