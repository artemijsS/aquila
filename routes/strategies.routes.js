const { Router } = require('express');
const { check, validationResult } = require('express-validator')
const auth = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');

const Strategy = require('../models/Strategy');

const router = Router();

// api/strategies/new
router.post('/new', auth, admin, [
        check('urlId', 'Incorrect urlId').notEmpty(),
        check('name', 'Incorrect name').notEmpty(),
        check('description', 'Incorrect description').notEmpty(),
        check('percentage', 'Incorrect percentage').notEmpty(),
        check('source', 'Incorrect source').notEmpty(),
    ],
    async (req, res) => {
        try {

            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: "Validator issue"
                })
            }

            const { urlId, name, description, percentage, source } = req.body;

            // urlId check
            let candidate = await Strategy.findOne({ urlId })
            if (candidate) {
                return res.status(400).json({error: 1, value: "urlId"})
            }

            // name check
            candidate = await Strategy.findOne({ name })
            if (candidate) {
                return res.status(400).json({error: 1, value: "name"})
            }

            const strategy = new Strategy({
                urlId,
                name,
                description,
                percentage,
                source
            });

            await strategy.save();

            res.json({strategy})
        } catch (e) {
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
})

// api/strategies/get
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

            const strategies = await Strategy.find({ $or: [{urlId: {$regex: search, $options: 'i'}}, {name: {$regex: search, $options: 'i'}}] })
                .limit(size).skip(size * page).sort({
                name: "asc"
            })

            count = await Strategy.countDocuments()

            res.json({page: page, pages: Math.ceil(count/size), data: strategies})
        } catch (e) {
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

            await Strategy.deleteOne({ urlId })

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
    ],
    async (req, res) => {
        try {

            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: "Validator issue"
                })
            }

            const { urlId, description, percentage, source } = req.body;

            // urlId check
            let strategy = await Strategy.findOne({ urlId })
            if (!strategy) {
                return res.status(400).json({error: 1, value: "No strategy with this urlId"})
            }

            strategy.description = description
            strategy.percentage = percentage
            strategy.source = source

            await strategy.save();

            res.json({strategy})
        } catch (e) {
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })

module.exports = router;
