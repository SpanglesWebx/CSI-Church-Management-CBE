const mongoose = require("mongoose");

const zoneSchema = new mongoose.Schema({
  zone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  areas: [
    {
      type: String,
      trim: true,
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("ZoneForAddress", zoneSchema);
