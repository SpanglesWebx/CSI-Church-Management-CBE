const mongoose = require("mongoose");

/* ======================================
   Couple Competition Schema
====================================== */

const coupleCompetitionSchema = new mongoose.Schema({
  competition: { type: String, required: true },
  title: { type: String, required: true },
  participants: [
    {
      husband_id: { type: String },
      husband_name: { type: String },
      wife_id: { type: String },
      wife_name: { type: String },
      prize: { type: String, trim: true, default: "" },
    },
  ],
});

/* ======================================
   Event By Schema
====================================== */

const coupleEventBySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

/* ======================================
   Main Couple Event Schema
====================================== */

const coupleEventSchema = new mongoose.Schema(
  {
    eventBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoupleEventBy",
      required: true,
    },
    eventName: { type: String, required: true },
    eventDate: { type: Date, required: true },
    registerBefore: { type: Date, required: true },
    venue: { type: String, required: true },
    description: { type: String },

    coupleCompetitions: [coupleCompetitionSchema],
    competitionTags: [String],
  },
  { timestamps: true }
);

const CoupleEvent = mongoose.model("CoupleEvent", coupleEventSchema);
const CoupleEventBy = mongoose.model("CoupleEventBy", coupleEventBySchema);

module.exports = { CoupleEvent, CoupleEventBy };