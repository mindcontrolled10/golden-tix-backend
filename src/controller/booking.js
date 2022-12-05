const resHelper = require("../helper/sendResponse");
const bookingRepo = require("../model/bookings");
const snap = require("../helper/midTrans");

// const paymentMidtrans = async (total_payment, bank, payment_id) => {
//   const parameter = {
//     payment_type: "bank_transfer",
//     transaction_details: {
//       gross_amount: parseInt(total_payment),
//       order_id: payment_id,
//     },
//     bank_transfer: {
//       bank: bank,
//     },
//   };
// };
const createBooking = async (req, res) => {
  try {
    const id = req.userData.id;
    const body = req.body;
    const paymentId = `Golden-tix-${Math.floor(
      100000 + Math.random() * 900000
    )}`;

    const booking = await bookingRepo.createBooking(body, id, paymentId);
    let data = { booking_details: booking.data };
    console.log(booking.data.id);
    const bookingSeat = await bookingRepo.createBookingSeat(
      req.body.seatIds,
      booking.data.id
    );
    data = { ...data, ordered_seat: bookingSeat.data };

    let parameter = {
      transaction_details: {
        order_id: paymentId,
        gross_amount: body.totalPayment,
      },
      credit_card: {
        secure: true,
      },
    };
    const redirectUrl = await snap
      .createTransaction(parameter)
      .then((transaction) => transaction.redirect_url);
    data = { ...data, redirectUrl };
    resHelper.success(res, 201, { status: 201, msg: "Success", data: data });
  } catch (error) {
    console.log(error);
    resHelper.error(res, error.status, error);
  }
};

const updateBooking = async (req, res) => {
  const { order_id, transaction_status } = req.body;
  try {
    const status = transaction_status;
    const status_ticket = "Active";
    const payment_id = order_id;
    const response = await bookingRepo.updatePayment(
      status,
      status_ticket,
      payment_id
    );
    resHelper.success(res, response.status, response);
  } catch (error) {
    console.log(error);
    resHelper.error(res, error.status, error);
  }
};

const getSeats = async (req, res) => {
  try {
    const response = await bookingRepo.getSeats();
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};

const getBookedSeats = async (req, res) => {
  try {
    const response = await bookingRepo.getBookedSeats(req);
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};
const bookingController = {
  createBooking,
  getBookedSeats,
  updateBooking,
  getSeats,
};
module.exports = bookingController;
