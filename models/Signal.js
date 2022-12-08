const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
    userId: {type: Types.ObjectId, ref: 'User', required: true},
    strategyName: {type: String, required: true},
    crypto: {type: String, required: true},
    exchange: {type: String, required: true},
    closed: {type: Boolean, required: true, default: false},
    amount: {type: Number, required: true},
    leverage: {type: Number, required: true},
    position: {type: String, required: true},
    entryPrice: {type: Number},
    exitPrice: {type: Number},
    profit: {type: Number},
    telegramMsgId: {type: Number}
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

module.exports = model('Signal', schema)
