const Subscription = require("../Schema/Subscription");
const Member = require("../Schema/memberSchema");

exports.getMenSubscribers = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 25 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const currentYear = new Date().getFullYear();
    const last3Years = [currentYear, currentYear - 1, currentYear - 2];

    const matchStage = search
      ? {
          $or: [
            { member_name: { $regex: search, $options: "i" } },
            { member_id: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const subscribersAgg = await Subscription.aggregate([
      { $match: { year: { $in: last3Years } } },

      {
        $addFields: {
          yearTotal: {
            $add: [
              { $ifNull: ["$april.monthlySubscriptionOffering", 0] },
              { $ifNull: ["$may.monthlySubscriptionOffering", 0] },
              { $ifNull: ["$june.monthlySubscriptionOffering", 0] },
              { $ifNull: ["$july.monthlySubscriptionOffering", 0] },
              { $ifNull: ["$august.monthlySubscriptionOffering", 0] },
              { $ifNull: ["$september.monthlySubscriptionOffering", 0] },
              { $ifNull: ["$october.monthlySubscriptionOffering", 0] },
              { $ifNull: ["$november.monthlySubscriptionOffering", 0] },
              { $ifNull: ["$december.monthlySubscriptionOffering", 0] },
              { $ifNull: ["$january.monthlySubscriptionOffering", 0] },
              { $ifNull: ["$february.monthlySubscriptionOffering", 0] },
              { $ifNull: ["$march.monthlySubscriptionOffering", 0] },
            ],
          },
        },
      },

      {
        $group: {
          _id: "$member_id",
          member_id: { $first: "$member_id" },
          member_name: { $first: "$member_name" },
          totalContribution: { $sum: "$yearTotal" },
        },
      },

      { $match: { totalContribution: { $gte: 240 } } },

      {
        $lookup: {
          from: "members",
          localField: "member_id",
          foreignField: "member_id",
          as: "memberInfo",
        },
      },

      { $unwind: "$memberInfo" },

      // ✅ MALE ONLY
      {
        $match: {
          "memberInfo.gender": "Male",
          "memberInfo.membership_status": { $in: ["Active", "Unhold"] },
          ...matchStage,
        },
      },

      {
        $project: {
          _id: 0,
          member_id: 1,
          member_name: 1,
          member_tamil_name: "$memberInfo.member_tamil_name",
          primary_contact_number: "$memberInfo.primary_contact_number",
          totalContribution: 1,
        },
      },

      { $sort: { member_name: 1 } },

      {
        $facet: {
          data: [{ $skip: skip }, { $limit: parseInt(limit) }],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const subscribers = subscribersAgg[0].data;
    const totalCount =
      subscribersAgg[0].totalCount[0]?.count || 0;

    res.json({
      subscribers,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
      totalCount,
    });
  } catch (err) {
    console.error("Men Subscribers error:", err);
    res.status(500).json({
      message: "Failed to fetch men subscribers",
      error: err.message,
    });
  }
};
