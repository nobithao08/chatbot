require("dotenv").config();
import request from "request";
import homepageController from "../controllers/homepageController";

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const IMAGE_GET_STARTED = 'https://bit.ly/nobithaoDatLich'

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

            let response2 = sendGetStratedTemplate();

            await callSendAPI(sender_psid, response1);

            await callSendAPI(sender_psid, response2);

            resolve('done');
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
};

let sendGetStratedTemplate = () => {
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

async function handlePostback(sender_psid, received_postback) {
    let response;
    let payload = received_postback.payload;

    switch (payload) {
        case 'yes':
            response = { "text": "Cảm ơn bạn đã cung cấp thông tin. Hệ thống sẽ sớm xem và phản hồi bạn sau. Vui lòng chờ!" };
            break;
        case 'no':
            response = { "text": "Xin hãy thử gửi một hình ảnh khác." };
            break;
        case 'RESTART_CONVERSATION':
        case 'GET_STARTED':
            await chatBotService.handleGetStarted(sender_psid);
            return; // Không cần tiếp tục
        case 'BOOK':
            response = await homepageController.handleBooking(sender_psid);
            break;
        case 'SPECIALTY':
            response = await homepageController.handleSpecialty(sender_psid);
            break;
        case 'FACILITIES':
            response = await homepageController.handleFacilities(sender_psid);
            break;
        default:
            response = { "text": `Tôi không biết phản hồi với postback ${payload}` };
    }

    callSendAPI(sender_psid, response);
}

module.exports = {
    handleGetStarted: handleGetStarted,
    handlePostback: handlePostback
};
