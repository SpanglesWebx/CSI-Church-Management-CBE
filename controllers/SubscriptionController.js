const mongoose = require("mongoose");
const Subscription = require("../Schema/Subscription");
const SubscriptionDailyCollection = require("../Schema/SubscriptionDailyCollection");
const HarvestAuction = require("../Schema/HarvestAuction");
const HarvestAuctionPayment = require("../Schema/HarvestAuctionPayment");
const Member = require("../Schema/memberSchema");

const monthLabel = (month, year) => {
  const shortYear = String(year).slice(2);
  const shortMonth = month.slice(0, 3);
  return `${shortMonth.charAt(0).toUpperCase() + shortMonth.slice(1)}-${shortYear}`;
};
const numEq = (a, b, eps = 0.01) => Math.abs(Number(a || 0) - Number(b || 0)) <= eps;
exports.addSubscription = async (req, res) => {
  try {
    const { member_id, member_name, entries } = req.body;

    if (!member_id || !member_name || !entries || !Array.isArray(entries)) {
      return res.status(400).json({
        message: "member_id, member_name and entries[] are required",
      });
    }

    let createdOrUpdatedMonths = [];

    for (const entry of entries) {
      const { month, year, payment_method, cheque_number, contributions, date } = entry;

      if (!month || !year || !date || !contributions) {
        return res.status(400).json({
          message: "Each entry must contain month, year, date and contributions",
        });
      }

      // Find subscription document for the FY
      let subscription = await Subscription.findOne({ member_id, year });

      // Create new doc if none exists
      if (!subscription) {
        subscription = new Subscription({
          member_id,
          member_name,
          year,
        });
      }

      // Check duplicate month
      if (subscription[month] && subscription[month].total > 0) {
        return res.status(400).json({
          message: `Month ${monthLabel(month, year)} already exists for this member.`,
        });
      }

      // Save month data
      subscription[month] = {
        date: new Date(date),
        payment_method,
        cheque_number: cheque_number || "",
        ...contributions
      };

      await subscription.save();
      createdOrUpdatedMonths.push(monthLabel(month, year));

      // ===============================
      // HARVEST AUCTION DEDUCTION LOGIC
      // ===============================

      const harvestAmount = Number(contributions.harvestAuction || 0);
      const source = "Subscription";

      if (harvestAmount > 0) {
        let unpaidAuctions = await HarvestAuction.find({
          buyerId: member_id,
          balance: { $gt: 0 },
        }).sort({ date: 1 });

        let remainingAmount = harvestAmount;

        for (const auction of unpaidAuctions) {
          if (remainingAmount <= 0) break;

          const payAmount = Math.min(remainingAmount, auction.balance);

          auction.totalPaid = (auction.totalPaid || 0) + payAmount;
          auction.balance = auction.amount - auction.totalPaid;
          auction.payment_status = auction.balance <= 0 ? "Paid" : "Unpaid";

          auction.payments = auction.payments || [];
          auction.payments.push({
            amountPaid: payAmount,
            date: new Date(),
            balanceAfter: auction.balance,
            source,
          });

          await auction.save();

          await new HarvestAuctionPayment({
            harvestAuctionId: auction._id,
            buyerId: auction.buyerId,
            buyerName: auction.buyerName,
            buyerPhone: auction.buyerPhone || "N/A",
            sellerId: auction.sellerId || "",
            sellerName: auction.sellerName || "",
            item: auction.item,
            amountPaid: payAmount,
            balanceAfter: auction.balance,
            source,
            date: new Date(),
          }).save();

          remainingAmount -= payAmount;
        }
      }
    }

    res.status(201).json({
      message: `Saved: ${createdOrUpdatedMonths.join(", ")}`,
      success: true,
    });

  } catch (err) {
    console.error("Subscription error:", err);
    res.status(500).json({
      message: "Failed to save subscription",
      error: err.message,
    });
  }
};


exports.getSubscribers = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 25 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const searchCond = search
      ? {
        $or: [
          { member_name: { $regex: search, $options: "i" } },
          { member_id: { $regex: search, $options: "i" } },
        ],
      }
      : {};

    const agg = await Subscription.aggregate([
      {
        $match: {
          remaining_amount: { $gt: 0 },
          ...searchCond,
        },
      },
      { $sort: { updatedAt: -1 } },
      {
        $group: {
          _id: "$member_id",
          member_id: { $first: "$member_id" },
          member_name: { $first: "$member_name" },
          year: { $first: "$year" },
          remaining_amount: { $first: "$remaining_amount" },
        },
      },
      {
        $lookup: {
          from: "members",
          localField: "member_id",
          foreignField: "member_id",
          as: "memberInfo",
        },
      },
      { $unwind: { path: "$memberInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          member_id: 1,
          member_name: 1,
          year: 1,
          remaining_amount: 1,
          member_type: "$memberInfo.member_type",
        },
      },
      { $sort: { member_id: 1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: parseInt(limit) }],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const subscribers = agg[0].data || [];
    const totalCount = agg[0].totalCount.length ? agg[0].totalCount[0].count : 0;

    return res.json({
      subscribers,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      currentPage: parseInt(page),
      totalCount,
    });
  } catch (err) {
    console.error("Get Subscribers error:", err);
    return res.status(500).json({ message: "Failed to fetch subscribers", error: err.message });
  }
};


// ➤ Get all subscriptions for a member (Apr–Mar for selected year)
exports.getMemberSubscriptions = async (req, res) => {
  try {
    const { member_id } = req.query;

    if (!member_id) {
      return res.status(400).json({ message: "member_id is required" });
    }

    const subscriptions = await Subscription.find({ member_id }).sort({ year: 1 });

    // ⭐ Get member info
    const member = await Member.findOne({ member_id });

    const months = [
      "april","may","june","july","august","september",
      "october","november","december","january","february","march"
    ];

    const result = subscriptions.map(sub => {

      const monthsData = {};

      months.forEach(month => {
        const record = sub[month];

        if (!record || !Array.isArray(record.allocations)) {
          monthsData[month] = { total: 0, allocations: [] };
        } else {
          monthsData[month] = {
            total: Number(record.total || 0),
            allocations: record.allocations.map(a => ({
              ...a.toObject?.() || a,
              total: Number(a.total || 0),
            }))
          };
        }
      });

      return {
        year: sub.year,
        member_id: sub.member_id,
        member_name: sub.member_name,
        member_title: member?.member_title || "", // ✅ FIXED
        total_received: sub.total_received || 0,
        remaining_amount: sub.remaining_amount || 0,
        months: monthsData
      };
    });

    res.json(result);

  } catch (err) {
    console.error("getMemberSubscriptions:", err);
    res.status(500).json({ message: "Failed to fetch subscriptions" });
  }
};




exports.checkSubscription = async (req, res) => {
  try {
    const { member_id, date } = req.body;
    if (!member_id || !date) return res.status(400).json({ message: "Member ID and Date are required" });

    const d = new Date(date);
    const month = d.toLocaleString("en-US", { month: "long" }).toLowerCase();
    const year = d.getMonth() + 1 >= 4 ? d.getFullYear() : d.getFullYear() - 1;

    const subscription = await Subscription.findOne({ member_id, year });
    const exists = subscription && subscription[month];
    const monthName = d.toLocaleString("en-US", { month: "long" });

    res.json({ exists: !!exists, month: monthName, year });
  } catch (err) {
    console.error("Check subscription error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// controllers/subscriptionController.js
exports.updateSubscriptionSplit = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      member_id,
      year,
      month,
      contributions,
      payment_method,
      cheque_number,
      cheque_date,
      bank_name,
    } = req.body;

    if (!member_id || !year || !month || !contributions) {
      throw new Error("member_id, year, month and contributions required");
    }

    const subscription = await Subscription
      .findOne({ member_id, year })
      .session(session);

    if (!subscription) throw new Error("Subscription not found");

    const monthKey = month.toLowerCase();
    const record = subscription[monthKey];

    if (!record || !record.allocations.length) {
      throw new Error("No allocation found for this month");
    }

    // 🔹 latest allocation only
    const alloc = record.allocations[record.allocations.length - 1];

    // 🔹 validate split total
    const splitSum = Object.values(contributions)
      .reduce((s, v) => s + Number(v || 0), 0);

    if (Math.abs(splitSum - alloc.total) > 0.01) {
      throw new Error(`Split ₹${splitSum} must equal allocation ₹${alloc.total}`);
    }

    // 🔹 store previous harvest (to prevent double deduction)
    const prevHarvest = Number(alloc.harvestAuction || 0);

    // 🔹 apply splits
    Object.entries(contributions).forEach(([k, v]) => {
      alloc[k] = Number(v || 0);
    });

    // 🔹 payment meta
    alloc.payment_method = payment_method || alloc.payment_method;
    alloc.cheque_number = alloc.payment_method === "Cheque" ? cheque_number || "" : "";
    alloc.cheque_date = alloc.payment_method === "Cheque" ? cheque_date || null : null;
    alloc.bank_name = alloc.payment_method === "Cheque" ? bank_name || "" : "";

    // ===============================
    // 🌾 HARVEST AUCTION DEDUCTION
    // ===============================

    const newHarvest = Number(contributions.harvestAuction || 0);
    const toDeduct = Math.max(0, newHarvest - prevHarvest);

    if (toDeduct > 0) {
      let remaining = toDeduct;

      const unpaidAuctions = await HarvestAuction.find({
        buyerId: member_id,
        balance: { $gt: 0 },
      })
        .sort({ date: 1 })
        .session(session);

      for (const auction of unpaidAuctions) {
        if (remaining <= 0) break;

        const payAmount = Math.min(remaining, auction.balance);

        auction.totalPaid = (auction.totalPaid || 0) + payAmount;
        auction.balance = Number(
          (auction.amount - auction.totalPaid).toFixed(2)
        );
        auction.payment_status = auction.balance <= 0 ? "Paid" : "Unpaid";

        auction.payments.push({
          amountPaid: payAmount,
          date: new Date(),
          balanceAfter: auction.balance,
          source: "Subscription",
        });

        await auction.save({ session });

        await new HarvestAuctionPayment({
          harvestAuctionId: auction._id,
          buyerId: auction.buyerId,
          buyerName: auction.buyerName,
          buyerPhone: auction.buyerPhone || "N/A",
          sellerId: auction.sellerId || "",
          sellerName: auction.sellerName || "",
          item: auction.item,
          amountPaid: payAmount,
          balanceAfter: auction.balance,
          source: "Subscription",
          date: new Date(),
        }).save({ session });

        remaining -= payAmount;
      }
    }

    await subscription.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: "Split saved & Harvest Auction adjusted successfully",
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("updateSubscriptionSplit:", err);
    res.status(400).json({ message: err.message });
  }
};




exports.saveSubscriptionAmount = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      date,
      payment_session,
      receipts,
      cash_total,
      cheque_total,
      total_amount,
    } = req.body;

    // 🔒 Basic validation
    if (
      !date ||
      !payment_session ||
      !Array.isArray(receipts) ||
      receipts.length === 0
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Merge selected date with current server time
    const selectedDate = new Date(date);
    const now = new Date();
    selectedDate.setHours(
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds()
    );

    const d = selectedDate;

    // 📆 Financial year (Apr → Mar)
    const year =
      d.getMonth() + 1 >= 4 ? d.getFullYear() : d.getFullYear() - 1;

    // 🧾 For DAILY COLLECTION member breakup
    const memberMap = {};

    // 1️⃣ SAVE MEMBER-WISE RECEIPTS
    for (const r of receipts) {
      const { member_id, member_name, amount, payment_method } = r;

      if (!member_id || !member_name || !amount || !payment_method) {
        continue;
      }

      // 🔹 Find / create subscription
      let subscription = await Subscription.findOne({
        member_id,
        year,
      }).session(session);

      // 🚨 PREVENT SAME-DATE DUPLICATE RECEIPT
      if (subscription && subscription.receipts?.length) {
        const sameDateExists = subscription.receipts.some(rec => {
          const recDate = new Date(rec.date).toISOString().slice(0, 10);
          const newDate = new Date(d).toISOString().slice(0, 10);
          return recDate === newDate;
        });

        if (sameDateExists) {
          throw new Error(
            `${member_name} already has receipt on ${new Date(d).toLocaleDateString()}`
          );
        }
      }


      if (!subscription) {
        subscription = new Subscription({
          member_id,
          member_name,
          year,
          total_received: 0,
          remaining_amount: 0,
          receipts: [],
        });
      }

      // 🔹 Push receipt
      subscription.receipts.push({
        date: d,
        payment_session,
        payment_method,
        amount: Number(amount),
      });

      subscription.total_received += Number(amount);
      subscription.remaining_amount += Number(amount);

      await subscription.save({ session });

      // 🔹 Build DAILY MEMBER BREAKUP
      if (!memberMap[member_id]) {
        memberMap[member_id] = {
          member_id,
          member_name,
          cash_amount: 0,
          cheque_amount: 0,
        };
      }

      if (payment_method === "Cash") {
        memberMap[member_id].cash_amount += Number(amount);
      } else if (payment_method === "Cheque") {
        memberMap[member_id].cheque_amount += Number(amount);
      }
    }

    // Convert map → array
    const membersBreakup = Object.values(memberMap);

    // 2️⃣ SAVE DAILY COLLECTION (🔥 ALWAYS NEW DOCUMENT)
    await new SubscriptionDailyCollection({
      date: d,
      payment_session,
      cash_total: Number(cash_total),
      cheque_total: Number(cheque_total),
      total_amount: Number(total_amount),
      members: membersBreakup, // 🔥 KEY ADDITION
    }).save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Subscription collection saved successfully",
    });
  } catch (err) {
    // await session.abortTransaction();
    // session.endSession();
    // console.error("Save subscription amount error:", err);
    // return res.status(500).json({ message: "Failed to save amount" });
    await session.abortTransaction();
  session.endSession();

  console.error("Save subscription amount error:", err);

  return res.status(400).json({
  message: err.message || "Failed to save subscription",
  type: "VALIDATION", // ⭐ IMPORTANT
});

  }
};

exports.allocateToMonths = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { member_id, year, allocations, date } = req.body;

    if (!member_id || !year || !Array.isArray(allocations) || !allocations.length) {
      throw new Error("member_id, year and allocations are required");
    }

    const subscription = await Subscription.findOne({ member_id, year }).session(session);
    if (!subscription) throw new Error("Subscription not found");

    const remaining = Number(subscription.remaining_amount || 0);
    const allocationSum = allocations.reduce((s, a) => s + Number(a.amount || 0), 0);

    if (allocationSum > remaining + 0.01) {
      throw new Error(`Allocated ₹${allocationSum} exceeds remaining ₹${remaining}`);
    }

    for (const a of allocations) {
      const month = String(a.month).toLowerCase();
      if (!subscription[month]) {
        subscription[month] = { allocations: [], total: 0 };
      }

      subscription[month].allocations.push({
        date: date ? new Date(date) : new Date(),
        payment_method: a.payment_method || "Cash",
        cheque_number: a.payment_method === "Cheque" ? a.cheque_number || "" : "",
        cheque_date: a.payment_method === "Cheque" ? a.cheque_date || null : null,
        bank_name: a.payment_method === "Cheque" ? a.bank_name || "" : "",
        total: Number(a.amount),
      });

      subscription[month].total += Number(a.amount);
    }

    subscription.remaining_amount = Math.max(
      0,
      Number((remaining - allocationSum).toFixed(2))
    );

    await subscription.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, message: "Amount allocated successfully" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: err.message });
  }
};

exports.getUnpaidMembers = async (req, res) => {
  try {
    const { from, to, page = 1, limit = 25 } = req.query;

    const skip = (page - 1) * limit;

    // Fetch ONLY UNHOLD members
    const allMembers = await Member.find({ membership_status: "Unhold" })
      .sort({ createdAt: -1 });

    // Fetch subscription records within date range
    const subscribers = await Subscription.find(
      from && to
        ? {
          $or: [
            { april: { $exists: true }, "april.date": { $gte: new Date(from), $lte: new Date(to) } },
            { may: { $exists: true }, "may.date": { $gte: new Date(from), $lte: new Date(to) } },
            { june: { $exists: true }, "june.date": { $gte: new Date(from), $lte: new Date(to) } },
            { july: { $exists: true }, "july.date": { $gte: new Date(from), $lte: new Date(to) } },
            { august: { $exists: true }, "august.date": { $gte: new Date(from), $lte: new Date(to) } },
            { september: { $exists: true }, "september.date": { $gte: new Date(from), $lte: new Date(to) } },
            { october: { $exists: true }, "october.date": { $gte: new Date(from), $lte: new Date(to) } },
            { november: { $exists: true }, "november.date": { $gte: new Date(from), $lte: new Date(to) } },
            { december: { $exists: true }, "december.date": { $gte: new Date(from), $lte: new Date(to) } },
            { january: { $exists: true }, "january.date": { $gte: new Date(from), $lte: new Date(to) } },
            { february: { $exists: true }, "february.date": { $gte: new Date(from), $lte: new Date(to) } },
            { march: { $exists: true }, "march.date": { $gte: new Date(from), $lte: new Date(to) } }
          ]
        }
        : {}
    );

    const paidMemberIds = [...new Set(subscribers.map(s => s.member_id))];

    // Filter ONLY unpaid & unhold
    const unpaid = allMembers.filter(
      m => !paidMemberIds.includes(m.member_id)
    );

    const totalCount = unpaid.length;

    // Apply pagination
    const paginated = unpaid.slice(skip, skip + Number(limit));

    res.json({
      unpaidMembers: paginated,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: Number(page),
      totalCount
    });

  } catch (err) {
    console.error("Unpaid Members Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};



exports.holdMembers = async (req, res) => {
  try {
    const { memberIds } = req.body;

    if (!memberIds || memberIds.length === 0) {
      return res.status(400).json({ message: "No members selected" });
    }

    // Update membership_status for selected members
    await Member.updateMany(
      { member_id: { $in: memberIds } },
      { $set: { membership_status: "Hold" } }
    );

    res.json({
      message: "Selected members have been moved to Hold successfully."
    });

  } catch (err) {
    console.error("Hold Members Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.getHoldedMembers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const skip = (page - 1) * limit;

    // SEARCH CONDITIONS
    const searchQuery = search
      ? {
        membership_status: "Hold",
        $or: [
          { member_name: { $regex: search, $options: "i" } },
          { member_id: { $regex: search, $options: "i" } }
        ]
      }
      : { membership_status: "Hold" };

    // Total Count
    const totalCount = await Member.countDocuments(searchQuery);

    // Paginated Data
    const holdedMembers = await Member.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.json({
      holdedMembers,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: Number(page),
      totalCount
    });

  } catch (err) {
    console.error("Holded Members Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// 🔹 Get all subscription members (for report)
exports.getSubscriptionReport = async (req, res) => {
  try {
    const {
      search = "",
      page = 1,
      limit = 25,
      from,
      to,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 🔎 search condition
    const searchCond = search
      ? {
          $or: [
            { member_name: { $regex: search, $options: "i" } },
            { member_id: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // 📅 date filter (based on receipts)
    const dateCond =
      from && to
        ? {
            receipts: {
              $elemMatch: {
                date: {
                  $gte: new Date(from),
                  $lte: new Date(to),
                },
              },
            },
          }
        : {};

    const [data, totalCount] = await Promise.all([
      Subscription.find({
        ...searchCond,
        ...dateCond,
      })
        .sort({ member_id: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select("member_id member_name"),

      Subscription.countDocuments({
        ...searchCond,
        ...dateCond,
      }),
    ]);

    res.json({
      data,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: Number(page),
      totalCount,
    });
  } catch (err) {
    console.error("Subscription report error:", err);
    res.status(500).json({ message: "Failed to fetch report" });
  }
};


exports.getSingleSubscriptionReport = async (req, res) => {
  try {
    const { member_id } = req.query;

    const [member, subscriptions] = await Promise.all([
      Member.findOne({ member_id }).select("present_address present_pincode"),
      Subscription.aggregate([
        { $match: { member_id } },
        { $sort: { year: -1 } },
        {
          $project: {
            member_id: 1,
            member_name: 1,
            year: 1,
            total_received: 1,
            april: 1, may: 1, june: 1, july: 1,
            august: 1, september: 1, october: 1,
            november: 1, december: 1, january: 1,
            february: 1, march: 1
          }
        }
      ])
    ]);

    if (!subscriptions.length) {
      return res.status(404).json({ message: "No subscription found" });
    }

    res.json({
      memberInfo: {
        member_id,
        member_name: subscriptions[0].member_name,
        address: member?.present_address || "",
        pincode: member?.present_pincode || ""
      },
      subscriptions
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load report" });
  }
};



// 🔥 PRINT ALL MEMBERS BY DATE
exports.getPrintByDate = async (req, res) => {
  try {
    const { date } = req.query;


    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const selectedDate = new Date(date).toISOString().slice(0, 10);

const subscriptions = await Subscription.find({
  $or: [
    { "april.allocations.date": { $gte: new Date(date), $lt: new Date(date + "T23:59:59") } },
    { "may.allocations.date": { $gte: new Date(date), $lt: new Date(date + "T23:59:59") } },
    { "june.allocations.date": { $gte: new Date(date), $lt: new Date(date + "T23:59:59") } },
    { "july.allocations.date": { $gte: new Date(date), $lt: new Date(date + "T23:59:59") } },
    { "august.allocations.date": { $gte: new Date(date), $lt: new Date(date + "T23:59:59") } },
    { "september.allocations.date": { $gte: new Date(date), $lt: new Date(date + "T23:59:59") } },
    { "october.allocations.date": { $gte: new Date(date), $lt: new Date(date + "T23:59:59") } },
    { "november.allocations.date": { $gte: new Date(date), $lt: new Date(date + "T23:59:59") } },
    { "december.allocations.date": { $gte: new Date(date), $lt: new Date(date + "T23:59:59") } },
    { "january.allocations.date": { $gte: new Date(date), $lt: new Date(date + "T23:59:59") } },
    { "february.allocations.date": { $gte: new Date(date), $lt: new Date(date + "T23:59:59") } },
    { "march.allocations.date": { $gte: new Date(date), $lt: new Date(date + "T23:59:59") } }
  ]
}).lean();

    const months = [
      "april","may","june","july","august","september",
      "october","november","december","january","february","march"
    ];

    let result = [];

const memberIds = subscriptions.map(s => s.member_id);

const members = await Member.find({
  member_id: { $in: memberIds }
}).lean();

const memberMap = {};
members.forEach(m => {
  memberMap[m.member_id] = m;
});

    for (const sub of subscriptions) {

      let paidMonths = [];

      months.forEach(month => {
        const record = sub[month];

        if (record?.allocations?.length) {
          record.allocations.forEach(a => {
            const allocDate = new Date(a.date).toISOString().slice(0, 10);

            if (allocDate === selectedDate) {
              paidMonths.push({
                month,
                year: sub.year,
                ...a
              });
            }
          });
        }
      });

      if (paidMonths.length > 0) {

        const member = memberMap[sub.member_id];

        result.push({
          member_id: sub.member_id,
          member_name: sub.member_name,
          address: member?.present_address || "",
          pincode: member?.present_pincode || "",
          date: selectedDate,
          paidMonths
        });
      }
    }

    res.json(result);

  } catch (err) {
    console.error("Print by date error:", err);
    res.status(500).json({ message: "Failed to fetch print data" });
  }
};