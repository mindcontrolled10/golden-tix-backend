const moviesRouter = require("express").Router();
const allowedRoles = require("../middleware/allowedRoles");
const cloudinary = require("../middleware/cloudinary");
const validate = require("../middleware/validate");

module.exports = moviesRouter;
