const http = require("http");
const https = require("https");
const fs = require("fs");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const path = require("path");
const util = require("util");
const debug = util.debuglog("appserver");

const config = require("./config");
const handlers = require("./lib/handlers");
const helpers = require("./lib/helpers");

const app = {};

app.httpServer = http.createServer(function(req, res) {
  app.unifiedServer(req, res);
});

app.httpsServerOptions = {
  key: fs.readFileSync("./certificate/key.pem"),
  cert: fs.readFileSync("./certificate/cert.pem"),
};

app.httpsServer = https.createServer(app.httpsServerOptions, function(
  req,
  res
) {
  app.unifiedServer(req, res);
});

app.httpServer.listen(config.httpPort, function() {
  console.log(
    "\x1b[34m%s\x1b[0m",
    `${config.envName} server is listening on port ${config.httpPort}`
  );
});
app.httpsServer.listen(config.httpsPort, function() {
  console.log(
    "\x1b[36m%s\x1b[0m",
    `${config.envName} server is listening on port ${config.httpsPort}`
  );
});

app.unifiedServer = function(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");
  const method = req.method.toLowerCase();
  const headers = req.headers;
  const queryStringObject = parsedUrl.query;

  debug("\x1b[33m%s\x1b[0m", JSON.stringify(parsedUrl));
  debug("\x1b[35m%s\x1b[0m%s", "request path: ", trimmedPath);
  debug("\x1b[35m%s\x1b[0m%s", "request method: ", method);
  debug("request headers: ", headers);
  debug(
    "\x1b[35m%s\x1b[0m%o",
    "request query string parameters: ",
    queryStringObject
  );

  const decoder = new StringDecoder("utf-8");
  let tempBuffer = "";
  req.on("data", function(data) {
    tempBuffer += decoder.write(data);
  });
  req.on("end", function() {
    tempBuffer += decoder.end();

    const choosenHandler =
      typeof app.router[trimmedPath] !== "undefined"
        ? app.router[trimmedPath]
        : app.router.notFound;

    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload: helpers.parseJsonToObject(tempBuffer),
    };

    choosenHandler(data, function(statusCode, payloadObject) {
      statusCode = typeof statusCode === "number" ? statusCode : 200;
      payloadObject = typeof payloadObject === "object" ? payloadObject : {};
      const payloadString = JSON.stringify(payloadObject);

      res.setHeader("Content-Type", "aplication/json");
      res.writeHead(statusCode);
      res.end(payloadString);

      if (statusCode === 200) {
        debug("%s\x1b[32m%s\x1b[0m", "request payloads: ", tempBuffer);
        debug("%s\x1b[32m%s\x1b[0m", "status code: ", statusCode);
      } else {
        debug("%s\x1b[31m%s\x1b[0m", "request payloads: ", tempBuffer);
        debug("%s\x1b[31m%s\x1b[0m", "status code: ", statusCode);
      }
    });
  });
};

app.router = {
  users: handlers.users,
  login: handlers.login,
  logout: handlers.logout,
  "show-menu": handlers.menu,
  "add-to-cart": handlers.addToCart,
  "checkout-order": handlers.checkout,
  notFound: handlers.notFound,
};
