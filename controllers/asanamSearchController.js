const Creditor = require("../Schema/CreditorSchema");
const Member = require("../Schema/memberSchema");

// Escape regex
const escapeRegex = (text = "") =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");


// 🔎 SEARCH BY ID
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
        .select(`
          member_id
          member_name
          primary_contact_number
          member_title
          member_tamil_name
          member_tamil_title
        `)
        .lean(),
    ]);

    const results = [];

    // Creditors
    creditors.forEach(c =>
      results.push({
        id: c.creditor_id,
        name: c.name,
        phone: c.primary_contact_number || "",

        member_title: "",
        member_tamil_name: "",
        member_tamil_title: ""
      })
    );

    // Members
    members.forEach(m =>
      results.push({
        id: m.member_id,
        name: m.member_name,
        phone: m.primary_contact_number || "",

        member_title: m.member_title || "",
        member_tamil_name: m.member_tamil_name || "",
        member_tamil_title: m.member_tamil_title || ""
      })
    );

    res.json({ data: results });

  } catch (err) {
    console.error("Asanam ID search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// 🔎 SEARCH BY NAME
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
        .select(`
          member_id
          member_name
          primary_contact_number
          member_title
          member_tamil_name
          member_tamil_title
        `)
        .lean(),

    ]);

    const results = [];

    creditors.forEach(c =>
      results.push({
        id: c.creditor_id,
        name: c.name,
        phone: c.primary_contact_number || "",

        member_title: "",
        member_tamil_name: "",
        member_tamil_title: ""
      })
    );

    members.forEach(m =>
      results.push({
        id: m.member_id,
        name: m.member_name,
        phone: m.primary_contact_number || "",

        member_title: m.member_title || "",
        member_tamil_name: m.member_tamil_name || "",
        member_tamil_title: m.member_tamil_title || ""
      })
    );

    res.json({ data: results });

  } catch (err) {
    console.error("Asanam Name search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};




// 🔎 SEARCH BY PHONE
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
        .select(`
          member_id
          member_name
          primary_contact_number
          member_title
          member_tamil_name
          member_tamil_title
        `)
        .lean(),

    ]);

    const results = [];

    creditors.forEach(c =>
      results.push({
        id: c.creditor_id,
        name: c.name,
        phone: c.primary_contact_number || "",

        member_title: "",
        member_tamil_name: "",
        member_tamil_title: ""
      })
    );

    members.forEach(m =>
      results.push({
        id: m.member_id,
        name: m.member_name,
        phone: m.primary_contact_number || "",

        member_title: m.member_title || "",
        member_tamil_name: m.member_tamil_name || "",
        member_tamil_title: m.member_tamil_title || ""
      })
    );

    res.json({ data: results });

  } catch (err) {
    console.error("Asanam Phone search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};