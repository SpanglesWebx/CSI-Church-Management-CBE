import React, { useEffect } from "react";

const MemberDetailedPrintModal = ({
  isOpen,
  onClose,
  members,
  fromSI,
  toSI
}) => {

useEffect(() => {

  if (!isOpen || !members?.length) return;

  const start = Number(fromSI) - 1;
  const end = Number(toSI);

  const selectedMembers = members.slice(start, end);

  printMembers(selectedMembers);

  onClose();

}, [isOpen]);


const template = (m) => `
<div class="page-wrapper">

<div class="header">
<h1>CSI CHRIST CHURCH</h1>
<p>1588, TRICHY ROAD, COIMBATORE - 641018</p><br/>
<div class="title">BIO-DATA</div>

<div class="photo">
${m.photo ? `<img src="${m.photo}" />` : ""}
</div>
</div>

<div class="section-divider"></div>

<div class="content-area">

<div class="basic-grid">

<div class="basic-label">Memb No and Name :</div>
<div class="basic-value">${m.member_id || ""} ${m.member_name || ""}</div>

<div class="basic-label">Family No :</div>
<div class="basic-value">${m.family_id || "-"}</div>

<div class="basic-label">Head of the Family :</div>
<div class="basic-value" style="grid-column:2 / span 3;">
${m.head_of_family || "-"}
</div>

<div class="basic-label">Father’s Name :</div>
<div class="basic-value">${m.father_name || "-"}</div>

<div class="basic-label">Mother’s Name :</div>
<div class="basic-value">${m.mother_name || "-"}</div>

</div>

<div class="section-divider"></div>

<div class="basic-grid">

<div class="basic-label">Residential Address :</div>
<div class="basic-value wrap-text fixed-box" style="grid-column:2 / span 3;">
${m.address || "-"}
</div>

<div class="basic-label">Primary Contact No:</div>
<div class="basic-value">${m.primary_contact_number || "-"}</div>

<div class="basic-label">Contact Nos :</div>
<div class="basic-value">${m.contact_number || "-"}</div>

<div class="basic-label">E-Mail :</div>
<div class="basic-value">${m.email || "-"}</div>

<div class="basic-label">WebSite :</div>
<div class="basic-value">-</div>

<div class="basic-label">Official Address :</div>
<div class="basic-value" style="grid-column:2 / span 3;">
${m.official_address || "-"}
</div>

<div class="basic-label">Contact Nos :</div>
<div class="basic-value" style="grid-column:2 / span 3;">
${m.official_contact || "-"}
</div>

</div>

<div class="section-divider"></div>

<div class="basic-grid">

<div class="basic-label">Permanent Address :</div>
<div class="basic-value wrap-text fixed-box" style="grid-column:2 / span 3;">
${m.permanent_address || "-"}
</div>

<div class="basic-label">Home Church :</div>
<div class="basic-value" style="grid-column:2 / span 3;">
${m.home_church || "-"}
</div>

</div>

<div class="section-divider"></div>

<div class="basic-grid"
style="grid-template-columns:40mm 1fr 30mm 1fr 30mm 1fr;row-gap:6px;">

<div class="basic-label">Date of Birth :</div>
<div class="basic-value">${m.dob || "-"}</div>

<div class="basic-label">Place of Birth :</div>
<div class="basic-value" style="grid-column:4 / span 3;">
${m.place_of_birth || "-"}
</div>

<div class="basic-label">Sex :</div>
<div class="basic-value">${m.sex || "-"}</div>

<div class="basic-label">Marital Status :</div>
<div class="basic-value">${m.marital_status || "-"}</div>

<div class="basic-label">Blood Group :</div>
<div class="basic-value">${m.blood_group || "-"}</div>

<div class="basic-label">Profession :</div>
<div class="basic-value">${m.profession || "-"}</div>

<div class="basic-label"></div>
<div class="basic-value"></div>

<div class="basic-label">Qualification :</div>
<div class="basic-value">${m.qualification || "-"}</div>

</div>

<div class="section-divider"></div>

<div class="basic-grid"
style="grid-template-columns:40mm 1fr 14mm 1fr 30mm 1fr;row-gap:6px;">

<div class="basic-label">Confirmation Date :</div>
<div class="basic-value">${m.confirmation_date || "-"}</div>

<div class="basic-label">Place :</div>
<div class="basic-value fixed-box">${m.confirmation_place || "-"}</div>

<div class="basic-label">By Whom :</div>
<div class="basic-value">${m.confirmation_by || "-"}</div>

<div class="basic-label">Baptism Date :</div>
<div class="basic-value">${m.baptism_date || "-"}</div>

<div class="basic-label">Place :</div>
<div class="basic-value fixed-box">${m.baptism_place || "-"}</div>

<div class="basic-label">By Whom :</div>
<div class="basic-value">${m.baptism_by || "-"}</div>

<div class="basic-label">Marriage Date :</div>
<div class="basic-value">${m.marriage_date || "-"}</div>

<div class="basic-label">Place :</div>
<div class="basic-value" style="grid-column:4 / span 3;">
${m.marriage_place || "-"}
</div>

</div>

<div class="section-divider"></div>

<div class="basic-grid"
style="grid-template-columns:40mm 1fr 14mm 1fr 30mm 1fr;row-gap:6px;">

<div class="basic-label">Membership From :</div>
<div class="basic-value">${m.membership_from || "-"}</div>

<div class="basic-label">Status :</div>
<div class="basic-value">${m.status || "-"}</div>

<div class="basic-label">Category :</div>
<div class="basic-value">${m.category || "-"}</div>

</div>

</div>
</div>
`;

const printMembers = (members) => {

const printWindow = window.open("", "", "width=900,height=1000");

let pages = "";

members.forEach(m => {
pages += template(m) + `<div style="page-break-after:always"></div>`;
});

printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>

<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil&display=swap" rel="stylesheet">

<style>

@page{
size:A4;
margin:16mm 14mm;
}

body{
margin:0;
font-family:"Noto Sans Tamil",sans-serif;
font-size:14px;
line-height:1.35;
}

.page-wrapper{
height:297mm;
width:210mm;
box-sizing:border-box;
}

.content-area{
flex-grow:1;
}

.fixed-box{
min-height:17mm;
max-height:17mm;
overflow:hidden;
white-space:normal;
word-break:break-word;
}

.header{
text-align:center;
position:relative;
padding-top:6mm;
}

.header h1{
margin:0;
font-size:22px;
}

.header p{
margin:2px 0;
}

.header .title{
margin-top:6px;
font-weight:bold;
}

.photo{
position:absolute;
top:12mm;
right:1mm;
width:26mm;
height:26mm;
border:1px solid #000;
}

.photo img{
width:100%;
height:100%;
object-fit:cover;
}

.section-divider{
border-top:1px solid #000;
margin:8mm 0;
}

.basic-grid{
display:grid;
grid-template-columns:40mm 1fr 30mm 1fr;
row-gap:6px;
column-gap:1mm;
}

.basic-label{
font-weight:bold;
text-align:right;
}

.basic-value{
padding-left:2mm;
}

.wrap-text{
white-space:normal;
word-break:break-word;
line-height:1.4;
}

</style>

</head>

<body>

${pages}

</body>
</html>
`);

printWindow.document.close();

printWindow.onload = () => {
printWindow.print();
};

};

return null;
};

export default MemberDetailedPrintModal;