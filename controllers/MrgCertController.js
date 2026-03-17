// controllers/MrgCertController.js
const { launchBrowser } = require("../util/puppeteer");
const path = require("path");
const fs = require("fs");
const MrgCert = require("../Schema/MrgCertSchema");
const MrgIdCounter = require("../Schema/MrgIdCounterSchema"); // as requested
const { getIndianTime } = require("../util/getIndianTime");
const { generateMarriageCode } = require("../util/generateMarriageCode");


exports.previewMarriageCode = async (req, res) => {
  try {
    const istDate = getIndianTime();
    const year = istDate.getFullYear().toString().slice(-2);

    const counter = await MrgIdCounter.findOne({ key: "MARRIAGE_REG" }).lean();
    const nextSeq = (counter?.seq || 0) + 1;

    const paddedSeq = nextSeq < 100000 ? String(nextSeq).padStart(5, "0") : String(nextSeq);
    const marriageCode = `MR${year}${paddedSeq}`;

    return res.json({ marriageCode, nextSeq });
  } catch (err) {
    console.error("previewMarriageCode error:", err);
    return res.status(500).json({ message: "Failed to preview marriage code" });
  }
};

exports.createMarriage = async (req, res) => {
  try {
    const { marriageCode, sequence, istDate } = await generateMarriageCode();
    const groomPhotoPath = req.files?.groomPhoto
      ? `/uploads/MrgCertificate/${req.files.groomPhoto[0].filename}`
      : "";

    const bridePhotoPath = req.files?.bridePhoto
      ? `/uploads/MrgCertificate/${req.files.bridePhoto[0].filename}`
      : "";

const payload = {
  marriageCode,
  marriageYear: istDate.getFullYear(),
  marriageSeq: sequence,
  registerSlNo: req.body.registerSlNo || "",

  groom: {
    ...JSON.parse(req.body.groom || "{}"),
    photo: groomPhotoPath
  },

  groomChurch: JSON.parse(req.body.groomChurch || "{}"),

  bride: {
    ...JSON.parse(req.body.bride || "{}"),
    photo: bridePhotoPath
  },

  brideChurch: JSON.parse(req.body.brideChurch || "{}"),

  banns: JSON.parse(req.body.banns || "{}"),

  pastors: JSON.parse(req.body.pastors || "[]"),
  witnesses: JSON.parse(req.body.witnesses || "[]"),

  createdBy: req.user?.id || null
};

    const created = await MrgCert.create(payload);

    return res.status(201).json({
      message: "Marriage saved",
      marriageId: created._id,
      marriageCode: created.marriageCode
    });
  } catch (err) {
    console.error("createMarriage error:", err);
    if (err.code === 11000) {
      return res.status(409).json({ message: "Marriage code conflict, try again" });
    }
    return res.status(500).json({ message: "Failed to save marriage" });
  }
};

exports.getMarriageList = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      search = "",
      from,
      to
    } = req.query;

    const skip = (page - 1) * limit;

    // 🔍 SEARCH CONDITIONS
    const searchQuery = search
      ? {
          $or: [
            { marriageCode: { $regex: search, $options: "i" } },
            { registerSlNo: { $regex: search, $options: "i" } },
            { "groom.memberName": { $regex: search, $options: "i" } },
            { "groom.nonMemberName": { $regex: search, $options: "i" } },
            { "bride.memberName": { $regex: search, $options: "i" } },
            { "bride.nonMemberName": { $regex: search, $options: "i" } }
          ]
        }
      : {};

    // 📅 DATE FILTER (Marriage Date)
    const dateQuery = {};
    if (from || to) {
      dateQuery["banns.weddingDate"] = {};
      if (from) dateQuery["banns.weddingDate"].$gte = from;
      if (to) dateQuery["banns.weddingDate"].$lte = to;
    }

    const finalQuery = {
      ...searchQuery,
      ...dateQuery
    };

    const projection = {
      marriageCode: 1,
      registerSlNo: 1,
      "groom.memberName": 1,
      "groom.nonMemberName": 1,
      "bride.memberName": 1,
      "bride.nonMemberName": 1,
      "banns.weddingDate": 1
    };

    const [rows, totalCount] = await Promise.all([
      MrgCert.find(finalQuery)
        .select(projection)   // 🔥 REDUCES PAYLOAD
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),

      MrgCert.countDocuments(finalQuery)
    ]);

    return res.json({
      data: rows,
      totalPages: Math.ceil(totalCount / limit),
      totalCount
    });

  } catch (err) {
    console.error("getMarriageList error:", err);
    return res.status(500).json({ message: "Failed to fetch marriages" });
  }
};


exports.getMarriageById = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await MrgCert.findById(id).lean();
    if (!doc) {
      return res.status(404).json({ message: "Marriage certificate not found" });
    }

    return res.json({ data: doc });

  } catch (err) {
    console.error("getMarriageById error:", err);
    return res.status(500).json({ message: "Failed to fetch marriage certificate" });
  }
};



exports.downloadSingleMarriagePDF = async (req, res) => {
  let browser;

  try {
    const marriage = await MrgCert.findById(
      req.params.id
    ).lean();

    if (!marriage)
      return res
        .status(404)
        .send("Marriage record not found");

    let html = fs.readFileSync(
      path.join(
        __dirname,
        "../templates/marriageCertificate.html"
      ),
      "utf8"
    );


const formatToday = () => {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const formatDob = (dob) => {
  if (!dob) return "-";

  // If already in DD/MM/YYYY, return as is
  if (dob.includes("/")) return dob;

  // Convert YYYY-MM-DD → DD/MM/YYYY
  const parts = dob.split("-");
  if (parts.length !== 3) return dob;

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const getCondition = (status, type) => {
  if (!status) return "-";

  const s = status.toLowerCase();

  if (s === "single") {
    return type === "groom" ? "BACHELOR" : "SPINSTER";
  }

  // if (s === "widower") {
  //   return type === "groom" ? "WIDOWER" : "WIDOW";
  // }

  // if (s === "divorce") {
  //   return "DIVORCE";
  // }

  return "-";
};

const getOrdinal = (n) => {
  if (n % 10 === 1 && n % 100 !== 11) return n + "st";
  if (n % 10 === 2 && n % 100 !== 12) return n + "nd";
  if (n % 10 === 3 && n % 100 !== 13) return n + "rd";
  return n + "th";
};

const pad = (n) => String(n).padStart(2, "0");

const formatWeddingParts = (dateStr) => {
  if (!dateStr) return {
    num: "-",
    word: "-",
    year: "-",
    day: "-"
  };

  const d = new Date(dateStr);

  const dd = pad(d.getDate());
  const mm = pad(d.getMonth() + 1);
  const yyyy = d.getFullYear();

  const monthWord = d.toLocaleString("en-IN", { month: "long" }).toUpperCase();
  const weekday = d.toLocaleString("en-IN", { weekday: "long" }).toUpperCase();

  return {
    num: `${dd}/${mm}/${yyyy}`,                 // ✅ 04/05/2026
    word: `${getOrdinal(d.getDate())} ${monthWord}`, // 4th MAY → 04th MAY
    year: yyyy,                                 // 2026
    day: weekday                                // MONDAY
  };
};


const buildWitnessBlock = (witnesses = []) => {
  if (!witnesses || witnesses.length === 0) return "-";

  let block = "";

  witnesses.forEach((w, index) => {
    block += `
(${index + 1})<br/>
<div style="margin-left:28px;">
  (Sd) ${w.name || "-"}<br/>
  ${w.address || "-"}
</div>
<br/>
`;
  });

  return block;
};

html = html.replace(
  /{{WITNESSES_BLOCK}}/g,
  buildWitnessBlock(marriage.witnesses)
);


    const v = (x) => (!x || x === "" ? "-" : x);

    // ---------- MAIN DATA REPLACEMENTS ----------
    html = html
      .replace(
        /{{MARRIAGE_CODE}}/g,
        v(marriage.marriageCode)
      )
      .replace(
        /{{REGISTER_NO}}/g,
        v(marriage.registerSlNo)
      )
      .replace(
        /{{GROOM_NAME}}/g,
        v(
          marriage.groom?.memberName ||
            marriage.groom?.nonMemberName
        )
      )
.replace(/{{GROOM_CONDITION}}/g,
  getCondition(marriage.groom?.maritalStatus, "groom")
)
.replace(/{{BRIDE_CONDITION}}/g,
  getCondition(marriage.bride?.maritalStatus, "bride")
)
      .replace(
        /{{BRIDE_NAME}}/g,
        v(
          marriage.bride?.memberName ||
            marriage.bride?.nonMemberName
        )
      )
      .replace(
        /{{GROOM_AGE}}/g,
        v(marriage.groom?.age)
      )
      .replace(
        /{{GROOM_DOB}}/g,
        formatDob(marriage.groom?.dob)
      )
      .replace(
        /{{BRIDE_AGE}}/g,
        v(marriage.bride?.age)
      )
      .replace(
        /{{BRIDE_DOB}}/g,
        formatDob(marriage.bride?.dob)
      )
      .replace(
        /{{GROOM_PROFESSION}}/g,
        v(marriage.groom?.profession)
      )
      .replace(
        /{{BRIDE_PROFESSION}}/g,
        v(marriage.bride?.profession)
      )
.replace(
  /{{GROOM_ADDRESS}}/g,
  `${v(marriage.groom?.address)} - ${v(marriage.groom?.pincode)}`
)
      .replace(
        /{{DOWNLOAD_DATE}}/g,
        formatToday()
      )
.replace(
  /{{BRIDE_ADDRESS}}/g,
  `${v(marriage.bride?.address)} - ${v(marriage.bride?.pincode)}`
)
      .replace(
        /{{GROOM_FATHER}}/g,
        v(marriage.groom?.fatherName)
      )
      .replace(
        /{{BRIDE_FATHER}}/g,
        v(marriage.bride?.fatherName)
      )
      .replace(
        /{{WEDDING_DATE}}/g,
        v(
          marriage.banns?.weddingDate
            ? formatWeddingParts(marriage.banns.weddingDate).num   // <-- KEEP SLASHES
            : "-"
        )
      )
      .replace(
        /{{BANNS_OR_LICENSE}}/g,
        v(marriage.banns?.bannsLicense || "Banns")
      )
      .replace(
        /{{BETROTHAL_DATE}}/g,
        v(marriage.banns?.betrothalDate)
      )
      .replace(
        /{{BETROTHAL_PLACE}}/g,
        v(marriage.banns?.betrothalPlace)
      )
      .replace(
        /{{CERT_ISSUED}}/g,
        v(marriage.banns?.marriageCertIssued)
      )
      .replace(
        /{{CERT_ISSUED_ON}}/g,
        v(marriage.banns?.marriageCertIssuedDate)
      );

const wedding = formatWeddingParts(marriage.banns?.weddingDate);

html = html
  .replace(/{{WEDDING_DATE_NUM}}/g, v(wedding.num))
  .replace(/{{WEDDING_DATE_WORD}}/g, v(wedding.word))
  .replace(/{{WEDDING_YEAR}}/g, v(wedding.year))
  .replace(/{{WEDDING_DAY}}/g, v(wedding.day));


    // ---------- DEFINE FIRST (IMPORTANT) ----------

    const pastor = marriage.pastors?.[0] || {};

// Convert DB role to display text for PDF
const displayPastorRole =
  pastor.pastor_role?.toLowerCase() === "primary"
    ? "PRESBYTER & CHAIRMAN"
    : "PRESBYTER";


    // ---------- WITNESSES & PASTOR ----------
    html = html
      .replace(
        /{{PASTOR_NAME}}/g,
        v(pastor.name)
      )
      .replace(
        /{{PASTOR_QUALIFICATION}}/g,
        v(pastor.qualification)
      )
html = html.replace(
  /{{PASTOR_ROLE}}/g,
  v(displayPastorRole)
)
      .replace(
        /{{PASTOR_RESPONSIBILITY}}/g,
        v(pastor.responsibility)
      );

    // ---------- GENERATE PDF ----------
    browser = await launchBrowser();

    const page = await browser.newPage();
    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 0,
    });

const pdf = await page.pdf({
  width: "356mm",
  height: "216mm",
  printBackground: true,
});

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${marriage.marriageCode}.pdf`
    );

    res.end(pdf);
  } catch (err) {
    console.error(err);
    res.status(500).send("PDF generation failed");
  } finally {
    if (browser) await browser.close();
  }
};