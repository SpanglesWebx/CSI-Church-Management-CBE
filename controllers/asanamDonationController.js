const { launchBrowser } = require("../util/puppeteer");
const fs = require("fs");
const path = require("path");

const AsanamDonation = require("../Schema/AsanamDonationSchema");

exports.getAsanamDonations = async (req, res) => {
  try {
    const { search = "", sort = "", startDate, endDate } = req.query;

    let query = {};

    //////////////////////////////////////////////////
    // DATE FILTER
    //////////////////////////////////////////////////

    if (startDate || endDate) {
      query.date = {
        ...(startDate && { $gte: new Date(startDate) }),

        ...(endDate && { $lte: new Date(endDate) }),
      };
    }

    if (search && search.trim() !== "") {
      query.$or = [
        { name: { $regex: search, $options: "i" } },

        { place: { $regex: search, $options: "i" } },

        { item: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption = {};

    if (sort === "name") sortOption = { name: 1 };

    if (sort === "place") sortOption = { place: 1 };

    if (sort === "item") sortOption = { item: 1 };

    const data = await AsanamDonation.find(query).sort(sortOption);

    res.json(data);
  } catch (err) {
    console.log("Asanam Donation Error:", err);

    res.status(500).json({
      success: false,
    });
  }
};

exports.addAsanamDonation = async (req, res) => {
  try {
    const {
      member_id,
      name,
      tamil_name,
      place_tamil,
      place,
      item,
      quantity,
      unit,
      unit_tamil,
    } = req.body;

    const newDonation = new AsanamDonation({
      member_id,
      name,
      tamil_name,
      place_tamil,
      place,
      item,
      quantity,
      unit,
      unit_tamil,
    });

    await newDonation.save();

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
    });
  }
};

exports.downloadAsanamDonationPDF = async (req, res) => {
  let browser;

  try {
    const { search = "", sort = "", startDate, endDate } = req.query;

    //////////////////////////////////////////////////
    // QUERY
    //////////////////////////////////////////////////

    let query = {};

    if (startDate || endDate) {
      query.date = {
        ...(startDate && { $gte: new Date(startDate) }),
        ...(endDate && { $lte: new Date(endDate) }),
      };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { place: { $regex: search, $options: "i" } },
        { item: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption = {};

    if (sort === "name") sortOption = { name: 1 };
    if (sort === "place") sortOption = { place: 1 };
    if (sort === "item") sortOption = { item: 1 };

    //////////////////////////////////////////////////
    // GET DATA
    //////////////////////////////////////////////////

    const data = await AsanamDonation.find(query).sort(sortOption);

    //////////////////////////////////////////////////
    // LOAD TEMPLATE
    //////////////////////////////////////////////////

    const template = fs.readFileSync(
      path.join(__dirname, "../templates/asanamDonation.html"),

      "utf8",
    );

    //////////////////////////////////////////////////
    // BUILD ROWS
    //////////////////////////////////////////////////

    let rows = "";

    data.forEach((d) => {
      rows += `

<tr>

<td>${d.tamil_name || d.name}</td>

<td>${d.place_tamil || d.place}</td>

<td>${d.item}</td>

<td class="center">

${d.quantity || 0} ${d.unit_tamil || ""}

</td>

</tr>

`;
    });

    //////////////////////////////////////////////////
    // HTML
    //////////////////////////////////////////////////

    let html = template.replace("<!--ROWS-->", rows);

    browser = await launchBrowser();

    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "load" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=asanam-donation.pdf",
      "Content-Length": pdf.length,
    });

    res.end(pdf);
  } catch (err) {
    console.log(err);

    res.status(500).send("PDF Failed");
  } finally {
    if (browser) await browser.close();
  }
};
