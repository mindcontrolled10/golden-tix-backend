const db = require("../config/postgre");
const getTimeStamp = require("../helper/getTimeStamp");
const { getMonthNumber } = require("../helper/getMonth");
const createMovie = (req) => {
  return new Promise((resolve, reject) => {
    const { movieName, synopsis, releaseDate, duration, director, price } =
      req.body;
    const image = req.file;
    const movieValues = [
      movieName,
      synopsis,
      releaseDate,
      duration,
      director,
      image,
      getTimeStamp(),
    ];
    const sqlMovie =
      "INSERT INTO movies (movie_name, synopsis, release_date, duration, director, image, created_at) VALUES ($1, $2, $3, $4, $5, $6, to_timestamp($7)) returning *";

    db.query(sqlMovie, movieValues, (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      return resolve(result.rows[0]);
    });
  });
};

const createMovieGenre = (genres, movieId) =>
  new Promise((resolve, reject) => {
    const genreList = JSON.parse(genres);
    const genreValues = [];
    let values = "VALUES";
    genreList.forEach((genreId, index, array) => {
      if (index !== array.length - 1) {
        values += `($${1 + index * 3}, $${2 + index * 3}, to_timestamp($${
          3 + index * 3
        })), `;
      } else {
        values += `($${1 + index * 3}, $${2 + index * 3}, to_timestamp($${
          3 + index * 3
        }))`;
      }
      genreValues.push(movieId, genreId, getTimeStamp());
    });
    const sqlCreateMovieGenre = `INSERT INTO movies_genres (movie_id, genre_id, created_at) ${values} returning *`;
    console.log(sqlCreateMovieGenre);
    db.query(sqlCreateMovieGenre, genreValues, (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      console.log("Success genres");
      return resolve(result.rows);
    });
  });

const createMovieShowTime = (cinemasLocations, movieId, showDate) =>
  new Promise((resolve, reject) => {
    const cinemaLocationsList = JSON.parse(cinemasLocations);
    const prepareValues = [];
    let values = "VALUES";
    cinemaLocationsList.forEach((id, index, array) => {
      if (index !== array.length - 1) {
        values += `($${1 + index * 4}, $${2 + index * 4}, $${
          3 + index * 4
        }, to_timestamp($${4 + index * 4})), `;
      } else {
        values += `($${1 + index * 4}, $${2 + index * 4}, $${
          3 + index * 4
        }, to_timestamp($${4 + index * 4}))`;
      }
      prepareValues.push(id, movieId, showDate, getTimeStamp());
    });
    const query = `INSERT INTO movies_cinemas_locations (cinemas_locations_id, movie_id, show_date, created_at) ${values} returning *`;
    db.query(query, prepareValues, (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      const showList = [];
      const dataResult = result.rows.map((data) => {
        let showDate = new Date(data.show_date);
        return (data = {
          ...data,
          show_date: showDate.toLocaleDateString(),
        });
      });

      result.rows.forEach((e) => showList.push(e.id));
      console.log("success showtime");
      return resolve({ data: { data: dataResult, ids: showList } });
    });
  });

const createScheduleMovie = (showTimeIds, schedules) =>
  new Promise((resolve, reject) => {
    const scheduleList = JSON.parse(schedules);
    const prepareValues = [];
    let values = "VALUES";
    let counter = 1;
    showTimeIds.forEach((showtimeId, index, array) => {
      if (index !== array.length - 1) {
        scheduleList.forEach((scheduleId) => {
          values += `($${counter}, $${counter + 1}, to_timestamp($${
            counter + 2
          })), `;
          counter += 3;
          prepareValues.push(showtimeId, scheduleId, getTimeStamp());
        });
      } else {
        scheduleList.forEach((scheduleId, index, array) => {
          if (index !== array.length - 1) {
            values += `($${counter}, $${counter + 1}, to_timestamp($${
              counter + 2
            })), `;
          } else {
            values += `($${counter}, $${counter + 1}, to_timestamp($${
              counter + 2
            }))`;
          }
          counter += 3;
          prepareValues.push(showtimeId, scheduleId, getTimeStamp());
        });
      }
    });
    const sqlSchedule = `INSERT INTO showtimes_schedules (showtime_id, schedule_id, created_at) ${values} returning id`;
    db.query(sqlSchedule, prepareValues, (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Sever Error" });
      }
      const ids = [];
      result.rows.forEach((e) => ids.push(e.id));
      return resolve(ids);
    });
    // return resolve({ values, prepareValues });
  });

const createMovieCast = (castIds, movieId) =>
  new Promise((resolve, reject) => {
    const castList = JSON.parse(castIds);
    let values = "VALUES";
    const prepareValues = [];
    castList.forEach((castId, index, array) => {
      if (index !== array.length - 1) {
        values += `($${1 + index * 3}, $${2 + index * 3},  to_timestamp($${
          3 + index * 3
        })), `;
      } else {
        values += `($${1 + index * 3}, $${2 + index * 3},  to_timestamp($${
          3 + index * 3
        }))`;
      }
      prepareValues.push(movieId, castId, getTimeStamp());
    });
    const sqlMovieCasts = `INSERT INTO movies_casts (movie_id, cast_id, created_at) ${values}`;
    db.query(sqlMovieCasts, prepareValues, (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Sever Error" });
      }
      const ids = [];
      result.rows.forEach((e) => ids.push(e.id));
      return resolve(ids);
    });
  });

const getNowShowingMovies = (req) =>
  new Promise((resolve, reject) => {
    const { page, limit, search, month } = req.query;
    const sqlLimit = parseInt(limit) || 5;
    const sqlOffset =
      !page || page === "1" ? 0 : (parseInt(page) - 1) * sqlLimit;

    let query =
      "select distinct on (m.movie_name)  m.movie_name, m.image, string_agg(distinct (g.genre_name) , ', ')genres, m.id from movies m join movies_cinemas_locations mcl on mcl.movie_id = m.id join movies_genres mg on m.id = mg.movie_id join genres g on g.id = mg.genre_id where  mcl.show_date = current_date ";

    let countQuery =
      "select count (distinct movie_name) from movies m join movies_cinemas_locations mcl on mcl.movie_id = m.id where  mcl.show_date = current_date ";

    if (search) {
      countQuery += `AND lower(m.movie_name) like lower('%${search}%') `;
      query += `AND lower(m.movie_name) like lower('%${search}%') `;
    }

    query += "group by movie_name, m.image, m.id limit $1 offset $2";
    db.query(countQuery, (err, result) => {
      if (err) {
        console.log(err);
        return reject({ status: 500, msg: "Internal Sever Error" });
      }

      const totalData = parseInt(result.rows[0].count);
      if (!totalData) return reject({ status: 404, msg: "Movie not found" });
      const currentPage = parseInt(page) || 1;
      const totalPage =
        sqlLimit > totalData ? 1 : Math.ceil(totalData / sqlLimit);
      const prev =
        currentPage === 1 ? null : `?limit=${sqlLimit}&page=${currentPage - 1}`;
      const next =
        currentPage === totalPage
          ? null
          : `?limit=${sqlLimit}&page=${currentPage + 1}`;
      const meta = {
        page: parseInt(currentPage),
        totalData: parseInt(totalData),
        limit: parseInt(sqlLimit),
        prev,
        next,
      };
      db.query(query, [sqlLimit, sqlOffset], (error, result) => {
        if (error) {
          console.log(error);
          return reject({ status: 500, msg: "Internal Server Error" });
        }
        return resolve({
          status: 200,
          msg: "Now Showing list",
          data: result.rows,
          meta,
        });
      });
    });
  });

const getUpcomingMovies = (req) =>
  new Promise((resolve, reject) => {
    const { page, limit, search, month } = req.query;
    const sqlLimit = parseInt(limit) || 5;
    const sqlOffset =
      !page || page === "1" ? 0 : (parseInt(page) - 1) * sqlLimit;

    let query =
      "select distinct on (m.movie_name)  m.movie_name, m.image, string_agg(distinct (g.genre_name) , ',')genres, m.id from movies m join movies_cinemas_locations mcl on mcl.movie_id = m.id join movies_genres mg on m.id = mg.movie_id join genres g on g.id = mg.genre_id where  mcl.show_date > current_date and m.movie_name not in(select m2.movie_name from movies m2 join movies_cinemas_locations mcl2 on mcl2.movie_id = m2.id where mcl2.show_date = current_date) ";

    let countQuery =
      "select count (distinct movie_name) from movies m  join movies_cinemas_locations mcl on mcl.movie_id = m.id where  mcl.show_date > current_date and m.movie_name not in(select m2.movie_name from movies m2 join movies_cinemas_locations mcl2 on mcl2.movie_id = m2.id where mcl2.show_date = current_date) ";
    if (search) {
      countQuery += `AND lower(m.movie_name) like lower('%${search}%')`;
      query += `AND lower(m.movie_name) like lower('%${search}%') `;
    }

    if (month) {
      countQuery += `AND extract (month from mcl.show_date) = ${getMonthNumber(
        month
      )}`;
      query += `AND extract (month from mcl.show_date) = ${getMonthNumber(
        month
      )} `;
    }
    query += "group by movie_name, m.image, m.id limit $1 offset $2";
    db.query(countQuery, (err, result) => {
      if (err) {
        console.log(err);
        return reject({ status: 500, msg: "Internal Sever Error" });
      }

      const totalData = parseInt(result.rows[0].count);
      if (!totalData) return reject({ status: 404, msg: "Movie not found" });

      const currentPage = parseInt(page) || 1;
      const totalPage =
        sqlLimit > totalData ? 1 : Math.ceil(totalData / sqlLimit);
      const prev =
        currentPage === 1 ? null : `?limit=${sqlLimit}&page=${currentPage - 1}`;
      const next =
        currentPage === totalPage
          ? null
          : `?limit=${sqlLimit}&page=${currentPage + 1}`;
      const meta = {
        page: parseInt(currentPage),
        totalData: parseInt(totalData),
        limit: parseInt(sqlLimit),
        prev,
        next,
      };
      db.query(query, [sqlLimit, sqlOffset], (error, result) => {
        if (error) {
          console.log(error);
          return reject({ status: 500, msg: "Internal Server Error" });
        }
        const resultData = result.rows.map((e) => {
          return (e = { ...e, genres: e.genres.split(",") });
        });
        return resolve({
          status: 200,
          msg: "Upcoming Movie List",
          data: resultData,
          meta,
        });
      });
    });
  });

const getDetailMovie = (id) =>
  new Promise((resolve, reject) => {
    const query =
      "select m.id, m.movie_name, m.synopsis, m.release_date, m.duration, m.director, m.image, string_agg(distinct(g.genre_name), ',') as genres, string_agg(distinct(c.cast_name), ',') as casts from movies m join movies_genres mg on mg.movie_id = m.id  join genres g on g.id = mg.genre_id join movies_casts mc on mc.movie_id = m.id join casts c on c.id = mc.cast_id where m.id = $1 group by m.id, m.movie_name, m.synopsis, m.release_date, m.duration, m.director, m.image";
    db.query(query, [id], (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      if (result.rows.length === 0)
        return reject({ status: 404, msg: "Movie not found" });
      const genres = result.rows[0].genres.split(",");
      const casts = result.rows[0].casts.split(",");
      return resolve({
        status: 200,
        data: { ...result.rows[0], genres, casts },
      });
    });
  });

const getCasts = () =>
  new Promise((resolve, reject) => {
    const query = "select id as cast_id, cast_name from casts";
    db.query(query, (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      return resolve({ status: 200, msg: "Cast List", data: result.rows });
    });
  });

const getGenres = () =>
  new Promise((resolve, reject) => {
    const query = "select id as genre_id, genre_name from genres";
    db.query(query, (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      return resolve({ status: 200, msg: "genres List", data: result.rows });
    });
  });
const movieRepo = {
  createMovie,
  createMovieGenre,
  createMovieShowTime,
  createScheduleMovie,
  createMovieCast,
  getUpcomingMovies,
  getNowShowingMovies,
  getDetailMovie,
  getCasts,
  getGenres,
};
module.exports = movieRepo;
