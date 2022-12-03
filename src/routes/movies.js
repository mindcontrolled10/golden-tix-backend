const moviesRouter = require("express").Router();
const allowedRoles = require("../middleware/allowedRoles");
const cloudinary = require("../middleware/cloudinary");
const validate = require("../middleware/validate");
const upload = require("../middleware/uploadSingle");
const isLogin = require("../middleware/isLogin");
const movieController = require("../controller/movies");

const newMoviesBody = [
  "movieName",
  "synopsis",
  "releaseDate",
  "duration",
  "director",
  "genreId",
  "cinemasLocationsId",
  "showDate",
  "schedulesId",
  "castIds",
];
moviesRouter.get("/upcoming", movieController.getUpcomingMovies);
moviesRouter.get("/showing", movieController.getshowingMovies);
moviesRouter.get("/details/:id", isLogin(), movieController.getDetailMovie);
moviesRouter.post(
  "/new",
  isLogin(),
  allowedRoles("admin"),
  upload,
  cloudinary,
  validate.chekUpload(),
  validate.body(...newMoviesBody),
  movieController.createMovie
);
module.exports = moviesRouter;
