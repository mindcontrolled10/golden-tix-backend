const cinemaController = require("../controller/cinemas");
const isLogin = require("../middleware/isLogin");
const cinemaRouter = require("express").Router();

cinemaRouter.get("/schedule", isLogin(), cinemaController.getCinemaSchedule);
cinemaRouter.get(
  "/list/:locationId",
  isLogin(),
  cinemaController.getCinemasByLocation
);
module.exports = cinemaRouter;
