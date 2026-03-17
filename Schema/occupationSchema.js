const mongoose = require("mongoose");

const occupationSchema = new mongoose.Schema({
  occupation: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("Occupation", occupationSchema);