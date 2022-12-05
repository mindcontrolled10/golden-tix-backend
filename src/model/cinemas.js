const db = require("../config/postgre");

const getCinemaSchedule = (req) =>
  new Promise((resolve, reject) => {
    const { date, movie, location } = req.query;
    if (!date || !movie || !location)
      return reject({
        status: 400,
        msg: "Please Input date, location and movie name on request query ",
      });
    const query = `select ss.id as showtime_id, s.schedule, cl.price, c.cinema_name, c.image as cinema_img,
    mcl.show_date, l.location_name 
    from movies m 
    join movies_cinemas_locations mcl on mcl.movie_id = m.id
    join showtimes_schedules ss on ss.showtime_id = mcl.id
    join schedules s on s.id = ss.schedule_id
    join cinemas_locations cl on cl.id = mcl.cinemas_locations_id
    join cinemas c on c.id = cl.cinema_id
    join locations l on l.id = cl.location_id
    where m.movie_name = $1 and mcl.show_date = $2
    and l.location_name = $3
    order by c.cinema_name`;

    db.query(query, [movie, date, location], (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      if (result.rows.length === 0)
        return reject({ status: 404, msg: "Data Not Found" });

      const showtime = [];
      result.rows.forEach((data) => {
        let showTimeData = showtime.find((datas) =>
          datas.hasOwnProperty(data.cinema_name)
        );

        if (!showTimeData) {
          showtime.push({
            [data.cinema_name]: [
              {
                showtime_id: data.showtime_id,
                schedule: data.schedule,
              },
            ],
            price: data.price,
            image: data.cinema_img,
          });
        }

        if (showTimeData) {
          showtime.find((datas) => {
            if (
              datas.hasOwnProperty(data.cinema_name) &&
              !datas[data.cinema_name].includes(data.schedule)
            ) {
              datas[data.cinema_name].push({
                showtime_id: data.showtime_id,
                schedule: data.schedule,
              });
            }
          });
        }
      });
      return resolve({ status: 200, msg: "List scheule", data: showtime });
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
