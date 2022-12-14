const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
    UserStrategiesId: {type: Types.ObjectId, ref: 'User_strategies'},
    cryptoId: {type: Types.ObjectId, ref: 'Crypto'},
    disabled: {type: Boolean, default: false}
})

module.exports = model('User_strategies_crypto', schema)
