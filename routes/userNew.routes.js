const { Router } = require('express');
const { check, validationResult } = require('express-validator')
const auth = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');

const NewUser = require('../models/NewUser');
const User = require('../models/User');

const router = Router();

// api/userNew/new
router.post('/new', auth, admin, [
        check('telegram_username', 'Incorrect telegram_username').notEmpty()
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

            const { telegram_username } = req.body;

            // user check
            let candidate = await User.findOne({ telegram_username: new RegExp(`^${telegram_username}$`, 'i') })
            if (candidate) {
                return res.status(400).json({error: 1, value: "user"})
            }

            // newUser check
            candidate = await NewUser.findOne({ telegram_username })
            if (candidate) {
                return res.status(400).json({error: 2, value: "newUser"})
            }

            const newUser = new NewUser({ telegram_username });

            await newUser.save();

            res.json({ newUser })
        } catch (e) {
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })

// api/userNew/new
router.get('/get', auth, admin,
    async (req, res) => {
        try {

            let page = 0
            let size = 2
            let count;
            if (req.query.page) {
                page = req.query.page
            }

            const newUsers = await NewUser.find().select(['telegram_username']).limit(size).skip(size * page).sort({
                telegram_username: "asc"
            })

            count = await NewUser.countDocuments()

            res.json({page: page, pages: Math.ceil(count/size), data: newUsers})
        } catch (e) {
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })

// api/userNew/delete
router.delete('/delete', auth, admin,
    async (req, res) => {
        try {
            let telegram_username

            if (req.query.telegram_username) {
                telegram_username = req.query.telegram_username
            } else {
                return res.status(400).json({error: 1, msg: "no telegram_username"})
            }

            await NewUser.deleteOne({ telegram_username: new RegExp(`^${telegram_username}$`, 'i') })

            res.json({telegram_username: telegram_username, msg: "deleted"})
        } catch (e) {
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })

module.exports = router;
