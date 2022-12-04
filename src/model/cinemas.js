const db = require("../config/postgre");

const getCinemaSchedule = (req) =>
  new Promise((resolve, reject) => {
    const { date, movie, location } = req.query;
    if (!date || !movie || !location)
      return reject({
        status: 400,
        msg: "Please Input date, location and movie name on request query ",
      });
    const query =
      "select m.movie_name,  ss.id as showtime_id, cl.id as cinemas_locations_id, mcl.id _cinema_loc_id,c.cinema_name, l.location_name,cl.price, s.schedule, mcl.show_date from movies_cinemas_locations mcl left join movies m on mcl.movie_id = m.id left join showtimes_schedules ss on mcl.id = ss.showtime_id left join schedules s on s.id = ss.schedule_id left join cinemas_locations cl on cl.id  = mcl.cinemas_locations_id left join locations l on l.id = cl.location_id left join cinemas c on c.id = cl.cinema_id where m.movie_name = $1 and mcl.show_date = $2 and l.location_name = $3 group by m.movie_name, mcl.show_date, ss.id, c.cinema_name, cl.price, s.schedule, cl.id, mcl.id, mcl.show_date, l.location_name";
    db.query(query, [movie, date, location], (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      if (result.rows.length === 0)
        return reject({ status: 404, msg: "Data Not Found" });
      return resolve({ status: 200, msg: "List scheule", data: result.rows });
    });
  });

const getCinemasByLocation = (req) =>
  new Promise((resolve, reject) => {
    const { locationId } = req.params;
    const query =
      "select cl.id as cinemas_locations_id, c.cinema_name, c.image, cl.price from cinemas_locations cl join locations l on l.id = cl.location_id join cinemas c on c.id = cl.cinema_id where l.id = $1";
    db.query(query, [locationId], (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      if (result.rows.length === 0)
        return reject({ status: 404, msg: "Data Not Found" });
      return resolve({ status: 200, msg: "List Cinemas", data: result.rows });
    });
  });

const getLocations = () =>
  new Promise((resolve, reject) => {
    const query = "select id as location_id, location from locations";
  });
const cinemaRepo = { getCinemaSchedule, getCinemasByLocation };
module.exports = cinemaRepo;
