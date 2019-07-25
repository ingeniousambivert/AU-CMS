// Server
// Load the things we need
const express = require("express");
const app = express();
const port = 8000;
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
  // index page
  res.render("pages/about");
});
app.get("/contact", (req, res) => {
  // use res.render to load up an ejs view file
  // index page
  res.render("pages/contact");
});
app.get("/events", (req, res) => {
  // use res.render to load up an ejs view file
  // index page
  res.render("pages/events");
});

app.listen(port, () => console.log(`Server running on port : ${port}`));
