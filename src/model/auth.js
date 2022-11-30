const db = require("../config/postgre");
const bcrypt = require("bcrypt");
const getTimeStamp = require("../helper/getTimeStamp");
const jwt = require("jsonwebtoken");
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
        const values = [email, hashedPwd, role, timeStamp, firstName, lastName];
        const query =
          "INSERT INTO users(email, password, role_id, created_at, first_name, last_name) values ($1, $2, $3, to_timestamp($4), $5, $6)";
        db.query(query, values, (error) => {
          if (error) {
            console.log(error);
            return reject({ status: 500, msg: "Internal Server Error" });
          }
          return resolve({
            status: 201,
            msg: `Congrats ${email} your account created successfully`,
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
      "select u.id, u.email, u.password, r.role_name as role from users u join roles r on r.id = u.role_id where email = $1";
    db.query(sqlCheckCridentials, [email], (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      if (result.rows.length === 0)
        return reject({ status: 401, msg: "Wrong Email/Password" });
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

const authRepo = { register, login };

module.exports = authRepo;
