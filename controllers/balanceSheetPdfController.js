const { launchBrowser } = require("../util/puppeteer");
const path = require("path");
const fs = require("fs");

exports.downloadBalanceSheetPDF = async (req, res) => {
  let browser;

  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).send("From and To date required");
    }

    const templatePath = path.join(
      __dirname,
      "../templates/BalanceSheet.html"
    );

    let html = fs.readFileSync(templatePath, "utf8");

    html = html.replace(/{{FROM_DATE}}/g, from);
    html = html.replace(/{{TO_DATE}}/g, to);

    browser = await launchBrowser();

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=Balance-Sheet-${from}-to-${to}.pdf`,
    });

    res.end(pdfBuffer);

  } catch (err) {
    console.error("Balance Sheet PDF error:", err);
    res.status(500).send("PDF generation failed");
  } finally {
    if (browser) await browser.close();
  }
};
