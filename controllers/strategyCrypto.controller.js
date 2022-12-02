const StrategyCrypto = require('../models/Strategy_crypto');

const userStrategiesCryptoController = require('./userStrategiesCrypto.controller')
const usrStrContr = new userStrategiesCryptoController

Array.prototype.diff = function(a)
{
    return this.filter(function(i) {return a.indexOf(i) < 0;});
}

module.exports = class strategyCrypto {

    async addMany(strategyId, cryptoArr) {

        for (let cr of cryptoArr) {
            try {
                const strategyCrypto = new StrategyCrypto({
                    strategyId: strategyId,
                    cryptoId: cr.value
                })
                await strategyCrypto.save()
            } catch (e) {
                console.log(e)
                return false
            }
        }

        return true
    }

    async edit(strategyId, cryptoArr) {
        // crypto adding
        let cryptoIds = JSON.stringify(cryptoArr.map(obj => obj.value))
        let strategiesCrypto = await StrategyCrypto.find({ $and: [{strategyId: strategyId}, {disabled: {$ne: true}}] }, ['cryptoId'])
        strategiesCrypto = strategiesCrypto.map(obj => obj.cryptoId)
        const toDelete = strategiesCrypto.diff(cryptoIds)
        cryptoIds = JSON.parse(cryptoIds)
        const toAdd = cryptoIds.diff(strategiesCrypto)

        for (let cr of toDelete) {
            try {
                const candidate = await StrategyCrypto.findOne({strategyId: strategyId, cryptoId: cr})
                if (candidate) {
                    candidate.disabled = true
                    await candidate.save()
                    await usrStrContr.disableCrypto(strategyId, cr)
                }
            } catch (e) {
                return false
            }
        }

        for (let cr of toAdd) {
            try {
                const candidate = await StrategyCrypto.findOne({ $and: [{strategyId: strategyId}, {cryptoId: cr}] })
                if (!candidate) {
                    const strategyCrypto = new StrategyCrypto({
                        strategyId: strategyId,
                        cryptoId: cr
                    })
                    await strategyCrypto.save()
                } else {
                    candidate.disabled = false
                    await candidate.save()
                }
            } catch (e) {
                console.log(e)
                return false
            }
        }

        return true
    }

};
