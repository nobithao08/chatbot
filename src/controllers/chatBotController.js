import chatBotService from '../services/chatBotService';

let predefinedResponses = {
    "câu hỏi này": "Câu trả lời bạn mong muốn",
    "tên bạn là gì?": "Tôi là chatbot của bạn!",
    "bạn có thể giúp gì?": "Tôi có thể giúp bạn đặt lịch khám, cung cấp thông tin về bác sĩ, và hơn thế nữa!"
};

// Xử lý webhook khi nhận tin nhắn
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
        let userMessage = received_message.text.toLowerCase();

        // Kiểm tra xem tin nhắn có nằm trong danh sách câu trả lời cố định hay không
        let responseText = predefinedResponses[userMessage] || `Bạn đã gửi: "${received_message.text}"`;

        // Tạo phản hồi
        let response = { text: responseText };

        // Gửi trạng thái "typing_on" và sau đó gửi tin nhắn trả lời
        chatBotService.sendTypingOn(sender_psid);
        chatBotService.sendMessage(sender_psid, response);
    }
};

// Xử lý webhook GET
let getWebhook = (req, res) => {
    let VERIFY_TOKEN = process.env.MY_VERIFY_TOKEN;

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

export default {
    postWebhook,
    getWebhook
};
