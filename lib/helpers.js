const crypto = require("crypto");
const querystring = require("querystring");
const https = require("https");

const config = require("../config");

module.exports = {
  hash(string) {
    if (typeof string === "string" && string.length > 0) {
      var hash = crypto
        .createHmac("sha256", config.hashingSecret)
        .update(string)
        .digest("hex");
      return hash;
    } else {
      return false;
    }
  },
  parseJsonToObject(string) {
    try {
      const obj = JSON.parse(string);
      return obj;
    } catch (e) {
      return {};
    }
  },
  createRandomString(length) {
    if (typeof length === "number" && length > 0) {
      const template =
        "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890";
      let result = "";
      for (let i = 0; i < length; i++) {
        // result += template[Math.floor(Math.random() * template.length)];
        result += template.charAt(Math.floor(Math.random() * template.length));
      }
      return result;
    } else {
      return false;
    }
  },
  mailGunJob(email, msg, cb) {
    console.log(email, msg);
    const payload = {
      from: `ADK PIZZA ${config.mailgunSender}`,
      to: email,
      subject: "ADK PIZZA - Payment Receipt",
      text: msg,
    };

    const stringPayload = querystring.stringify(payload);
    const requestDetails = {
      protocol: "https:",
      hostname: "api.mailgun.net",
      method: "POST",
      path: config.mailgunPath,
      auth: "api" + ":" + config.mailgunApiKey,
      headers: {
        // Authorization: "Bearer " + config.stripeApiKey,
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(stringPayload),
      },
    };
    const request = https.request(requestDetails, function(response) {
      const status = response.statusCode;
      if (status === 200) {
        cb(null);
      } else {
        cb("Could not email the user. Mailgun Status: " + status);
      }
    });
    request.on("error", function(err) {
      console.log(err);
      cb("Could not finish mailing customer");
    });
    request.write(stringPayload);
    request.end();
  },
};
