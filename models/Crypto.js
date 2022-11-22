const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
    name: {type: String, required: true, unique: true},
    quantityPrecision: {type: Number, required: true}
})

module.exports = model('Crypto', schema)
