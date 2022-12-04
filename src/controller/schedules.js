const resHelper = require("../helper/sendResponse");
const scheduleRepo = require("../model/schedules");

const getSchedule = async (req, res) => {
  try {
    const response = await scheduleRepo.getAllSchedule();
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};

const scheduleController = { getSchedule };

module.exports = scheduleController;
