const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
    userStrategyId: {type: Types.ObjectId, ref: 'User_strategies'},
    closed: {type: Boolean, required: true, default: false},
    amount: {type: Number, required: true},
    profit: {type: Number}
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

module.exports = model('Signal', schema)
