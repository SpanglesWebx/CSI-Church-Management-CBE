// controller/creditorController.js
const Creditor = require("../Schema/CreditorSchema");
const Member = require("../Schema/memberSchema");
const Staff = require("../Schema/staffSchema");
const { generateCreditorId } = require("../util/generateCreditorId");


// 📌 Add Creditor
exports.addCreditor = async (req, res) => {
  try {
    const id = await generateCreditorId(Creditor); // ✅ FIXED

    const creditor = await Creditor.create({
      creditor_id: id,
      name: req.body.name,
      church_name: req.body.church_name,
      primary_contact_number: req.body.primary_contact_number,
      contact_number: req.body.contact_number,
      aadhaar: req.body.aadhaar,
      pincode: req.body.pincode,
      email: req.body.email,
      address: req.body.address,
      bank_name: req.body.bank_name,
      account_number: req.body.account_number,
      ifsc_code: req.body.ifsc_code,
      micr_code: req.body.micr_code,
      branch_name: req.body.branch_name,
      branch_phone: req.body.branch_phone,
      status: "Active",
    });


    return res.json({ status: "Success", data: creditor });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "Failed", message: "Server error" });
  }
};

// 📌 List Creditors (pagination + search + date)
exports.listCreditors = async (req, res) => {
  try {
    let { page = 1, limit = 25, search, startDate, endDate } = req.query;
    page = Number(page);

    const query = {};

    // Search by name OR id OR phone
    if (search) {
      query.$or = [
        { creditor_id: new RegExp(search, "i") },
        { name: new RegExp(search, "i") },
        { phone: new RegExp(search, "i") }
      ];
    }

    // Filter by date range
    if (startDate && endDate) {
      query.created_at = { $gte: startDate, $lte: endDate };
    }

    const total = await Creditor.countDocuments(query);

    const creditors = await Creditor.find(query)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({
      status: "Success",
      total,
      totalPages: Math.ceil(total / limit),
      page,
      creditors
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "Failed", message: "Server error" });
  }
};


// exports.searchCreditorForPayment = async (req, res) => {
//   try {
//     const { q } = req.query;

//     if (!q || !q.trim()) {
//       return res.json([]);
//     }

//     const keyword = q.trim();

//     const creditors = await Creditor.find(
//       {
//         status: "Active",
//         $or: [
//           // 🔥 match anywhere in ID
//           { creditor_id: { $regex: keyword, $options: "i" } },

//           // name search
//           { name: { $regex: keyword, $options: "i" } },

//           // phone search
//           { primary_contact_number: { $regex: keyword, $options: "i" } },
//         ],
//       },
//       {
//         creditor_id: 1,
//         name: 1,
//         primary_contact_number: 1,
//       }
//     )
//       .limit(20)
//       .sort({ name: 1 });

//     if (!creditors.length) {
//       return res.json([
//         { key: "none", label: "No Records Found" },
//       ]);
//     }

//     const result = creditors.map((c) => ({
//       key: c._id,
//       label: `${c.name} (${c.creditor_id}) - ${c.primary_contact_number}`,
//       creditor_id: c.creditor_id,
//       name: c.name,
//       phone: c.primary_contact_number,
//       type: "creditor",
//     }));

//     res.status(200).json(result);
//   } catch (err) {
//     console.error("Creditor search error:", err);
//     res.status(500).json([
//       { key: "none", label: "No Records Found" },
//     ]);
//   }
// };
// 📌 Get one creditor

exports.searchCreditorForPayment = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.json([]);
    }

    const keyword = q.trim();

    // ================= CREDITORS =================
    const creditorsPromise = Creditor.find(
      {
        status: "Active",
        $or: [
          { creditor_id: { $regex: keyword, $options: "i" } },
          { name: { $regex: keyword, $options: "i" } },
          { primary_contact_number: { $regex: keyword, $options: "i" } },
        ],
      },
      {
        creditor_id: 1,
        name: 1,
        primary_contact_number: 1,
      }
    )
      .limit(20)
      .sort({ name: 1 });

    // ================= MEMBERS =================
    const membersPromise = Member.find(
      {
        status: "Active",
        $or: [
          { member_id: { $regex: keyword, $options: "i" } },
          { member_name: { $regex: keyword, $options: "i" } },
          { primary_contact_number: { $regex: keyword, $options: "i" } },
        ],
      },
      {
        member_id: 1,
        member_name: 1,
        primary_contact_number: 1,
      }
    )
      .limit(20)
      .sort({ member_name: 1 });

    // ================= STAFF =================
    const staffPromise = Staff.find(
      {
        status: "Active",
        $or: [
          { employee_id: { $regex: keyword, $options: "i" } },
          { member_name: { $regex: keyword, $options: "i" } },
          { non_member_name: { $regex: keyword, $options: "i" } },
          { phone: { $regex: keyword, $options: "i" } },
          { non_member_phone: { $regex: keyword, $options: "i" } },
        ],
      },
      {
        employee_id: 1,
        member_name: 1,
        non_member_name: 1,
        phone: 1,
        non_member_phone: 1,
        isMember: 1,
      }
    )
      .limit(20)
      .sort({ employee_id: 1 });

    // 🔥 Run all together (fast)
    const [creditors, members, staff] = await Promise.all([
      creditorsPromise,
      membersPromise,
      staffPromise,
    ]);

    // ================= FORMAT RESULTS =================

    const creditorResults = creditors.map((c) => ({
      key: c._id,
      label: `${c.creditor_id} | ${c.name} - ${c.primary_contact_number}`,
      creditor_id: c.creditor_id,
      name: c.name,
      phone: c.primary_contact_number,
      type: "creditor",
    }));

    const memberResults = members.map((m) => ({
      key: m._id,
      label: `${m.member_id} | ${m.member_name} - ${m.primary_contact_number}`,
      creditor_id: m.member_id, // keep same key name for frontend reuse
      name: m.member_name,
      phone: m.primary_contact_number,
      type: "member",
    }));

    const staffResults = staff.map((s) => {
      const name = s.isMember ? s.member_name : s.non_member_name;
      const phone = s.isMember ? s.phone : s.non_member_phone;

      return {
        key: s._id,
        label: `${s.employee_id} | ${name} - ${phone}`,
        creditor_id: s.employee_id, // reuse field
        name,
        phone,
        type: "staff",
      };
    });

    const result = [
      ...creditorResults,
      ...memberResults,
      ...staffResults,
    ];

    if (!result.length) {
      return res.json([{ key: "none", label: "No Records Found" }]);
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Unified search error:", err);
    res.status(500).json([{ key: "none", label: "No Records Found" }]);
  }
};

exports.getCreditor = async (req, res) => {
  try {
    const creditor = await Creditor.findById(req.params.id);
    return res.json({ status: "Success", data: creditor });
  } catch (err) {
    return res.status(500).json({ status: "Failed", message: "Server error" });
  }
};




exports.toggleCreditorStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const creditor = await Creditor.findById(id);
    if (!creditor)
      return res.status(404).json({ status: "Failed", message: "Creditor not found" });

    const newStatus = creditor.status === "Active" ? "Inactive" : "Active";

    creditor.status = newStatus;

    await creditor.save();

    res.json({
      status: "Success",
      message: "Creditor status updated",
      data: creditor,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "Failed", message: "Server error" });
  }
};