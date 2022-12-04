const midtransClient = require("midtrans-client");

const coreApi = new midtransClient.CoreApi({
  isProduction: false,
  clientKey: process.env.CLIENT_KEY_MIDTRANS,
  serverKey: process.env.SERVER_KEY_MIDTRANS,
});

const paymentMidtrans = async (total_payment, bank, payment_id) => {};
