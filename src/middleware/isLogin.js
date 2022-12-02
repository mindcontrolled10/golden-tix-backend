const db = require("../config/postgre");

const jwt = require("jsonwebtoken");
const resHelper = require("../helper/sendResponse");

const isLogin = () => {
  return (req, res, next) => {
    const token = req.header("x-access-token");
    if (!token)
      return resHelper.error(res, 403, {
        status: 403,
        msg: "You Need To Login First",
      });
    const sqlCheckToken = "select token from whitelist_token where token = $1";
    db.query(sqlCheckToken, [token], (error, result) => {
      if (error) {
        console.log(error);
        return resHelper.error(res, 500, {
          status: 500,
          msg: "Internal Server Error",
        });
      }
      if (result.rows.length === 0)
        return resHelper.error(res, 403, {
          status: 403,
          msg: "You Need To Login First",
        });
      jwt.verify(
        token,
        process.env.SECRET_KEY,
        {
          expiresIn: "24h",
          issuer: process.env.ISSUER,
        },
        (error, decodedPayload) => {
          if (error) {
            console.log(error);
            return resHelper.error(res, 500, {
              status: 500,
              msg: error.message,
            });
          }
          req.userData = decodedPayload;
          next();
        }
      );
    });
  };
};

module.exports = isLogin;
