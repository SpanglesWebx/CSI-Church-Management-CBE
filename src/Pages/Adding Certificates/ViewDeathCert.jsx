import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaPrint } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { FiDownload } from "react-icons/fi";
import axios from "axios";
import { URL } from "../../App";
import moment from "moment";

export const ViewDeathCert = () => {

  const navigate = useNavigate();
  const { id } = useParams();
  const token = sessionStorage.getItem("token");

  const [data, setData] = useState(null);

  const downloadDeathPDF = async () => {
    try {
      const res = await axios.get(
        `${URL}/deaths/download/${id}`,
        {
          headers: { Authorization: token },
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const blobURL = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobURL;
      link.download = `${data.death_id}.pdf`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobURL);

    } catch (err) {
      console.error("Download failed:", err);
    }
  };

const handlePrintDeath = () => {

  const v = (x) => (!x ? "" : x);

  const formatDMY = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}/${
      String(d.getMonth() + 1).padStart(2, "0")
    }/${d.getFullYear()}`;
  };

  const dobAge = data.dob
    ? `${formatDMY(data.dob)} / ${v(data.age)}`
    : v(data.age);

  const addressParts =
    data.address?.split(",").map((p) => p.trim()) || [];

  const line1 = addressParts[0] || "-";
  const line2 = addressParts[1] || "";
  const line3 = addressParts[2] || "";

  let city = "";
  let pin = "";

  if (addressParts.length > 3) {
    const last = addressParts[addressParts.length - 1];
    const pinMatch = last.match(/\d{6}/);
    if (pinMatch) {
      pin = pinMatch[0];
      city = last.replace(pin, "").trim();
    } else {
      city = last;
    }
  }

const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Burial Certificate</title>

<style>

/* ---------- RESET ---------- */
*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}

/* ---------- FORCE REAL A4 ---------- */
@page{
  size:A4;
  margin:0;
}

html,body{
  width:210mm;
  height:297mm;
  background:#fff;
  font-family:"Times New Roman", Georgia, serif;
}

/* ---------- PAGE ---------- */
.page{
  width:210mm;
  height:297mm;
  padding:12mm;        /* paper margin space */
}

/* ---------- OUTER BORDER ---------- */
.outer-border{
  width:100%;
  height:100%;
  border:1.5px solid #111;
  padding:10mm 12mm;
  position:relative;
  display:flex;
  flex-direction:column;
}

/* ---------- HEADER ---------- */
.header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}

.logo{
  width:78px;
  height:78px;
  border:1px solid #ddd;
  flex:0 0 78px;
}

.center-header{
  text-align:center;
  flex:1;
}

.church-name{
  font-size:18px;
  letter-spacing:2px;
  font-weight:700;
}

.sub{
  margin:2px 0;
  font-size:11px;
  font-weight:600;
}

.title-box{
  display:inline-block;
  margin-top:8px;
  padding:6px 18px;
  border:1px solid #111;
  font-weight:700;
  font-size:13px;
  letter-spacing:.6px;
  background:rgba(0,0,0,0.02);
}

/* ---------- HEADER DIVIDER ---------- */
.header-divider{
  margin-top:12px;
  border-top:1px solid #111;
  margin-left:-12mm;
  margin-right:-12mm;
}

/* ---------- TOP INFO ---------- */
.top-info{
  display:flex;
  justify-content:space-between;
  margin-top:8px;
  padding:8px 2px;
  font-weight:600;
  font-size:13px;
}

/* ---------- CONTENT ---------- */
.content{
  margin-top:8px;
  flex:1;
}

/* ---------- TABLE ---------- */
table.details{
  width:100%;
  border-collapse:collapse;
}

table.details td{
  vertical-align:top;
  padding:10px 6px;
  font-size:14px;
}

.col-number{width:6%;font-weight:700;}
.col-label{width:38%;font-weight:700;}
.col-colon{width:3%;text-align:center;font-weight:700;}
.col-value{width:53%;}

.address-block{
  min-height:72px;
  line-height:1.45;
}

/* ---------- SIGNATURE ---------- */
.signature{
  position:absolute;
  right:24mm;
  bottom:14mm;
  font-weight:700;
  font-size:13px;
}

/* ---------- PRINT FIX ---------- */
@media print{
  body{
    margin:0;
    -webkit-print-color-adjust:exact;
  }
}

</style>
</head>

<body>

<div class="page">
<div class="outer-border">

<div class="header">
<div class="logo"></div>

<div class="center-header">
<div class="church-name">C S I CHRIST CHURCH</div>
<div class="sub">(COIMBATORE DIOCESE)</div>
<div class="sub">1558, TRICHY ROAD, COIMBATORE - 641018</div>
<div class="title-box">BURIAL CERTIFICATE</div>
</div>

<div class="logo"></div>
</div>

<div class="header-divider"></div>

<div class="top-info">
<div>Sl No: ${v(data.death_id)}</div>
<div>Issued On: ${formatDMY(data.certificate_issued_on)}</div>
</div>

<div class="content">
<table class="details">
<tbody>

<tr>
<td class="col-number">1.</td>
<td class="col-label">Name of the Deceased</td>
<td class="col-colon">:</td>
<td class="col-value">${v(data.member_name)}</td>
</tr>

<tr>
<td class="col-number">2.</td>
<td class="col-label">Father / Husband Name</td>
<td class="col-colon">:</td>
<td class="col-value">${v(data.father_or_husband)}</td>
</tr>

<tr>
<td class="col-number">3.</td>
<td class="col-label">Sex</td>
<td class="col-colon">:</td>
<td class="col-value">${v(data.gender)}</td>
</tr>

<tr>
<td class="col-number">4.</td>
<td class="col-label">Date of Birth / Age</td>
<td class="col-colon">:</td>
<td class="col-value">${dobAge}</td>
</tr>

<tr>
<td class="col-number">5.</td>
<td class="col-label">Aadhaar No</td>
<td class="col-colon">:</td>
<td class="col-value">${v(data.aadhar_number)}</td>
</tr>

<tr>
<td class="col-number">6.</td>
<td class="col-label">Occupation</td>
<td class="col-colon">:</td>
<td class="col-value">${v(data.occupation)}</td>
</tr>

<tr>
<td class="col-number">7.</td>
<td class="col-label">Address</td>
<td class="col-colon">:</td>
<td class="col-value address-block">
${line1}<br/>
${line2}<br/>
${line3}<br/>
${city} ${pin}
</td>
</tr>

<tr>
<td class="col-number">8.</td>
<td class="col-label">Place of Death</td>
<td class="col-colon">:</td>
<td class="col-value">${v(data.place_of_death)}</td>
</tr>

<tr>
<td class="col-number">9.</td>
<td class="col-label">Died On</td>
<td class="col-colon">:</td>
<td class="col-value">${formatDMY(data.died_on)}</td>
</tr>

<tr>
<td class="col-number">10.</td>
<td class="col-label">Cause of Death</td>
<td class="col-colon">:</td>
<td class="col-value">${v(data.cause_of_death)}</td>
</tr>

<tr>
<td class="col-number">11.</td>
<td class="col-label">Place of Burial</td>
<td class="col-colon">:</td>
<td class="col-value">${v(data.place_of_burial)}</td>
</tr>

<tr>
<td class="col-number">12.</td>
<td class="col-label">Buried On</td>
<td class="col-colon">:</td>
<td class="col-value">${formatDMY(data.buried_on)}</td>
</tr>

<tr>
<td class="col-number">13.</td>
<td class="col-label">Buried By</td>
<td class="col-colon">:</td>
<td class="col-value">${v(data.buried_by)}</td>
</tr>

</tbody>
</table>
</div>

<div class="signature">Signature of the Presbyter</div>

</div>
</div>

</body>
</html>
  `;

const printWindow = window.open("", "", "width=900,height=1000");

printWindow.document.write(html);
printWindow.document.close();

printWindow.focus();
printWindow.print();

setTimeout(() => {
  printWindow.close();
}, 500);
};



  useEffect(() => {
    axios.get(`${URL}/deaths/${id}`, {
      headers: { Authorization: token }
    }).then(res => setData(res.data.data));
  }, [id]);

  if (!data) return <p className="text-center mt-10">Loading...</p>;

  return (
    <>
      <div className="flex items-center justify-between mb-4">

        <FaArrowLeft
          size={18}
          title="Back"
          onClick={() => navigate("/admin/deathcertlist")}
          className="cursor-pointer text-gray-700"
        />

        <div className="flex items-center gap-4">
          <FiDownload
            size={20}
            className="text-lavender--600 cursor-pointer"
            title="Download"
            onClick={downloadDeathPDF}
          />

<FaPrint
  size={20}
  className="text-lavender--600 cursor-pointer"
  title="Print"
  onClick={handlePrintDeath}
/>


        </div>
      </div>

      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">

        <h1 className="text-lg text-lavender--600 font-semibold mb-3">
          Death Details
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-3">

          {[
            ["Death ID", data.death_id],
            ["Member ID", data.member_id],
            ["Name", data.member_name],
            ["Gender", data.gender],
            ["Father/Husband", data.father_or_husband],
            ["Date of Birth", data.dob ? moment(data.dob).format("DD-MM-YYYY") : "-"],
            ["Age", data.age],
            ["Aadhar", data.aadhar_number],
            ["Occupation", data.occupation],
            ["Address", data.address],
            ["Place of Death", data.place_of_death],
            ["Died On", data.died_on ? moment(data.died_on).format("DD-MM-YYYY") : "-"],
            ["Cause of Death", data.cause_of_death],
            ["Place of Burial", data.place_of_burial],
            ["Buried On", data.buried_on ? moment(data.buried_on).format("DD-MM-YYYY") : "-"],
            ["Buried By", data.buried_by],
            ["Certificate Issued On", data.certificate_issued_on]
          ].map(([l, v], i) => (

            <div key={i} className="grid grid-cols-2 gap-4">
              <span className="text-md font-bold text-gray-600">{l}</span>
              <span className="text-gray-800">{v || "-"}</span>
            </div>

          ))}

        </div>
      </div>
    </>
  );
};