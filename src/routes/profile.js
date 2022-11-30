const profileRouter = require("express").Router();
const profileController = require("../controller/profile");
const validate = require("../middleware/validate");
const isLogin = require("../middleware/isLogin");

module.exports = profileRouter;
