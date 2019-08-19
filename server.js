// Express App Starts Here
const express = require("express");
const app = express();

//Express-Validator for basic validations
//const { check, validationResult } = require("express-validator");

const request = require("request");
// Set the bodyparser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
// Set the view engine to ejs
app.set("view engine", "ejs");
// Use CSS and Media
app.use(express.static(__dirname + "/public"));

// Create database instance for LowDB
//See https://github.com/typicode/lowdb
// DB for participants list
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("./data/participants.json");
const pDB = low(adapter);

// DB Config
// const mongoose = require("mongoose");
// const db = "mongodb://localhost:27017/AU_DB";

// // Connect to MongoDB
// mongoose
//   .connect(db, { useNewUrlParser: true })
//   .then(() => console.log("MongoDB connected successfully"))
//   .catch(err => console.log(err));
// Load Participant model
//const Participant = require("./models/participant.model");

// Data for views
const formerEvents = require("./data/former-events.json");
const upcomingEvents = require("./data/upcoming-events.json");
const team = require("./data/team.json");
const visits = require("./data/industrial-visits.json");

// GET and POST Routes for the App
app.get("/", (req, res) => {
  // use res.render to load up an ejs view file
  // index page
  res.render("pages/index", {
    succ: false,
    err: false,
    formerEvents: formerEvents
  });
});

app.get("/about", (req, res) => {
  // use res.render to load up an ejs view file
  // about page
  res.render("pages/about", { team: team });
});

app.get("/contact", (req, res) => {
  // use res.render to load up an ejs view file
  // contact page
  res.render("pages/contact");
});

app.get("/former", (req, res) => {
  // use res.render to load up an ejs view file
  // former events page
  res.render("pages/former", { formerEvents: formerEvents });
});

app.get("/upcoming", (req, res) => {
  // use res.render to load up an ejs view file
  // upcoming events page
  res.render("pages/upcoming", { upcomingEvents: upcomingEvents });
});

app.get("/event/:id", (req, res) => {
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

app.get("/chemecar", (req, res) => {
  // use res.render to load up an ejs view file
  // chemecar events page
  res.render("pages/chemecar");
});

app.get("/show-tell", (req, res) => {
  // use res.render to load up an ejs view file
  // show and tell events page
  res.render("pages/show-tell");
});

app.get("/industrial-visits", (req, res) => {
  // use res.render to load up an ejs view file
  // industrial visits page
  res.render("pages/industrial-visits", { visit: visits });
});

app.get("/visit/:id", (req, res) => {
  // use res.render to load up an ejs view file
  // individual visit info page
  let visitID = req.params.id;
  res.render("pages/visit", { visit: visits, vID: visitID });
});

// Participant Registration
app.post("/event/:id", (req, res) => {
  let name = req.body.user_name;
  let email = req.body.user_email;
  let eventID = req.params.id;

  addParticipant = () => {
    pDB
      .get("participants")
      .push({ name: name, email: email })
      .last()
      .assign({ id: Date.now().toString() })
      .write();
  };

  let flag = new Boolean(true);
  const isFull = pDB.has("participants").value();
  const check = pDB
    .get("participants")
    .map("email")
    .value();

  check.forEach(element => {
    if (email == element) {
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
});

// app.post(
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

//Admin panel
app.get("/adminpanel", (req, res) => {
  // use res.render to load up an ejs view file
  // contact page
  res.render("adminform/admin");
});

app.get("/adminpanel/addevent", (req, res) => {
  // use res.render to load up an ejs view file
  // contact page
  res.render("adminform/addevent");
});

//Newsletter
app.post("/", (req, res) => {
  const { user_email } = req.body;
  if (!user_email) {
    res.render("pages/newsletter", { succ: false, err: true });
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

      if (res.statusCode === 200) {
        res.render("pages/index", { succ: true, err: false });
      } else {
        res.status(400);
        res.render("pages/index", { succ: false, err: true });
      }

      const options = {
        url: "https://us18.api.mailchimp.com/3.0/lists/8bd6f842d1",
        // Temp URL
        // Replace with Owner's lists
        method: "POST",
        headers: {
          Authorization: "auth deed85fccbcc5e5f0f54d7acb8629242-us18"
          // Temp API KEY
          // Replace with Owner's API Key
        },
        body: postData
      };

      request(options, (err, response, body) => {
        console.log(response.statusCode);
        console.log(`POST REQUEST FOR SUBSCRIBE ${body}`);
      });
    }
  }
});

app.listen(process.env.PORT || 8000, function() {
  console.log(
    "Express Server - http://localhost:%d in %s mode",
    this.address().port,
    app.settings.env
  );
});
