const Strategy = require('../models/Strategy');
const User = require('../models/User');
const StrategyCrypto = require('../models/Strategy_crypto');
const UserStrategies = require('../models/User_strategies');
const UserStrategiesCrypto = require('../models/User_strategies_crypto');
const Telegram = require('../utils/telegram.util')
const telegram = new Telegram()

const strategiesCryptoController = require('../controllers/strategyCrypto.controller')
const strCrContr = new strategiesCryptoController

module.exports = class strategies {

    async addNew(urlId, name, description, source, cryptoArr) {

        // name check
        const candidate = await Strategy.findOne({ name })
        if (candidate) {
            return {error: 1, value: "name"}
        }

        const strategy = new Strategy({
            urlId,
            name,
            description,
            source
        });

        const strategyCrypto = await strCrContr.addMany(strategy._id, cryptoArr)
        if (!strategyCrypto) {
            return {error: 2, value: "crypto"}
        }

        await strategy.save()
        return strategy
    }

    async edit(name, urlId, description, source, cryptoArr) {

        // urlId check
        let strategy = await Strategy.findOne({ name })
        if (!strategy) {
            return {error: 1, value: "No strategy with this name"}
        }

        strategy.urlId = urlId
        strategy.description = description
        strategy.source = source

        const strategyCrypto = await strCrContr.edit(strategy._id, cryptoArr, name)
        if (!strategyCrypto) {
            return {error: 2, value: "crypto"}
        }

        await strategy.save();

        const res = await this.get(1, 0, strategy.name)

        return res[0]
    }

    async getOne(name, urlId) {
        return Strategy.findOne({ name, urlId })
    }

    async get(size, page, search, one = false) {
        return Strategy.aggregate([
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
                        },
                        { $unwind: "$data" },
                    ],
                    as: "crypto"
                }
            },
            { $project: {_id: 1, urlId: 1, name: 1, description: 1, source: 1, workedTimes: 1, percentOfWins: 1, crypto: "$crypto.data"} },
            { $sort: {name: 1} },
            { $skip: size * page },
            { $limit: size }
        ])
    }

    async getCount(search) {
        return Strategy.find({ $or: [{urlId: {$regex: search, $options: 'i'}}, {name: {$regex: search, $options: 'i'}}] }).countDocuments()
    }


    async getStrategiesForUser(userId, size, page, search) {
        const userStrategiesTmp = await UserStrategies.find({ userId: userId, disabled: false }).select('strategyId')
        const userStrategies = userStrategiesTmp.map(obj => obj.strategyId)

        return Strategy.aggregate([
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
                        },
                        { $unwind: "$data" },
                    ],
                    as: "crypto"
                }
            },
            { $project: {_id: 1, urlId: 1, name: 1, description: 1, source: 1, workedTimes: 1, percentOfWins: 1, crypto: "$crypto.data"} },
            { $sort: {name: 1} },
            { $skip: size * page },
            { $limit: size }
        ])
    }

    async getStrategiesForUserCount(userId, search) {
        const userStrategiesTmp = await UserStrategies.find({ userId: userId }).select('strategyId')
        const userStrategies = userStrategiesTmp.map(obj => obj.strategyId)

        return Strategy.find({$and: [ {$or: [{urlId: {$regex: search, $options: 'i'}}, {name: {$regex: search, $options: 'i'}}] }, {_id: {$nin: userStrategies}} ]})
            .countDocuments()
    }

    async deleteStrategy(name) {
        const strategy = await Strategy.findOne({name})

        const userStrategies = await UserStrategies.find({ strategyId: strategy._id })

        userStrategies.map(async userStrategy => {
            await UserStrategiesCrypto.deleteMany({UserStrategiesId: userStrategy._id})
        })

        await UserStrategies.deleteOne({strategyId: strategy._id})

        const strategyCryptos = await StrategyCrypto.find({ strategyId: strategy._id })

        strategyCryptos.map(async strategyCrypto => {
            await StrategyCrypto.deleteOne({_id: strategyCrypto._id})
        })

        await Strategy.deleteOne({ name })

        userStrategies.map(async userStrategy => {
            const user = await User.findOne({ _id: userStrategy.userId })
            await telegram.sendNotification(user.telegram_chatId, "Be aware,\n<b>" + name + "</b> strategy deleted by Admin\n\n❗️❗️ Please check stock market ❗️❗️")
        })
    }


    async changeStat(_id, allProfit) {
        const strategy = await Strategy.findOne({ _id })
        if (allProfit === 0) {
            return
        }
        strategy.workedTimes = strategy.workedTimes + 1
        strategy.profitability = strategy.profitability + allProfit
        strategy.avgProfitability = Number(Number(strategy.profitability / strategy.workedTimes).toFixed(2))
        if (allProfit > 0) {
            strategy.countOfWins = strategy.countOfWins + 1
        }
        strategy.percentOfWins = Number(strategy.countOfWins / strategy.workedTimes).toFixed(2) * 100

        await strategy.save()
    }

    async addProfit(_id, profit) {
        const strategy = await Strategy.findOne({ _id })
        if (profit === 0) {
            return
        }

        strategy.profitability = strategy.profitability + profit

        await strategy.save()
    }

    async updateState(_id, win) {
        const strategy = await Strategy.findOne({ _id })

        strategy.workedTimes = strategy.workedTimes + 1
        strategy.avgProfitability = Number(Number(strategy.profitability / strategy.workedTimes).toFixed(2))
        if (win) {
            strategy.countOfWins = strategy.countOfWins + 1
        }
        strategy.percentOfWins = Number(strategy.countOfWins / strategy.workedTimes).toFixed(2) * 100

        await strategy.save()
    }

};
