const { Router } = require('express')
const auth = require('../middleware/auth.middleware')

const overviewController = require('../controllers/overview.controller')
const owContr = new overviewController

const router = Router();

// api/overview/get
router.get('/get', auth,
    async (req, res) => {
        try {

            const userId = req.user.userId

            const {
                openSignalsCount,
                closedSignalsCount,
                winSignalsCount,
                winRate,
                profit,
                topStrategies,
                topCrypto,
                worstCrypto,
                cryptoWinRates
            } = await owContr.get(userId)

            res.json({ openSignalsCount, closedSignalsCount, winSignalsCount, winRate, profit, topStrategies, topCrypto, worstCrypto, cryptoWinRates })
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })

// api/overview/getProfitChart
router.get('/getProfitChart', auth,
    async (req, res) => {
        try {

            const userId = req.user.userId

            let diapason = "day"

            if (req.query.diapason) {
                diapason = req.query.diapason
            }

            const profitChart = await owContr.getProfitChart(userId, diapason)

            res.json(profitChart)
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })

module.exports = router;
