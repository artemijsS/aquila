const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
    strategyId: {type: Types.ObjectId, ref: 'Strategy'},
    cryptoId: {type: Types.ObjectId, ref: 'Crypto'}
})

module.exports = model('Strategy_crypto', schema)
