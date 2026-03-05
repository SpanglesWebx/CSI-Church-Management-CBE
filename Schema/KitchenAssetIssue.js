const mongoose = require("mongoose");

const KitchenAssetIssueSchema = new mongoose.Schema({
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref:"HallBooking", required:true },

  hall_id: { type: mongoose.Schema.Types.ObjectId, ref:"MarriageHall" },
  customer_name: String,
  booking_date: Date,

  items:[
    {
      asset_id: { type: mongoose.Schema.Types.ObjectId, ref:"KitchenAsset" },
      item_name: String,
      issued_qty: Number,

      returned: { type:Number, default:0 },
      damaged: { type:Number, default:0 },
      missing: { type:Number, default:0 }
    }
  ]
},{timestamps:true});

module.exports = mongoose.model("KitchenAssetIssue", KitchenAssetIssueSchema);
