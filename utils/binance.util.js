const Binance = require('node-binance-api');
const jwt = require('jsonwebtoken');
const Telegram = require('./telegram.util')
const telegram = new Telegram()

const signalController = require('../controllers/signal.controller')
const sigContr = new signalController

module.exports = class BinanceUtil {

    async createNormalOrder(data, crypto, tp, sl, strategyName, position) {

        const API_KEY = jwt.verify(data.user.BINANCE_API_KEY, process.env.JWT_SECRET)
        const API_SECRET = jwt.verify(data.user.BINANCE_API_SECRET, process.env.JWT_SECRET)

        const check = await this.checkOpenPosition(crypto, API_KEY, API_SECRET)
        if (check) {
            const lastSignal = await sigContr.findLast(data.user._id, strategyName)
            if (lastSignal && !lastSignal.closed) {
            //    closePosition && close signal
            }
        }


        console.log("Deleting all different orders")
        console.log("Creating Order")


        const msg = await telegram.sendSignal(data.user.telegram_chatId, strategyName, 16000, data.amount, data.leverage, tp, sl)
        return [16000, msg.message_id]
    }

    async checkOpenPosition(crypto, API_KEY, API_SECRET) {
        const binance = new Binance().options({
            APIKEY: API_KEY,
            APISECRET: API_SECRET
        })

        const positions = await binance.futuresPositionRisk()
        console.log(positions[0])
        const symbolPosition = positions.find(pos => pos.symbol === crypto + "USDT")

        return Number(symbolPosition.positionAmt) !== 0

    }

}
