const HarvestAuction = require("../Schema/HarvestAuction");
const HarvestAuctionPayment = require("../Schema/HarvestAuctionPayment");
const HarvestItem = require("../Schema/HarvestItem");
const Journal = require("../Schema/JournalSchema");
const Counter = require("../Schema/CounterSchema");


// Utility to build buyer-wise report
async function buildBuyerReport({ buyerId, buyerPhone }) {
  const filter = buyerId ? { buyerId } : { buyerPhone };
  const auctions = await HarvestAuction.find(filter).lean();

  const payments = auctions.flatMap(a => a.payments || []);
  const totalAuctionAmount = auctions.reduce((sum, a) => sum + (a.amount || 0), 0);
  const totalPayments = payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  const overallUnpaid = totalAuctionAmount - totalPayments;

  const auctionDetails = auctions.map(a => ({
    _id: a._id,
    date: a.date,
    item: a.item,
    amount: a.amount,
    sellerId: a.sellerId || "",
    sellerName: a.sellerName || "",
    payment_status: a.payment_status,
  }));

  return {
    key: buyerId || `PHONE:${buyerPhone}`,
    isMember: !!buyerId,
    buyerId: buyerId || "",
    buyerName: auctions[0]?.buyerName || "Unknown",
    buyerPhone: buyerPhone || auctions[0]?.buyerPhone || "",
    auctions: auctionDetails,
    payments: payments.map(p => ({ date: p.date, amount: p.amountPaid, source: p.source || "Direct",})),
    overallUnpaid,
  };
}

async function buildBuyerSummary({ buyerId, buyerPhone }) {
  const filter = buyerId ? { buyerId } : { buyerPhone };

  const auctions = await HarvestAuction.find(
    { ...filter, balance: { $gt: 0 } }, // 🔑 ONLY UNPAID
    {
      buyerId: 1,
      buyerName: 1,
      buyerPhone: 1,
      balance: 1,
    }
  ).lean();

  if (!auctions.length) return null;

  const overallUnpaid = auctions.reduce(
    (sum, a) => sum + Number(a.balance || 0),
    0
  );

  return {
    key: buyerId || `PHONE:${buyerPhone}`,
    isMember: !!buyerId,
    buyerId: buyerId || "",
    buyerName: auctions[0]?.buyerName || "Unknown",
    buyerPhone: auctions[0]?.buyerPhone || "",
    overallUnpaid,
  };
}

// ➤ Add Harvest Auction
// exports.addHarvestAuction = async (req, res) => {
//   try {
//     const auction = new HarvestAuction(req.body);
//     await auction.save();
//     res.status(201).json(auction);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to add Harvest Auction", error: err.message });
//   }
// };

exports.addHarvestAuction = async (req, res) => {
  try {
    const auction = new HarvestAuction(req.body);
    await auction.save();

    /* =====================================
       CREATE JOURNAL ENTRY
    ====================================== */

    const {
      date,
      amount,
      buyerId,
      buyerName,
      buyerPhone,
      item,
    } = req.body;

    /* ---------- JOURNAL COUNTER ---------- */

    const counter = await Counter.findOneAndUpdate(
      { name: "journal" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );

    const autoJournalId = "JRN" + String(counter.seq).padStart(4, "0");

    /* ---------- DATE-WISE TRANS NO ---------- */

    const journalDate = new Date(date);
    journalDate.setHours(0, 0, 0, 0);

    const lastJournal = await Journal.findOne({
      date: {
        $gte: journalDate,
        $lt: new Date(journalDate.getTime() + 24 * 60 * 60 * 1000),
      },
    })
      .sort({ transNo: -1 })
      .lean();

    let nextSeq = 1;

    if (lastJournal?.transNo) {
      const lastNumber = parseInt(lastJournal.transNo.replace("J", ""), 10);
      nextSeq = lastNumber + 1;
    }

    const transNo = "J" + String(nextSeq).padStart(4, "0");

    /* ---------- CREATE JOURNAL ---------- */

    await Journal.create({
      autoJournalId,
      transNo,
      date,

      accType: "Credit",

      creditorId: buyerId || "",
      creditorName: buyerName || "",
      creditorPhone: buyerPhone || "",

      headerLedger: {
        key: "I0022",
        ledgerCode: "I0022",
        ledgerName: "Harvest Income Through Auction",
        categoryName: "Harvest",
        accountType: "Income",
        incomeType: "NON_ASSESSABLE",
      },

      entries: [
        {
          type: "Debit",
          ledger: {
            key: "L0008",
            ledgerCode: "L0008",
            ledgerName: "Auction Balance",
            categoryName: "Loans & Advances",
            accountType:
              "Liabilities-Current Liabilities and Provisions",
            incomeType: "NON_ASSESSABLE",
          },
          amount: amount,
          description: item, // 👈 Item name as description
        },
      ],

      totalAmount: amount,
    });

    res.status(201).json(auction);
  } catch (err) {
    console.error("Auction error:", err);
    res.status(500).json({
      message: "Failed to add Harvest Auction",
      error: err.message,
    });
  }
};



exports.getHarvestAuctions = async (req, res) => {
  try {
    const { page = 1, limit = 25, search = "", fromdate, todate } = req.query;

    const query = {};

    // 🔹 Search by sellerName, buyerName, or item
    if (search) {
      query.$or = [
        { sellerName: { $regex: search, $options: "i" } },
        { buyerName: { $regex: search, $options: "i" } },
        { item: { $regex: search, $options: "i" } },
      ];
    }

    // 🔹 Date range filtering
    if (fromdate && todate) {
      query.date = {
        $gte: new Date(fromdate),
        $lte: new Date(todate),
      };
    }

    // 🔹 Convert pagination inputs to numbers
    const pageNum = parseInt(page);
    const pageSize = parseInt(limit);

    // 🔹 Fetch paginated results
    const [auctions, totalCount] = await Promise.all([
      HarvestAuction.find(query)
        .sort({ date: -1 })
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize),
      HarvestAuction.countDocuments(query),
    ]);

    res.json({
      auctions,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: pageNum,
    });
  } catch (err) {
    console.error("Error fetching Harvest Auctions:", err);
    res.status(500).json({
      message: "Error fetching Harvest Auctions",
      error: err.message,
    });
  }
};


// ➤ Update Harvest Auction
exports.updateHarvestAuction = async (req, res) => {
  try {
    const auction = await HarvestAuction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(auction);
  } catch (err) {
    res.status(500).json({ message: "Failed to update Harvest Auction", error: err.message });
  }
};


// ➤ Buyer Report
// exports.getHarvestAuctionReportByBuyer = async (req, res) => {
//   try {
//     const auctions = await HarvestAuction.find().lean();
//     const buyersMap = {};

//     auctions.forEach(a => {
//       const key = a.buyerId || `PHONE:${a.buyerPhone}`;
//       if (!buyersMap[key]) {
//         buyersMap[key] = {
//           buyerId: a.buyerId || null,
//           buyerPhone: !a.buyerId ? a.buyerPhone : null,
//         };
//       }
//     });

//     const reports = [];
//     for (const key in buyersMap) {
//       const r = await buildBuyerReport(buyersMap[key]);
//       reports.push(r);
//     }

//     res.json(reports);
//   } catch (err) {
//     console.error("Harvest Auction Report error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

exports.getHarvestAuctionReportByBuyer = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    // 🔹 Step 1: Fetch all auctions
    const auctions = await HarvestAuction.find().lean();

    // 🔹 Step 2: Group by buyer
    const buyersMap = {};
    auctions.forEach(a => {
      const key = a.buyerId || `PHONE:${a.buyerPhone}`;
      if (!buyersMap[key]) {
        buyersMap[key] = {
          buyerId: a.buyerId || null,
          buyerPhone: !a.buyerId ? a.buyerPhone : null,
        };
      }
    });

    // 🔹 Step 3: Build buyer-wise reports
    const reports = [];
    for (const key in buyersMap) {
      const r = await buildBuyerReport(buyersMap[key]);
      reports.push(r);
    }

    // 🔹 Step 4: Apply search (by ID or name)
    const filteredReports = reports.filter(r =>
      r.buyerId?.toLowerCase().includes(search.toLowerCase()) ||
      r.buyerName?.toLowerCase().includes(search.toLowerCase())
    );
    const totalOverallUnpaid = filteredReports.reduce(
      (sum, r) => sum + (r.overallUnpaid || 0),
      0
    );

    // 🔹 Step 5: Paginate
    const total = filteredReports.length;
    const startIndex = (page - 1) * limit;
    const paginated = filteredReports.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      buyers: paginated,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      totalOverallUnpaid,
    });
  } catch (err) {
    console.error("Harvest Auction Report error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.searchHarvestBuyerById = async (req, res) => {
  try {
    const { query = "" } = req.query;
    if (!query.trim()) return res.json({ data: [] });

    const auctions = await HarvestAuction.find(
      {
        buyerId: { $regex: query, $options: "i" },
        balance: { $gt: 0 },
      },
      { buyerId: 1 }
    ).lean();

    const uniqueIds = [...new Set(auctions.map(a => a.buyerId).filter(Boolean))];

    const results = [];
    for (const buyerId of uniqueIds) {
      const summary = await buildBuyerSummary({ buyerId });
      if (summary) results.push(summary);
    }

    res.json({ data: results });
  } catch (err) {
    console.error("Search Buyer by ID error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.searchHarvestBuyerByName = async (req, res) => {
  try {
    const { query = "" } = req.query;
    if (!query.trim()) return res.json({ data: [] });

    const auctions = await HarvestAuction.find(
      {
        buyerName: { $regex: query, $options: "i" },
        balance: { $gt: 0 },
      },
      { buyerId: 1, buyerPhone: 1 }
    ).lean();

    const buyersMap = new Map();

    for (const a of auctions) {
      const key = a.buyerId || `PHONE:${a.buyerPhone}`;
      if (!buyersMap.has(key)) {
        buyersMap.set(key, { buyerId: a.buyerId, buyerPhone: a.buyerPhone });
      }
    }

    const results = [];
    for (const buyer of buyersMap.values()) {
      const summary = await buildBuyerSummary(buyer);
      if (summary) results.push(summary);
    }

    res.json({ data: results });
  } catch (err) {
    console.error("Search Buyer by Name error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.searchHarvestBuyerByPhone = async (req, res) => {
  try {
    const { query = "" } = req.query;
    if (!query.trim()) return res.json({ data: [] });

    const auctions = await HarvestAuction.find(
      {
        buyerPhone: { $regex: query, $options: "i" },
        balance: { $gt: 0 },
      },
      { buyerPhone: 1 }
    ).lean();

    const uniquePhones = [...new Set(auctions.map(a => a.buyerPhone).filter(Boolean))];

    const results = [];
    for (const phone of uniquePhones) {
      const summary = await buildBuyerSummary({ buyerPhone: phone });
      if (summary) results.push(summary);
    }

    res.json({ data: results });
  } catch (err) {
    console.error("Search Buyer by Phone error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ➤ Add Payment
exports.addHarvestAuctionPayment = async (req, res) => {
  try {
    const { auctionId, amountPaid, source } = req.body;
    const auction = await HarvestAuction.findById(auctionId);
    if (!auction) return res.status(404).json({ message: "Auction not found" });

    const newTotalPaid = (auction.totalPaid || 0) + amountPaid;
    const newBalance = auction.amount - newTotalPaid;

    auction.totalPaid = newTotalPaid;
    auction.balance = newBalance;
    auction.payment_status = newBalance <= 0 ? "Paid" : "Unpaid";

    auction.payments = auction.payments || [];
    auction.payments.push({ amountPaid, date: new Date(), balanceAfter: newBalance, source: source || "Direct", });

    await auction.save();

    // Also save in separate collection
    const payment = new HarvestAuctionPayment({
      harvestAuctionId: auction._id,
      buyerId: auction.buyerId || "",
      buyerName: auction.buyerName || "Unknown",
      buyerPhone: auction.buyerPhone || "N/A",
      sellerId: auction.sellerId || "",
      sellerName: auction.sellerName || "Unknown",
      item: auction.item,
      amountPaid,
      balanceAfter: newBalance,
      source: source || "Direct",
      date: new Date(),
    });

    await payment.save();

    res.status(201).json({ message: "Payment added successfully", auction, payment });
  } catch (err) {
    console.error("Harvest Auction Payment error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ➤ Add Buyer Payment (distribute across unpaid auctions)
exports.addHarvestAuctionPaymentForBuyer = async (req, res) => {
  try {
    const { buyerId, amountPaid } = req.body;
    if (!buyerId || !amountPaid) {
      return res.status(400).json({ message: "buyerId and amountPaid are required" });
    }

    // get all unpaid auctions for that buyer, sorted by date
    let auctions = await HarvestAuction.find({ 
      buyerId, 
      balance: { $gt: 0 } 
    }).sort({ date: 1 });

    let remaining = amountPaid;
    const paymentsSaved = [];

    for (let auction of auctions) {
      if (remaining <= 0) break;

      const payAmount = Math.min(remaining, auction.balance);
      auction.totalPaid = (auction.totalPaid || 0) + payAmount;
      auction.balance = auction.amount - auction.totalPaid;
      auction.payment_status = auction.balance <= 0 ? "Paid" : "Unpaid";

      auction.payments.push({
        amountPaid: payAmount,
        date: new Date(),
        balanceAfter: auction.balance,
      });

      await auction.save();

      const payment = new HarvestAuctionPayment({
        harvestAuctionId: auction._id,
        buyerId: auction.buyerId,
        buyerName: auction.buyerName,
        buyerPhone: auction.buyerPhone,
        sellerId: auction.sellerId || "",
        sellerName: auction.sellerName || "",
        item: auction.item,
        amountPaid: payAmount,
        balanceAfter: auction.balance,
        date: new Date(),
      });
      await payment.save();

      paymentsSaved.push(payment);
      remaining -= payAmount;
    }

    res.status(201).json({
      message: "Buyer payment applied successfully",
      totalPaid: amountPaid - remaining,
      payments: paymentsSaved,
    });
  } catch (err) {
    console.error("Harvest Auction Buyer Payment error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ➤ Get Harvest Auction Report for a specific member
exports.getHarvestAuctionReportByMember = async (req, res) => {
  try {
    const { memberId } = req.query;

    if (!memberId) {
      return res.status(400).json({ message: "Member ID is required" });
    }

    const report = await buildBuyerReport({ buyerId: memberId });

    res.json(report);
  } catch (err) {
    console.error("Harvest Auction Member Report error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Escape regex to prevent injection
const escapeRegex = (text = "") =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Search Harvest Items by Code
 * GET /harvest-items/search/by-code?query=A1
 */
exports.searchItemByCode = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Query required" });

    const regex = new RegExp(escapeRegex(query), "i");

    const items = await HarvestItem.find({ code: regex })
      .select("code name amount")
      .lean();

    const results = items.map(i => ({
      code: i.code,
      name: i.name,
      amount: i.amount || 0,
    }));

    res.json({ data: results });

  } catch (err) {
    console.error("Item code search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * Search Harvest Items by Name
 * GET /harvest-items/search/by-name?query=Key
 */
exports.searchItemByName = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Query required" });

    const regex = new RegExp(escapeRegex(query), "i");

    const items = await HarvestItem.find({ name: regex })
      .select("code name amount")
      .lean();

    const results = items.map(i => ({
      code: i.code,
      name: i.name,
      amount: i.amount || 0,
    }));

    res.json({ data: results });

  } catch (err) {
    console.error("Item name search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};