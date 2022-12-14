const mongoose = require("mongoose");
const Signal = require('../models/Signal');
const Telegram = require('../utils/telegram.util')
const telegram = new Telegram()
const signalSocket = require('../utils/signalSocket.util')
const sigSocket = new signalSocket()

module.exports = class signal {

    async createDefault(userId, strategyName, crypto, exchange, amount, leverage, position, entryPrice, telegramMsgId) {
        const signal = new Signal({
            userId, strategyName, crypto, exchange, amount, leverage, position, entryPrice, telegramMsgId
        })
        await signal.save()
        sigSocket.sendSignal(userId, signal)
        return true
    }

    async createTestOpenSignal() {
        const signal = {
            userId: "638df2d094a63e8d3f0abfb6",
            strategyName: 'test',
            crypto: 'XRP',
            exchange: 'BINANCE',
            closed: false,
            amount: 6,
            leverage: 1,
            position: 'LONG',
            entryPrice: 0.3858,
            telegramMsgId: 933,
            _id: "6396381cbf05eab99e5d6fb1",
            created_at: "2022-12-11T22:05:48.534Z",
            updated_at: "2022-12-11T20:05:48.534Z",
            __v: 0
        }

        sigSocket.sendSignal("638df2d094a63e8d3f0abfb6", signal)
        return true
    }

    async findLast(userId, strategyName) {
        return Signal.findOne({ userId, strategyName }, {}, { sort: { 'created_at' : -1 } })
    }

    async closeDefault(_id, exitPrice) {
        const signal = await Signal.findOne({ _id })

        signal.exitPrice = exitPrice
        if (signal.position === "LONG")
            signal.profit = Number((signal.amount * signal.leverage) * exitPrice - (signal.amount * signal.leverage) * signal.entryPrice).toFixed(3)
        else
            signal.profit = Number((signal.amount * signal.leverage) * signal.entryPrice - (signal.amount * signal.leverage) * exitPrice).toFixed(3)

        signal.closed = true

        await signal.save()
        sigSocket.closeSignal(signal.userId, signal)
        return signal
    }

    async deleteSignal(_id, strategyName, chatId, msgReplay) {
        const signal = await Signal.findOne({ _id })
        await Signal.deleteOne({ _id })
        await telegram.sendError(chatId, strategyName + " signal deleted because of error or your own position!", msgReplay)
        sigSocket.deleteSignal(signal.userId, _id)
    }

    async get(userId, search, sort, position, cryptos, page, size) {
        const aggregation = [
            {$match: {userId: mongoose.mongo.ObjectID(userId)}},
            {$match: {strategyName: {$regex: search, $options: 'i'}}},
            {$match: {position: {$regex: position, $options: 'i'}}}
        ]
        if (cryptos.length > 0) {
            aggregation.push({$match: {crypto: { $in: cryptos }}})
        }

        let sortAggregation = {$sort: { created_at: -1}}
        if (sort) {
            sortAggregation = {$sort: { [sort]: -1, created_at: -1 }}
        }

        aggregation.push(sortAggregation)

        const yesterday = new Date();  // current date
        yesterday.setDate(yesterday.getDate() - 1);

        aggregation.push(
            {
                $addFields: {
                    created_at: {
                        $cond: [
                            // Check if the created_at date is today
                            {
                                $eq: [
                                    { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
                                    { $dateToString: { format: '%Y-%m-%d', date: new Date() } }
                                ]
                            },
                            // If created_at date is today, concatenate the time with " today"
                            { $concat: [{ $dateToString: { format: '%H:%M', date: '$created_at' }}, ' today'] },
                            // If created_at date is not today, check if it is yesterday
                            {
                                $cond: [
                                    // Check if the created_at date is yesterday
                                    {
                                        $eq: [
                                            { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
                                            { $dateToString: { format: '%Y-%m-%d', date: yesterday } }
                                        ]
                                    },
                                    // If created_at date is yesterday, concatenate the time with " yesterday"
                                    { $concat: [{ $dateToString: { format: '%H:%M', date: '$created_at' }}, ' yesterday'] },
                                    // If created_at date is not today or yesterday, return the date and time in the format "HH:MM DD/MM/YYYY"
                                    { $dateToString: { format: '%H:%M %d/%m/%Y', date: '$created_at' } }
                                ]
                            }
                        ]
                    }
                }
            }
        )

        aggregation.push({$skip: size * page}, {$limit: size})

        return Signal.aggregate(aggregation)
    }

    async getCount(userId, search, position, cryptos) {

        const aggregation = [
            {$match: {userId: mongoose.mongo.ObjectID(userId)}},
            {$match: {strategyName: {$regex: search, $options: 'i'}}},
            {$match: {position: {$regex: position, $options: 'i'}}}
        ]
        if (cryptos.length > 0) {
            aggregation.push({$match: {crypto: { $in: cryptos }}})
        }

        aggregation.push({ $count: "count" })

        return await Signal.aggregate(aggregation).then(count => count[0] ? count[0].count : 0)
    }

    async deleteOpenSignal(userId, _id) {
        const signal = await Signal.findOne({ userId, _id, closed: false })
        if (!signal) {
            throw "no signal found"
        }
        await Signal.deleteOne({ userId, _id, closed: false })
    }

};
