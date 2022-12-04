const scheduleController = require("../controller/schedules");
const allowedRoles = require("../middleware/allowedRoles");
const isLogin = require("../middleware/isLogin");

const scheduleRouter = require("express").Router();

scheduleRouter.get(
  "/",
  isLogin(),
  allowedRoles("admin"),
  scheduleController.getSchedule
);

module.exports = scheduleRouter;
