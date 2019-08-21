const express = require("express");
const request = require("request");
const clientRouter = express.Router();

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

// GET and POST Routes for the clientRouter
clientRouter.get("/", (req, res) => {
  // use res.render to load up an ejs view file
  // index page
  res.render("pages/index", {
    formerEvents: formerEvents,
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
    formerEvents: formerEvents,
    swalsucc: false,
    swalerr: false
  });
});

clientRouter.get("/upcoming", (req, res) => {
  // use res.render to load up an ejs view file
  // upcoming events page
  res.render("pages/upcoming", {
    upcomingEvents: upcomingEvents,
    swalsucc: false,
    swalerr: false
  });
});

clientRouter.get("/event/:id", (req, res) => {
  // use res.render to load up an ejs view file
  // upcoming event page
  let eventID = req.params.id;
  res.render("pages/event", {
    succ: false,
    err: false,
    eID: eventID,
    upcomingEvents: upcomingEvents,
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
    visit: visits,
    swalsucc: false,
    swalerr: false
  });
});

clientRouter.get("/visit/:id", (req, res) => {
  // use res.render to load up an ejs view file
  // individual visit info page
  let visitID = req.params.id;
  res.render("pages/visit", {
    visit: visits,
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
    const isFull = pDB.has("participants").value();

    const checkEmail = pDB
      .get("participants")
      .map("email")
      .value();

    checkEmail.forEach(element => {
      if (user_email == element) {
        const checkEvent = pDB
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
      formerEvents: formerEvents,
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
          Authorization: "auth 7y978y4rhiuwjbhdafiy"
          // Temp API KEY
          // dde461ecf68f1bc5df4741297ae870d4-us18
          // Replace with Owner's API Key
        },
        body: postData
      };
      request(options, (err, response, body) => {
        res.statusCode = response.statusCode;
        if (err) {
          console.log(`ERROR : ${err}`);
        }
        console.log(`LOG : ${body}`);
      });

      if (res.statusCode == 200) {
        res.render("pages/index", {
          formerEvents: formerEvents,
          swalsucc: true,
          swalerr: false
        });
      } else if (
        res.statusCode == 400 ||
        res.statusCode == 401 ||
        res.statusCode == 403
      ) {
        res.render("pages/index", {
          formerEvents: formerEvents,
          swalsucc: false,
          swalerr: true
        });
      } else {
        res.status(400);
        res.render("pages/index", {
          formerEvents: formerEvents,
          swalsucc: false,
          swalerr: true
        });
      }
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
