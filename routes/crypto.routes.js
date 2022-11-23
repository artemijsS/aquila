const { Router } = require('express')
const { check, validationResult } = require('express-validator')
const auth = require('../middleware/auth.middleware')
const admin = require('../middleware/admin.middleware')
const Binance = require('node-binance-api');
const binance = new Binance();

const Crypto = require('../models/Crypto')

const router = Router();

// api/crypto/new
router.post('/updateBinanceCrypto', auth, admin,
    async (req, res) => {
        try {
            const exchangeInfo = await binance.futuresExchangeInfo()

            const regex = /[A-Z]*USDT/g
            const symbolsObj = exchangeInfo.symbols.filter(obj => obj.symbol.match(regex))
            const symbols = symbolsObj.map(obj => {return { name: obj.symbol.split('USDT')[0], quantityPrecision: obj.quantityPrecision }})

            for (const symbol of symbols) {
                const candidate = await Crypto.findOne({ name: symbol.name })
                if (!candidate) {
                    const crypto = new Crypto({ name: symbol.name, quantityPrecision: symbol.quantityPrecision })
                    await crypto.save()
                } else {
                    candidate.quantityPrecision = symbol.quantityPrecision
                    candidate.save()
                }
            }

            res.json('NICE')
        } catch (e) {
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
})

// api/crypto/get
router.get('/get', auth,
    async (req, res) => {
        try {

            let page = 0
            let size = 2
            let count;
            let search = '';

            if (req.query.page) {
                page = req.query.page
            }
            if (req.query.search) {
                search = req.query.search
            }

            const crypto = await Crypto.find({ name: {$regex: search, $options: 'i'}})
                .limit(size).skip(size * page).sort({
                    name: "asc"
                })

            count = await Crypto.find({ name: {$regex: search, $options: 'i'}}).countDocuments()

            res.json({page: page, pages: Math.ceil(count/size), data: crypto})
        } catch (e) {
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })

module.exports = router;
