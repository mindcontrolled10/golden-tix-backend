const authRouter = require("express").Router();
const authController = require("../controller/auth");
const validate = require("../middleware/validate");
const isLogin = require("../middleware/isLogin");

authRouter.post("/register", authController.register);
authRouter.post(
  "/login",
  validate.body("email", "password"),
  authController.login
);

authRouter.delete("/logout", isLogin(), authController.logout);
authRouter.patch("/reset-password", authController.resetPassword);
authRouter.get("/verify/:otp", authController.verify);
module.exports = authRouter;
