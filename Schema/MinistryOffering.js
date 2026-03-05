// models/MinistryOffering.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema; 

const MinistryOfferingSchema = new Schema({
  category: { type: String, required: true }, // category name
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  day: { type: String, required: true },
  description: { type: String,  },
  migrated: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const MinistryOffering = mongoose.model('MinistryOffering', MinistryOfferingSchema);
module.exports = MinistryOffering;
