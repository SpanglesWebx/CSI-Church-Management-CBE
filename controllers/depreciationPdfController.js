const { launchBrowser } = require("../util/puppeteer");
const path = require("path");
const fs = require("fs");
const LedgerCategory = require("../Schema/LedgerCategory");
const ChurchExpense = require("../Schema/ChurchExpenseSchema");

exports.downloadDepreciationPDF = async (req, res) => {

  let browser;

  const formatDate = (date) => {
    if (!date) return "";
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  try {

    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).send("From and To date required");
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    fromDate.setHours(0,0,0,0);
    toDate.setHours(0,0,0,0);

    const totalDays =
      Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;

    /* =========================
       GET DATA FROM DATABASE
    ========================== */

    const categories = await LedgerCategory.find({
      accountType: "Assets-Fixed Assets"
    }).sort({ createdAt: 1 });

    let rows = "";

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

      /* ===== CATEGORY TITLE ===== */

      rows += `
        <tr>
          <td class="section left" colspan="8">${category.name}</td>
        </tr>
      `;

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

        rows += `
          <tr>
            <td class="left">${ledger.name}</td>
            <td class="right">${Math.round(openingWDV)}</td>
            <td></td>
            <td></td>
            <td class="right">${Math.round(openingWDV)}</td>
            <td class="right">${rate}%</td>
            <td class="right">${Math.round(ledgerDep)}</td>
            <td class="right">${Math.round(ledgerClosing)}</td>
          </tr>
        `;

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

              start.setHours(0,0,0,0);
              end.setHours(0,0,0,0);

              const diffDays =
                Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

              const dep =
                (amount * rate / 100) * (diffDays / 365);

              const closing = amount - dep;

              rows += `
                <tr>
                  <td class="left" style="padding-left:20px">
                    Additions ${addDate.toLocaleDateString("en-GB")}
                  </td>
                  <td></td>
                  <td class="right">${Math.round(amount)}</td>
                  <td></td>
                  <td class="right">${Math.round(amount)}</td>
                  <td class="right">${rate}%</td>
                  <td class="right">${Math.round(dep)}</td>
                  <td class="right">${Math.round(closing)}</td>
                </tr>
              `;

              totalAdditions += amount;
              totalGross += amount;
              totalDep += dep;
              totalClosing += closing;

            }

          }

        }

      }

      /* ===== GROUP TOTAL ===== */

      rows += `
        <tr style="font-weight:bold;">
          <td class="left">Group Total</td>
          <td class="right">${Math.round(totalOpening)}</td>
          <td class="right">${Math.round(totalAdditions)}</td>
          <td class="right">0</td>
          <td class="right">${Math.round(totalGross)}</td>
          <td></td>
          <td class="right">${Math.round(totalDep)}</td>
          <td class="right">${Math.round(totalClosing)}</td>
        </tr>
      `;

grandOpening += totalOpening;
grandAdditions += totalAdditions;
grandGross += totalGross;
grandDep += totalDep;
grandClosing += totalClosing;



      rows += `
        <tr>
          <td colspan="8" style="height:10px;"></td>
        </tr>
      `;

    }

rows += `
<tr class="grand-total">
  <td class="left">TOTAL</td>
  <td class="right">${Math.round(grandOpening)}</td>
  <td class="right">${Math.round(grandAdditions)}</td>
  <td class="right">0</td>
  <td class="right">${Math.round(grandGross)}</td>
  <td></td>
  <td class="right">${Math.round(grandDep)}</td>
  <td class="right">${Math.round(grandClosing)}</td>
</tr>
`;


    /* =========================
       LOAD HTML TEMPLATE
    ========================== */

    const templatePath = path.join(
      __dirname,
      "../templates/Depreciation.html"
    );

    let html = fs.readFileSync(templatePath, "utf8");

    html = html.replace(/{{FROM_DATE}}/g, formatDate(from));
    html = html.replace(/{{TO_DATE}}/g, formatDate(to));
    html = html.replace("<!--ROWS-->", rows);

    /* =========================
       GENERATE PDF
    ========================== */

   browser = await launchBrowser();

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0"
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true
    });

    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        `attachment; filename=Depreciation-${from}-to-${to}.pdf`
    });

    res.end(pdfBuffer);

  }
  catch (err) {

    console.error(err);
    res.status(500).send("PDF generation failed");

  }
  finally {

    if (browser) await browser.close();

  }

};