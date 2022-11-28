const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
    userId: {type: Types.ObjectId, ref: 'User'},
    strategyId: {type: Types.ObjectId, ref: 'Strategy'},
    disabled: {type: Boolean, required: true, default: false},
    amount: {type: Number, required: true},
    leverage: {type: Number, required: true}
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

module.exports = model('User_strategies', schema)