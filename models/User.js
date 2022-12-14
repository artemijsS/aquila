const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
    telegram_username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    telegram_chatId: {type: String, required: true, unique: true},
    role: {type: String, required: true},
    BINANCE_API_KEY: {type: String},
    BINANCE_API_SECRET: {type: String},
    last_time_seen: {type: String},
    twoFAuthentication: {type: Boolean, default: false},
    twoFAuthenticationCodeToken: {type: String},
    twoFAuthenticationConfirm: {type: String},
    disabled: {type: Boolean, default: false},
    disabledActionsBinance: {type: Boolean, default: true},
    notifications: {type: Boolean, default: false},
    JWTs: {type: [String], required: false, default: []}
})

module.exports = model('User', schema)
