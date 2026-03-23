import React, { useEffect } from "react";
import moment from "moment";

import signSecretary from "../../Pages/Voucher/signatures/secretary.png";
import signTreasurer from "../../Pages/Voucher/signatures/treasurer.png";
import signChairman from "../../Pages/Voucher/signatures/chairman.png";

const MarriageIndividualModal = ({
  isOpen,
  onClose,
  data,
  fromSI,
  toSI
}) => {

useEffect(() => {
  if (!isOpen || !data?.length) return;

  const start = Number(fromSI) - 1;
  const end = Number(toSI);

  const members = data.slice(start, end);

  printMembers(members);
  onClose();

}, [isOpen]);


const formatTitle = (title) => {
  if (!title) return "";
  const t = title.toLowerCase();

  if (t === "mister") return "Mr";
  if (t === "master") return "Master";
  if (t === "mistress") return "Mrs";
  if (t === "miss") return "Ms";

  return t.charAt(0).toUpperCase() + t.slice(1);
};

const printMembers = (members) => {

  const printWindow = window.open("", "", "width=900,height=1000");

  let pagesHTML = "";

  members.forEach(member => {

    const marriageDate = moment(member.marriage_date);
    const dateStr = marriageDate.format("DD/MM/YYYY");

    const years = moment().diff(marriageDate,"years");

const husbandName = member.husband_name || "";
const wifeName = member.wife_name || "";

const husbandTitle = formatTitle(member.husband_title || "mister"); 
const wifeTitle = formatTitle(member.wife_title || "mistress");

// CASE 1 → both present OR husband present
let fullName = "";

if (husbandName) {
  fullName = `${husbandTitle} & ${wifeTitle} ${husbandName}`;
}

// CASE 2 → only wife present
else if (wifeName) {
  fullName = `${wifeTitle} & ${husbandTitle} ${wifeName}`;
}

fullName = fullName.toUpperCase();

const secretarySign = signSecretary;
const treasurerSign = signTreasurer;
const chairmanSign = signChairman;

    pagesHTML += `
      <div class="page">

        <div class="name-box">${fullName}</div>

        <div class="marriage-box">
          <div class="age-text">${years}-வது திருமணநாள்</div>
          <div class="date-text">${dateStr}</div>
        </div>

        <div class="signatures">
<div class="sign secretary">
  <img src="${secretarySign}" />
</div>

<div class="sign treasurer">
  <img src="${treasurerSign}" />
</div>

<div class="sign chairman">
  <img src="${chairmanSign}" />
</div>
        </div>

      </div>
    `;
  });

  printWindow.document.write(`
  <html>
  <head>
  <style>

  @page{size:18cm 25.5cm;margin:0}
  body{margin:0;font-family:Arial}

  .page{
    width:18cm;
    height:25.5cm;
    position:relative;
    page-break-after:always;
  }

  .name-box{
    position:absolute;
    left:1.5cm;
    width:15.2cm;
    top:13.2cm;
    height:1.5cm;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:18px;
    font-weight:bold;
    background:white;
  }

  .marriage-box{
    position:absolute;
    left:1.4cm;
    width:15.2cm;
    top:15.5cm;
    height:1.5cm;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    background:white;
  }

.signatures{
  position:absolute;
  bottom:0;
  left:0;
  width:100%;
  height:4cm;
}


.sign{
  position:absolute;
}

.secretary{
  left:0.4cm;
  bottom:0.75cm;
}

.treasurer{
  left:7.8cm;
  bottom:0.65cm;
}

.chairman{
  right:2.2cm;
  bottom:0.5cm;
}


.sign img{
  object-fit:contain;
}

/* Individual sizes */
.secretary img{
  height:1.6cm;
}

.treasurer img{
  height:1.8cm;
}

.chairman img{
  height:1.8cm;
}

  </style>
  </head>
  <body>${pagesHTML}</body>
  </html>
  `);

printWindow.document.close();

printWindow.onload = () => {
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 200);
};
};

return null;
};

export default MarriageIndividualModal;
