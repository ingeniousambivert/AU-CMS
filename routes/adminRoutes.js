const express = require("express");
const adminRouter = express.Router();

// Middlewares for Auth
const checkSignIn = require("../middlewares/checkSignIn");
const returnToDash = require("../middlewares/returnToDash");

// Data for views
const formerEvents = require("../data/former-events.json");
const upcomingEvents = require("../data/upcoming-events.json");
const visits = require("../data/industrial-visits.json");

// LowDB for participants list
//See https://github.com/typicode/lowdb for docs
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
// Upcoming Events DB
const upcomingAdapter = new FileSync("./data/upcoming-events.json");
const upcomingDB = low(upcomingAdapter);
// Industrial Visit DB
const industrialAdapter = new FileSync("./data/industrial-visits.json");
const industrialDB = low(industrialAdapter);
// Former Events DB
const formerAdapter = new FileSync("./data/former-events.json");
const formerDB = low(formerAdapter);

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
// Add New Items
adminRouter.post("/details/:event", checkSignIn, (req, res) => {
  // use res.render to load up an ejs view file
  // admin panel
  let checkEvent = req.params.event;

  if (checkEvent == "upcoming") {
    let { titleForUpcoming, briefForUpcoming, detailsForUpcoming } = req.body;
    upcomingDB
      .get("participants")
      .push({
        name: user_name,
        email: user_email,
        phone: user_phone,
        eventID: eventID
      })
      .last()
      .assign({ id: Date.now().toString() })
      .write();
  }

  res.render("admin/details", {
    formerEvents: formerEvents,
    upcomingEvents: upcomingEvents,
    visits: visits,
    event: checkEvent
  });
});

adminRouter.get("/logout", function(req, res) {
  req.session.destroy(() => {
    // console.log("Admin logged out.");
  });
  res.redirect("/login");
});

module.exports = adminRouter;
