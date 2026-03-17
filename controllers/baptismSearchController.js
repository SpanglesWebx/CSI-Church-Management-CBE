const Member = require("../Schema/memberSchema");

// 🔍 Search Member by ID
exports.searchBaptismMembersById = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

    const members = await Member.find({
      member_id: { $regex: query, $options: "i" },
      status: "Active",
    //   $or: [
    //     { baptism: { $exists: false } },
    //     { baptism: { $ne: "Yes" } }
    //   ]
    }).select(`
      member_id member_name member_tamil_name
      dob age occupation aadhar_number place_of_birth
      father_name mother_name
      present_address present_pincode
    `).lean();

    res.json(members);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


// 🔍 Search Member by Name
exports.searchBaptismMembersByName = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

    const members = await Member.find({
      member_name: { $regex: query, $options: "i" },
      status: "Active",
    //   $or: [
    //     { baptism: { $exists: false } },
    //     { baptism: { $ne: "Yes" } }
    //   ]
    }).select(`
      member_id member_name member_tamil_name
      dob age occupation aadhar_number place_of_birth
      father_name mother_name
      present_address present_pincode
    `).lean();

    res.json(members);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
