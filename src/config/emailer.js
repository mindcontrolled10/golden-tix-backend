const nodeMailer = require("nodemailer");
const fs = require("fs");
const mustache = require("mustache");
const { google } = require("googleapis");

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
const { OAuth2 } = google.auth;
const OAuth2Client = new OAuth2(clientId, clientSecret);
OAuth2Client.setCredentials({ refresh_token: refreshToken });
const accessToken = OAuth2Client.getAccessToken();

const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    type: "Oauth2",
    user: "fcb.nyak@gmail.com",
    clientId,
    clientSecret,
    refreshToken,
    accessToken,
  },
});
