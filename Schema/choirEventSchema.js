const mongoose = require("mongoose");

const choirCompetitionSchema = new mongoose.Schema({
  competition: { type: String, required: true },
  title: { type: String, required: true },
  participants: [
    {
      member_id: { type: String },
      member_name: { type: String },
      member_tamil_name: { type: String },
      prize: { type: String, trim: true, default: "" },
    },
  ],
});

const choirEventBySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

const choirEventSchema = new mongoose.Schema(
  {
    eventBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChoirEventBy",
      required: true,
    },
    eventName: { type: String, required: true },
    eventDate: { type: Date, required: true },
    registerBefore: { type: Date, required: true },
    venue: { type: String, required: true },
    description: { type: String },
    choirCompetitions: [choirCompetitionSchema],
  },
  { timestamps: true }
);

const ChoirEvent = mongoose.model("ChoirEvent", choirEventSchema);
const ChoirEventBy = mongoose.model("ChoirEventBy", choirEventBySchema);

module.exports = { ChoirEvent, ChoirEventBy };

