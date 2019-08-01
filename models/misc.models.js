
//Events Requests
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
    eventid: Number,
    {timestamps:true}
}
);