const db = require("../config/postgre");
const getTimeStamp = require("../helper/getTimeStamp");

const createBooking = (body, userId, paymentId) =>
  new Promise((resolve, reject) => {
    const { movieScheduleId, totalPayment, paymentMethodId } = body;
    const totalSeat = JSON.parse(body.seatIds).length;
    const values = [
      movieScheduleId,
      userId,
      totalPayment,
      paymentMethodId,
      paymentId,
      getTimeStamp(),
      totalSeat,
    ];
    const query =
      "INSERT INTO bookings (movie_schedule_id, user_id, total_payment, payment_method_id, payment_id, created_at, ticket_total) VALUES ($1, $2, $3, $4, $5, to_timestamp($6), $7) returning *";
    db.query(query, values, (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      return resolve({ status: 201, msg: "Success", data: result.rows[0] });
    });
  });

const createBookingSeat = (seats, bookingId) =>
  new Promise((resolve, reject) => {
    const seatList = JSON.parse(seats);
    const prepareValues = [];
    let values = "VALUES";
    seatList.forEach((seatId, index, array) => {
      if (index !== array.length - 1) {
        values += `($${1 + index * 3}, $${2 + index * 3}, to_timestamp($${
          3 + index * 3
        })), `;
      } else {
        values += `($${1 + index * 3}, $${2 + index * 3}, to_timestamp($${
          3 + index * 3
        }))`;
      }
      prepareValues.push(bookingId, seatId, getTimeStamp());
    });
    const query = `INSERT INTO booking_seats(booking_id, seat_id, created_at) ${values} returning *`;
    console.log(query);
    db.query(query, prepareValues, (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      return resolve({
        status: 201,
        msg: "Booking Success",
        data: result.rows,
      });
    });
  });
const getSeats = () =>
  new Promise((resolve, reject) => {
    const query = "select id, seat_code from seats";
    db.query(query, (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      const seatList = result.rows.map(
        (e) => (e = { seat_id: e.id, seat_code: e.seat_code })
      );
      return resolve({ status: 200, msg: "seat list", data: seatList });
    });
  });

const getBookedSeats = (req) =>
  new Promise((resolve, reject) => {
    const id = req.params.id;
    const query =
      "select s.id as seat_id, s.seat_code  from booking_seats bs join bookings b on b.id = bs.booking_id join showtimes_schedules ss on ss.id = b.movie_schedule_id join seats s on s.id = bs.seat_id where  ss.id = $1";
    db.query(query, [id], (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      return resolve({ status: 200, msg: "seat list", data: result.rows });
    });
  });

const updatePayment = (paymentStatus, ticketStatus, paymentId) =>
  new Promise((resolve, reject) => {
    const values = [paymentStatus, ticketStatus, paymentId];
    const sqlUpdate =
      "update bookings set payment_status = $1, ticket_status = $2 where payment_id = $3 returning *";
    db.query(sqlUpdate, values, (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      return resolve({
        status: 200,
        msg: "Payment success",
        data: result.rows[0],
      });
    });
  });
const getTicketDetail = (req) =>
  new Promise((resolve, reject) => {
    const paymentId = req.params.id;
    const query = `select m.movie_name, string_agg(distinct(s.seat_code), ',') as seats,
    s2.schedule as time, b.ticket_total, mcl.show_date as show_date,
    b.total_payment as price, m.age_category as category
    from bookings b
    join showtimes_schedules ss on ss.id = b.movie_schedule_id
    join movies_cinemas_locations mcl on ss.showtime_id = mcl.id
    join movies m on mcl.movie_id = m.id
    join booking_seats bs on bs.booking_id = b.id
    join seats s on s.id = bs.seat_id
    join schedules s2 on s2.id = ss.schedule_id
    where b.payment_id = $1
    group by m.movie_name, s2.schedule, b.ticket_total,
    mcl.show_date, b.total_payment, m.age_category`;

    db.query(query, [paymentId], (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      const seats = result.rows[0].seats.split(",");
      return resolve({
        status: 200,
        msg: "Your ticket details",
        data: { ...result.rows[0], seats: seats },
      });
    });
  });
const bookingRepo = {
  createBooking,
  createBookingSeat,
  getSeats,
  getBookedSeats,
  updatePayment,
  getTicketDetail,
};

module.exports = bookingRepo;
