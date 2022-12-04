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

const cinemaController = { getCinemaSchedule, getCinemasByLocation };
module.exports = cinemaController;
