const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
    telegram_username: {type: String, required: true, unique: true}
})

module.exports = model('NewUser', schema)
