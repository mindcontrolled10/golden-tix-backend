const resHelper = require("../helper/sendResponse");
const movieRepo = require("../model/movies");

const createMovie = async (req, res) => {
  try {
    const createMovie = await movieRepo.createMovie(req);
    const createMovieGenre = await movieRepo.createMovieGenre(
      req.body.genreId,
      createMovie.id
    );
    const createMovieCast = await movieRepo.createMovieCast(
      req.body.castIds,
      createMovie.id
    );
    const showTime = await movieRepo.createMovieShowTime(
      req.body.cinemasLocationsId,
      createMovie.id,
      req.body.showDate
    );
    console.log(showTime.data.ids);
    const createSchedule = await movieRepo.createScheduleMovie(
      showTime.data.ids,
      req.body.schedulesId
    );
    resHelper.success(res, 200, {
      msg: "Create Movie Success",
    });
  } catch (error) {
    console.log(error);
    resHelper.error(res, error.status, error);
  }
};
const getUpcomingMovies = async (req, res) => {
  try {
    const response = await movieRepo.getUpcomingMovies(req);
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};

const getshowingMovies = async (req, res) => {
  try {
    const response = await movieRepo.getNowShowingMovies(req);
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};
const getDetailMovie = async (req, res) => {
  try {
    const response = await movieRepo.getDetailMovie(req.params.id);
    resHelper.success(res, response.status, response);
  } catch (error) {
    console.log(error);
    resHelper.error(res, error.status, error);
  }
};
const getCasts = async (req, res) => {
  try {
    const response = await movieRepo.getCasts();
    resHelper.success(res, response.status, response);
  } catch (error) {
    console.log(error);
    resHelper.error(res, error.status, error);
  }
};
const getGenres = async (req, res) => {
  try {
    const response = await movieRepo.getGenres();
    resHelper.success(res, response.status, response);
  } catch (error) {
    console.log(error);
    resHelper.error(res, error.status, error);
  }
};
const movieController = {
  createMovie,
  getUpcomingMovies,
  getshowingMovies,
  getDetailMovie,
  getCasts,
  getGenres,
};

module.exports = movieController;
