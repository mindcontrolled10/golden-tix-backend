const db = require("../config/postgre");
const getTimeStamp = require("../helper/getTimeStamp");

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
      price,
      image,
      getTimeStamp(),
    ];
    const sqlMovie =
      "INSERT INTO movies (movie_name, synopsis, release_date, duration, director, price, image, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, to_timestamp($8)) returning *";

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
    const query = `INSERT INTO movies_cinemas_locations (cinemas_locations_id, movie_id, show_date, created_at) ${values} returning id, show_date`;
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

const movieRepo = { createMovie, createMovieGenre, createMovieShowTime };
module.exports = movieRepo;
