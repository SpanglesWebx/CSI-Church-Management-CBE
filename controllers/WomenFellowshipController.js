const WomenFellowship = require("../Schema/WomenFellowship");
const Member = require("../Schema/memberSchema");

// ➕ Add new member to Women's Fellowship
// exports.addWomenFellowshipMember = async (req, res) => {
//   try {
//     const { member_id, member_name, member_tamil_name, mobile_number } = req.body;

//     if (!member_id || !member_name) {
//       return res.status(400).json({ message: "Member ID and Name are required" });
//     }

//     // Prevent duplicate entry
//     const exists = await WomenFellowship.findOne({ member_id });
//     if (exists) {
//       return res.status(400).json({ message: "This member is already in Women's Fellowship" });
//     }

//     const newMember = new WomenFellowship({
//       member_id,
//       member_name,
//       member_tamil_name,
//       mobile_number,
//     });

//     await newMember.save();
//     res.status(201).json({ message: "Member added successfully", member: newMember });
//   } catch (err) {
//     console.error("❌ Error adding Women’s Fellowship member:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };




// 📋 Get all Female Members
exports.getWomenMembers = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 25 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {
      gender: "Female",
      status: "Active",
      ...(search && {
        $or: [
          { member_name: { $regex: search, $options: "i" } },
          { member_id: { $regex: search, $options: "i" } },
        ],
      }),
    };

    const members = await Member.find(query)
      .select("member_id member_name member_tamil_name primary_contact_number")
      .sort({ member_id: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Member.countDocuments(query);

    res.json({
      members,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      currentPage: Number(page),
      totalCount,
    });
  } catch (err) {
    console.error("Error fetching female members:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// 📋 Get all Women’s Fellowship members
exports.getWomenFellowshipMembers = async (req, res) => {
  try {
    const members = await WomenFellowship.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
