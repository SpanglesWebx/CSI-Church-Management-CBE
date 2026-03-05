const mongoose = require("mongoose");

const HarvestCollectionSchema = new mongoose.Schema(
  {
    member_id: { type: String, required: true },
    member_name: { type: String, required: true },
    phone: { type: String },
    amount: { type: Number, default: 0 },
    date: { type: Date, required: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HarvestCollection", HarvestCollectionSchema);
 