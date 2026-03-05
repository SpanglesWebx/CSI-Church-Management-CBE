const Member = require("../Schema/memberSchema");

exports.searchMaleMembersById = async (req, res) => {
  try {
    const { id } = req.query;

    const members = await Member.find({
      member_id: { $regex: id, $options: "i" },
      gender: "Male",
      status: "Active",
    }).select(
      "member_id member_name dob age occupation marital_status father_name mother_name present_address present_pincode primary_contact_number"
    );

    if (!members.length) return res.status(404).json([]);
    res.json(members);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

exports.searchMaleMembersByName = async (req, res) => {
  try {
    const { name } = req.query;

    const members = await Member.find({
      member_name: { $regex: name, $options: "i" },
      gender: "Male",
      status: "Active",
    }).select(
      "member_id member_name dob age occupation marital_status father_name mother_name present_address present_pincode primary_contact_number"
    );

    if (!members.length) return res.status(404).json([]);
    res.json(members);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
