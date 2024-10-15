import request from "request";

// Gửi tin nhắn phản hồi qua Messenger
let sendMessage = (sender_psid, response) => {
    let request_body = {
        "recipient": { "id": sender_psid },
        "message": { "text": response }
    };

    request({
        "uri": "https://graph.facebook.com/v6.0/me/messages",
        "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('Tin nhắn đã được gửi!');
        } else {
            console.error("Không thể gửi tin nhắn:" + err);
        }
    });
};

// Xử lý câu hỏi liên quan đến đặt lịch
let handleBookingQuery = (sender_psid) => {
    let response = "Bạn có thể đặt lịch khám bằng cách nhấn vào đây: https://your-domain.com/booking";
    sendMessage(sender_psid, response);
};

export default {
    sendMessage,
    handleBookingQuery
};
