const mongoose = require("mongoose");

const baptismCertificateSchema = new mongoose.Schema({
  baptism_id: { type: String, unique: true },

  member_id: String,
  member_name: String,

  dob: String,
  age: String,
  gender: String,
  profession: String,
  aadhar_number: String,
  place_of_birth: String,

  father_name: String,
  father_profession: String,
  father_aadhar: String,

  mother_name: String,
  mother_profession: String,
  mother_aadhar: String,

  address: String,
  pincode: { type: String, default: "" },

  baptism_date: String,
  baptism_type: String,
  baptism_place: String,
  baptised_by: String,
  god_parents: String,
  witnesses: String,
  remarks: String,

  certificate_issued: String,
  issued_on: String,
  issued_by: String,

  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("BaptismCertificate", baptismCertificateSchema);
