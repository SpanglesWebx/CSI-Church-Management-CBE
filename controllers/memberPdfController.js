const { launchBrowser } = require("../util/puppeteer");
const path = require("path");
const fs = require("fs");
const Member = require("../Schema/memberSchema");

const v = (val) =>
  val === undefined || val === null || val === "" ? "-" : val;


exports.downloadMembersPDF = async (req, res) => {
  let browser;

  try {
    const { type = "list", status = "All", search = "", fromSI, toSI } = req.query;

    /* ---------------- FETCH MEMBERS ---------------- */
    const filter = {};

    if (status !== "All") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { member_name: new RegExp(search, "i") },
        { member_id: new RegExp(search, "i") },
        { member_tamil_name: new RegExp(search, "i") },
      ];
    }

let query = Member.find(filter).sort({ member_id: 1 });

if (fromSI && toSI) {

const start = Number(fromSI) - 1;
const limit = Number(toSI) - Number(fromSI) + 1;

query = query.skip(start).limit(limit);

}

const members = await query;

    /* ---------------- LOAD TEMPLATE ---------------- */
    const templatePath =
      type === "detailed"
        ? path.join(__dirname, "../templates/memberDetailed.html")
        : path.join(__dirname, "../templates/memberList.html");

    let html = fs.readFileSync(templatePath, "utf8");

    /* ---------------- INJECT DATA ---------------- */
    if (type === "list") {
      const rows = members
        .map(
            (m, index) => `
          <tr>
        <td>${index + 1}</td>
        <td>${m.member_id || "-"}</td>
        <td>${m.member_name || "-"}</td>
        <td>${m.member_tamil_name || "-"}</td>
        <td>${m.status || "-"}</td>
      </tr>
        `
        )
        .join("");

      html = html.replace("<!--ROWS-->", rows);
    }

else if (type === "detailed") {

  const SERVER = process.env.BACKEND_URL.replace("/api", "");

  const pages = members.map(m => {

    // build photo exactly like single member
    const photoUrl = m.photo
      ? `${SERVER}/member-photo-uploads/memberPhotos/${path.basename(m.photo)}`
      : null;

    const photoMarkup = photoUrl
      ? `<img src="${photoUrl}" />`
      : "PHOTO";

    // load template fresh for each member
    let pageHtml = fs.readFileSync(
      path.join(__dirname, "../templates/memberDetailed.html"),
      "utf8"
    );

    // same helper as single-member
    const formatDate = (d) => {
      if (!d) return "-";
      const dt = new Date(d);
      const dd = String(dt.getDate()).padStart(2, "0");
      const mm = String(dt.getMonth() + 1).padStart(2, "0");
      const yyyy = dt.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    };

    // inject data exactly like downloadSingleMemberPDF
    pageHtml = pageHtml
      .replace(/{{PHOTO}}/g, photoMarkup)
      .replace(/{{ID}}/g, v(m.member_id))
      .replace(/{{NAME}}/g, v(m.member_title + "  " + m.member_name))
      .replace(/{{FAMILY_ID}}/g, v(m.family_id))
      .replace(/{{HEAD}}/g, m.isHead === "Yes" ? m.member_name : v(m.head_name))
      .replace(/{{FATHER}}/g, v(m.father_name))
      .replace(/{{MOTHER}}/g, v(m.mother_name))
      .replace(/{{ADDR}}/g, v(m.present_address))
      .replace(/{{PERADDR}}/g, v(m.permanent_address))
      .replace(/{{OFFADDR}}/g, v(m.official_address))
      .replace(/{{CONTACT}}/g, v((m.contact_numbers || []).join(", ")))
      .replace(/{{EMAIL}}/g, v(m.email))
      .replace(/{{HOMECHURCH}}/g, v(m.home_church))
      .replace(/{{DOB}}/g, formatDate(m.dob))
      .replace(/{{POB}}/g, v(m.place_of_birth))
      .replace(/{{SEX}}/g, v(m.gender))
      .replace(/{{MARITAL}}/g, v(m.marital_status))
      .replace(/{{BLOOD}}/g, v(m.blood_group))
      .replace(/{{QUAL}}/g, v(m.qualification))
      .replace(/{{MEMFROM}}/g, v(m.membership_from))
      .replace(/{{STATUS}}/g, v(m.status))
      .replace(/{{OFFCONTACT}}/g, v(m.primary_contact_number))
      .replace(/{{PROFESSION}}/g, v(m.occupation))
      .replace(/{{CONFDATE}}/g, formatDate(m.confirmation_date))
      .replace(/{{CONFPLACE}}/g, v(m.confirmation_church))
      .replace(/{{BAPDATE}}/g, formatDate(m.baptism_date))
      .replace(/{{BAPPLACE}}/g, v(m.baptism_church))
      .replace(/{{MARDATE}}/g, formatDate(m.marriage_date))
      .replace(/{{MARPLACE}}/g, v(m.marriage_place))
      .replace(/{{primary_contact_number}}/g, v(m.primary_contact_number))
      .replace(/{{confirmation_by}}/g, v(m.confirmation_by))
      .replace(/{{baptism_by}}/g, v(m.baptism_by))
      .replace(/{{CATEGORY}}/g, v(m.member_type));

    return pageHtml;

  }).join(`
    <div style="page-break-after: always;"></div>
  `);

  html = pages;   // IMPORTANT: we no longer use memberDetailed.html
}


 

    /* ---------------- PUPPETEER ---------------- */
    // browser = await puppeteer.launch({
    //   headless: "new",
    //   args: ["--no-sandbox", "--disable-setuid-sandbox"],
    // });

    browser = await launchBrowser();


    const page = await browser.newPage();
    // await page.setContent(html, { waitUntil: "networkidle0" });
    // await page.setContent(html, { waitUntil: "load" });
    page.setDefaultTimeout(0);
    page.setDefaultNavigationTimeout(0);

    await page.setContent(html, { waitUntil: "networkidle0", timeout: 0 });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      timeout: 0,
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "15mm",
        right: "15mm",
      },
    });

    /* ---------------- SEND PDF ---------------- */
    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length,
      "Content-Disposition": `inline; filename=members-${type}.pdf`,
    });

    res.end(pdfBuffer);
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).send("PDF generation failed");
  } finally {
    if (browser) await browser.close();
  }
};


exports.downloadSingleMemberPDF = async (req, res) => {
  let browser;
  try {
    const m = await Member.findById(req.params.id).lean();
    if (!m) return res.status(404).send("Member not found");

    const v = (x) => (!x || x === "" ? "-" : x);

const formatDate = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};


    /* ----------------------------------------------------
       BUILD CORRECT PUBLIC PHOTO URL
       Files live in: uploads/memberPhotos/*
       Public path:   /member-photo-uploads/memberPhotos/*
    ---------------------------------------------------- */
    const SERVER = process.env.BACKEND_URL.replace("/api", "");
    const photoUrl = m.photo
      ? `${SERVER}/member-photo-uploads/memberPhotos/${path.basename(m.photo)}`
      : null;

    const photoMarkup = photoUrl
      ? `<img src="${photoUrl}" />`
      : "PHOTO";

    /* ----------------------------------------------------
       LOAD TEMPLATE
    ---------------------------------------------------- */
    let html = fs.readFileSync(
      path.join(__dirname, "../templates/memberCertificate.html"),
      "utf8"
    );

    html = html
      .replace(/{{PHOTO}}/g, photoMarkup)
      .replace(/{{ID}}/g, v(m.member_id))
      .replace(/{{NAME}}/g, v(m.member_title + " " + m.member_name))
      .replace(/{{MEMBER_TAMIL}}/g, v(m.member_tamil_name))
      .replace(/{{FAMILY_ID}}/g, v(m.family_id))
      .replace(/{{HEAD}}/g, m.isHead === "Yes" ? m.member_name : v(m.head_name))
      .replace(/{{FATHER}}/g, v(m.father_name))
      .replace(/{{MOTHER}}/g, v(m.mother_name))
      .replace(/{{RELATION}}/g, v(m.relation_with_head))
      .replace(/{{CATEGORY}}/g, v(m.member_type))
      .replace(/{{ADDR}}/g, v(m.present_address))
      .replace(/{{PERADDR}}/g, v(m.permanent_address))
      .replace(/{{OFFADDR}}/g, v(m.official_address))
      .replace(/{{CONTACT}}/g, v((m.contact_numbers || []).join(", ")))
      .replace(/{{EMAIL}}/g, v(m.email))
      .replace(/{{HOMECHURCH}}/g, v(m.home_church))
      .replace(/{{ZONE}}/g, v(m.zone))
      .replace(/{{AREA}}/g, v(m.area))
      .replace(/{{DOB}}/g, formatDate(m.dob))
      .replace(/{{POB}}/g, v(m.place_of_birth))
      .replace(/{{SEX}}/g, v(m.gender))
      .replace(/{{MARITAL}}/g, v(m.marital_status))
      .replace(/{{BLOOD}}/g, v(m.blood_group))
      .replace(/{{QUAL}}/g, v(m.qualification))
      .replace(/{{MEMFROM}}/g, v(m.membership_from))
      .replace(/{{STATUS}}/g, v(m.status))

      .replace(/{{FAMILY_ID}}/g, v(m.family_id))
      .replace(/{{OFFCONTACT}}/g, v(m.primary_contact_number))
      .replace(/{{POB}}/g, v(m.place_of_birth))
      .replace(/{{PROFESSION}}/g, v(m.occupation))
      .replace(/{{CONFDATE}}/g, formatDate(m.confirmation_date))
      .replace(/{{CONFPLACE}}/g, v(m.confirmation_church))
      .replace(/{{BAPDATE}}/g, formatDate(m.baptism_date))
      .replace(/{{BAPPLACE}}/g, v(m.baptism_church))
      .replace(/{{MARDATE}}/g, formatDate(m.marriage_date))
      .replace(/{{MARPLACE}}/g, v(m.marriage_place))


      .replace(/{{primary_contact_number}}/g, v(m.primary_contact_number))
      .replace(/{{confirmation_by}}/g, v(m.confirmation_by))
      .replace(/{{baptism_by}}/g, v(m.baptism_by));


    /* ----------------------------------------------------
       PUPPETEER PDF
    ---------------------------------------------------- */
    browser = await launchBrowser();

    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123 });

    await page.setContent(html, { waitUntil: "networkidle0", timeout: 0 });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${m.member_id}.pdf`);
    res.end(pdf);
  } catch (err) {
    console.error(err);
    res.status(500).send("PDF generation failed");
  } finally {
    if (browser) await browser.close();
  }
};


exports.getMembersByAgeRange = async (req, res) => {
  try {
    const { from, to } = req.query;

    const fromAge = from === "" ? null : Number(from);
    const toAge = to === "" ? null : Number(to);

    // -------- VALIDATION (same as frontend rules) --------
    if (fromAge === null && toAge === null) {
      return res.status(400).json({ message: "From age required" });
    }

    if (fromAge === null && toAge !== null) {
      return res.status(400).json({ message: "From age cannot be empty" });
    }

    if (fromAge !== null && toAge !== null && fromAge > toAge) {
      return res
        .status(400)
        .json({ message: "From age cannot be greater than To age" });
    }

    // Fetch all members who have DOB
    const members = await Member.find({
      dob: { $exists: true, $ne: "" }
    }).select("member_id member_name dob");

    const currentYear = new Date().getFullYear();

    const filtered = members
      .map((m) => {
        const birthYear = new Date(m.dob).getFullYear();
        const age = currentYear - birthYear;

        return {
          _id: m._id,
          member_id: m.member_id,
          member_name: m.member_name,
          age
        };
      })
      .filter((m) => {
        // SINGLE AGE CASE
        if (fromAge !== null && toAge === null) {
          return m.age === fromAge;
        }

        // BELOW / ABOVE / RANGE CASE
        return m.age >= fromAge && m.age <= toAge;
      });

    res.json({
      members: filtered,
      count: filtered.length
    });
  } catch (err) {
    console.error("Age view error:", err);
    res.status(500).json({ message: "Failed to fetch age range members" });
  }
};



exports.downloadAgeRangePDF = async (req, res) => {
  let browser;

  try {
    const { from, to, displayFrom, displayMode } = req.query;

    const fromAge = from === "" ? null : Number(from);
    const toAge = to === "" ? null : Number(to);

    // -------- SAME RULES AS LIST --------
    if (fromAge === null && toAge === null) {
      return res.status(400).json({ message: "From age required" });
    }

    if (fromAge === null && toAge !== null) {
      return res.status(400).json({ message: "From age cannot be empty" });
    }

    if (fromAge !== null && toAge !== null && fromAge > toAge) {
      return res
        .status(400)
        .json({ message: "From age cannot be greater than To age" });
    }

    // STEP 1 — get all members with DOB
    const members = await Member.find({
      dob: { $exists: true, $ne: "" }
    });

    const currentYear = new Date().getFullYear();

    // STEP 2 — calculate age SAME WAY AS LIST
    const filtered = members
      .map((m) => {
        const birthYear = new Date(m.dob).getFullYear();
        const age = currentYear - birthYear;

        return {
          _id: m._id,
          member_id: m.member_id,
          member_name: m.member_name,
          age,
          dob: m.dob
        };
      })
      .filter((m) => {
        // SINGLE AGE CASE
        if (fromAge !== null && toAge === null) {
          return m.age === fromAge;
        }

        // BELOW / ABOVE / RANGE CASE
        return m.age >= fromAge && m.age <= toAge;
      });

    // Load template
    const templatePath = path.join(
      __dirname,
      "../templates/memberAgeRange.html"
    );
    let html = fs.readFileSync(templatePath, "utf8");

    // Smart header text for PDF
// ✅ SMART HEADER TEXT (MATCHES UI EXACTLY)
let ageText;

if (displayMode === "below") {
  ageText = `Below ${displayFrom} years old`;
}
else if (displayMode === "above") {
  ageText = `Above ${displayFrom} years old`;
}
else if (to === from) {
  ageText = `Members aged ${displayFrom} years old`;
}
else {
  ageText = `Members between ${from} to ${to} years old`;
}


html = html.replace("{{AGE_TEXT}}", ageText);
html = html.replace("{{TOTAL_COUNT}}", filtered.length);


    html = html.replace("{{AGE_TEXT}}", ageText);
    html = html.replace("{{TOTAL_COUNT}}", filtered.length);

    // Build table rows
const rows = filtered
  .sort((a, b) => a.age - b.age)   // 👈 ensures proper order (0 → 50)
  .map(
    (m, index) => `
  <tr>
    <td>${index + 1}</td>
    <td>${m.member_id || "-"}</td>
    <td>${m.member_name || "-"}</td>
    <td>${m.age}</td>
  </tr>
`
  )
  .join("");
console.log("PDF FINAL AGES:", filtered.map(m => m.age));

    html = html.replace("<!--ROWS-->", rows);

    // Puppeteer PDF
    browser = await launchBrowser();

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true
    });

    // Smart filename
    const fileName =
      toAge === null
        ? `members-age-${fromAge}.pdf`
        : `members-age-${fromAge}-to-${toAge}.pdf`;

    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${fileName}`
    });

    res.end(pdfBuffer);
  } catch (err) {
    console.error("Age PDF error:", err);
    res.status(500).send("Age PDF generation failed");
  } finally {
    if (browser) await browser.close();
  }
};
