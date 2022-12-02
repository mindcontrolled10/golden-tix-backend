const express = require("express");
const mainRouter = express.Router();
const auth = require("./auth");
const profile = require("./user");

const prefix = "/api";

mainRouter.use(`${prefix}/auth`, auth);
mainRouter.use(`${prefix}/user`, profile);

mainRouter.get(`/`, (req, res) => {
  res.json({ msg: "Welcome" });
});

module.exports = mainRouter;
