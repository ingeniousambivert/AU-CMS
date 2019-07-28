// Server
// Load the things we need
const nodemailer = require("nodemailer");
const mailgun = require("mailgun-js");
const mongo = require("mongoose");
mongo.connect("mongodb://localhost:27017/AU_DB", { useNewUrlParser: true });

const express = require("express");
const app = express();
const port = 8000;
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
  res.render("pages/past");
});
app.get("/past", (req, res) => {
  // use res.render to load up an ejs view file
  // past events page
  res.render("pages/upcoming");
});
// Send mails

app.post("/contacted", (req, res) => {
  const { user_email, user_name, user_message, user_subject } = req.body;

  if (!user_subject || !user_name || !user_email || !user_message) {
    res.render("pages/contact", { succ: false, err: true });
    res.status(400);
  } else {
    if (res.statusCode === 200) {
      res.render("pages/contact", { succ: true, err: false });
    } else {
      res.status(400);
      res.render("pages/contact", { succ: false, err: true });
    }
  }
  const mg = mailgun({
    apiKey: "key-1db52b12596cfe563b9537f758d9e9f6",
    domain:
      "https://api.mailgun.net:80/v3/sandbox9b7d586cb9da417b816e89006105f5ed.mailgun.org"
  });
  const data = {
    from: user_name + " " + user_email,
    to: "monarchmaisuriya7600@gmail.com",
    subject: user_subject,
    text: user_message
  };
  mg.messages().send(data, (error, body) => {
    if (error) {
      console.log("ERROR : " + error);
    } else {
      console.log("BODY : " + body);
    }
  });
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

const Eventschema = new mongo.Schema(
  {
    eventid: {
      type: Number,
      trim: true,
      index: true,
      unique: true,
      sparse: true
    },
    title: String,
    about: String,
    startdate: Date,
    enddate: Date,
    photo: [String],
    fee: Number,
    status: String
  },
  { timestamps: true }
);

const Adminschema = new mongo.Schema(
  {
    firstname: String,
    larstname: String,
    email: {
      type: String,
      trim: true,
      index: true,
      unique: true,
      sparse: true
    },
    password: String,
    profile: String
  },
  { timestamps: true }
);
const Participentschema = new mongo.Schema(
  {
    firstname: String,
    larstname: String,
    email: {
      type: String,
      trim: true,
      index: true,
      unique: true,
      sparse: true
    },
    eventid: Number
  },
  { timestamps: true }
);

app.listen(port, () => console.log(`Server running on port : ${port}`));
