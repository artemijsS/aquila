const Strategy = require('../models/Strategy');
const StrategyCrypto = require('../models/Strategy_crypto');
const UserStrategies = require('../models/User_strategies');
const UserStrategiesCrypto = require('../models/User_strategies_crypto');

const strategiesCryptoController = require('../controllers/strategyCrypto.controller')
const strCrContr = new strategiesCryptoController

module.exports = class strategies {

    async addNew(urlId, name, description, percentage, source, cryptoArr) {

        // urlId check
        let candidate = await Strategy.findOne({ urlId })
        if (candidate) {
            return {error: 1, value: "urlId"}
        }

        // name check
        candidate = await Strategy.findOne({ name })
        if (candidate) {
            return {error: 1, value: "name"}
        }

        const strategy = new Strategy({
            urlId,
            name,
            description,
            percentage,
            source
        });

        const strategyCrypto = await strCrContr.addMany(strategy._id, cryptoArr)
        if (!strategyCrypto) {
            return {error: 2, value: "crypto"}
        }

        await strategy.save()
        return strategy
    }

    async edit(urlId, description, percentage, source, cryptoArr) {

        // urlId check
        let strategy = await Strategy.findOne({ urlId })
        if (!strategy) {
            return {error: 1, value: "No strategy with this urlId"}
        }

        strategy.description = description
        strategy.percentage = percentage
        strategy.source = source

        const strategyCrypto = await strCrContr.edit(strategy._id, cryptoArr)
        if (!strategyCrypto) {
            return {error: 2, value: "crypto"}
        }

        await strategy.save();

        const res = await this.get(1, 0, strategy.urlId)

        return res[0]
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
            { $project: {_id: 1, urlId: 1, name: 1, description: 1, percentage: 1, source: 1, crypto: "$crypto.data"} },
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
            { $project: {_id: 1, urlId: 1, name: 1, description: 1, percentage: 1, source: 1, crypto: "$crypto.data"} },
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

    async deleteStrategy(urlId) {
        const strategy = await Strategy.findOne({urlId})

        await UserStrategiesCrypto.deleteMany({UserStrategiesId: strategy._id})
        await UserStrategies.deleteOne({strategyId: strategy._id})

        await StrategyCrypto.deleteMany({strategyId: strategy._id})
        await Strategy.deleteOne({ urlId })
    }


};