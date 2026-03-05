// const Death = require("../Schema/deathCertificateSchema");
const { launchBrowser } = require("../util/puppeteer");
const path = require("path");
const fs = require("fs");
const Death = require("../Schema/deathCertificateSchema");


// Generate Death ID
async function generateDeathId() {
  const last = await Death.findOne().sort({ created_at: -1 });

  let num = 1;
  if (last && last.death_id) {
    const digits = last.death_id.replace(/\D/g, "");
    num = Number(digits) + 1;
  }

  return "DTH" + String(num).padStart(5, "0");
}

exports.addDeath = async (req, res) => {
  try {
    const death_id = await generateDeathId();
    const data = new Death({ ...req.body, death_id });
    await data.save();
    res.json({ message: "Death certificate added", death_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDeaths = async (req, res) => {
  try {
    const { page = 1, limit = 25, search = "", from, to } = req.query;
    const skip = (page - 1) * limit;

    const query = {};

    if (search) {
      query.$or = [
        { death_id: { $regex: search, $options: "i" } },
        { member_id: { $regex: search, $options: "i" } },
        { member_name: { $regex: search, $options: "i" } }
      ];
    }

    if (from || to) {
      query.died_on = {};
      if (from) query.died_on.$gte = from;
      if (to) query.died_on.$lte = to;
    }

    const total = await Death.countDocuments(query);
    const data = await Death.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.json({
      data,
      totalPages: Math.ceil(total / limit)
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSingleDeath = async (req, res) => {
  try {
    const data = await Death.findById(req.params.id).lean();
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};






exports.downloadSingleDeathPDF = async (req, res) => {
  let browser;

  try {
    const death = await Death.findById(req.params.id).lean();
    if (!death) return res.status(404).send("Death record not found");

    let html = fs.readFileSync(
      path.join(__dirname, "../templates/deathCertificate.html"),
      "utf8"
    );

    const v = (x) => (!x || x === "" ? "" : x);

    // Convert yyyy-mm-dd → dd/mm/yyyy
    const formatDMY = (date) => {
      if (!date) return "";
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    /* ---------- ADDRESS SPLIT ---------- */
    const fullAddress = death.address || "";
    const addressParts = fullAddress.split(",").map(p => p.trim());

    const line1 = addressParts[0] || "-";
    const line2 = addressParts[1] || "";
    const line3 = addressParts[2] || "";

    let city = "";
    let pin = "";

    if (addressParts.length > 3) {
      const last = addressParts[addressParts.length - 1];
      const pinMatch = last.match(/\d{6}/);
      if (pinMatch) {
        pin = pinMatch[0];
        city = last.replace(pin, "").replace(/[^a-zA-Z\s]/g, "").trim() || "";
      } else {
        city = last || "";
      }
    }

    /* ---------- DOB + AGE ---------- */
    const dobAge =
      death.dob
        ? `${formatDMY(death.dob)} / ${v(death.age)}`
        : `${v(death.age)}`;

    /* ---------- TEMPLATE REPLACEMENTS (VERY IMPORTANT) ---------- */
    html = html
      .replace(/{{SL_NO}}/g, v(death.death_id))
      .replace(/{{ISSUED_ON}}/g, formatDMY(death.certificate_issued_on))

      .replace(/{{NAME}}/g, v(death.member_name))
      .replace(/{{FATHER_HUSBAND}}/g, v(death.father_or_husband))
      .replace(/{{GENDER}}/g, v(death.gender))
      .replace(/{{DOB_AGE}}/g, dobAge)
      .replace(/{{AADHAAR}}/g, v(death.aadhar_number))
      .replace(/{{OCCUPATION}}/g, v(death.occupation))

      .replace(/{{ADDRESS_LINE1}}/g, line1)
      .replace(/{{ADDRESS_LINE2}}/g, line2)
      .replace(/{{ADDRESS_LINE3}}/g, line3)
      .replace(/{{CITY}}/g, v(city))
      .replace(/{{PIN}}/g, v(pin))

      .replace(/{{PLACE_OF_DEATH}}/g, v(death.place_of_death))
      .replace(/{{DIED_ON}}/g, formatDMY(death.died_on))
      .replace(/{{CAUSE_OF_DEATH}}/g, v(death.cause_of_death))
      .replace(/{{PLACE_OF_BURIAL}}/g, v(death.place_of_burial))
      .replace(/{{BURIED_ON}}/g, formatDMY(death.buried_on))
      .replace(/{{BURIED_BY}}/g, v(death.buried_by));

    browser = await launchBrowser();

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 0 });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${death.death_id}.pdf`
    );

    res.end(pdf);

  } catch (err) {
    console.error(err);
    res.status(500).send("PDF generation failed");
  } finally {
    if (browser) await browser.close();
  }
};
