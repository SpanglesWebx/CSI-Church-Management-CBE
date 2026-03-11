const mongoose = require("mongoose");

const WomenReceiptTransCounterSchema = new mongoose.Schema(
{
  dateKey:{
    type:String,
    required:true,
    unique:true
  },

  seq:{
    type:Number,
    default:0
  }

},
{ timestamps:true }
);

module.exports = mongoose.model(
  "WomenReceiptTransCounter",
  WomenReceiptTransCounterSchema
);