const db = require("../config/postgre");

const getAllSchedule = () =>
  new Promise((resolve, reject) => {
    const query = "SELECT id as schedule_id, schedule from schedules";
    db.query(query, (error, result) => {
      if (error) {
        console.log(error);
        return reject({ status: 500, msg: "Internal Server Error" });
      }
      return resolve({
        status: 200,
        msg: "List Time Schedule",
        data: result.rows,
      });
    });
  });

const scheduleRepo = { getAllSchedule };
module.exports = scheduleRepo;
