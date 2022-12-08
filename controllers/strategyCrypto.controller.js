const StrategyCrypto = require('../models/Strategy_crypto');
const Signal = require('../models/Signal');
const Crypto = require('../models/Crypto');

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

    async edit(strategyId, cryptoArr, strategyName) {
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
                    const crypto = await Crypto.findOne({ _id: cr })
                    const signal = await Signal.findOne({ closed: false, strategyName, crypto: crypto.name })
                    await usrStrContr.disableCrypto(strategyId, cr)
                    if (!signal) {
                        await StrategyCrypto.deleteOne({ strategyId, cryptoId: cr })
                    } else {
                        candidate.disabled = true
                        await candidate.save()
                    }
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

    async checkForDisabled(strategyId, cryptoId, strategyName) {
        const candidate = await StrategyCrypto.findOne({ strategyId, cryptoId, disabled: true})
        if (!candidate)
            return false
        await this.delete(strategyId, cryptoId, strategyName)
        return true
    }

    async delete(strategyId, cryptoId, strategyName) {
        const crypto = await Crypto.findOne({ _id: cryptoId })
        const signal = await Signal.findOne({ closed: false, strategyName, crypto: crypto.name })
        if (!signal) {
            await StrategyCrypto.deleteOne({ strategyId, cryptoId })
        }
    }

    async get(strategyId, crypto) {
        return StrategyCrypto.aggregate([
            { $match: { strategyId } },
            {
                $lookup: {
                    from: "cryptos",
                    localField: "cryptoId",
                    foreignField: "_id",
                    pipeline: [
                        { $match: { name: crypto } }
                    ],
                    as: "crypto"
                }
            },
            { $unwind: "$crypto" },
            { $project: { name: "$crypto.name", _id: "$crypto._id" } }
        ]).then(res => res.length > 0 ? res[0] : false )
    }

};
