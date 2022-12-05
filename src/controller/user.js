const userRepo = require("../model/user");
const resHelper = require("../helper/sendResponse");

const getProfile = async (req, res) => {
  try {
    // console.log(req.userData);
    const response = await userRepo.getProfile(req.userData.id);
    resHelper.success(res, response.status, response);
  } catch (error) {
    console.log(error);
    resHelper.error(res, error.status, error);
  }
};

const editProfile = async (req, res) => {
  try {
    const response = await userRepo.editProfile(
      req.userData.id,
      req.body,
      req.file
    );
    resHelper.success(res, response.status, response);
  } catch (error) {
    console.log(error);
    resHelper.error(res, error.status, error);
  }
};

const editPassword = async (req, res) => {
  try {
    const response = await userRepo.editPassword(req);
    resHelper.success(res, response.status, response);
  } catch (error) {
    console.log(error);
    resHelper.error(res, error.status, error);
  }
};

const userController = { getProfile, editProfile, editPassword };

module.exports = userController;
