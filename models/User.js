const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
    telegram_username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    telegram_chatId: {type: String, required: true},
    role: {type: String, required: true},
    BINANCE_API_KEY: {type: String},
    BINANCE_API_SECRET: {type: String},
    description: {type: String},
    last_time_seen: {type: String},
    twoFAuthentication: {type: Boolean},
    twoFAuthenticationCodeToken: {type: String}
})

module.exports = model('User', schema)
