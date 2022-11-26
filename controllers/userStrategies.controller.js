const mongoose = require("mongoose");

const Strategy = require('../models/Strategy');
const UserStrategies = require('../models/User_strategies');
const UserStrategiesCrypto = require('../models/User_strategies_crypto');

module.exports = class userStrategies {

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
            {$project: {_id: 1, strategy: "$strategy.data", crypto: 1}},
            {$unwind: "$strategy"},
            {$unwind: "$strategy"},
            {
                $project: {
                    _id: 1,
                    urlId: "$strategy.urlId",
                    name: "$strategy.name",
                    description: "$strategy.description",
                    percentage: "$strategy.percentage",
                    source: "$strategy.source",
                    rating: "$strategy.rating",
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
