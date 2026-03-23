import React from 'react'
import { FaArrowLeft,FaPrint } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom';
import { useParams } from "react-router-dom";
import { FiDownload } from "react-icons/fi";
import axios from "axios";
import { URL } from "../../App";
import moment from "moment";
import { useEffect, useState } from "react";


export const ViewBaptismCert = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = sessionStorage.getItem("token");
  const [data, setData] = useState(null);



const downloadBaptismPDF = async () => {
  try {
    const res = await axios.get(
      `${URL}/baptisms/download/${id}`,
      {
        headers: { Authorization: token },
        responseType: "blob",
      }
    );

    const blob = new Blob([res.data], { type: "application/pdf" });
    const blobURL = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobURL;
    link.download = `${data.baptism_id}.pdf`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobURL);

  } catch (err) {
    console.error("Download failed:", err);
  }
};


const handlePrintBaptism = () => {

  const v = (x) => (!x ? "" : x);

  const formatDMY = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}/${
      String(d.getMonth() + 1).padStart(2, "0")
    }/${d.getFullYear()}`;
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>

<style>
@page{
  size: legal landscape;
  margin:10mm 3mm 10mm 20mm;

}

body{
  font-family:Arial, sans-serif;
  font-size:16px;
}

.header{
  text-align:center;
  font-weight:bold;
  margin-bottom:12px;
  font-size:26px;
  font-family:"Times New Roman", Times, serif;
}

table{
  width:100%;
  border-collapse:collapse;
  table-layout:fixed;
}

th{
  border:1px solid black;
  padding:6px;
  font-size:14px;   /* header font */
  vertical-align:top;
  font-weight:bold;
}

td{
  border:1px solid black;
  padding:6px;
  font-size:12px;   /* data font */
  vertical-align:top;
  text-transform:uppercase;
}

td{
  text-transform:uppercase;
}

.big-row td{
  height:305px;
  padding-top:50px;
}

.cert-text{
  margin-top:12px;
  margin-left:50px;
  font-size:18px;
  line-height:1.5;
  font-family:"Times New Roman", Times, serif;
}

.issued-name{
  font-size:20px;
  font-weight:bold;
}

.bottom-row{
  margin-top:18px;
  display:flex;
  justify-content:space-between;
  font-size:13px;
  padding-right:120px;
  font-weight:bold;
}

.label{
  width:60px;
  font-weight:bold;
}

.value{
  margin-left:6px;
}

</style>
</head>

<body>

<div class="header">
CSI CHRIST CHURCH, 1558, TRICHY ROAD, COIMBATORE - 641018<br/>
CERTIFICATE OF BAPTISM
</div>

<table>

<colgroup>
<col style="width:7%">
<col style="width:7%">
<col style="width:7%">
<col style="width:17%">
<col style="width:6%">
<col style="width:18%">
<col style="width:9%">
<col style="width:14%">
<col style="width:12%">
<col style="width:13%">
</colgroup>

<tr>
<th>Sl.No</th>
<th>Date of Baptism</th>
<th>Said to be Born</th>
<th>Name of the Child</th>
<th>Sex</th>
<th>Parents Name and Address</th>
<th>Parent's Profession</th>
<th>God Parents</th>
<th>Place of Baptism</th>
<th>Baptized by</th>
</tr>

<tr class="big-row">
<td><center>${v(data.baptism_id)}</center></td>
<td><center>${formatDMY(data.baptism_date)}</center></td>
<td><center>${formatDMY(data.dob)}</center></td>
<td  style="font-size:13px;"><b>${v(data.member_name)}</b></td>
<td><center>${v(data.gender)}</center></td>
<td style="font-size:13px;"><b>
Mr ${v(data.father_name)}<br/><br/>
Mrs ${v(data.mother_name)}<br/><br/> </b>
${v(data.address)} - ${v(data.pincode)}
</td>
<td>
${v(data.father_profession)}<br/><br/>
${v(data.mother_profession)}
</td>
<td>${v(data.god_parents).replace(/,/g,"<br/><br/>")}</td>
<td>${v(data.baptism_place)}</td>
<td>${v(data.baptised_by)}</td>
</tr>
</table>

<br/>

<div class="cert-text">
I, <span class="issued-name">${String(data.issued_by || "").toUpperCase()}</span> do hereby certify that the above is a true extract from the register of Baptism kept in this Church.
</div>

<br/><br/><br/><br/>

<div class="bottom-row">

<div>
<b>Place :</b> TRICHY ROAD, COIMBATORE<br/><br/>
<b>Date :</b> ${formatDMY(new Date())}
</div>

<div style="font-family:'Times New Roman', Times, serif; font-size:15px;">
Presbyter
</div>

</div>

</body>
</html>
`;

  const printWindow = window.open("", "", "width=1200,height=900");

  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.focus();
  printWindow.print();

  setTimeout(()=>{
    printWindow.close();
  },500);
};



  useEffect(() => {
    axios.get(`${URL}/baptisms/${id}`, {
      headers: { Authorization: token }
    }).then(res => setData(res.data.data));
  }, [id]);

  if (!data) return <p className="text-center mt-10">Loading...</p>;


  return (
    <>

<div className="flex items-center justify-between mb-4">
  {/* LEFT: Back button */}
  <FaArrowLeft
    size={18}
    title="Back"
    onClick={() => navigate("/admin/baptismcertlist")}
    className="cursor-pointer text-gray-700"
  />

  {/* RIGHT: Download + Print */}
  <div className="flex items-center gap-4">
    <FiDownload
      size={20}
      className="text-lavender--600 cursor-pointer"
      title="Download"
      onClick={downloadBaptismPDF}
      
    />

<FaPrint
  size={20}
  className="text-lavender--600 cursor-pointer"
  title="Print"
  onClick={handlePrintBaptism}
/>
  </div>
</div>

      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg text-lavender--600 font-semibold mb-3">Member Details</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-3">

          {[
            ["Baptism ID", data.baptism_id],
            ["Member ID", data.member_id],
            ["Member Name", data.member_name],
            ["Date of Birth", data.dob ? moment(data.dob).format("DD-MM-YYYY") : "-"],
            ["Age", data.age],
            ["Profession", data.profession],
            ["Aadhar Number", data.aadhar_number],
            ["Place of Birth", data.place_of_birth],
            ["Address", data.address]
          ].map(([l, v], i) => (
            <div key={i} className="grid grid-cols-2 gap-4">
              <span className="text-md font-bold text-gray-600">{l}</span>
              <span className="text-gray-800">{v || "-"}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg text-lavender--600 font-semibold mb-3">Parent Details</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-3">
          {[
            ["Father Name", data.father_name],
            ["Father Profession", data.father_profession],
            ["Father Aadhar", data.father_aadhar],
            ["Mother Name", data.mother_name],
            ["Mother Profession", data.mother_profession],
            ["Mother Aadhar", data.mother_aadhar],
          ].map(([l, v], i) => (
            <div key={i} className="grid grid-cols-2 gap-4">
              <span className="text-md font-bold text-gray-600">{l}</span>
              <span className="text-gray-800">{v || "-"}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg text-lavender--600 font-semibold mb-3">Baptism Details</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-3">
          {[
            ["Baptism Date", moment(data.baptism_date).format("DD-MM-YYYY")],
            ["Baptism Type", data.baptism_type],
            ["Baptism Place", data.baptism_place],
            ["Baptised By", data.baptised_by],
            ["God Parents", data.god_parents],
            ["Witnesses", data.witnesses],
            ["Remarks", data.remarks],
            ["Certificate Issued", data.certificate_issued],
            ["Issued On", data.issued_on],
            ["Issued By", data.issued_by],
          ].map(([l, v], i) => (
            <div key={i} className="grid grid-cols-2 gap-4">
              <span className="text-md font-bold text-gray-600">{l}</span>
              <span className="text-gray-800">{v || "-"}</span>
            </div>
          ))}
        </div>
      </div>

    </>
  )
}
