// models/AsanamUniformSale.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AsanamUniformSaleSchema = new Schema({
  date: { type: Date, required: true },
  receipt_no: { type: String, required: true },
  description: { type: String }, // optional summary
  items: [
    {
      itemId: { type: Schema.Types.ObjectId, ref: "AsanamUniformItem", required: false },
      name: { type: String, required: true },
      qty: { type: Number, required: true },
      rate: { type: Number, required: true },
      total: { type: Number, required: true },
    },
  ],
  total_amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  migrated: {
    type: Boolean,
    default: false,
},

});

module.exports = mongoose.model("AsanamUniformSale", AsanamUniformSaleSchema);
