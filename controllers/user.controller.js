const User = require('../models/User');

module.exports = class userController {

    async get(userId) {
        return User.findOne({_id: userId}, '-password -BINANCE_API_KEY -BINANCE_API_SECRET -twoFAuthenticationCodeToken')
    }

};
