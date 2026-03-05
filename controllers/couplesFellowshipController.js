const CouplesFellowship = require("../Schema/CouplesFellowshipSchema");
const Member = require("../Schema/memberSchema");

exports.addCoupleMember = async (req, res) => {
  try {
    const { husband, wife } = req.body;

    // Validate
    if (!husband?.member_id || !husband?.member_name) {
      return res.status(400).json({ message: "Husband Member ID and name are required" });
    }
    if (!wife?.member_id || !wife?.member_name) {
      return res.status(400).json({ message: "Wife Member ID and name are required" });
    }

    // Save to DB
    const couple = new CouplesFellowship({
      husband,
      wife,
    });

    await couple.save();
    res.status(201).json(couple);
  } catch (err) {
    console.error("❌ Error adding couple member:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ➤ Get all Couples Fellowship members
// exports.getCoupleMembers = async (req, res) => {
//   try {
//     const { page = 1, limit = 10 } = req.query;
//     const skip = (page - 1) * limit;

//     const total = await CouplesFellowship.countDocuments();
//     const couples = await CouplesFellowship.find()
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(Number(limit));

//     res.status(200).json({
//       data: couples,
//       totalPages: Math.ceil(total / limit),
//       currentPage: Number(page),
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };


exports.getCoupleMembers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const total = await CouplesFellowship.countDocuments();
    const couples = await CouplesFellowship.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // 🔎 Attach family_id of husband
    for (let couple of couples) {
      const husband = await Member.findOne({ member_id: couple.husband.member_id }).lean();
      if (husband?.family_id) {
        couple.husband.family_id = husband.family_id;
      }
    }

    res.status(200).json({
      data: couples,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};




exports.searchMarriedHusbands = async (req, res) => {
  try {

    const { query = "" } = req.query;

    if (!query) return res.json([]);

    const regex = new RegExp(query, "i");

    // Only married family heads
    const husbands = await Member.find({

      isHead: "Yes",
      marital_status: "Married",

      $or: [
        { member_id: regex },
        { member_name: regex }
      ]

    })
    .select(
      "member_id member_name member_tamil_name primary_contact_number contact_numbers"
    )
    .limit(20)
    .lean();


    const formatted = husbands.map(m => ({

      member_id: m.member_id,

      member_name: m.member_name,

      member_tamil_name: m.member_tamil_name || "",

      mobile_number:
        m.primary_contact_number ||
        m.contact_numbers?.[0] ||
        ""

    }));


    res.json(formatted);

  } catch (err) {

    console.error("searchMarriedHusbands error:", err);

    res.status(500).json({ message: "Server error" });

  }
};



/*
==================================================
GET SPOUSE
==================================================
*/

exports.getSpouse = async (req, res) => {

  try {

    const { memberId } = req.query;

    if (!memberId)
      return res.status(400).json({
        message: "memberId required"
      });


    // Husband
    const husband = await Member.findOne({
      member_id: memberId
    });

    if (!husband)
      return res.status(404).json({
        message: "Husband not found"
      });


    // Wife → same family
    const wife = await Member.findOne({

      family_id: husband.family_id,

      relation_with_head: "Wife"

    })
    .select(
      "member_id member_name member_tamil_name primary_contact_number contact_numbers"
    )
    .lean();


    if (!wife)
      return res.json({});


    res.json({

      member_id: wife.member_id,

      member_name: wife.member_name,

      member_tamil_name: wife.member_tamil_name || "",

      mobile_number:
        wife.primary_contact_number ||
        wife.contact_numbers?.[0] ||
        ""

    });

  }
  catch (err) {

    console.error("getSpouse error:", err);

    res.status(500).json({
      message: "Server error"
    });

  }

};