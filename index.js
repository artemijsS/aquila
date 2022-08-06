const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
require('./telegram/telegram');

const app = express();

app.use(cors());
app.use(express.json({ extended: true }));


const PORT = process.env.PORT || 5000;

// registration, login
app.use('/api/auth', require('./routes/auth.routes'));

// signals
app.use('/api/signal', require('./routes/signal.routes'));

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

        const server = app.listen(PORT, () => console.log(`App has been started on port ${PORT}...`))

    } catch (e) {
        console.log(e)
    }
}

startApp()
