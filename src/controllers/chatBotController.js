import chatBotService from '../services/chatBotService';

let predefinedResponses = {
    "tôi muốn đặt lịch khám": "Bạn có thể đặt lịch khám qua link sau: https://your-domain.com/booking",
    "lịch khám bác sĩ a còn trống không?": "Bác sĩ A hiện có lịch khám vào thứ 3 và thứ 5 tuần này. Bạn có thể đặt lịch qua link: https://your-domain.com/booking",
    "bác sĩ nào có lịch khám vào ngày mai?": "Hiện tại bác sĩ B và bác sĩ C có lịch khám vào ngày mai. Bạn có thể đặt lịch tại đây: https://your-domain.com/booking",
    "tôi có thể khám bệnh vào ngày nào?": "Bạn có thể chọn ngày phù hợp để đặt lịch khám qua link: https://your-domain.com/booking",
    "cách đặt lịch khám thế nào?": "Bạn chỉ cần chọn bác sĩ, chọn thời gian khám và nhập thông tin cá nhân tại đây: https://your-domain.com/booking",
    "làm sao để hủy lịch khám?": "Bạn có thể hủy lịch khám qua ứng dụng hoặc liên hệ trực tiếp phòng khám qua hotline.",
    "chi phí khám bệnh là bao nhiêu?": "Chi phí khám bệnh phụ thuộc vào bác sĩ và dịch vụ. Vui lòng truy cập https://your-domain.com/pricing để biết thêm chi tiết.",
    "địa chỉ phòng khám ở đâu?": "Phòng khám của chúng tôi tại 123 Đường ABC, Quận XYZ, Thành phố DEF."
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
