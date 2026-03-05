const mongoose = require("mongoose");

const deathCertificateSchema = new mongoose.Schema({
  death_id: { type: String, unique: true },

  member_id: String,
  member_name: String,
  gender: String,

  father_or_husband: String,
  dob: String,
  age: String,
  aadhar_number: String,
  occupation: String,
  address: String,

  place_of_death: String,
  died_on: String,
  cause_of_death: String,
  place_of_burial: String,
  buried_on: String,
  buried_by: String,
  certificate_issued_on: String,

  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("DeathCertificate", deathCertificateSchema);
