const Member = require("../Schema/memberSchema");

// 🔍 Search Bride by Member ID
exports.searchFemaleMembersById = async (req, res) => {
  try {
    const { id } = req.query;

    const members = await Member.find({
      member_id: { $regex: id, $options: "i" },
      gender: "Female",
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

// 🔍 Search Bride by Name
exports.searchFemaleMembersByName = async (req, res) => {
  try {
    const { name } = req.query;

    const members = await Member.find({
      member_name: { $regex: name, $options: "i" },
      gender: "Female",
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
