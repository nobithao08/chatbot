let sendAppointmentCategoriesTemplate = () => {
    return {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                        "title": "Đặt lịch khám",
                        "image_url": "https://your-image-url.com/appointment.png",
                        "subtitle": "Chọn ngày và giờ khám phù hợp",
                        "default_action": {
                            "type": "web_url",
                            "url": "https://your-medical-system.com/booking",
                            "webview_height_ratio": "tall",
                        },
                        "buttons": [
                            {
                                "type": "web_url",
                                "url": "https://your-medical-system.com/booking",
                                "title": "Đặt lịch ngay"
                            },
                            {
                                "type": "postback",
                                "title": "Xem lịch khám",
                                "payload": "VIEW_APPOINTMENTS"
                            }
                        ]
                    },
                    {
                        "title": "Liên hệ hỗ trợ",
                        "image_url": "https://your-image-url.com/support.png",
                        "subtitle": "Hỗ trợ giải đáp thắc mắc",
                        "default_action": {
                            "type": "web_url",
                            "url": "https://your-medical-system.com/support",
                            "webview_height_ratio": "tall",
                        },
                        "buttons": [
                            {
                                "type": "web_url",
                                "url": "https://your-medical-system.com/support",
                                "title": "Liên hệ ngay"
                            }
                        ]
                    }
                ]
            }
        }
    };
};

let sendAppointmentConfirmationTemplate = (appointmentDetails) => {
    return {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": `Lịch khám của bạn vào ngày ${appointmentDetails.date} lúc ${appointmentDetails.time}. Vui lòng xác nhận.`,
                "buttons": [
                    {
                        "type": "postback",
                        "title": "Xác nhận",
                        "payload": "CONFIRM_APPOINTMENT"
                    },
                    {
                        "type": "postback",
                        "title": "Hủy bỏ",
                        "payload": "CANCEL_APPOINTMENT"
                    }
                ]
            }
        }
    };
};

module.exports = {
    sendAppointmentCategoriesTemplate: sendAppointmentCategoriesTemplate,
    sendAppointmentConfirmationTemplate: sendAppointmentConfirmationTemplate,
};
