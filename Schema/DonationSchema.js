const mongoose = require("mongoose");

const DonationSchema = new mongoose.Schema({
  isMember: { type: Boolean, default: true },

  // Member (if member)
  member_id: { type: String, default: "" }, // store member_id string (not ObjectId, consistent with your member model)
  member_name: { type: String, default: "" },
  member_phone: { type: String, default: "" },

  // Non-member
  non_member_name: { type: String, default: "" },
  non_member_phone: { type: String, default: "" },

  // Link to PoorHelpTitle (cached name + id)
  help_title_id: { type: mongoose.Schema.Types.ObjectId, ref: "PoorHelpTitle", required: true },
  help_title_name: { type: String, required: true },

  // Donation details
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  description: { type: String, default: "" },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PoorHelpDonation", DonationSchema);
