const authRepo = require("../model/auth");
const resHelper = require("../helper/sendResponse");
const { mailSender } = require("../helper/mail");

const register = async (req, res) => {
  try {
    const regist = await authRepo.register(req);

    const setSendMail = {
      to: req.body.email,
      subject: "Email Verification",
      name: req.body.firstName,
      template: "verifyEmail.html",
      link: `http://localhost:8080/api/auth/verify/${regist.otp}`,
    };
    const response = await mailSender(setSendMail);

    return resHelper.success(res, response.status, response);
  } catch (error) {
    console.log(error);
    return resHelper.error(res, error.status || 500, error);
  }
};

const login = async (req, res) => {
  try {
    const response = await authRepo.login(req);
    return resHelper.success(res, response.status, response);
  } catch (error) {
    return resHelper.error(res, error.status, error);
  }
};

const logout = async (req, res) => {
  try {
    const response = await authRepo.logout(req);
    return resHelper.success(res, response.status, response);
  } catch (error) {
    return resHelper.error(res, error.status, error);
  }
};

const resetPassword = async (req, res) => {
  try {
    const response = await authRepo.resetPassword(req);
    return resHelper.success(res, response.status, response);
  } catch (error) {
    return resHelper.error(res, error.status, error);
  }
};

const verify = async (req, res) => {
  try {
    const response = await authRepo.verify(req);
    return resHelper.success(res, response.status, response);
  } catch (error) {
    return resHelper.error(res, error.status, error);
  }
};

const authController = {
  register,
  login,
  logout,
  resetPassword,
  verify,
};

module.exports = authController;
