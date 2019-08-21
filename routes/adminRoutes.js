const express = require("express");
const adminRouter = express.Router();

// Middlewares for Auth
const checkSignIn = require("../middlewares/checkSignIn");
const returnToDash = require("../middlewares/returnToDash");

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

// LowDB Instances
const upcoming = upcomingDB.get("upcoming").value();
const former = formerDB.get("former").value();
const industrial = industrialDB.get("industrial").value();

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
    formerEvents: former,
    upcomingEvents: upcoming,
    visits: industrial
  });
});

//  Details Route
adminRouter.get("/details/:event", checkSignIn, (req, res) => {
  // use res.render to load up an ejs view file
  // admin panel

  res.render("admin/details", {
    formerEvents: former,
    upcomingEvents: upcoming,
    visits: industrial,
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
    formerEvents: former,
    upcomingEvents: upcoming,
    visits: industrial,
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
