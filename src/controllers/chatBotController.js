import request from "request";
import moment from "moment";
import chatBotService from "../services/chatBotService";

let user = {
    name: "",
    phoneNumber: "",
    time: "",
    createdAt: ""
};

// Xử lý tin nhắn từ người dùng
let handleMessage = async (sender_psid, received_message) => {
    let message = received_message.text.toLowerCase(); // Chuyển chữ thành dạng thường

    if (message.includes("đặt lịch")) {
        await chatBotService.sendTypingOn(sender_psid);
        await chatBotService.sendMessage(sender_psid, "Bạn muốn đặt lịch khám, vui lòng chọn thời gian:");
        // Điều hướng người dùng đến trang đặt lịch
        await chatBotService.sendRedirectToBookingPage(sender_psid);
    }
    else if (message.includes("bác sĩ")) {
        await chatBotService.sendTypingOn(sender_psid);
        await chatBotService.sendMessage(sender_psid, "Bạn đang tìm thông tin bác sĩ, đây là danh sách:");
        // Điều hướng người dùng đến trang thông tin bác sĩ
        await chatBotService.sendRedirectToDoctorInfoPage(sender_psid);
    }
    else if (message.includes("hướng dẫn")) {
        await chatBotService.sendTypingOn(sender_psid);
        await chatBotService.sendMessage(sender_psid, "Đây là hướng dẫn sử dụng bot của chúng tôi:");
        // Điều hướng đến trang hướng dẫn
        await chatBotService.sendRedirectToGuidePage(sender_psid);
    }
    else {
        await chatBotService.sendTypingOn(sender_psid);
        await chatBotService.sendMessage(sender_psid, "Xin lỗi, tôi không hiểu yêu cầu của bạn.");
    }
};

// Xử lý postback từ người dùng
let handlePostback = async (sender_psid, received_postback) => {
    let payload = received_postback.payload;

    switch (payload) {
        case "CONFIRM_APPOINTMENT":
            await chatBotService.sendTypingOn(sender_psid);
            user.createdAt = moment(Date.now()).format('MM/DD/YYYY h:mm A');
            await chatBotService.sendMessage(sender_psid, "Lịch khám của bạn đã được xác nhận!");
            // Gửi thông báo đến hệ thống
            await chatBotService.sendNotificationToTelegram(user);
            break;
        default:
            console.log("Postback không xác định");
    }
};

// Xử lý webhook
let postWebhook = (req, res) => {
    let body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(function (entry) {
            let webhook_event = entry.messaging[0];
            let sender_psid = webhook_event.sender.id;

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
    postWebhook: postWebhook,
    getWebhook: getWebhook
};
