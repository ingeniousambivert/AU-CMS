const express = require("express");
const adminRouter = express.Router();

// Middlewares for Auth
const checkSignIn = require("../middlewares/checkSignIn");
const returnToDash = require("../middlewares/returnToDash");

// Data for views
const formerEvents = require("../data/former-events.json");
const upcomingEvents = require("../data/upcoming-events.json");
const visits = require("../data/industrial-visits.json");
//----- ADMIN ROUTES -----//

adminRouter.use((req, res, next) => {
  if (req.cookies.admin_key && !req.session.admin) {
    res.clearCookie("admin_key");
  }
  next();
});

// Login Route
adminRouter.get("/login", (req, res) => {
  // use res.render to load up an ejs view file
  // login page
  res.render("admin/login", { succ: false, err: false });
});

// Login Route
adminRouter.post("/login", (req, res) => {
  let { adminUsername, adminPassword } = req.body;

  if (!adminUsername || !adminPassword) {
    res.render("admin/login", {
      succ: false,
      err: true
    });
  } else {
    if (adminUsername == "admin" && adminPassword == "admin") {
      let adminValues = [
        {
          username: adminUsername
        }
      ];
      req.session.admin = adminValues;
      res.redirect("/dashboard");
      // console.log("Admin logged in.");
    } else {
      res.render("admin/login", {
        succ: false,
        err: true
      });
    }
  }
});

//  Dashboard Route
adminRouter.get("/dashboard", checkSignIn, (req, res) => {
  // use res.render to load up an ejs view file
  // admin panel
  res.render("admin/dashboard", {
    formerEvents: formerEvents,
    upcomingEvents: upcomingEvents,
    visits: visits
  });
});

//  Details Route
adminRouter.get("/details/:event", checkSignIn, (req, res) => {
  // use res.render to load up an ejs view file
  // admin panel
  res.render("admin/details", {
    formerEvents: formerEvents,
    upcomingEvents: upcomingEvents,
    visits: visits,
    event: req.params.event
  });
});

adminRouter.get("/logout", function(req, res) {
  req.session.destroy(() => {
    // console.log("Admin logged out.");
  });
  res.redirect("/login");
});

module.exports = adminRouter;
