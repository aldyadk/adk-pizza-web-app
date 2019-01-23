const handlers = {};

handlers._users = require("./users.js");
handlers._auth = require("./auth.js");
handlers._menu = require("./menu.js");
handlers._cart = require("./cart.js");
handlers._checkout = require("./checkout.js");

handlers.users = function(data, cb) {
  const acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, cb);
  } else {
    cb(405);
  }
};

handlers.login = function(data, cb) {
  if (data.method === "post") {
    handlers._auth["login"](data, cb);
  } else {
    cb(405);
  }
};

handlers.logout = function(data, cb) {
  if (data.method === "post") {
    handlers._auth["logout"](data, cb);
  } else {
    cb(405);
  }
};

handlers.menu = function(data, cb) {
  if (data.method === "get") {
    handlers._menu(data, cb);
  } else {
    cb(405);
  }
};

handlers.addToCart = function(data, cb) {
  if (data.method === "post") {
    handlers._cart(data, cb);
  } else {
    cb(405);
  }
};

handlers.checkout = function(data, cb) {
  if (data.method === "post") {
    handlers._checkout.processCheckout(data, cb);
  } else {
    cb(405);
  }
};

handlers.notFound = function(data, cb) {
  cb(404);
};

module.exports = handlers;
