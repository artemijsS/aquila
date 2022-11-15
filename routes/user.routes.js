const { Router } = require('express');
const { check, validationResult } = require('express-validator')
const auth = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');

const User = require('../models/User');

const router = Router();

// api/user/get
router.get('/get', auth, admin,
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

            const users = await User.find({ $or: [{telegram_username: {$regex: search, $options: 'i'}},
                    {telegram_chatId: {$regex: search, $options: 'i'}},
                    {role: {$regex: search, $options: 'i'}}
                ] })
                .select(['telegram_username', 'telegram_chatId', 'role', 'twoFAuthentication', 'description', 'disabled'])
                .limit(size).skip(size * page).sort({
                telegram_username: "asc"
            })

            count = await User.countDocuments()

            res.json({page: page, pages: Math.ceil(count/size), data: users})
        } catch (e) {
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })

// api/strategies/delete
router.delete('/delete', auth, admin,
    async (req, res) => {
        try {
            let telegram_username

            if (req.query.telegram_username) {
                telegram_username = req.query.telegram_username
            } else {
                return res.status(400).json({error: 1, msg: "no telegram_username"})
            }

            await User.deleteOne({ telegram_username })

            res.json({telegram_username: telegram_username, msg: "deleted"})
        } catch (e) {
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })

// api/user/adminEdit
router.post('/adminEdit', auth, admin, [
        check('telegram_username', 'Incorrect telegram_username').notEmpty(),
        check('role', 'Incorrect role').notEmpty(),
        check('disabled', 'Incorrect disabled').notEmpty(),
        check('twoFAuthentication', 'Incorrect twoFAuthentication').notEmpty(),
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

            const { telegram_username, role, twoFAuthentication, description, disabled } = req.body;

            // telegram_username check
            let user = await User.findOne({ telegram_username })
            if (!user) {
                return res.status(400).json({error: 1, value: "telegram_username"})
            }

            if (role !== 'admin' && role !== 'user') {
                return res.status(400).json({error: 2, value: "role"})
            }

            if (!('boolean' === typeof twoFAuthentication)) {
                return res.status(400).json({error: 2, value: "twoFAuthentication"})
            }

            if (!('boolean' === typeof disabled)) {
                return res.status(400).json({error: 2, value: "disabled"})
            }

            user.role = role
            user.twoFAuthentication = twoFAuthentication
            user.description = description
            user.disabled = disabled

            await user.save();

            res.json({user: { telegram_chatId: user.telegram_chatId, telegram_username, role, twoFAuthentication, description }})
        } catch (e) {
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })

module.exports = router;
