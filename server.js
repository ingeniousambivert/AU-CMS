// Server Code

const express = require("express");
const app = express();

const request = require("request");
// Set the bodyparser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
// Set the view engine to ejs
app.set("view engine", "ejs");
// Use CSS
app.use(express.static(__dirname + "/public"));
// DB Config
const mongoose = require("mongoose");
const db = "mongodb://localhost:27017/AU_DB";

// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.log(err));

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

app.listen(process.env.PORT || 8000, function() {
  console.log(
    "Express server listening on port %d in %s mode",
    this.address().port,
    app.settings.env
  );
});
