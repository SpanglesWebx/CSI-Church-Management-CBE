// controllers/voterController.js
const Members = require("../Schema/memberSchema");
const Subscription = require("../Schema/Subscription");

// exports.getVoters = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = 15;
//     const skip = (page - 1) * limit;
//     const search = req.query.search || "";

//     // Step 1: Fetch all members who are Active + Full Member
//     let members = await Members.find(
//       {
//         status: "Active",
//         member_type: "Full Member",
//         membership_status: "Unhold",
//         $or: [
//           { member_name: { $regex: search, $options: "i" } },
//           { member_id: { $regex: search, $options: "i" } },
//           { member_tamil_name: { $regex: search, $options: "i" } }
//         ]
//       },
//       {
//         member_id: 1,
//         member_name: 1,
//         member_tamil_name: 1,
//         status: 1,
//         membership_status: 1
//       }
//     );

//     // Step 2: Get member_ids who have paid subscription
//     const subscriptions = await Subscription.find({}, "member_id");
//     const paidIds = subscriptions.map((s) => s.member_id);

//     // Step 3: Filter only members who appear in subscription list
//     let voterMembers = members.filter((m) => paidIds.includes(m.member_id));

//     const total = voterMembers.length;

//     // Step 4: Pagination
//     voterMembers = voterMembers.slice(skip, skip + limit);

//     res.json({
//       status: "Success",
//       totalPages: Math.ceil(total / limit),
//       currentPage: page,
//       totalRecords: total,
//       data: voterMembers
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ status: "Failed", message: "Server Error" });
//   }
// };

exports.getVoters = async (req, res) => {
  try {

    const MINIMUM_SUB_AMOUNT = 240;
    const page = parseInt(req.query.page) || 1;
    const limit = 25;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    // Step 1: Fetch eligible members
    let members = await Members.find(
      {
        status: "Active",
        member_type: "Full Member",
        membership_status: "Unhold",
        $or: [
          { member_name: { $regex: search, $options: "i" } },
          { member_id: { $regex: search, $options: "i" } },
          { member_tamil_name: { $regex: search, $options: "i" } }
        ]
      },
      {
        member_id: 1,
        member_name: 1,
        member_tamil_name: 1,
        status: 1,
        membership_status: 1,
        contact_numbers: 1   
      }
    );

// ---------- NEW STEP 2: Calculate THREE financial years ----------

// Determine THREE financial years dynamically
const now = new Date();

// This is the CURRENT financial year start
const currentFY =
  now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;

// THREE financial years:
// Example if currentYear = 2026:
//   year2 = 2025-2026 (running year)
//   year1 = 2024-2025 (previous year)
// ----- LAST 3 FINANCIAL YEARS -----

const year1Start = currentFY;       // e.g. 2025
const year2Start = currentFY - 1;   // e.g. 2024
const year3Start = currentFY - 2;   // e.g. 2023

// const year3Start = currentYear - 3; // oldest year
// const year3End   = currentYear - 2;

// const year2Start = currentYear - 2;
// const year2End   = currentYear - 1;

// const year1Start = currentYear - 1; // most recent completed year
// const year1End   = currentYear;

// Fetch all subscriptions (we will total them in JS)
const allSubs = await Subscription.find({}).lean();

// Helper: sum all 12 months
const sumYear = (sub) => {
  const months = [
    sub.april, sub.may, sub.june, sub.july,
    sub.august, sub.september, sub.october,
    sub.november, sub.december, sub.january,
    sub.february, sub.march
  ];

  return months.reduce(
    (total, m) => total + (m?.monthlySubscriptionOffering || 0),
    0
  );
};

// Build a map: member_id -> totals for last two years
const yearTotals = {}; 

allSubs.forEach(sub => {
  const id = sub.member_id;

  if (!yearTotals[id]) {
    yearTotals[id] = { year1: 0, year2: 0, year3: 0 };
  }

  // Assume your Subscription document has a "financialYear" field
  // If not, tell me — I’ll adjust it.

// Use 'year' field from your schema (financial year START)
if (sub.year === year1Start) {
  yearTotals[id].year1 = sumYear(sub);
}

if (sub.year === year2Start) {
  yearTotals[id].year2 = sumYear(sub);
}

if (sub.year === year3Start) {
  yearTotals[id].year3 = sumYear(sub);
}


});



    // Step 3: Keep only the matching members
    let voterMembers = members.filter((m) => {
      const totals = yearTotals[m.member_id];

      // Must have records for both years AND both >= 240
      return (
        totals &&
        totals.year1 >= MINIMUM_SUB_AMOUNT &&
        totals.year2 >= MINIMUM_SUB_AMOUNT &&
        totals.year3 >= MINIMUM_SUB_AMOUNT
      );
    });

    const total = voterMembers.length;

    // Step 4: Pagination
    voterMembers = voterMembers.slice(skip, skip + limit);

    res.json({
      status: "Success",
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalRecords: total,
      data: voterMembers
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "Failed", message: "Server Error" });
  }
};
