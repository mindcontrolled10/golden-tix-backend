const authRouter = require("express").Router();
const authController = require("../controller/auth");
const validate = require("../middleware/validate");

authRouter.post("/register", authController.register);
authRouter.post(
  "/login",
  validate.body("email", "password"),
  authController.login
);

module.exports = authRouter;
