// Express App Starts Here
const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

// Set the bodyparser
const bodyParser = require("body-parser");

// Required for authentication
const session = require("express-session");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    key: "admin_key",
    secret: "mySecret",
    proxy: true,
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 3600000 // Time in ms
    }
  })
);

// Set the view engine to ejs
app.set("view engine", "ejs");

// Use CSS and Media
app.use(express.static(__dirname + "/public"));

// Routes for the app
const clientRoutes = require("./routes/clientRoutes");
app.use("/", clientRoutes);

// Routes for Admin Panel
const adminRoutes = require("./routes/adminRoutes");
app.use("/", adminRoutes);

// Listen to the port
app.listen(process.env.PORT || 8000, function() {
  console.log(
    "Express Server - http://localhost:%d in %s mode",
    this.address().port,
    app.settings.env
  );
});
