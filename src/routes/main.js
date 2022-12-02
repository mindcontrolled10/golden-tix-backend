const express = require("express");
const mainRouter = express.Router();
const auth = require("./auth");
const profile = require("./profile");
const movies = require("./movies");

const prefix = "/api";

mainRouter.use(`${prefix}/auth`, auth);
mainRouter.use(`${prefix}/profile`, profile);
mainRouter.use(`${prefix}/movies`, movies);

mainRouter.get(`/`, (req, res) => {
  res.json({ msg: "Welcome" });
});

module.exports = mainRouter;
