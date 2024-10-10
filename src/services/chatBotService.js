// /src/services/chatBotService.js
import request from 'request';

// Hàm gửi tin nhắn
let sendMessage = (sender_psid, response) => {
    let request_body = {
        recipient: { id: sender_psid },
        message: response
    };

    request({
        uri: 'https://graph.facebook.com/v6.0/me/messages',
        qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('Message sent!');
        } else {
            console.error('Unable to send message:', err);
        }
    });
};

// Hiển thị trạng thái typing
let sendTypingOn = (sender_psid) => {
    let request_body = {
        recipient: { id: sender_psid },
        sender_action: 'typing_on'
    };

    request({
        uri: 'https://graph.facebook.com/v6.0/me/messages',
        qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('Typing on...');
        } else {
            console.error('Unable to send typing action:', err);
        }
    });
};

export default {
    sendMessage,
    sendTypingOn
};
