const { Router } = require('express');
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

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
                return res.status(400).json("User already registered")
            }

            const hashedPass = await bcrypt.hash(password, 12)
            const user = new User({
                telegram_username,
                password: hashedPass,
                telegram_chatId,
                role: 'user'
            });

            await user.save();

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
        check('email', 'Incorrect email').isEmail(),
        check('password', 'Minimal length - 6 symbols').isLength({ min: 6 })
    ],
    async (req, res) => {

        try {
            const errors = validationResult(req)

            const language = req.body.language
            let msg
            if (language === "LV")
                msg = "Ir ievadīte nepareizi dati"
            else if (language === "RU")
                msg = "Введены неправильные данные"
            else
                msg = "Incorrect data on login"

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: msg
                })
            }

            const {email, password} = req.body

            const user = await User.findOne({ email })

            if (!user) {
                if (language === "LV")
                    msg = "Lietotājs nav atrasts"
                else if (language === "RU")
                    msg = "Пользователь не найден"
                else
                    msg = "User not found"
                return res.status(400).json({ message: msg })
            }

            const isMatch = await bcrypt.compare(password, user.password)

            if (!isMatch)
                return res.status(400).json({ message: msg})

            user.status = true
            await user.save()

            const token = jwt.sign(
                { userId: user.id, role: user.role },
                config.get('jwtSecret'),
                { expiresIn: '1h' }
            );

            res.json({ token, name: user.name, email: user.email, userId: user.id, telephone: user.telephone, role: user.role, description: user.description, photo: user.photo, language: user.language })

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

        const userId = jwt.verify(token, config.get('jwtSecret'))

        const user = await User.findById(userId.userId)

        if (!user) {
            return res.status(401).json({message: 'No auth'})
        }

        res.json({ name: user.name, email: user.email, userId: user.id, telephone: user.telephone, role: user.role, description: user.description, photo: user.photo, language: user.language })
    } catch (e) {
        res.status(500).json({ message: "Error" })
    }
})

module.exports = router;
