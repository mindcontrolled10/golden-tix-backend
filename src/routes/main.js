const express = require("express");
const mainRouter = express.Router();
const auth = require("./auth");
const profile = require("./user");
const movie = require("./movies");
const cinema = require("./cinemas");
const schedule = require("./schedules");
const booking = require("./bookings");
const prefix = "/api";

mainRouter.use(`${prefix}/auth`, auth);
mainRouter.use(`${prefix}/user`, profile);
mainRouter.use(`${prefix}/movie`, movie);
mainRouter.use(`${prefix}/cinema`, cinema);
mainRouter.use(`${prefix}/schedule`, schedule);
mainRouter.use(`${prefix}/booking`, booking);
mainRouter.get(`/`, (req, res) => {
  res.json({ msg: "Welcome" });
});

module.exports = mainRouter;
