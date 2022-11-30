const UserContr = require('../controllers/user.controller')
const usrContr = new UserContr()
const Telegram = require('../utils/telegram.util')
const telegram = new Telegram()

module.exports = async (req, res) => {

    try {
        const message = req.notificationMessage

        const userId = req.user.userId
        const user = await usrContr.get(userId)

        if (!user.notifications) {
            return res
        }

        const chatId = user.telegram_chatId

        await telegram.sendNotification(chatId, message)


    } catch (e) {
        console.log("TELEGRAM ERROR: " + e)
        return res
    }
}
