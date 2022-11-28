const _2FAController = require('../controllers/_2FA.controller')
const _2FAContr = new _2FAController

module.exports = async (req, res, next) => {

    if (req.method === 'OPTIONS') {
        return next();
    }

    try {

        const userId = req.user.userId

        const [twoFAuthentication, twoFAuthenticationConfirm] = await _2FAContr.get2FAFields(userId)

        if (!twoFAuthentication) {
            return next()
        }

        if (!twoFAuthenticationConfirm) {
            await _2FAContr.generateToken(userId)
            return res.status(402).json({error: "2FA", msg: "2FA is required"})
        }

        next()

    } catch (e) {
        console.log(e)
        return res.status(401).json({ message: 'Error with 2FA' })
    }
}
