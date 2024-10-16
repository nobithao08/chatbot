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

let handleGetStarted = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = { "text": "Xin chào, đây là trang chính thức của BookingCare with Nobi. Tôi có thể giúp gì cho bạn?" }
            await callSendAPI(sender_psid, response);
            resolve('done');

        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    // callSendAPI: callSendAPI,
    handleGetStarted: handleGetStarted
};
