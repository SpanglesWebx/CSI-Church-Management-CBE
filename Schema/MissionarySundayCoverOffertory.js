const mongoose = require("mongoose");

const MissionarySundayCoverOffertorySchema = new mongoose.Schema(
  {
    member_id: { type: String, required: true },
    member_name: { type: String, required: true },
    phone: { type: String },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    description: { type: String, default: "" },
  },
  { timestamps: true, collection: "MissionarySundayCoverOffertory" }
);

module.exports = mongoose.model(
  "MissionarySundayCoverOffertory",
  MissionarySundayCoverOffertorySchema
);
 