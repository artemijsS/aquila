const Binance = require('node-binance-api');
const jwt = require('jsonwebtoken');
const Telegram = require('./telegram.util')
const telegram = new Telegram()

const signalController = require('../controllers/signal.controller')
const sigContr = new signalController

const strategyController = require('../controllers/strategies.controller')
const strContr = new strategyController

const userStrategyController = require('../controllers/userStrategies.controller')
const usrStrContr = new userStrategyController

module.exports = class BinanceUtil {

    async createNormalPosition(data, crypto, tp, sl, strategyName, side, strategyId) {
        crypto = crypto + "USDT"
        const API_KEY = jwt.verify(data.user.BINANCE_API_KEY, process.env.JWT_SECRET)
        const API_SECRET = jwt.verify(data.user.BINANCE_API_SECRET, process.env.JWT_SECRET)

        const positionAmount = await this.checkOpenPosition(crypto, API_KEY, API_SECRET)
        if (positionAmount) {

            const lastSignal = await sigContr.findLast(data.user._id, strategyName)
            if (lastSignal && !lastSignal.closed) {
                const exitPrice = await this.closeOpenPosition(crypto, positionAmount, API_KEY, API_SECRET)
                if (!exitPrice) {
                    await sigContr.deleteSignal(lastSignal._id, strategyName, data.user.telegram_chatId, lastSignal.telegramMsgId)
                    await telegram.sendError(data.user.telegram_chatId, "Be careful\nProblem with closing previous signal")
                    throw "Problem with closing previous signal"
                }

                const closedSignal = await sigContr.closeDefault(lastSignal._id, exitPrice)
                await telegram.sendSignalExit(data.user.telegram_chatId, strategyName, crypto, closedSignal.profit, lastSignal.telegramMsgId)
                await strContr.addProfit(strategyId, closedSignal.profit)
                await usrStrContr.changeStat(data._id, closedSignal.profit)
            } else {
                await telegram.sendError(data.user.telegram_chatId, "Strategy - <b>" + strategyName + "</b>\nPosition already opened by you or different strategy")
                throw "Position already opened by you or different strategy"
            }
        }

        const binance = new Binance().options({
            APIKEY: API_KEY,
            APISECRET: API_SECRET
        })

        const price = await binance.futuresMarkPrice(crypto).then(res => res.markPrice)
        const quantityWithoutPrecision = (data.amount * data.leverage) / price
        const quantity = Number(quantityWithoutPrecision.toString().split('.')[0] + "." + quantityWithoutPrecision.toString().split('.')[1].slice(0, data.crypto.data.quantityPrecision))

        let order, stopLoss, takeProfit;

        await binance.futuresCancelAll(crypto)

        if (side === "LONG") {
            order = await binance.futuresMarketBuy(crypto, quantity, {newOrderRespType: 'RESULT'})
       } else {
            order = await binance.futuresMarketSell(crypto, quantity, {newOrderRespType: 'RESULT'})
         }

        if (order.msg) {
            await telegram.sendError(data.user.telegram_chatId, "Strategy - <b>" + strategyName + "</b>\n" + order.msg)
            throw order.msg
        }

        if (side === "LONG") {
            stopLoss = await binance.futuresMarketSell(crypto, quantity, {type: 'STOP_MARKET', workingType: 'MARK_PRICE', stopPrice: sl, closePosition: true})
            takeProfit = await binance.futuresMarketSell(crypto, quantity, {type: 'TAKE_PROFIT_MARKET', workingType: 'MARK_PRICE', stopPrice: tp, closePosition: true})
        } else {
            stopLoss = await binance.futuresMarketBuy(crypto, quantity, {type: 'STOP_MARKET', workingType: 'MARK_PRICE', stopPrice: sl, closePosition: true})
            takeProfit = await binance.futuresMarketBuy(crypto, quantity, {type: 'TAKE_PROFIT_MARKET', workingType: 'MARK_PRICE', stopPrice: tp, closePosition: true})
        }

        if (stopLoss.msg || takeProfit.msg) {
            await telegram.sendError(data.user.telegram_chatId, "Strategy - <b>" + strategyName + "</b>\nError with stop loss or take profit\nBe careful and check it in exchange")
        }

        const msg = await telegram.sendSignal(data.user.telegram_chatId, strategyName, crypto, side, order.avgPrice, data.amount, data.leverage, tp, sl)
        return [order.avgPrice, msg.message_id]
    }

    async checkOpenPosition(crypto, API_KEY, API_SECRET) {
        const binance = new Binance().options({
            APIKEY: API_KEY,
            APISECRET: API_SECRET
        })

        const positions = await binance.futuresPositionRisk()
        const symbolPosition = positions.find(pos => pos.symbol === crypto)

        return Number(symbolPosition.positionAmt)

    }

    async closeOpenPosition(crypto, positionAmount, API_KEY, API_SECRET) {
        const binance = new Binance().options({
            APIKEY: API_KEY,
            APISECRET: API_SECRET
        })

        await binance.futuresCancelAll(crypto)

        let cancelPosition
        if (positionAmount < 0) {
            cancelPosition = await binance.futuresMarketBuy(crypto, Math.abs(positionAmount), { newOrderRespType: 'RESULT' })
        } else {
            cancelPosition = await binance.futuresMarketSell(crypto, Math.abs(positionAmount), { newOrderRespType: 'RESULT' })
        }

        return cancelPosition.avgPrice
    }

    async closeNormalPosition(data, crypto, strategyName, side) {
        crypto = crypto + "USDT"
        const API_KEY = jwt.verify(data.user.BINANCE_API_KEY, process.env.JWT_SECRET)
        const API_SECRET = jwt.verify(data.user.BINANCE_API_SECRET, process.env.JWT_SECRET)

        const lastSignal = await sigContr.findLast(data.user._id, strategyName)

        const positionAmount = await this.checkOpenPosition(crypto, API_KEY, API_SECRET)
        if (positionAmount > 0 && side === "LONG" || positionAmount < 0 && side === "SHORT") {
            if (lastSignal && !lastSignal.closed) {
                const exitPrice = await this.closeOpenPosition(crypto, positionAmount, API_KEY, API_SECRET)
                if (!exitPrice) {
                    await sigContr.deleteSignal(lastSignal._id, strategyName, data.user.telegram_chatId, lastSignal.telegramMsgId)
                    await telegram.sendError(data.user.telegram_chatId, "Be careful\nProblem with closing last signal")
                    throw "Problem with closing previous signal"
                }

                const closedSignal = await sigContr.closeDefault(lastSignal._id, exitPrice)
                await telegram.sendSignalExit(data.user.telegram_chatId, strategyName, crypto, closedSignal.profit, lastSignal.telegramMsgId)
                await usrStrContr.changeStat(data._id, closedSignal.profit)
                return closedSignal.profit
            }
        } else {
            if (lastSignal && !lastSignal.closed) {
                await sigContr.deleteSignal(lastSignal._id, strategyName, data.user.telegram_chatId, lastSignal.telegramMsgId)
            }
        }

        return 0
    }

}
