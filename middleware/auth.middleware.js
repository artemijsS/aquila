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

        if (tokenAndDisabledCheck === "Disabled") {
            return res.status(403).json({ message: 'Account disabled' })
        }

        if (tokenAndDisabledCheck === "blockedTOKEN") {
            return res.status(404).json({ message: 'Session blocked' })
        }

        next();

    } catch (e) {
        return res.status(401).json({ message: 'No auth' })
    }
}
