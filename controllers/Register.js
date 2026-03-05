const Member = require("../Schema/memberSchema");
const Family = require("../Schema/familySchema");
const generateMemberCode = require("../util/MemberCodeGenerate");
const generateFamilyCode = require("../util/FamilyId");
const path = require('path');
exports.NewFamily = async (req, res) => {
  // console.log(req.files);
  // const member_photo = req.files?.member_photo?.[0]?.buffer || null;
  const member_photo = req.file ? `/uploads/${req.file.filename}` : '';
  let member_id;
  let family_id;

  member_id = await generateMemberCode();
  // console.log("Generated member_id:", member_id);
  family_id = await generateFamilyCode();
  // console.log("Generated family_id:", family_id);

  req.body.member_id = member_id;
  req.body.member_photo = member_photo;

  const newFamily = new Family({
    family_id: family_id,
    head: req.body.member_id,
    members: [],
  });
  const savedFamily = await newFamily.save();

  req.body.primary_family_id = savedFamily.family_id;
  try {
    const newData = new Member({
      ...req.body,
    });
    const savedMember = await newData.save(); // create the member
    return res
      .status(201)
      .json({ message: "Member Register Success", savedMember });
  } catch (error) {
    console.error("Error saving member:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to register member", error: error.message });
  }
};


exports.NewMember = async (req, res) => {
  const member_photo = req.file ? `/uploads/${req.file.filename}` : '';
  const { id } = req.params;

  if (id) {
    let member_id;

    // ✅ Use frontend-provided member_id if present (like MBR000001-A)
    if (req.body.member_id && req.body.member_id.startsWith("MBR")) {
      member_id = req.body.member_id;
    } else {
      // Otherwise fall back to normal sequential generator
      member_id = await generateMemberCode();
    }

    req.body.member_id = member_id;
    req.body.member_photo = member_photo;

    try {
      const familyList = await Family.find({ family_id: id });
      const family = familyList[0];
      if (family) {
        // Push into members array
        family.members.push({
          relationship_with_family_head: req.body.relationship_with_family_head,
          ref_id: member_id,
        });
        await family.save();

        delete req.body.relationship_with_family_head;
        req.body.primary_family_id = family.family_id;

        const newData = new Member({ ...req.body });
        const savedMember = await newData.save();

        return res.status(201).json({ message: "Member Register Success", savedMember });
      } else {
        return res.status(404).json({ message: "Family not found" });
      }
    } catch (error) {
      console.error("Error saving member:", error.message);
      return res.status(500).json({ message: "Failed to register member", error: error.message });
    }
  }
};