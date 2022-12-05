const bookingController = require("../controller/booking");
const isLogin = require("../middleware/isLogin");

const bookingRouter = require("express").Router();

bookingRouter.post("/new", isLogin(), bookingController.createBooking);
bookingRouter.get("/ticket/detail/:id", bookingController.getTicketDetail);
bookingRouter.post("/payment", bookingController.updateBooking);
bookingRouter.get("/seats/booked/:id", bookingController.getBookedSeats);
bookingRouter.get("/seats", bookingController.getSeats);
module.exports = bookingRouter;
