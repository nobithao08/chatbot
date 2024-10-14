require("dotenv").config();

let getHomePage = (req, res) => {
    let facebookAppId = process.env.FACEBOOK_APP_ID;
    return res.render("homepage.ejs", {
        facebookAppId: facebookAppId
    })
};

let getWebhook = (req, res) => {
    // Token xác thực
    let VERIFY_TOKEN = MY_VERIFY_TOKEN;

    // Lấy các tham số từ query string
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Kiểm tra token và mode
    if (mode && token) {
        // Nếu token và mode hợp lệ, trả về challenge để xác minh webhook
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            // Token không hợp lệ thì trả về lỗi 403
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(404);
    }
};


let postWebhook = (req, res) => {
    let body = req.body;

    // Kiểm tra xem có phải yêu cầu từ chatbot không
    if (body.object === 'web_chat') {
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

// Xử lý sự kiện khi người dùng gửi tin nhắn
let handleMessage = async (sender_psid, received_message) => {
    let response;

    // Nếu tin nhắn chứa văn bản
    if (received_message.text) {
        switch (received_message.text.toLowerCase()) {
            case "đặt lịch":
                response = {
                    "text": "Vui lòng cung cấp thông tin của bạn: Họ tên, Số điện thoại, và Bác sĩ bạn muốn gặp."
                };
                break;
            case "bác sĩ":
                response = {
                    "text": "Chọn bác sĩ bạn muốn đặt lịch: 1. Bác sĩ A, 2. Bác sĩ B"
                };
                break;
            default:
                response = {
                    "text": `Bạn đã gửi: "${received_message.text}". Vui lòng nhập 'đặt lịch' để bắt đầu quá trình đặt lịch khám.`
                };
                break;
        }
    } else if (received_message.attachments) {
        response = {
            "text": "Hiện tại chúng tôi không hỗ trợ hình ảnh. Vui lòng nhập thông tin cần thiết để đặt lịch khám."
        };
    }

    // Gửi phản hồi
    await sendMessage(sender_psid, response);
};

// Xử lý sự kiện postback từ người dùng
let handlePostback = async (sender_psid, received_postback) => {
    let payload = received_postback.payload;
    let response;

    switch (payload) {
        case "GET_STARTED":
            response = { "text": "Chào mừng bạn đến với dịch vụ đặt lịch khám. Nhập 'đặt lịch' để bắt đầu." };
            break;
        case "RESTART_CONVERSATION":
            response = { "text": "Cuộc trò chuyện đã được khởi động lại. Nhập 'đặt lịch' để tiếp tục." };
            break;
        default:
            response = { "text": "Vui lòng nhập 'đặt lịch' để bắt đầu quá trình đặt lịch." };
            break;
    }

    await sendMessage(sender_psid, response);
};

// Hàm gửi tin nhắn (giả lập việc gửi tin)
let sendMessage = async (psid, response) => {
    // Tùy thuộc vào framework web chat đang sử dụng, gửi phản hồi đến client
    console.log(`Sending message to PSID ${psid}:`, response.text);
};

// Thiết lập cấu hình và các route
let handleSetupProfile = async (req, res) => {
    // Thiết lập chatbot hoặc các thông tin cần thiết
    return res.redirect("/");
};

let getSetupProfilePage = (req, res) => {
    return res.render("profile.ejs");
};

let getInfoOrderPage = (req, res) => {
    return res.render("infoOrder.ejs");
};

let setInfoOrder = async (req, res) => {
    // Xử lý khi người dùng nhập thông tin đặt lịch
    try {
        let customerName = req.body.customerName || "Khách hàng chưa cung cấp tên";

        let response = {
            "text": `Thông tin lịch hẹn: 
            \nTên khách hàng: ${customerName}
            \nSố điện thoại: ${req.body.phoneNumber}
            \nBác sĩ: ${req.body.doctorName}`
        };

        await sendMessage(req.body.psid, response);

        return res.status(200).json({
            message: "Đặt lịch thành công"
        });
    } catch (e) {
        console.log(e);
    }
};

module.exports = {
    getHomePage,
    getWebhook,
    postWebhook,
    handleSetupProfile,
    getSetupProfilePage,
    getInfoOrderPage,
    setInfoOrder
};
