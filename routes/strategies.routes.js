const { Router } = require('express');
const { check, validationResult } = require('express-validator')
const auth = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');

const Strategy = require('../models/Strategy');
const UserStrategies = require('../models/User_strategies');
const StrategyCrypto = require('../models/Strategy_crypto');

const router = Router();

Array.prototype.diff = function(a)
{
    return this.filter(function(i) {return a.indexOf(i) < 0;});
}

// api/strategies/new
router.post('/new', auth, admin, [
        check('urlId', 'Incorrect urlId').notEmpty(),
        check('name', 'Incorrect name').notEmpty(),
        check('description', 'Incorrect description').notEmpty(),
        check('percentage', 'Incorrect percentage').notEmpty(),
        check('source', 'Incorrect source').notEmpty(),
        check('crypto', 'Incorrect crypto').notEmpty().isArray()
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

            const { urlId, name, description, percentage, source, crypto } = req.body;
            // urlId check
            let candidate = await Strategy.findOne({ urlId })
            if (candidate) {
                return res.status(400).json({error: 1, value: "urlId"})
            }

            // name check
            candidate = await Strategy.findOne({ name })
            if (candidate) {
                return res.status(400).json({error: 1, value: "name"})
            }

            const strategy = new Strategy({
                urlId,
                name,
                description,
                percentage,
                source
            });

            // crypto adding
            for (let cr of crypto) {
                try {
                    const strategyCrypto = new StrategyCrypto({
                        strategyId: strategy._id,
                        cryptoId: cr.value
                    })
                    await strategyCrypto.save()
                } catch (e) {
                    console.log(e)
                    return res.status(400).json({error: 2, value: "crypto"})
                }
            }

            await strategy.save();

            res.json({strategy})
        } catch (e) {
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
})

// api/strategies/get
router.get('/get', auth,
    async (req, res) => {
        try {

            let page = 0
            let size = 2
            let count;
            let search = '';

            if (req.query.page) {
                page = req.query.page
            }
            if (req.query.search) {
                search = req.query.search
            }

            const strategies = await Strategy.aggregate([
                { $match: { $or: [{urlId: {$regex: search, $options: 'i'}}, {name: {$regex: search, $options: 'i'}}] } },
                {
                    $lookup: {
                        from: "strategy_cryptos",
                        localField: "_id",
                        foreignField: "strategyId",
                        pipeline: [
                            { $match: {disabled: {$ne: true}} },
                            { $project: { _id: 0, 'value': '$cryptoId' }},
                            {
                                $lookup: {
                                    from: "cryptos",
                                    localField: "value",
                                    foreignField: "_id",
                                    pipeline: [
                                        { $project: { _id: 0, 'value': '$_id', 'label': '$name' } }
                                    ],
                                    as: "data"
                                }
                            }
                        ],
                        as: "crypto"
                    }
                },
                { $project: {_id: 1, urlId: 1, name: 1, description: 1, percentage: 1, source: 1, crypto: "$crypto.data"} },
                { $sort: {name: 1} },
                { $skip: size * page },
                { $limit: size }
                ])

            count = await Strategy.find({ $or: [{urlId: {$regex: search, $options: 'i'}}, {name: {$regex: search, $options: 'i'}}] }).countDocuments()

            res.json({page: page, pages: Math.ceil(count/size), data: strategies})
        } catch (e) {
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })

// api/strategies/delete
router.delete('/delete', auth, admin,
    async (req, res) => {
        try {
            let urlId

            if (req.query.urlId) {
                urlId = req.query.urlId
            } else {
                return res.status(400).json({error: 1, msg: "no urlId"})
            }
            const strategy = await Strategy.findOne({urlId})

            await StrategyCrypto.deleteMany({strategyId: strategy._id})

            await Strategy.deleteOne({ urlId })

            res.json({urlId: urlId, msg: "deleted"})
        } catch (e) {
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })

// api/strategies/edit
router.post('/edit', auth, admin, [
        check('urlId', 'Incorrect urlId').notEmpty(),
        check('description', 'Incorrect description').notEmpty(),
        check('percentage', 'Incorrect percentage').notEmpty(),
        check('source', 'Incorrect source').notEmpty(),
        check('crypto', 'Incorrect crypto').notEmpty().isArray(),
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

            const { urlId, description, percentage, source, crypto } = req.body;

            // urlId check
            let strategy = await Strategy.findOne({ urlId })
            if (!strategy) {
                return res.status(400).json({error: 1, value: "No strategy with this urlId"})
            }

            strategy.description = description
            strategy.percentage = percentage
            strategy.source = source

            // crypto adding
            let cryptoIds = JSON.stringify(crypto.map(obj => obj.value))
            let strategiesCrypto = await StrategyCrypto.find({ $and: [{strategyId: strategy._id}, {disabled: {$ne: true}}] }, ['cryptoId'])
            strategiesCrypto = strategiesCrypto.map(obj => obj.cryptoId)
            const toDelete = strategiesCrypto.diff(cryptoIds)
            cryptoIds = JSON.parse(cryptoIds)
            const toAdd = cryptoIds.diff(strategiesCrypto)

            for (let cr of toDelete) {
                try {
                    const candidate = await StrategyCrypto.findOne({strategyId: strategy._id, cryptoId: cr})
                    if (candidate) {
                        candidate.disabled = true
                        await candidate.save()
                    }
                } catch (e) {
                    return res.status(400).json({error: 2, value: "crypto"})
                }
            }

            for (let cr of toAdd) {
                try {
                    const candidate = await StrategyCrypto.findOne({ $and: [{strategyId: strategy._id}, {cryptoId: cr}] })
                    if (!candidate) {
                        const strategyCrypto = new StrategyCrypto({
                            strategyId: strategy._id,
                            cryptoId: cr
                        })
                        await strategyCrypto.save()
                    }
                } catch (e) {
                    console.log(e)
                    return res.status(400).json({error: 2, value: "crypto"})
                }
            }

            await strategy.save();

            res.json({strategy})
        } catch (e) {
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })


//                  userActions

// api/strategies/user/get
router.get('/user/get', auth,
    async (req, res) => {
        try {

            let page = 0
            let size = 2
            let count;
            let search = '';

            if (req.query.page) {
                page = req.query.page
            }
            if (req.query.search) {
                search = req.query.search
            }

            const userId = req.user.userId

            const userStrategiesTmp = await UserStrategies.find({ userId: userId }).select('strategyId')
            const userStrategies = userStrategiesTmp.map(obj => obj.strategyId)

            const strategies = await Strategy.aggregate([
                { $match: { $and: [ {$or: [{urlId: {$regex: search, $options: 'i'}}, {name: {$regex: search, $options: 'i'}}]}, {_id: {$nin: userStrategies}} ] } },
                {
                    $lookup: {
                        from: "strategy_cryptos",
                        localField: "_id",
                        foreignField: "strategyId",
                        pipeline: [
                            { $match: {disabled: {$ne: true}} },
                            { $project: { _id: 0, 'value': '$cryptoId' }},
                            {
                                $lookup: {
                                    from: "cryptos",
                                    localField: "value",
                                    foreignField: "_id",
                                    pipeline: [
                                        { $project: { _id: 0, 'value': '$_id', 'label': '$name' } }
                                    ],
                                    as: "data"
                                }
                            }
                        ],
                        as: "crypto"
                    }
                },
                { $project: {_id: 1, urlId: 1, name: 1, description: 1, percentage: 1, source: 1, crypto: "$crypto.data"} },
                { $sort: {name: 1} },
                { $skip: size * page },
                { $limit: size }
            ])

            // const strategies = await Strategy.find({$and: [ {$or: [{urlId: {$regex: search, $options: 'i'}}, {name: {$regex: search, $options: 'i'}}] }, {_id: {$nin: userStrategies}} ]})
            //     .limit(size).skip(size * page).sort({
            //         name: "asc"
            //     })

            count = await Strategy.find({$and: [ {$or: [{urlId: {$regex: search, $options: 'i'}}, {name: {$regex: search, $options: 'i'}}] }, {_id: {$nin: userStrategies}} ]})
                .countDocuments()

            res.json({page: page, pages: Math.ceil(count/size), data: strategies})
        } catch (e) {
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })

// api/strategies/user/add
router.post('/add', auth, [
        check('strategyId', 'Incorrect strategyId').notEmpty(),
        check('amount', 'Incorrect amount').notEmpty().isNumeric(),
        check('leverage', 'Incorrect leverage').notEmpty().isNumeric({no_symbols: true})
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
            const { strategyId, amount, leverage } = req.body;

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

            await userStrategies.save()

            res.json({userStrategies})
        } catch (e) {
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })


module.exports = router;
