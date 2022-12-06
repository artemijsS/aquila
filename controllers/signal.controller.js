const Signal = require('../models/Signal');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Telegram = require('../utils/telegram.util')
const telegram = new Telegram()


module.exports = class signal {

    async create(userId, strategyName, exchange, amount, leverage, entryPrice, telegramMsgId) {
        const signal = new Signal({
            userId, strategyName, exchange, amount, leverage, entryPrice, telegramMsgId
        })
        await signal.save()

        return true
    }

};
