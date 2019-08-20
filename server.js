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

//Routes for the app
const routes = require("./routes/routes");
app.use("/", routes);

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
