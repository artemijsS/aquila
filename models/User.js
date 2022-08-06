const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
    telegram_username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    telegram_chatId: {type: String, required: true},
    role: {type: String, required: true},
    BINANCE_API: {type: String},
    description: {type: String},
    last_time_seen: {type: String}
})

module.exports = model('User', schema)
