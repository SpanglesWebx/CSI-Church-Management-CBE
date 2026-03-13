
const mongoose = require("mongoose");

const notificationItemSchema = new mongoose.Schema({
  message: String,
  date: Date
});

const notificationSchema = new mongoose.Schema({
  heading: String,

  items: [notificationItemSchema],

  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active"
  },

  seenBy: [
    {
       memberId: { type: String, index: true },
      seenAt: Date
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);