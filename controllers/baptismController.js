const { launchBrowser } = require("../util/puppeteer");
const path = require("path");
const fs = require("fs");
const Baptism = require("../Schema/baptismCertificateSchema");
const Member = require("../Schema/memberSchema"); 

const today = new Date();
const downloadDate = today.toLocaleDateString("en-GB");


// Convert yyyy-mm-dd → dd/mm/yyyy
const formatDMY = (date) => {
  if (!date) return "-";

  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

/* Generate Baptism ID */
async function generateBaptismId() {
  const last = await Baptism.findOne().sort({ created_at: -1 });

  let num = 1;

  if (last && last.baptism_id) {
    const digits = last.baptism_id.replace(/\D/g, ""); // get only numbers
    num = Number(digits) + 1;
  }

  return "BAP" + String(num).padStart(5, "0");
}


exports.getNextBaptismId = async (req, res) => {
  try {
    const last = await Baptism.findOne().sort({ created_at: -1 });

    let num = 1;

    if (last && last.baptism_id) {
      const digits = last.baptism_id.replace(/\D/g, "");
      num = Number(digits) + 1;
    }

    const next = "BAP" + String(num).padStart(5, "0");
    res.json({ next });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/* Add Baptism */
exports.addBaptism = async (req, res) => {
  try {
    const baptism_id = await generateBaptismId();

    let gender = req.body.gender; // default from frontend

    // ✅ If this is a MEMBER, fetch real gender from Member table
    if (req.body.isMember && req.body.member_id) {
      const member = await Member.findOne({ member_id: req.body.member_id });

      if (member && member.gender) {
        gender = member.gender;   // <-- use official stored gender
      }
    }

    const data = new Baptism({
      ...req.body,
      baptism_id,
      gender,   // 👈 FINAL SOURCE OF TRUTH
    });

    await data.save();

    res.json({ message: "Baptism Certificate Added", baptism_id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


exports.getBaptisms = async (req, res) => {
  try {
    const { page = 1, search = "", from, to } = req.query;
    const limit = 25;
    const skip = (page - 1) * limit;

    const query = {};

    if (search) {
      query.$or = [
        { baptism_id: { $regex: search, $options: "i" } },
        { member_id: { $regex: search, $options: "i" } },
        { member_name: { $regex: search, $options: "i" } }
      ];
    }

    if (from || to) {
      query.baptism_date = {};
      if (from) query.baptism_date.$gte = from;
      if (to) query.baptism_date.$lte = to;
    }

    const total = await Baptism.countDocuments(query);
    const data = await Baptism.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      data,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSingleBaptism = async (req, res) => {
  try {
    const data = await Baptism.findById(req.params.id).lean();
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
    



exports.downloadSingleBaptismPDF = async (req, res) => {
  let browser;

  try {
    const baptism = await Baptism.findById(req.params.id).lean();
    if (!baptism) return res.status(404).send("Baptism record not found");

    let html = fs.readFileSync(
      path.join(__dirname, "../templates/baptismCertificate.html"),
      "utf8"
    );

    const v = (x) => (!x || x === "" ? "" : x);

    html = html
      .replace(/{{BAPTISM_ID}}/g, v(baptism.baptism_id))
      .replace(/{{MEMBER_ID}}/g, v(baptism.member_id))
      .replace(/{{NAME}}/g, v(baptism.member_name))
      .replace(/{{DOB}}/g, formatDMY(baptism.dob))
      .replace(/{{AGE}}/g, v(baptism.age))
      .replace(/{{SEX}}/g, v(baptism.gender))
      .replace(/{{PROFESSION}}/g, v(baptism.profession))
      .replace(/{{AADHAR}}/g, v(baptism.aadhar_number))
      .replace(/{{PLACE_OF_BIRTH}}/g, v(baptism.place_of_birth))
      .replace(/{{FATHER}}/g, v(baptism.father_name))
      .replace(/{{MOTHER}}/g, v(baptism.mother_name))
      .replace(/{{ADDRESS}}/g, v(baptism.address))
      .replace(/{{BAPTISM_DATE}}/g, formatDMY(baptism.baptism_date))
      .replace(/{{BAPTISM_TYPE}}/g, v(baptism.baptism_type))
      .replace(/{{BAPTISM_PLACE}}/g, v(baptism.baptism_place))
      .replace(/{{BAPTISED_BY}}/g, v(baptism.baptised_by))
      .replace(/{{GOD_PARENTS}}/g, v(baptism.god_parents))
      .replace(/{{WITNESSES}}/g, v(baptism.witnesses))
      .replace(/{{ISSUED_ON}}/g, v(baptism.issued_on))
      .replace(/{{ISSUED_BY}}/g, v(baptism.issued_by))
      .replace(/{{DOWNLOAD_DATE}}/g, downloadDate);

// ---- NEW: Certificate sentence (important) ----
const certLine = baptism.issued_by
  ? `I, <b>${String(baptism.issued_by).toUpperCase()}</b> do hereby certify that the above is a true extract from the register of Baptism kept in this Church.`
  : "";

html = html.replace(/{{CERT_LINE}}/g, certLine);


// -----------------------------------------------


    browser = await launchBrowser();

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 0 });

const pdf = await page.pdf({
  width: "356mm",
  height: "216mm",
  printBackground: true,
});

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${baptism.baptism_id}.pdf`
    );

    res.end(pdf);

  } catch (err) {
    console.error(err);
    res.status(500).send("PDF generation failed");
  } finally {
    if (browser) await browser.close();
  }
};
