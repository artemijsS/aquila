const User = require('../models/User');

module.exports = class userController {

    async get(userId) {
        const user = await User.findOne({_id: userId}, '-password -twoFAuthenticationCodeToken').lean()

        user.BINANCE_API_KEY = user.BINANCE_API_KEY ? true : false
        user.BINANCE_API_SECRET = user.BINANCE_API_SECRET ? true : false

        return user
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

};
