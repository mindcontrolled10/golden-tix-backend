const db = require("../config/postgre");
const bcrypt = require("bcrypt");
const getTimeStamp = require("../helper/getTimeStamp");
const jwt = require("jsonwebtoken");
const { createOtp } = require("../helper/createOtp");

const register = (req) => {
  return new Promise((resolve, reject) => {
    const { email, password, firstName, lastName } = req.body;
    const fullName = `${firstName} ${lastName}`;
    const role = 1;
    const checkEmailQuery = "select email from users where email = $1";
    db.query(checkEmailQuery, [email], (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      if (result.rows.length > 0)
        return reject({ status: 403, msg: "Email Already Exist" });

      bcrypt.hash(password, 10, (error, hashedPwd) => {
        if (error) {
          console.log(error);
          return reject({ status: 500, msg: "Internal Server Error" });
        }
        const timeStamp = getTimeStamp();
        const generateOtp = Math.floor(100000 + Math.random() * 900000);
        const values = [
          email,
          hashedPwd,
          role,
          timeStamp,
          firstName,
          lastName,
          generateOtp,
          0,
          fullName,
        ];
        const query =
          "INSERT INTO users(email, password, role_id, created_at, first_name, last_name, register_otp, status, full_name) values ($1, $2, $3, to_timestamp($4), $5, $6, $7, $8, $9) returning register_otp";
        db.query(query, values, (error, result) => {
          if (error) {
            console.log(error);
            return reject({ status: 500, msg: "Internal Server Error" });
          }
          return resolve({
            otp: result.rows[0].register_otp,
          });
        });
      });
    });
  });
};

const login = (req) => {
  return new Promise((resolve, reject) => {
    const { email, password } = req.body;
    const sqlCheckCridentials =
      "select u.id, u.email, u.password, u.status, r.role_name as role from users u join roles r on r.id = u.role_id where email = $1";
    db.query(sqlCheckCridentials, [email], (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      if (result.rows.length === 0)
        return reject({ status: 401, msg: "Wrong Email/Password" });
      if (result.rows[0].status == 0)
        return reject({ status: 401, msg: "Please Verify Your Email First" });
      const hashedPwd = result.rows[0].password;
      bcrypt.compare(password, hashedPwd, (error, isSame) => {
        if (error) {
          console.log(error);
          return reject({ status: 500, msg: "Internal Server Error" });
        }
        if (!isSame)
          return reject({ status: 401, msg: "Wrong Email/Password" });
        const payload = {
          id: result.rows[0].id,
          role: result.rows[0].role,
        };
        jwt.sign(
          payload,
          process.env.SECRET_KEY,
          {
            expiresIn: "24h",
            issuer: process.env.ISSUER,
          },
          (error, token) => {
            if (error) {
              console.log(error);
              return reject({ status: 500, msg: "Internal Server Error" });
            }
            const sqlInsertToken =
              "INSERT INTO whitelist_token (token) VALUES($1)";
            db.query(sqlInsertToken, [token], (error) => {
              if (error) {
                console.log(error);
                return reject({ status: 500, msg: "Internal Server Error" });
              }
              return resolve({
                status: 200,
                msg: "Login Success",
                data: { userData: { ...payload, token } },
              });
            });
          }
        );
      });
    });
  });
};

const logout = (req) => {
  return new Promise((resolve, reject) => {
    const token = req.header("x-access-token");
    const sqlLogout = "DELETE FROM whitelist_token WHERE token = $1";
    db.query(sqlLogout, [token], (error) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      return resolve({ status: 200, msg: "Logout Successful" });
    });
  });
};

const forgotPassword = (req) => {
  return new Promise((resolve, reject) => {
    const { email } = req.body;
    const generateOtp = createOtp();
    const sqlCheckUser = "select email, first_name from users where email = $1";
    db.query(sqlCheckUser, [email], (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      if (result.rows.length === 0)
        return reject({ status: 404, msg: "Email Isn't Registered" });
      const sqlCreateOtp =
        "update users set password_otp = $1 where email = $2 returning password_otp";
      const firstName = result.rows[0].first_name;
      db.query(sqlCreateOtp, [generateOtp, email], (error, result) => {
        if (error) {
          console.log(error);
          return reject({ status: 500, msg: "Internal Server Error" });
        }
        return resolve({
          otp: result.rows[0].password_otp,
          firstName,
        });
      });
    });
  });
};

const resetPassword = (req) => {
  return new Promise((resolve, reject) => {
    const { otp, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword)
      return reject({
        status: 400,
        msg: "Password Isnt Matched",
      });
    const sqlGetUser =
      "select id, password_otp from users where password_otp = $1";
    db.query(sqlGetUser, [otp], (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      if (result.rows.length === 0)
        return reject({ status: 400, msg: "Wrong OTP" });
      const id = result.rows[0].id;
      bcrypt.hash(newPassword, 10, (error, hashedPwd) => {
        if (error) {
          console.log(error);
          return reject({ status: 500, msg: "Internal Server Error" });
        }
        const sqlResetPassword =
          "update users set password = $1, updated_at = to_timestamp($2), password_otp = $3 where id = $4 returning id";
        const values = [hashedPwd, getTimeStamp(), null, id];
        db.query(sqlResetPassword, values, (error, result) => {
          if (error) {
            console.log(error);
            return reject({ status: 500, msg: "Internal Server Error" });
          }
          return resolve({
            status: 200,
            msg: "Success, please Login with your new password",
          });
        });
      });
    });
  });
};

const verify = (req) => {
  return new Promise((resolve, reject) => {
    const otp = req.params.otp;
    const sqlCheckOtp =
      "select id, email, register_otp from users where register_otp = $1";
    db.query(sqlCheckOtp, [otp], (err, result) => {
      if (err) {
        console.log(err);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      if (result.rows.length === 0)
        return reject({ status: 401, msg: "WRONG OTP" });
      sqlVerifyEmail =
        "update users set status = $1, register_otp = $2, updated_at = to_timestamp($3) where id = $4 and register_otp = $5";
      const timeStamp = getTimeStamp();
      const id = result.rows[0].id;
      const values = [1, null, timeStamp, id, otp];
      db.query(sqlVerifyEmail, values, (err) => {
        if (err) {
          console.log(err);
          return reject({ status: 500, msg: "Internal Server Error" });
        }
        return resolve({
          status: 200,
          msg: "email verified!",
        });
      });
      // return resolve({ status: 200, msg: "found", data: result.rows[0] });
    });
  });
};
const authRepo = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  verify,
};

module.exports = authRepo;
