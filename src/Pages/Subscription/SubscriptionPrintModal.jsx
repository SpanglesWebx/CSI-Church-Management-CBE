import { useEffect } from "react";

const SubscriptionPrintModal = ({ isOpen, onClose, data }) => {
  useEffect(() => {
    if (!isOpen || !data) return;
    printReceipt();
    onClose();
  }, [isOpen, data]);


const sumField = (monthsData = [], field) => {
  const value = (monthsData || []).reduce(
    (sum, m) => sum + Number(m?.[field] || 0),
    0
  );

  return value === 0 ? "" : value; // ⭐ hide zero
};

  // ---------- MONTH FORMAT ----------
const formatMonths = (months = []) => {
  if (!months.length) return "";

  // convert "october 2025" → Date object
  const parsed = months
    .map(m => {
      const parts = m.split(" ");
if (parts.length !== 2) return null;
const [monthName, year] = parts;
      return new Date(`${monthName} 1, ${year}`);
    }).filter(Boolean)
    .sort((a, b) => a - b);

  const monthShort = d =>
    d.toLocaleString("en-US", { month: "short" });

  const yearFull = d => d.getFullYear();

  let groups = [];
  let start = parsed[0];
  let prev = parsed[0];

  for (let i = 1; i < parsed.length; i++) {
    const curr = parsed[i];

    // check continuous month
    const diff =
      curr.getMonth() - prev.getMonth() +
      12 * (curr.getFullYear() - prev.getFullYear());

    if (diff !== 1) {
      groups.push([start, prev]);
      start = curr;
    }

    prev = curr;
  }

  groups.push([start, prev]);

  // format output
  return groups
    .map(([s, e]) => {
      if (s.getTime() === e.getTime()) {
        return `${monthShort(s)} ${yearFull(s)}`;
      }

      if (yearFull(s) === yearFull(e)) {
        return `${monthShort(s)}–${monthShort(e)} ${yearFull(s)}`;
      }

      return `${monthShort(s)} ${yearFull(s)}–${monthShort(e)} ${yearFull(e)}`;
    })
    .join(", ");
};

const formatTitle = (title) => {
  if (!title) return "";

  const t = title.toLowerCase();

  if (t === "mister" || t === "master") return "Mr";
  if (t === "mistress") return "Mrs";
  if (t === "miss") return "Ms";

  return t.charAt(0).toUpperCase() + t.slice(1);
};

  // ---------- MODE ----------
const getMode = (methods = []) => {
  if (!Array.isArray(methods)) return "";

  const clean = methods.filter(m => m === "Cash" || m === "Cheque");
  const set = new Set(clean);

  if (set.has("Cash") && set.has("Cheque")) {
    return "Cash /<br>Cheque";   // 🔥 two-line output
  }

  if (set.has("Cash")) return "Cash";
  if (set.has("Cheque")) return "Cheque";

  return "";
};

const getNextReceiptNo = () => {
  let current = Number(localStorage.getItem("receiptNo") || 0) + 1;
  localStorage.setItem("receiptNo", current);

  return String(current).padStart(Math.max(5, String(current).length), "0");
};


  const printReceipt = () => {
    const printWindow = window.open("", "", "width=800,height=1000");
// console.log("PRINT DATA:", data);

let html = "";

const printData = Array.isArray(data) ? data : [data];
// console.log("PRINT DATA FULL OBJECT:", JSON.stringify(printData, null, 2));
printData.forEach(d => {
  html += `
  
    <div class="page">

<div class="to-name">
${formatTitle(d?.title)} ${d?.name || ""}
</div>

      <div class="address">
        ${d?.address || ""} ${d?.pincode || ""}
      </div>

      <div class="sub-no">${d?.member_id}</div>
      <div class="month">${formatMonths(d?.months)}</div>

      <div class="receipt-no">${getNextReceiptNo()}</div>
      <div class="date">${d?.date || ""}</div>
      <div class="mode">
      ${getMode((d?.selectedMonthsData || []).map(m => m.payment_method))}
      </div>

      <div class="row1">${sumField(d?.selectedMonthsData,"monthlySubscriptionOffering")}</div>
      <div class="row2">${sumField(d?.selectedMonthsData,"buildingFund")}</div>
      <div class="row3">${sumField(d?.selectedMonthsData,"missionarySponsorship")}</div>
      <div class="row4">${sumField(d?.selectedMonthsData,"decimalPart")}</div>
      <div class="row5">${sumField(d?.selectedMonthsData,"ims")}</div>
      <div class="row6">${sumField(d?.selectedMonthsData,"fmpb")}</div>
      <div class="row7">${sumField(d?.selectedMonthsData,"nms")}</div>
      <div class="row8">${sumField(d?.selectedMonthsData,"iem")}</div>
      <div class="row9">${sumField(d?.selectedMonthsData,"vishwavani")}</div>
      <div class="row10">${sumField(d?.selectedMonthsData,"bym")}</div>
      <div class="row11">${sumField(d?.selectedMonthsData,"dbm")}</div>
      <div class="row12">${sumField(d?.selectedMonthsData,"cgmm")}</div>
      <div class="row13">${sumField(d?.selectedMonthsData,"cmm")}</div>
      <div class="row14">${sumField(d?.selectedMonthsData,"ymm")}</div>
      <div class="row15">${sumField(d?.selectedMonthsData,"bibleSociety")}</div>
      <div class="row16">${sumField(d?.selectedMonthsData,"womensMinistry")}</div>
      <div class="row17">${sumField(d?.selectedMonthsData,"educationalAssistance")}</div>
      <div class="row18">${sumField(d?.selectedMonthsData,"helpThePoor")}</div>
      <div class="row19">${sumField(d?.selectedMonthsData,"medicalAssistance")}</div>
      <div class="row20">${sumField(d?.selectedMonthsData,"harvestAuction")}</div>

      <div class="total">
        ${(d?.selectedMonthsData || []).reduce((t,m)=>t+Number(m?.total || 0),0)}
      </div>

    </div>

  `;
});

    printWindow.document.write(`
    <html>
    <head>
    <style>

    @page{
      size:A6;
      margin:0;
    }



        body{
          margin:0;
          font-family:Arial;
          font-size:0px;
        }

    /* A4 container */
.page{
  width:10.5cm;
  height:14.8cm;
  position:relative;
  padding:5mm;
  box-sizing:border-box;
}

    /* your receipt size */
    .page{
      width:10.2cm;
      height:17.2cm;
      position:absolute;
      top:0;
      left:0;
      padding:5mm;
      box-sizing:border-box;
    }

    /* ---------- TOP ---------- */

    .to-name{
      position:absolute;
      top:2.5cm;
      left:1.1cm;
      width:6.2cm;
      font-size:12px;
      font-weight:600;
    }
      
    .address{
      position:absolute;
      top:3.0cm;
      left:0.7cm;
      width:6.2cm;
      font-size:11px;
      line-height:1.8;

      overflow:hidden;
      text-overflow:ellipsis;

      display:-webkit-box;
      -webkit-line-clamp:2;     /* ⭐ ONLY 2 LINES */
      -webkit-box-orient:vertical;

      word-break:break-word;
    }


    .sub-no{ position:absolute; top:4.32cm; left:2.7cm;font-size:11px; }
    .month{ position:absolute; top:4.88cm; left:2.7cm;font-size:11px; }

    .receipt-no{ position:absolute; top:3.15cm; right:1.6cm;font-size:11px; }
    .date{ position:absolute; top:3.79cm; right:0.95cm;font-size:11px; }
    .mode{ position:absolute; top:4.4cm; right:0.5cm;font-size:11px; }

    .mode{
      position:absolute;
      top:4.4cm;
      right:1.4cm;
      font-size:11px;
      line-height:1.2;
      white-space:normal;
    }

    /* ---------- CONTRIBUTION AMOUNTS ---------- */
    /* adjust later if needed */

    .row1  { position:absolute; top:5.9cm;   left:8.4cm; font-size:11px; }
    .row2  { position:absolute; top:6.45cm; left:8.4cm; font-size:11px; }
    .row3  { position:absolute; top:7cm;   left:8.4cm; font-size:11px; }
    .row4  { position:absolute; top:7.5cm; left:8.4cm; font-size:11px; }
    .row5  { position:absolute; top:8.05cm;   left:8.4cm; font-size:11px; }
    .row6  { position:absolute; top:8.55cm; left:8.4cm; font-size:11px; }
    .row7  { position:absolute; top:9.05cm;   left:8.4cm; font-size:11px; }
    .row8  { position:absolute; top:9.55cm; left:8.4cm; font-size:11px; }
    .row9  { position:absolute; top:10.05cm;  left:8.4cm; font-size:11px; }
    .row10 { position:absolute; top:10.56cm;left:8.4cm; font-size:11px; }
    .row11 { position:absolute; top:11.09cm;  left:8.4cm; font-size:11px; }
    .row12 { position:absolute; top:11.59cm;left:8.4cm; font-size:11px; }
    .row13 { position:absolute; top:12.17cm;  left:8.4cm; font-size:11px; }
    .row14 { position:absolute; top:12.67cm;left:8.4cm; font-size:11px; }
    .row15 { position:absolute; top:13.2cm;  left:8.4cm; font-size:11px; }
    .row16 { position:absolute; top:13.68cm;left:8.4cm; font-size:11px; }
    .row17 { position:absolute; top:14.22cm;  left:8.4cm; font-size:11px; }
    .row18 { position:absolute; top:14.68cm;left:8.4cm; font-size:11px; }
    .row19 { position:absolute; top:15.25cm;  left:8.4cm; font-size:11px; }
    .row20 { position:absolute; top:15.83cm;left:8.4cm; font-size:11px; }

    .total{
      position:absolute;
      bottom:0.555cm;
      left:8cm; font-size:11px;
      font-weight:bold;
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
      }, 400);
    };
  };

  return null;
};

export default SubscriptionPrintModal;