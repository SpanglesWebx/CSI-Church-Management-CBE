// models/AsanamUniformItem.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AsanamUniformItemSchema = new Schema({
  date: { type: Date, required: true }, // date or year reference
  description: { type: String },
  items: [
    {
      name: { type: String, required: true },
      rate: { type: Number, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AsanamUniformItem", AsanamUniformItemSchema);
