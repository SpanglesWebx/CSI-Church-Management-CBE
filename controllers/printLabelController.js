const Member = require("../Schema/memberSchema");

// GET MEMBERS WITH PAGINATION
exports.getMembersForLabel = async (req, res) => {
  try {
    const { gender, page = 1, limit = 25 } = req.query;

    const query = {
      status: "Active",
      membership_status: "Unhold",
    };

    if (gender && gender !== "All") {
      query.gender = gender;
    }

    const skip = (Number(page) - 1) * Number(limit);

const members = await Member.aggregate([
  { $match: query },

  {
    $addFields: {
      trimmed_name: {
        $trim: { input: "$member_name" }
      }
    }
  },

  {
    $addFields: {
      first_char: { $substrCP: ["$trimmed_name", 0, 1] }
    }
  },

  {
    $addFields: {
      priority: {
        $switch: {
          branches: [
            {
              case: { $regexMatch: { input: "$first_char", regex: /^[A-Za-z]/ } },
              then: 1
            },
            {
              case: { $regexMatch: { input: "$first_char", regex: /^[0-9]/ } },
              then: 2
            }
          ],
          default: 3
        }
      }
    }
  },

  {
    $sort: {
      priority: 1,
      trimmed_name: 1
    }
  },

  { $skip: skip },
  { $limit: Number(limit) }
]);

    const total = await Member.countDocuments(query);

    res.json({
      data: members,
      totalPages: Math.ceil(total / limit),
    });

  } catch (error) {
    console.error("Print Label Fetch Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


exports.getPrintCount = async (req, res) => {
  try {
    const { gender, fromSI, toSI } = req.query;

    // console.log("Query:", gender, fromSI, toSI);

    const start = parseInt(fromSI);
    const end = parseInt(toSI);

    if (!start || !end || start < 1 || end < 1 || start > end) {
      return res.json({ count: 0 });
    }

    const baseQuery = {
      status: "Active",
      membership_status: "Unhold",
    };

    if (gender && gender !== "All") {
      baseQuery.gender = gender;
    }

    const totalMembers = await Member.countDocuments(baseQuery);

    // console.log("Total Members:", totalMembers);

    if (totalMembers === 0) {
      return res.json({ count: 0 });
    }

    if (start > totalMembers) {
      return res.json({ count: 0 });
    }

    const adjustedEnd = Math.min(end, totalMembers);

    const count = adjustedEnd - start + 1;

    res.json({ count });

  } catch (error) {
    console.error("Print Label Count Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};