module.exports = (req, res, next) => {

    if (req.method === 'OPTIONS') {
        return next();
    }

    try {

        if (req.user.role !== 'admin') {
            return res.status(401).json({ message: 'No access' });
        }

        next()

    } catch (e) {
        res.status(401).json({ message: 'Error' })
    }
}
