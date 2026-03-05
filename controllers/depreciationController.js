const LedgerCategory = require("../Schema/LedgerCategory");
const ChurchExpense = require("../Schema/ChurchExpenseSchema");

exports.getDepreciationReport = async (req, res) => {
  try {

    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: "From and To date required" });
    }

    const categories = await LedgerCategory.find({
      accountType: "Assets-Fixed Assets"
    }).sort({ createdAt: 1 });

    let rows = [];

const fromDate = new Date(from);
const toDate = new Date(to);

// remove time part
fromDate.setHours(0,0,0,0);
toDate.setHours(0,0,0,0);

const totalDays =
  Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;

let grandOpening = 0;
let grandAdditions = 0;
let grandGross = 0;
let grandDep = 0;
let grandClosing = 0;

    for (const category of categories) {

      if (!category.depreciationPercent && category.depreciationPercent !== 0)
        continue;

      const rate = Number(category.depreciationPercent);

      const ledgers = (category.ledgers || [])
        .filter(l => l.depreciationValue !== null && l.depreciationValue !== undefined);

      if (ledgers.length === 0) continue;

      rows.push({
        type: "category",
        particulars: category.name
      });

      let totalOpening = 0;
      let totalAdditions = 0;
      let totalGross = 0;
      let totalDep = 0;
      let totalClosing = 0;

      for (const ledger of ledgers) {

        const openingWDV = Number(ledger.depreciationValue || 0);

        /* ===== LEDGER DEPRECIATION ===== */

        const ledgerDep =
          (openingWDV * rate / 100) * (totalDays / 365);

        const ledgerClosing = openingWDV - ledgerDep;

        rows.push({
          type: "ledger",
          particulars: ledger.name,
          wdvOpening: Math.round(openingWDV),
          additions: "",
          deletions: "",
          grossBlock: Math.round(openingWDV),
          deprRate: `${rate}%`,
          deprAmount: Math.round(ledgerDep),
          wdvClosing: Math.round(ledgerClosing)
        });

        totalOpening += openingWDV;
        totalGross += openingWDV;
        totalDep += ledgerDep;
        totalClosing += ledgerClosing;

        /* ===== ADDITIONS ===== */

        const additionsList = await ChurchExpense.find({
          date: { $gte: fromDate, $lte: toDate },
          "expenseLines.ledgerCode": ledger.code
        }).lean();

        for (const exp of additionsList) {
          for (const line of exp.expenseLines) {

            if (line.ledgerCode === ledger.code) {

              const amount = Number(line.amount);

              const addDate = new Date(exp.date);

const start = new Date(addDate);
const end = new Date(toDate);

// remove time portion
start.setHours(0,0,0,0);
end.setHours(0,0,0,0);

const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

              const dep =
                (amount * rate / 100) * (diffDays / 365);

              const closing = amount - dep;

              rows.push({
                type: "addition",
                particulars: `Additions ${addDate.toLocaleDateString("en-GB")}`,
                wdvOpening: "",
                additions: Math.round(amount),
                deletions: "",
                grossBlock: Math.round(amount),
                deprRate: `${rate}%`,
                deprAmount: Math.round(dep),
                wdvClosing: Math.round(closing)
              });

              totalAdditions += amount;
              totalGross += amount;
              totalDep += dep;
              totalClosing += closing;

            }
          }
        }

      }

      rows.push({
        type: "total",
        particulars: "Group Total",
        wdvOpening: Math.round(totalOpening),
        additions: Math.round(totalAdditions),
        deletions: 0,
        grossBlock: Math.round(totalGross),
        deprRate: "",
        deprAmount: Math.round(totalDep),
        wdvClosing: Math.round(totalClosing)
      });
grandOpening += totalOpening;
grandAdditions += totalAdditions;
grandGross += totalGross;
grandDep += totalDep;
grandClosing += totalClosing;
      rows.push({ type: "gap" });

    }

rows.push({
  type: "grandTotal",
  particulars: "Total",
  wdvOpening: Math.round(grandOpening),
  additions: Math.round(grandAdditions),
  deletions: 0,
  grossBlock: Math.round(grandGross),
  deprRate: "",
  deprAmount: Math.round(grandDep),
  wdvClosing: Math.round(grandClosing)
});


    res.json({
      status: "Success",
      data: rows
    });

  }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};