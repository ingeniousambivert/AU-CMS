const express = require("express");
const request = require("request");
const clientRouter = express.Router();

const moment = require("moment");

// LowDB Instances
//See https://github.com/typicode/lowdb for docs
const low = require("lowdb");
const FileAsync = require("lowdb/adapters/FileAsync");

// Data for views

// Participants DB
const participantAdapter = new FileAsync("./data/participants.json");
// Upcoming Events DB
const upcomingAdapter = new FileAsync("./data/upcoming-events.json");
// Industrial Visit DB
const industrialAdapter = new FileAsync("./data/industrial-visits.json");
// Former Events DB
const formerAdapter = new FileAsync("./data/former-events.json");
// Team DB
const team = require("../data/team.json");

//----- CLIENT ROUTES -----//

low(formerAdapter).then(formerDB => {
  let flag = false;
  //Newsletter Signup
  clientRouter.post("/", (req, res) => {
    const { user_email } = req.body;
    if (!user_email) {
      res.render("pages/index", {
        formerEvents: former,
        swalsucc: false,
        swalerr: true
      });
      res.status(400);
    } else {
      if (res.statusCode == 200) {
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

        const options = {
          url: process.env.API_URL,
          method: "POST",
          headers: {
            Authorization: process.env.API_KEY
          },
          body: postData
        };
        request(options, (err, response, body) => {
          console.log(response.statusCode);
          res.statusCode = response.statusCode;
          console.log(`POST REQUEST FOR SUBSCRIBE ${body}`);

          if (res.statusCode == 200) {
            res.redirect("/subscribed");
            flag = true;
          } else if (
            res.statusCode == 400 ||
            res.statusCode == 401 ||
            res.statusCode == 403
          ) {
            flag = false;
            res.redirect("/failed");
          } else {
            flag = false;
            res.status(400);
            res.redirect("/failed");
          }
        });
      }
    }
  });
  // Index Route
  clientRouter.get("/subscribed", (req, res) => {
    const former = formerDB
      .get("former")
      .orderBy("date", "desc")
      .value();
    if (flag == true) {
      res.render("pages/index", {
        formerEvents: former,
        swalsucc: true,
        swalerr: false
      });
    } else {
      res.redirect("/");
    }
  });
  // Index Route
  clientRouter.get("/failed", (req, res) => {
    const former = formerDB
      .get("former")
      .orderBy("date", "desc")
      .value();
    if (flag == false) {
      res.render("pages/index", {
        formerEvents: former,
        swalsucc: false,
        swalerr: true
      });
    }
  });
  // Index Route
  clientRouter.get("/", (req, res) => {
    const former = formerDB
      .get("former")
      .orderBy("date", "desc")
      .value();
    res.render("pages/index", {
      formerEvents: former,
      swalsucc: false,
      swalerr: false
    });
  });

  // Former Route
  clientRouter.get("/former", (req, res) => {
    const former = formerDB
      .get("former")
      .orderBy("date", "desc")
      .value();
    res.render("pages/former", {
      formerEvents: former,
      swalsucc: false,
      swalerr: false
    });
  });
});

// About Route
clientRouter.get("/about", (req, res) => {
  res.render("pages/about", {
    team: team,
    swalsucc: false,
    swalerr: false
  });
});

// Contact Route
clientRouter.get("/contact", (req, res) => {
  res.render("pages/contact", {
    swalsucc: false,
    swalerr: false
  });
});

low(upcomingAdapter).then(upcomingDB => {
  // Event Route
  clientRouter.get("/event/:id", (req, res) => {
    let eID = req.params.id;
    const event = upcomingDB
      .get("upcoming")
      .filter({
        id: eID
      })
      .value();

    res.render("pages/event", {
      succ: false,
      err: false,
      eventID: eID,
      upcomingEvents: event,
      swalsucc: false,
      swalerr: false
    });
  });

  // Upcoming Route
  clientRouter.get("/upcoming", (req, res) => {
    const upcoming = upcomingDB
      .get("upcoming")
      .orderBy("date", "desc")
      .value();

    res.render("pages/upcoming", {
      upcomingEvents: upcoming,
      swalsucc: false,
      swalerr: false
    });
  });
});

// RSC
clientRouter.get("/rsc", (req, res) => {
  res.render("pages/rsc", {
    swalsucc: false,
    swalerr: false
  });
});

// Show & Tell Route
clientRouter.get("/show-tell", (req, res) => {
  res.render("pages/show-tell", {
    swalsucc: false,
    swalerr: false
  });
});

low(industrialAdapter).then(industrialDB => {
  // Individual Visit Route
  clientRouter.get("/visit/:id", (req, res) => {
    const visitID = req.params.id;
    const visit = industrialDB
      .get("industrial")
      .filter({
        id: visitID
      })
      .value();

    res.render("pages/visit", {
      visit: visit,
      vID: visitID,
      swalsucc: false,
      swalerr: false
    });
  });

  // Industrial Visit Route
  clientRouter.get("/industrial-visits", (req, res) => {
    const industrial = industrialDB
      .get("industrial")
      .orderBy("date", "desc")
      .value();
    res.render("pages/industrial-visits", {
      visit: industrial,
      swalsucc: false,
      swalerr: false
    });
  });
});

// Participant Registration
low(participantAdapter).then(participantDB => {
  low(upcomingAdapter).then(upcomingDB => {
    // Event Route
    clientRouter.post("/event/:id", (req, res) => {
      let { user_fname, user_lname, user_email, user_phone } = req.body;
      const upcomingEvents = upcomingDB.get("upcoming").value();
      let eID = req.params.id;
      let time = Date.now().toString();

      addParticipant = () => {
        participantDB
          .get("participants")
          .push({
            name: user_fname + " " + user_lname,
            email: user_email,
            phone: user_phone,
            date: moment().format("MMMM Do YYYY, h:mm:ss a"),
            eventID: eID,
            id: time,
            key: "PARTICIPANT" + time
          })
          .write();
      };
      if (!user_fname || !user_lname || !user_email || !user_phone) {
        res.render("pages/event", {
          succ: false,
          err: "Please enter all the fields",
          eventID: eID,
          upcomingEvents: upcomingEvents,
          swalsucc: false,
          swalerr: false
        });
      } else if (user_phone.length < 10) {
        return res.render("pages/event", {
          succ: false,
          err: "Please enter a valid phone number",
          eventID: eID,
          upcomingEvents: upcomingEvents,
          swalsucc: false,
          swalerr: false
        });
      } else {
        let flag = new Boolean(true);
        const isFull = participantDB.has("participants").value();

        const checkEmail = participantDB
          .get("participants")
          .map("email")
          .value();

        checkEmail.forEach(element => {
          if (user_email == element) {
            const checkEvent = participantDB
              .get("participants")
              .filter({ email: user_email })
              .map("eventID")
              .value();
            checkEvent.forEach(element => {
              if (eID == element) {
                flag = false;
                return res.render("pages/event", {
                  succ: false,
                  err: "This E-mail has already been registered",
                  eventID: eID,
                  upcomingEvents: upcomingEvents,
                  swalsucc: false,
                  swalerr: false
                });
              }
            });
          }
        });

        if (flag) {
          addParticipant();
          return res.render("pages/event", {
            succ: true,
            err: false,
            eventID: eID,
            upcomingEvents: upcomingEvents,
            swalsucc: false,
            swalerr: false
          });
        } else if (isFull == false) {
          addParticipant();
          return res.render("pages/event", {
            succ: true,
            err: false,
            eventID: eID,
            upcomingEvents: upcomingEvents,
            swalsucc: false,
            swalerr: false
          });
        } else {
          return res.render("pages/event", {
            succ: false,
            err: "An error has occurred",
            eventID: eID,
            upcomingEvents: upcomingEvents,
            swalsucc: false,
            swalerr: false
          });
        }
      }
    });
  });
});

module.exports = clientRouter;
