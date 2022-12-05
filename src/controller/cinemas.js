const resHelper = require("../helper/sendResponse");
const cinemaRepo = require("../model/cinemas");

const getCinemaSchedule = async (req, res) => {
  try {
    const response = await cinemaRepo.getCinemaSchedule(req);
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};

const getCinemasByLocation = async (req, res) => {
  try {
    const response = await cinemaRepo.getCinemasByLocation(req);
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};

const getLocations = async (req, res) => {
  try {
    const response = await cinemaRepo.getLocations();
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};

const getCinemasBySchedule = async (req, res) => {
  try {
    const response = await cinemaRepo.getCinemasBySchedule(req);
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};

const cinemaController = {
  getCinemaSchedule,
  getCinemasByLocation,
  getLocations,
  getCinemasBySchedule,
};
module.exports = cinemaController;
