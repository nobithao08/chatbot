let handleMessage = (sender_psid, received_message) => {
    let response;

    const bookingKeywords = ["đặt lịch", "cách đặt lịch", "đặt lịch khám", "tôi muốn đặt lịch"];
    const doctorKeywords = ["bác sĩ", "tìm bác sĩ", "xem bác sĩ"];
    const legPainKeywords = ["đau chân", "đau xương khớp", "đau cơ", "vấn đề chân"];

    // Kiểm tra nếu tin nhắn chứa một trong các từ khóa đặt lịch
    if (received_message.text) {
        let messageText = received_message.text.toLowerCase();

        if (bookingKeywords.some(keyword => messageText.includes(keyword))) {
            response = { "text": "Bạn có thể đặt lịch khám tại đường dẫn sau: https://nobithao-fe-bookingcare.vercel.app/home" };
        } else if (doctorKeywords.some(keyword => messageText.includes(keyword))) {
            response = { "text": "Bạn có thể xem tất cả các bác sĩ tại đường dẫn sau: https://nobithao-fe-bookingcare.vercel.app/all-doctors" };
        } else if (legPainKeywords.some(keyword => messageText.includes(keyword))) {
            response = { "text": "Bạn có thể tìm hiểu thêm về khoa Cơ Xương Khớp tại đường dẫn sau: https://bookingcare.vn/khoa-co-xuong-khop" };
        } else {
            response = { "text": "Xin lỗi, tôi không hiểu yêu cầu của bạn. Bạn có thể tìm hỗ trợ tại: https://bookingcare.vn/ho-tro" };
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
        }
    }

    callSendAPI(sender_psid, response);
};


// Xử lý sự kiện postback
let handlePostback = (sender_psid, received_postback) => {
    let response;

    // Lấy payload của postback
    let payload = received_postback.payload;

    // Thiết lập phản hồi dựa trên postback payload
    if (payload === 'yes') {
        response = { "text": "Cảm ơn bạn đã cung cấp thông tin. Hệ thống sẽ sớm xem và phản hồi bạn sau. Vui lòng chờ!" };
    } else if (payload === 'no') {
        response = { "text": "Xin hãy thử gửi một hình ảnh khác." };
    } else if (payload === "GET_STARTED") {
        response = { "text": "Xin chào, đây là trang chính thức của BookingCare with Nobi. Tôi có thể giúp gì cho bạn?" };
    }

    // Gửi tin nhắn phản hồi
    callSendAPI(sender_psid, response);
};
