const Signal = require('../models/Signal');
const Telegram = require('../utils/telegram.util')
const telegram = new Telegram()

module.exports = class signal {

    async createDefault(userId, strategyName, crypto, exchange, amount, leverage, position, entryPrice, telegramMsgId) {
        const signal = new Signal({
            userId, strategyName, crypto, exchange, amount, leverage, position, entryPrice, telegramMsgId
        })
        await signal.save()

        return true
    }

    async findLast(userId, strategyName) {
        return Signal.findOne({ userId, strategyName }, {}, { sort: { 'created_at' : -1 } })
    }

    async closeDefault(_id, exitPrice) {
        const signal = await Signal.findOne({ _id })

        signal.exitPrice = exitPrice
        if (signal.position === "LONG")
            signal.profit = Number((signal.amount * signal.leverage) * exitPrice - (signal.amount * signal.leverage) * signal.entryPrice).toFixed(3)
        else
            signal.profit = Number((signal.amount * signal.leverage) * signal.entryPrice - (signal.amount * signal.leverage) * exitPrice).toFixed(3)

        signal.closed = true

        await signal.save()
        return signal
    }

    async deleteSignal(_id, strategyName, chatId, msgReplay) {
        await Signal.deleteOne({ _id })
        await telegram.sendError(chatId, strategyName + " signal deleted because of error or your own position!", msgReplay)
    }

};
