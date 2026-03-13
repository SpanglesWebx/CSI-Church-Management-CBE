const Creditor = require("../Schema/CreditorSchema");
const Member = require("../Schema/memberSchema");
const Staff = require("../Schema/staffSchema");

// Escape regex to prevent injection
const escapeRegex = (text = "") =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");


exports.searchById = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Query required" });

    const regex = new RegExp(escapeRegex(query), "i");

    const [creditors, members, staff] = await Promise.all([
      Creditor.find({ creditor_id: regex })
        .select("creditor_id name primary_contact_number")
        .lean(),

      Member.find({ member_id: regex })
        .select("member_id member_name primary_contact_number")
        .lean(),
      Staff.find({ employee_id: regex })
        .select("employee_id isMember member_name non_member_name phone non_member_phone")
        .lean(),
    ]);

    const results = [];

    creditors.forEach(c =>
      results.push({
        id: c.creditor_id,
        name: c.name,
        phone: c.primary_contact_number || ""
      })
    );

    members.forEach(m =>
      results.push({
        id: m.member_id,
        name: m.member_name,
        phone: m.primary_contact_number || ""
      })
    );
    staff.forEach(s =>
      results.push({
        id: s.employee_id,
        name: s.isMember ? s.member_name : s.non_member_name,
        phone: s.isMember ? s.phone : s.non_member_phone
      })
    );

    res.json({ data: results });

  } catch (err) {
    console.error("ID search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.searchByName = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Query required" });

    const regex = new RegExp(escapeRegex(query), "i");

    const [creditors, members, staff] = await Promise.all([
      Creditor.find({ name: regex })
        .select("creditor_id name primary_contact_number")
        .lean(),

      Member.find({ member_name: regex })
        .select("member_id member_name primary_contact_number")
        .lean(),
      Staff.find({
        $or: [
          { member_name: regex },
          { non_member_name: regex }
        ]
      })
        .select("employee_id isMember member_name non_member_name phone non_member_phone")
        .lean(),
    ]);

    const results = [];

    creditors.forEach(c =>
      results.push({
        id: c.creditor_id,
        name: c.name,
        phone: c.primary_contact_number || ""
      })
    );

    members.forEach(m =>
      results.push({
        id: m.member_id,
        name: m.member_name,
        phone: m.primary_contact_number || ""
      })
    );
    staff.forEach(s =>
      results.push({
        id: s.employee_id,
        name: s.isMember ? s.member_name : s.non_member_name,
        phone: s.isMember ? s.phone : s.non_member_phone
      })
    );

    res.json({ data: results });

  } catch (err) {
    console.error("Name search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.searchByPhone = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Query required" });

    const regex = new RegExp("^" + escapeRegex(query), "i");

    const [creditors, members, staff] = await Promise.all([
      Creditor.find({ primary_contact_number: regex })
        .select("creditor_id name primary_contact_number")
        .lean(),

      Member.find({ primary_contact_number: regex })
        .select("member_id member_name primary_contact_number")
        .lean(),
      Staff.find({
        $or: [
          { phone: regex },
          { non_member_phone: regex }
        ]
      })
        .select("employee_id isMember member_name non_member_name phone non_member_phone")
        .lean(),
    ]);

    const results = [];

    creditors.forEach(c =>
      results.push({
        id: c.creditor_id,
        name: c.name,
        phone: c.primary_contact_number || "",
      })
    );

    members.forEach(m =>
      results.push({
        id: m.member_id,
        name: m.member_name,
        phone: m.primary_contact_number || "",
      })
    );
    staff.forEach(s =>
      results.push({
        id: s.employee_id,
        name: s.isMember ? s.member_name : s.non_member_name,
        phone: s.isMember ? s.phone : s.non_member_phone
      })
    );

    res.json({ data: results });

  } catch (err) {
    console.error("Phone search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.searchCreditorsUnified = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json({ data: [] });

    const safeQuery = escapeRegex(query.trim());

    const isNumeric = /^[0-9]+$/.test(query);
    const regexAnywhere = new RegExp(safeQuery, "i");
    const regexStartsWith = new RegExp("^" + safeQuery, "i");

    const creditorConditions = [];
    const memberConditions = [];
    const staffConditions = [];

    // 🔹 Phone search
    if (isNumeric) {
      creditorConditions.push({ primary_contact_number: regexStartsWith });
      memberConditions.push({ primary_contact_number: regexStartsWith });

      staffConditions.push(
        { phone: regexStartsWith },
        { non_member_phone: regexStartsWith }
      );
    }

    // 🔹 Creditor search
    creditorConditions.push(
      { creditor_id: regexAnywhere },
      { name: regexAnywhere }
    );

    // 🔹 Member search
    memberConditions.push(
      { member_id: regexAnywhere },
      { member_name: regexAnywhere }
    );

    // 🔹 Staff search
    staffConditions.push(
      { employee_id: regexAnywhere },
      { member_name: regexAnywhere },
      { non_member_name: regexAnywhere }
    );

    const [creditors, members, staffs] = await Promise.all([
      Creditor.find({ $or: creditorConditions })
        .select("creditor_id name primary_contact_number")
        .limit(10)
        .lean(),

      Member.find({ $or: memberConditions })
        .select("member_id member_name primary_contact_number")
        .limit(10)
        .lean(),

      Staff.find({ $or: staffConditions })
        .select(
          "employee_id member_name phone non_member_name non_member_phone"
        )
        .limit(10)
        .lean()
    ]);

    const results = [];

    // 🔹 Creditors
    creditors.forEach(c => {
      results.push({
        id: c.creditor_id,
        name: c.name,
        phone: c.primary_contact_number || ""
      });
    });

    // 🔹 Members
    members.forEach(m => {
      results.push({
        id: m.member_id,
        name: m.member_name,
        phone: m.primary_contact_number || ""
      });
    });

    // 🔹 Staff
    staffs.forEach(s => {
      results.push({
        id: s.employee_id,
        name: s.member_name || s.non_member_name,
        phone: s.phone || s.non_member_phone || ""
      });
    });

    res.json({ data: results });

  } catch (err) {
    console.error("Unified creditor search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};