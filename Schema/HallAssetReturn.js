const mongoose = require("mongoose");

const ReturnItemSchema = new mongoose.Schema({
  item_name: String,
  returned_qty: Number,
  damaged_qty: Number,
  missing_qty: Number
},{ _id:false });

const HallAssetReturnSchema = new mongoose.Schema({
  booking_id: mongoose.Schema.Types.ObjectId,
  hall_id: mongoose.Schema.Types.ObjectId,
  hall_name: String,
  customer_name: String,
  category_id: mongoose.Schema.Types.ObjectId,
  category_name: String,
  date: Date,
  items: [ReturnItemSchema]
},{ timestamps:true });

module.exports = mongoose.model("HallAssetReturn", HallAssetReturnSchema);
