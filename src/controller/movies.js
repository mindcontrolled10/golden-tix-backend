const resHelper = require("../helper/sendResponse");
const movieRepo = require("../model/movies");

const createMovie = async (req, res) => {
  try {
    console.log(req.body);
    const createMovie = await movieRepo.createMovie(req);
    const createMovieGenre = await movieRepo.createMovieGenre(
      req.body.genreId,
      createMovie.id
    );
    const showTime = await movieRepo.createMovieShowTime(
      req.body.cinemasLocationsId,
      createMovie.id,
      req.body.showDate,
      req.body.schedules
    );
    resHelper.success(res, 200, {
      data: showTime.data,
      msg: "Success",
    });
  } catch (error) {
    console.log(error);
    resHelper.error(res, error.status, error);
  }
};

const movieController = { createMovie };

module.exports = movieController;
