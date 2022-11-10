const { Router } = require('express');
const { bot }  = require('../telegram/telegram');

const router = Router();

// api/signals/new
router.get('/new', (req, res) => {
    try {
        // console.log(req)
        bot.sendMessage("617330875", "test")
        res.json('NICE')
    } catch (e) {
        res.status(500).json({ message: "Error!!!!!!!!!" })
    }
})

module.exports = router;
