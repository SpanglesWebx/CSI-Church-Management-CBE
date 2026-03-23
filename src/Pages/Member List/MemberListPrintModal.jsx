import React, { useEffect } from "react";

const MemberListPrintModal = ({
  isOpen,
  onClose,
  members,
  fromPage,
  toPage,
  rowsPerPage = 35
}) => {

useEffect(() => {

  if (!isOpen || !members?.length) return;

  const startIndex = (fromPage - 1) * rowsPerPage;
  const endIndex = toPage * rowsPerPage;

  const selectedMembers = members.slice(startIndex, endIndex);

  printMembers(selectedMembers, startIndex);

  onClose();

}, [isOpen]);


const printMembers = (members, startIndex) => {

const rowsPerPage = 35; // change here

const printWindow = window.open("", "", "width=900,height=1000");

let pagesHTML = "";

for (let i = 0; i < members.length; i += rowsPerPage) {

  const pageMembers = members.slice(i, i + rowsPerPage);

  let rows = "";

  pageMembers.forEach((m, index) => {
    rows += `
<tr>
<td>${startIndex + i + index + 1}</td>
<td>${m.member_id}</td>
<td>${m.member_name}</td>
<td>${m.member_tamil_name || "-"}</td>
<td>${m.status}</td>
</tr>
`;
  });

  pagesHTML += `
<div class="print-page">

<h3 style="text-align:center">Members List</h3>

<table>

<thead>
<tr>
<th>Sl No</th>
<th>Member ID</th>
<th>Member Name</th>
<th>Member Tamil Name</th>
<th>Status</th>
</tr>
</thead>

<tbody>
${rows}
</tbody>

</table>

</div>
<div class="page-break"></div>
`;

}

printWindow.document.write(`

<!DOCTYPE html>
<html>
<head>

<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil&display=swap" rel="stylesheet">

<style>

body{
font-family:"Noto Sans Tamil",sans-serif;
font-size:12px;
margin:20px;
}

table{
width:100%;
border-collapse:collapse;
}

th{
background:#6c5ce7;
color:white;
padding:8px;
}

td{
padding:6px;
border-bottom:1px solid #ddd;
}

.page-break{
page-break-after:always;
}

</style>

</head>

<body>

${pagesHTML}

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

export default MemberListPrintModal;