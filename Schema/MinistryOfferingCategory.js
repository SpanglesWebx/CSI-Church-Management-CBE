// models/MinistryOfferingCategory.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MinistryOfferingCategorySchema = new Schema({
  category: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const MinistryOfferingCategory = mongoose.model('MinistryOfferingCategory', MinistryOfferingCategorySchema);
module.exports = MinistryOfferingCategory;
 