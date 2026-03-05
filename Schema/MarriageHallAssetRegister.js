const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  item_name: { type: String, required: true },
  quantity: { type: Number, required: true }
},{ _id:false });

const CategorySchema = new mongoose.Schema({
  category_id:   { type: mongoose.Schema.Types.ObjectId, required:true },
  category_name: { type: String, required:true },
  items: [ItemSchema]
},{ _id:false });

const MarriageHallAssetRegisterSchema = new mongoose.Schema({
  hall_id:   { type: mongoose.Schema.Types.ObjectId, ref:"MarriageHall", required:true, unique:true },
  hall_name: { type: String, required:true },
  categories: [CategorySchema]
},{ timestamps:true });

module.exports = mongoose.model("MarriageHallAssetRegister", MarriageHallAssetRegisterSchema);
