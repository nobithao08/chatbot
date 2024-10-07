import express from "express";
import homeController from "../contronllers/HomeController";

let router = express.Router();
let initWebRoutes = (app) => {
    router.get("/", homeController.getHomePage);
    router.get("/webhook", homeController.getWebhook);
    router.post("/webhook", homeController.postWebhook);

    return app.use('/', router);
}

module.exports = initWebRoutes;