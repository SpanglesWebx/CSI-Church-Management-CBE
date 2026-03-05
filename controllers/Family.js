const Member = require("../Schema/memberSchema");
const Family = require("../Schema/familySchema");

const { familyIdFromMemberId } = require("../util/familyIdFromMember");

// ===============================================================
// CREATE FAMILY HEAD (UPDATED TO USE MEMBER → FAMILY ID MAPPING)
// ===============================================================
exports.createFamilyHead = async (req, res) => {
  try {
    const { member_id } = req.body;

    if (!member_id) {
      return res.status(400).json({ message: "Member ID required" });
    }

    // Step 1 — Find Member
    const member = await Member.findOne({ member_id });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Step 2 — Prevent duplication
    if (member.family_id) {
      return res.status(400).json({
        message: "This member already belongs to a family"
      });
    }

    // Step 3 — Generate Family ID from Member ID
    const newFamilyId = await generateNextId(Family, "family_id", "FAM");

    // Step 4 — Check if family already exists
    const existingFamily = await Family.findOne({ family_id: newFamilyId });
    if (existingFamily) {
      return res.status(400).json({
        message: `Family ${newFamilyId} already exists`
      });
    }

    // Step 5 — Create Family
    const newFamily = await Family.create({
      family_id: newFamilyId,
      head: {
        member_id: member.member_id,
        member_name: member.member_name,
        member_tamil_name: member.member_tamil_name,
      },
      members: [
        {
          member_id: member.member_id,
          member_name: member.member_name,
          member_tamil_name: member.member_tamil_name,
          relation_with_head: "Head"
        }
      ]
    });

    // Step 6 — Update Member Document
    member.family_id = newFamilyId;
    member.relation_with_head = "Head";
    member.isHead = "Yes";
    await member.save();

    return res.status(200).json({
      status: "Success",
      message: "Family created successfully",
      data: newFamily,
    });

  } catch (error) {
    console.error("Create Family Head Error:", error);
    return res.status(500).json({
      status: "Failed",
      message: "Server Error"
    });
  }
};

// ===============================================================
// GET FAMILIES (unchanged)
// ===============================================================
exports.getFamilies = async (req, res) => {
  try {
    let { page = 1, search = "", limit = 50 } = req.query;

    // Convert to numbers
    page = Number(page);
    limit = Number(limit) || 50;

    // Safety limits
    limit = Math.min(Math.max(limit, 1), 500);

    const skip = (page - 1) * limit;

    // Build search query
    let query = {};

    if (search.trim() !== "") {
      query.$or = [
        { family_id: { $regex: search, $options: "i" } },
        { "head.member_name": { $regex: search, $options: "i" } },
        // { "head.member_id": { $regex: search, $options: "i" } }
      ];
    }

    // Fetch paginated families
    const families = await Family.find(query)
      .sort({ family_id: -1 })
      .skip(skip)
      .limit(limit);

    // Count total
    const total = await Family.countDocuments(query);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      data: families,
      totalPages,
      currentPage: page,
      limit
    });

  } catch (error) {
    console.error("Get Families Error:", error);
    return res.status(500).json({
      status: "Failed",
      message: "Server Error",
    });
  }
};


// ===============================================================
// GET FAMILY BY ID (unchanged)
// ===============================================================
// exports.getFamilyById = async (req, res) => {
//   try {
//     const { familyId } = req.params;

//     const family = await Family.findOne({ family_id: familyId });
//     if (!family) {
//       return res.status(404).json({ message: "Family not found" });
//     }

//     const memberIds = family.members.map(m => m.member_id);

//     const fullMembers = await Member.find({ member_id: { $in: memberIds } });

//     const membersClean = fullMembers.map(mem => ({
//       member_id: mem.member_id,
//       member_name: mem.member_name,
//       member_tamil_name: mem.member_tamil_name,
//       relation_with_head: mem.relation_with_head,
//       status: mem.status,
//       membership_status: mem.membership_status,
//       _id: mem._id
//     }));

//     const headMember = fullMembers.find(m => m.member_id === family.head.member_id);

//     res.json({
//       family_id: family.family_id,
//       head_member_id: family.head.member_id,
//       head_member_name: family.head.member_name,
//       total_members: family.members.length,
//       address: headMember?.present_address || "",
//       members: membersClean
//     });

//   } catch (err) {
//     console.error("Get Family Error:", err);
//     res.status(500).json({ message: "Server Error", error: err.message });
//   }
// };

exports.getFamilyById = async (req, res) => {
  try {
    const { familyId } = req.params;

    // Fetch family document
    const family = await Family.findOne({ family_id: familyId });
    if (!family) {
      return res.status(404).json({ message: "Family not found" });
    }

    // Collect member IDs from family
    const memberIds = family.members.map(m => m.member_id);

    // Fetch full member documents
    const fullMembers = await Member.find({ member_id: { $in: memberIds } });

    // Prepare clean member list (ADD IMPORTANT FIELDS)
    const membersClean = fullMembers.map(mem => ({
      member_id: mem.member_id,
      member_name: mem.member_name,
      member_tamil_name: mem.member_tamil_name,
      gender: mem.gender,                      // ⭐ REQUIRED
      relation_with_head: mem.relation_with_head,
      marital_status: mem.marital_status,
  marriage_date: mem.marriage_date,
  marriage_place: mem.marriage_place,
      member_title: mem.member_title,          // ⭐ OPTIONAL BUT USEFUL
      member_tamil_title: mem.member_tamil_title,
      status: mem.status,
      membership_status: mem.membership_status,
      _id: mem._id
    }));

    // Find head full details
    const headMember = fullMembers.find(
      m => m.member_id === family.head.member_id
    );

    // Build response
    res.json({
      family_id: family.family_id,
      head_member_id: family.head.member_id,
      head_member_name: family.head.member_name,
      head_gender: headMember?.gender || "",     // ⭐ REQUIRED FOR AUTO-FILL
      head_marital_status: headMember?.marital_status || "",
  head_marriage_date: headMember?.marriage_date || "",
  head_marriage_place: headMember?.marriage_place || "",
      total_members: family.members.length,
      address: headMember?.present_address || "",
      photo: family.photo || "",
      members: membersClean
    });

  } catch (err) {
    console.error("Get Family Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// ===============================================================
// GET TOTAL FAMILY COUNT
// ===============================================================
exports.getFamilyCount = async (req, res) => {
  try {
    const totalFamilies = await Family.countDocuments();

    return res.status(200).json({
      totalFamilies
    });
  } catch (error) {
    console.error("Get Family Count Error:", error);
    return res.status(500).json({
      message: "Error fetching family count",
      error: error.message
    });
  }
};



exports.uploadFamilyPhoto = async (req, res) => {
  try {
    const { family_id } = req.body;

    if (!family_id) {
      return res.status(400).json({ message: "Family ID required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No photo uploaded" });
    }

    const photoPath = `/uploads/familyPhotos/${req.file.filename}`;

    await Family.updateOne(
      { family_id },
      { photo: photoPath }
    );

    res.json({
      status: "Success",
      message: "Family photo uploaded",
      photo: photoPath
    });

  } catch (err) {
    res.status(500).json({
      message: "Upload failed",
      error: err.message
    });
  }
};
