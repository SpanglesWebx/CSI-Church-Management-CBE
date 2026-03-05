const mongoose = require("mongoose");

const familySchema = new mongoose.Schema({
  family_id: {
    type: String,
    required: true,
    unique: true
  },

  head: {
    member_id: { type: String, required: true },
    member_name: { type: String, required: true }
  },

  members: [
    {
      member_id: { type: String, required: true },
      member_name: { type: String, required: true }
    }
  ],
  
  photo: { type: String, default: "" },

}, { timestamps: true });

module.exports = mongoose.model("Family", familySchema);

