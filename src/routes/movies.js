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
  "price",
  "genreId",
  "cinemasLocationsId",
  "showDate",
  "schedules",
];

moviesRouter.post(
  "/new",
  isLogin(),
  allowedRoles("admin"),
  upload,
  cloudinary,
  validate.body(...newMoviesBody),
  movieController.createMovie
);
module.exports = moviesRouter;
