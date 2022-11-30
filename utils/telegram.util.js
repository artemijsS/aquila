const { bot } = require('../telegram/telegram')
const browser = require('browser-detect');

module.exports = class Bot {

    constructor() {
        this.bot = bot
    }


    async sendMessage(chatId, msg) {
        await this.bot.sendMessage(chatId, msg, {
            "parse_mode": "HTML",
        })
    }

    async sendNotification(chatId, msg) {
        const title = "🔸 <b>NOTIFICATION</b> 🔸\n\n"
        const message = title + "<i>"+msg+"</i>"
        await this.sendMessage(chatId, message)
    }

    async send2FACode(chatId, code) {
        const title = "🔑  <b>2FA CODE</b>  🔑\n\n"
        const msg = "<b>"+code+"</b>"
        const message = title + msg
        await this.sendMessage(chatId, message)
    }

    async sendLoginInfo(chatId, req) {
        const title = "🚪 <b>Someone logged in aquila</b> 🚪\n\n"
        const browserInfo = browser(req.headers['user-agent']);
        const ip = req.socket.remoteAddress
        const msg = "<i>IP - " + ip + "\nBrowser - " + browserInfo.name + "\nOS - " + browserInfo.os + "\nMobile - " + browserInfo.mobile + "</i>"
        const message = title + msg
        await this.sendMessage(chatId, message)
    }

}
