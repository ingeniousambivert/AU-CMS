// Express Server
const express = require("express");
const app = express();
//const multer = require("multer");
//Express-Validator for basic validations
const { check, validationResult } = require("express-validator");

const request = require("request");
// Set the bodyparser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
// Set the view engine to ejs
app.set("view engine", "ejs");
// Use CSS
app.use(express.static(__dirname + "/public"));

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
const events = require("./data/events.json");
const team = require("./data/team.json");
const visits = require("./data/visits.json");

// GET and POST Routes
app.get("/", (req, res) => {
  // use res.render to load up an ejs view file
  // index page
  res.render("pages/index", { succ: false, err: false });
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
  res.render("pages/former", { event: events });
});

app.get("/upcoming", (req, res) => {
  // use res.render to load up an ejs view file
  // upcoming events page
  res.render("pages/upcoming", { succ: false, err: false });
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
  res.render("pages/visit", { visit: visits, vid: visitID });
});

// Participant Registeration

// Alternative approach using FileSystem in Node
// const fs = require("fs");
// fs.readFile("./data/participants.json", (err, data) => {
//   if (err) throw err;
//   let participant = JSON.parse(data);
//   console.log(participant);
// });

const editJsonFile = require("edit-json-file");
let file = editJsonFile("./data/participants.json", {
  autosave: true
});
console.log(file.get());

const user = {
  id: 3,
  name: "Jane Doe",
  email: "jane@doe.com",
  status: "coming"
};

app.post("/register", (req, res) => {
  // fs.readFile("./data/participants.json", (err, data) => {
  //   let json = JSON.parse(data);
  //   json.push(user);
  //   fs.writeFile("./data/participants.json", JSON.stringify(user), function(
  //     err
  //   ) {
  //     if (err) throw err;
  //     console.log('The "data to append" was appended to file!');
  //   });
  // });
  let name = req.body.user_name;
  let email = req.body.user_email;
  file.set("name", name);
  file.set("email", email);
  file.set("status", "coming");
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
    "Express Server listening on port %d in %s mode",
    this.address().port,
    app.settings.env
  );
});
