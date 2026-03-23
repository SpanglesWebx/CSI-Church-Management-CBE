import React, { useEffect } from "react";

import signSecretary from "./signatures/secretary.png";
import signTreasurer from "./signatures/treasurer.png";
import signChairman from "./signatures/chairman.png";

const VoucherPrintModal = ({ isOpen, onClose, voucherData }) => {

useEffect(() => {
  if (!isOpen) return;
  printVoucher();
  onClose();
}, [isOpen]);

const chairmanURL = new URL(signChairman, window.location.origin).href;
const secretaryURL = new URL(signSecretary, window.location.origin).href;
const treasurerURL = new URL(signTreasurer, window.location.origin).href;

const printVoucher = () => {

  const printWindow = window.open("", "", "width=900,height=1000");

  const html = `
  <div class="page">

    <!-- Voucher No -->
    <div class="voucher-no">
      ${voucherData?.voucherNo || ""}
    </div>

    <!-- Date -->
<div class="dd1">${voucherData?.dd?.[0] || ""}</div>
<div class="dd2">${voucherData?.dd?.[1] || ""}</div>

<div class="mm1">${voucherData?.mm?.[0] || ""}</div>
<div class="mm2">${voucherData?.mm?.[1] || ""}</div>

<div class="yy1">${voucherData?.yyyy?.[0] || ""}</div>
<div class="yy2">${voucherData?.yyyy?.[1] || ""}</div>
<div class="yy3">${voucherData?.yyyy?.[2] || ""}</div>
<div class="yy4">${voucherData?.yyyy?.[3] || ""}</div>

    <!-- Coimbatore Sum -->
    <div class="coimbatore">
      ${voucherData?.coimbatore || ""}/- ONLY
    </div>

    <!-- Rupees -->
    <div class="rupees">
      ${voucherData?.rupees || ""}
    </div>

    <!-- Cash/Cheque/Draft -->
<div class="towards">
  <div class="towards-first">
    ${voucherData?.towards?.split(" ").slice(0, 4).join(" ") || ""}
  </div>

  <div class="towards-rest">
    ${voucherData?.towards?.split(" ").slice(4).join(" ") || ""}
  </div>
</div>

    <!-- Cheque No -->
<div class="cheque-no">
  <div>
    ${voucherData?.chequeNo || ""} 
    ${voucherData?.chequeDate ? ` | Dt: ${voucherData.chequeDate}` : ""}
    ${voucherData?.inFavourOf ? ` | in Favour of ${voucherData.inFavourOf}` : ""}
  </div>

  <div>
    ${voucherData?.bank ? `Bank A/C: ${voucherData.bank}` : ""}
  </div>
</div>

    <!-- Bottom Signatures -->
<img class="chairman" src="${chairmanURL}" />
<img class="secretary" src="${secretaryURL}" />
<img class="treasurer" src="${treasurerURL}" />

  </div>
  `;

  printWindow.document.write(`
  <html>
  <head>
  <style>

  /* PAGE SIZE */
  @page{
    size:18.2cm 25cm;
    margin:0;
  }

  body{
    margin:0;
    font-family:Arial;
  }

.page{
  width:18.2cm;
  height:25cm;
  position:relative;
  padding:1.1cm;
  box-sizing:border-box;
}

  /* ---------- VOUCHER NO ---------- */
  .voucher-no{
    position:absolute;
    top:6.44cm;
    left:4.47cm;
    width:8.7cm;
    font-size:14px;
  }

  
  /* ---------- DATE ---------- */
.dd1{ position:absolute; top:6.45cm; left:11.1cm; width:0.5cm; text-align:center;}
.dd2{ position:absolute; top:6.45cm; left:11.7cm; width:0.5cm; text-align:center;}

.mm1{ position:absolute; top:6.45cm; left:12.35cm; width:0.5cm; text-align:center;}
.mm2{ position:absolute; top:6.45cm; left:13cm; width:0.5cm; text-align:center;}

.yy1{ position:absolute; top:6.45cm; left:13.65cm; width:0.5cm; text-align:center;}
.yy2{ position:absolute; top:6.45cm; left:14.25cm; width:0.5cm; text-align:center;}
.yy3{ position:absolute; top:6.45cm; left:14.8cm; width:0.5cm; text-align:center;}
.yy4{ position:absolute; top:6.45cm; left:15.38cm; width:0.5cm; text-align:center;}

  /* ---------- COIMBATORE ---------- */


  .coimbatore{
  position:absolute;
  top:9.32cm;
  left:6.5cm;
  width:7cm;
}

  /* ---------- RUPEES ---------- */
.rupees{
  position:absolute;
  top:10.38cm;
  left:3.9cm;
  width:12.3cm;
  line-height:1.4;
  word-wrap:break-word;
}

  /* ---------- TOWARDS ---------- */
.towards{
  position:absolute;
  top:12.57cm;
  width:100%;
  line-height:1.4;
}

/* FIRST LINE */
.towards-first{
  position:absolute;
  left:7.7cm;
  width:7cm;
  word-wrap:break-word;
}

/* NEXT LINES */
.towards-rest{
  position:absolute;
  top:1.15cm;   /* adjust spacing */
  left:1cm;
  width:14cm;
  word-wrap:break-word;
}

  /* ---------- CHEQUE ---------- */
.cheque-no{
  position:absolute;
  top:17.7cm;
  left:4.1cm;
  width:10cm;
  font-size:14px;
  line-height:1.4;
}

.cheque-no div{
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


  /* ---------- BOTTOM SIGN ---------- */
.chairman{
  position:absolute;
  top:19.87cm;
  left:1.1cm;
  width:4cm;
  height:2.6cm;
}

.secretary{
  position:absolute;
  top:19.25cm;
  left:6.8cm;
  width:4cm;
  height:2.6cm;
}

.treasurer{
  position:absolute;
  top:19.34cm;
  left:13cm;
  width:4cm;
  height:2.6cm;
}

*{
  -webkit-print-color-adjust:exact;
  print-color-adjust:exact;
}

  </style>
  </head>
  <body>${html}</body>
  </html>
  `);

printWindow.document.close();

printWindow.onload = () => {
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 300);
};
};

return null;
};

export default VoucherPrintModal;















