const session = require("express-session");

module.exports = checkSignIn = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.render("admin/login", {
      succ: false,
      err: true
    });
  }
};
