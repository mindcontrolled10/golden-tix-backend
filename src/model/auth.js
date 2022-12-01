const db = require("../config/postgre");
const bcrypt = require("bcrypt");
const getTimeStamp = require("../helper/getTimeStamp");
const jwt = require("jsonwebtoken");
const client = require("../config/redis");

const register = (req) => {
  return new Promise((resolve, reject) => {
    const { email, password, firstName, lastName } = req.body;
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
        ];
        const query =
          "INSERT INTO users(email, password, role_id, created_at, first_name, last_name, register_otp, status) values ($1, $2, $3, to_timestamp($4), $5, $6, $7 ,$8) returning register_otp";
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
            expiresIn: "60m",
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

const resetPassword = (req) => {
  return new Promise((resolve, reject) => {
    const { email, newPassword, otp } = req.body;

    if (email && !newPassword && !otp) {
      const sqlChekUser = "SELECT email from users where email = $1";
      db.query(sqlChekUser, [email], (error, result) => {
        if (error) {
          console.log(error);
          return reject({ status: 500, msg: "Internal Server Error" });
        }
        if (result.rows.length === 0)
          return reject({ status: 400, msg: "Your email isn't registered" });

        const generateOtp = Math.floor(100000 + Math.random() * 900000);
        client
          .get(email)
          .then((result) => {
            if (result) {
              client
                .del(email)
                .then()
                .catch((error) => {
                  console.log(error);
                  return reject({ status: 500, msg: "Internal Server Error" });
                });
            }
            client
              .set(email, generateOtp, { EX: 120, NX: true })
              .then(() => {
                console.log(generateOtp);
                return resolve({
                  status: 200,
                  msg: "Please check your email to reset your password",
                });
              })
              .catch((error) => {
                console.log(error);
                return reject({ status: 500, msg: "Internal Server Error" });
              });
          })
          .catch((error) => {
            console.log(error);
            return reject({ status: 500, msg: "Internal Server Error" });
          });
      });
    }

    if (email && otp && newPassword) {
      client
        .get(email)
        .then((userOtp) => {
          if (otp != userOtp) return reject({ status: 401, msg: "Wrong OTP" });
          bcrypt.hash(newPassword, 10, (error, hashedPwd) => {
            if (error) {
              console.log(error);
              return reject({ status: 500, msg: "Internal Server Error" });
            }
            const sqlResetPassword =
              "UPDATE users SET password = $1, updated_at = to_timestamp($2) where email = $3";
            const timeStamp = getTimeStamp();
            db.query(
              sqlResetPassword,
              [hashedPwd, timeStamp, email],
              (error) => {
                if (error) {
                  console.log(error);
                  return reject({ status: 500, msg: "Internal Server Error" });
                }
                client
                  .del(email)
                  .then(() => {
                    return resolve({
                      status: 200,
                      msg: "Password Reset Success",
                    });
                  })
                  .catch((error) => {
                    console.log(error);
                    return reject({
                      status: 500,
                      msg: "Internal Server Error",
                    });
                  });
              }
            );
          });
        })
        .catch((error) => {
          console.log(error);
          return reject({ status: 500, msg: "Internal Server Error" });
        });
    }
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
const authRepo = { register, login, logout, resetPassword, verify };

module.exports = authRepo;
