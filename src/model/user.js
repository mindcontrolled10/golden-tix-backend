const db = require("../config/postgre");
const bcrypt = require("bcrypt");
const getProfile = (id) => {
  return new Promise((resolve, reject) => {
    const sqlGetProfile =
      "select u.username, u.first_name , u.last_name , u.full_name, u.email , u.phone, u.image from users u where u.id = $1";
    db.query(sqlGetProfile, [id], (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      return resolve({
        status: 200,
        msg: "Profile Details",
        data: { ...result.rows[0] },
      });
    });
  });
};

const editProfile = (id, body, file) => {
  return new Promise((resolve, reject) => {
    const timeStamp = Date.now() / 1000;
    const values = [];
    let query = "update users set ";
    let imageUrl = "";
    if (file) {
      imageUrl = `${file}`;
      if (Object.keys(body).length > 0) {
        query += `image = '${imageUrl}', `;
      }
      if (Object.keys(body).length === 0) {
        query += `image = '${imageUrl}', updated_at = to_timestamp($1) where id = $2 returning username`;
        values.push(timeStamp, id);
      }
    }

    Object.keys(body).forEach((key, idx, array) => {
      if (idx === array.length - 1) {
        query += ` ${key} = $${idx + 1} where id = $${
          idx + 2
        } returning username`;
        values.push(body[key], id);
        return;
      }
      query += `${key} = $${idx + 1},`;
      values.push(body[key]);
    });
    db.query(query, values, (err, result) => {
      if (err) {
        console.log(err);
        console.log(query, values, file);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      console.log(values, query);
      console.log(body, "INII");
      let data = {};
      if (file) {
        data = { Image: imageUrl, ...body };
      } else {
        data = { ...body };
      }
      return resolve({
        status: 200,
        msg: `${result.rows[0].username} Your profile updated successfully`,
        data,
      });
    });
  });
};

const editPassword = (req) =>
  new Promise((resolve, reject) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const id = req.userData.id;
    if (newPassword !== confirmPassword)
      return reject({
        status: 400,
        msg: "new password and confirm password isn't matched",
      });
    const sqlGetPassword = "select password from users where id = $1";
    db.query(sqlGetPassword, [id], (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      const password = result.rows[0].password;
      bcrypt.compare(oldPassword, password, (error, isSame) => {
        if (error) {
          console.log(error);
          return reject({ status: 500, msg: "Internal Server Error" });
        }
        if (!isSame) return reject({ status: 403, msg: "Wrong old password" });

        bcrypt.hash(newPassword, 10, (error, hashedPwd) => {
          if (error) {
            console.log(error);
            return reject({ status: 500, msg: "Internal Server Error" });
          }
          const sqlUpdate = "update users set password = $1 where id = $2";
          db.query(sqlUpdate, [hashedPwd, id], (error) => {
            if (error) {
              console.log(error);
              return reject({ status: 500, msg: "Internal Server Error" });
            }
            return resolve({ status: 200, msg: "Password updated" });
          });
        });
      });
    });
  });
const userRepo = { getProfile, editProfile, editPassword };

module.exports = userRepo;
