const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const { checkRegistration, errorMsg } = require('./actions')

const token = process.env.API_TELEGRAM;

const bot = new TelegramBot(token, { polling: true });


bot.onText(/\/start/, (msg) => {

    const telegram_chatId = msg.chat.id;
    const telegram_username = msg.chat.username;

    checkRegistration(telegram_chatId, telegram_username).then(isRegistered => {
        if (!isRegistered) {
            bot.sendMessage(telegram_chatId, 'Type your password (WITH REPLY)').then(val => {
                const msg_id = val.message_id;

                bot.onReplyToMessage(telegram_chatId, msg_id, msg => {
                    const password = msg.text;

                    axios.post(process.env.SERVER_DEV + '/api/auth/register', {
                        telegram_username,
                        password,
                        telegram_chatId,
                    }).then(_res => {
                        bot.sendMessage(telegram_chatId, "Registration Successful");
                        bot.clearReplyListeners();
                    }).catch(err => {
                        const error_msg = errorMsg(err);
                        bot.sendMessage(telegram_chatId, error_msg + ". Try one more time");
                    })
                })
            })
        } else {
            bot.sendMessage(telegram_chatId, 'You are already registered');
        }
    });
});

bot.onText(/\/login/, (msg) => {

    const telegram_chatId = msg.chat.id;
    const telegram_username = msg.chat.username;

    bot.sendMessage(telegram_chatId, 'Type your password (WITH REPLY)').then(val => {
        const msg_id = val.message_id;

        bot.onReplyToMessage(telegram_chatId, msg_id, msg => {
            const password = msg.text;

            axios.post(process.env.SERVER_DEV + '/api/auth/login', {
                telegram_username,
                password
            }).then(res => {
                bot.sendMessage(telegram_chatId, "Login Successful");
                bot.clearReplyListeners();
            }).catch(err => {
                const error_msg = errorMsg(err);
                bot.sendMessage(telegram_chatId, error_msg + ". Try one more time");
            })
        })
    });
});

module.exports = { bot };
