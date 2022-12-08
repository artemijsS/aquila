const mongoose = require("mongoose");

const Strategy = require('../models/Strategy');
const UserStrategies = require('../models/User_strategies');
const UserStrategiesCrypto = require('../models/User_strategies_crypto');

const userStrategiesCrypto = require('../controllers/userStrategiesCrypto.controller')
const usrStrCrContr = new userStrategiesCrypto

module.exports = class userStrategies {

    async add(userId, strategyId, amount, leverage, crypto) {
        const candidate = await UserStrategies.findOne({ strategyId: strategyId, userId: userId })
        if (candidate && candidate.disabled === false) {
            return { error: 1, msg: "Strategy already added" }
        }

        if (amount < 5) {
            return { error: 1, msg: "Amount must be >= 5" }
        }
        if (leverage < 1 || leverage > 50) {
            return { error: 1, msg: "Leverage must be from 1 till 50" }
        }

        if (candidate) {
            candidate.amount = amount
            candidate.leverage = leverage
            candidate.disabled = false
            const userStrategyCrypto = await usrStrCrContr.edit(candidate._id, crypto)
            if (!userStrategyCrypto) {
                return {error: 1, msg: "Problems with all crypto save"}
            }
            await candidate.save()
            return candidate
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

    async edit(userId, userStrategyId, amount, leverage, crypto) {
        const userStrategies = await UserStrategies.findOne({ _id: userStrategyId, userId: userId })
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

    async disable(userId, userStrategyId) {
        const userStrategy = await UserStrategies.findOne({ _id: userStrategyId, userId: userId })
        if (!userStrategy) {
            return {error: 1, msg: "Strategy does not exist"}
        }

        userStrategy.disabled = true

        await userStrategy.save()

        return userStrategy
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
            { $match: {data: { $ne: [] }} },
            { $count: "count" }
        ]).then(count => count[0] ? count[0].count : 0)
    }

    async getName(id) {
        const strategy = await UserStrategies.findOne({ _id: id }).populate('strategyId', 'name').select({_id: 0, name: '$strategyId.name'}).lean()
        return strategy.strategyId.name
    }

    async getByStrategyIdAndCrypto(strategyId, cryptoId) {
        return UserStrategies.aggregate([
            { $match: { strategyId } },
            {
                $lookup: {
                    from: "user_strategies_cryptos",
                    localField: "_id",
                    foreignField: "UserStrategiesId",
                    pipeline: [
                        { $match: { cryptoId } }, {$project: { disabled: 1, _id: 1, cryptoId: 1 } },
                        {
                            $lookup: {
                                from: "cryptos",
                                localField: "cryptoId",
                                foreignField: "_id",
                                as: "data"
                            }
                        },
                        { $unwind: "$data" }
                        ],
                    as: "crypto"
                }
            },
            { $unwind: '$crypto' },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    pipeline: [{$project: { _id: 1, telegram_username: 1, telegram_chatId: 1, disabled: 1, BINANCE_API_KEY: 1, BINANCE_API_SECRET: 1 }}],
                    as: "user"
                }
            },
            { $unwind: '$user' },
            { $project: { _id: 1, disabled: 1, amount: 1, leverage: 1, user: 1, crypto: 1 } }
        ])
    }

    async changeStat(_id, profit) {
        const userStrategy = await UserStrategies.findOne({ _id })
        if (profit === 0) {
            return
        }
        userStrategy.workedTimes = userStrategy.workedTimes + 1
        userStrategy.profitability = userStrategy.profitability + profit
        userStrategy.avgProfitability = Number(userStrategy.profitability / userStrategy.workedTimes).toFixed(2)
        if (profit > 0) {
            userStrategy.countOfWins = userStrategy.countOfWins + 1
        }
        userStrategy.percentOfWins = Number(userStrategy.countOfWins / userStrategy.workedTimes).toFixed(2)

        await userStrategy.save()
    }

};
