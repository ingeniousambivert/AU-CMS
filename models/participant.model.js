const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const ParticipantSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  time: { type: Date, default: Date.now }
});

module.exports = Participant = mongoose.model(
  "Participants",
  ParticipantSchema
);
