const profileRouter = require("express").Router();
// const userController = require("../controller/user");
const validate = require("../middleware/validate");
const isLogin = require("../middleware/isLogin");
const uploadFile = require("../middleware/uploadSingle");
const uploadCloudinary = require("../middleware/cloudinary");

const { getProfile, editProfile } = require("../controller/user");

profileRouter.get("/profile", isLogin(), getProfile);

profileRouter.patch(
  "/profile/edit",
  isLogin(),
  uploadFile,
  uploadCloudinary,
  editProfile
);

module.exports = profileRouter;
