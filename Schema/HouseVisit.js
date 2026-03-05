// models/HouseVisit.js
const mongoose = require('mongoose');

const HouseVisitSchema = new mongoose.Schema({
  member_id: { type: String, trim: true, required: false },
  member_name: { type: String, trim: true, required: true },
  phone: { type: String, trim: true, required: false },
  amount: { type: Number, default: 0 }, // if you use donations
  date: { type: Date, required: true },
  description: { type: String, trim: true, default: '' },
  migrated: {
    type: Boolean,
    default: false,
  },

}, {
  timestamps: true
});

module.exports = mongoose.model('HouseVisit', HouseVisitSchema);