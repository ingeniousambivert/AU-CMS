// Server
// Load the things we need
<<<<<<< HEAD
//const nodemailer = require("nodemailer");
//const mailgun = require("mailgun-js");
//const mongo = require("mongoose");
//mongo.connect("mongodb://localhost:27017/AU_DB", { useNewUrlParser: true });
const request = require("request");
const express = require("express");
const app = express();
=======
const nodemailer = require("nodemailer");
const mailgun = require("mailgun-js");
const mongo = require("mongoose");
const env = process.env.PORT;
mongo.connect("mongodb://localhost:27017/AU_DB", { useNewUrlParser: true });

const express = require("express");
const app = express();
const port = env;
>>>>>>> 848e9e63bdf96061604de2388de74dad33ddf68c
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
// Set the view engine to ejs
app.set("view engine", "ejs");
// Use CSS
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  // use res.render to load up an ejs view file
  // index page
  res.render("pages/index");
});

app.get("/about", (req, res) => {
  // use res.render to load up an ejs view file
  // about page
  res.render("pages/about");
});

app.get("/contact", (req, res) => {
  // use res.render to load up an ejs view file
  // contact page
  res.render("pages/contact", { succ: false, err: false });
});

app.get("/events", (req, res) => {
  // use res.render to load up an ejs view file
  // events page
  res.render("pages/events");
});

app.get("/upcoming", (req, res) => {
  // use res.render to load up an ejs view file
  // upcoming events page
  res.render("pages/upcoming");
});

app.get("/former", (req, res) => {
  // use res.render to load up an ejs view file
  // past events page
  res.render("pages/former");
});

app.get("/chemecar", (req, res) => {
  // use res.render to load up an ejs view file
  // chemecar events page
  res.render("pages/chemecar");
});

app.get("/newsletter", (req, res) => {
  // use res.render to load up an ejs view file
  // chemecar events page
  res.render("pages/newsletter");
});

app.get("/show-tell", (req, res) => {
  // use res.render to load up an ejs view file
  // chemecar events page
  res.render("pages/show-tell");
});

app.get("/industrial-visits", (req, res) => {
  // use res.render to load up an ejs view file
  // newsletterpage
  res.render("pages/industrial-visits");
});

//Newsletter

app.post("/newsletter", (req, res) => {
  const { user_fname, user_lname, user_email } = req.body;
  if (!user_fname || !user_email || !user_lname) {
    res.render("pages/newsletter", { succ: false, err: true });
    res.status(400);
  } else {
    if (res.statusCode === 200) {
      //Mailchimp Integration
      const data = {
        members: [
          {
            email_address: user_email,
            status: "subscribed",
            merge_fields: {
              FNAME: user_fname,
              LNAME: user_lname
            }
          }
        ]
      };

      const postData = JSON.stringify(data);

      if (res.statusCode === 200) {
        res.render("pages/newsletter", { succ: true, err: false });
      } else {
        res.status(400);
        res.render("pages/newsletter", { succ: false, err: true });
      }

      const options = {
        url: "https://<DC>.api.mailchimp.com/3.0/lists/8bd6f842d1",
        method: "POST",
        headers: {
          Authorization: "auth deed85fccbcc5e5f0f54d7acb8629242-us18"
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

// Events Requests
// app.post("/parti_reg:event", (req, res) => {
//   const useres = mongo.model("userscollection", Participentschema);

//   const user = new useres({
//     firstname: req.body.firstname,
//     larstname: req.body.larstname,
//     email: req.body.email,
//     eventid: req.params.id
//   });

//   user.save(function(err) {
//     if (err) {
//       console.log(err);
//       // res.render
//     }
//   });
// });

// const Eventschema = new mongo.Schema(
//   {
//     eventid: {
//       type: Number,
//       trim: true,
//       index: true,
//       unique: true,
//       sparse: true
//     },
//     title: String,
//     about: String,
//     startdate: Date,
//     enddate: Date,
//     photo: [String],
//     fee: Number,
//     status: String
//   },
//   { timestamps: true }
// );

// const Adminschema = new mongo.Schema(
//   {
//     firstname: String,
//     larstname: String,
//     email: {
//       type: String,
//       trim: true,
//       index: true,
//       unique: true,
//       sparse: true
//     },
//     password: String,
//     profile: String
//   },
//   { timestamps: true }
// );
// const Participentschema = new mongo.Schema(
//   {
//     firstname: String,
//     larstname: String,
//     email: {
//       type: String,
//       trim: true,
//       index: true,
//       unique: true,
//       sparse: true
//     },
//     eventid: Number
//   },
//   { timestamps: true }
// );
app.listen(process.env.PORT || 8000, function() {
  console.log(
    "Express server listening on port %d in %s mode",
    this.address().port,
    app.settings.env
  );
});
