const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.API_TELEGRAM;

const bot = new TelegramBot(token, { polling: true });


bot.onText(/\/echo (.+)/, (msg, match) => {

    const chatId = msg.chat.id;
    const resp = match[1];

    bot.sendMessage(chatId, resp);
});

bot.onText(/\/start/, (msg) => {

    const telegram_chatId = msg.chat.id;
    const telegram_username = msg.chat.username;

    // If chatId is not in DB REGISTER

    bot.sendMessage(telegram_chatId, 'Type your password (WITH REPLY)').then(val => {
        const msg_id = val.message_id;

        bot.onReplyToMessage(telegram_chatId, msg_id, msg => {
            const password = msg.text;

            axios.post('http://localhost:5000/api/auth/register', {
                telegram_username,
                password,
                telegram_chatId,
            }).then(res => {
                console.log(res.data);
                bot.sendMessage(telegram_chatId, "Registration Successful");
                bot.clearReplyListeners();
            }).catch(err => {
                bot.sendMessage(telegram_chatId, err.response.data + ". Try one more time");
                console.log(err.response.data);
            })
        })
    });

    // axios.get('http://localhost:5000/api/signal/new').then(res => console.log(res)).catch(err => console.log(err))

    // fetch('http://localhost:5000/api/signal/new', {
    //     method: 'GET'
    // }).then(res => console.log(res)).catch(err => console.log(err))

    // bot.sendMessage(chatId, 'Добро пожаловать в Рай =)');
});

module.exports = { bot };
