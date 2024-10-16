require("dotenv").config();
import request from "request";

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

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
            let response = { "text": "Xin chào, đây là trang chính thức của BookingCare with Nobi. Tôi có thể giúp gì cho bạn?" };
            await callSendAPI(sender_psid, response);  // Gọi hàm callSendAPI với sender_psid
            resolve('done');
        } catch (e) {
            console.error(e);  // Thêm log để kiểm tra lỗi
            reject(e);
        }
    });
};

module.exports = {
    handleGetStarted: handleGetStarted
};
