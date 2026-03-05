
const Member = require("../Schema/memberSchema");
const Receipt = require("../Schema/ReceiptSchema");
const ChurchExpense = require("../Schema/ChurchExpenseSchema");
const Journal = require("../Schema/JournalSchema");
const CashAccount = require("../Schema/CashAccountSchema");
const Bank = require("../Schema/bankSchema");




exports.getMemberCount = async (req, res) => {
  try {

    const stats = await Member.aggregate([
      {
        $facet: {

          totalMembers: [
            { $count: "count" }
          ],

          memberTypes: [
            {
              $group: {
                _id: "$member_type",
                count: { $sum: 1 }
              }
            }
          ],

          headYes: [
            { $match: { isHead: "Yes" } },
            { $count: "count" }
          ],

          headNo: [
            { $match: { isHead: "No" } },
            { $count: "count" }
          ]

        }
      }
    ]);

    res.json(stats[0]);

  } catch (err) {
    res.status(500).json({
      message: "Error fetching member statistics",
      error: err.message
    });
  }
};


exports.getTodayGeneralFundStats = async (req, res) => {
  try {

    const start = new Date();
    start.setHours(0,0,0,0);
                                                                   
    const end = new Date();
    end.setHours(23,59,59,999);

    /* RECEIPTS */

    const receiptStats = await Receipt.aggregate([
      {
        $match: {
          receiptDate: { $gte: start, $lte: end },
          receiptReturned: false
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          amount: { $sum: "$totalAmount" }
        }
      }
    ]);

    /* PAYMENTS */

    const paymentStats = await ChurchExpense.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end },
          expenseReturned: false
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          amount: { $sum: "$totalAmount" }
        }
      }
    ]);

    /* JOURNALS */

    const journalStats = await Journal.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          amount: { $sum: "$totalAmount" }
        }
      }
    ]);

    res.json({
      receiptsCount: receiptStats[0]?.count || 0,
      receiptsAmount: receiptStats[0]?.amount || 0,

      paymentsCount: paymentStats[0]?.count || 0,
      paymentsAmount: paymentStats[0]?.amount || 0,

      journalsCount: journalStats[0]?.count || 0,
      journalsAmount: journalStats[0]?.amount || 0,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Dashboard Error" });
  }
};





exports.getBalanceSummary = async (req, res) => {
  try {

    /* CASH ACCOUNTS */

    const cashAccounts = await CashAccount.find();

    let cashInHand = 0;
    let pettyCash = 0;

    cashAccounts.forEach(acc => {
      if (acc.account_type === "Cash on Hand A/c") {
        cashInHand = acc.current_balance;
      }

      if (acc.account_type === "Petty Cash A/c") {
        pettyCash = acc.current_balance;
      }
    });

    /* BANKS */

    const banks = await Bank.find({ status: "Active" })
      .select("bank_name account_number current_balance");

    res.json({
      cashInHand,
      pettyCash,
      banks
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Balance summary error" });
  }
};