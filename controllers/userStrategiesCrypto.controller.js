const UserStrategies = require('../models/User_strategies');
const UserStrategiesCrypto = require('../models/User_strategies_crypto');
const StrategyCrypto = require('../models/Strategy_crypto');

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
                    candidate.disabled = true
                    await candidate.save()
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
            }
        })
    }

};
