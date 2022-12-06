const { bot } = require('../telegram/telegram')
const browser = require('browser-detect');
const requestIP = require('request-ip');
const axios = require('axios');

const usrController = require('../controllers/user.controller')
const usrContr = new usrController

const GEO_URL = 'https://ipgeolocation.abstractapi.com/v1/?api_key=' + process.env.API_GEO;

module.exports = class Bot {

    constructor() {
        this.bot = bot
    }


    async sendMessage(chatId, msg) {
        return await this.bot.sendMessage(chatId, msg, {
            "parse_mode": "HTML",
        })
    }

    async sendSuccess(chatId, msg) {
        const title = "✅✅✅ <b>SUCCESS</b> ✅✅✅\n\n"
        const message = title + "<i>"+msg+"</i>"
        await this.sendMessage(chatId, message)
    }

    async sendWithButton(chatId, msg, buttons) {
        const parse_mode = { "parse_mode": "HTML" }
        const options = {...parse_mode, reply_markup: { inline_keyboard: [ buttons ]}}
        return await this.bot.sendMessage(chatId, msg, options)
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
        const ip = requestIP.getClientIp(req);
        const geo = await axios.get(GEO_URL + "&ip_address=" + ip)
            .then(res => {return res.data.country ? res.data : { country: "?", city: "?" }}, _err => { return { country: "?", city: "?" } } )
        const msg = "<i>IP - " + ip + "\nCountry - " + geo.country + "\nCity - " + geo.city + "\nBrowser - " + browserInfo.name + "\nOS - " + browserInfo.os + "\nPlatform - " + (browserInfo.mobile ? "mobile" : "PC") + "</i>"
        const message = title + msg
        const callbackDataForOneDevice = "EXIT:" + req.tokenPart
        const buttons = [{ text: 'Exit on this device', callback_data: callbackDataForOneDevice}, { text: 'Exit on all devices', callback_data: "EXIT_ALL:null"}]
        await this.sendWithButton(chatId, message, buttons)
    }

    async sendError(chatId, msg) {
        const title = "⛔️⛔️⛔️ <b>ERROR</b> ⛔️⛔️⛔️\n\n"
        const message = title + "<i>"+msg+"</i>"
        await this.sendMessage(chatId, message)
    }

    async sendChangePass(chatId) {
        const title = "❔ <b>How to change Password</b> ❔\n\n"
        const msg = "<b>Use /changePassword command</b>"
        const message = title + msg
        await this.sendMessage(chatId, message)
    }

    async sendSignal(chatId, strategyName, entryPrice, amount, leverage, tp, sl) {
        const title = "💎💎💎 <b>SIGNAL</b> 💎💎💎\n\n"
        const msg = "<b>Strategy - " + strategyName + "</b>\n\n"
            + "<b>Take Profit - " + tp + "\nStop Loss - " + sl + "</b>\n\n"
            + "<i>Entry price - " + entryPrice
            + "\nAmount - " + amount
            + "\nLeverage - " + leverage + "</i>"
        const message = title + msg
        return await this.sendMessage(chatId, message)
    }

}
