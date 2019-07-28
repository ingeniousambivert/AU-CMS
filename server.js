// Server
// Load the things we need
var nodemailer = require("nodemailer");
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
  res.render("pages/upcoming");
});

app.post("/contacted", (req, res) => {
  let name = req.body.name;
  let email = req.body.email;
  let subject = req.body.subject;
  let message = req.body.message;

  if (req.body) {
    res.render("pages/contact", { succ: true, err: false });
  } else {
    res.render("pages/contact", { succ: false, err: true });
  }
});
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
