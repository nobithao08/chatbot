require("dotenv").config();
import request from "request";
import chatBotService from "../services/chatBotService";

const MY_VERIFY_TOKEN = process.env.MY_VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

let getHomepage = (req, res) => {
    return res.render("homepage.ejs");
};

let getWebhook = (req, res) => {
    let VERIFY_TOKEN = MY_VERIFY_TOKEN;
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
            console.log('Sender PSID: ' + sender_psid);

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

// Xử lý tin nhắn
let handleMessage = (sender_psid, received_message) => {
    let response;

    const bookingKeywords = ["đặt lịch", "cách đặt lịch", "đặt lịch khám", "tôi muốn đặt lịch"];
    const legPainKeywords = ["đau chân", "đau xương khớp", "đau cơ", "vấn đề chân"];

    // Danh sách bác sĩ với tên và đường dẫn chi tiết
    const doctorsList = {
        "bác sĩ hà": "https://nobithao-fe-bookingcare.vercel.app/detail-doctor/23",
        "bác sĩ nguyễn": "https://nobithao-fe-bookingcare.vercel.app/doctors/nguyen",
        "bác sĩ lê": "https://nobithao-fe-bookingcare.vercel.app/doctors/le",
        // Thêm các bác sĩ khác tại đây
    };

    if (received_message.text) {
        let messageText = received_message.text.toLowerCase();

        // Kiểm tra xem có tên bác sĩ cụ thể nào trong tin nhắn hay không
        let doctorFound = false;
        for (let doctor in doctorsList) {
            if (messageText.includes(doctor)) {
                response = { "text": `Đây là trang thông tin của ${doctor}: ${doctorsList[doctor]}` };
                doctorFound = true;
                break;
            }
        }

        // Nếu không tìm thấy tên bác sĩ cụ thể, tiếp tục kiểm tra các từ khóa khác
        if (!doctorFound) {
            if (bookingKeywords.some(keyword => messageText.includes(keyword))) {
                response = { "text": "Bạn có thể đặt lịch khám tại đường dẫn sau: https://nobithao-fe-bookingcare.vercel.app/home" };
            } else if (messageText.includes("bác sĩ")) { // Kiểm tra từ khóa chung "bác sĩ" nếu không có tên bác sĩ cụ thể
                response = { "text": "Bạn có thể xem tất cả các bác sĩ tại đường dẫn sau: https://nobithao-fe-bookingcare.vercel.app/all-doctors" };
            } else if (legPainKeywords.some(keyword => messageText.includes(keyword))) {
                response = { "text": "Bạn có thể tìm hiểu thêm về khoa Cơ Xương Khớp tại đường dẫn sau: https://bookingcare.vn/khoa-co-xuong-khop" };
            } else {
                response = { "text": "Xin lỗi, tôi không hiểu yêu cầu của bạn. Bạn có thể tìm hỗ trợ tại: https://bookingcare.vn/ho-tro" };
            }
        }
    } else if (received_message.attachments) {
        let attachment_url = received_message.attachments[0].payload.url;
        response = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": "Đây có phải là bức ảnh bạn gửi không?",
                        "subtitle": "Nhấn vào nút để trả lời.",
                        "image_url": attachment_url,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Phải!",
                                "payload": "yes",
                            },
                            {
                                "type": "postback",
                                "title": "Không!",
                                "payload": "no",
                            }
                        ],
                    }]
                }
            }
        };
    }

    callSendAPI(sender_psid, response);
};

// Xử lý sự kiện postback
let handlePostback = (sender_psid, received_postback) => {
    let response;
    let payload = received_postback.payload;

    if (payload === 'yes') {
        response = { "text": "Cảm ơn bạn đã cung cấp thông tin. Hệ thống sẽ sớm xem và phản hồi bạn sau. Vui lòng chờ!" };
    } else if (payload === 'no') {
        response = { "text": "Xin hãy thử gửi một hình ảnh khác." };
    } else if (payload === "GET_STARTED") {
        response = { "text": "Xin chào, đây là trang chính thức của BookingCare with Nobi. Tôi có thể giúp gì cho bạn?" };
    }

    callSendAPI(sender_psid, response);
};

// Gửi tin nhắn qua API
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
};

let setupProfile = (req, res) => {
    let request_body = {
        "get_started": { "payload": "GET_STARTED" },
        "whitelisted_domains": ["https://chatbot-3iqe.onrender.com/"]
    };

    request({
        "uri": `https://graph.facebook.com/v9.0/me/messenger_profile`,
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('Setup user profile succeeds!');
        } else {
            console.error("Unable to setup user profile: " + err);
        }
    });

    return res.send('Setup user profile succeeds!');
};

module.exports = {
    getHomepage,
    getWebhook,
    postWebhook,
    setupProfile,
};
