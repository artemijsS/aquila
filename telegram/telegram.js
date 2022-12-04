const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const { checkRegistration, errorMsg } = require('./actions')
let userSessions = require('../user_sessions')
const io = require('../socket').get();

const usrController = require('../controllers/user.controller')
const usrContr = new usrController

const token = process.env.API_TELEGRAM;

const bot = new TelegramBot(token, { polling: true });

bot.setMyCommands([
    {
        command: "start",
        description: "Register",
    }
])

bot.onText(/\/start/, (msg) => {

    const telegram_chatId = msg.chat.id;
    const telegram_username = msg.chat.username;

    checkRegistration(telegram_chatId, telegram_username).then(isRegistered => {
        if (!isRegistered) {
            bot.sendMessage(telegram_chatId, '🎯 <b>aquila welcomes you</b> 🎯\n\n<i>You have to register first!</i>\n<b>Type your password (WITH REPLY)</b>', {"parse_mode": "HTML"}).then(val => {
                const msg_id = val.message_id;

                bot.onReplyToMessage(telegram_chatId, msg_id, msg => {
                    const password = msg.text;

                    axios.post('http://localhost:' + process.env.PORT + '/api/auth/register', {
                        telegram_username,
                        password,
                        telegram_chatId,
                    }).then(_res => {
                        bot.sendMessage(telegram_chatId, "🎯 <b>Registration successful</b> 🎯\n\n<i>Congratulations, you can now log in to the aquila system</i>\n<b>Your username - " + telegram_username + "</b>", {"parse_mode": "HTML"});
                        bot.clearReplyListeners();
                    }).catch(err => {
                        const error_msg = errorMsg(err);
                        bot.sendMessage(telegram_chatId, "⛔️⛔️⛔️ <b>ERROR</b> ⛔️⛔️⛔️\n\n" + "<i>"+error_msg+"</i>" + ". Try one more time", {"parse_mode": "HTML"});
                    })
                })
            })
        } else {
            if (isRegistered === true)
                bot.sendMessage(telegram_chatId, '🎯🎯🎯 <b>You are already registered</b> 🎯🎯🎯', {"parse_mode": "HTML"});
            else {
                const err = errorMsg(isRegistered)
                bot.sendMessage(telegram_chatId, err, {"parse_mode": "HTML"});
            }
        }
    });
});

bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
    const action_data = callbackQuery.data;
    const msg = callbackQuery.message;
    const opts = {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        parse_mode: "HTML"
    };
    let text;
    text = 'Edited Text';

    const action = action_data.split(':')[0]
    const data = action_data.split(':')[1]

    if (action === 'EXIT') {
        const user = await usrContr.getUserByChatId(msg.chat.id)
        if (!user) {
            text = "No user for this chat"
            try {
                await bot.editMessageText(text, opts);
            } catch {
                console.log("editMessageText bug")
            }
            return
        }
        if (userSessions[user._id]) {
            Object.keys(userSessions[user._id]).map(socket => {
                if (userSessions[user._id][socket].includes(data)) {
                    io.to(socket).emit('logout')
                    delete userSessions[user._id][socket]
                }
            })
        }

        await usrContr.deleteJWT(user._id, data)
        text = msg.text + "\n\n⛔️⛔️  <b>Session closed</b>  ⛔️⛔️"
    }

    if (action === 'EXIT_ALL') {
        const user = await usrContr.getUserByChatId(msg.chat.id)
        if (!user) {
            text = "No user for this chat"
            try {
                await bot.editMessageText(text, opts);
            } catch {
                console.log("editMessageText bug")
            }
            return
        }
        if (userSessions[user._id]) {
            Object.keys(userSessions[user._id]).map(socket => {
                io.to(socket).emit('logout')
                delete userSessions[user._id][socket]
            })
        }

        await usrContr.deleteJWT(user._id, data, true)
        text = msg.text + "\n\n⛔️⛔️  <b>Sessions closed on all devises</b>  ⛔️⛔️"
    }

    if (action === 'CLOSE') {
        bot.removeReplyListener(data)
        text = msg.text + "\n\n🔐 <b>Closed</b> 🔐"
    }

    try {
        await bot.editMessageText(text, opts);
    } catch {
        console.log("editMessageText bug")
    }
});

bot.onText(/\/changePassword/, async (msg) => {
    const telegram_chatId = msg.chat.id;
    const telegram_username = msg.chat.username;

    const regCheck = await checkRegistration(telegram_chatId, telegram_username)
    if (!regCheck) {
        bot.sendMessage(telegram_chatId, "⛔️⛔️⛔️ <b>You are not registered!</b> ⛔️⛔️⛔️", {"parse_mode": "HTML"})
        return
    }

    const title = "🗝 <b>Change Password</b> 🗝\n\n"
    const p = "<b>Type your new password (WITH REPLY)</b>"
    const message = title + p

    bot.sendMessage(telegram_chatId, message, {parse_mode: "HTML"}).then(async val => {
        const msg_id = val.message_id;

        const replyToMessageListenerId = await bot.onReplyToMessage(telegram_chatId, msg_id, msg => {
            const password = msg.text;

            usrContr.changePassTelegram(telegram_chatId, password).then(res => {
                bot.sendMessage(telegram_chatId, "✅✅✅ <b>SUCCESS</b> ✅✅✅\n\n" + "<i>"+res+"</i>", {"parse_mode": "HTML"})
                bot.removeReplyListener(replyToMessageListenerId)
                bot.editMessageText(message + "\n\n🔐 <b>Changed</b> 🔐", {chat_id: telegram_chatId, message_id: msg_id, parse_mode: "HTML"})
            }, err => {
                bot.sendMessage(telegram_chatId, "⛔️⛔️⛔️ <b>ERROR</b> ⛔️⛔️⛔️\n\n" + "<i>"+err+"</i>", {"parse_mode": "HTML"})
            })
        })

        await bot.editMessageReplyMarkup({inline_keyboard: [[{ text: 'Close', callback_data: "CLOSE:" + replyToMessageListenerId}]]}, {
            chat_id: telegram_chatId,
            message_id: msg_id
        });
    })
})

module.exports = { bot };
