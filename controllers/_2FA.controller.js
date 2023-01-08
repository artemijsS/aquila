const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Telegram = require('../utils/telegram.util')
const telegram = new Telegram()


module.exports = class _2FA {

    // checking user 2FA confirm token validity
    async get2FAFields(userId) {
        const user = await User.findOne({ _id: userId }).lean()
        if (!user) {
            return false
        }

        if (!user.twoFAuthenticationConfirm) {
            user.twoFAuthenticationConfirm = false
        } else {
            try {
                jwt.verify(user.twoFAuthenticationConfirm, process.env.JWT_SECRET)
            } catch (e) {
                user.twoFAuthenticationConfirm = false
            }
        }

        return [
            user.twoFAuthentication,
            user.twoFAuthenticationConfirm
        ]
    }

    // generating 2FA code token for user, and sending it to user
    async generateToken(userId) {
        const user = await User.findOne({ _id: userId })

        if (!user)
            return false

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

        return true
    }

    // checking 2FA token validity
    async checkToken(userId, code) {
        const user = await User.findOne({ _id: userId });

        if (!user) {
            return [400, { message: "User not found" }]
        }

        let hashedCode = '';

        try {
            hashedCode = jwt.verify(user.twoFAuthenticationCodeToken, process.env.JWT_SECRET)
        } catch (e) {
            return [203, { message: "Time limit" }]
        }

        const isMatch = await bcrypt.compare(code, hashedCode.hashedCode)

        if (!isMatch)
            return [400, { message: "Incorrect data" }]

        const confirm = await this.generateConfirm(userId)
        if (!confirm)
            return [400, { message: "Error with 2FA confirm save" }]

        return [200, {message: "2FA successfully done"}]
    }

    // generating user 2FA confirm token for 5 minutes
    async generateConfirm(userId) {
        const user = await User.findOne({ _id: userId })

        if (!user)
            return false

        user.twoFAuthenticationConfirm = jwt.sign(
            {value: true},
            process.env.JWT_SECRET,
            {expiresIn: '5min'}
        )

        await user.save()

        return true
    }

};
