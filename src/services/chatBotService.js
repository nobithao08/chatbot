import request from "request";
import moment from "moment";

// Gửi tin nhắn qua Messenger
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

// Hiển thị trạng thái đang gõ phím
let sendTypingOn = (sender_psid) => {
    let request_body = {
        "recipient": { "id": sender_psid },
        "sender_action": "typing_on"
    };

    request({
        "uri": "https://graph.facebook.com/v6.0/me/messages",
        "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('Typing on...');
        } else {
            console.error("Không thể gửi typing action:" + err);
        }
    });
};

// Điều hướng người dùng đến trang đặt lịch
let sendRedirectToBookingPage = (sender_psid) => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "Bạn có thể đặt lịch khám bằng cách nhấn vào nút dưới đây:",
                "buttons": [
                    {
                        "type": "web_url",
                        "url": "https://your-domain.com/booking", // Link tới trang đặt lịch
                        "title": "Đặt lịch khám"
                    }
                ]
            }
        }
    };
    sendMessage(sender_psid, response);
};

// Điều hướng người dùng đến trang thông tin bác sĩ
let sendRedirectToDoctorInfoPage = (sender_psid) => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "Bạn có thể xem thông tin bác sĩ tại đây:",
                "buttons": [
                    {
                        "type": "web_url",
                        "url": "https://your-domain.com/doctors", // Link tới trang thông tin bác sĩ
                        "title": "Thông tin bác sĩ"
                    }
                ]
            }
        }
    };
    sendMessage(sender_psid, response);
};

// Điều hướng người dùng đến trang hướng dẫn sử dụng
let sendRedirectToGuidePage = (sender_psid) => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "Bạn có thể xem hướng dẫn sử dụng tại đây:",
                "buttons": [
                    {
                        "type": "web_url",
                        "url": "https://your-domain.com/guide", // Link tới trang hướng dẫn
                        "title": "Hướng dẫn sử dụng"
                    }
                ]
            }
        }
    };
    sendMessage(sender_psid, response);
};

// Gửi thông báo đến nhóm Telegram khi có lịch khám mới
let sendNotificationToTelegram = async (userData) => {
    // Tích hợp API Telegram tại đây
    console.log("Gửi thông báo đến Telegram:", userData);
};

export default {
    sendMessage,
    sendTypingOn,
    sendRedirectToBookingPage,
    sendRedirectToDoctorInfoPage,
    sendRedirectToGuidePage,
    sendNotificationToTelegram
};
