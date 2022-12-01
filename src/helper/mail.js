const fs = require("fs");
const mustache = require("mustache");

const { google } = require("googleapis");

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
const user = process.env.GOOGLE_CLIENT_USER;

const { OAuth2 } = google.auth;
const OAuth2Client = new OAuth2(
  clientId,
  clientSecret,
  "https://developers.google.com/oauthplayground"
);
OAuth2Client.setCredentials({
  refresh_token: refreshToken,
});

module.exports = {
  mailSender: (data) => {
    return new Promise((resolve, reject) => {
      const accessToken = OAuth2Client.getAccessToken;

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: user,
          clientId: clientId,
          clientSecret: clientSecret,
          refreshToken: refreshToken,
          accessToken,
        },
      });

      const template = fs.readFileSync(
        `src/templates/email/${data.template}`,
        "utf8"
      );

      const mailOption = {
        from: '"Golden-Tix" <fcb.nyak@gmail.com>',
        to: data.to,
        subject: data.subject,
        html: mustache.render(template, { ...data }),
      };

      transporter.sendMail(mailOption, (err, info) => {
        if (err) {
          console.log(err);
          return reject({ status: 500, msg: "Internal Server Error" });
        }
        return resolve({
          status: 200,
          msg: "Create account success, check email to verify",
        });
      });
    });
  },
};
