// Server
// Load the things we need
//const nodemailer = require("nodemailer");
//const mailgun = require("mailgun-js");
//const mongo = require("mongoose");
//mongo.connect("mongodb://localhost:27017/AU_DB", { useNewUrlParser: true });
const request = require("request");
const crypto = require("crypto");
const express = require("express");
const app = express();
const port = process.env.PORT;
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
app.get("/past", (req, res) => {
  // use res.render to load up an ejs view file
  // past events page
  res.render("pages/past");
});
// Send mails

app.post("/contacted", (req, res) => {
  const { user_email, user_name, user_message, user_subject } = req.body;

  if (!user_subject || !user_name || !user_email || !user_message) {
    res.render("pages/contact", { succ: false, err: true });
    res.status(400);
  } else {
    if (res.statusCode === 200) {
      //Mailgun Integration
      // const mg = mailgun({
      //   apiKey: "key-1db52b12596cfe563b9537f758d9e9f6",
      //   domain:
      //     "https://api.mailgun.net:80/v3/sandbox9b7d586cb9da417b816e89006105f5ed.mailgun.org"
      // });
      // const data = {
      //   from: user_name + " " + user_email,
      //   to: "monarchmaisuriya7600@gmail.com",
      //   subject: user_subject,
      //   text: user_message
      // };
      // mg.messages().send(data, (error, body) => {
      //   if (error) {
      //     console.log("ERROR : " + error);
      //   } else {
      //     console.log("BODY : " + body);
      //     console.log(data);
      //   }=
      // });

      //Mailchimp Integration
      const { firstname, lastname, email } = req.body;
      const data = {
        members: [
          {
            email_address: email,
            status: "subscribed",
            merge_fields: {
              FNAME: firstname,
              LNAME: lastname
            }
          }
        ]
      };

      const postData = JSON.stringify(data);

      if (!firstname || !lastname || !email) {
        res.sendFile(__dirname + "/failed.html");
        res.status(400);
      } else {
        if (res.statusCode === 200) {
          res.sendFile(__dirname + "/success.html");
        } else {
          res.status(400);
          res.sendFile(__dirname + "/failed.html");
        }
      }
      const options = {
        url: "https://<DC>.api.mailchimp.com/3.0/lists/{list_id}",
        method: "POST",
        headers: {
          Authorization: "auth api_key"
        },
        body: postData
      };

      request(options, (err, response, body) => {
        console.log(response.statusCode);
        console.log(`POST REQUEST FOR SUBSCRIBE ${body}`);
      });

      res.render("pages/contact", { succ: true, err: false });
    } else {
      res.status(400);
      res.render("pages/contact", { succ: false, err: true });
    }
  }
});

// Events Requests
app.post("/parti_reg:event", (req, res) => {
  const useres = mongo.model("userscollection", Participentschema);

  const user = new useres({
    firstname: req.body.firstname,
    larstname: req.body.larstname,
    email: req.body.email,
    eventid: req.params.id
  });

  user.save(function(err) {
    if (err) {
      console.log(err);
      // res.render
    }
  });
});

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

app.listen(port, () => console.log(`Server running on port : ${port}`));
