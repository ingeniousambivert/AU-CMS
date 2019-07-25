// Server
// load the things we need
const express = require("express");
const app = express();
const port = 8000;
// set the view engine to ejs
app.set("view engine", "ejs");
app.get("/", (req, res) => {
  // use res.render to load up an ejs view file
  // index page
  res.render("/pages/index");
});

app.listen(port, () => console.log(`Example app listening on port ${port}`));
