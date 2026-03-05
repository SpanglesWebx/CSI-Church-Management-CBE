const mongoose = require("mongoose");

const cemeteryBookingSchema = new mongoose.Schema({
  cemetery_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cemetery",
    required: true,
  },
  cemetery_name: {
    type: String,
    required: true,
  },
  slot_id: {
    type: String,
    required: true,
  },
  isMember: {
    type: Boolean,
    required: true,
  },
  member: {
    member_id: String,
    member_name: String,
    member_tamil_name: String,
    gender: String,
    mobile_number: String,
    aadhar_number: String,
    permanent_address: String,
    present_address: String,
  },
  non_member: {
    name: String,
    tamil_name: String,
    gender: String,
    phone: String,
    aadhar: String,
    permanent_address: String,
    present_address: String,
  },
  buried_person_name: {
  type: String,
  trim: true,
  default: "",
},

buried_date: { type: Date, },

slot_capacity: {
  type: Number,
  default: 4,
},

slot_number: {
  type: Number,
  required: true,
},

slot_closed: {
  type: Boolean,
  default: false,
},

  // 🟩 Status of the slot for this booking
  status: {
    type: String,
    enum: ["Reserved", "Buried", "Cancelled"],
    default: "Reserved", // when booking is created, mark as reserved
  },


  booked_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CemeteryBooking", cemeteryBookingSchema);
