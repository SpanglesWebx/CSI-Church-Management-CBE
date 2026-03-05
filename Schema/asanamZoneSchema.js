const mongoose = require("mongoose");

const asanamZoneSchema = new mongoose.Schema(
  {
    zone_name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AsanamZone", asanamZoneSchema);
