const nodemailer = require("nodemailer");
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
