const db = require("../config/postgre");

const getProfile = (id) => {
  return new Promise((resolve, reject) => {
    const sqlGetProfile =
      "select u.username, u.first_name , u.last_name , u.email , u.phone, u.image from users u where u.id = $1";
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

const userRepo = { getProfile, editProfile };

module.exports = userRepo;
