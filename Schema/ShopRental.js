const mongoose = require("mongoose");

const ShopRentalSchema = new mongoose.Schema({
  lesse_id: { type: String, required: true, unique: true },

  shopkeeper_name: { type: String, required: true },
  mobile_number: { type: String, required: true },
  aadhar_number: { type: String, required: true },
  address: { type: String, required: true },

  shop_id: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
  shop_name: { type: String, required: true },
  shop_location: { type: String, required: true },

  type_of_business: { type: String, required: true },

  advance_amount: { type: Number, required: true },
  rental_amount: { type: Number, required: true },

  billing_cycle_date: { type: Date, required: true },
  rental_start_date: { type: Date, required: true },

  number_of_months: { type: Number, required: true },
  renewal_date: { type: Date, required: true },

  description: { type: String, default: "" },

  rental_status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  payments: [
    {
      date: { type: Date, required: true },
      amount: { type: Number, required: true },
      shop_id: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
      shop_name: { type: String, required: true },
      shop_location: { type: String, required: true }
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model("ShopRental", ShopRentalSchema);
