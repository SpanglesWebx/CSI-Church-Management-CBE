const mongoose = require("mongoose");

const HarvestCoverOffertorySchema = new mongoose.Schema(
  {
    member_id: { type: String, required: true },
    member_name: { type: String, required: true },
    phone: { type: String },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    description: { type: String, default: "" },
    migrated: {
      type: Boolean,
      default: false,
    },

  },
  { timestamps: true, collection: "HarvestCoverOffertory" }
);

module.exports = mongoose.model(
  "HarvestCoverOffertory",
  HarvestCoverOffertorySchema
);
