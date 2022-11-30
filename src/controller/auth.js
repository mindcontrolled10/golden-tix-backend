const authRepo = require("../model/auth");
const resHelper = require("../helper/sendResponse");

const register = async (req, res) => {
  try {
    const response = await authRepo.register(req);
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};

const login = async (req, res) => {
  try {
    const response = await authRepo.login(req);
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};

const authController = {
  register,
  login,
};

module.exports = authController;
