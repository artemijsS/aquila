const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

    if (req.method === 'OPTIONS') {
        return next();
    }

    try {
        const token = req.headers.authorization.split(' ')[1] // "Bearer TOKEN"

        if (!token) {
            return res.status(401).json({ message: 'No auth' });
        }

        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();

    } catch (e) {
        return res.status(401).json({ message: 'No auth' })
    }
}
