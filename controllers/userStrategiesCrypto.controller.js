const UserStrategies = require('../models/User_strategies');
const UserStrategiesCrypto = require('../models/User_strategies_crypto');
const Crypto = require('../models/Crypto');
const Signal = require('../models/Signal');
const Strategy = require('../models/Strategy');

Array.prototype.diff = function(a)
{
    return this.filter(function(i) {return a.indexOf(i) < 0;});
}

module.exports = class userStrategiesCrypto {

    async add(userStrategiesId, cryptoArr) {
        for (let cr of cryptoArr) {
            try {
                const strategyCrypto = new UserStrategiesCrypto({
                    UserStrategiesId: userStrategiesId,
                    cryptoId: cr.value
                })
                await strategyCrypto.save()
            } catch (e) {
                return false
            }
        }
        return true
    }

    async edit(userStrategyId, cryptoArr) {
        // crypto adding
        let cryptoIds = JSON.stringify(cryptoArr.map(obj => obj.value))
        let userStrategiesCrypto = await UserStrategiesCrypto.find({ $and: [{UserStrategiesId: userStrategyId}, {disabled: {$ne: true}}] }, ['cryptoId'])
        userStrategiesCrypto = userStrategiesCrypto.map(obj => obj.cryptoId)
        const toDelete = userStrategiesCrypto.diff(cryptoIds)
        cryptoIds = JSON.parse(cryptoIds)
        const toAdd = cryptoIds.diff(userStrategiesCrypto)

        for (let cr of toDelete) {
            try {
                const candidate = await UserStrategiesCrypto.findOne({UserStrategiesId: userStrategyId, cryptoId: cr})
                if (candidate) {
                    const userStrategy = await UserStrategies.findOne({ userStrategyId })
                    const strategy = await Strategy.findOne({ _id: userStrategy.strategyId })
                    const crypto = await Crypto.findOne({ _id: cr })
                    const cryptoName = crypto.name
                    const strategyName = strategy.name
                    const userId = userStrategy.userId

                    const lastSignal = await Signal.findOne({ crypto: cryptoName, strategyName, userId, closed: false })
                    if (lastSignal) {
                        candidate.disabled = true
                        await candidate.save()
                    } else {
                        await UserStrategiesCrypto.deleteOne({ UserStrategiesId: userStrategyId, cryptoId: cr })
                    }
                }
            } catch (e) {
                return false
            }
        }

        for (let cr of toAdd) {
            try {
                const candidate = await UserStrategiesCrypto.findOne({ $and: [{UserStrategiesId: userStrategyId}, {cryptoId: cr}] })
                if (!candidate) {
                    const userStrategyCrypto = new UserStrategiesCrypto({
                        UserStrategiesId: userStrategyId,
                        cryptoId: cr
                    })
                    await userStrategyCrypto.save()
                } else {
                    candidate.disabled = false
                    await candidate.save()
                }
            } catch (e) {
                return false
            }
        }
        return true
    }

    async disableCrypto(strategyId, cryptoId) {
        const userStrategies = await UserStrategies.find({ strategyId })
        userStrategies.map(async userStrategy => {
            const userStrategiesCrypto = await UserStrategiesCrypto.findOne({ UserStrategiesId: userStrategy._id, cryptoId: cryptoId })
            if (userStrategiesCrypto) {
                userStrategiesCrypto.disabled = true
                await userStrategiesCrypto.save()
                const crypto = await Crypto.findOne({_id: cryptoId})
                const cryptoName = crypto.name
                const strategy = await Strategy.findOne({_id: strategyId})
                const strategyName = strategy.name
                const lastSignal = await Signal.findOne({
                    crypto: cryptoName,
                    userId: userStrategy.userId,
                    strategyName
                }, {}, {sort: {'created_at': -1}})
                if (!lastSignal) {
                    await this.deleteCrypto(userStrategy._id, cryptoId)
                } else if (lastSignal.closed) {
                    await this.deleteCrypto(userStrategy._id, cryptoId)
                }
            }
        })
    }

    async deleteCrypto(UserStrategiesId, cryptoId) {
        await UserStrategiesCrypto.deleteOne({ UserStrategiesId, cryptoId })
    }


    async deleteAllCrypto(UserStrategiesId) {
        await UserStrategiesCrypto.deleteMany({ UserStrategiesId })
    }

    async disableAllCrypto(userId, UserStrategiesId, strategy) {
        const cryptos = await UserStrategiesCrypto.find({ UserStrategiesId })
        cryptos.map(async userStrategiesCrypto => {
            const crypto = await Crypto.findOne({ _id: userStrategiesCrypto.cryptoId })
            const lastSignal = await Signal.findOne({ userId, strategyName: strategy.name, crypto: crypto.name, closed: false })
            if (lastSignal) {
                const usrStrCr = await UserStrategiesCrypto.findOne({ UserStrategiesId, cryptoId: crypto._id })
                usrStrCr.disabled = true
            } else {
                await this.deleteCrypto(UserStrategiesId, crypto._id)
            }
        })
    }

};
