const jwt = require('jsonwebtoken');
const usrController = require('../controllers/user.controller')
const usrContr = new usrController

module.exports = async (req, res, next) => {

    if (req.method === 'OPTIONS') {
        return next();
    }

    try {
        const token = req.headers.authorization.split(' ')[1] // "Bearer TOKEN"

        if (!token) {
            return res.status(401).json({ message: 'No auth' });
        }

        req.user = jwt.verify(token, process.env.JWT_SECRET);

        const tokenAndDisabledCheck = await usrContr.checkTokenAndDisabled(req.user.userId, token)

        if (!tokenAndDisabledCheck) {
            return res.status(401).json({ message: 'No auth' })
        }

        next();

    } catch (e) {
        return res.status(401).json({ message: 'No auth' })
    }
}
