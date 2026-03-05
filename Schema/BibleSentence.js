const mongoose = require("mongoose");

const bibleSentenceSchema = new mongoose.Schema(
  {
    book: { type: String, required: true },
    chapter: { type: Number, required: true },
    verse: { type: Number, required: true },
    sentence: { type: String, required: true },
    status: { type: Boolean, default: true }, // Active / Inactive
  },
  { timestamps: true }
);

module.exports = mongoose.model("BibleSentence", bibleSentenceSchema);