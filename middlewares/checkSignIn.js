const session = require("express-session");

module.exports = checkSignIn = (req, res) => {
  if (req.session.admin) {
    next(); //If session exists, proceed to page
  } else {
    let err = new Error("Not logged in!");
    console.log(req.session.admin);
    next(err); //Error, trying to access unauthorized page!
  }
};
