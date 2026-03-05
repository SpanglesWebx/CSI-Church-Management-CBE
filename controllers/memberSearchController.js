const Member = require("../Schema/memberSchema");
const Family = require("../Schema/familySchema");
const Pastor = require("../Schema/pastorSchema");
const PastorFamilyMember = require("../Schema/pastorFamilyMemberSchema");
const MenFellowship = require("../Schema/MenFellowship");
const WomenFellowship = require("../Schema/WomenFellowship");
const YouthFellowship = require("../Schema/YouthFellowshipSchema");
const Creditor = require("../Schema/CreditorSchema");



const escapeRegex = (text = "") => {
  // escape regex special chars to avoid regex injection
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Search by name across Member, Pastor, PastorFamilyMember
exports.searchMembers = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ message: "Name query is required" });

    const regex = new RegExp(escapeRegex(name), "i");


    // run queries in parallel for speed
    const [members, pastors, pastorFamilyMembers] = await Promise.all([
      Member.find({ member_name: { $regex: regex } })
        .select("member_id member_name member_tamil_name contact_numbers permanent_address present_address familyId gender status aadhar_number")
        .lean(),
      Pastor.find({ member_name: { $regex: regex } })
        .select("member_id member_name member_tamil_name mobile_number permanent_address present_address familyId pastor_role gender status aadhar_number")
        .lean(),
      PastorFamilyMember.find({ member_name: { $regex: regex } })
        .select("member_id member_name member_tamil_name mobile_number permanent_address present_address familyId relationship_with_family_head gender status aadhar_number")
        .lean()
    ]);

    // normalize and deduplicate by member_id (fallback to Mongo _id if member_id missing)
    const map = new Map();

    // const normalizeAndMerge = (doc, source) => {
    //   const idKey = (doc.member_id && String(doc.member_id).trim()) || String(doc._id);
    //   if (!map.has(idKey)) {
    //     const base = {
    //       member_id: doc.member_id || null,
    //       member_name: doc.member_name || null,
    //       member_tamil_name: doc.member_tamil_name || null,
    //       contact_numbers: Array.isArray(doc.contact_numbers) ? doc.contact_numbers : [],
    //       permanent_address: doc.permanent_address || doc.permanentAddress || null,
    //       present_address: doc.present_address || doc.presentAddress || null,
    //       familyId: doc.familyId || null,
    //       pastor_role: doc.pastor_role || null,
    //       relationship_with_family_head: doc.relationship_with_family_head || null,
    //       gender: doc.gender || null,
    //       status: doc.status || null,
    //       sources: [source],
    //       aadhar_number: doc.aadhar_number || null,
    //     };
    //     map.set(idKey, base);
    //   } else {
    //     // merge: keep missing fields if available, append source
    //     const existing = map.get(idKey);
    //     existing.sources = Array.from(new Set([...existing.sources, source]));
    //     // fill missing fields from doc
    //     const maybeAssign = (field) => {
    //       if ((existing[field] === null || existing[field] === undefined) && doc[field] !== undefined) {
    //         existing[field] = doc[field];
    //       }
    //     };
    //     ["member_name", "member_tamil_name", "contact_numbers", "permanent_address", "present_address", "familyId", "pastor_role", "relationship_with_family_head", "gender", "status", "aadhar_number"].forEach(maybeAssign);
    //   }
    // };

    const normalizeAndMerge = (doc, source) => {
      const idKey = (doc.member_id && String(doc.member_id).trim()) || String(doc._id);

      const extractedMobile = Array.isArray(doc.contact_numbers) && doc.contact_numbers.length > 0
        ? doc.contact_numbers[0]
        : null;

      if (!map.has(idKey)) {
        const base = {
          member_id: doc.member_id || null,
          member_name: doc.member_name || null,
          member_tamil_name: doc.member_tamil_name || null,
          mobile_number: extractedMobile,
          permanent_address: doc.permanent_address || doc.permanentAddress || null,
          present_address: doc.present_address || doc.presentAddress || null,
          familyId: doc.familyId || null,
          pastor_role: doc.pastor_role || null,
          relationship_with_family_head: doc.relationship_with_family_head || null,
          gender: doc.gender || null,
          status: doc.status || null,
          sources: [source],
          aadhar_number: doc.aadhar_number || null,
        };
        map.set(idKey, base);
      } else {
        const existing = map.get(idKey);
        existing.sources = Array.from(new Set([...existing.sources, source]));

        const maybeAssign = (field) => {
          if ((existing[field] === null || existing[field] === undefined) && doc[field] !== undefined) {
            existing[field] = doc[field];
          }
        };

        ["member_name", "member_tamil_name", "permanent_address", "present_address",
          "familyId", "pastor_role", "relationship_with_family_head",
          "gender", "status", "aadhar_number"].forEach(maybeAssign);

        // fix mobile number merge
        if ((existing.mobile_number === null || existing.mobile_number === undefined)
          && Array.isArray(doc.contact_numbers)
          && doc.contact_numbers.length > 0) {
          existing.mobile_number = doc.contact_numbers[0];
        }
      }
    };

    members.forEach(m => normalizeAndMerge(m, "Member"));
    pastors.forEach(p => normalizeAndMerge(p, "Pastor"));
    pastorFamilyMembers.forEach(pf => normalizeAndMerge(pf, "PastorFamilyMember"));

    const results = Array.from(map.values());

    if (!results.length) {
      return res.status(404).json({ message: "No members found" });
    }

    res.json(results);
  } catch (err) {
    console.error("❌ Member search error (combined):", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Search by member_id (startsWith) across Member, Pastor, PastorFamilyMember
// exports.searchMembersById = async (req, res) => {
//   try {
//     const { id } = req.query;
//     if (!id) return res.status(400).json({ message: "ID query is required" });

//     const regex = new RegExp(escapeRegex(id), "i");


//     const [members, pastors, pastorFamilyMembers] = await Promise.all([
//       Member.find({ member_id: { $regex: regex } })
//         .select("member_id member_name member_tamil_name contact_numbers permanent_address present_address familyId gender status aadhar_number")
//         .lean(),
//       Pastor.find({ member_id: { $regex: regex } })
//         .select("member_id member_name member_tamil_name mobile_number permanent_address present_address familyId pastor_role gender status aadhar_number")
//         .lean(),
//       PastorFamilyMember.find({ member_id: { $regex: regex } })
//         .select("member_id member_name member_tamil_name mobile_number permanent_address present_address familyId relationship_with_family_head gender status aadhar_number")
//         .lean()
//     ]);

//     const map = new Map();

//     // const normalizeAndMerge = (doc, source) => {
//     //   const idKey = (doc.member_id && String(doc.member_id).trim()) || String(doc._id);
//     //   if (!map.has(idKey)) {
//     //     const base = {
//     //       member_id: doc.member_id || null,
//     //       member_name: doc.member_name || null,
//     //       member_tamil_name: doc.member_tamil_name || null,
//     //       contact_numbers: Array.isArray(doc.contact_numbers) ? doc.contact_numbers : [],
//     //       permanent_address: doc.permanent_address || null,
//     //       present_address: doc.present_address || null,
//     //       familyId: doc.familyId || null,
//     //       pastor_role: doc.pastor_role || null,
//     //       relationship_with_family_head: doc.relationship_with_family_head || null,
//     //       gender: doc.gender || null,
//     //       status: doc.status || null,
//     //       sources: [source],
//     //       aadhar_number: doc.aadhar_number || null,
//     //     };
//     //     map.set(idKey, base);
//     //   } else {
//     //     const existing = map.get(idKey);
//     //     existing.sources = Array.from(new Set([...existing.sources, source]));
//     //     const maybeAssign = (field) => {
//     //       if ((existing[field] === null || existing[field] === undefined) && doc[field] !== undefined) {
//     //         existing[field] = doc[field];
//     //       }
//     //     };
//     //     ["member_name", "member_tamil_name", "mobile_number", "permanent_address", "present_address", "familyId", "pastor_role", "relationship_with_family_head", "gender", "status", "aadhar_number"].forEach(maybeAssign);
//     //   }
//     // };

//     const normalizeAndMerge = (doc, source) => {
//   const idKey = (doc.member_id && String(doc.member_id).trim()) || String(doc._id);

//   const extractedMobile = Array.isArray(doc.contact_numbers) && doc.contact_numbers.length > 0 
//     ? doc.contact_numbers[0] 
//     : null;

//   if (!map.has(idKey)) {
//     const base = {
//       member_id: doc.member_id || null,
//       member_name: doc.member_name || null,
//       member_tamil_name: doc.member_tamil_name || null,
//       mobile_number: extractedMobile,
//       permanent_address: doc.permanent_address || doc.permanentAddress || null,
//       present_address: doc.present_address || doc.presentAddress || null,
//       familyId: doc.familyId || null,
//       pastor_role: doc.pastor_role || null,
//       relationship_with_family_head: doc.relationship_with_family_head || null,
//       gender: doc.gender || null,
//       status: doc.status || null,
//       sources: [source],
//       aadhar_number: doc.aadhar_number || null,
//     };
//     map.set(idKey, base);
//   } else {
//     const existing = map.get(idKey);
//     existing.sources = Array.from(new Set([...existing.sources, source]));

//     const maybeAssign = (field) => {
//       if ((existing[field] === null || existing[field] === undefined) && doc[field] !== undefined) {
//         existing[field] = doc[field];
//       }
//     };

//     ["member_name", "member_tamil_name", "permanent_address", "present_address",
//      "familyId", "pastor_role", "relationship_with_family_head",
//      "gender", "status", "aadhar_number"].forEach(maybeAssign);

//     // fix mobile number merge
//     if ((existing.mobile_number === null || existing.mobile_number === undefined) 
//         && Array.isArray(doc.contact_numbers) 
//         && doc.contact_numbers.length > 0) {
//       existing.mobile_number = doc.contact_numbers[0];
//     }
//   }
// };

//     members.forEach(m => normalizeAndMerge(m, "Member"));
//     pastors.forEach(p => normalizeAndMerge(p, "Pastor"));
//     pastorFamilyMembers.forEach(pf => normalizeAndMerge(pf, "PastorFamilyMember"));

//     const results = Array.from(map.values());

//     if (!results.length) {
//       return res.status(404).json({ message: "Member not found" });
//     }

//     res.json(results);
//   } catch (err) {
//     console.error("❌ Member ID search error (combined):", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.searchMembersById = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: "ID query is required" });
    }

    const regex = new RegExp(escapeRegex(id), "i");

    const [members, pastors, pastorFamilyMembers] = await Promise.all([
      Member.find({ member_id: { $regex: regex } })
        .select(
          "member_id member_name member_tamil_name contact_numbers permanent_address present_address family_id gender status aadhar_number relation_with_head isHead"
        )
        .lean(),

      Pastor.find({ member_id: { $regex: regex } })
        .select(
          "member_id member_name member_tamil_name mobile_number permanent_address present_address familyId pastor_role gender status aadhar_number"
        )
        .lean(),

      PastorFamilyMember.find({ member_id: { $regex: regex } })
        .select(
          "member_id member_name member_tamil_name mobile_number permanent_address present_address familyId relationship_with_family_head gender status aadhar_number"
        )
        .lean(),
    ]);

    const map = new Map();

    const normalizeAndMerge = (doc, source) => {
      const idKey =
        (doc.member_id && String(doc.member_id).trim()) || String(doc._id);

      // 🔹 MOBILE NUMBER
      const extractedMobile =
        Array.isArray(doc.contact_numbers) && doc.contact_numbers.length > 0
          ? doc.contact_numbers.join(", ")
          : doc.mobile_number || null;

      // 🔹 FAMILY ID
      const extractedFamilyId =
        doc.family_id || doc.familyId || null;

      // 🔹 RELATION WITH HEAD
      const extractedRelation =
        doc.relation_with_head ||
        doc.relationship_with_family_head ||
        null;

      // 🔹 AADHAR
      const extractedAadhar =
        doc.aadhar_number || null;

      // 🔹 IS HEAD (explicit rules)
      let extractedIsHead = null;
      if (doc.isHead) {
        extractedIsHead = doc.isHead; // Member
      } else if (source === "Pastor") {
        extractedIsHead = "Yes";
      } else if (source === "PastorFamilyMember") {
        extractedIsHead = "No";
      }

      if (!map.has(idKey)) {
        map.set(idKey, {
          member_id: doc.member_id || null,
          member_name: doc.member_name || null,
          member_tamil_name: doc.member_tamil_name || null,

          mobile_number: extractedMobile,
          familyId: extractedFamilyId,
          relationship_with_family_head: extractedRelation,
          aadhar_number: extractedAadhar,
          isHead: extractedIsHead,

          permanent_address: doc.permanent_address || null,
          present_address: doc.present_address || null,
          pastor_role: doc.pastor_role || null,
          gender: doc.gender || null,
          status: doc.status || null,

          sources: [source],
        });
      } else {
        const existing = map.get(idKey);

        // merge sources
        existing.sources = Array.from(
          new Set([...existing.sources, source])
        );

        // merge fields (same rule everywhere)
        if (!existing.mobile_number && extractedMobile) {
          existing.mobile_number = extractedMobile;
        }

        if (!existing.familyId && extractedFamilyId) {
          existing.familyId = extractedFamilyId;
        }

        if (
          !existing.relationship_with_family_head &&
          extractedRelation
        ) {
          existing.relationship_with_family_head = extractedRelation;
        }

        if (!existing.aadhar_number && extractedAadhar) {
          existing.aadhar_number = extractedAadhar;
        }

        if (!existing.isHead && extractedIsHead) {
          existing.isHead = extractedIsHead;
        }

        if (!existing.member_name && doc.member_name) {
          existing.member_name = doc.member_name;
        }

        if (!existing.member_tamil_name && doc.member_tamil_name) {
          existing.member_tamil_name = doc.member_tamil_name;
        }

        if (!existing.permanent_address && doc.permanent_address) {
          existing.permanent_address = doc.permanent_address;
        }

        if (!existing.present_address && doc.present_address) {
          existing.present_address = doc.present_address;
        }

        if (!existing.gender && doc.gender) {
          existing.gender = doc.gender;
        }

        if (!existing.status && doc.status) {
          existing.status = doc.status;
        }
      }
    };

    members.forEach((m) => normalizeAndMerge(m, "Member"));
    pastors.forEach((p) => normalizeAndMerge(p, "Pastor"));
    pastorFamilyMembers.forEach((pf) =>
      normalizeAndMerge(pf, "PastorFamilyMember")
    );

    const results = Array.from(map.values());

    if (!results.length) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.json(results);
  } catch (err) {
    console.error("❌ Member ID search error (combined):", err);
    res.status(500).json({ message: "Server error" });
  }
};


// 🔹 Unified search by either ID or Name
exports.searchMembersUnified = async (req, res) => {
  try {
    const { query } = req.query; // can be ID or Name
    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    let filter = {};

    // If query looks like an ID (e.g. starts with MBR + numbers), search by ID
    if (/^MBR\d+/i.test(query)) {
      filter.member_id = { $regex: `^${query}`, $options: "i" };
    } else {
      // Otherwise, search by name
      filter.member_name = { $regex: `^${query}`, $options: "i" };
    }

    const members = await Member.find(filter).select(
      "member_id member_name mobile_number"
    );

    if (!members.length) {
      return res.status(404).json({ message: "No members found" });
    }

    res.json(members);
  } catch (err) {
    console.error("❌ Unified search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Controller for male member search by name
exports.searchMaleMembers = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ message: "Name query is required" });
    }

    // Only male members
    const members = await Member.find({
      member_name: { $regex: `^${name}`, $options: "i" },
      gender: "Male"
    }).select("member_id member_name member_tamil_name mobile_number");

    if (members.length === 0) {
      return res.status(404).json({ message: "No male members found" });
    }

    res.json(members);
  } catch (err) {
    console.error("❌ Male member search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Controller for male member search by ID
exports.searchMaleMembersById = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: "ID query is required" });
    }

    const members = await Member.find({
      member_id: { $regex: `^${id}`, $options: "i" },
      gender: "Male"
    }).select("member_id member_name member_tamil_name mobile_number");

    if (members.length === 0) {
      return res.status(404).json({ message: "No male members found" });
    }

    res.json(members);
  } catch (err) {
    console.error("❌ Male member ID search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Controller for female member search by name
exports.searchFemaleMembers = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ message: "Name query is required" });
    }

    const members = await Member.find({
      member_name: { $regex: `^${name}`, $options: "i" },
      gender: "Female"
    }).select("member_id member_name member_tamil_name mobile_number");

    if (members.length === 0) {
      return res.status(404).json({ message: "No female members found" });
    }

    res.json(members);
  } catch (err) {
    console.error("❌ Female member search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Controller for female member search by ID
exports.searchFemaleMembersById = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: "ID query is required" });
    }

    const members = await Member.find({
      member_id: { $regex: `^${id}`, $options: "i" },
      gender: "Female"
    }).select("member_id member_name member_tamil_name mobile_number");

    if (members.length === 0) {
      return res.status(404).json({ message: "No female members found" });
    }

    res.json(members);
  } catch (err) {
    console.error("❌ Female member ID search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.searchMarriedHusbands = async (req, res) => {
  try {
    const { query = "" } = req.query;

    if (!query) return res.json([]);

    // Escape regex safely
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedQuery, "i");

    // 1️⃣ Find matching members
    const members = await Member.find({
      $or: [
        { member_id: query },
        { member_name: regex }
      ],
      marital_status: "Married"
    }).lean();

    if (!members.length) return res.json([]);

    const husbands = [];

    for (const member of members) {

      // 2️⃣ Find family
      const family = await Family.findOne({
        family_id: member.family_id
      }).lean();

      if (!family) continue;

      // 3️⃣ Find husband in that family
      const husband = await Member.findOne({
        family_id: family.family_id,
        gender: "Male",
        marital_status: "Married"
      })
        .select("member_id member_name member_tamil_name primary_contact_number family_id")
        .lean();

      if (husband) husbands.push(husband);
    }

    res.json(husbands);

  } catch (err) {
    console.error("Error in /married-husbands:", err);
    res.status(500).json({ error: err.message });
  }
};

// Fetch spouse of a given family head
exports.getSpouse = async (req, res) => {
  try {
    const { memberId } = req.query;

    if (!memberId) {
      return res.status(400).json({ message: "memberId is required" });
    }

    // 1️⃣ Find the member
    const member = await Member.findOne({ member_id: memberId }).lean();
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (!member.family_id) {
      return res.status(404).json({ message: "Family not found" });
    }

    // 2️⃣ Find spouse (opposite gender, same family)
    const spouse = await Member.findOne({
      family_id: member.family_id,
      member_id: { $ne: memberId },
      marital_status: "Married"
    })
      .select("member_id member_name member_tamil_name primary_contact_number")
      .lean();

    if (!spouse) {
      return res.status(404).json({ message: "Spouse not found" });
    }

    res.status(200).json(spouse);

  } catch (err) {
    console.error("Error in /get-spouse:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.searchMenFellowshipByName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ message: "Name query is required" });

    const regex = new RegExp("^" + escapeRegex(name), "i");

    const members = await MenFellowship.find({ member_name: { $regex: regex } })
      .select("member_id member_name member_tamil_name mobile_number")
      .lean();

    if (!members.length) {
      return res.status(404).json([{ member_id: "none", member_name: "No member found" }]);
    }

    res.json(members);
  } catch (err) {
    console.error("❌ MenFellowship name search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔍 Search Men Fellowship members by ID
exports.searchMenFellowshipById = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: "ID query is required" });

    const regex = new RegExp("^" + escapeRegex(id), "i");

    const members = await MenFellowship.find({ member_id: { $regex: regex } })
      .select("member_id member_name member_tamil_name mobile_number")
      .lean();

    if (!members.length) {
      return res.status(404).json([{ member_id: "none", member_name: "No member found" }]);
    }

    res.json(members);
  } catch (err) {
    console.error("❌ MenFellowship ID search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔍 Search Women Fellowship members by Name
exports.searchWomenFellowshipByName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ message: "Name query is required" });

    const regex = new RegExp("^" + escapeRegex(name), "i");

    const members = await WomenFellowship.find({ member_name: { $regex: regex } })
      .select("member_id member_name member_tamil_name mobile_number")
      .lean();

    if (!members.length) {
      return res.status(404).json([{ member_id: "none", member_name: "No member found" }]);
    }

    res.json(members);
  } catch (err) {
    console.error("❌ WomenFellowship name search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔍 Search Women Fellowship members by ID
exports.searchWomenFellowshipById = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: "ID query is required" });

    const regex = new RegExp("^" + escapeRegex(id), "i");

    const members = await WomenFellowship.find({ member_id: { $regex: regex } })
      .select("member_id member_name member_tamil_name mobile_number")
      .lean();

    if (!members.length) {
      return res.status(404).json([{ member_id: "none", member_name: "No member found" }]);
    }

    res.json(members);
  } catch (err) {
    console.error("❌ WomenFellowship ID search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.searchYouthFellowshipByName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ message: "Name query is required" });

    const regex = new RegExp("^" + escapeRegex(name), "i");

    const members = await YouthFellowship.find({ member_name: { $regex: regex } })
      .select("member_id member_name member_tamil_name mobile_number")
      .lean();

    if (!members.length) {
      return res
        .status(404)
        .json([{ member_id: "none", member_name: "No member found" }]);
    }

    res.json(members);
  } catch (err) {
    console.error("❌ YouthFellowship name search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔍 Search Youth Fellowship members by ID
exports.searchYouthFellowshipById = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: "ID query is required" });

    const regex = new RegExp("^" + escapeRegex(id), "i");

    const members = await YouthFellowship.find({ member_id: { $regex: regex } })
      .select("member_id member_name member_tamil_name mobile_number")
      .lean();

    if (!members.length) {
      return res
        .status(404)
        .json([{ member_id: "none", member_name: "No member found" }]);
    }

    res.json(members);
  } catch (err) {
    console.error("❌ YouthFellowship ID search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ➤ Search teacher by ID
exports.searchTeacherById = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

    const teachers = await Member.find(
      { member_id: { $regex: query, $options: "i" } },
      "member_id member_name member_tamil_name mobile_number"
    )
      .limit(20)
      .lean();

    res.json(teachers);
  } catch (err) {
    console.error("Error searching teacher by ID:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ➤ Search teacher by Name
exports.searchTeacherByName = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

    const teachers = await Member.find(
      { member_name: { $regex: query, $options: "i" } },
      "member_id member_name member_tamil_name mobile_number"
    )
      .limit(20)
      .lean();

    res.json(teachers);
  } catch (err) {
    console.error("Error searching teacher by Name:", err);
    res.status(500).json({ message: "Server error" });
  }
};