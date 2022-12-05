const midtransClient = require("midtrans-client");
const resHelper = require("../helper/sendResponse");
const bookingRepo = require("../model/bookings");

const coreApi = new midtransClient.CoreApi({
  isProduction: false,
  clientKey: process.env.CLIENT_KEY_MIDTRANS,
  serverKey: process.env.SERVER_KEY_MIDTRANS,
});

const paymentMidtrans = async (total_payment, bank, payment_id) => {
  const parameter = {
    payment_type: "bank_transfer",
    transaction_details: {
      gross_amount: parseInt(total_payment),
      order_id: payment_id,
    },
    bank_transfer: {
      bank: bank,
    },
  };
};

const createBooking = async (req, res) => {
  try {
    const id = req.userData.id;
    const body = req.body;
    const paymentId = `Golden-tix-${Math.floor(
      100000 + Math.random() * 900000
    )}`;
    const booking = await bookingRepo.createBooking(body, id, paymentId);
    console.log(booking.data.id);
    const bookingSeat = await bookingRepo.createBookingSeat(
      req.body.seatIds,
      booking.data.id
    );
    resHelper.success(res, bookingSeat.status, bookingSeat);
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
const bookingController = { createBooking, getBookedSeats, getSeats };
module.exports = bookingController;
