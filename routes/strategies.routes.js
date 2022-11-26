const { Router } = require('express');
const { check } = require('express-validator')
const auth = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');
const validation = require('../middleware/validation.middleware');

const strategiesController = require('../controllers/strategies.controller')
const strContr = new strategiesController

const Page = require('../utils/page.util')

const router = Router();

// api/strategies/new
router.post('/new', auth, admin, [
        check('urlId', 'Incorrect urlId').notEmpty(),
        check('name', 'Incorrect name').notEmpty(),
        check('description', 'Incorrect description').notEmpty(),
        check('percentage', 'Incorrect percentage').notEmpty(),
        check('source', 'Incorrect source').notEmpty(),
        check('crypto', 'Incorrect crypto').notEmpty().isArray()
    ],
    validation,
    async (req, res) => {
        try {

            const { urlId, name, description, percentage, source, crypto } = req.body;

            const strategy = await strContr.addNew(urlId, name, description, percentage, source, crypto)

            if (strategy.error) {
                return res.status(400).json(strategy)
            }

            res.json({strategy})
        } catch (e) {
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
})

// api/strategies/get
router.get('/get', auth,
    async (req, res) => {
        try {

            const page = new Page(req, 2)

            const strategies = await strContr.get(page.Size, page.Page, page.Search)
            const count = await strContr.getCount(page.Search)

            page.setData(strategies)
            page.setCount(count)

            res.json(page.pageResponse())
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })

// api/strategies/delete
router.delete('/delete', auth, admin,
    async (req, res) => {
        try {
            let urlId

            if (req.query.urlId) {
                urlId = req.query.urlId
            } else {
                return res.status(400).json({error: 1, msg: "no urlId"})
            }

            await strContr.deleteStrategy(urlId)

            res.json({urlId: urlId, msg: "deleted"})
        } catch (e) {
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })

// api/strategies/edit
router.post('/edit', auth, admin, [
        check('urlId', 'Incorrect urlId').notEmpty(),
        check('description', 'Incorrect description').notEmpty(),
        check('percentage', 'Incorrect percentage').notEmpty(),
        check('source', 'Incorrect source').notEmpty(),
        check('crypto', 'Incorrect crypto').notEmpty().isArray(),
    ],
    validation,
    async (req, res) => {
        try {

            const { urlId, description, percentage, source, crypto } = req.body;

            const strategy = await strContr.edit(urlId, description, percentage, source, crypto)

            if (strategy.error) {
                return res.status(400).json(strategy)
            }

            res.json({strategy})
        } catch (e) {
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })


//                  userActions

// api/strategies/user/get
router.get('/user/get', auth,
    async (req, res) => {
        try {

            const page = new Page(req, 2);

            const userId = req.user.userId

            const strategies = await strContr.getStrategiesForUser(userId, page.Size, page.Page, page.Search)
            const count = await strContr.getStrategiesForUserCount(userId, page.Search)

            page.setData(strategies)
            page.setCount(count)

            res.json(page.pageResponse())
        } catch (e) {
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })


module.exports = router;
