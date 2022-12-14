const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const { createServer } = require("http");

const app = express();

const httpServer = createServer(app);

//**************************
//  SOCKETS
//**************************

const io = require('./socket.js').init(httpServer);

io.on("connection", (socket) => {
    require('./sockets/online.socket')(socket, io)
});

//**************************

app.use(cors());
app.use(express.json({ extended: true }));


const PORT = process.env.PORT || 5000;

// registration, login
app.use('/api/auth', require('./routes/auth.routes'));

// signals
app.use('/api/signals', require('./routes/signals.routes'));

// user
app.use('/api/user', require('./routes/user.routes'));

// userNew
app.use('/api/userNew', require('./routes/userInvite.routes'));

// strategies
app.use('/api/strategies', require('./routes/strategies.routes'));

// userStrategies
app.use('/api/userStrategies', require('./routes/userStrategies.routes'));

// crypto
app.use('/api/crypto', require('./routes/crypto.routes'));

// overview
app.use('/api/overview', require('./routes/overview.routes'));

//**************************
//  REACT APP
//**************************

const path = require('path');
app.use(express.static(path.join(__dirname, 'client/build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

//**************************

async function startApp() {
    try {
        // mongoDB connection
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        httpServer.listen(PORT, () => console.log(`App has been started on port ${PORT}...`))
    } catch (e) {
        console.log(e)
    }
}

startApp()
