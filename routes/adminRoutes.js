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
adminRouter.get("/modify/:event", checkSignIn, (req, res) => {
  // use res.render to load up an ejs view file
  // admin panel

  res.render("admin/modify", {
    formerEvents: former,
    upcomingEvents: upcoming,
    visits: industrial,
    event: req.params.event,
    succ: false,
    err: false
  });
});

// Add New Items
adminRouter.post("/modify/:event", checkSignIn, (req, res) => {
  // use res.render to load up an ejs view file
  // admin panel
  let checkEvent = req.params.event;

  // For Upcoming Events

  if (checkEvent == "upcoming") {
    let {
      titleForUpcoming,
      briefForUpcoming,
      detailsForUpcoming,
      dateForUpcoming
    } = req.body;
    if (
      !titleForUpcoming ||
      !briefForUpcoming ||
      !detailsForUpcoming ||
      !dateForUpcoming
    ) {
      res.render("admin/modify", {
        formerEvents: former,
        upcomingEvents: upcoming,
        visits: industrial,
        event: checkEvent,
        succ: false,
        err: true
      });
      //res.status(400);
    } else {
      upcomingDB
        .get("upcoming")
        .push({
          title: titleForUpcoming,
          date: dateForUpcoming,
          brief: briefForUpcoming,
          details: detailsForUpcoming
        })
        .last()
        .assign({ id: Date.now().toString() })
        .write();

      res.render("admin/modify", {
        formerEvents: former,
        upcomingEvents: upcoming,
        visits: industrial,
        event: checkEvent,
        succ: true,
        err: false
      });
    }
  }

  // For Industrial Visits

  if (checkEvent == "industrial") {
    let {
      titleForVisit,
      stagesForVisit,
      detailsForVisit,
      dateForVisit
    } = req.body;

    let time = Date.now().toString();

    if (
      !titleForVisit ||
      !stagesForVisit ||
      !dateForVisit ||
      !detailsForVisit
    ) {
      res.render("admin/modify", {
        formerEvents: former,
        upcomingEvents: upcoming,
        visits: industrial,
        event: checkEvent,
        succ: false,
        err: true
      });
      // res.status(400);
    } else {
      industrialDB
        .get("industrial")
        .push({
          title: titleForVisit,
          date: dateForVisit,
          stages: [stagesForVisit],
          details: detailsForVisit,
          key: "IV" + time
        })
        .last()
        .assign({ id: time })
        .write();

      res.render("admin/modify", {
        formerEvents: former,
        upcomingEvents: upcoming,
        visits: industrial,
        event: checkEvent,
        succ: true,
        err: false
      });
    }
  }

  // For Former Events

  if (checkEvent == "former") {
    let { itemtoMove } = req.body;
    const getUpcoming = upcomingDB
      .get("upcoming")
      .find({ title: itemtoMove })
      .value();

    if (!itemtoMove) {
      res.render("admin/modify", {
        formerEvents: former,
        upcomingEvents: upcoming,
        visits: industrial,
        event: checkEvent,
        succ: false,
        err: true
      });
      // res.status(400);
    } else {
      upcomingDB
        .get("upcoming")
        .remove({ title: itemtoMove })
        .write();

      formerDB
        .get("former")
        .push(getUpcoming)
        .write();

      res.render("admin/modify", {
        formerEvents: former,
        upcomingEvents: upcoming,
        visits: industrial,
        event: checkEvent,
        succ: true,
        err: false
      });
    }
  }
});

adminRouter.get("/logout", function(req, res) {
  req.session.destroy(() => {
    // console.log("Admin logged out.");
  });
  res.redirect("/login");
});

module.exports = adminRouter;
