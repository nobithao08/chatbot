require("dotenv").config();
import request from "request";
import chatBotService from "../services/chatBotService";
import moment from "moment";
import "moment-timezone";
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const MY_VERIFY_TOKEN = process.env.MY_VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

const IMAGE_GET_STARTED = 'https://bit.ly/nobithaoDatLich'
const IMAGE_ALL_DOCTOR = 'https://bit.ly/nobithaoAllBacSi'
const IMAGE_MALE_DOCTOR = 'https://bit.ly/nobithaoBacSiNam'
// const IMAGE_FEMALE_DOCTOR = 'https://bit.ly/nobithaoBacSiNu'
const IMAGE_FEMALE_DOCTOR = 'https://png.pngtree.com/png-vector/20240822/ourlarge/pngtree-clipart-a-doctor-png-image_13386097.png'

const IMAGE_COXUONGKHOP = 'https://bit.ly/nobithaoCoXuongKhop'
const IMAGE_THANKINH = 'https://cdn.bookingcare.vn/fo/w384/2023/12/26/101739-than-kinh.png'
const IMAGE_TIEUHOA = 'https://cdn.bookingcare.vn/fo/w384/2023/12/26/101713-tieu-hoa.png'
const IMAGE_DALIEU = 'https://cdn.bookingcare.vn/fo/w1920/2023/12/26/101638-da-lieu.png'
const IMAGE_MAT = 'https://cdn.bookingcare.vn/fo/w384/2023/12/26/101638-mat.png'
const IMAGE_TIMMACH = 'https://cdn.bookingcare.vn/fo/w384/2023/12/26/101713-tim-mach.png'
const IMAGE_TAIMUIHONG = 'https://cdn.bookingcare.vn/fo/w384/2023/12/26/101713-tai-mui-hong.png'
const IMAGE_SUCKHOATAMTHAN = 'https://cdn.bookingcare.vn/fo/w384/2023/12/26/101713-suc-khoe-tam-than.png'
const IMAGE_THANTIETNIEU = 'https://cdn.bookingcare.vn/fo/w384/2023/12/26/101739-than-tiet-nieu.png'

let writeDataToGoogleSheet = async (data) => {
    if (data.length === 0) {
        logger.info("No data to write to the sheet.");
        return;
    }

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID);

    try {
        let currentDate = new Date();
        const format = "HH:mm DD/MM/YYYY";
        let formatedDate = moment(currentDate).tz("Asia/Ho_Chi_Minh").format(format);

        // let formatedDate = moment(currentVnDate).format(format);

        // Initialize auth
        await doc.useServiceAccountAuth({
            client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        });

        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];

        await sheet.addRow({
            "Tên Facebook": data.username,
            "Địa chỉ Email": data.email,
            "Số điện thoại": data.phoneNumber,
            "Địa chỉ": data.address,
            "Năm sinh": data.birthYear,
            "Giới tính": data.gender,
            "Lý do đặt lịch": data.reason,
            "Thời gian": formatedDate,
            "Tên khách hàng": data.customerName
        });

        console.log('Dữ liệu đã được ghi thành công vào Google Sheets.');
    } catch (error) {
        console.error('Lỗi khi ghi dữ liệu vào Google Sheets:', error);
    }
};

let getHomepage = (req, res) => {
    return res.render("homepage.ejs");
};

let handleBooking = (req, res) => {
    let senderId = req.params.senderId;
    return res.render("booking.ejs", {
        senderId: senderId
    });
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

const sendTextMessage = async (senderId, text) => {
    const messageData = { text: text };
    await request({
        uri: `https://graph.facebook.com/v9.0/me/messages`,
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: senderId },
            message: messageData
        }
    });
};

let handleMessage = async (sender_psid, received_message, senderID) => {
    let response;

    const bookingKeywords = ["đặt lịch", "cách đặt lịch", "đặt lịch khám", "tôi muốn đặt lịch", "tư vấn", "khám bệnh", "khám", "thanh toán"];
    const legPainKeywords = ["đau chân", "đau lưng", "đau tay", "xương", "khớp", "đau cơ", "chân", "lưng", "tay", "cơ", "gout", "gối", "vai", "khủy"];
    const nervePainKeywords = ["não", "đầu", "thần kinh", "chóng mặt", "tiền đình", "tăng động", "kinh", "tê bì nửa mặt", "Pakison", "ý thức"];
    const digestiveKeywords = ["trúng thực", "ăn", "uống", "tiêu hóa", "khó tiêu", "trĩ", "táo bón", "tiêu cháy", "thực quản", "nội soi", "dạ dày", "đại tràng", "nôn", "ói", "bụng", "ợ chua", "đầy hơi", "thực quản", "ruột", "tá tràng", "u nang tuyến tụy", "gan", "mật"];
    const dermatologyKeywords = ["ngứa", "mụn", "mẩn ngứa", "vảy nến", "chàm", "da", "Da", "tàn nhang", "Nấm", "nấm", "rụng tóc", "dị ứng", "viêm nang da", "hói đầu",];
    const eyeKeywords = ["nhìn thấy", "nhìn", "mắt", "cận thị", "viễn thị", "loạn thị", "nhược thị", "lão thị", "đục thủy tinh thể", "tuyến lệ", "nhãn áp", "giác mạc", "võng mạc"];
    const cardiologyKeywords = ["đau ngực", "tim", "huyết áp", "khó thở", "choáng váng"];
    const entKeywords = ["tai", "mũi", "họng", "amidan", "viêm xoang", "ho", "màng nhỉ", "điếc", "nghe", "ngửi", "bị chảy máu cam", "họng", "khó nuốt", "ngủ ngáy"];
    const mentalHealthKeywords = ["stress", "trầm cảm", "lo âu", "tinh thần", "khó ngủ", "cảm giác", "buồn bã", "cô đơn", "ngủ", "căng thẳng", "tâm thần phân liệt", "hoang tưởng", "cảm xúc", "tâm trí", "lưỡng cực", "nhân cách", "ảo giác", "nói cười một mình", "bi quan", "bồn chồn", "hoảng hốt", "buồn rầu", "tập trung", "tâm lý", "tư duy", "lo lắng", "sợ hãi", "sợ", "xa lánh", "kì lạ"];
    const urologyKeywords = ["thận", "tiểu", "đái", "viêm bàng quang", "tiền liệt tuyến", "bàng quang"];

    const doctorsList = {
        "bác sĩ Quyết": {
            url: "https://nobithao-fe-bookingcare.vercel.app/detail-doctor/20",
            image: IMAGE_MALE_DOCTOR,
            title: "Thông tin về bác sĩ Hà Văn Quyết"
        },
        "bác sĩ Thư": {
            url: "https://nobithao-fe-bookingcare.vercel.app/detail-doctor/21",
            image: IMAGE_FEMALE_DOCTOR,
            title: "Thông tin về bác sĩ Nguyễn Anh Thư"
        },
        "bác sĩ Chiến": {
            url: "https://nobithao-fe-bookingcare.vercel.app/detail-doctor/22",
            image: IMAGE_MALE_DOCTOR,
            title: "Thông tin về bác sĩ Bùi Minh Chiến"
        },
        "bác sĩ Hà": {
            url: "https://nobithao-fe-bookingcare.vercel.app/detail-doctor/23",
            image: IMAGE_FEMALE_DOCTOR,
            title: "Thông tin về bác sĩ Chu Minh Hà"
        }
    };

    if (received_message.text) {
        let messageText = received_message.text.toLowerCase();

        let doctorFound = false;
        for (let doctor in doctorsList) {
            if (messageText.includes(doctor.toLowerCase())) {
                let doctorInfo = doctorsList[doctor];
                await sendTextMessage(sender_psid, "Bạn đang tìm thông tin về bác sĩ. Đây là các thông tin chi tiết");

                response = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": [{
                                "title": doctorInfo.title,
                                "image_url": doctorInfo.image,
                                "subtitle": "Nhấn vào nút để xem chi tiết.",
                                "buttons": [
                                    {
                                        "type": "web_url",
                                        "url": doctorInfo.url,
                                        "title": "Xem chi tiết"
                                    }
                                ]
                            }]
                        }
                    }
                };
                doctorFound = true;
                break;
            }
        }

        if (!doctorFound) {
            if (bookingKeywords.some(keyword => messageText.includes(keyword))) {
                await sendTextMessage(sender_psid, "Bạn đang cần đặt lịch khám bệnh, đây là trang đặt lịch khám bệnh chính thức của hệ thống");

                response = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": [{
                                "title": "Đặt lịch khám bệnh",
                                "image_url": IMAGE_GET_STARTED,
                                "subtitle": "Đặt lịch khám bệnh tại Booking Care",
                                "buttons": [
                                    {
                                        "type": "web_url",
                                        "url": "https://nobithao-fe-bookingcare.vercel.app/home",
                                        "title": "Xem chi tiết"
                                    },
                                    {
                                        "type": "web_url",
                                        "url": `${process.env.URL_WEB_VIEW_BOOKING}/${senderID}`,
                                        "webview_height_ratio": "tall",
                                        "title": "Đặt lịch ngay",
                                        "messenger_extensions": true //false: open the webview in new tab
                                    }
                                ]
                            }]
                        }
                    }
                };
            } else if (messageText.includes("bác sĩ")) {
                await sendTextMessage(sender_psid, "Bạn đang tìm kiếm thông tin về bác sĩ, đây là danh sách các bác sĩ của hệ thống");

                response = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": [{
                                "title": "Danh sách tất cả các bác sĩ",
                                "image_url": IMAGE_ALL_DOCTOR,
                                "subtitle": "Thông tin các bác sĩ làm việc tại Booking Care.",
                                "buttons": [
                                    {
                                        "type": "web_url",
                                        "url": "https://nobithao-fe-bookingcare.vercel.app/all-doctors",
                                        "title": "Xem chi tiết"
                                    }
                                ]
                            }]
                        }
                    }
                };
            }
            else if (legPainKeywords.some(keyword => messageText.includes(keyword))) {
                await sendTextMessage(sender_psid, "Bạn có vẻ đang gặp vấn đề về cơ xương khớp, tham khảo thêm thông tin về khoa Cơ Xương Khớp");

                response = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": [{
                                "title": "Khoa Cơ Xương Khớp",
                                "image_url": IMAGE_COXUONGKHOP,
                                "subtitle": "Tìm hiểu thêm về khoa Cơ Xương Khớp.",
                                "buttons": [
                                    {
                                        "type": "web_url",
                                        "url": "https://nobithao-fe-bookingcare.vercel.app/detail-specialty/1",
                                        "title": "Tìm hiểu thêm"
                                    }
                                ]
                            }]
                        }
                    }
                };
            }
            else if (nervePainKeywords.some(keyword => messageText.includes(keyword))) {
                await sendTextMessage(sender_psid, "Bạn có vẻ đang gặp vấn đề về thần kinh, tham khảo thêm thông tin về khoa Thần kinh");

                response = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": [{
                                "title": "Khoa Thần kinh",
                                "image_url": IMAGE_THANKINH,
                                "subtitle": "Tìm hiểu thêm về khoa Thần kinh.",
                                "buttons": [
                                    {
                                        "type": "web_url",
                                        "url": "https://nobithao-fe-bookingcare.vercel.app/detail-specialty/2",
                                        "title": "Tìm hiểu thêm"
                                    }
                                ]
                            }]
                        }
                    }
                };
            }
            else if (digestiveKeywords.some(keyword => messageText.includes(keyword))) {
                await sendTextMessage(sender_psid, "Bạn có vẻ đang gặp vấn đề về tiêu hóa, tham khảo thêm thông tin về khoa Tiêu hóa");

                response = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": [{
                                "title": "Khoa Tiêu hóa",
                                "image_url": IMAGE_TIEUHOA,
                                "subtitle": "Tìm hiểu thêm về khoa Tiêu hóa.",
                                "buttons": [
                                    {
                                        "type": "web_url",
                                        "url": "https://nobithao-fe-bookingcare.vercel.app/detail-specialty/3",
                                        "title": "Tìm hiểu thêm"
                                    }
                                ]
                            }]
                        }
                    }
                };
            }
            else if (dermatologyKeywords.some(keyword => messageText.includes(keyword))) {
                await sendTextMessage(sender_psid, "Bạn có vẻ đang gặp vấn đề về da liễu, tham khảo thêm thông tin về khoa Da liễu");

                response = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": [{
                                "title": "Khoa Da liễu",
                                "image_url": IMAGE_DALIEU,
                                "subtitle": "Tìm hiểu thêm về khoa Da liễu.",
                                "buttons": [
                                    {
                                        "type": "web_url",
                                        "url": "https://nobithao-fe-bookingcare.vercel.app/detail-specialty/4",
                                        "title": "Tìm hiểu thêm"
                                    }
                                ]
                            }]
                        }
                    }
                };
            }
            else if (eyeKeywords.some(keyword => messageText.includes(keyword))) {
                await sendTextMessage(sender_psid, "Bạn có vẻ đang gặp vấn đề về mắt, tham khảo thêm thông tin về Chuyên Khoa Mắt");

                response = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": [{
                                "title": "Chuyên Khoa Mắt",
                                "image_url": IMAGE_MAT,
                                "subtitle": "Tìm hiểu thêm về Chuyên Khoa Mắt.",
                                "buttons": [
                                    {
                                        "type": "web_url",
                                        "url": "https://nobithao-fe-bookingcare.vercel.app/detail-specialty/5",
                                        "title": "Tìm hiểu thêm"
                                    }
                                ]
                            }]
                        }
                    }
                };
            }
            else if (cardiologyKeywords.some(keyword => messageText.includes(keyword))) {
                await sendTextMessage(sender_psid, "Bạn có vẻ đang gặp vấn đề về tim mạch, tham khảo thêm thông tin về khoa Tim mạch");

                response = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": [{
                                "title": "Khoa Tim mạch",
                                "image_url": IMAGE_TIMMACH,
                                "subtitle": "Tìm hiểu thêm về khoa Tim mạch.",
                                "buttons": [
                                    {
                                        "type": "web_url",
                                        "url": "https://nobithao-fe-bookingcare.vercel.app/detail-specialty/6",
                                        "title": "Tìm hiểu thêm"
                                    }
                                ]
                            }]
                        }
                    }
                };
            }
            else if (entKeywords.some(keyword => messageText.includes(keyword))) {
                await sendTextMessage(sender_psid, "Bạn có vẻ đang gặp vấn đề về tai mũi họng, tham khảo thêm thông tin về khoa Tai Mũi Họng");

                response = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": [{
                                "title": "Khoa Tai Mũi Họng",
                                "image_url": IMAGE_TAIMUIHONG,
                                "subtitle": "Tìm hiểu thêm về khoa Tai Mũi Họng.",
                                "buttons": [
                                    {
                                        "type": "web_url",
                                        "url": "https://nobithao-fe-bookingcare.vercel.app/detail-specialty/7",
                                        "title": "Tìm hiểu thêm"
                                    }
                                ]
                            }]
                        }
                    }
                };
            }
            else if (mentalHealthKeywords.some(keyword => messageText.includes(keyword))) {
                await sendTextMessage(sender_psid, "Bạn có vẻ đang gặp vấn đề về sức khỏe tâm thần, tham khảo thêm thông tin về khoa Sức khỏe tâm thần");

                response = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": [{
                                "title": "Khoa Sức khỏe tâm thần",
                                "image_url": IMAGE_SUCKHOATAMTHAN,
                                "subtitle": "Tìm hiểu thêm về khoa Sức khỏe tâm thần.",
                                "buttons": [
                                    {
                                        "type": "web_url",
                                        "url": "https://nobithao-fe-bookingcare.vercel.app/detail-specialty/8",
                                        "title": "Tìm hiểu thêm"
                                    }
                                ]
                            }]
                        }
                    }
                };
            }
            else if (urologyKeywords.some(keyword => messageText.includes(keyword))) {
                await sendTextMessage(sender_psid, "Bạn có vẻ đang gặp vấn đề về Thận - Tiết niệu, tham khảo thêm thông tin về khoa Thận - Tiết niệu");

                response = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": [{
                                "title": "Khoa Thận - Tiết niệu",
                                "image_url": IMAGE_THANTIETNIEU,
                                "subtitle": "Tìm hiểu thêm về khoa Thận - Tiết niệu.",
                                "buttons": [
                                    {
                                        "type": "web_url",
                                        "url": "https://nobithao-fe-bookingcare.vercel.app/detail-specialty/9",
                                        "title": "Tìm hiểu thêm"
                                    }
                                ]
                            }]
                        }
                    }
                };
            }
            else {
                response = { "text": "Xin lỗi, tôi không hiểu yêu cầu của bạn. Bạn có thể cung cấp thông tin cụ thể hơn không" };
            }
        }
    }
    else if (received_message.attachments) {
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

async function handlePostback(sender_psid, received_postback) {
    let response;
    let payload = received_postback.payload;

    switch (payload) {
        case 'yes':
            response = { "text": "Cảm ơn bạn đã cung cấp thông tin. Hệ thống sẽ sớm xem và phản hồi bạn sau. Vui lòng chờ!" }
            break;
        case 'no':
            response = { "text": "Xin hãy thử gửi một hình ảnh khác." }
            break;
        case 'RESTART_CONVERSATION':
        case 'GET_STARTED':
            await chatBotService.handleGetStarted(sender_psid);
            break;
        case 'SPECIALTY':
            await chatBotService.handleSendSpecialty(sender_psid);
            break;
        case 'BOOK':
            await chatBotService.handleSendBook(sender_psid);
            break;
        case 'FACILITIES':
            await chatBotService.handleSendFacility(sender_psid);
            break;

        default:
            response = { "text": `Tôi không biết phản hồi với ${payload}` }
    }
    // if (payload === 'yes') {
    //     response = { "text": "Cảm ơn bạn đã cung cấp thông tin. Hệ thống sẽ sớm xem và phản hồi bạn sau. Vui lòng chờ!" };
    // } else if (payload === 'no') {
    //     response = { "text": "Xin hãy thử gửi một hình ảnh khác." };
    // } else if (payload === "GET_STARTED") {
    //     response = { "text": "Xin chào, đây là trang chính thức của BookingCare with Nobi. Tôi có thể giúp gì cho bạn?" };
    // }

    callSendAPI(sender_psid, response);
};

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

let setupPersistentMenu = async (req, res) => {
    let request_body = {
        "persistent_menu": [
            {
                "locale": "default",
                "composer_input_disabled": false,
                "call_to_actions": [
                    {
                        "type": "web_url",
                        "title": "Đặt lịch khám bệnh",
                        "url": "https://nobithao-fe-bookingcare.vercel.app/home",
                        "webview_height_ratio": "full"
                    },
                    {
                        "type": "web_url",
                        "title": "Xem trang Facebook Booking Care",
                        "url": "https://facebook.com/bookingcarewithnobi",
                        "webview_height_ratio": "full"
                    },
                    {
                        "type": "postback",
                        "title": "Bắt đầu lại cuộc trò chuyện này",
                        "payload": "RESTART_CONVERSATION"
                    }
                ]
            }
        ]
    }

    try {
        const response = await request({
            "uri": `https://graph.facebook.com/v9.0/me/messenger_profile`,
            "qs": { "access_token": PAGE_ACCESS_TOKEN },
            "method": "POST",
            "json": request_body
        });

        console.log('Setup persistent succeeds!');
        return res.send('Setup persistent succeeds!');
    } catch (err) {
        console.error("Unable to setup user profile: " + err);
        return res.status(500).send("Unable to setup user profile");
    }
};

let handlePostBooking = async (req, res) => {
    try {
        let username = await chatBotService.getFacebookUsername(req.body.psid);
        let data = {
            username: username,
            email: req.body.email,
            phoneNumber: `'${req.body.phoneNumber}`,
            birthYear: req.body.birthYear,
            address: req.body.address,
            gender: req.body.gender,
            reason: req.body.reason,
            customerName: req.body.customerName
        }
        await writeDataToGoogleSheet(data);
        let customerName = "";
        if (req.body.customerName === "") {
            customerName = username;
        } else customerName = req.body.customerName;

        let response1 = {
            "text": `---Thông tin người dùng đặt lịch---
            \nHọ và tên: ${customerName}
            \nĐịa chỉ Email: ${req.body.email}
            \nSố điện thoại: ${req.body.phoneNumber}
            \nĐịa chỉ: ${req.body.address}
            \nNăm sinh: ${req.body.birthYear}
            \nGiới tính: ${req.body.gender}
            \nLý do đặt lịch: ${req.body.reason}
            `
        };

        let response2 = { "text": `Cảm ơn bạn đã đặt lịch khám bệnh tại hệ thống BookingCare. Hệ thống sẽ sớm gọi điện cho bạn để xác nhận thời gian cho lịch hẹn. Vui lòng chờ điện thoại!` };

        await chatBotService.callSendAPI(req.body.psid, response1);

        await chatBotService.callSendAPI(req.body.psid, response2);

        return res.status(200).json({
            message: "ok"
        });
    } catch (e) {
        console.log("Lỗi post booking: ", e)
        return res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    getHomepage,
    getWebhook,
    postWebhook,
    setupProfile,
    setupPersistentMenu,
    handleBooking,
    handlePostBooking
};
