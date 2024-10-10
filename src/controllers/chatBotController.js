// /src/controllers/chatBotController.js
import chatBotService from '../services/chatBotService';

// Xác thực webhook
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

// Xử lý khi nhận tin nhắn từ người dùng
let postWebhook = (req, res) => {
    let body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(function (entry) {
            let webhook_event = entry.messaging[0];
            let sender_psid = webhook_event.sender.id;

            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            }
        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
};

// Xử lý tin nhắn và trả lời
let handleMessage = (sender_psid, received_message) => {
    if (received_message.text) {
        // Phản hồi lại bất kỳ tin nhắn nào
        let response = { text: `Bạn đã gửi: "${received_message.text}"` };

        // Gửi trạng thái "typing_on" và gửi tin nhắn trả lời
        chatBotService.sendTypingOn(sender_psid);
        chatBotService.sendMessage(sender_psid, response);
    }
};

export default {
    getWebhook,
    postWebhook
};
