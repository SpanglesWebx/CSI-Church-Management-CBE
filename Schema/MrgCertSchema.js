// schema/MrgCertSchema.js
const mongoose = require("mongoose");

const PastorSchema = new mongoose.Schema({
  name: { type: String },
  qualification: { type: String },
  responsibility: { type: String },
  pastor_role: { type: String }
}, { _id: false });

const WitnessSchema = new mongoose.Schema({
  name: { type: String },
  fatherName: { type: String },
  address: { type: String },
  phone: { type: String }
}, { _id: false });

const PersonSchema = new mongoose.Schema({
  isMember: { type: Boolean, default: true },
  memberId: { type: String, default: "" },
  memberName: { type: String, default: "" }, // name from member DB
  nonMemberName: { type: String, default: "" },
  nonMemberPhone: { type: String, default: "" },
  dob: { type: String, default: "" },
  age: { type: String, default: "" },
  profession: { type: String, default: "" },
  maritalStatus: { type: String, default: "" },
  fatherName: { type: String, default: "" },
  motherName: { type: String, default: "" },
  address: { type: String, default: "" },
  pincode: { type: String, default: "" },
  phone: { type: String, default: "" },
  photo: { type: String, default: "" }
}, { _id: false });

const BannsSchema = new mongoose.Schema({
  betrothalDate: { type: String, default: "" },
  betrothalPlace: { type: String, default: "" },
  weddingDate: { type: String, default: "" },
  weddingInOurChurch: { type: String, default: "" },
  bannsLicense: { type: String, default: "" },
  banns1: { type: String, default: "" },
  banns2: { type: String, default: "" },
  banns3: { type: String, default: "" },
  certBeforeBannsIssued: { type: String, default: "" },
  certBeforeBannsIssuedDate: { type: String, default: "" },
  certBeforeBannsReceived: { type: String, default: "" },
  certBeforeBannsReceivedDate: { type: String, default: "" },
  certAfterBannsIssued: { type: String, default: "" },
  certAfterBannsIssuedDate: { type: String, default: "" },
  certAfterBannsReceived: { type: String, default: "" },
  certAfterBannsReceivedDate: { type: String, default: "" },
  marriageCertIssued: { type: String, default: "" },
  marriageCertIssuedDate: { type: String, default: "" }
}, { _id: false });

const ChurchDetailsSchema = new mongoose.Schema({
  churchName: { type: String, default: "" },
  pastorateName: { type: String, default: "" },
  diocese: { type: String, default: "" }
}, { _id: false });

const MrgCertSchema = new mongoose.Schema({
  marriageCode: { type: String, required: true, unique: true }, // MRYYXXXXX
  marriageYear: { type: Number },
  marriageSeq: { type: Number }, // raw sequence number
  registerSlNo: { type: String, default: "" },

  groom: { type: PersonSchema, default: () => ({}) },
  groomChurch: { type: ChurchDetailsSchema, default: () => ({}) },

  bride: { type: PersonSchema, default: () => ({}) },
  brideChurch: { type: ChurchDetailsSchema, default: () => ({}) },

  banns: { type: BannsSchema, default: () => ({}) },

  pastors: { type: [PastorSchema], default: [] },
  witnesses: { type: [WitnessSchema], default: [] },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }
}, { timestamps: true });

module.exports = mongoose.model("MrgCert", MrgCertSchema);
