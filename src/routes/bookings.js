const bookingController = require("../controller/booking");
const isLogin = require("../middleware/isLogin");

const bookingRouter = require("express").Router();

bookingRouter.post("/new", isLogin(), bookingController.createBooking);
module.exports = bookingRouter;
