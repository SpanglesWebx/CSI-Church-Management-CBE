const mongoose = require("mongoose");

const KitchenAssetSchema = new mongoose.Schema({
  item_name: { type: String, required: true, unique: true },

  total_quantity: { type: Number, default: 0 },

  returned:   { type: Number, default: 0 },
  damaged:    { type: Number, default: 0 },
  missed: { type: Number, default: 0 },
  sold_out:   { type: Number, default: 0 },

  sold_to: { type: String, default: "" },

  available_quantity: { type: Number, default: 0 }

},{ timestamps:true });

module.exports = mongoose.model("KitchenAsset", KitchenAssetSchema);
