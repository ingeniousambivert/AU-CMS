const express = require("express");
const adminRouter = express.Router();

const multer = require("multer");
const moment = require("moment");
const path = require("path");

const json2xls = require("json2xls");
adminRouter.use(json2xls.middleware);

const Cryptr = require("cryptr");
const cryptr = new Cryptr("AdminSecretKey");

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(
      null,
      path.resolve(__dirname.replace("routes", "") + "public/img/events/")
    );
  },

  filename: function(req, file, callback) {
    let dateObject = new Date();
    let date = dateObject.getDate();
    let month = dateObject.getMonth() + 1;
    let hour = dateObject.getHours();
    let hourDateMonth = hour + "h" + date + "d" + month + "m";

    callback(
      null,
      file.originalname + "_" + hourDateMonth + path.extname(file.originalname)
    );
  }
});
const fileFilter = function(req, file, callback) {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|JPG|PNG|JPEG|GIF)$/)) {
    return callback(
      new Error("Only jpg|jpeg|png|gif files are allowed."),
      false
    );
  }
  callback(null, true);
};
const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

// Middlewares for Auth
const checkSignIn = require("../middlewares/checkSignIn");
// const returnToDash = require("../middlewares/returnToDash");

// LowDB Instances
//See https://github.com/typicode/lowdb for docs
const low = require("lowdb");
const FileAsync = require("lowdb/adapters/FileAsync");

// Participants DB
const participantAdapter = new FileAsync("./data/participants.json");
// Upcoming Events DB
const upcomingAdapter = new FileAsync("./data/upcoming-events.json");
// Industrial Visit DB
const industrialAdapter = new FileAsync("./data/industrial-visits.json");
// Former Events DB
const formerAdapter = new FileAsync("./data/former-events.json");
// Admins DB
const adminAdapter = new FileAsync("./data/admin-accounts.json");

//----- ADMIN ROUTES -----//

adminRouter.use((req, res, next) => {
  if (req.cookies.admin_key && !req.session.admin) {
    res.clearCookie("admin_key");
  }
  next();
});

low(formerAdapter).then(formerDB => {
  low(participantAdapter).then(participantDB => {
    low(upcomingAdapter).then(upcomingDB => {
      low(industrialAdapter).then(industrialDB => {
        low(adminAdapter).then(adminDB => {
          // LowDB API
          const upcoming = upcomingDB.get("upcoming").value();
          const former = formerDB.get("former").value();
          const industrial = industrialDB.get("industrial").value();

          // Login Route
          adminRouter.get("/login", (req, res) => {
            res.render("admin/login", { warn: false, err: false });
          });

          // Login Route
          adminRouter.post("/login", (req, res) => {
            let { adminUsername, adminPassword } = req.body;
            const checkUsername = adminDB
              .get("admins")
              .filter({ username: adminUsername })
              .map("username")
              .value();
            const checkPassword = adminDB
              .get("admins")
              .filter({ username: adminUsername })
              .map("password")
              .value();

            if (!adminUsername || !adminPassword) {
              res.render("admin/login", {
                warn: false,
                err: true
              });
            } else {
              checkUsername.forEach(element => {
                checkPassword.forEach(item => {
                  if (
                    adminUsername == element &&
                    adminPassword == cryptr.decrypt(item)
                  ) {
                    loginFlag = true;
                    let adminValues = [{ username: adminUsername }];
                    req.session.admin = adminValues;
                    res.redirect("/dashboard");
                  } else {
                    res.render("admin/login", {
                      warn: true,
                      err: false
                    });
                  }
                });
              });
            }
          });

          //  Dashboard Route
          adminRouter.get("/dashboard", checkSignIn, (req, res) => {
            res.render("admin/dashboard", {
              formerEvents: former,
              upcomingEvents: upcoming,
              visits: industrial,
              swalsucc: false,
              swalerr: false
            });
          });

          //  Info Route
          adminRouter.get("/info/", checkSignIn, (req, res) => {
            const participantsToDisplay = participantDB
              .get("participants")
              .value();
            res.render("admin/info", {
              event: req.params.event,
              err: false,
              succ: false,
              all: true,
              upcomingEvents: upcoming,
              participants: participantsToDisplay
            });
          });
          //  Info Route
          adminRouter.get("/info/:event", checkSignIn, (req, res) => {
            const checkEventID = upcomingDB
              .get("upcoming")
              .filter({ title: req.params.event })
              .map("id")
              .value();

            const eventIDforParticipants = checkEventID.toString();

            const participantsToDisplay = participantDB
              .get("participants")
              .filter({ eventID: eventIDforParticipants })
              .value();

            if (!participantsToDisplay) {
              res.render("admin/info", {
                err: true,
                succ: false,
                all: false,
                upcomingEvents: upcoming,
                event: req.params.event
              });
            } else {
              res.render("admin/info", {
                err: false,
                succ: true,
                all: false,
                upcomingEvents: upcoming,
                event: req.params.event,
                participants: participantsToDisplay
              });
            }
          });

          //  Export Participants List
          adminRouter.get(
            "/participants-list-download",
            checkSignIn,
            (req, res) => {
              const participantsList = participantDB
                .get("participants")
                .value();
              res.xls("participantsList.xlsx", participantsList);
            }
          );

          //  Delete Route
          adminRouter.post("/delete/:event", checkSignIn, (req, res) => {
            let itemtoDelete = req.params.event;

            const getUpcoming = upcomingDB
              .get("upcoming")
              .find({ title: itemtoDelete })
              .value();

            const getFormer = formerDB
              .get("former")
              .find({ title: itemtoDelete })
              .value();
            const getIndustrial = industrialDB
              .get("industrial")
              .find({ title: itemtoDelete })
              .value();

            if (!itemtoDelete) {
              res.render("admin/dashboard", {
                formerEvents: former,
                upcomingEvents: upcoming,
                visits: industrial,
                swalsucc: false,
                swalerr: true
              });
            } else if (getUpcoming) {
              upcomingDB
                .get("upcoming")
                .remove({ title: itemtoDelete })
                .write();

              res.render("admin/dashboard", {
                formerEvents: former,
                upcomingEvents: upcoming,
                visits: industrial,
                swalsucc: true,
                swalerr: false
              });
            } else if (getFormer) {
              formerDB
                .get("former")
                .remove({ title: itemtoDelete })
                .write();

              res.render("admin/dashboard", {
                formerEvents: former,
                upcomingEvents: upcoming,
                visits: industrial,
                swalsucc: true,
                swalerr: false
              });
            } else if (getIndustrial) {
              industrialDB
                .get("industrial")
                .remove({ title: itemtoDelete })
                .write();

              res.render("admin/dashboard", {
                formerEvents: former,
                upcomingEvents: upcoming,
                visits: industrial,
                swalsucc: true,
                swalerr: false
              });
            } else {
              res.render("admin/dashboard", {
                formerEvents: former,
                upcomingEvents: upcoming,
                visits: industrial,
                swalsucc: false,
                swalerr: true
              });
            }
          });

          // Modify Route
          adminRouter.get("/modify/:event", checkSignIn, (req, res) => {
            res.render("admin/modify", {
              formerEvents: former,
              upcomingEvents: upcoming,
              industrialVisits: industrial,
              event: req.params.event,
              succ: false,
              err: false
            });
          });

          // Modify Route
          adminRouter.post(
            "/modify/:event",
            checkSignIn,
            upload.array("fileForUpload", 20),
            (req, res) => {
              let checkEvent = req.params.event;
              const getUpcoming = upcomingDB
                .get("upcoming")
                .filter({ key: checkEvent })
                .map("key")
                .value();

              const getFormer = formerDB
                .get("former")
                .filter({ key: checkEvent })
                .map("key")
                .value();

              const getIndustrial = industrialDB
                .get("industrial")
                .filter({ key: checkEvent })
                .map("key")
                .value();

              const upcomingKey = getUpcoming.toString();
              const formerKey = getFormer.toString();
              const industrialKey = getIndustrial.toString();

              let {
                titleForEvent,
                briefForEvent,
                dateForEvent,
                detailsForEvent,
                stagesForEvent
              } = req.body;
              let updatedDate = moment(dateForEvent, "YYYY-MM-DD").format(
                "MMMM Do YYYY"
              );

              let allImages = req.files.map(file => file.filename);

              if (checkEvent == upcomingKey) {
                let allmedia = [];
                let media;
                const img = upcomingDB
                  .get("upcoming")
                  .filter({ key: upcomingKey })
                  .map("images")
                  .value();

                if (img) {
                  allMedia = allImages + "," + img;
                  media = allMedia.split(",");
                } else {
                  allMedia = allImages;
                }

                upcomingDB
                  .get("upcoming")
                  .find({ key: upcomingKey })
                  .assign({
                    title: titleForEvent,
                    date: dateForEvent,
                    displayDate: updatedDate,
                    brief: briefForEvent,
                    images: media,
                    details: detailsForEvent,
                    lastModified: moment().format("MMMM Do YYYY, h:mm:ss a")
                  })
                  .write();
                res.render("admin/modify", {
                  formerEvents: former,
                  upcomingEvents: upcoming,
                  industrialVisits: industrial,
                  event: req.params.event,
                  succ: true,
                  err: false
                });
              } else if (checkEvent == formerKey) {
                let allmedia = [];
                let media;
                const img = formerDB
                  .get("former")
                  .filter({ key: formerKey })
                  .map("images")
                  .value();

                if (img) {
                  allMedia = allImages + "," + img;
                  media = allMedia.split(",");
                } else {
                  allMedia = allImages;
                }

                formerDB
                  .get("former")
                  .find({ key: formerKey })
                  .assign({
                    title: titleForEvent,
                    date: dateForEvent,
                    displayDate: updatedDate,
                    brief: briefForEvent,
                    images: media,
                    details: detailsForEvent,
                    lastModified: moment().format("MMMM Do YYYY, h:mm:ss a")
                  })
                  .write();
                res.render("admin/modify", {
                  formerEvents: former,
                  upcomingEvents: upcoming,
                  industrialVisits: industrial,
                  event: req.params.event,
                  succ: true,
                  err: false
                });
              } else if (checkEvent == industrialKey) {
                let allmedia = [];
                let media;
                const img = upcomingDB
                  .get("upcoming")
                  .filter({ key: upcomingKey })
                  .map("images")
                  .value();

                if (img) {
                  allMedia = allImages + "," + img;
                  media = allMedia.split(",");
                } else {
                  allMedia = allImages;
                }
                industrialDB
                  .get("industrial")
                  .find({ key: industrialKey })
                  .assign({
                    title: titleForEvent,
                    date: dateForEvent,
                    displayDate: updatedDate,
                    stages: stagesForEvent,
                    images: media,
                    details: detailsForEvent,
                    lastModified: moment().format("MMMM Do YYYY, h:mm:ss a")
                  })
                  .write();
                res.render("admin/modify", {
                  formerEvents: former,
                  upcomingEvents: upcoming,
                  industrialVisits: industrial,
                  event: req.params.event,
                  succ: true,
                  err: false
                });
              } else {
                res.render("admin/modify", {
                  formerEvents: former,
                  upcomingEvents: upcoming,
                  industrialVisits: industrial,
                  event: req.params.event,
                  succ: false,
                  err: true
                });
              }
            }
          );

          //  Add Route
          adminRouter.get("/add/:event", checkSignIn, (req, res) => {
            res.render("admin/add", {
              formerEvents: former,
              upcomingEvents: upcoming,
              visits: industrial,
              event: req.params.event,
              succ: false,
              err: false
            });
          });

          // Add New Events
          adminRouter.post(
            "/add/:event",
            checkSignIn,
            upload.array("fileForUpload", 20),
            (req, res) => {
              let checkEvent = req.params.event;
              let time = Date.now().toString();

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
                  !dateForUpcoming ||
                  !req.files
                ) {
                  res.render("admin/add", {
                    formerEvents: former,
                    upcomingEvents: upcoming,
                    visits: industrial,
                    event: checkEvent,
                    succ: false,
                    err: true
                  });
                } else {
                  let allImages = req.files.map(file => file.filename);
                  let updatedDate = moment(
                    dateForUpcoming,
                    "YYYY-MM-DD"
                  ).format("MMMM Do YYYY");
                  upcomingDB
                    .get("upcoming")
                    .push({
                      title: titleForUpcoming,
                      date: dateForUpcoming,
                      displayDate: updatedDate,
                      brief: briefForUpcoming,
                      details: detailsForUpcoming,
                      registeration: "true",
                      active: allImages[0],
                      images: allImages.slice(1),
                      lastModified: moment().format("MMMM Do YYYY, h:mm:ss a"),
                      key: "UPCOMING" + time
                    })
                    .last()
                    .assign({ id: Date.now().toString() })
                    .write();

                  res.render("admin/add", {
                    formerEvents: former,
                    upcomingEvents: upcoming,
                    visits: industrial,
                    event: checkEvent,
                    succ: true,
                    err: false
                  });
                }
              }

              if (checkEvent == "industrial") {
                let {
                  titleForVisit,
                  stagesForVisit,
                  detailsForVisit,
                  dateForVisit
                } = req.body;
                let updatedDate = moment(dateForUpcoming, "YYYY-MM-DD").format(
                  "MMMM Do YYYY"
                );
                if (
                  !titleForVisit ||
                  !stagesForVisit ||
                  !dateForVisit ||
                  !detailsForVisit
                ) {
                  res.render("admin/add", {
                    formerEvents: former,
                    upcomingEvents: upcoming,
                    visits: industrial,
                    event: checkEvent,
                    succ: false,
                    err: true
                  });
                } else {
                  let allImages = req.files.map(file => file.filename);
                  industrialDB
                    .get("industrial")
                    .push({
                      title: titleForVisit,
                      date: dateForVisit,
                      displayDate: updatedDate,
                      stages: [stagesForVisit],
                      details: detailsForVisit,
                      active: allImages[0],
                      images: allImages.slice(1),
                      lastModified: moment().format("MMMM Do YYYY, h:mm:ss a"),
                      key: "VISIT" + time
                    })
                    .last()
                    .assign({ id: time })
                    .write();

                  res.render("admin/add", {
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
                  res.render("admin/add", {
                    formerEvents: former,
                    upcomingEvents: upcoming,
                    visits: industrial,
                    event: checkEvent,
                    succ: false,
                    err: true
                  });
                } else {
                  formerDB
                    .get("former")
                    .push(getUpcoming)
                    .last()
                    .assign({
                      lastModified: moment().format("MMMM Do YYYY, h:mm:ss a")
                    })
                    .write();
                  upcomingDB
                    .get("upcoming")
                    .remove({ title: itemtoMove })
                    .write();

                  res.render("admin/add", {
                    formerEvents: former,
                    upcomingEvents: upcoming,
                    visits: industrial,
                    event: checkEvent,
                    succ: true,
                    err: false
                  });
                }
              }
            }
          );
        });
      });
    });
  });
});

adminRouter.get("/logout", function(req, res) {
  req.session.destroy(() => {
    // console.log("Admin logged out.");
  });
  res.redirect("/login");
});

module.exports = adminRouter;
