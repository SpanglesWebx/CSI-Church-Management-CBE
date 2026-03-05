const Member = require("../Schema/memberSchema");



// 📋 Get all Male Members
exports.getMenMembers = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 25 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {
      gender: "Male",
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
    console.error("Error fetching male members:", err);
    res.status(500).json({ message: "Server error" });
  }
};

















// const MenFellowship = require("../Schema/MenFellowship");

// // ➕ Add new member to Men's Fellowship
// exports.addMenFellowshipMember = async (req, res) => {
//   try {
//     const { member_id, member_name, member_tamil_name, mobile_number } = req.body;

//     if (!member_id || !member_name) {
//       return res.status(400).json({ message: "Member ID and Name are required" });
//     }

//     // Prevent duplicate entry
//     const exists = await MenFellowship.findOne({ member_id });
//     if (exists) {
//       return res.status(400).json({ message: "This member is already in Men's Fellowship" });
//     }

//     const newMember = new MenFellowship({
//       member_id,
//       member_name,
//       member_tamil_name,
//       mobile_number,
//     });

//     await newMember.save();
//     res.status(201).json({ message: "Member added successfully", member: newMember });
//   } catch (err) {
//     console.error("❌ Error adding Men’s Fellowship member:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // 📋 Get all Men’s Fellowship members
// // controllers/menFellowshipController.js
// exports.getMenFellowshipMembers = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, search = "" } = req.query;

//     const query = {};

//     if (search) {
//       query.$or = [
//         { member_id: { $regex: search, $options: "i" } },
//         { member_name: { $regex: search, $options: "i" } },
//         { member_tamil_name: { $regex: search, $options: "i" } },
//         { mobile_number: { $regex: search, $options: "i" } },
//       ];
//     }

//     const totalCount = await MenFellowship.countDocuments(query);
//     const totalPages = Math.ceil(totalCount / limit);

//     const members = await MenFellowship.find(query)
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit));

//     res.json({
//       members,
//       totalPages,
//       totalCount,
//       currentPage: parseInt(page),
//     });
//   } catch (err) {
//     console.error("Error fetching members:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

