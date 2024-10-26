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

const IMAGE_THUCUC = 'https://thanhnienviet.mediacdn.vn/thumb_w/480/hinh-anh/2023/06/05/156/image-20230605181957-1.jpeg'
const IMAGE_QUOCTECITY = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2i2lxMLZHGiMn5mamzUo4_yHLlxnpofig2Q&s'
const IMAGE_HUNGVIET = 'https://congchungnguyenhue.com/Uploaded/Images/Original/2023/11/22/bvungbuouhungviet_2211103042.jpg'
const IMAGE_GOLDEN = 'https://taimuihongsg.com/wp-content/uploads/2024/02/phong-kham-da-khoa-golden-healthcare-chuyen-cung-cap-dich-vu-kham-toan-dien-1.jpeg'
const IMAGE_ANVIET = 'https://benhvienanviet.com/upload/photos/shares/633ba53a0e67b.jpg'
const IMAGE_MAIA = 'https://suckhoeviet.org.vn/stores/news_dataimages/2024/042024/10/13/120240410130923.jpg?rt=20240410130925'
const IMAGE_HELLO = 'https://topdanangaz.com/wp-content/uploads/2023/12/phong-kham-than-kinh-da-nang_5.jpg'
const IMAGE_SUNSHINE = 'https://cdn.youmed.vn/photos/00e5fcd5-c6f2-4b76-a7ae-72c20c09bff6.jpg?aspect_ratio=1:0.53'
const IMAGE_HONGDUC = 'https://hongduchospital.vn/public/userfiles/logo-share-1.jpg'
const IMAGE_FV = 'https://vcdn1-kinhdoanh.vnecdn.net/2023/07/13/benh-vien-fv-da-chu-dong-san-s-7700-3312-1689242709.jpg?w=460&h=0&q=100&dpr=2&fit=crop&s=qSf1FO2H9iTd_XtWKdhL3g'


let callSendAPI = async (sender_psid, response) => {
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }

    await markMessageSeen(sender_psid)
    await sendTypingOn(sender_psid)

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

let sendTypingOn = (sender_psid) => {
    return new Promise((resolve, reject) => {
        try {
            let request_body = {
                "recipient": {
                    "id": sender_psid
                },
                "sender_action": "typing_on"
            };

            // Send the HTTP request to the Messenger Platform
            request({
                "uri": "https://graph.facebook.com/v6.0/me/messages",
                "qs": { "access_token": PAGE_ACCESS_TOKEN },
                "method": "POST",
                "json": request_body
            }, (err, res, body) => {
                if (!err) {
                    resolve('done!')
                } else {
                    reject("Unable to send message:" + err);
                }
            });
        } catch (e) {
            reject(e);
        }
    });
};

let markMessageSeen = (sender_psid) => {
    return new Promise((resolve, reject) => {
        try {
            let request_body = {
                "recipient": {
                    "id": sender_psid
                },
                "sender_action": "mark_seen"
            };

            // Send the HTTP request to the Messenger Platform
            request({
                "uri": "https://graph.facebook.com/v6.0/me/messages",
                "qs": { "access_token": PAGE_ACCESS_TOKEN },
                "method": "POST",
                "json": request_body
            }, (err, res, body) => {
                if (!err) {
                    resolve('done!')
                } else {
                    reject("Unable to send message:" + err);
                }
            });
        } catch (e) {
            reject(e);
        }
    });
};

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
                                "type": "web_url",
                                "url": "https://nobithao-fe-bookingcare.vercel.app/detail-specialty/1",
                                "title": "XEM CHI TIẾT",
                            }
                        ],
                    },
                    {
                        "title": "Khoa Thần kinh",
                        "subtitle": "Khoa Thần kinh tại hệ thống Booking Care chuyên điều trị các bệnh thần kinh, can thiệp thần kinh, phẫu thuật thần kinh.",
                        "image_url": IMAGE_THANKINH,
                        "buttons": [
                            {
                                "type": "web_url",
                                "url": "https://nobithao-fe-bookingcare.vercel.app/detail-specialty/2",
                                "title": "XEM CHI TIẾT",
                            }
                        ],
                    },
                    {
                        "title": "Khoa Tiêu hóa",
                        "subtitle": "Khoa tiêu hoá tại hệ thống Booking Care chuyên điều trị các bệnh về tiêu hoá, rối loạn chức năng tiêu hoá và các cơ quan nội tạng.",
                        "image_url": IMAGE_TIEUHOA,
                        "buttons": [
                            {
                                "type": "web_url",
                                "url": "https://nobithao-fe-bookingcare.vercel.app/detail-specialty/3",
                                "title": "XEM CHI TIẾT",
                            }
                        ],
                    },
                    {
                        "title": "Khoa Da liễu",
                        "subtitle": "Khoa Da liễu tại hệ thống Booking Care chuyên điều trị các bệnh về da và những phần phụ của da (tóc, móng, tuyến mồ hôi…)",
                        "image_url": IMAGE_DALIEU,
                        "buttons": [
                            {
                                "type": "web_url",
                                "url": "https://nobithao-fe-bookingcare.vercel.app/detail-specialty/4",
                                "title": "XEM CHI TIẾT",
                            }
                        ],
                    },
                    {
                        "title": "Chuyên Khoa Mắt",
                        "subtitle": "Chuyên Khoa Mắt tại hệ thống Booking Care chuyên khám toàn diện và quản lý một số bệnh như bệnh võng mạc đái tháo đường, thoái hóa hoàng điểm tuổi già, glô-côm, bệnh mắt ...",
                        "image_url": IMAGE_MAT,
                        "buttons": [
                            {
                                "type": "web_url",
                                "url": "https://nobithao-fe-bookingcare.vercel.app/detail-specialty/5",
                                "title": "XEM CHI TIẾT",
                            }
                        ],
                    },
                    {
                        "title": "Khoa Tim mạch",
                        "subtitle": "Khoa Tim mạch tại hệ thống Booking Care chuyên cấp cứu, chẩn đoán và điều trị các bệnh Tim mạch. Thực hiện các kỹ thuật chẩn đoán, can thiệp tim mạch và nhịp học ...",
                        "image_url": IMAGE_TIMMACH,
                        "buttons": [
                            {
                                "type": "web_url",
                                "url": "https://nobithao-fe-bookingcare.vercel.app/detail-specialty/6",
                                "title": "XEM CHI TIẾT",
                            }
                        ],
                    },
                    {
                        "title": "Khoa Tai Mũi Họng",
                        "subtitle": "Khoa Tai Mũi Họng tại hệ thống Booking Care chuyên tập trung điều trị chuyên sâu các bệnh lý liên quan đến Tai, Mũi, Họng và vùng đầu cổ",
                        "image_url": IMAGE_TAIMUIHONG,
                        "buttons": [
                            {
                                "type": "web_url",
                                "url": "https://nobithao-fe-bookingcare.vercel.app/detail-specialty/7",
                                "title": "XEM CHI TIẾT",
                            }
                        ],
                    },
                    {
                        "title": "Khoa Sức khỏe tâm thần",
                        "subtitle": "Khoa Sức khỏa tâm thần tại hệ thống Booking Care chuyên thực hiện quá trình thăm khám, điều trị các mặt bệnh: trầm cảm, rối loạn lo âu, mất ngủ, tự kỉ,..",
                        "image_url": IMAGE_SUCKHOATAMTHAN,
                        "buttons": [
                            {
                                "type": "web_url",
                                "url": "https://nobithao-fe-bookingcare.vercel.app/detail-specialty/8",
                                "title": "XEM CHI TIẾT",
                            }
                        ],
                    },
                    {
                        "title": "Khoa Thận - Tiết niệu",
                        "subtitle": "Khoa Thận - Tiết niệu tại hệ thống Booking Care chuyên khám bệnh, tư vấn, chẩn đoán, thu dung, cấp cứu, phẫu thuật, điều trị tất cả các bệnh lý đường tiết niệu trên: chấn thương, vết thương, các bệnh lý u đường tiết niệu trên, sỏi, viêm, dị dạng đường tiết niệu",
                        "image_url": IMAGE_THANTIETNIEU,
                        "buttons": [
                            {
                                "type": "web_url",
                                "url": "https://nobithao-fe-bookingcare.vercel.app/detail-specialty/9",
                                "title": "XEM CHI TIẾT",
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

                            },
                            {
                                "type": "web_url",
                                "url": `${process.env.URL_WEB_VIEW_BOOKING}`,
                                "webview_height_ratio": "tall",
                                "title": "ĐẶT LỊCH NGAY",
                                "messenger_extensions": true //false: open the webview in new tab
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
                                "payload": "FACILITIES",
                            }
                        ],
                    },
                    {
                        "title": "Bác sĩ",
                        "subtitle": "Bác sĩ tại hệ thống Booking Care hội tụ các bác sĩ ưu tú hàng đầu, giàu kinh nghiệm trong công tác khám và điều trị bệnh ở tất cả các chuyên khoa",
                        "image_url": IMAGE_BACSI,
                        "buttons": [
                            {
                                "type": "web_url",
                                "url": "https://nobithao-fe-bookingcare.vercel.app/all-doctors",
                                "title": "XEM CHI TIẾT"
                            }
                        ],
                    }
                ]
            }
        }
    };
    return response;
}

let handleSendFacility = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {

            let response1 = getFacilityTemplate();
            await callSendAPI(sender_psid, response1);

            resolve('done');
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
};

let getFacilityTemplate = () => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                        "title": "Hệ thống Y tế Thu Cúc TCI",
                        "subtitle": "Hệ thống Thu Cúc gồm các đơn vị bệnh viện và phòng khám đa khoa, khám và điều trị nhiều nhóm bệnh khác nhau như: Cơ xương khớp, Tim mạch, Tiêu hóa, Tai mũi họng ...",
                        "image_url": IMAGE_THUCUC,
                        "buttons": [
                            {
                                "type": "web_url",
                                "url": "https://nobithao-fe-bookingcare.vercel.app/detail-clinic/1",
                                "title": "XEM CHI TIẾT"
                            }
                        ],
                    },
                    {
                        "title": "Bệnh viện Quốc tế City",
                        "subtitle": "Bệnh viện Quốc tế City (hay được gọi tắt là CIH) nằm tại Khu y tế kỹ thuật cao Hoa Lâm, Shangrila với quy mô rộng lớn lên đến 320 giường bệnh. Bên cạnh đó, bệnh ...",
                        "image_url": IMAGE_QUOCTECITY,
                        "buttons": [
                            {
                                "type": "web_url",
                                "url": "https://nobithao-fe-bookingcare.vercel.app/detail-clinic/2",
                                "title": "XEM CHI TIẾT"
                            }
                        ],
                    },
                    {
                        "title": "Bệnh viện Ung bướu Hưng Việt",
                        "subtitle": "Bệnh viện Hưng Việt tên đầy đủ là Bệnh viện Ung bướu Hưng Việt chuyên sâu khám, điều trị các nhóm bệnh ung thư. Đây cũng là bệnh viện chuyên khoa ung bướu tư ...",
                        "image_url": IMAGE_HUNGVIET,
                        "buttons": [
                            {
                                "type": "web_url",
                                "url": "https://nobithao-fe-bookingcare.vercel.app/detail-clinic/3",
                                "title": "XEM CHI TIẾT"
                            }
                        ],
                    },
                    {
                        "title": "Phòng khám Đa khoa Quốc tế Golden Healthcare",
                        "subtitle": "Phòng khám Đa khoa Quốc tế Golden Healthcare · Được lựa chọn khám với các bác sĩ chuyên khoa giàu kinh nghiệm · Hỗ trợ đặt khám trực tuyến trước khi đi khám ( ...",
                        "image_url": IMAGE_GOLDEN,
                        "buttons": [
                            {
                                "type": "web_url",
                                "url": "https://nobithao-fe-bookingcare.vercel.app/detail-clinic/4",
                                "title": "XEM CHI TIẾT"
                            }
                        ],
                    },
                    {
                        "title": "Bệnh viện Đa khoa An Việt",
                        "subtitle": "Bệnh viện Đa khoa An Việt là bệnh viện tư nhân được xây dựng và đi vào hoạt động kể từ năm 2016. Là bệnh viện đa khoa, song thế mạnh đặc biệt ở đây là chẩn ...",
                        "image_url": IMAGE_ANVIET,
                        "buttons": [
                            {
                                "type": "web_url",
                                "url": "https://nobithao-fe-bookingcare.vercel.app/detail-clinic/5",
                                "title": "XEM CHI TIẾT"
                            }
                        ],
                    },
                    {
                        "title": "Phòng khám Chuyên khoa Da liễu Maia&Maia",
                        "subtitle": "Phòng khám Chuyên khoa Da liễu Maia&Maia thành lập từ năm 2010, là đơn vị chuyên thăm khám, điều trị các bệnh lý về da và thẩm mỹ công nghệ cao.",
                        "image_url": IMAGE_MAIA,
                        "buttons": [
                            {
                                "type": "web_url",
                                "url": "https://nobithao-fe-bookingcare.vercel.app/detail-clinic/6",
                                "title": "XEM CHI TIẾT"
                            }
                        ],
                    },
                    {
                        "title": "Phòng khám Hello Doctor",
                        "subtitle": "Hệ thống phòng khám Hello Doctor ra đời với sứ mệnh Mang Sức Khỏe đến cuộc sống. Hello Doctor cung cấp dịch vụ khám và điệu trị chất lượng cao đa chuyên khoa.",
                        "image_url": IMAGE_HELLO,
                        "buttons": [
                            {
                                "type": "web_url",
                                "url": "https://nobithao-fe-bookingcare.vercel.app/detail-clinic/7",
                                "title": "XEM CHI TIẾT"
                            }
                        ],
                    },
                    {
                        "title": "Sunshine Eye Care",
                        "subtitle": "Sunshine Eye Care là trung tâm nhãn khoa hàng đầu tại Việt Nam, nổi bật với chuyên môn và quy trình khám điều trị hiệu quả nhất dành cho bệnh nhân.",
                        "image_url": IMAGE_SUNSHINE,
                        "buttons": [
                            {
                                "type": "web_url",
                                "url": "https://nobithao-fe-bookingcare.vercel.app/detail-clinic/8",
                                "title": "XEM CHI TIẾT"
                            }
                        ],
                    },
                    {
                        "title": "Bệnh viện Đa khoa Hồng Đức",
                        "subtitle": "Hệ thống Bệnh Viện Đa Khoa Hồng Đức là địa chỉ uy tín về khám chữa bệnh, với đội ngũ chuyên gia - bác sĩ hàng đầu, trang thiết bị hiện đại, cùng các phác đồ ...",
                        "image_url": IMAGE_HONGDUC,
                        "buttons": [
                            {
                                "type": "web_url",
                                "url": "https://nobithao-fe-bookingcare.vercel.app/detail-clinic/9",
                                "title": "XEM CHI TIẾT"
                            }
                        ],
                    },
                    {
                        "title": "Bệnh viện FV",
                        "subtitle": "Bệnh viện FV có đội ngũ bác sĩ được đào tạo chuyên môn và trang thiết bị để thực hiện cả phẫu thuật mở và phẫu thuật nội soi. Phẫu thuật nội soi, còn gọi là ...",
                        "image_url": IMAGE_FV,
                        "buttons": [
                            {
                                "type": "web_url",
                                "url": "https://nobithao-fe-bookingcare.vercel.app/detail-clinic/10",
                                "title": "XEM CHI TIẾT"
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
    handleSendSpecialty: handleSendSpecialty,
    handleSendFacility: handleSendFacility,
    callSendAPI: callSendAPI
};
