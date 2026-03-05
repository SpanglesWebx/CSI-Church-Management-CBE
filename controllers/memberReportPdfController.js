const { launchBrowser } = require("../util/puppeteer");
const path = require("path");
const fs = require("fs");
const Member = require("../Schema/memberSchema");
const Family = require("../Schema/familySchema")
/* Utility */
const v = val => (!val || val === "" ? "-" : val);

/* ========================================================= */
/* BIRTHDAY REPORT PDF                                       */
/* ========================================================= */
exports.downloadBirthdayReportPDF = async (req, res) => {
  let browser;
  try {
    const { status = "All", fromdate, todate } = req.query;

    const pipeline = [
      {
        $addFields: {
          safeDob: {
            $cond: [
              { $or: [{ $eq: ["$dob", ""] }, { $eq: ["$dob", null] }] },
              null,
              { $toDate: "$dob" }
            ]
          }
        }
      },
      {
        $addFields: {
          md: {
            $cond: [
              { $eq: ["$safeDob", null] },
              null,
              { $dateToString: { format: "%m-%d", date: "$safeDob" } }
            ]
          }
        }
      },
      { $match: { md: { $ne: null } } }
    ];

    if (fromdate && todate) {
      const f = fromdate.slice(5), t = todate.slice(5);
      pipeline.push(
        f <= t
          ? { $match: { md: { $gte: f, $lte: t } } }
          : { $match: { $or: [{ md: { $gte: f } }, { md: { $lte: t } }] } }
      );
    }

    if (status !== "All") pipeline.push({ $match: { status } });

    const members = await Member.aggregate(pipeline).sort({ md: 1 });

    const template = fs.readFileSync(path.join(__dirname, "../templates/birthdayReport.html"), "utf8");



const formatTitle = (title) => {
  if (!title) return "";

  const t = title.toLowerCase();

  if (t === "mister") return "Mr";
  if (t === "master") return "Master";
  if (t === "mistress") return "Mrs";
  if (t === "miss") return "Ms";

  return t.charAt(0).toUpperCase() + t.slice(1);
};




// -------- GROUP MEMBERS BY DATE ----------
const grouped = {};

members.forEach(m => {
  if (!m.safeDob) return;

  const date = new Date(m.safeDob);

  const day = date.getDate();
  const monthName = date.toLocaleString("en-US", { month: "long" });

  const key = `${day} - ${monthName}`;

  if (!grouped[key]) grouped[key] = [];
  grouped[key].push(m);
});

// -------- BUILD HTML ROWS ----------
let rows = "";
let sl = 1;

for (const [dateLabel, list] of Object.entries(grouped)) {

  // date heading row
  rows += `
    <tr>
      <td colspan="6" class="section">${dateLabel}</td>
    </tr>
  `;

for (const m of list) {

  const dob = new Date(m.safeDob);
  const age = new Date().getFullYear() - dob.getFullYear();

  // ---------- GET RELATION TEXT ----------
// default → uppercase member name
let displayName = `
  ${formatTitle(m.member_title) ? formatTitle(m.member_title) + " " : ""}
  ${m.member_name?.toUpperCase() || "-"}
`;


  if (m.isHead !== "Yes") {
    const family = await Family.findOne({ family_id: m.family_id }).lean();

    if (family?.head?.member_name) {

let relationShort = "";

if (m.relation_with_head === "Wife") relationShort = "W/O";
else if (m.relation_with_head === "Husband") relationShort = "H/O";
else if (m.relation_with_head === "Son") relationShort = "S/O";
else if (m.relation_with_head === "Daughter") relationShort = "D/O";

else if (m.relation_with_head === "Brother") relationShort = "B/O";
else if (m.relation_with_head === "Sister") relationShort = "Si/O";
else if (m.relation_with_head === "Father") relationShort = "F/O";
else if (m.relation_with_head === "Mother") relationShort = "M/O";

else if (m.relation_with_head === "Son-In-Law") relationShort = "SIL/O";
else if (m.relation_with_head === "Daughter-In-Law") relationShort = "DIL/O";

else if (m.relation_with_head === "Grandson") relationShort = "GS/O";
else if (m.relation_with_head === "Granddaughter") relationShort = "GD/O";

else relationShort = m.relation_with_head || "";


const formattedTitle = formatTitle(m.member_title);

// convert only names to uppercase
const memberNameCaps = m.member_name?.toUpperCase() || "-";
const headNameCaps = family.head.member_name?.toUpperCase() || "";

displayName = `
  ${formattedTitle ? formattedTitle + " " : ""}${memberNameCaps}<br>
  <span style="margin-left:20px;font-size:10px;">
    ${relationShort} ${headNameCaps}
  </span>
`;

    }
  }

  rows += `
    <tr>
      <td class="center">${sl++}</td>
      <td>${m.member_id || "-"}</td>
      <td>${displayName}</td>
      <td class="center">${dob.toLocaleDateString("en-GB")}</td>
      <td class="center">${m.primary_contact_number || "-"}</td>
      <td class="center">${age}</td>
    </tr>
  `;
}


}


// ----- FIND MONTH RANGE TITLE -----
let monthTitle = "-";

if (fromdate && todate) {
  const start = new Date(fromdate);
  const end = new Date(todate);

  const months = new Set();

  let current = new Date(start);

  while (current <= end) {
    months.add(
      current.toLocaleString("en-US", { month: "long" })
    );
    current.setMonth(current.getMonth() + 1);
  }

  monthTitle = Array.from(months).join(", ");
}

let html = template
  .replace("<!--ROWS-->", rows)
  .replace("{{MONTH_TITLE}}", monthTitle)
  .replace("{{FROM_DATE}}", fromdate ? new Date(fromdate).toLocaleDateString("en-GB") : "-")
  .replace("{{TO_DATE}}", todate ? new Date(todate).toLocaleDateString("en-GB") : "-");


    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,

      displayHeaderFooter: true,
      headerTemplate: `<div></div>`,

      footerTemplate: `
    <div style="width:100%; text-align:center; font-size:10px; color:#666; padding-bottom:5mm;">
      Page <span class="pageNumber"></span> of <span class="totalPages"></span> pages
    </div>
  `,

      margin: {
        top: "20mm",
        bottom: "25mm",
        left: "15mm",
        right: "15mm"
      }
    });


    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=birthday-report.pdf",
      "Content-Length": pdf.length
    });
    res.end(pdf);

  } catch (e) {
    console.error(e);
    res.status(500).send("PDF failed");
  } finally {
    if (browser) await browser.close();
  }
};

exports.downloadMarriageReportPDF = async (req, res) => {
  let browser;

  try {
    const { fromdate, todate } = req.query;

// ---------- FORMAT TITLE ----------
const formatTitle = (title) => {
  if (!title) return "";

  const t = title.toLowerCase();

  if (t === "mister") return "Mr";
  if (t === "mistress") return "Mrs";
  if (t === "miss") return "Ms";
  if (t === "master") return "Master";

  return t.charAt(0).toUpperCase() + t.slice(1);
};


    /* ---------------- GET MARRIAGE DATA ---------------- */
    const pipeline = [
      {
        $addFields: {
          safeMarriage: {
            $cond: [
              { $or: [{ $eq: ["$marriage_date", ""] }, { $eq: ["$marriage_date", null] }] },
              null,
              { $toDate: "$marriage_date" }
            ]
          }
        }
      },
      {
        $match: {
          safeMarriage: { $ne: null },
          marital_status: "Married"
        }
      }
    ];

    // filter by date range (month-day compare like birthday)
    if (fromdate && todate) {
      const f = fromdate.slice(5);
      const t = todate.slice(5);

      pipeline.push(
        f <= t
          ? {
              $match: {
                $expr: {
                  $and: [
                    { $gte: [{ $dateToString: { format: "%m-%d", date: "$safeMarriage" } }, f] },
                    { $lte: [{ $dateToString: { format: "%m-%d", date: "$safeMarriage" } }, t] }
                  ]
                }
              }
            }
          : {
              $match: {
                $expr: {
                  $or: [
                    { $gte: [{ $dateToString: { format: "%m-%d", date: "$safeMarriage" } }, f] },
                    { $lte: [{ $dateToString: { format: "%m-%d", date: "$safeMarriage" } }, t] }
                  ]
                }
              }
            }
      );
    }

    /* ---------- GET ONE MEMBER PER FAMILY ---------- */
    const families = await Member.aggregate([
      ...pipeline,
      { $group: { _id: "$family_id", doc: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$doc" } },
      { $sort: { safeMarriage: 1 } }
    ]);

    /* ---------------- GROUP BY DATE ---------------- */
/* ---------------- GROUP BY DATE (SORTED) ---------------- */

const grouped = {};

for (const h of families) {
  if (!h.safeMarriage) continue;

  const date = new Date(h.safeMarriage);

  // key for sorting (yyyy-mm-dd)
// key for sorting (MM-DD only → ignore year)
const sortKey = `${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;


  const day = date.getDate().toString().padStart(2, "0");
  const monthName = date.toLocaleString("en-US", { month: "long" });

  const label = `${day} - ${monthName}`;

  if (!grouped[sortKey]) {
    grouped[sortKey] = {
      label,
      list: []
    };
  }

  grouped[sortKey].list.push(h);
}


    /* ---------------- BUILD TABLE ROWS ---------------- */
    let rows = "";
    let sl = 1;
    

// sort dates ascending
const sortedDates = Object.keys(grouped).sort();

for (const dateKey of sortedDates) {
  const { label: dateLabel, list } = grouped[dateKey];


      // DATE SECTION HEADER
      rows += `
        <tr>
          <td colspan="6" class="section">${dateLabel}</td>
        </tr>
      `;

      for (const h of list) {

        const family = await Family.findOne({ family_id: h.family_id }).lean();
        if (!family) continue;

        const members = await Member.find({
          member_id: { $in: family.members.map(m => m.member_id) }
        }).lean();

        // show only ACTIVE members
        const activeMembers = members.filter(m => m.status === "Active");

        const husband =
          activeMembers.find(m => m.relation_with_head === "Husband") ||
          activeMembers.find(m => m.gender === "Male");

        const wife =
          activeMembers.find(m => m.relation_with_head === "Wife") ||
          activeMembers.find(m => m.gender === "Female");

        // if both dead/inactive skip row
        if (!husband && !wife) continue;

        const marriageDate = new Date(h.safeMarriage);

        // anniversary years
        const anniversary =
          new Date().getFullYear() - marriageDate.getFullYear();

        /* ---------- TOP DOWN ID WITH GAP ---------- */
        // const memberIds = `
        //   ${husband?.member_id || ""}
        //   ${wife ? `<div style="margin-top:4px">${wife.member_id}</div>` : ""}
        // `;

/* ---------- MEMBER ID LOGIC ---------- */

// check who is family head
const husbandIsHead = husband?.isHead === "Yes";
const wifeIsHead = wife?.isHead === "Yes";

let selectedMemberId = "-";

// priority 1 → whoever is family head
if (husbandIsHead) {
  selectedMemberId = husband.member_id;
}
else if (wifeIsHead) {
  selectedMemberId = wife.member_id;
}

// priority 2 → husband id
else if (husband) {
  selectedMemberId = husband.member_id;
}

// priority 3 → wife id (if husband inactive / not exist)
else if (wife) {
  selectedMemberId = wife.member_id;
}

const memberIds = selectedMemberId;



/* ---------- TOP DOWN NAME WITH TITLE + CAPITAL NAME ---------- */
const husbandTitle = formatTitle(husband?.member_title);
const wifeTitle = formatTitle(wife?.member_title);

// convert only NAME to uppercase
const husbandName = husband?.member_name?.toUpperCase() || "";
const wifeName = wife?.member_name?.toUpperCase() || "";

const memberNames = `
  ${husband ? `${husbandTitle ? husbandTitle + " " : ""}${husbandName}` : ""}
  ${wife ? `<div style="margin-top:4px">${wifeTitle ? wifeTitle + " " : ""}${wifeName}</div>` : ""}
`;



        // phone priority husband → wife
        const phone =
          husband?.primary_contact_number ||
          wife?.primary_contact_number ||
          "-";

        rows += `
          <tr>
            <td class="center">${sl++}</td>
            <td class="center">${memberIds}</td>
            <td>${memberNames}</td>
            <td class="center">${marriageDate.toLocaleDateString("en-GB")}</td>
            <td class="center">${phone}</td>
            <td class="center">${anniversary}</td>
          </tr>
        `;
      }
    }

    /* ---------------- MONTH TITLE ---------------- */
    let monthTitle = "-";

    if (fromdate && todate) {
      const start = new Date(fromdate);
      const end = new Date(todate);

      const months = new Set();
      let current = new Date(start);

      while (current <= end) {
        months.add(current.toLocaleString("en-US", { month: "long" }));
        current.setMonth(current.getMonth() + 1);
      }

      monthTitle = Array.from(months).join(" & ");
    }

    /* ---------------- HTML TEMPLATE ---------------- */
    const html = `
<!DOCTYPE html>
<html lang="ta">
<head>
<meta charset="UTF-8"/>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil&display=swap" rel="stylesheet">
<style>
@page{size:A4;margin:10mm 14mm;}
body{font-family:"Noto Sans Tamil",sans-serif;font-size:11px;}
.header{text-align:center;margin-top:10px;}
.hr{border-top:1px solid #000;margin:10px 0;}
table{width:100%;border-collapse:collapse;}
thead tr{border-bottom:1px solid #000;}
td,th{padding:6px 4px;}
.center{text-align:center;}
.section{font-weight:bold;padding-top:10px;}
.title-left {
  text-align: left;
}
</style>
</head>

<body>
<div class="header">
<h3>CSI CHRIST CHURCH </h3>
<div style="text-align:left;">LIST OF WEDDING DAYS DURING ${monthTitle}</div>
</div>

<div class="hr"></div>

<table>
<thead>
<tr>
<th>SI.No</th>
<th>Member ID</th>
<th>Member Name</th>
<th>Marriage Date</th>
<th>Phone / Mobile No</th>
<th>Anniversary</th>
</tr>
</thead>

<tbody>
${rows}
</tbody>
</table>
</body>
</html>
`;

    /* ---------------- GENERATE PDF ---------------- */
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true
    });

    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=marriage-report.pdf",
      "Content-Length": pdf.length
    });

    res.end(pdf);

  } catch (e) {
    console.error(e);
    res.status(500).send("Marriage PDF failed");
  } finally {
    if (browser) await browser.close();
  }
};

