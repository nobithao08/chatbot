// /src/controllers/chatBotController.js
import request from 'request';

let getWebhook = (req, res) => {
    let VERIFY_TOKEN = process.env.VERIFY_TOKEN;

    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
};

let postWebhook = (req, res) => {
    let body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(function (entry) {
            let webhook_event = entry.messaging[0];
            let sender_psid = webhook_event.sender.id;

            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }
        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
};

let handleMessage = (sender_psid, received_message) => {
    let response;

    if (received_message.text) {
        response = { text: `You sent the message: "${received_message.text}".` };
    }

    sendMessage(sender_psid, response);
};

let handlePostback = (sender_psid, received_postback) => {
    let response;
    let payload = received_postback.payload;

    if (payload === 'yes') {
        response = { text: 'Thanks!' };
    } else if (payload === 'no') {
        response = { text: 'Oops, try sending another message.' };
    }

    sendMessage(sender_psid, response);
};

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

export default {
    getWebhook,
    postWebhook
};
