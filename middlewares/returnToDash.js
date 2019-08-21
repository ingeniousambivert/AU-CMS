const checkSignIn = require("./checkSignIn");
const session = require("express-session");

module.exports = returnToDash = (req, res, next) => {
  if (checkSignIn()) {
    res.redirect("/dashboard");
    return next();
  }
};
