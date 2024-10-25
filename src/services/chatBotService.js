require("dotenv").config();
import request from "request";

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const IMAGE_GET_STARTED = 'https://bit.ly/nobithaoDatLich';

let callSendAPI = (sender_psid, response) => {
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    };

    request({
        "uri": "https://graph.facebook.com/v6.0/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('Message sent!');
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}

let getFacebookUsername = (sender_psid) => {
    return new Promise((resolve, reject) => {
        try {
            let url = `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name,profile_pic&access_token=${PAGE_ACCESS_TOKEN}`;
            request({
                "uri": url,
                "method": "GET",
            }, (err, res, body) => {
                if (!err) {
                    body = JSON.parse(body);
                    let username = `${body.last_name} ${body.first_name}`;
                    resolve(username);
                } else {
                    reject("Unable to get username:" + err);
                }
            });
        } catch (e) {
            reject(e);
        }
    });
};

let handleGetStarted = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let username = await getFacebookUsername(sender_psid);
            let response1 = { "text": `Xin chào ${username}, đây là trang chính thức của BookingCare with Nobi. Tôi có thể giúp gì cho bạn?` };

            let response2 = sendGetStartedTemplate();

            await callSendAPI(sender_psid, response1);
            await callSendAPI(sender_psid, response2);

            resolve('done');
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
};

let sendGetStartedTemplate = () => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Đặt lịch khám bệnh với Booking Care with Nobi",
                    "subtitle": "Bạn cần hỗ trợ gì",
                    "image_url": IMAGE_GET_STARTED,
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "ĐẶT LỊCH",
                            "payload": "BOOK",
                        },
                        {
                            "type": "postback",
                            "title": "CHUYÊN KHOA",
                            "payload": "SPECIALTY",
                        },
                        {
                            "type": "postback",
                            "title": "CƠ SỞ Y TẾ",
                            "payload": "FACILITIES",
                        }
                    ],
                }]
            }
        }
    };
    return response;
}

let handlePostback = (sender_psid, payload) => {
    switch (payload) {
        case "BOOK":
            sendResponse(sender_psid, "Đang chuyển đến trang đặt lịch... https://nobithao-fe-bookingcare.vercel.app");
            break;
        case "SPECIALTY":
            sendResponse(sender_psid, "Đang chuyển đến trang chuyên khoa... [https://nobithao-fe-bookingcare.vercel.app/all-specialties]");
            break;
        case "FACILITIES":
            sendResponse(sender_psid, "Đang chuyển đến trang cơ sở y tế... [Link đến trang cơ sở y tế]");
            break;
        default:
            sendResponse(sender_psid, "Xin lỗi, tôi không hiểu yêu cầu của bạn.");
            break;
    }
};

let sendResponse = (sender_psid, message) => {
    const response = {
        "text": message
    };
    callSendAPI(sender_psid, response);
};

// Hàm xử lý webhook event
let handleWebhookEvent = (event) => {
    let sender_psid = event.sender.id;

    if (event.message) {
        handleMessage(event);
    } else if (event.postback) {
        handlePostbackEvent(event);
    }
};

let handleMessage = (event) => {
    // Xử lý tin nhắn văn bản nếu cần
    let sender_psid = event.sender.id;
    let message = event.message.text;
    // Bạn có thể thêm logic xử lý tin nhắn ở đây
};

let handlePostbackEvent = (event) => {
    let sender_psid = event.sender.id;
    let payload = event.postback.payload;

    handlePostback(sender_psid, payload);
};

// Export hàm handleGetStarted
module.exports = {
    handleGetStarted: handleGetStarted,
    handleWebhookEvent: handleWebhookEvent // Xuất hàm xử lý sự kiện webhook
};
