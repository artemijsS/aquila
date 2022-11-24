const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
    strategyId: {type: Types.ObjectId, ref: 'Strategy', required: true},
    cryptoId: {type: Types.ObjectId, ref: 'Crypto', required: true},
    disabled: {type: Boolean, default: false}
})

module.exports = model('Strategy_crypto', schema)
