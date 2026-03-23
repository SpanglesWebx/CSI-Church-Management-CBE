import React, { useEffect, useState } from 'react'
import { FaPlus, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FailedMessage, SuccessMessage } from '../../Components/ToastMessage';
import { URL } from '../../App';
import Pagination from '../../Components/Helpers/Pagination';



export const DeathCertList = () => {
  const [Response, setResponse] = useState({ status: null, message: "" });
  const token = window.sessionStorage.getItem("token");

  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [rows, setRows] = useState([]);   // ✅ THIS WAS MISSING

  // const [isViewOpen, setIsViewOpen] = useState(false);
  // const [selectedRecord, setSelectedRecord] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // reusable pagination
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");

  const navigate = useNavigate();

  const fetchDeaths = async () => {
    try {
      const res = await fetch(
        `${URL}/deaths?page=${CurrentPage}&limit=${rowsPerPage}&search=${searchTerm}&from=${startDate}&to=${endDate}`,
        { headers: { Authorization: token } }
      );

      const data = await res.json();

      setRows(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Fetch Death Error:", err);
      setRows([]);
    }
  };

// const openView = async (item) => {
//   try {
//     const res = await fetch(`${URL}/deaths/${item._id}`, {
//       headers: { Authorization: token },
//     });

//     const data = await res.json();
//     setSelectedRecord(data.data || item);
//     setIsViewOpen(true);
//   } catch (err) {
//     console.error("View error:", err);
//     setSelectedRecord(item);
//     setIsViewOpen(true);
//   }
// };



const downloadDeathPDF = async () => {
  try {
    const res = await fetch(
      `${URL}/deaths/download/${selectedRecord._id}`,
      {
        headers: { Authorization: token },
      }
    );

    const blob = await res.blob();
    const blobURL = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobURL;
    link.download = `${selectedRecord.death_id}.pdf`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobURL);

  } catch (err) {
    console.error("Download failed:", err);
  }
};

const handlePrintDeath = () => {
  if (!selectedRecord) return;

  const v = (x) => (!x ? "" : x);

  const formatDMY = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}/${
      String(d.getMonth() + 1).padStart(2, "0")
    }/${d.getFullYear()}`;
  };

  const dobAge = selectedRecord.dob
    ? `${formatDMY(selectedRecord.dob)} / ${v(selectedRecord.age)}`
    : v(selectedRecord.age);

  // address split (same backend logic)
  const addressParts =
    selectedRecord.address?.split(",").map((p) => p.trim()) || [];

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
<div>Sl No: ${v(selectedRecord.death_id)}</div>
<div>Issued On: ${formatDMY(selectedRecord.certificate_issued_on)}</div>
</div>

<div class="content">
<table class="details">
<tbody>

<tr>
<td class="col-number">1.</td>
<td class="col-label">Name of the Deceased</td>
<td class="col-colon">:</td>
<td class="col-value">${v(selectedRecord.member_name)}</td>
</tr>

<tr>
<td class="col-number">2.</td>
<td class="col-label">Father / Husband Name</td>
<td class="col-colon">:</td>
<td class="col-value">${v(selectedRecord.father_or_husband)}</td>
</tr>

<tr>
<td class="col-number">3.</td>
<td class="col-label">Sex</td>
<td class="col-colon">:</td>
<td class="col-value">${v(selectedRecord.gender)}</td>
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
<td class="col-value">${v(selectedRecord.aadhar_number)}</td>
</tr>

<tr>
<td class="col-number">6.</td>
<td class="col-label">Occupation</td>
<td class="col-colon">:</td>
<td class="col-value">${v(selectedRecord.occupation)}</td>
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
<td class="col-value">${v(selectedRecord.place_of_death)}</td>
</tr>

<tr>
<td class="col-number">9.</td>
<td class="col-label">Died On</td>
<td class="col-colon">:</td>
<td class="col-value">${formatDMY(selectedRecord.died_on)}</td>
</tr>

<tr>
<td class="col-number">10.</td>
<td class="col-label">Cause of Death</td>
<td class="col-colon">:</td>
<td class="col-value">${v(selectedRecord.cause_of_death)}</td>
</tr>

<tr>
<td class="col-number">11.</td>
<td class="col-label">Place of Burial</td>
<td class="col-colon">:</td>
<td class="col-value">${v(selectedRecord.place_of_burial)}</td>
</tr>

<tr>
<td class="col-number">12.</td>
<td class="col-label">Buried On</td>
<td class="col-colon">:</td>
<td class="col-value">${formatDMY(selectedRecord.buried_on)}</td>
</tr>

<tr>
<td class="col-number">13.</td>
<td class="col-label">Buried By</td>
<td class="col-colon">:</td>
<td class="col-value">${v(selectedRecord.buried_by)}</td>
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

const win = window.open("", "", "width=900,height=1000");

win.document.write(html);
win.document.close();

win.onload = () => {
  win.focus();

  // Close window after print dialog closes (Print or Cancel)
  win.onafterprint = () => {
    win.close();
  };

  setTimeout(() => {
    win.print();
  }, 300);
};
};



  useEffect(() => {
    fetchDeaths();
  }, [CurrentPage, searchTerm, startDate, endDate, rowsPerPage]);

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg font-semibold">Death</h1>

        <div className="flex items-center justify-between p-2">

          {/* SEARCH */}
          <div className="relative">
            <input
              type="search"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="block py-1 text-sm text-gray-900 rounded w-54 ps-3 bg-gray-50"
            />
          </div>

          {/* DATE FILTER */}
          <div className="flex items-center space-x-3">
            <label>From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="py-1 text-sm rounded border px-2"
            />

            <label>To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="py-1 text-sm rounded border px-2"
            />
          </div>

          {/* ADD BUTTON */}
          <button
            onClick={() =>
              navigate("/admin/deathcertlist/adddeathcertificate")
            }
            className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg"
          >
            <FaPlus /> Death
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Member ID</th>
                <th className="p-2 text-center">Name</th>
                <th className="p-2 text-center">Death Date</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="text-center">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-3">
                    No Records Found
                  </td>
                </tr>
              ) : (
                rows.map((item, i) => (
                  <tr key={item._id} className="border-b">
                    <td className="p-2">
                      {(CurrentPage - 1) * rowsPerPage + i + 1}
                    </td>

                    <td className="p-2">{item.member_id || "-"}</td>
                    <td className="p-2 text-left">{item.member_name || "-"}</td>
                    <td className="p-2">
                      {item.died_on
                        ? new Date(item.died_on).toLocaleDateString()
                        : "-"}
                    </td>

                    <td className="p-2 flex justify-center gap-3">
<FaEye
  size={18}
  className="text-lavender--600 cursor-pointer"
  title="View"
  onClick={() =>
    navigate(`/admin/deathcertlist/viewdeathcertificate/${item._id}`)
  }
/>

                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>


        {/* PAGINATION */}
        <Pagination
          currentPage={CurrentPage}
          totalPages={TotalPages}
          rowsPerPage={rowsPerPage}
          rowsInput={rowsInput}
          jumpInput={jumpInput}
          setCurrentPage={setCurrentPage}
          setRowsPerPage={setRowsPerPage}
          setRowsInput={setRowsInput}
          setJumpInput={setJumpInput}
          defaultRows={25}
        />
      </div>

      {Response.status &&
        (Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : (
          <FailedMessage Message={Response.message} />
        ))}

{/* <Modal
  isOpen={isViewOpen}
  onClose={() => setIsViewOpen(false)}
  title="Death Details"
  onDownload={downloadDeathPDF}
  onPrint={handlePrintDeath}
>
  {selectedRecord && (
    <div className="flex flex-col pt-5 ps-5 w-full max-w-4xl space-y-3 max-h-[650px] overflow-y-auto">

      {[
        { label: "Death ID", value: selectedRecord.death_id },
        { label: "Member ID", value: selectedRecord.member_id || "-" },
        { label: "Name", value: selectedRecord.member_name || "-" },
        { label: "Gender", value: selectedRecord.gender || "-" },
        { label: "Father/Husband", value: selectedRecord.father_or_husband || "-" },
        { label: "Date of Birth", value: selectedRecord.dob || "-" },
        { label: "Age", value: selectedRecord.age || "-" },
        { label: "Aadhaar", value: selectedRecord.aadhar_number || "-" },
        { label: "Occupation", value: selectedRecord.occupation || "-" },
        { label: "Address", value: selectedRecord.address || "-" },
        { label: "Place of Death", value: selectedRecord.place_of_death || "-" },
        {
          label: "Died On",
          value: selectedRecord.died_on
            ? new Date(selectedRecord.died_on).toLocaleDateString()
            : "-",
        },
        { label: "Cause of Death", value: selectedRecord.cause_of_death || "-" },
        { label: "Place of Burial", value: selectedRecord.place_of_burial || "-" },
        { label: "Buried On", value: selectedRecord.buried_on || "-" },
        { label: "Buried By", value: selectedRecord.buried_by || "-" },
        { label: "Certificate Issued On", value: selectedRecord.certificate_issued_on || "-" },
      ].map((item, index) => (
        <div key={index} className="grid grid-cols-12 gap-2 pb-2 last:border-none">
          <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700">
            {item.label}
          </div>
          <div className="col-span-12 sm:col-span-8 text-base text-gray-800">
            {item.value}
          </div>
        </div>
      ))}

    </div>
  )}
</Modal> */}

    </>
  );
};
