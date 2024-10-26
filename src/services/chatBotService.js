require("dotenv").config();
import request from "request";

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const IMAGE_GET_STARTED = 'https://bit.ly/nobithaoDatLich'
const IMAGE_CHUYENKHOA = 'https://cdn.bookingcare.vn/fo/w384/2023/11/01/140537-chuyen-khoa.png'
const IMAGE_COSOYTE = 'https://cdn.bookingcare.vn/fo/w384/2023/11/01/141017-csyt.png'
const IMAGE_BACSI = 'https://cdn.bookingcare.vn/fo/w384/2023/11/01/140234-bac-si.png'


const IMAGE_COXUONGKHOP = 'https://bit.ly/nobithaoCoXuongKhop'
const IMAGE_THANKINH = 'https://cdn.bookingcare.vn/fo/w384/2023/12/26/101739-than-kinh.png'
const IMAGE_TIEUHOA = 'https://cdn.bookingcare.vn/fo/w384/2023/12/26/101713-tieu-hoa.png'
const IMAGE_DALIEU = 'https://cdn.bookingcare.vn/fo/w1920/2023/12/26/101638-da-lieu.png'
const IMAGE_MAT = 'https://cdn.bookingcare.vn/fo/w384/2023/12/26/101638-mat.png'
const IMAGE_TIMMACH = 'https://cdn.bookingcare.vn/fo/w384/2023/12/26/101713-tim-mach.png'
const IMAGE_TAIMUIHONG = 'https://cdn.bookingcare.vn/fo/w384/2023/12/26/101713-tai-mui-hong.png'
const IMAGE_SUCKHOATAMTHAN = 'https://cdn.bookingcare.vn/fo/w384/2023/12/26/101713-suc-khoe-tam-than.png'
const IMAGE_THANTIETNIEU = 'https://cdn.bookingcare.vn/fo/w384/2023/12/26/101739-than-tiet-nieu.png'

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

            let response2 = getStartedTemplate();

            await callSendAPI(sender_psid, response1);

            await callSendAPI(sender_psid, response2);

            resolve('done');
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
};

let getStartedTemplate = () => {
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

let handleSendSpecialty = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {

            let response1 = getSpecialtyTemplate();

            await callSendAPI(sender_psid, response1);


            resolve('done');
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
};

let getSpecialtyTemplate = () => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                        "title": "Khoa Cơ Xương Khớp",
                        "subtitle": "Khoa Cơ Xương Khớp tại Hệ thống Booking Care bao gồm 3 chuyên khoa: Nội cơ xương khớp, Ngoại cơ xương khớp và Phục hồi chức năng.",
                        "image_url": IMAGE_COXUONGKHOP,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "XEM CHI TIẾT",
                                "payload": "MORE_COXUONGKHOP",
                            }
                        ],
                    },
                    {
                        "title": "Khoa Thần kinh",
                        "subtitle": "Khoa Thần kinh tại hệ thống Booking Care chuyên điều trị các bệnh thần kinh, can thiệp thần kinh, phẫu thuật thần kinh.",
                        "image_url": IMAGE_THANKINH,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "XEM CHI TIẾT",
                                "payload": "MORE_THANKINH",
                            }
                        ],
                    },
                    {
                        "title": "Khoa Tiêu hóa",
                        "subtitle": "Khoa tiêu hoá tại hệ thống Booking Care chuyên điều trị các bệnh về tiêu hoá, rối loạn chức năng tiêu hoá và các cơ quan nội tạng.",
                        "image_url": IMAGE_TIEUHOA,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "XEM CHI TIẾT",
                                "payload": "MORE_TIEUHOA",
                            }
                        ],
                    },
                    {
                        "title": "Khoa Da liễu",
                        "subtitle": "Khoa Da liễu tại hệ thống Booking Care chuyên điều trị các bệnh về da và những phần phụ của da (tóc, móng, tuyến mồ hôi…)",
                        "image_url": IMAGE_DALIEU,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "XEM CHI TIẾT",
                                "payload": "MORE_DALIEU",
                            }
                        ],
                    },
                    {
                        "title": "Chuyên Khoa Mắt",
                        "subtitle": "Chuyên Khoa Mắt tại hệ thống Booking Care chuyên khám toàn diện và quản lý một số bệnh như bệnh võng mạc đái tháo đường, thoái hóa hoàng điểm tuổi già, glô-côm, bệnh mắt ...",
                        "image_url": IMAGE_MAT,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "XEM CHI TIẾT",
                                "payload": "MORE_MAT",
                            }
                        ],
                    },
                    {
                        "title": "Khoa Tim mạch",
                        "subtitle": "Khoa Tim mạch tại hệ thống Booking Care chuyên cấp cứu, chẩn đoán và điều trị các bệnh Tim mạch. Thực hiện các kỹ thuật chẩn đoán, can thiệp tim mạch và nhịp học ...",
                        "image_url": IMAGE_TIMMACH,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "XEM CHI TIẾT",
                                "payload": "MORE_TIMMACH",
                            }
                        ],
                    },
                    {
                        "title": "Khoa Tai Mũi Họng",
                        "subtitle": "Khoa Tai Mũi Họng tại hệ thống Booking Care chuyên tập trung điều trị chuyên sâu các bệnh lý liên quan đến Tai, Mũi, Họng và vùng đầu cổ",
                        "image_url": IMAGE_TAIMUIHONG,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "XEM CHI TIẾT",
                                "payload": "MORE_TAIMUIHONG",
                            }
                        ],
                    },
                    {
                        "title": "Khoa Sức khỏe tâm thần",
                        "subtitle": "Khoa Sức khỏa tâm thần tại hệ thống Booking Care chuyên thực hiện quá trình thăm khám, điều trị các mặt bệnh: trầm cảm, rối loạn lo âu, mất ngủ, tự kỉ,..",
                        "image_url": IMAGE_SUCKHOATAMTHAN,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "XEM CHI TIẾT",
                                "payload": "MORE_SUCKHOATAMTHAN",
                            }
                        ],
                    },
                    {
                        "title": "Khoa Thận - Tiết niệu",
                        "subtitle": "Khoa Thận - Tiết niệu tại hệ thống Booking Care chuyên khám bệnh, tư vấn, chẩn đoán, thu dung, cấp cứu, phẫu thuật, điều trị tất cả các bệnh lý đường tiết niệu trên: chấn thương, vết thương, các bệnh lý u đường tiết niệu trên, sỏi, viêm, dị dạng đường tiết niệu",
                        "image_url": IMAGE_THANTIETNIEU,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "XEM CHI TIẾT",
                                "payload": "MORE_THANTIETNIEU",
                            }
                        ],
                    },

                ]
            }
        }
    };
    return response;
}

let handleSendBook = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {

            let response1 = getBookTemplate();

            await callSendAPI(sender_psid, response1);


            resolve('done');
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
};

let getBookTemplate = () => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                        "title": "Đặt lịch khám bệnh",
                        "subtitle": "Đặt lịch khám bệnh tại hệ thống Booking Care vừa nhanh chóng, tiện lợi, an toàn và bảo mật",
                        "image_url": IMAGE_GET_STARTED,
                        "buttons": [
                            {
                                "type": "web_url",
                                "url": "https://nobithao-fe-bookingcare.vercel.app/home",
                                "title": "XEM CHI TIẾT"
                            }
                        ],
                    },
                    {
                        "title": "Chuyên khoa khám bệnh",
                        "subtitle": "Chuyên khoa khám bệnh tại hệ thống Booking Care bao gồm 20 cơ sở y tế với đầy đủ các chuyên khoa ",
                        "image_url": IMAGE_CHUYENKHOA,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "XEM CHI TIẾT",
                                "payload": "SPECIALTY",
                            }
                        ],
                    },
                    {
                        "title": "Cơ sở y tế",
                        "subtitle": "Cơ sở y tế tại hệ thống Booking Care trải dài khắp cả nước, giúp người dùng có thể đặt lịch khám một cách dễ dàng",
                        "image_url": IMAGE_COSOYTE,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "XEM CHI TIẾT",
                                "payload": "MORE_COSOYTE",
                            }
                        ],
                    },
                    {
                        "title": "Bác sĩ",
                        "subtitle": "Bác sĩ tại hệ thống Booking Care hội tụ các bác sĩ ưu tú hàng đầu, giàu kinh nghiệm trong công tác khám và điều trị bệnh ở tất cả các chuyên khoa",
                        "image_url": IMAGE_BACSI,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "XEM CHI TIẾT",
                                "payload": "MORE_BACSI",
                            }
                        ],
                    }
                ]
            }
        }
    };
    return response;
}

module.exports = {
    handleGetStarted: handleGetStarted,
    handleSendBook: handleSendBook,
    handleSendSpecialty: handleSendSpecialty
};
