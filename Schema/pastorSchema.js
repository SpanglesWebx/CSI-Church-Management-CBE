const mongoose = require("mongoose");

const pastorFamilyMemberSchema = new mongoose.Schema({
  member_id: { type: String, required: true },  // PTM00001/2, /3 etc
  name: { type: String, required: true },
  tamil_name: { type: String },
  relation: { type: String, required: true }, // Husband/Wife/Son/Daughter
  gender: { type: String },
  dob: { type: String },
  age: { type: Number },
  aadhar_number: { type: String },
  email: { type: String },
  contact_numbers: { type: [String], default: [] },
  member_photo: { type: String },
  status: { type: String, default: "Active" }
});

const pastorSchema = new mongoose.Schema({
  pastor_id: { type: String, required: true, unique: true }, // PTM00001/1
  pastor_family_id: { type: String, required: true, unique: true }, // PTFAM00001

  pastor_name: { type: String, required: true },
  pastor_tamil_name: { type: String, required: true },

  title: String,
  tamil_title: String,
  pastor_role: String,

  contact_numbers: { type: [String], default: [] },

  dob: String,
  age: Number,
  gender: String,
  aadhar_number: String,
  joining_date: String,
  marriage_date: String,
  email: String,
  residential_address: String,

  pastor_photo: String,

  status: { type: String, default: "Active" },
  left_date: { type: String, default: "" },
  inactive_reason: { type: String, default: "" },

  // 🔥 New field for family
  family_members: [pastorFamilyMemberSchema]
});

module.exports = mongoose.model("Pastor", pastorSchema);
