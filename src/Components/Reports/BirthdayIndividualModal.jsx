import React, { useEffect } from "react";
import axios from "axios";
import moment from "moment";

import signSecretary from "../../Pages/Voucher/signatures/secretary.png";
import signTreasurer from "../../Pages/Voucher/signatures/treasurer.png";
import signChairman from "../../Pages/Voucher/signatures/chairman.png";


const URL = import.meta.env.VITE_BACKEND_API_URL;

const BirthdayIndividualModal = ({
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


//   const fetchAndPrint = async () => {
//     try {
//       // fetch all filtered by date
//       const res = await axios.get(`${URL}/reports/birthday`, {
//         params: {
//           fromdate,
//           todate,
//           page: 1,
//           limit: 10000
//         }
//       });

//       let members = res.data.Birthday || [];

//       // apply SI range filter
//       const start = Number(fromSI) - 1;
//       const end = Number(toSI);

//       members = members.slice(start, end);

//       printMembers(members);

//       onClose();

//     } catch (err) {
//       console.error(err);
//     }
//   };

const printMembers = (data) => {
  const printWindow = window.open("", "", "width=900,height=1000");

  let pagesHTML = "";

  data.forEach(member => {

    const dob = member.dob ? moment(member.dob) : null;
    const dobStr = dob ? dob.format("DD/MM/YYYY") : "-";

    // calculate age
    const age = dob ? moment().diff(dob, "years") : "-";

    // format title
    const formatTitle = (title) => {
      if (!title) return "";
      const t = title.toLowerCase();
      if (t === "mister" || t === "master") return "Mr";
      if (t === "mistress") return "Mrs";
      if (t === "miss") return "Ms";
      return t.charAt(0).toUpperCase() + t.slice(1);
    };

    const fullName = `${formatTitle(member.member_title)} ${member.member_name || ""}`.toUpperCase();
const secretarySign = signSecretary;
const treasurerSign = signTreasurer;
const chairmanSign = signChairman;
pagesHTML += `
  <div class="page">

    <!-- NAME BOX -->
    <div class="name-box">
      ${fullName}
    </div>

    <!-- BIRTHDAY BOX -->
    <div class="birthday-box">
      <div class="age-text">${age}வது பிறந்தநாள்</div>
      <div class="date-text">${dobStr}</div>
    </div>

    <!-- SIGNATURES -->
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

  @page{
    size:18cm 25.5cm;
    margin:0;
  }

  body{
    margin:0;
    font-family:Arial;
    visibility:hidden;
  }

  .page{
    width:18cm;
    height:25.5cm;
    position:relative;
    page-break-after:always;
  }

  /* ---------- NAME BOX ---------- */
.name-box{
  position:absolute;
  left:3.5cm;          /* ← START TEXT AFTER 4cm FROM LEFT */
  width:10cm;        /* ← reduce width (18cm page - 4cm start - ~4cm right space) */
  top:13.5cm;
  height:1.5cm;
  background:white;
  display:flex;
  align-items:center;
  font-size:18px;
  font-weight:bold;
}

  /* ---------- BIRTHDAY BOX ---------- */
  .birthday-box{
    position:absolute;
    left:1.4cm;
    width:15.2cm;
    top:15.5cm;
    height:1.5cm;
    background:white;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
  }

  .age-text{
    font-size:16px;
    font-weight:bold;
  }

  .date-text{
    font-size:14px;
  }

body.print-ready{
  visibility:visible;
}


/* ---------- SIGNATURE AREA ---------- */

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
  left:0.8cm;
  bottom:0.4cm;
}

.treasurer{
  left:8cm;
  bottom:0.3cm;
}

.chairman{
  right:1.5cm;
  bottom:0.2cm;
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
  <body class="print-ready">${pagesHTML}</body>
  </html>
  `);

printWindow.document.close();

// wait for content load → print → close
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

export default BirthdayIndividualModal;
