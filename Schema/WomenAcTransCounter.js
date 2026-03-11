const mongoose = require("mongoose");

const WomenAcTransCounterSchema = new mongoose.Schema(
{
  name:{
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
  "WomenAcTransCounter",
  WomenAcTransCounterSchema
);