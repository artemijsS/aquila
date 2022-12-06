const Telegram = require('./telegram.util')
const telegram = new Telegram()

const usrController = require('../controllers/user.controller')
const usrContr = new usrController

module.exports = class Binance {

    async createNormalOrder(data, tp, sl, strategyName) {
        console.log("Deleting all different orders")
        console.log("Creating Order")
        const msg = await telegram.sendSignal(data.user.telegram_chatId, strategyName, 16000, data.amount, data.leverage, tp, sl)
        return [16000, msg.message_id]
    }

}
