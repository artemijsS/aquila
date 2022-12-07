const Signal = require('../models/Signal');


module.exports = class signal {

    async create(userId, strategyName, exchange, amount, leverage, entryPrice, telegramMsgId) {
        const signal = new Signal({
            userId, strategyName, exchange, amount, leverage, entryPrice, telegramMsgId
        })
        await signal.save()

        return true
    }

    async findLast(userId, strategyName) {
        return Signal.findOne({ userId, strategyName }, {}, { sort: { 'created_at' : -1 } })
    }

};
