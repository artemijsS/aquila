const { Server } = require("socket.io");
let io;

module.exports = {
    init: (server) => {
        io = new Server(server, { cors: {origin: '*'} });

        return io;
    },
    get: () => {
        if (!io) {
            throw new Error("socket is not initialized");
        }
        return io;
    }
};
