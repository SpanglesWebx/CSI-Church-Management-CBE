const { launchBrowser } = require("../util/puppeteer");
const path = require("path");
const fs = require("fs");
const AsanamCollection = require("../Schema/AsanamCollectionDonation");

const AsanamTiffin = require("../Schema/AsanamTiffinCarrierIncome");
const AsanamUniform = require("../Schema/AsanamUniformSale");





exports.getAsanamReport = async (req, res) => {

try {

const year = Number(req.params.year);

const { search = "", startDate, endDate } = req.query;



let matchStage = {

date:{
$gte:new Date(startDate || `${year}-01-01`),
$lte:new Date(endDate || `${year}-12-31`)
}

};

if(search && search.trim()!==""){

matchStage.$or=[

{ member_name:{ $regex:search,$options:"i" }},

{ member_id:{ $regex:search,$options:"i" }},

{ zone_name:{ $regex:search,$options:"i" }}

];

}

//////////////////////////////////////////////////
// AGGREGATE
//////////////////////////////////////////////////

const data = await AsanamCollection.aggregate([

{
$match:matchStage
},

{
$group:{

_id:"$member_id",

member_id:{ $first:"$member_id" },

member_name:{ $first:"$member_name" },

zone_name:{ $first:"$zone_name" },

goat_total:{ $sum:"$goat_total" },

rice_total:{ $sum:"$rice_total" },

asanam_amount:{ $sum:"$asanam_amount" }

}

},

{
$sort:{ member_id:1 }
}

]);

res.json({

success:true,

data

});

}
catch(err){

console.log("Asanam Report Error:",err);

res.status(500).json({

success:false

});

}

};



exports.downloadAsanamReportPDF = async (req, res) => {

    let browser;

    try {

    const { year, sortType = "" } = req.query;

    const startDate = new Date(`${year}-01-01`);
    const endDate   = new Date(`${year}-12-31`);
    const { search = "" } = req.query;


    //////////////////////////////////////////////////
    // GET DATA
    //////////////////////////////////////////////////

    let data = await AsanamCollection.aggregate([
        {
            $match: {
                date: {
                $gte: startDate,
                $lte: endDate
                },
                ...(search && {
                $or:[
                { member_name: { $regex: search, $options:"i" }},
                { member_id: { $regex: search, $options:"i" }},
                { zone_name: { $regex: search, $options:"i" }}
                ]
                })
            }
        },
        {
            $group: {
            _id: "$member_id",
            member_id: { $first: "$member_id" },
            member_name: { $first: "$member_name" },
            member_tamil_name: { $first: "$member_tamil_name" },
            member_tamil_title: { $first: "$member_tamil_title" },
            zone_name: { $first: "$zone_name" },
            goat_total: { $sum: "$goat_total" },
            rice_total: { $sum: "$rice_total" },
            asanam_amount: { $sum: "$asanam_amount" },
            goat_count: {
                $sum: {
                $cond: [
                    { $eq: ["$goat_count", ""] },
                    0,
                    { $toDouble: "$goat_count" }
                ]
                }
            },
            rice_count: {
                $sum: {
                $cond: [
                    { $eq: ["$rice_count", ""] },
                    0,
                    { $toDouble: "$rice_count" }
                ]
                }
            }
            }
        }
    ]);


    //////////////////////////////////////////////////
    // SORTING (SAME AS FRONTEND)
    //////////////////////////////////////////////////

    if (sortType === "id") {
        data.sort((a, b) =>
            a.member_id.localeCompare(b.member_id)
        );
    }


    if (sortType === "name") {
        data.sort((a, b) =>
            a.member_name.localeCompare(b.member_name)
        );
    }


    if (sortType === "zone (By ID)") {
        data.sort((a, b) => {
            if (a.zone_name === b.zone_name) {
            return a.member_id.localeCompare(b.member_id);
            }
            return a.zone_name.localeCompare(b.zone_name);
        });
    }


    if (sortType === "zone (By Name)") {
        data.sort((a, b) => {
            if (a.zone_name === b.zone_name) {
            return a.member_name.localeCompare(b.member_name);
            }
            return a.zone_name.localeCompare(b.zone_name);
        });
    }



    //////////////////////////////////////////////////
    // LOAD TEMPLATE
    //////////////////////////////////////////////////

    const template = fs.readFileSync(
        path.join(__dirname, "../templates/asanamReport.html"),
        "utf8"
    );



    //////////////////////////////////////////////////
    // TAMIL TITLE FORMAT
    //////////////////////////////////////////////////

    const formatTamilTitle = (title) => {
        if (!title) return "";
        const t = title.trim();
        if (t === "மிஸ்டர்") return "திரு";
        if (t === "மிஸ்") return "செல்வி";
        if (t === "மிசஸ்") return "திருமதி";
        if (t === "மாஸ்டர்") return "செல்வன்";
        return t;
    };



    //////////////////////////////////////////////////
    // BUILD ROWS
    //////////////////////////////////////////////////

    let rows = "";

    let currentZone = "";


    data.forEach((m) => {

        const title = formatTamilTitle(
            m.member_tamil_title
        );

      // Tamil fallback → English
        const finalName =
            m.member_tamil_name &&
            m.member_tamil_name.trim() !== ""
            ? m.member_tamil_name
            : m.member_name || "";

        const name =
            title
            ? `${title}. ${finalName}`
            : `${finalName}`;

        if (
            (
            sortType === "zone (By ID)" ||
            sortType === "zone (By Name)"
            ) &&
            currentZone !== m.zone_name
        ) {

        currentZone = m.zone_name;

        rows += `
            <tr>
                <td colspan="5"
                style="
                font-size:14px;
                font-weight:bold;
                padding-top:10px;
                ">
                ${currentZone}
                </td>
            </tr>
        `;

        }



        rows += `
            <tr>
            <td>${name}</td>
            <td>${m.zone_name || "-"}</td>
            <td class="center">${m.asanam_amount || 0}</td>
            <td class="center">${m.rice_count || 0}</td>
            <td class="center">${m.goat_count || 0}</td>
            </tr>
        `;

    });



    let html = template
        .replaceAll("{{YEAR}}",year)
        .replace("<!--ROWS-->", rows);

    browser = await launchBrowser();


    const page = await browser.newPage();


    await page.setContent(html, {
        waitUntil: "load"
    });



    const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: `<div></div>`,
        footerTemplate: `
            <div style="
            width:100%;
            text-align:center;
            font-size:10px;
            padding-bottom:5mm;
            ">
            (<span class="pageNumber"></span> -
            <span class="totalPages"></span>)
            </div>
        `,
        margin: {
            top: "15mm",
            bottom: "20mm",
            left: "10mm",
            right: "10mm"
        }
    });

    res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition":
            "inline; filename=asanam-report.pdf",
        "Content-Length": pdf.length
    });


    res.end(pdf);


    }
    catch (e) {
        console.log(e);
        res.status(500).send("PDF Failed");
    }
    finally {
        if (browser) {
        await browser.close();
        }
    }

};












exports.getAsanamTotalSummary = async(req,res)=>{

try{

const {year} = req.params;

const startDate = new Date(`${year}-01-01`);
const endDate = new Date(`${year}-12-31`);

//////////////////////////////////////////////////
// COLLECTION TOTAL
//////////////////////////////////////////////////

const collection = await AsanamCollection.aggregate([

{
$match:{
date:{
$gte:startDate,
$lte:endDate
}
}
},

{
$group:{

_id:null,

riceCount:{
$sum:{
$cond:[
{$eq:["$rice_count",""]},
0,
{$toDouble:"$rice_count"}
]
}
},

ricePrice:{
$first:"$rice_price"
},

goatCount:{
$sum:{
$cond:[
{$eq:["$goat_count",""]},
0,
{$toDouble:"$goat_count"}
]
}
},

goatPrice:{
$first:"$goat_price"
},

cashTotal:{
$sum:"$asanam_amount"
}

}

}

]);

//////////////////////////////////////////////////
// TIFFIN BOX
//////////////////////////////////////////////////

const tiffin = await AsanamTiffin.aggregate([

{
$match:{year:Number(year)}
},

{
$group:{
_id:null,

qty:{
$sum:"$num_carriers"
},

price:{
$first:"$price_per_carrier"
},

amount:{
$sum:"$amount"
}

}

}

]);

//////////////////////////////////////////////////
// UNIFORM
//////////////////////////////////////////////////

const uniform = await AsanamUniform.aggregate([

{
$match:{
date:{
$gte:startDate,
$lte:endDate
}
}
},

{
$unwind:"$items"
},

{
$group:{

_id:null,

qty:{
$sum:"$items.qty"
},

rate:{
$first:"$items.rate"
},

amount:{
$sum:"$items.total"
}

}

}

]);

//////////////////////////////////////////////////
// BUILD RESPONSE
//////////////////////////////////////////////////

const riceTotal = collection[0]?.riceCount || 0;
const ricePrice = collection[0]?.ricePrice || 0;

const goatTotal = collection[0]?.goatCount || 0;
const goatPrice = collection[0]?.goatPrice || 0;

const cashTotal = collection[0]?.cashTotal || 0;

const tiffinQty = tiffin[0]?.qty || 0;
const tiffinPrice = tiffin[0]?.price || 0;
const tiffinAmount = tiffin[0]?.amount || 0;

const uniformQty = uniform[0]?.qty || 0;
const uniformRate = uniform[0]?.rate || 0;
const uniformAmount = uniform[0]?.amount || 0;

const grandTotal =
(riceTotal*ricePrice)+
(goatTotal*goatPrice)+
cashTotal+
tiffinAmount+
uniformAmount;


res.json({

year,

riceTotal,
ricePrice,

goatTotal,
goatPrice,

cashTotal,

tiffinQty,
tiffinPrice,
tiffinAmount,

uniformQty,
uniformRate,
uniformAmount,

grandTotal

});

}

catch(e){

console.log(e);

res.status(500).json({
success:false
});

}

};



exports.downloadAsanamTotalPDF = async(req,res)=>{

let browser;

try{

const {year} = req.query;

const startDate = new Date(`${year}-01-01`);
const endDate = new Date(`${year}-12-31`);

//////////////////////////////////////////////////
// COLLECTION
//////////////////////////////////////////////////

const collection = await AsanamCollection.aggregate([

{
$match:{
date:{
$gte:startDate,
$lte:endDate
}
}
},

{
$group:{

_id:null,

riceCount:{
$sum:{
$cond:[
{$eq:["$rice_count",""]},
0,
{$toDouble:"$rice_count"}
]
}
},

ricePrice:{ $first:"$rice_price" },

goatCount:{
$sum:{
$cond:[
{$eq:["$goat_count",""]},
0,
{$toDouble:"$goat_count"}
]
}
},

goatPrice:{ $first:"$goat_price" },

cashTotal:{
$sum:"$asanam_amount"
}

}

}

]);


//////////////////////////////////////////////////
// TIFFIN
//////////////////////////////////////////////////

const tiffin = await AsanamTiffin.aggregate([

{$match:{year:Number(year)}},

{
$group:{
_id:null,
qty:{$sum:"$num_carriers"},
price:{$first:"$price_per_carrier"},
amount:{$sum:"$amount"}
}
}

]);


//////////////////////////////////////////////////
// UNIFORM
//////////////////////////////////////////////////

const uniform = await AsanamUniform.aggregate([

{
$match:{
date:{
$gte:startDate,
$lte:endDate
}
}
},

{$unwind:"$items"},

{
$group:{
_id:null,
qty:{$sum:"$items.qty"},
rate:{$first:"$items.rate"},
amount:{$sum:"$items.total"}
}
}

]);


//////////////////////////////////////////////////
// VALUES
//////////////////////////////////////////////////

const riceTotal = collection[0]?.riceCount || 0;
const ricePrice = collection[0]?.ricePrice || 0;

const goatTotal = collection[0]?.goatCount || 0;
const goatPrice = collection[0]?.goatPrice || 0;

const cashTotal = collection[0]?.cashTotal || 0;

const tiffinQty = tiffin[0]?.qty || 0;
const tiffinPrice = tiffin[0]?.price || 0;
const tiffinAmount = tiffin[0]?.amount || 0;

const uniformQty = uniform[0]?.qty || 0;
const uniformRate = uniform[0]?.rate || 0;
const uniformAmount = uniform[0]?.amount || 0;

const grandTotal =
(riceTotal*ricePrice)+
(goatTotal*goatPrice)+
cashTotal+
tiffinAmount+
uniformAmount;


//////////////////////////////////////////////////
// TEMPLATE
//////////////////////////////////////////////////

const template = fs.readFileSync(

path.join(__dirname,"../templates/asanamTotal.html"),

"utf8"

);


let rows = `

<tr>
<td>CASH - RICE ${riceTotal} X ${ricePrice}</td>
<td class="center">${riceTotal*ricePrice}</td>
</tr>

<tr>
<td>CASH - GOAT ${goatTotal} X ${goatPrice}</td>
<td class="center">${goatTotal*goatPrice}</td>
</tr>

<tr>
<td>CASH</td>
<td class="center">${cashTotal}</td>
</tr>

<tr>
<td>TIFFIN BOX COLLECTION ${tiffinQty} X ${tiffinPrice}</td>
<td class="center">${tiffinAmount}</td>
</tr>

<tr>
<td>UNIFORM ${uniformQty} X ${uniformRate}</td>
<td class="center">${uniformAmount}</td>
</tr>

<tr style="font-weight:bold">
<td>TOTAL INCOME</td>
<td class="center">${grandTotal}</td>
</tr>

`;

let html = template

.replaceAll("{{YEAR}}",year)

.replace("<!--ROWS-->",rows);


browser = await launchBrowser();


const page = await browser.newPage();

await page.setContent(html,{
waitUntil:"load"
});


const pdf = await page.pdf({
format:"A4",
printBackground:true
});


res.writeHead(200,{
"Content-Type":"application/pdf",
"Content-Disposition":
`inline; filename=asanam-total-${year}.pdf`,
"Content-Length":pdf.length
});

res.end(pdf);


}
catch(e){

console.log(e);

res.status(500).send("PDF Failed");

}
finally{

if(browser) await browser.close();

}

};