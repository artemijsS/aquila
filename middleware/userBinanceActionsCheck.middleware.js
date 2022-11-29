const User = require('../models/User')

module.exports = async (req, res, next) => {

    if (req.method === 'OPTIONS') {
        return next();
    }

    try {
        const user = await User.findOne({ _id: req.user.userId })

        if (user.disabledActionsBinance) {
            return res.status(405).json({ msg: "Add Binance API key and API secret first" })
        }

        next();

    } catch (e) {
        res.status(401).json({ message: 'User Binance Actions Check middleware error' })
    }
}
