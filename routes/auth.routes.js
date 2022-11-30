const { Router } = require('express');
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { bot } = require('../telegram/telegram')
const auth = require('../middleware/auth.middleware')
const validation = require('../middleware/validation.middleware')

const _2FAController = require('../controllers/_2FA.controller')
const _2FAContr = new _2FAController

const Telegram = require('../utils/telegram.util')
const telegram = new Telegram()

const User = require('../models/User');
const UserInvite = require('../models/User_invite');

const router = Router();

// api/auth/register
router.post('/register',
    [
        check('telegram_username', 'Incorrect username').notEmpty(),
        check('password', 'Minimal length - 6 symbols').isLength({ min: 6 }),
        check('telegram_chatId', 'Incorrect telegram chatId').notEmpty(),
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

            const { telegram_username, password, telegram_chatId } = req.body;

            // username check
            let candidate = await User.findOne({ telegram_username })
            if (candidate) {
                return res.status(400).json({ message: "User already registered" })
            }

            // user access check
            let userInvite = await UserInvite.findOne({ telegram_username: new RegExp(`^${telegram_username}$`, 'i') })
            if (!userInvite) {
                return res.status(400).json({ message: "User do not have access to register" })
            }

            const hashedPass = await bcrypt.hash(password, 12)
            const user = new User({
                telegram_username,
                password: hashedPass,
                telegram_chatId,
                role: 'user'
            });

            await user.save();

            await UserInvite.deleteOne({ telegram_username: new RegExp(`^${telegram_username}$`, 'i') })

            const token = jwt.sign(
                { userId: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '2h' }
            );

            res.json({ token })

        } catch (e) {
            res.status(500).json({ data: { message: "Error" }})
        }
    })

// api/auth/login
router.post('/login',
    [
        check('telegram_username', 'Incorrect username').notEmpty(),
        check('password', 'Incorrect password').notEmpty()
    ],
    async (req, res) => {

        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: "Validation issue"
                })
            }

            const { telegram_username, password } = req.body;

            const user = await User.findOne({ telegram_username: new RegExp(`^${telegram_username}$`, 'i') });

            if (!user) {
                return res.status(400).json({ message: "User not found" })
            }

            const isMatch = await bcrypt.compare(password, user.password)

            if (!isMatch)
                return res.status(400).json({ message: "Incorrect data" })

            if (user.twoFAuthentication) {
                const token = jwt.sign(
                    { telegram_username },
                    process.env.JWT_SECRET,
                    { expiresIn: '1min' }
                );
                return res.json({ twoFA: true, telegram_username: user.telegram_username, token: token })
            }

            user.last_time_seen = new Date().toJSON();
            await user.save()

            const token = jwt.sign(
                { userId: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            const username = user.telegram_username;
            const role = user.role;

            await telegram.sendLoginInfo(user.telegram_chatId, req)

            res.json({ token, username, role, telegram_chatId: user.telegram_chatId, disabledActionsBinance: user.disabledActionsBinance })

        } catch (e) {
            res.status(500).json({ message: "Error" })
        }
    })

// api/auth/check
router.get('/check', async (req, res) => {

    try {
        const token = req.headers.authorization.split(' ')[1] // "Bearer TOKEN"

        if (!token) {
            return res.status(401).json({message: 'No auth'})
        }

        const userId = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findById(userId.userId)

        if (!user) {
            return res.status(401).json({message: 'No auth'})
        }

        user.last_time_seen = new Date().toJSON();
        await user.save()

        res.json({ username: user.telegram_username, role: user.role, telegram_chatId: user.telegram_chatId, disabledActionsBinance: user.disabledActionsBinance })
    } catch (e) {
        res.status(500).json({ message: "Error" })
    }
})

// api/auth/checkUserRegister
router.post('/checkUserRegister', [
        check('telegram_username', 'telegram_username is necessary').notEmpty()
    ], async (req, res) => {

    try {

        const { telegram_username } = req.body;
        const user = await User.findOne({ telegram_username });

        // user registration check
        if (user) {
            return res.json(true);
        }

        // user access check
        let userInvite = await UserInvite.findOne({ telegram_username: new RegExp(`^${telegram_username}$`, 'i') })
        if (!userInvite) {
            return res.status(400).json({error: 1, message: "You do not have access to register"})
        }

        res.json(false);
    } catch (e) {
        res.status(500).json({ message: "Error" })
    }
})

// api/auth/2FA
router.post('/2FA',
    [
        check('telegram_username', 'Incorrect username').notEmpty(),
        check('code', 'Incorrect code').notEmpty().isLength({min: 4, max:4})
    ],
    async (req, res) => {

        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: "Validation issue"
                })
            }

            const { telegram_username, code } = req.body;

            const user = await User.findOne({ telegram_username: new RegExp(`^${telegram_username}$`, 'i') });

            if (!user) {
                return res.status(400).json({ message: "User not found" })
            }

            let hashedCode = "";

            try {
                hashedCode = jwt.verify(user.twoFAuthenticationCodeToken, process.env.JWT_SECRET)
            } catch (e) {
                return res.status(203).json({ message: "Time limit" })
            }

            const isMatch = await bcrypt.compare(code, hashedCode.hashedCode)

            if (!isMatch)

                return res.status(400).json({ message: "Incorrect data" })

            user.last_time_seen = new Date().toJSON();
            await user.save()

            const token = jwt.sign(
                { userId: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            const username = user.telegram_username;
            const role = user.role;

            await telegram.sendLoginInfo(user.telegram_chatId, req)

            res.json({ token, username, role, telegram_chatId: user.telegram_chatId })

        } catch (e) {
            res.status(500).json({ message: "Error" })
        }
    })

// api/auth/2FAGenerate
router.post('/2FAGenerate',
    [
        check('token', 'Incorrect token').notEmpty()
    ],
    async (req, res) => {

        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: "Validation issue"
                })
            }

            const { token } = req.body;

            const telegram_username = jwt.verify(token, process.env.JWT_SECRET).telegram_username

            const user = await User.findOne({ telegram_username: new RegExp(`^${telegram_username}$`, 'i') });

            if (!user) {
                return res.status(400).json({ message: "User not found" })
            }

            let code = '';
            let characters = '0123456789';
            let charactersLength = characters.length;
            for (let i = 0; i < 4; i++) {
                code += characters.charAt(Math.floor(Math.random() * charactersLength));
            }

            const hashedCode = await bcrypt.hash(code, 12)

            user.twoFAuthenticationCodeToken = jwt.sign(
                {hashedCode},
                process.env.JWT_SECRET,
                {expiresIn: '40s'}
            )
            await user.save()

            await telegram.send2FACode(user.telegram_chatId, code)

        } catch (e) {
            res.status(500).json({ message: "Error" })
        }
    })

// api/auth/2FAConfirm
router.post('/2FAConfirm', auth,
    [
        check('code', 'Incorrect code').notEmpty().isLength({min: 4, max:4})
    ],
    validation,
    async (req, res) => {

        try {

            const { code } = req.body;
            const userId = req.user.userId

            const [status, message] = await _2FAContr.checkToken(userId, code)

            return res.status(status).json(message)

        } catch (e) {
            res.status(500).json({ message: "Error" })
        }
    })

module.exports = router;
