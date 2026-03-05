const Member = require("../Schema/memberSchema");

// 🔍 Search by ID
exports.searchDeathMembersById = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

    const members = await Member.find({
      member_id: { $regex: query, $options: "i" },
      status: "Active",
    })
    .select(`
      member_id member_name gender
      dob age occupation aadhar_number
      father_name mother_name present_address
    `)
    .lean();

    res.json(members);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🔍 Search by Name
exports.searchDeathMembersByName = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

    const members = await Member.find({
      member_name: { $regex: query, $options: "i" },
      status: "Active",
    })
    .select(`
      member_id member_name gender
      dob age occupation aadhar_number
      father_name mother_name present_address
    `)
    .lean();

    res.json(members);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
