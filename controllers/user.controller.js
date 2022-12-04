const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Binance = require('node-binance-api');

module.exports = class userController {

    async get(userId) {
        const user = await User.findOne({_id: userId}, '-password -twoFAuthenticationCodeToken').lean()

        user.BINANCE_API_KEY = user.BINANCE_API_KEY ? true : false
        user.BINANCE_API_SECRET = user.BINANCE_API_SECRET ? true : false

        return user
    }

    async getChatId(userId) {
        const user = await User.findOne({_id: userId}, 'telegram_chatId')
        return user.telegram_chatId
    }

    async getUserByChatId(chatId) {
        return User.findOne({ telegram_chatId: chatId })
    }

    async checkTokenAndDisabled(userId, token) {
        const user = await User.findOne({_id: userId})
        if (user.disabled)
            return "Disabled"
        if (!user.JWTs.includes(token))
            return "blockedTOKEN"
        return true
    }

    async addJWT(userId, token) {
        const user = await User.findOne({_id: userId})

        if (!user.JWTs.includes(token)) {
            user.JWTs.push(token)
        }

        let tokens = []
        for (const tok of user.JWTs) {
            try {
                jwt.verify(tok, process.env.JWT_SECRET )
                tokens.push(tok)
            } catch {}
        }

        user.JWTs = tokens
        await user.save()
    }

    async deleteJWT(userId, tokenPart, all = false) {
        const user = await User.findOne({_id: userId})

        if (!user)
            return false

        let tokens = []
        if (!all && user) {
            for (const tok of user.JWTs) {
                try {
                    jwt.verify(tok, process.env.JWT_SECRET)
                    if (!tok.includes(tokenPart))
                        tokens.push(tok)
                } catch {
                }
            }
        }

        user.JWTs = tokens
        await user.save()
    }

    async updateTwoFAuthentication(userId, value) {
        const user = await User.findOne({ _id: userId })
        user.twoFAuthentication = value
        await user.save()
        return true
    }

    async updateNotifications(userId, value) {
        const user = await User.findOne({ _id: userId })
        user.notifications = value
        await user.save()
        return true
    }

    async updateBinanceApiKey(userId, key) {
        const user = await User.findOne({ _id: userId })
        if (!user) {
            return [400, "User not found"]
        }

        if (user.BINANCE_API_SECRET) {
            const secret = jwt.verify(user.BINANCE_API_SECRET, process.env.JWT_SECRET);
            const binance = new Binance().options({
                APIKEY: key,
                APISECRET: secret
            })

            const login = await binance.futuresBalance()
            if (login.msg) {
                user.BINANCE_API_SECRET = ''
                user.disabledActionsBinance = true
                await user.save()
                return [400, "Binance Api Key or Secret are invalid"]
            }

            user.BINANCE_API_KEY = jwt.sign(
                key,
                process.env.JWT_SECRET
            )
            user.disabledActionsBinance = false
            await user.save()
            return [200, "Binance Api Key and Secret are accepted and work fine!"]
        }

        user.BINANCE_API_KEY = jwt.sign(
            key,
            process.env.JWT_SECRET
        )

        await user.save()
        return [200, "Binance Api key successfully updated"]
    }

    async updateBinanceApiSecret(userId, secret) {
        const user = await User.findOne({ _id: userId })
        if (!user) {
            return [400, "User not found"]
        }

        if (user.BINANCE_API_KEY) {
            const key = jwt.verify(user.BINANCE_API_KEY, process.env.JWT_SECRET);
            const binance = new Binance().options({
                APIKEY: key,
                APISECRET: secret
            })

            const login = await binance.futuresBalance()
            if (login.msg) {
                user.BINANCE_API_KEY = ''
                user.disabledActionsBinance = true
                await user.save()
                return [400, "Binance Api Secret or Key are invalid"]
            }

            user.BINANCE_API_SECRET = jwt.sign(
                secret,
                process.env.JWT_SECRET
            )
            user.disabledActionsBinance = false
            await user.save()
            return [200, "Binance Api Secret and Key are accepted and work fine!"]
        }

        user.BINANCE_API_SECRET = jwt.sign(
            secret,
            process.env.JWT_SECRET
        )

        await user.save()
        return [200, "Binance Api secret successfully updated"]
    }

};
