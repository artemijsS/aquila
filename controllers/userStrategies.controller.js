const mongoose = require("mongoose");

const Strategy = require('../models/Strategy');
const UserStrategies = require('../models/User_strategies');
const UserStrategiesCrypto = require('../models/User_strategies_crypto');

const userStrategiesCrypto = require('../controllers/userStrategiesCrypto.controller')
const usrStrCrContr = new userStrategiesCrypto

module.exports = class userStrategies {

    async add(userId, strategyId, amount, leverage, crypto) {
        const candidate = await UserStrategies.find({ $and: [{strategyId: strategyId}, {userId: userId}] })
        if (candidate.length !== 0) {
            return { message: "Strategy already added" }
        }

        if (amount < 5) {
            return { error: 1, msg: "Amount must be >= 5" }
        }
        if (leverage < 1 || leverage > 50) {
            return { error: 1, msg: "Leverage must be from 1 till 50" }
        }

        const userStrategies = UserStrategies({
            userId,
            strategyId,
            disabled: false,
            amount,
            leverage
        })

        const userStrategyCrypto = await usrStrCrContr.add(userStrategies._id, crypto)
        if (!userStrategyCrypto) {
            return {error: 1, msg: "Problems with all crypto save"}
        }

        await userStrategies.save()

        return userStrategies
    }

    async edit(userStrategyId, amount, leverage, crypto) {
        const userStrategies = await UserStrategies.findOne({ _id: userStrategyId })
        if (!userStrategies) {
            return { message: "Strategy does not exist" }
        }

        if (amount < 5) {
            return { error: 1, msg: "Amount must be >= 5" }
        }
        if (leverage < 1 || leverage > 50) {
            return { error: 1, msg: "Leverage must be from 1 till 50" }
        }

        userStrategies.amount = amount
        userStrategies.leverage = leverage

        const strategyCrypto = await usrStrCrContr.edit(userStrategyId, crypto)
        if (!strategyCrypto) {
            return {error: 2, value: "crypto"}
        }

        await userStrategies.save()

        return userStrategies
    }

    async get(userId, size, page, search) {
        return UserStrategiesCrypto.aggregate([
            {$match: {disabled: false}},
            {$group: {_id: "$UserStrategiesId", cryptoId: {$addToSet: '$cryptoId'}}},
            {$unwind: "$cryptoId"},
            {
                $lookup: {
                    from: "cryptos",
                    localField: "cryptoId",
                    foreignField: "_id",
                    pipeline: [{$project: {_id: 0, 'value': '$_id', 'label': '$name'}}],
                    as: "crypto"
                }
            },
            {$unwind: "$crypto"},
            {$group: {_id: "$_id", crypto: {$addToSet: '$crypto'}}},
            {
                $lookup: {
                    from: "user_strategies",
                    localField: "_id",
                    foreignField: "_id",
                    pipeline: [
                        {$match: {$and: [{userId: mongoose.mongo.ObjectID(userId)}, {disabled: false}]}},
                        {
                            $lookup: {
                                from: "strategies",
                                localField: "strategyId",
                                foreignField: "_id",
                                pipeline: [
                                    {
                                        $match: {
                                            $or: [
                                                {urlId: {$regex: search, $options: 'i'}},
                                                {name: {$regex: search, $options: 'i'}}
                                            ]
                                        }
                                    },
                                    {$sort: {name: 1}}
                                ],
                                as: "data"
                            }
                        }
                    ],
                    as: "strategy"
                }
            },
            {$project: {_id: 1, strategy: "$strategy.data", crypto: 1, leverage: "$strategy.leverage", amount: "$strategy.amount"}},
            {$unwind: "$strategy"},
            {$unwind: "$strategy"},
            {$unwind: "$amount"},
            {$unwind: "$leverage"},
            {
                $project: {
                    _id: 1,
                    urlId: "$strategy.urlId",
                    name: "$strategy.name",
                    description: "$strategy.description",
                    percentage: "$strategy.percentage",
                    source: "$strategy.source",
                    rating: "$strategy.rating",
                    strategyId: "$strategy._id",
                    leverage: 1,
                    amount: 1,
                    crypto: 1
                }
            },
            {$sort: {name: 1}},
            {$skip: size * page},
            {$limit: size}
        ]);
    }

    async getCount(userId, search) {
        return await Strategy.aggregate([
            { $match: {$or: [{urlId: {$regex: search, $options: 'i'}}, {name: {$regex: search, $options: 'i'}}]} },
            {
                $lookup: {
                    from: "user_strategies",
                    localField: "_id",
                    foreignField: "strategyId",
                    pipeline: [{$match: {$and: [{userId: mongoose.mongo.ObjectID(userId)}, {disabled: false}]}}],
                    as: "data"
                }
            },
            { $count: "count" }
        ]).then(count => count[0].count)
    }

};
