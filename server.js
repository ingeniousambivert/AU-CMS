// Express Server
const express = require("express");
const app = express();
//const multer = require("multer");
//Express-Validator for basic validations
const { check, validationResult } = require("express-validator");

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
// Load Participant model
const Participant = require("./models/participant.model");

let pastevents=[{
    id:1,
    title:"Inaugration",
    Date:"29th August 2018",
    details:"It was the first event of AIChE Ahmedabad University student chapter on 29thAugust 2018. We had welcome Dr. Jaimin Vasa who is President of Gujarat Chamber of commerce and industry and Dr. Unnat Pandit who is head of operation Atal Innovation Mission. Both of our chief guest’s gave an insight about the future of chemical engineers and the developing field. It was followed by our Dean Dr Sunil Kale who was so glad to have these two legends in our campus.",
    images:["1_2"],
    active:"1_1" 
},

{
  id:2,
  title:"PUBGe",
  Date:"29th August 2018",
  details:"After Inauguration we had organized an event which was based on the most additive game of all time i.e. PUBG. In this event it was a mixture of treasure hunt with PUBG elements and chemistry. This was planning to be a great event and a huge event where exact 100 students participated. All the 4 years were invited and the whole campus was the playfield. We had a total of 20~30 Volunteers and only because of them It was possible.<br>Students were overwhelmed with the management and they were glad they could participate in an event like this.",
  images:[],
  active:"2_1",
  review:[{author:"Mitul Jain (4th Year Chemical Engineer)",data:"It was one of the best events I had ever seen in my 4 years of Ahmedabad university no club in our college was able to manage or create an event like this"},
          {data:"The management was mind blowing even though I was a volunteer I could see the excitement among students",author:"Henil Vora "}
] 
},
{
  id:3,
  title:"Annual General Meeting",
  Date:"10th October 2018",
  details:"The main goal towards this event was to spread awareness against all the AIChE awards, special events, SAChE Certificates and etc.This meeting was an eye opener for many members as they had no clue on what all AIChE has to offer and what all they can do improve their CV and resume.  But our main topics for the discussion in this were ChemECar competition and RSC, there were 5-6 people who went to RSC held in VIT Pune the following year and they all were sharing their feelings.",
  images:[],
  active:"3_1",
  review:[{author:"Yash Makwana",data:"We really understood a lot and could learn about how to make our fellow membership useful for ourselves"},
          ] 
},{
  id:4,
  title:"Inter Batch cricket tournament",
  Date:"4th March 2019",
  details:"We want our student to do some exercise and play sports so that it can help them to maintain their body and reduce the stress from studies. Sports can teach them teamwork and leadership quality, which enhance them during their academy period. So we started with the most prominent game among the student i.e. Cricket tournament. It was great game among the students. We had also invited alumina students to join with us. At the end of the game, the boys from third year had played well in all the three formats of the i.e. on field, batting and bowling and they were the front-runners in interbatch cricket tournament.",
  images:["4_1"],
  active:["4_2"],
  
},{
  id:5,
  title:"Farewell",
  Date:"7th April 2019",
  details:"The farewell ceremony was arranged in honour of the outgoing fourth year students of chemical engineering. The students of first and second years had shown enthusiasm in arranging the farewell for their seniors. The thing is that “we have got the best senior who can give best advice to us at every movement of our life”. So it was our responsibility to give our best effort to make the farewell more memorable. We had planned for the dinner and some games for them to make their night more shining. They had shared their best memories, which they have done in their college life.  We had captured some beautiful memories with them, which we would never forget in our life. ",
  active:"5_1",
  images:["5_2","5_3"]

}

];


let team=[
  {
    name:"Darshan Bhai",
    pos:"President",
    about:'“Exceptionally committed with visionary leadership brings miracles.” To provide opportunities to all member students & everyone that connects with us to grow together & bring the best out of them.',
    image:"darshan.jpg",
  },{
    name:"HET BABOO",
    pos:"Vice President",
    about:'“I am a lighthouse rather than a lifeboat; I prefer to help people find their way to the destination rather than saving them”.Our main motto for this year Is to strive for progress rather than perfection. Being associated with AIChE chapter from the start has made me grown into a whole new person. We at AIChE AU always strive to be better every day with every stepping stones.',
    image:"het.jpg"
  },{
    name:"Mansi Yadav",
    pos:"Secretary",
    about:'"Always go with the choice that scares you the most, because thats the one that is going to help you grow." To be a part of the team is not an easy task, it requires patience and most of all hardwork. But at the end what makes you grow is doing those things which require constant efforts.So here I am, wanting myself and my team to grow together.',
    image:"mansi.jpg"
  },
  {
    name:"Jaydip Parmar",
    pos:"Treasurer",
    about:'Life is full of treasure and unrevealed secrets and we are treasurer to reveal all things. sometimes when you are in darkness you think that you have been burried but actually you have been planted for great purpose. so, look for something positive in each day even if some days you have to look a little harder',
    image:"jaydip.jpg"

  },{
    name:"Parth Patel",
    pos:"Events Head",
    about:'Since the inauguration of AIChE Ahmedabad university student chapter I was an active member of the events executive committee. I had helped my committee throughout the year in executing many events. We had organised many cultural, technical and sports events throughout the year and I want to continue this in much better way in next year too. I genuinely believe “ Events are the backbone of your chapter, when your events are successful it will spontaneously reflect your hard work “. As a result, of exceptional thought and being an active member of our chapter I had been elected as new events head at AIChE Ahmedabad University and also selected in Executive students committee (ESC) of AIChE.',
    image:"parth.jpg"
  },{
    name:"Yash Makwana",
    pos:"Promotion Head",
    about:'As a Promotion Head have a grasp on Social Media and interaction is must. On the Social Media you have to show the brain and hard work of the people to motivate as well as to be recognise in the big yet small world.',
    image:"yash.jpg"
  },{
    name:"Anjali Patel",
    pos:"Technical Head",
    about:"Technical skill is the master of complexity while creativity is the master of simplicity. As a contributor to the technical aspects of the chapter, ensure the invocation of fun through learning different aspects of Chemical Engineering. What we learn with pleasure is something that we never forget.",
    image:"anjali.jpg"

  },{
    name:"Meetaxa Khunt",
    pos:"Designing Head",
    about:'The public is more familiar with bad design than good design. It is, in effect, conditioned to prefer bad design, because that is what it lives with. The new becomes threatening, the old reassuring. Great design has two things: Simplicity & Clarity & I seek to achieve both of them. My goal or motto is to make sure AIChE Ahmedabad University reaches new heights & I can be a part of it.',
    image:"meetaxa.jpg"
  }
]


// GET and POST Routes
app.get("/", (req, res) => {
  // use res.render to load up an ejs view file
  // index page
  res.render("pages/index", { succ: false, err: false });
});

app.get("/about", (req, res) => {
  // use res.render to load up an ejs view file
  // about page
  res.render("pages/about",{team:team});
});

app.get("/contact", (req, res) => {
  // use res.render to load up an ejs view file
  // contact page
  res.render("pages/contact");
});

app.get("/events", (req, res) => {
  // use res.render to load up an ejs view file
  // events page
  res.render("pages/events");
});

app.get("/former", (req, res) => {
  // use res.render to load up an ejs view file
  // past events page
  res.render("pages/former",{data:pastevents});
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
app.get("/upcoming", (req, res) => {
  // use res.render to load up an ejs view file
  // upcoming events page
  res.render("pages/upcoming", { succ: false, err: false });
});

// Participant Registeration
app.post(
  "/register",
  [
    check("user_email")
      .isEmail()
      .custom((value, { req }) => {
        return new Promise((resolve, reject) => {
          Participant.findOne({ email: req.body.email }, function(
            err,
            participant
          ) {
            if (err) {
              reject(console.log("Error"));
            }
            if (Boolean(participant)) {
              reject(console.log("Error in Email"));
            }
            resolve(true);
          });
        });
      })  
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    // Save the participant in MongoDB
    let name = req.body.user_name;
    let email = req.body.user_email;
    const newParticipant = new Participant({
      name: name,
      email: email
    });
    newParticipant
      .save()
      .then(() => {
        res.render("pages/upcoming", { succ: true, err: false });
      })
      .catch(
        err => console.log(err),
        () => {
          res.render("pages/upcoming", { succ: false, err: true });
        }
      );
  }
);

//Newsletter

//----------------------------------------------------admin panel
app.get("/adminpanel", (req, res) => {
  // use res.render to load up an ejs view file
  // contact page
  res.render("adminform/admin");
});

app.get("/adminpanel/addevent", (req, res) => {
  // use res.render to load up an ejs view file
  // contact page
  res.render("adminform/addevent");
});




//------------------------------------------------------------
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
        // Temp URL
        // Replace with Owner's lists
        method: "POST",
        headers: {
          Authorization: "auth deed85fccbcc5e5f0f54d7acb8629242-us18"
          // Temp API KEY
          // Replace with Owner's API Key
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
    "Express Server listening on port %d in %s mode",
    this.address().port,
    app.settings.env
  );
});
