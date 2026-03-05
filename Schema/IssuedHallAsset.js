const mongoose = require("mongoose");

const IssuedHallAssetSchema = new mongoose.Schema({
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: "HallBooking", required: true },
  hall_id: { type: mongoose.Schema.Types.ObjectId, ref: "MarriageHall", required: true },
  hall_name: String,
  customer_name: String,
  date: Date,

  category_id: mongoose.Schema.Types.ObjectId,
  category_name: String,

  items: [
    {
      item_name: String,
      issued_qty: Number,

      returned: { type: Number, default: 0 },
      damaged: { type: Number, default: 0 },
      missing: { type: Number, default: 0 }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("IssuedHallAsset", IssuedHallAssetSchema);
