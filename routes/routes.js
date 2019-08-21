const express = require("express");
const request = require("request");
const router = express.Router();

// LowDB for participants list
//See https://github.com/typicode/lowdb for docs

const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("./data/participants.json");
const pDB = low(adapter);
// Data for views
const formerEvents = require("../data/former-events.json");
const upcomingEvents = require("../data/upcoming-events.json");
const team = require("../data/team.json");
const visits = require("../data/industrial-visits.json");

//----- CLIENT ROUTES -----//

// GET and POST Routes for the router
router.get("/", (req, res) => {
  // use res.render to load up an ejs view file
  // index page
  res.render("pages/index", {
    succ: false,
    err: false,
    formerEvents: formerEvents
  });
});

router.get("/about", (req, res) => {
  // use res.render to load up an ejs view file
  // about page
  res.render("pages/about", { team: team });
});

router.get("/contact", (req, res) => {
  // use res.render to load up an ejs view file
  // contact page
  res.render("pages/contact");
});

router.get("/former", (req, res) => {
  // use res.render to load up an ejs view file
  // former events page
  res.render("pages/former", { formerEvents: formerEvents });
});

router.get("/upcoming", (req, res) => {
  // use res.render to load up an ejs view file
  // upcoming events page
  res.render("pages/upcoming", { upcomingEvents: upcomingEvents });
});

router.get("/event/:id", (req, res) => {
  // use res.render to load up an ejs view file
  // upcoming event page
  let eventID = req.params.id;
  res.render("pages/event", {
    succ: false,
    err: false,
    eID: eventID,
    upcomingEvents: upcomingEvents
  });
});

router.get("/chemecar", (req, res) => {
  // use res.render to load up an ejs view file
  // chemecar events page
  res.render("pages/chemecar");
});

router.get("/show-tell", (req, res) => {
  // use res.render to load up an ejs view file
  // show and tell events page
  res.render("pages/show-tell");
});

router.get("/industrial-visits", (req, res) => {
  // use res.render to load up an ejs view file
  // industrial visits page
  res.render("pages/industrial-visits", { visit: visits });
});

router.get("/visit/:id", (req, res) => {
  // use res.render to load up an ejs view file
  // individual visit info page
  let visitID = req.params.id;
  res.render("pages/visit", { visit: visits, vID: visitID });
});

// Participant Registration
router.post("/event/:id", (req, res) => {
  let { user_email, user_name, user_phone } = req.body;
  let eventID = req.params.id;

  addParticipant = () => {
    pDB
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
  };
  if (!name || !email) {
    res.render("pages/event", {
      succ: false,
      err: true,
      eID: eventID,
      upcomingEvents: upcomingEvents
    });
    res.status(400);
  } else {
    let flag = new Boolean(true);
    const isFull = pDB.has("participants").value();

    const checkEvent = pDB
      .get("participants")
      .map("eventID")
      .value();

    const checkEmail = pDB
      .get("participants")
      .map("email")
      .value();

    checkEmail.forEach(element => {
      if (email == element && eventID == eventID) {
        flag = false;
        res.render("pages/event", {
          succ: false,
          err: true,
          eID: eventID,
          upcomingEvents: upcomingEvents
        });
      }
    });
    if (flag) {
      addParticipant();
      res.render("pages/event", {
        succ: true,
        err: false,
        eID: eventID,
        upcomingEvents: upcomingEvents
      });
    } else if (isFull == false) {
      addParticipant();
      res.render("pages/event", {
        succ: true,
        err: false,
        eID: eventID,
        upcomingEvents: upcomingEvents
      });
    } else {
      res.render("pages/event", {
        succ: false,
        err: true,
        eID: eventID,
        upcomingEvents: upcomingEvents
      });
    }
  }
});

//Newsletter Signup
router.post("/", (req, res) => {
  const { user_email } = req.body;
  if (!user_email) {
    res.render("pages/index", {
      succ: false,
      err: true,
      formerEvents: formerEvents
    });
    res.status(400);
  } else {
    if (res.statusCode === 200) {
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
        console.log(`POST REQUEST FOR SUBSCRIBE ${body}`);
      });

      if (res.statusCode === 200) {
        res.render("pages/index", {
          succ: true,
          err: false,
          formerEvents: formerEvents
        });
      } else {
        res.status(400);
        res.render("pages/index", {
          succ: false,
          err: true,
          formerEvents: formerEvents
        });
      }
    }
  }
});

// router.post(
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

module.exports = router;
