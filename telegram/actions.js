const axios = require('axios');

const checkRegistration = async (telegram_chatId, telegram_username) => {
    return await axios.post('http://localhost:' + process.env.PORT + '/api/auth/checkUserRegister', {telegram_username}).then(res => res.data).catch(err => {
        return err;
    });
}

const errorMsg = (err) => {
    let error_msg;
    if (err.response?.data['errors']) {
        error_msg = err.response.data['errors'][0].msg;
    } else {
        error_msg = err.response?.data.message;
    }
    return error_msg;
}

module.exports = {
    checkRegistration,
    errorMsg
}
