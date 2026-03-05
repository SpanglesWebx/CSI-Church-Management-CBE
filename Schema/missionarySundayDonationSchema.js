const mongoose = require("mongoose");

const MissionarySundayDonationSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model(
    "MissionarySundayDonation",
    MissionarySundayDonationSchema
); 
