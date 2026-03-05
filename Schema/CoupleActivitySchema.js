const mongoose = require("mongoose");

const HouseSchema = new mongoose.Schema({
  id: { type: String, default: "-" },
  name: String,
  address: String,
  isMember: { type: Boolean, default: true },
  offering: { type: Number, default: 0 },
});

const AttendeeSchema = new mongoose.Schema({
  id: { type: String, default: "-" },
  name: String,
  isMember: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ["present", "absent"],
    default: "absent",
  },
});

const CoupleActivitySchema = new mongoose.Schema(
{
 date: { type: Date, required: true },

 activityType:{
  type:String,
  enum:["house-visit","weekly-prayer","church-prayer","other"],
  required:true
 },

 title:String,
 churchName:String,
 churchLocation:String,
 customTitle:String,

 leader:{
  id:{type:String,default:"-"},
  name:String
 },

 notes:String,

 houses:[HouseSchema],

 attendees:[AttendeeSchema],

 totalOffering:{
  type:Number,
  default:0
 },

 status:{
  type:String,
  enum:["Planned","Completed","Cancelled"],
  default:"Planned"
 }

},
{timestamps:true}
);

module.exports =
mongoose.model("CoupleActivity",CoupleActivitySchema);