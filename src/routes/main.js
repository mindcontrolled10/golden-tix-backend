const express = require("express");
const mainRouter = express.Router();
const auth = require("./auth");

const prefix = "/api";

mainRouter.use(`${prefix}/auth`, auth);

mainRouter.get(`/`, (req, res) => {
  res.json({ msg: "Welcome" });
});

module.exports = mainRouter;
