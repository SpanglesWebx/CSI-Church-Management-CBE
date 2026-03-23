import React, { useEffect, useState } from "react";
import { FaArrowLeft,FaPrint } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { URL } from "../../App";
import { FiDownload } from "react-icons/fi";
// import { FaPrint } from "react-icons/fa";

export const ViewMrgCert = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = sessionStorage.getItem("token");

  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchMarriage = async () => {
      const res = await axios.get(`${URL}/marriage-certificate/${id}`, {
        headers: { Authorization: token }
      });
      setData(res.data.data);
    };
    fetchMarriage();
  }, [id]);

  const downloadMarriagePDF = async () => {
    try {
      const res = await axios.get(
        `${URL}/marriage-certificate/download/${id}`,
        {
          headers: { Authorization: token },
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const blobURL = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobURL;
      link.download = `${data.marriageCode}.pdf`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobURL);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

const formatDob = (dob) => {
  if (!dob) return "-";

  // already formatted
  if (dob.includes("/")) return dob;

  const d = new Date(dob);

  const dd = String(d.getDate()).padStart(2,"0");
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const yyyy = d.getFullYear();

  return `${dd}/${mm}/${yyyy}`;
};

const handlePrintMarriage = () => {

  const v = (x) => (!x ? "-" : x);

  const formatDMY = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2,"0")}/${
      String(d.getMonth()+1).padStart(2,"0")
    }/${d.getFullYear()}`;
  };

const d = new Date(data.banns?.weddingDate)

const dd = String(d.getDate()).padStart(2,"0")
const mm = String(d.getMonth()+1).padStart(2,"0")
const yyyy = d.getFullYear()

const month = d.toLocaleString("en-IN",{month:"long"}).toUpperCase()
const day = d.toLocaleString("en-IN",{weekday:"long"}).toUpperCase()

const ordinal = (n)=>{
 if(n%10===1 && n%100!==11) return `${n}<sup>ST</sup>`
 if(n%10===2 && n%100!==12) return `${n}<sup>ND</sup>`
 if(n%10===3 && n%100!==13) return `${n}<sup>RD</sup>`
 return `${n}<sup>TH</sup>`
}

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


const formatRegistrarLine = (text) => {
  if (!text) return "Marriage Registrar,";

  const words = text.toUpperCase().split(" ");

  if (words.length > 1) {
    const lastWord = words.pop();
    const firstPart = words.join(" ");

    return `Marriage Registrar, <span class="data-uppercase">${firstPart}<br>${lastWord}</span>`;
  }

  return `Marriage Registrar, <span class="data-uppercase">${text}</span>`;
};

  
  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>

<style>

@page{
  size: legal landscape;
  margin:2mm 3mm 10mm 18mm;
}

body{
  font-family:Arial, sans-serif;
}

.church-title{
  text-align:center;
  font-weight:bold;
  margin-bottom:12px;
  font-size:16px;
  font-family:"Times New Roman", Times, serif;
}



table{
  width:100%;
  border-collapse:collapse;
  font-size:13px;
}

th,td{
  border:1px solid black;
  padding:6px;
  text-align:center;
  vertical-align:middle;
}

th{
  font-weight:normal;
}

td{
  font-weight:bold;
}

.person-row td{
  height:90px;
}



.small-td{
  font-size:11px;
}


.bottom-flex{
  display:flex;
  font-size:14px;
  justify-content:space-between;
  margin-top:10px;
  font-family:"Times New Roman", Times, serif;
  font-weight:bold;
}

.bottom-col{
  width:30%;
}

.bottom-col.left{
  width:40%;
}

.right-align{
  text-align:right;
}


.married-line{
  margin-top:6px;
  font-family:"Times New Roman", Times, serif;
}

.small-text{
  font-size:14px;
}

.big-text{
  font-size:16px;
}


.data-uppercase{
text-transform:uppercase;
}

.left-align{
  text-align:left !important;
}

td{
text-transform:uppercase;
}


.wrap-text{
  display:inline;
  white-space:normal;
}

sup{
 font-size:8px;
}

.place-date{
  font-family: Arial, sans-serif;
  font-size:14px !important;
}

.signature-name{
  font-size:14px;
}

.signature-presbyter{
  font-size:13px;
}

</style>
</head>

<body>

<div class="container">

<div class="title-box">
<div class="church-title">
TRUE EXTRACT FROM THE REGISTER BOOK OF MARRIAGE
Maintained by C.S.I CHRIST CHURCH, 1553, TRICHY ROAD,
</br> COIMBATORE – 641018</div>

<div class="church-title">UNDER SECTION 62 OF ACT XV OF 1872</div>
</div>



<table>

<colgroup>
<col style="width:1%">
<col style="width:6%">
<col style="width:18%">
<col style="width:9%">
<col style="width:7%">
<col style="width:7%">
<col style="width:8%">
<col style="width:16%">
<col style="width:17%">
<col style="width:7%">
</colgroup>

<tr>
<th rowspan="2">Sl.No</th>
<th rowspan="2">When Married</th>
<th colspan="2">Names of the Parties</th>
<th rowspan="2">Age / DOB</th>
<th rowspan="2">Condition</th>
<th rowspan="2">Rank of Profession</th>
<th rowspan="2">Residence at the time of Marriage</th>
<th rowspan="2">Father's Name and Surname</th>
<th rowspan="2">By Banns Or Licence</th>
</tr>

<tr>
<th>Christian Name</th>
<th>Surname</th>
</tr>

<tr class="person-row">
<td rowspan="2">${v(data.registerSlNo)}</td>
<td rowspan="2">
${dd}/${mm}/${yyyy}<br/><br/>
${ordinal(dd)} ${month}<br/>
${yyyy}<br/>
(${day})
</td>

<td >${v(data.groom?.memberName || data.groom?.nonMemberName)}</td>
<td>-</td>

<td class="small-td">${v(data.groom?.age)} years<br/><br/>${formatDob(data.groom?.dob)}</td>
<td class="small-td">${getCondition(data.groom?.maritalStatus, "groom")}</td>
<td class="small-td">${v(data.groom?.profession)}</td>
<td class="left-align small-td">
${v(data.groom?.address).replace(/\n/g,"<br/>")} - ${v(data.groom?.pincode)}
</td>
<td >${v(data.groom?.fatherName)}</td>

<td rowspan="2" class="left-align class="small-td"">${v(data.banns?.bannsLicense)}</td>
</tr>

<tr class="person-row">

<td >${v(data.bride?.memberName || data.bride?.nonMemberName)}</td>
<td>-</td>

<td class="small-td">${v(data.bride?.age)} years<br/><br/>${formatDob(data.bride?.dob)}</td>
<td class="small-td">${getCondition(data.bride?.maritalStatus, "bride")}</td>
<td class="small-td">${v(data.bride?.profession)}</td>
<td class="left-align small-td">${v(data.bride?.address).replace(/\n/g,"<br/>")} - ${v(data.bride?.pincode)}</td>
<td >${v(data.bride?.fatherName)}</td>

</tr>

</table>

<br/>

<div class="married-line">
<b>
<span class="small-text">Married in the</span>
<span class="big-text">C S I CHRIST CHURCH, 1558, TRICHY ROAD, COIMBATORE - 641018</span>
<span class="small-text">by the Episcopally Ordained Presbyter</span>
<span class="big-text">${v(data.pastors?.[0]?.name)}</span>
</b>
</div>

<br/><br/><br/>

<div class="bottom-flex">

<div class="bottom-col left" 
style="display:grid; grid-template-columns:30% 70%; row-gap:6px; font-size:16px;">

<div>This marriage</div>
<div class="data-uppercase signature-name">(Sd) ${v(data.groom?.memberName || data.groom?.nonMemberName)}</div>

<div>was solemnized</div>
<div></div>

<div>between us on</div>
<div></div>

<div>${formatDMY(data.banns?.weddingDate)}</div>
<div class="data-uppercase signature-name">(Sd) ${v(data.bride?.memberName || data.bride?.nonMemberName)}</div>

<br/><br/><br/><br/>

<div class="place-date" style="grid-column:1 / span 2; margin-top:8px;">
Place : TRICHY ROAD, COIMBATORE <br/>
Date : ${formatDMY(new Date())}
</div>

</div>

<div class="bottom-col">

Witnesses :<br/><br/>

${
data.witnesses && data.witnesses.length > 0
? data.witnesses.map((w,i)=>`
(${i+1})<br/><br/>
<div style="margin-left:28px;">
(Sd) ${(w.name || "-").toUpperCase()}<br/>
${(w.address || "-").toUpperCase()}
</div>
<br/><br/>
`).join("")
: "-"
}

</div>

<div class="bottom-col right-align">

<div class="data-uppercase ">
(Sd) ${v(data.pastors?.[0]?.name)}, ${v(data.pastors?.[0]?.qualification)}
</div>
<div class="signature-presbyter">
${data.pastors?.[0]?.pastor_role?.toLowerCase() === "primary"
  ? "PRESBYTER & CHAIRMAN"
  : "PRESBYTER"} <br/>

${formatRegistrarLine(v(data.pastors?.[0]?.responsibility))}
</div>
</div>

</div>
</div>
</body>
</html>
`;

const win = window.open("", "", "width=900,height=1000");

win.document.write(html);
win.document.close();

win.onload = () => {

  win.focus();

  win.onafterprint = () => {
    win.close();
  };

  setTimeout(() => {
    win.print();
  }, 300);

};

};



  if (!data) return <p className="text-center mt-10">Loading...</p>;

  // Helper: render only if value exists
  const Field = ({ label, value }) =>
    value ? (
      <div className="grid grid-cols-2 gap-4">
        <span className="text-md font-bold text-gray-600">{label}</span>
        <span className="text-gray-800">{value}</span>
      </div>
    ) : null;

  return (
    <>
<div className="flex items-center justify-between mb-4">
  {/* LEFT: Back button */}
  <FaArrowLeft
    size={18}
    title="Back"
    onClick={() => navigate(-1)}
    className="cursor-pointer text-gray-700"
  />

  {/* RIGHT: Download + Print */}
  <div className="flex items-center gap-4">
    <FiDownload
      size={20}
      className="text-lavender--600 cursor-pointer"
      title="Download"
      onClick={downloadMarriagePDF}
    />

<FaPrint
  size={20}
  className="text-lavender--600 cursor-pointer"
  title="Print"
  onClick={handlePrintMarriage}
/>
  </div>
</div>


      {/* 🔹 BASIC INFO */}
      <div className="p-3 bg-white shadow-md rounded-[10px] mb-4">
        <h1 className="text-lg text-lavender--600 font-semibold mb-3">
          Marriage Details
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-3">
          <Field label="Marriage ID" value={data.marriageCode} />
          <Field label="Register Sl No" value={data.registerSlNo} />
          <Field
            label="Marriage Date"
            value={
              data.banns?.weddingDate
                ? moment(data.banns.weddingDate).format("DD-MM-YYYY")
                : ""
            }
          />
        </div>
      </div>

      {/* 👤 BRIDEGROOM */}
      <div className="p-3 bg-white shadow-md rounded-[10px] mb-4">
        <h1 className="text-lg text-lavender--600 font-semibold mb-3">
          Bridegroom
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-3">
          <Field label="Name" value={data.groom?.memberName || data.groom?.nonMemberName} />
          <Field label="Father Name" value={data.groom?.fatherName} />
          <Field label="Mother Name" value={data.groom?.motherName} />
          <Field label="Age" value={data.groom?.age} />
          <Field label="Profession" value={data.groom?.profession} />
          <Field label="Address" value={data.groom?.address} />
        </div>
      </div>

      {/* 👤 BRIDE */}
      <div className="p-3 bg-white shadow-md rounded-[10px] mb-4">
        <h1 className="text-lg text-lavender--600 font-semibold mb-3">
          Bride
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-3">
          <Field label="Name" value={data.bride?.memberName || data.bride?.nonMemberName} />
          <Field label="Father Name" value={data.bride?.fatherName} />
          <Field label="Mother Name" value={data.bride?.motherName} />
          <Field label="Age" value={data.bride?.age} />
          <Field label="Profession" value={data.bride?.profession} />
          <Field label="Address" value={data.bride?.address} />
        </div>
      </div>

      {/* 📜 BANNS & CERTIFICATES */}
      <div className="p-3 bg-white shadow-md rounded-[10px] mb-4">
        <h1 className="text-lg text-lavender--600 font-semibold mb-3">
          Banns & Certificates
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-3">
          <Field label="Betrothal Date" value={data.banns?.betrothalDate && moment(data.banns.betrothalDate).format("DD-MM-YYYY")} />
          <Field label="Betrothal Place" value={data.banns?.betrothalPlace} />
          <Field label="Wedding In Our Church" value={data.banns?.weddingInOurChurch} />
          <Field label="Marriage Cert Issued" value={data.banns?.marriageCertIssued} />
          <Field label="Cert Issued On" value={data.banns?.marriageCertIssuedDate && moment(data.banns.marriageCertIssuedDate).format("DD-MM-YYYY")} />
        </div>
      </div>

      {/* ⛪ SOLEMNIZED BY */}
      {data.pastors?.length > 0 && (
        <div className="p-3 bg-white shadow-md rounded-[10px] mb-4">
          <h1 className="text-lg text-lavender--600 font-semibold mb-3">
            Marriage Solemnized By
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-3">
            {data.pastors.map((p, i) => (
              <React.Fragment key={i}>
                <Field label={`Name`} value={p.name} />
                <Field label={`Qualification`} value={p.qualification} />
                <Field label={`Responsibility`} value={p.responsibility} />
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

    </>
  );
};
