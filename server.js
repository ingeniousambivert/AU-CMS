// Express App Starts Here
const express = require("express");
const app = express();
// Set the bodyparser
const bodyParser = require("body-parser");
// Required for authentication
const multer = require("multer");
const upload = multer();
const session = require("express-session");
const cookieParser = require("cookie-parser");

// Middlewares for Auth
const checkSignIn = require("./middlewares/checkSignIn");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array());
app.use(cookieParser());
app.use(
  session({
    secret: "mySecret",
    proxy: true,
    resave: true,
    saveUninitialized: true
  })
);

let admin = [];
// Set the view engine to ejs
app.set("view engine", "ejs");
// Use CSS and Media
app.use(express.static(__dirname + "/public"));

//Routes for the app
const routes = require("./routes/routes");
app.use("/", routes);

//----- ADMIN ROUTES -----//

app.get("/login", (req, res) => {
  // use res.render to load up an ejs view file
  // admin panel
  res.render("admin/login", { succ: false, err: false });
});

//  Dashboard Route
app.post("/login", (req, res) => {
  let { adminUsername, adminPassword } = req.body;

  if (!adminUsername || !adminPassword) {
    res.render("admin/login", {
      succ: false,
      err: true
    });
  } else {
    if (adminUsername == "admin" && adminPassword == "admin") {
      // req.session.admin = admin;
      // console.log(req.body);
      res.redirect("/dashboard");
      // console.log("Admin logged in.");
    } else {
      res.render("admin/login", {
        succ: false,
        err: true
      });
    }
  }
});

//  Dashboard Route
app.get("/dashboard", (req, res) => {
  // use res.render to load up an ejs view file
  // admin panel
  res.render("admin/dashboard");
});

app.get("/logout", function(req, res) {
  req.session.destroy(() => {
    console.log("Admin logged out.");
  });
  res.redirect("/login");
});

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

// Listen to the port
app.listen(process.env.PORT || 8000, function() {
  console.log(
    "Express Server - http://localhost:%d in %s mode",
    this.address().port,
    app.settings.env
  );
});
