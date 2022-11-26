const { validationResult } = require('express-validator')

module.exports = (req, res, next) => {

    if (req.method === 'OPTIONS') {
        return next();
    }

    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: "Validator issue"
            })
        }

        next();

    } catch (e) {
        res.status(401).json({ message: 'Validation middleware error' })
    }
}
