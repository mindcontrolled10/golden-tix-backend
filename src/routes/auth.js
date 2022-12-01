const authRouter = require("express").Router();
const authController = require("../controller/auth");
const validate = require("../middleware/validate");
const isLogin = require("../middleware/isLogin");

authRouter.post(
  "/register",
  validate.body("email", "password", "firstName", "lastName"),
  authController.register
);

authRouter.post(
  "/login",
  validate.body("email", "password"),
  authController.login
);

authRouter.get("/verify/:otp", authController.verify);

authRouter.patch(
  "/forgot-password",
  validate.body("email", "linkDirect"),
  authController.forgotPassword
);

authRouter.patch(
  "/reset-password",
  validate.body("otp", "newPassword", "confirmPassword"),
  authController.resetPassword
);

authRouter.delete("/logout", isLogin(), authController.logout);

module.exports = authRouter;
