const { Router } = require('express');
const { check } = require('express-validator')
const validation = require('../middleware/validation.middleware');
const Binance = require('../utils/binance.util')
const binance = new Binance

const strategiesController = require('../controllers/strategies.controller')
const strContr = new strategiesController

const strategyCryptoController = require('../controllers/strategyCrypto.controller')
const strCrContr = new strategyCryptoController

const userStrategiesController = require('../controllers/userStrategies.controller')
const usrStrContr = new userStrategiesController

const signalController = require('../controllers/signal.controller')
const sigContr = new signalController

const router = Router();

// api/signals/default
router.post('/default', [
        check('passphrase', 'Incorrect data').notEmpty().equals(process.env.SIGNALS_SECRET),
        check('time', 'Incorrect data').notEmpty(),
        check('exchange', 'Incorrect data').notEmpty(),
        check('ticker', 'Incorrect data').notEmpty(),
        check('strategyName', 'Incorrect data').notEmpty(),
        check('strategy', 'Incorrect data').notEmpty().isObject()
    ],
    validation,
    async (req, res) => {
        try {
            const { exchange, ticker, strategyName, strategy } = req.body;

            const crypto = ticker.split('USDT')[0]

            if (!strategy.alertMessage || !strategy.side || !strategy.price || !strategy.action || !strategy.marketPosition) {
                return res.status(400).json("Validator issue")
            }

            const { alertMessage, side, price, action, marketPosition } = strategy

            const [tp, sl] = alertMessage.split(";")

            const strategyDB = await strContr.getOne(strategyName, "/default")

            if (!strategyDB) {
                return res.status(400).json("No such strategy")
            }

            const cryptoSupports = await strCrContr.get(strategyDB._id, crypto)
            if (!cryptoSupports) {
                return res.status(400).json("Crypto unsupported")
            }

            const userStrategies = await usrStrContr.getByStrategyIdAndCrypto(strategyDB._id, cryptoSupports._id)
            console.log(userStrategies)

            if (action === "LONG" || action === "SHORT") {
                for (let userStrategy of userStrategies) {
                    if (userStrategy.disabled || userStrategy.crypto.disabled || userStrategy.user.disabled) {
                        continue
                    }

                    const [entryPrice, telegramMsgId] = await binance.createNormalOrder(userStrategy, crypto, tp, sl, strategyName, action)

                    // await sigContr.create(userStrategy.user._id, strategyName, exchange, userStrategy.amount, userStrategy.leverage, entryPrice, telegramMsgId)


                }
            }

            // bot.sendMessage("617330875", "test")
            res.json('NICE')
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
})

module.exports = router;
