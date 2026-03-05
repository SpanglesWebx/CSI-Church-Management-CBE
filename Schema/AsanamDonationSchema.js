const mongoose = require("mongoose");

const AsanamDonationSchema = new mongoose.Schema({

  member_id: {
    type: String,
    default: ""
  },

  name: {
    type: String,
    required: true
  },
tamil_name:{
type:String,
default:""
},

  place: {
    type: String,
    default: ""
  },
place_tamil:{
type:String,
default:""
},


  item: {
    type: String,
    required: true
  },

  quantity: {
    type: Number,
    default: 0
  },
unit:{
type:String,
default:""
},

unit_tamil:{
type:String,
default:""
},

  date: {
    type: Date,
    default: Date.now
  }

},
{
  timestamps: true
});


module.exports = mongoose.model(
  "AsanamDonation",
  AsanamDonationSchema
);