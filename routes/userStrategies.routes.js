const { Router } = require('express');
const { check } = require('express-validator')
const auth = require('../middleware/auth.middleware');
const validation = require('../middleware/validation.middleware');
const userBinanceActionsCheck = require('../middleware/userBinanceActionsCheck.middleware');
const telegramNotification = require('../middleware/telegramNotification.middleware');

const userStrategiesController = require('../controllers/userStrategies.controller')
const userStrContr = new userStrategiesController

const Page = require('../utils/page.util')

const router = Router();

// api/userStrategies/get
router.get('/get', auth,
    async (req, res) => {
        try {
            const page = new Page(req, 2);

            const userId = req.user.userId

            const userStrategies = await userStrContr.get(userId, page.Size, page.Page, page.Search)
            const count = await userStrContr.getCount(userId, page.Search)

            page.setData(userStrategies)
            page.setCount(count)

            res.json(page.pageResponse())
        } catch (e) {
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })

// api/userStrategies/add
router.post('/add', auth, userBinanceActionsCheck, [
        check('strategyId', 'Incorrect strategyId').notEmpty(),
        check('amount', 'Incorrect amount').notEmpty().isNumeric(),
        check('leverage', 'Incorrect leverage').notEmpty().isNumeric({no_symbols: true}),
        check('crypto', 'Incorrect crypto').notEmpty().isArray({min: 1})
    ],
    validation,
    async (req, res, next) => {
        try {

            const userId = req.user.userId
            const { strategyId, amount, leverage, crypto } = req.body;

            const userStrategies = await userStrContr.add(userId, strategyId, amount, leverage, crypto)
            if (userStrategies.error) {
                return res.status(400).json(userStrategies)
            }

            const name = await userStrContr.getName(userStrategies._id)
            res.json({userStrategies})
            req.notificationMessage = name + " strategy added!"
            next()

        } catch (e) {
            console.log(e)
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    }, telegramNotification)

// api/userStrategies/edit
router.post('/edit', auth, userBinanceActionsCheck, [
        check('userStrategyId', 'Incorrect strategyId').notEmpty(),
        check('amount', 'Incorrect amount').notEmpty().isNumeric(),
        check('leverage', 'Incorrect leverage').notEmpty().isNumeric({no_symbols: true}),
        check('crypto', 'Incorrect crypto').notEmpty().isArray({min: 1})
    ],
    validation,
    async (req, res, next) => {
        try {

            const userId = req.user.userId
            const { userStrategyId, amount, leverage, crypto } = req.body;

            const userStrategies = await userStrContr.edit(userId, userStrategyId, amount, leverage, crypto)
            if (userStrategies.error) {
                return res.status(400).json(userStrategies)
            }

            const name = await userStrContr.getName(userStrategies._id)
            res.json({userStrategies})
            req.notificationMessage = "<b>"+name+"</b>" + " strategy edited!\namount = "
                + amount
                + "\nleverage = " + leverage
                + "\ncryptos =" + crypto.map(obj => " " + obj.label).toString()
            next()
        } catch (e) {
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    }, telegramNotification)

// api/userStrategies/disable
router.post('/disable', auth, userBinanceActionsCheck, [
        check('userStrategyId', 'Incorrect strategyId').notEmpty()
    ],
    validation,
    async (req, res, next) => {
        try {

            const userId = req.user.userId
            const { userStrategyId } = req.body;

            const userStrategies = await userStrContr.disable(userId, userStrategyId)
            if (userStrategies.error) {
                return res.status(400).json(userStrategies)
            }

            const name = await userStrContr.getName(userStrategies._id)

            res.json({userStrategies})
            req.notificationMessage = name + " strategy deleted!"
            next()
        } catch (e) {
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    }, telegramNotification)

module.exports = router;
