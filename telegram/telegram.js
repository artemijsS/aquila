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

                    axios.post('http://localhost:' + process.env.PORT + '/api/auth/register', {
                        telegram_username,
                        password,
                        telegram_chatId,
                    }).then(_res => {
                        bot.sendMessage(telegram_chatId, "Registration successful");
                        bot.clearReplyListeners();
                    }).catch(err => {
                        const error_msg = errorMsg(err);
                        bot.sendMessage(telegram_chatId, error_msg + ". Try one more time");
                    })
                })
            })
        } else {
            if (isRegistered === true)
                bot.sendMessage(telegram_chatId, 'You are already registered');
            else {
                const err = errorMsg(isRegistered)
                bot.sendMessage(telegram_chatId, err);
            }
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

            axios.post('http://localhost:' + process.env.PORT + '/api/auth/login', {
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
