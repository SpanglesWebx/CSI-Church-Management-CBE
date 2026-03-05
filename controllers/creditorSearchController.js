const Creditor = require("../Schema/CreditorSchema");
const Member = require("../Schema/memberSchema");

// Escape regex to prevent injection
const escapeRegex = (text = "") =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");


exports.searchById = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Query required" });

    const regex = new RegExp(escapeRegex(query), "i");

    const [creditors, members] = await Promise.all([
      Creditor.find({ creditor_id: regex })
        .select("creditor_id name primary_contact_number")
        .lean(),

      Member.find({ member_id: regex })
        .select("member_id member_name primary_contact_number")
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

    const [creditors, members] = await Promise.all([
      Creditor.find({ name: regex })
        .select("creditor_id name primary_contact_number")
        .lean(),

      Member.find({ member_name: regex })
        .select("member_id member_name primary_contact_number")
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

    const [creditors, members] = await Promise.all([
      Creditor.find({ primary_contact_number: regex })
        .select("creditor_id name primary_contact_number")
        .lean(),

      Member.find({ primary_contact_number: regex })
        .select("member_id member_name primary_contact_number")
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

    // 🔹 Phone search
    if (isNumeric) {
      creditorConditions.push({ primary_contact_number: regexStartsWith });
      memberConditions.push({ primary_contact_number: regexStartsWith });
    }

    // 🔹 ID or Name search
    creditorConditions.push(
      { creditor_id: regexAnywhere },
      { name: regexAnywhere }
    );

    memberConditions.push(
      { member_id: regexAnywhere },
      { member_name: regexAnywhere }
    );

    const [creditors, members] = await Promise.all([
      Creditor.find({ $or: creditorConditions })
        .select("creditor_id name primary_contact_number")
        .limit(10)
        .lean(),

      Member.find({ $or: memberConditions })
        .select("member_id member_name primary_contact_number")
        .limit(10)
        .lean()
    ]);

    const results = [];

    creditors.forEach(c => {
      results.push({
        id: c.creditor_id,
        name: c.name,
        phone: c.primary_contact_number || ""
      });
    });

    members.forEach(m => {
      results.push({
        id: m.member_id,
        name: m.member_name,
        phone: m.primary_contact_number || ""
      });
    });

    res.json({ data: results });

  } catch (err) {
    console.error("Unified creditor search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};