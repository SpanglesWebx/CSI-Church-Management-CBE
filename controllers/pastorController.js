const Pastor = require("../Schema/pastorSchema");
const {
  generateNextId,
  generateNextFamilyMemberId
} = require("../util/MemberCodeGenerate");

const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Member = require("../Schema/memberSchema");
const Family = require("../Schema/familySchema");

// -------------------------
// File Upload Storage
// -------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, "uploads/pastors"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname)
});

const uploadPastorPhoto = multer({ storage }).single("pastor_photo");
const uploadMemberPhoto = multer({ storage }).single("member_photo");

// -------------------------
// Generate Initial IDs
// -------------------------
exports.getInitIds = async (req, res) => {
  try {
    const basePastorId = await generateNextId(Pastor, "pastor_id", "PTM");
    const pastorId = `${basePastorId}/1`; // Head of family

    const pastorFamilyId = await generateNextId(Pastor, "pastor_family_id", "PTFAM");

    res.json({ pastor_id: pastorId, pastor_family_id: pastorFamilyId });

  } catch (err) {
    console.error("Init ID Error:", err);
    res.status(500).json({ message: "Failed to generate IDs" });
  }
};

// -------------------------
// Add Pastor
// -------------------------
exports.addPastor = (req, res) => {
  uploadPastorPhoto(req, res, async (err) => {
    try {
      if (err) {
        console.log("Multer error:", err);
        return res.status(400).json({ message: "File upload error" });
      }

      let contact_numbers = [];
      if (req.body.contact_numbers) {
        contact_numbers = req.body.contact_numbers
          .split(",")
          .map(n => n.trim())
          .filter(n => n !== "");
      }

      const newPastor = new Pastor({
        pastor_id: req.body.pastor_id,
        pastor_family_id: req.body.pastor_family_id,
        pastor_name: req.body.pastor_name,
        pastor_tamil_name: req.body.pastor_tamil_name,
        title: req.body.title,
        tamil_title: req.body.tamil_title,
        pastor_role: req.body.pastor_role,
        contact_numbers,
        dob: req.body.dob,
        age: req.body.age,
        gender: req.body.gender,
        aadhar_number: req.body.aadhar_number,
        joining_date: req.body.joining_date,
        marriage_date: req.body.marriage_date,
        email: req.body.email,
        residential_address: req.body.residential_address,
        pastor_photo: req.file?.filename || null,
        status: "Active"
      });

      await newPastor.save();
      return res.json({ message: "Pastor created successfully" });

    } catch (error) {
      console.error("Pastor Add Error:", error);
      return res.status(500).json({ message: "Error adding pastor" });
    }
  });
};

// -------------------------
// Get All Pastors
// -------------------------
exports.getPastors = async (req, res) => {
  try {
    let { page = 1, search = "", status = "All" } = req.query;
    page = Number(page);

    const limit = 15;
    const skip = (page - 1) * limit;
    const filter = {};

    if (status !== "All") filter.status = status;

    if (search.trim() !== "") {
      filter.$or = [
        { pastor_id: { $regex: search, $options: "i" } },
        { pastor_name: { $regex: search, $options: "i" } },
        { pastor_tamil_name: { $regex: search, $options: "i" } }
      ];
    }

    const totalDocs = await Pastor.countDocuments(filter);
    const pastors = await Pastor.find(filter)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      current_page: page,
      total_pages: Math.ceil(totalDocs / limit),
      total_count: totalDocs,
      data: pastors
    });

  } catch (err) {
    console.error("Pastor Fetch Error:", err);
    res.status(500).json({ message: "Failed to fetch pastors" });
  }
};

// -------------------------
// Get Pastor by ID
// -------------------------
exports.getPastorById = async (req, res) => {
  try {
    const pastor = await Pastor.findById(req.params.id);

    if (!pastor) {
      return res.status(404).json({ message: "Pastor not found" });
    }

    res.json({ message: "Success", data: pastor });

  } catch (err) {
    console.error("Get Pastor Error:", err);
    res.status(500).json({ message: "Failed to fetch pastor" });
  }
};

// -------------------------
// Update Pastor
// -------------------------
// exports.updatePastor = (req, res) => {
//   uploadPastorPhoto(req, res, async (err) => {
//     try {
//       if (err) return res.status(400).json({ message: "File upload error" });

//       let contact_numbers = [];
//       if (req.body.contact_numbers) {
//         contact_numbers = req.body.contact_numbers
//           .split(",")
//           .map(n => n.trim())
//           .filter(n => n !== "");
//       }

//       const updateData = {
//         pastor_name: req.body.pastor_name,
//         pastor_tamil_name: req.body.pastor_tamil_name,
//         title: req.body.title,
//         tamil_title: req.body.tamil_title,
//         pastor_role: req.body.pastor_role,
//         contact_numbers,
//         dob: req.body.dob,
//         age: req.body.age,
//         gender: req.body.gender,
//         aadhar_number: req.body.aadhar_number,
//         joining_date: req.body.joining_date,
//         marriage_date: req.body.marriage_date,
//         email: req.body.email,
//         residential_address: req.body.residential_address,
//         status: req.body.status,
//         left_date: req.body.left_date || "",
//         inactive_reason: req.body.inactive_reason || ""
//       };

//       if (req.file) updateData.pastor_photo = req.file.filename;

//       const updated = await Pastor.findByIdAndUpdate(req.params.id, updateData, {
//         new: true
//       });

//       if (!updated) return res.status(404).json({ message: "Pastor not found" });

//       res.json({ message: "Pastor updated successfully", pastor: updated });

//     } catch (error) {
//       console.error("Pastor Update Error:", error);
//       res.status(500).json({ message: "Error updating pastor" });
//     }
//   });
// };

exports.updatePastor = (req, res) => {
  uploadPastorPhoto(req, res, async (err) => {
    try {
      if (err) return res.status(400).json({ message: "File upload error" });

      let contact_numbers = [];
      if (req.body.contact_numbers) {
        contact_numbers = req.body.contact_numbers
          .split(",")
          .map(n => n.trim())
          .filter(n => n !== "");
      }

      const pastor = await Pastor.findById(req.params.id);
      if (!pastor) {
        return res.status(404).json({ message: "Pastor not found" });
      }

      // Update base fields
      pastor.pastor_name = req.body.pastor_name;
      pastor.pastor_tamil_name = req.body.pastor_tamil_name;
      pastor.title = req.body.title;
      pastor.tamil_title = req.body.tamil_title;
      pastor.pastor_role = req.body.pastor_role;
      pastor.contact_numbers = contact_numbers;
      pastor.dob = req.body.dob;
      pastor.age = req.body.age;
      pastor.gender = req.body.gender;
      pastor.aadhar_number = req.body.aadhar_number;
      pastor.joining_date = req.body.joining_date;
      pastor.marriage_date = req.body.marriage_date;
      pastor.email = req.body.email;
      pastor.residential_address = req.body.residential_address;

      // Status update
      const newStatus = req.body.status;
      pastor.status = newStatus;
      pastor.left_date = req.body.left_date || "";
      pastor.inactive_reason = req.body.inactive_reason || "";

      // If pastor becomes inactive → Make all family members inactive
      if (newStatus === "Inactive") {
        pastor.family_members.forEach(member => {
          member.status = "Inactive";
          member.left_date = req.body.left_date || "";
          member.inactive_reason = req.body.inactive_reason || "Pastor Inactivated";
        });
      }

      if (req.file) {
        pastor.pastor_photo = req.file.filename;
      }

      await pastor.save();

      res.json({
        message: "Pastor updated successfully",
        pastor
      });

    } catch (error) {
      console.error("Pastor Update Error:", error);
      res.status(500).json({ message: "Error updating pastor" });
    }
  });
};


exports.getNextFamilyMemberId = async (req, res) => {
  try {
    const pastorId = req.params.id;
    const pastor = await Pastor.findById(pastorId);

    if (!pastor) {
      return res.status(404).json({ message: "Pastor not found" });
    }

    const nextId = generateNextFamilyMemberId(
      pastor.pastor_id,
      pastor.family_members
    );

    res.json({
      message: "Success",
      next_member_id: nextId
    });

  } catch (err) {
    console.error("Next Member ID Error:", err);
    res.status(500).json({ message: "Failed to generate next member ID" });
  }
};

// -------------------------
// Add Family Member
// -------------------------
exports.addPastorFamilyMember = async (req, res) => {
  uploadMemberPhoto(req, res, async (err) => {
    try {
      if (err) return res.status(400).json({ message: "File upload error" });

      const pastor = await Pastor.findById(req.params.id);
      if (!pastor) return res.status(404).json({ message: "Pastor not found" });

      const member_id = generateNextFamilyMemberId(
        pastor.pastor_id,
        pastor.family_members
      );

      let contact_numbers = [];
      if (req.body.contact_numbers) {
        contact_numbers = req.body.contact_numbers
          .split(",")
          .map(n => n.trim())
          .filter(n => n !== "");
      }

      const newMember = {
        member_id,
        name: req.body.name,
        tamil_name: req.body.tamil_name,
        relation: req.body.relation,
        gender: req.body.gender,
        dob: req.body.dob,
        age: req.body.age,
        aadhar_number: req.body.aadhar_number,
        email: req.body.email,
        contact_numbers,
        member_photo: req.file?.filename || null,
        status: "Active"
      };

      pastor.family_members.push(newMember);
      await pastor.save();

      res.json({ message: "Family member added", member: newMember });

    } catch (err) {
      console.error("Add Family Member Error:", err);
      res.status(500).json({ message: "Failed to add family member" });
    }
  });
};

exports.getPastorFamilyMembers = async (req, res) => {
  try {
    const { id } = req.params; // pastor MongoDB _id
    let { page = 1, limit = 10, search = "", status = "All" } = req.query;

    page = Number(page);
    limit = Number(limit);

    const pastor = await Pastor.findById(id);

    if (!pastor) {
      return res.status(404).json({ message: "Pastor not found" });
    }

    // Build combined list (Pastor + Members)
    let members = [
      {
        _id: pastor._id + "_pastor",
        member_id: pastor.pastor_id,
        name: pastor.pastor_name,
        relation: "Pastor",
        status: pastor.status
      },
      ...pastor.family_members
    ];

    // Search Filter
    if (search.trim() !== "") {
      const s = search.toLowerCase();
      members = members.filter(
        (m) =>
          m.name.toLowerCase().includes(s) ||
          m.member_id.toLowerCase().includes(s)
      );
    }

    // Status filter
    if (status !== "All") {
      members = members.filter((m) => m.status === status);
    }

    // Pagination
    const total = members.length;
    const start = (page - 1) * limit;
    const paginated = members.slice(start, start + limit);

    res.json({
      message: "Success",
      total,
      total_pages: Math.ceil(total / limit),
      current_page: page,
      data: paginated
    });

  } catch (err) {
    console.error("Family Member Fetch Error:", err);
    res.status(500).json({ message: "Failed to fetch family members" });
  }
};

exports.updatePastorFamilyMember = async (req, res) => {
  try {
    const { pastorId, memberId } = req.params;

    const pastor = await Pastor.findById(pastorId);
    if (!pastor) {
      return res.status(404).json({ message: "Pastor not found" });
    }

    const member = pastor.family_members.id(memberId);
    if (!member) {
      return res.status(404).json({ message: "Family Member not found" });
    }

    // Convert contact_numbers if present
    let updates = { ...req.body };

    if (updates.contact_numbers) {
      updates.contact_numbers = updates.contact_numbers
        .split(",")
        .map((n) => n.trim())
        .filter((n) => n !== "");
    }

    // Apply updates
    Object.keys(updates).forEach((key) => {
      member[key] = updates[key];
    });

    // Photo upload
    if (req.file) {
      member.member_photo = req.file.filename;
    }

    await pastor.save();

    res.json({
      message: "Family Member Updated Successfully",
      data: member
    });

  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};


// exports.transferFamilyMember = async (req, res) => {

//   try {
//     const { pastorId, memberId } = req.params;
//     const body = req.body || {}; // expected fields from frontend:
//     // { member_id, member_type, isHead, family_id, relation_with_head, membership_status, member_title, member_tamil_title }

//     const pastor = await Pastor.findById(pastorId);
//     if (!pastor) return res.status(404).json({ message: "Pastor not found" });

//     // const famMember =
//     //   pastor.family_members.id(memberId) ||
//     //   pastor.family_members.find(m => m.member_id === memberId);

//     // if (!famMember) return res.status(404).json({ message: "Family member not found" });

//     // let famMember =
//     //   pastor.family_members.id(memberId) ||
//     //   pastor.family_members.find(m => m._id.toString() === memberId) ||
//     //   pastor.family_members.find(m => m.member_id === memberId);

//     // if (!famMember) {
//     //   console.log("memberId received:", memberId);
//     //   console.log("Available IDs:", pastor.family_members.map(m => ({ _id: m._id, member_id: m.member_id })));
//     //   return res.status(404).json({ message: "Family member not found" });
//     // }
//     let famMember =
//       pastor.family_members.id(memberId) ||
//       pastor.family_members.find(m => m._id.toString() === memberId) ||
//       pastor.family_members.find(m => m.member_id === memberId);

//     // ⭐ If not found inside family_members array,
//     //    it might be THE PASTOR himself.
//     if (!famMember) {
//       if (pastor._id.toString() === memberId || pastor.pastor_id === memberId) {
//         famMember = {
//           member_id: pastor.pastor_id,
//           name: pastor.pastor_name,
//           tamil_name: pastor.pastor_tamil_name,
//           gender: pastor.gender,
//           dob: pastor.dob,
//           age: pastor.age,
//           aadhar_number: pastor.aadhar_number,
//           email: pastor.email,
//           contact_numbers: pastor.contact_numbers,
//           member_photo: pastor.pastor_photo,
//           relation: "Pastor",
//           status: pastor.status
//         };
//       } else {
//         return res.status(404).json({ message: "Family member not found" });
//       }
//     }



//     // Validate required payload
//     if (!body.member_id || !body.member_type) {
//       return res.status(400).json({ message: "member_id and member_type are required" });
//     }

//     // Ensure unique member_id
//     const existing = await Member.findOne({ member_id: body.member_id });
//     if (existing) return res.status(400).json({ message: "Member ID already exists" });
//     // Special Case: transferring the pastor himself
//     if (
//       pastor._id.toString() === req.params.memberId ||
//       pastor.pastor_id === req.params.memberId
//     ) {
//       // Fetch new Member ID for pastor
//       const init = await axios.get(`${process.env.API_URL}/api/new-members/init`);
//       body.member_id = init.data.memberId; // <-- Use generated MBRxxxxx
//     }


//     // Build new member object based on your Members schema
//     const newMemberData = {
//       member_id: body.member_id,
//       member_type: body.member_type,
//       isHead: body.isHead === "Yes" ? "Yes" : "No",
//       family_id: body.family_id || "",               // may be set below for Head
//       relation_with_head: (body.isHead === "Yes") ? "Head" : (body.relation_with_head || ""),
//       member_name: famMember.name || "",
//       member_tamil_name: famMember.tamil_name || "",
//       member_title: body.member_title || "",
//       member_tamil_title: body.member_tamil_title || "",
//       father_name: body.father_name || "", // optional, could be auto-filled on client
//       mother_name: body.mother_name || "",
//       gender: famMember.gender || "",
//       dob: famMember.dob || "",
//       age: famMember.age || (famMember.dob ? undefined : undefined),
//       place_of_birth: body.place_of_birth || "",
//       aadhar_number: famMember.aadhar_number || "",
//       blood_group: body.blood_group || "",
//       joining_date: body.joining_date || "",

//       email: famMember.email || "",
//       qualification: body.qualification || "",
//       occupation: body.occupation || "",
//       community: body.community || "",
//       nationality: body.nationality || "",
//       contact_numbers: Array.isArray(famMember.contact_numbers) ? famMember.contact_numbers : (famMember.contact_numbers ? String(famMember.contact_numbers).split(",").map(s => s.trim()) : []),
//       photo: "",

//       // dual membership defaults
//       is_dual_member: body.is_dual_member || "",
//       dual_member_id: body.dual_member_id || "",
//       church_name: body.church_name || "",

//       // address fields (optional - can be empty)
//       present_address: body.present_address || pastor.residential_address || "",
//       permanent_address: body.permanent_address || "",
//       present_pincode: body.present_pincode || "",
//       permanent_pincode: body.permanent_pincode || "",
//       zone: body.zone || "",
//       area: body.area || "",

//       // spiritual/marital fields if available
//       baptism: body.baptism || "",
//       baptism_date: body.baptism_date || "",
//       confirmation: body.confirmation || "",
//       marital_status: body.marital_status || "",
//       marriage_date: body.marriage_date || "",
//       marriage_place: body.marriage_place || "",

//       status: "Active",
//       membership_status: body.membership_status || "Unhold",
//     };

//     // Handle photo copy if pastor family member has member_photo
//     if (famMember.member_photo) {
//       const src = path.join(__dirname, "..", "uploads", "pastors", famMember.member_photo);
//       if (fs.existsSync(src)) {
//         // build dest name & copy
//         const timestamp = Date.now();
//         // keep original extension
//         const destFilename = `${timestamp}-${famMember.member_photo}`;
//         const destDir = path.join(__dirname, "..", "uploads", "memberPhotos");
//         if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

//         const dest = path.join(destDir, destFilename);
//         fs.copyFileSync(src, dest);

//         // Member schema expects photo path like '/uploads/memberPhotos/<file>'
//         newMemberData.photo = `/uploads/memberPhotos/${destFilename}`;
//       }
//     }

//     // If isHead => create Family document (manual family_id must be provided)
//     if (body.isHead === "Yes") {
//       if (!body.family_id || !body.family_id.startsWith("FAM")) {
//         return res.status(400).json({ message: "Valid family_id required for new head" });
//       }

//       // Check family uniqueness
//       const existsFam = await Family.findOne({ family_id: body.family_id });
//       if (existsFam) {
//         return res.status(400).json({ message: "Family ID already exists" });
//       }

//       // Create family doc
//       await Family.create({
//         family_id: body.family_id,
//         head: {
//           member_id: newMemberData.member_id,
//           member_name: newMemberData.member_name,
//           member_tamil_name: newMemberData.member_tamil_name || "",
//           member_title: newMemberData.member_title || "",
//           member_tamil_title: newMemberData.member_tamil_title || ""
//         },
//         members: [
//           {
//             member_id: newMemberData.member_id,
//             member_name: newMemberData.member_name,
//             member_tamil_name: newMemberData.member_tamil_name || "",
//             relation_with_head: "Head",
//             member_title: newMemberData.member_title || "",
//             member_tamil_title: newMemberData.member_tamil_title || ""
//           }
//         ]
//       });

//       newMemberData.family_id = body.family_id;
//       newMemberData.relation_with_head = "Head";
//     } else {
//       // NOT Head -> ensure family exists and push into family.members
//       if (!body.family_id) {
//         return res.status(400).json({ message: "family_id required for non-head member" });
//       }
//       const family = await Family.findOne({ family_id: body.family_id });
//       if (!family) return res.status(404).json({ message: "Family not found" });

//       // push member into family document
//       await Family.updateOne(
//         { family_id: body.family_id },
//         {
//           $push: {
//             members: { 
//               member_id: newMemberData.member_id,
//               member_name: newMemberData.member_name,
//               member_tamil_name: newMemberData.member_tamil_name || "",
//               relation_with_head: newMemberData.relation_with_head || ""
//             }
//           }
//         }
//       );

//       // attach family id to new member
//       newMemberData.family_id = body.family_id;
//     }

//     // Finally, create Member document
//     const created = await Member.create(newMemberData);

//     return res.status(200).json({
//       message: "Member transferred successfully",
//       data: created
//     });

//   } catch (err) {
//     console.error("Transfer Family Member Error:", err);
//     return res.status(500).json({ message: "Failed to transfer family member", error: err.message });
//   }
// };

exports.transferFamilyMember = async (req, res) => {
  try {
    const { pastorId, memberId } = req.params;
    const body = req.body;

    const pastor = await Pastor.findById(pastorId);
    if (!pastor) {
      return res.status(404).json({ message: "Pastor not found" });
    }

    let source;
    let isPastorTransfer = false;

    // 🟢 PASTOR TRANSFER
    if (!memberId) {
      isPastorTransfer = true;
      source = {
        name: pastor.pastor_name,
        tamil_name: pastor.pastor_tamil_name,
        gender: pastor.gender,
        dob: pastor.dob,
        age: pastor.age,
        aadhar_number: pastor.aadhar_number,
        email: pastor.email,
        contact_numbers: pastor.contact_numbers
      };
    }
    // 🟡 FAMILY MEMBER TRANSFER
    else {
      const famMember = pastor.family_members.id(memberId);
      if (!famMember) {
        return res.status(404).json({ message: "Family member not found" });
      }
      source = famMember;
    }

    // ❗ Prevent duplicate Member ID
    const exists = await Member.findOne({ member_id: body.member_id });
    if (exists) {
      return res.status(400).json({ message: "Member ID already exists" });
    }

    // 🟢 CREATE MEMBER
    const newMember = await Member.create({
      member_id: body.member_id,
      member_type: body.member_type,
      isHead: body.isHead,
      family_id: body.family_id,
      relation_with_head: body.isHead === "Yes" ? "Head" : body.relation_with_head,

      member_name: source.name,
      member_tamil_name: source.tamil_name || "",
      gender: source.gender,
      dob: source.dob,
      age: source.age,
      aadhar_number: source.aadhar_number,
      email: source.email || "",
      contact_numbers: source.contact_numbers || [],

      status: "Active",
      membership_status: "Unhold"
    });

    // 🟢 CREATE / UPDATE FAMILY
    if (body.isHead === "Yes") {
      await Family.create({
        family_id: body.family_id,
        head: {
          member_id: newMember.member_id,
          member_name: newMember.member_name,
          member_tamil_name: newMember.member_tamil_name
        },
        members: [
          {
            member_id: newMember.member_id,
            member_name: newMember.member_name,
            member_tamil_name: newMember.member_tamil_name,
            relation_with_head: "Head"
          }
        ]
      });
    } else {
      await Family.updateOne(
        { family_id: body.family_id },
        {
          $push: {
            members: {
              member_id: newMember.member_id,
              member_name: newMember.member_name,
              member_tamil_name: newMember.member_tamil_name,
              relation_with_head: body.relation_with_head
            }
          }
        }
      );
    }

    return res.status(201).json({
      message: "Member transferred successfully",
      data: newMember
    });

  } catch (err) {
    console.error("Transfer Error:", err);
    res.status(500).json({ message: "Transfer failed", error: err.message });
  }
};

// -------------------------
// Get Active Pastors (for dropdown)
// -------------------------
exports.getActivePastors = async (req, res) => {
  try {
    const pastors = await Pastor.find(
      { status: "Active" },
      {
        pastor_id: 1,
        pastor_name: 1,
        pastor_tamil_name: 1,
        title: 1
      }
    ).sort({ pastor_name: 1 });

    res.json({ data: pastors });
  } catch (err) {
    console.error("Active Pastor Fetch Error:", err);
    res.status(500).json({ message: "Failed to fetch pastors" });
  }
};
