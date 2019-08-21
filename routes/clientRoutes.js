const express = require("express");
const request = require("request");
const clientRouter = express.Router();

const moment = require("moment");
// LowDB for participants list
//See https://github.com/typicode/lowdb for docs
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
// Participants DB
const participantAdapter = new FileSync("./data/participants.json");
const participantDB = low(participantAdapter);
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

// Data for views
const team = require("../data/team.json");

//----- CLIENT ROUTES -----//

// GET and POST Routes for the clientRouter
clientRouter.get("/", (req, res) => {
  // use res.render to load up an ejs view file
  // index page

  res.render("pages/index", {
    formerEvents: former,
    swalsucc: false,
    swalerr: false
  });
});

clientRouter.get("/about", (req, res) => {
  // use res.render to load up an ejs view file
  // about page
  res.render("pages/about", {
    team: team,
    swalsucc: false,
    swalerr: false
  });
});

clientRouter.get("/contact", (req, res) => {
  // use res.render to load up an ejs view file
  // contact page
  res.render("pages/contact", {
    swalsucc: false,
    swalerr: false
  });
});

clientRouter.get("/former", (req, res) => {
  // use res.render to load up an ejs view file
  // former events page

  res.render("pages/former", {
    formerEvents: former,
    swalsucc: false,
    swalerr: false
  });
});

clientRouter.get("/upcoming", (req, res) => {
  // use res.render to load up an ejs view file
  // upcoming events page

  res.render("pages/upcoming", {
    upcomingEvents: upcoming,
    swalsucc: false,
    swalerr: false
  });
});

clientRouter.get("/event/:id", (req, res) => {
  // use res.render to load up an ejs view file
  // upcoming event page
  let eventID = req.params.id;

  const event = upcomingDB
    .get("industrial")
    .filter({ id: eventID })
    .value();

  res.render("pages/event", {
    succ: false,
    err: false,
    eID: eventID,
    upcomingEvents: event,
    swalsucc: false,
    swalerr: false
  });
});

clientRouter.get("/chemecar", (req, res) => {
  // use res.render to load up an ejs view file
  // chemecar events page
  res.render("pages/chemecar", {
    swalsucc: false,
    swalerr: false
  });
});

clientRouter.get("/show-tell", (req, res) => {
  // use res.render to load up an ejs view file
  // show and tell events page
  res.render("pages/show-tell", {
    swalsucc: false,
    swalerr: false
  });
});

clientRouter.get("/industrial-visits", (req, res) => {
  // use res.render to load up an ejs view file
  // industrial visits page

  res.render("pages/industrial-visits", {
    visit: industrial,
    swalsucc: false,
    swalerr: false
  });
});

clientRouter.get("/visit/:id", (req, res) => {
  // use res.render to load up an ejs view file
  // individual visit info page
  const visitID = req.params.id;

  const visit = industrialDB
    .get("industrial")
    .map("id")
    .filter({ id: visitID })
    .value();

  res.render("pages/visit", {
    visit: visit,
    vID: visitID,
    swalsucc: false,
    swalerr: false
  });
});

// Participant Registration
clientRouter.post("/event/:id", (req, res) => {
  let { user_name, user_email, user_phone } = req.body;

  let eventID = req.params.id;

  addParticipant = () => {
    participantDB
      .get("participants")
      .push({
        name: user_name,
        email: user_email,
        phone: user_phone,
        registeredOn: moment().format("MMMM Do YYYY, h:mm:ss a"),
        eventID: eventID
      })
      .last()
      .assign({ id: Date.now().toString() })
      .write();
  };
  if (!user_name || !user_email || !user_phone) {
    res.render("pages/event", {
      succ: false,
      err: true,
      eID: eventID,
      upcomingEvents: upcomingEvents,
      swalsucc: false,
      swalerr: false
    });
    res.status(400);
  } else if (user_phone.length < 10) {
    res.render("pages/event", {
      succ: false,
      err: true,
      eID: eventID,
      upcomingEvents: upcomingEvents,
      swalsucc: false,
      swalerr: false
    });
    res.status(400);
  } else {
    let flag = new Boolean(true);
    const isFull = participantDB.has("participants").value();

    const checkEmail = participantDB
      .get("participants")
      .map("email")
      .value();

    checkEmail.forEach(element => {
      if (user_email == element) {
        const checkEvent = participantDB
          .get("participants")
          .filter({ email: user_email })
          .map("eventID")
          .value();
        checkEvent.forEach(element => {
          if (eventID == element) {
            flag = false;
            res.render("pages/event", {
              succ: false,
              err: true,
              eID: eventID,
              upcomingEvents: upcomingEvents,
              swalsucc: false,
              swalerr: false
            });
          }
        });
      }
    });

    if (flag) {
      addParticipant();
      res.render("pages/event", {
        succ: true,
        err: false,
        eID: eventID,
        upcomingEvents: upcomingEvents,
        swalsucc: false,
        swalerr: false
      });
    } else if (isFull == false) {
      addParticipant();
      res.render("pages/event", {
        succ: true,
        err: false,
        eID: eventID,
        upcomingEvents: upcomingEvents,
        swalsucc: false,
        swalerr: false
      });
    } else {
      res.render("pages/event", {
        succ: false,
        err: true,
        eID: eventID,
        upcomingEvents: upcomingEvents,
        swalsucc: false,
        swalerr: false
      });
    }
  }
});
//Newsletter Signup
clientRouter.post("/", (req, res) => {
  const { user_email } = req.body;
  if (!user_email) {
    res.render("pages/index", {
      formerEvents: former,
      swalsucc: false,
      swalerr: true
    });
    res.status(400);
  } else {
    if (res.statusCode == 200) {
      //Mailchimp Integration
      const data = {
        members: [
          {
            email_address: user_email,
            status: "subscribed"
          }
        ]
      };
      const postData = JSON.stringify(data);

      const options = {
        url: "https://us18.api.mailchimp.com/3.0/lists/8bd6f842d1",
        // Temp URL
        // Replace with Owner's list URL

        method: "POST",
        headers: {
          Authorization: "auth dde461ecf68f1bc5df4741297ae870d4-us18"
          // Temp API KEY
          // Replace with Owner's API Key
        },
        body: postData
      };
      request(options, (err, response, body) => {
        console.log(response.statusCode);
        res.statusCode = response.statusCode;
        console.log(`POST REQUEST FOR SUBSCRIBE ${body}`);

        if (res.statusCode == 200) {
          res.render("pages/index", {
            formerEvents: former,
            swalsucc: true,
            swalerr: false
          });
        } else if (
          res.statusCode == 400 ||
          res.statusCode == 401 ||
          res.statusCode == 403
        ) {
          res.render("pages/index", {
            formerEvents: former,
            swalsucc: false,
            swalerr: true
          });
        } else {
          res.status(400);
          res.render("pages/index", {
            formerEvents: former,
            swalsucc: false,
            swalerr: true
          });
        }
      });
    }
  }
});
// clientRouter.post(
//   "/register",
//   [
//     check("user_email")
//       .isEmail()
//       .custom((value, { req }) => {
//         return new Promise((resolve, reject) => {
//           Participant.findOne({ email: req.body.email }, function(
//             err,
//             participant
//           ) {
//             if (err) {
//               reject(console.log("Error"));
//             }
//             if (Boolean(participant)) {
//               reject(console.log("Error in Email"));
//             }
//             resolve(true);
//           });
//         });
//       })
//   ],
//   (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(422).json({ errors: errors.array() });
//     }
//     // Save the participant in MongoDB
//     let name = req.body.user_name;
//     let email = req.body.user_email;
//     const newParticipant = new Participant({
//       name: name,
//       email: email
//     });
//     newParticipant
//       .save()
//       .then(() => {
//         res.render("pages/upcoming", { succ: true, err: false });
//       })
//       .catch(
//         err => console.log(err),
//         () => {
//           res.render("pages/upcoming", { succ: false, err: true });
//         }
//       );
//   }
// );

module.exports = clientRouter;
