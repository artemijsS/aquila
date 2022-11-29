const { Router } = require('express');
const { check, validationResult } = require('express-validator')
const auth = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');
const validation = require('../middleware/validation.middleware');
const _2FA = require('../middleware/_2FA.middleware');

const userController = require('../controllers/user.controller')
const usrContr = new userController

const User = require('../models/User');

const router = Router();

// api/user/get
router.get('/admin/get', auth, admin,
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
                .select(['telegram_username', 'telegram_chatId', 'role', 'twoFAuthentication', 'disabled', 'notifications'])
                .limit(size).skip(size * page).sort({
                telegram_username: "asc"
            })

            count = await User.find({ $or: [{telegram_username: {$regex: search, $options: 'i'}},
                    {telegram_chatId: {$regex: search, $options: 'i'}},
                    {role: {$regex: search, $options: 'i'}}
                ] }).countDocuments()

            res.json({page: page, pages: Math.ceil(count/size), data: users})
        } catch (e) {
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })

// api/user/delete TODO
router.delete('/admin/delete', auth, admin,
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
        check('notifications', 'Incorrect disabled').notEmpty(),
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

            const { telegram_username, role, twoFAuthentication, disabled, notifications } = req.body;

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
            user.disabled = disabled
            user.notifications = notifications

            await user.save();

            res.json({user: { telegram_chatId: user.telegram_chatId, telegram_username, role, twoFAuthentication, disabled: user.disabled }})
        } catch (e) {
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })

// api/user/get
router.get('/get', auth,
    async (req, res) => {
        try {

            const userId = req.user.userId

            const user = await usrContr.get(userId)
            if (!user) {
                return res.status(400).json({error: 1, msg: "User not found"})
            }

            res.json(user)
        } catch (e) {
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })

// api/user/updateTwoFAuthentication
router.post('/updateTwoFAuthentication', auth, _2FA, [
        check('twoFAuthentication', 'Incorrect twoFAuthentication').notEmpty().isBoolean(),
    ],
    validation,
    async (req, res) => {
        try {

            const userId = req.user.userId
            const { twoFAuthentication } = req.body
            await usrContr.updateTwoFAuthentication(userId, twoFAuthentication)

            res.json({msg: "2FA successfully updated"})
        } catch (e) {
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })

// api/user/updateTwoFAuthentication
router.post('/updateNotifications', auth, [
        check('notifications', 'Incorrect notifications').notEmpty().isBoolean(),
    ],
    validation,
    async (req, res) => {
        try {

            const userId = req.user.userId
            const { notifications } = req.body
            await usrContr.updateNotifications(userId, notifications)

            res.json({msg: "Notifications successfully updated"})
        } catch (e) {
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })

// api/user/updateBinanceApiKey
router.post('/updateBinanceApiKey', auth, _2FA, [
        check('BINANCE_API_KEY', 'Incorrect BINANCE_API_KEY').notEmpty().isString(),
    ],
    validation,
    async (req, res) => {
        try {

            const userId = req.user.userId
            const { BINANCE_API_KEY } = req.body
            const [status, msg] = await usrContr.updateBinanceApiKey(userId, BINANCE_API_KEY)

            res.status(status).json({ msg })
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })

// api/user/updateBinanceApiSecret
router.post('/updateBinanceApiSecret', auth, _2FA, [
        check('BINANCE_API_SECRET', 'Incorrect BINANCE_API_SECRET').notEmpty().isString(),
    ],
    validation,
    async (req, res) => {
        try {

            const userId = req.user.userId
            const { BINANCE_API_SECRET } = req.body
            const [status, msg] = await usrContr.updateBinanceApiSecret(userId, BINANCE_API_SECRET)

            res.status(status).json({ msg })
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: "Error!!!!!!!!!" })
        }
    })

module.exports = router;
