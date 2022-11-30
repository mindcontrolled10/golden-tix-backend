const express = require("express");
const mainRouter = express.Router();
const prefix = "/api";

mainRouter.get(`/`, (req, res) => {
  res.json({ msg: "Welcome" });
});

module.exports = mainRouter;
