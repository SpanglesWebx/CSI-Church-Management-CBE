const { launchBrowser } = require("../util/puppeteer");
const Member = require("../Schema/memberSchema");
const Family = require("../Schema/familySchema");
const { generateNextId } = require("../util/MemberCodeGenerate");
const resequenceFamilyChildren = require("../util/resequenceFamily");


exports.getInitialIds = async (req, res) => {
  try {
    const nextMemberId = await generateNextId(Member, "member_id", "MBR");

    res.json({
      memberId: nextMemberId
    });

  } catch (err) {
    res.status(500).json({ message: "Error generating IDs" });
  }
};

exports.validateHead = async (req, res) => {
  try {
    const { headMemberId, isPreparatory } = req.body;

    const head = await Member.findOne({ member_id: headMemberId });
    if (!head) {
      return res.status(404).json({ message: "Head Member not found" });
    }

    const family = await Family.findOne({ "head.member_id": headMemberId });
    if (!family) {
      return res.status(404).json({ message: "Family not found" });
    }

    const base = headMemberId.split("/")[0];

    let nextMemberId;

    // CASE 1 → Preparatory Member
    if (isPreparatory) {
      const existingSubs = family.members
        .filter(m => m.member_id.startsWith(base + "/"))
        .map(m => Number(m.member_id.split("/")[1]));

      let nextSub = 2;
      while (existingSubs.includes(nextSub)) nextSub++;

      nextMemberId = `${base}/${nextSub}`;
    }

    // CASE 2 → Not preparatory (Full member, Dual member, etc)
    else {
      // Generate next MAIN ID → MBR00002, MBR00003 etc
      const nextBaseId = await generateNextId(Member, "member_id", "MBR");

      // Then always assign `/1`
      nextMemberId = `${nextBaseId}/1`;
    }

    res.json({
      familyId: family.family_id,
      headName: head.member_name,
      nextMemberId
    });

  } catch (err) {
    res.status(500).json({ message: "Validation error", error: err.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const data = req.body;
    // attach titles (English + Tamil)
    data.member_title = data.member_title || "";
    data.member_tamil_title = data.member_tamil_title || "";


    // If a photo is uploaded
    if (req.file) {
      data.photo = `/uploads/memberPhotos/${req.file.filename}`;
    }

    // sanitize / age safe conversion
    if (data.age !== undefined && data.age !== null && data.age !== "") {
      const ageNum = Number(data.age);
      data.age = isNaN(ageNum) ? undefined : ageNum;
    } else {
      data.age = undefined;
    }

    // sanitize primary contact
    if (data.primary_contact_number) {
      data.primary_contact_number = data.primary_contact_number.replace(/\D/g, "").slice(0, 10);
    }


    // If head → relation_with_head MUST BE "Head"
    if (data.isHead === "Yes") {
      data.relation_with_head = "Head";
    }

    // Create member first
    const createdMember = await Member.create(data);




    //Manual Family ID
    if (data.isHead === "Yes") {

      // Use family_id from frontend (manual)
      let newFamilyId = data.family_id;

      if (!newFamilyId || !newFamilyId.startsWith("FAM")) {
        return res.status(400).json({ message: "Valid Family ID required" });
      }

      // Check if this Family ID already exists
      const exists = await Family.findOne({ family_id: newFamilyId });
      if (exists) {
        return res.status(400).json({ message: "Family ID already exists" });
      }

      // Create family document using manual family ID
      await Family.create({
        family_id: newFamilyId,
        head: {
          member_id: data.member_id,
          member_name: data.member_name,
          member_tamil_name: data.member_tamil_name || "",
          member_title: data.member_title || "",
          member_tamil_title: data.member_tamil_title || ""
        },
        members: [
          {
            member_id: data.member_id,
            member_name: data.member_name,
            member_tamil_name: data.member_tamil_name || "",
            member_title: data.member_title || "",
            member_tamil_title: data.member_tamil_title || "",
            relation_with_head: "Head"
          }
        ]
      });

      // Save member details
      await Member.updateOne(
        { _id: createdMember._id },
        {
          family_id: newFamilyId,
          relation_with_head: "Head",
          isHead: "Yes"
        }
      );
    }


    // CASE 2: Normal member (Not head)
    else {
      await Family.updateOne(
        { family_id: data.family_id },
        {
          $push: {
            members: {
              member_id: data.member_id,
              member_name: data.member_name,
              member_tamil_name: data.member_tamil_name || "",
              relation_with_head: data.relation_with_head || "",
              member_title: data.member_title || "",            // NEW
              member_tamil_title: data.member_tamil_title || "" // NEW
            }
          }
        }
      );
    }

    res.status(200).json({
      message: "Member added successfully",
      data: createdMember
    });

  } catch (err) {
    console.error("Add Member Error:", err);
    res.status(500).json({ message: "Error saving member", error: err.message });
  }
};


exports.getMembers = async (req, res) => {
  try {
    let { page = 1, search = "", status = "All", limit = 50, phone = "", address = "" } = req.query;

    page = Number(page);
    limit = Number(limit) || 50;

    const skip = (page - 1) * limit;
    let filter = {};

    if (status !== "All") {
      filter.status = status;
    }

    const regexSearch = search.trim() ? new RegExp(search, "i") : null;
    const phoneRegex = phone.trim() ? new RegExp("^" + phone) : null;
    const addressRegex = address.trim() ? new RegExp(address, "i") : null;

    let orConditions = [];

    if (regexSearch) {
      orConditions.push(
        { member_id: regexSearch },
        { member_name: regexSearch },
        { member_tamil_name: regexSearch }
      );
    }

    if (phoneRegex) {
      orConditions.push(
        { primary_contact_number: phoneRegex },
        { contact_numbers: phoneRegex }
      );
    }

    if (addressRegex) {
      orConditions.push(
        { present_address: addressRegex },
        { permanent_address: addressRegex }
      );
    }

    if (orConditions.length) {
      filter.$or = orConditions;
    }



    const totalCount = await Member.countDocuments(filter);

    const members = await Member.find(filter, {
      member_id: 1,
      member_name: 1,
      member_tamil_name: 1,
      present_address: 1,
      permanent_address: 1,
      primary_contact_number: 1,
      contact_numbers: 1,
      dob: 1,
      age: 1,
      status: 1,
    })
      .sort({ member_id: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: members,
      totalPages,
      currentPage: page,
      limit
    });

  } catch (err) {
    res.status(500).json({ message: "Error fetching members", error: err.message });
  }
};


exports.getMemberById = async (req, res) => {
  try {
    const mongoId = req.params.id;

    // 1️⃣ Fetch Member
    const member = await Member.findById(mongoId);

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // 2️⃣ Fetch Family using member.family_id
    const family = await Family.findOne({ family_id: member.family_id });

    let head_name = "";
    let head_member_id = "";
    let relation_with_head = member.relation_with_head || "";

    // If member is HEAD
    if (member.isHead === "Yes") {
      head_name = member.member_name;
      head_member_id = member.member_id;
    }

    // If member is NOT head
    else if (family) {
      head_name = family.head?.member_name || "";
      head_member_id = family.head?.member_id || "";
    }

    res.json({
      message: "Member fetched successfully",
      data: {
        ...member._doc,

        // Extra fields for View Page
        head_name,
        head_member_id,
        relation_with_head,
        family_members: family?.members || []
      }
    });

  } catch (err) {
    res.status(500).json({
      message: "Error fetching member",
      error: err.message
    });
  }
};

exports.getNextFamilyId = async (req, res) => {
  try {
    const nextFamilyId = await generateNextId(Family, "family_id", "FAM");

    res.json({ familyId: nextFamilyId });
  } catch (err) {
    res.status(500).json({ message: "Error generating next Family ID" });
  }
};

exports.updateMember = async (req, res) => {
  try {
    const memberObjectId = req.params.id;
    const existing = await Member.findById(memberObjectId);
    if (!existing) return res.status(404).json({ message: "Member not found" });

    if (req.body.member_type && req.body.member_type !== existing.member_type) {
      req.body.old_member_type = existing.member_type;
      req.body.old_member_type_changed_at = new Date();
    }

    if (
      existing.member_type === "Preparatory/Unpaid Member" &&
      req.body.member_type !== "Preparatory/Unpaid Member"
    ) {
      await resequenceFamilyChildren(existing.family_id);
    }


    const data = { ...req.body };

    if (req.file) data.photo = `/uploads/memberPhotos/${req.file.filename}`;
    else data.photo = existing.photo;

    if (Array.isArray(data.contact_numbers)) {
      // already clean
    } else if (typeof data.contact_numbers === "string") {
      data.contact_numbers = data.contact_numbers
        .split(",")
        .map(n => n.trim())
        .filter(Boolean);
    } else {
      data.contact_numbers = [];
    }


Object.keys(data).forEach(k => {
  if (data[k] === undefined || data[k] === null) {
    delete data[k];
  }
});


    if (data.primary_contact_number) {
      data.primary_contact_number = data.primary_contact_number.replace(/\D/g, "").slice(0, 10);
    }



    if (data.age !== undefined) {
      const a = Number(data.age);
      data.age = isNaN(a) ? undefined : a;
    }

    if (existing.isHead === "No" && data.isHead === "No")
      data.family_id = existing.family_id;

    if (data.member_id && data.member_id !== existing.member_id) {
      data.old_member_id = existing.member_id;
      data.old_member_id_changed_at = new Date();
    }

    /* ======================= PROMOTION LOGIC ======================= */
    if (existing.isHead === "No" && data.isHead === "Yes") {

      if (existing.member_type === "Preparatory/Unpaid Member")
        return res.status(400).json({ message: "Preparatory members cannot become head." });

      // ---------- SAME FAMILY HEAD CHANGE ----------
      if (data.makeHeadType === "same_family") {
        const family = await Family.findOne({ family_id: existing.family_id });
        if (!family) return res.status(400).json({ message: "Family not found" });

        const oldHeadId = family.head.member_id;
        const newHeadId = data.member_id || existing.member_id;
        const relation = data.selectedRelationForOldHead || "";

        if (oldHeadId !== newHeadId)
          await Member.updateOne({ member_id: oldHeadId }, { isHead: "No", relation_with_head: relation });

        data.isHead = "Yes";
        data.relation_with_head = "Head";
        data.family_id = family.family_id;

        await Family.updateOne(
          { family_id: family.family_id },
          {
            $set: {
              head: { member_id: newHeadId, member_name: data.member_name || existing.member_name },
              members: family.members.map(m =>
                m.member_id === oldHeadId
                  ? { ...m.toObject(), relation_with_head: relation }
                  : m.member_id === newHeadId
                    ? { ...m.toObject(), relation_with_head: "Head" }
                    : m
              )
            }
          }
        );
      }

      // ---------- NEW FAMILY SPLIT ----------
      else {
        const newFamilyId = data.family_id;
        if (!newFamilyId || !newFamilyId.startsWith("FAM")) {
          return res.status(400).json({ message: "Valid Family ID required" });
        }


        if (await Family.findOne({ family_id: newFamilyId }))
          return res.status(400).json({ message: "Family ID already exists" });

        const oldFamily = await Family.findOne({ family_id: existing.family_id });
        if (oldFamily?.head?.member_id === existing.member_id)
          return res.status(400).json({ message: "Old family head must transfer head first." });

        await Family.updateOne(
          { family_id: existing.family_id },
          { $pull: { members: { member_id: { $in: [existing.member_id, data.member_id] } } } }
        );

        await resequenceFamilyChildren(existing.family_id);
        data.isHead = "Yes";
        data.relation_with_head = "Head";
        data.old_family_id = existing.family_id;
        data.family_changed_at = new Date();
        data.is_transferred = "Yes";
        data.family_id = newFamilyId;

        await Family.create({
          family_id: newFamilyId,
          head: { member_id: data.member_id || existing.member_id, member_name: data.member_name || existing.member_name },
          members: [{ member_id: data.member_id || existing.member_id, member_name: data.member_name || existing.member_name, relation_with_head: "Head" }]
        });
      }
    }

    const updated = await Member.findByIdAndUpdate(memberObjectId, data, { new: true });

    // Sync name / ID across families
    if (data.member_id && existing.member_id !== data.member_id) {
      await Family.updateMany({ "members.member_id": existing.member_id }, { $set: { "members.$.member_id": data.member_id } });
      await Family.updateOne({ "head.member_id": existing.member_id }, { $set: { "head.member_id": data.member_id } });
    }

    if (existing.member_name !== data.member_name && data.member_name) {
      await Family.updateMany({ "members.member_id": data.member_id || existing.member_id }, { $set: { "members.$.member_name": data.member_name } });
      await Family.updateOne({ "head.member_id": data.member_id || existing.member_id }, { $set: { "head.member_name": data.member_name } });
    }

    res.json({ message: "Member updated successfully", updated });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.getMemberByMemberId = async (req, res) => {
  try {
    const memberId = req.params.memberId;

    const member = await Member.findOne({ member_id: memberId });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.json(member);
  } catch (err) {
    res.status(500).json({ message: "Error fetching member" });
  }
};

exports.validateTransferHead = async (req, res) => {
  const { headMemberId } = req.body;

  const family = await Family.findOne({ "head.member_id": headMemberId });

  if (!family)
    return res.status(404).json({ message: "Invalid Family Head ID" });

  return res.json({
    familyId: family.family_id,
    headName: family.head.member_name
  });
};


exports.transferMember = async (req, res) => {
  try {
    const { memberMongoId, newHeadId, newRelation } = req.body;

    const member = await Member.findById(memberMongoId);
    if (!member) return res.status(404).json({ message: "Member not found" });

    const oldFamilyId = member.family_id;

    const targetFamily = await Family.findOne({ "head.member_id": newHeadId });
    if (!targetFamily) return res.status(404).json({ message: "Target family not found" });

    // Store previous ID (important for safe pull)
    const previousMemberId = member.member_id;

    // ========== PREPARATORY ID CHANGE ==========
    if (member.member_type === "Preparatory/Unpaid Member") {
      const base = newHeadId.split("/")[0];

      const used = targetFamily.members
        .filter(m => m.member_id.startsWith(base + "/"))
        .map(m => Number(m.member_id.split("/")[1]));

      let next = 2;
      while (used.includes(next)) next++;

      member.old_member_id = previousMemberId;
      member.member_id = `${base}/${next}`;
    }

    // ========== COMMON TRANSFER DATA ==========
    member.old_family_id = oldFamilyId;
    member.family_id = targetFamily.family_id;
    member.relation_with_head = newRelation;
    member.family_changed_at = new Date();
    member.is_transferred = "Yes";

    await member.save();

    // ---------- Remove from OLD family ----------
    await Family.updateOne(
      { family_id: oldFamilyId },
      { $pull: { members: { member_id: { $in: [previousMemberId] } } } }
    );

    await resequenceFamilyChildren(oldFamilyId);

    // ---------- Add to NEW family ----------
    await Family.updateOne(
      { family_id: targetFamily.family_id },
      {
        $push: {
          members: {
            member_id: member.member_id,
            member_name: member.member_name,
            member_tamil_name: member.member_tamil_name || "",
            relation_with_head: newRelation
          }
        }
      }
    );

    return res.json({ status: "Success", message: "Member transferred successfully" });

  } catch (err) {
    console.error("Transfer Error:", err);
    return res.status(500).json({ message: "Transfer failed", error: err.message });
  }
};

// GET TOTAL MEMBERS COUNT
// exports.getMemberCount = async (req, res) => {
//   try {
//     const totalMembers = await Member.countDocuments();

//     res.json({
//       totalMembers
//     });
//   } catch (err) {
//     res.status(500).json({
//       message: "Error fetching member count",
//       error: err.message
//     });
//   }
// };



exports.getMemberCount = async (req, res) => {
  try {

    const stats = await Member.aggregate([
      {
        $facet: {

          totalMembers: [
            { $count: "count" }
          ],

          memberTypes: [
            {
              $group: {
                _id: "$member_type",
                count: { $sum: 1 }
              }
            }
          ],

          headYes: [
            { $match: { isHead: "Yes" } },
            { $count: "count" }
          ],

          headNo: [
            { $match: { isHead: "No" } },
            { $count: "count" }
          ]

        }
      }
    ]);

    res.json(stats[0]);

  } catch (err) {
    res.status(500).json({
      message: "Error fetching member statistics",
      error: err.message
    });
  }
};

exports.getSubscribedMemberCount = async (req, res) => {
  try {
    const totalSubscribedMembers = await Member.countDocuments({
      member_type: { $ne: "Preparatory/Unpaid Member" }
    });

    return res.status(200).json({
      totalSubscribedMembers
    });
  } catch (error) {
    console.error("Get Subscribed Member Count Error:", error);
    return res.status(500).json({
      message: "Error fetching subscribed member count",
      error: error.message
    });
  }
};


exports.downloadAgeRangePDF = async (req, res) => {
  try {
    const { from, to } = req.query;

    const members = await Member.find({
      age: { $gte: Number(from), $lte: Number(to) }
    }).sort({ age: 1 });

    const totalCount = members.length;

    let template = fs.readFileSync(
      path.join(__dirname, "../templates/memberAgeRange.html"),
      "utf8"
    );

    // Replace header values
    template = template.replace("{{FROM_AGE}}", from);
    template = template.replace("{{TO_AGE}}", to);
    template = template.replace("{{TOTAL_COUNT}}", totalCount);

    // Build table rows
    let rows = "";
    members.forEach((m, i) => {
      rows += `
        <tr>
          <td>${i + 1}</td>
          <td>${m.member_id}</td>
          <td>${m.member_name}</td>
          <td>${m.age || "-"}</td>
        </tr>
      `;
    });

    template = template.replace("<!--ROWS-->", rows);

    const browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setContent(template);
    const pdf = await page.pdf({ format: "A4" });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.send(pdf);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Age PDF error" });
  }
};



