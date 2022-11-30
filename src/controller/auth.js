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

const logout = async (req, res) => {
  try {
    const response = await authRepo.logout(req);
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};

const resetPassword = async (req, res) => {
  try {
    const response = await authRepo.resetPassword(req);
    resHelper.success(res, response.status, response);
  } catch (error) {
    resHelper.error(res, error.status, error);
  }
};

const authController = {
  register,
  login,
  logout,
  resetPassword,
};

module.exports = authController;
