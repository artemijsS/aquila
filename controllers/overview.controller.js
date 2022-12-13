const mongoose = require("mongoose");
const Signal = require('../models/Signal');

module.exports = class overview {

    async get(userId) {

        const openSignalsCount = await this.getOpenSignalsCount(userId)
        const closedSignalsCount = await this.getClosedSignalsCount(userId)
        const winSignalsCount = await this.getWinSignalsCount(userId)
        const winRate = (winSignalsCount / closedSignalsCount).toFixed(2) * 100
        const profit = await this.getProfit(userId)
        const topStrategies = await this.getTopStrategies(userId)
        const topCrypto = await this.getTopCrypto(userId)
        const worstCrypto = await this.getWorstCrypto(userId)
        const cryptoWinRates = await this.getCryptoWinRates(userId)

        return { openSignalsCount, closedSignalsCount, winSignalsCount, winRate, profit, topStrategies, topCrypto, worstCrypto, cryptoWinRates }
    }

    async getOpenSignalsCount(userId) {
        return Signal.aggregate([
            { $match: {userId: mongoose.mongo.ObjectID(userId)} },
            { $match: {closed: false} },
            { $count: "count" }
        ]).then(count => count[0] ? count[0].count : 0)
    }

    async getClosedSignalsCount(userId) {
        return Signal.aggregate([
            { $match: {userId: mongoose.mongo.ObjectID(userId)} },
            { $match: {closed: true} },
            { $count: "count" }
        ]).then(count => count[0] ? count[0].count : 0)
    }

    async getWinSignalsCount(userId) {
        return Signal.aggregate([
            { $match: {userId: mongoose.mongo.ObjectID(userId)} },
            { $match: {closed: true} },
            { $match: {profit: { $gt: 0 }} },
            { $count: "count" }
        ]).then(count => count[0] ? count[0].count : 0)
    }

    async getProfit(userId) {
        return Signal.aggregate([
            { $match: {userId: mongoose.mongo.ObjectID(userId)} },
            { $group: { _id: 0, profit: { $sum: "$profit" } } }
        ]).then(res =>  res[0] ? res[0].profit.toFixed(3) : 0 )
    }

    async getTopStrategies(userId) {
        const topStrategies = await Signal.aggregate([
            { $match: {userId: mongoose.mongo.ObjectID(userId)} },
            { $group: {
                    _id: "$strategyName",
                    totalProfit: { $sum: "$profit" },
                }
            },
            { $project: { _id: 0, strategyName: "$_id", totalProfit: {$toDouble: { $toDecimal: "$totalProfit" } }} },
            { $sort: {"totalProfit": -1} },
            { $limit: 5 }
        ])

        for (let i = 0; i < topStrategies.length; i++) {
            const topCrypto = await Signal.aggregate([
                { $match: {userId: mongoose.mongo.ObjectID(userId)} },
                { $match: {strategyName: topStrategies[i].strategyName} },
                { $group: {
                        _id: "$crypto",
                        cryptoProfit: { $sum: "$profit" }
                    }
                },
                { $sort: { "cryptoProfit": -1 } },
                { $limit: 1 }
            ])

            topStrategies[i].topCrypto = topCrypto[0]._id
            topStrategies[i].cryptoProfit = topCrypto[0].cryptoProfit
        }
        return topStrategies
    }

    async getTopCrypto(userId) {
        const topCrypto = await Signal.aggregate([
            { $match: {userId: mongoose.mongo.ObjectID(userId)} },
            { $group: {
                    _id: "$crypto",
                    cryptoProfit: { $sum: "$profit" }
                }
            },
            { $sort: { "cryptoProfit": -1 } },
            { $limit: 1 }
        ]).then(res => res[0] ? res[0] : null)
        if (topCrypto) {
            topCrypto.winRate = await this.getCryptoWinRate(userId, topCrypto)
        }
        return topCrypto
    }

    async getWorstCrypto(userId) {
        const worstCrypto = await Signal.aggregate([
            { $match: {userId: mongoose.mongo.ObjectID(userId)} },
            { $group: {
                    _id: "$crypto",
                    cryptoProfit: { $sum: "$profit" }
                }
            },
            { $sort: { "cryptoProfit": 1 } },
            { $limit: 1 }
        ]).then(res => res[0] ? res[0] : null)
        if (worstCrypto) {
            worstCrypto.winRate = await this.getCryptoWinRate(userId, worstCrypto)
        }
        return worstCrypto
    }

    async getCryptoWinRate(userId, crypto) {
        const cryptoCount = await Signal.aggregate([
            { $match: {userId: mongoose.mongo.ObjectID(userId)} },
            { $match: {crypto: crypto._id} },
            { $count: "count" }
        ]).then(count => count[0] ? count[0].count : 0)

        const cryptoWinCount = await Signal.aggregate([
            { $match: {userId: mongoose.mongo.ObjectID(userId)} },
            { $match: {crypto: crypto._id} },
            { $match: {profit: { $gt: 0 }} },
            { $count: "count" }
        ]).then(count => count[0] ? count[0].count : 0)

        return (cryptoWinCount / cryptoCount).toFixed(2) * 100
    }

    async getCryptoWinRates(userId) {
        return Signal.aggregate([
            { $match: {userId: mongoose.mongo.ObjectID(userId)} },
            {
                $group: {
                    _id: "$crypto",  // Group by the "crypto" field
                    totalTrades: { $sum: 1 },  // Count the total number of trades for each group
                    totalWinningTrades: {
                        $sum: {
                            $cond: [
                                { $gt: ["$profit", 0] },  // Check if the trade was profitable
                                1,  // If the trade was profitable, increment the totalWinningTrades count
                                0   // If the trade was not profitable, do not increment the count
                            ]
                        }
                    },
                    totalProfit: {
                        $sum: "$profit"
                    }
                }
            },
            { $addFields: {
                    winRate: {
                        $divide: [  // Divide the total number of winning trades by the total number of trades
                            "$totalWinningTrades",
                            "$totalTrades"
                        ]
                    }
                }
            },
            { $sort: {"winRate": -1, "totalProfit": -1 } },
            { $limit: 5 },
            { $project: { _id:0, crypto: "$_id", totalTrades: 1, totalWinningTrades: 1, totalProfit: 1, winRate: { $round: [{ $multiply: [100, "$winRate"] }, 2] } } }
        ])
    }

    async getProfitChart(userId, diapason) {
        const aggregation = [
            { $match: {userId: mongoose.mongo.ObjectID(userId)} },
            { $match: {closed: true} },
        ]

        if (diapason === "day") {
            aggregation.push({
                $group: {
                    _id: {
                        date: {
                            $dateToString: {format: "%Y-%m-%d", date: "$created_at"}
                        }
                    },
                    count: { $sum: 1 },
                    profit: { $sum: "$profit" }
                }
            })
        } else if (diapason === "year") {
            aggregation.push({ $match: {created_at: { $gte: new Date(Date.now() - (365 * 24 * 60 * 60 * 1000)), $lt: new Date() }} })
            aggregation.push({
                $group: {
                    _id: {
                        date: {
                            $month: "$created_at"
                        }
                    },
                    count: { $sum: 1 },
                    profit: { $sum: "$profit" }
                }
            })
        } else {
            throw "error"
        }

        aggregation.push({ $sort: { "_id.date": 1 } },{ $project: { _id: 0, date: "$_id.date", count: 1, profit: { $round: ["$profit", 3] } } })

        let profitChart = await Signal.aggregate(aggregation)

        profitChart = profitChart.map((date, i) => {
            if (i !== 0)
                date.profit = Number((profitChart[i-1].profit + date.profit).toFixed(3))
            if (diapason === "year") {
                date.date = this.getMonthName(Number(date.date))
            }
            return date
        })
        return profitChart
    }

    getMonthName(index) {
        const month = [
            null,
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ]
        return month[index]
    }

};
