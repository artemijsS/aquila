const { Router } = require('express');
const { check, validationResult } = require('express-validator')
const auth = require('../middleware/auth.middleware');

const UserStrategies = require('../models/User_strategies');

const router = Router();

// api/userStrategies/get
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

            const userId = req.user.userId

            const userStrategies = await UserStrategies.find({ userId: userId }).populate('Strategy', ['urlId', 'name'])
                .find({ $or: [{urlId: {$regex: search, $options: 'i'}}, {name: {$regex: search, $options: 'i'}}] })
                .limit(size).skip(size * page).sort({
                    name: "asc"
                })

            count = await UserStrategies.find({ userId: userId }).populate('Strategy')
                .find({ $or: [{urlId: {$regex: search, $options: 'i'}}, {name: {$regex: search, $options: 'i'}}] })
                .countDocuments()

            res.json({page: page, pages: Math.ceil(count/size), data: userStrategies})
        } catch (e) {
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })

module.exports = router;
