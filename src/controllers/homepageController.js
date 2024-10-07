import homepageService from "../services/homepageService";
require("dotenv").config();

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// Hàm lấy trang chủ
let getHomepage = (req, res) => {
    let fbPageId = process.env.PAGE_ID;
    return res.render("homepage.ejs", {
        fbPageId
    });
};

// Hàm lấy thông tin người dùng Facebook
let getFacebookUserProfile = (req, res) => {
    return res.render("profile.ejs");
};

// Hàm thiết lập thông tin người dùng Facebook
let setUpUserFacebookProfile = async (req, res) => {
    try {
        await homepageService.setUpMessengerPlatform(PAGE_ACCESS_TOKEN);
        return res.status(200).json({
            message: "OK"
        });
    } catch (e) {
        return res.status(500).json({
            message: "Lỗi từ máy chủ node"
        });
    }
};

module.exports = {
    getHomepage,
    getFacebookUserProfile,
    setUpUserFacebookProfile
};
