const { Router } = require('express');
const { check } = require('express-validator')
const auth = require('../middleware/auth.middleware');
const validation = require('../middleware/validation.middleware');
const Binance = require('../utils/binance.util')
const binance = new Binance

const Telegram = require('../utils/telegram.util')
const telegram = new Telegram()

const strategiesController = require('../controllers/strategies.controller')
const strContr = new strategiesController

const strategyCryptoController = require('../controllers/strategyCrypto.controller')
const strCrContr = new strategyCryptoController

const userStrategiesController = require('../controllers/userStrategies.controller')
const usrStrContr = new userStrategiesController

const signalController = require('../controllers/signal.controller')
const sigContr = new signalController

const Page = require('../utils/page.util')

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

            const { alertMessage, action } = strategy

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

            if (action === "LONG" || action === "SHORT") {
                for (let userStrategy of userStrategies) {
                    if (userStrategy.user.disabled) {
                        continue
                    }

                    let entryPrice, telegramMsgId
                    try {
                        [entryPrice, telegramMsgId] = await binance.createNormalPosition(userStrategy, crypto, tp, sl, strategyName, action, strategyDB._id)
                    } catch (e) {
                        if (e !== "no") {
                            console.log(userStrategy.user.telegram_username + "  " + e)
                            await telegram.sendError(userStrategy.user.telegram_chatId, "Please check the exchange because an unexpected error has occurred")
                        }
                        continue
                    }

                    if (entryPrice && telegramMsgId)
                        await sigContr.createDefault(userStrategy.user._id, strategyName, crypto, exchange, userStrategy.amount, userStrategy.leverage, action, entryPrice, telegramMsgId)
                }

                const strategyUpdated = await strContr.getOne(strategyName, "/default")
                if (strategyUpdated.profitability !== strategyDB.profitability) {
                    await strContr.updateState(strategyUpdated._id, strategyUpdated.profitability >= strategyDB.profitability)
                    await strCrContr.checkForDisabled(strategyDB._id, cryptoSupports._id, strategyName)
                }

            } else {
                const profits = []
                for (let userStrategy of userStrategies) {

                    try {
                        profits.push(await binance.closeNormalPosition(userStrategy, crypto, strategyName, action.split(' ')[1]))
                    } catch (e) {
                        await telegram.sendError(userStrategy.user.telegram_chatId, "Please check the exchange because an unexpected error has occurred")
                        console.log(userStrategy.user.telegram_username + "  " + e)
                    }
                }

                let allProfit = 0;
                for (let profit of profits) {
                    allProfit+=profit
                }

                if (allProfit !== 0) {
                    await strContr.changeStat(strategyDB._id, allProfit)
                }

                await strCrContr.checkForDisabled(strategyDB._id, cryptoSupports._id, strategyName)

            }

            res.json('NICE')
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
})

// api/signals/testOpenSignal
router.post('/testOpenSignal',
    async (req, res) => {
        try {

            await sigContr.createTestOpenSignal()

            res.json('NICE')
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })


// api/signals/actions/get
router.post('/actions/get', auth, [
        check('search', 'Incorrect search').isString(),
        check('cryptos', 'Incorrect crypto').isArray(),
        check('sort', 'Incorrect sort').isString(),
        check('position', 'Incorrect position').isString(),
    ],
    validation,
    async (req, res) => {
        try {
            const userId = req.user.userId
            const { search, cryptos, sort, position } = req.body;

            const page = new Page(req, 6)

            const signals = await sigContr.get(userId, search, sort, position, cryptos, page.Page, page.Size)
            const count = await sigContr.getCount(userId, search, position, cryptos)

            page.setData(signals)
            page.setCount(count)

            res.json(page.pageResponse())
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })

// api/signals/actions/delete
router.delete('/actions/delete', auth,
    async (req, res) => {
        try {
            const userId = req.user.userId

            let signalId;
            if (!req.query.signalId) {
                return res.status(400).json("signalId is mandatory")
            }
            signalId = req.query.signalId

            await sigContr.deleteOpenSignal(userId, signalId)

            res.json("Deleted")
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })

module.exports = router;
