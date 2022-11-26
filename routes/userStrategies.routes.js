const { Router } = require('express');
const { check, validationResult } = require('express-validator')
const auth = require('../middleware/auth.middleware');

const userStrategiesController = require('../controllers/userStrategies.controller')
const userStrContr = new userStrategiesController

const Page = require('../utils/page.util')

const UserStrategies = require('../models/User_strategies');
const UserStrategiesCrypto = require('../models/User_strategies_crypto');

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
            console.log(e)
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })

// api/userStrategies/add
router.post('/add', auth, [
        check('strategyId', 'Incorrect strategyId').notEmpty(),
        check('amount', 'Incorrect amount').notEmpty().isNumeric(),
        check('leverage', 'Incorrect leverage').notEmpty().isNumeric({no_symbols: true}),
        check('crypto', 'Incorrect crypto').notEmpty().isArray({min: 1})
    ],
    async (req, res) => {
        try {

            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: "Validator issue"
                })
            }

            const userId = req.user.userId
            const { strategyId, amount, leverage, crypto } = req.body;

            const candidate = await UserStrategies.find({ $and: [{strategyId: strategyId}, {userId: userId}] })
            if (candidate.length !== 0) {
                return res.status(400).json({ message: "Strategy already added" })
            }

            if (amount <= 5) {
                return res.status(400).json({ error: 1, value: "amount" })
            }
            if (leverage < 1 || leverage > 50) {
                return res.status(400).json({ error: 1, value: "leverage" })
            }

            const userStrategies = UserStrategies({
                userId,
                strategyId,
                disabled: false,
                amount,
                leverage
            })

            // crypto adding
            for (let cr of crypto) {
                try {
                    const strategyCrypto = new UserStrategiesCrypto({
                        UserStrategiesId: userStrategies._id,
                        cryptoId: cr.value
                    })
                    await strategyCrypto.save()
                } catch (e) {
                    console.log(e)
                    return res.status(400).json({error: 1, msg: "Problems with all crypto save"})
                }
            }

            await userStrategies.save()

            res.json({userStrategies})
        } catch (e) {
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })

module.exports = router;
