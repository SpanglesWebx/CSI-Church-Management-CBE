const { launchBrowser } = require("../util/puppeteer");
const path = require("path");
const fs = require("fs");
// TODO: import your Trial Balance model here if you have one

exports.downloadTrialBalancePDF = async (req, res) => {
  let browser;

  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).send("From and To date required");
    }

    // Load HTML template
    const templatePath = path.join(
      __dirname,
      "../templates/TrialBalance.html"
    );

    let html = fs.readFileSync(templatePath, "utf8");

    // Replace dates in template
    html = html.replace("{{FROM_DATE}}", from);
    html = html.replace("{{TO_DATE}}", to);

    // 🔹 TODO: Fetch trial balance data from DB here
    // Example dummy rows (replace later with real data)

    // Launch Puppeteer
    browser = await launchBrowser();

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=Trial-Balance-${from}-to-${to}.pdf`,
    });

    res.end(pdfBuffer);
  } catch (err) {
    console.error("Trial Balance PDF error:", err);
    res.status(500).send("PDF generation failed");
  } finally {
    if (browser) await browser.close();
  }
};
