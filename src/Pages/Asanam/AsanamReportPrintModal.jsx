import { useEffect } from "react";
import axios from "axios";
import { URL } from "../../App";

const AsanamReportPrintModal = ({
isOpen,
onClose,
year,
sortType,
searchTerm
}) => {

useEffect(()=>{

if(!isOpen) return;

loadAndPrint();

onClose();

},[isOpen]);

//////////////////////////////////////////////////
// LOAD DATA
//////////////////////////////////////////////////

const loadAndPrint = async()=>{

try{

const res = await axios.get(

`${URL}/asanam-report/${year}`,

{
params:{
search:searchTerm
},
headers:{
Authorization:sessionStorage.getItem("token")
}
}

);

let data = res.data.data || [];

//////////////////////////////////////////////////
// SORTING (EXACT SAME AS PDF)
//////////////////////////////////////////////////

if (sortType === "id") {
data.sort((a,b)=>
a.member_id.localeCompare(b.member_id)
);
}

if (sortType === "name") {
data.sort((a,b)=>
a.member_name.localeCompare(b.member_name)
);
}

if (sortType === "zone (By ID)") {
data.sort((a,b)=>{
if(a.zone_name===b.zone_name){
return a.member_id.localeCompare(b.member_id);
}
return (a.zone_name||"").localeCompare(b.zone_name||"");
});
}

if (sortType === "zone (By Name)") {
data.sort((a,b)=>{
if(a.zone_name===b.zone_name){
return a.member_name.localeCompare(b.member_name);
}
return (a.zone_name||"").localeCompare(b.zone_name||"");
});
}

//////////////////////////////////////////////////
// TAMIL TITLE FORMAT (SAME AS PDF)
//////////////////////////////////////////////////

const formatTamilTitle = (title)=>{

if(!title) return "";

const t = title.trim();

if(t==="மிஸ்டர்") return "திரு";
if(t==="மிஸ்") return "செல்வி";
if(t==="மிசஸ்") return "திருமதி";
if(t==="மாஸ்டர்") return "செல்வன்";

return t;

};

//////////////////////////////////////////////////
// BUILD ROWS (EXACT SAME AS PDF)
//////////////////////////////////////////////////

let rows="";

let currentZone="";

data.forEach(m=>{

const title = formatTamilTitle(
m.member_tamil_title
);

// Tamil fallback
const finalName =
m.member_tamil_name &&
m.member_tamil_name.trim()!==""
? m.member_tamil_name
: m.member_name || "";

const name =
title
? `${title}. ${finalName}`
: `${finalName}`;



//////////////////////////////////////////////////
// ZONE HEADER (IMPORTANT)
//////////////////////////////////////////////////

if(

(sortType==="zone (By ID)" ||
sortType==="zone (By Name)") &&

currentZone!==m.zone_name

){

currentZone=m.zone_name;

rows+=`

<tr>
<td colspan="5"
style="
font-size:14px;
font-weight:bold;
padding-top:10px;
">
${currentZone}
</td>
</tr>

`;

}



//////////////////////////////////////////////////
// DATA ROW
//////////////////////////////////////////////////

rows+=`

<tr>
<td>${name}</td>
<td>${m.zone_name || "-"}</td>
<td class="center">${m.asanam_amount || 0}</td>
<td class="center">${m.rice_count || 0}</td>
<td class="center">${m.goat_count || 0}</td>
</tr>

`;

});

//////////////////////////////////////////////////
// TEMPLATE (SAME AS SERVER)
//////////////////////////////////////////////////

const template = `

<!DOCTYPE html>
<html lang="ta">

<head>

<meta charset="UTF-8" />

<link
href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil&display=swap"
rel="stylesheet"
/>

<style>

@page{
size:A4;
margin:8mm;
}

body{
font-family:"Noto Sans Tamil",sans-serif;
font-size:11px;
margin:0;
}

.page-border{
position:fixed;
top:5mm;
bottom:5mm;
left:5mm;
right:5mm;
border:2px solid black;
padding:8mm;
box-sizing:border-box;
}

.center{
text-align:center;
}

.sub_header{
text-align:center;
font-size:20px;
font-weight:bold;
margin:6px 0;
padding:6px 0;
background:#e6e6e6;
border:1px solid #777;
border-radius:4px;
}

.header{
text-align:center;
line-height:1.4;
}

.hr{
border-top:1px solid black;
margin:10px 0;
}

table{
width:100%;
border-collapse:collapse;
margin-top:5px;
}

thead tr{
border-bottom:1px solid black;
}

th,td{
padding:6px 4px;
}

.report th:nth-child(1),
.report td:nth-child(1){
width:40%;
}

.report th:nth-child(2),
.report td:nth-child(2){
width:20%;
}

.report th:nth-child(3),
.report td:nth-child(3){
width:15%;
text-align:center;
}

.report th:nth-child(4),
.report td:nth-child(4){
width:12%;
text-align:center;
}

.report th:nth-child(5),
.report td:nth-child(5){
width:13%;
text-align:center;
}

</style>

</head>

<body>

<div class="page-border">

<div class="header">

<h3>

C.S.I. கிறிஸ்துநாதர் ஆலயம்<br>

1558, திருச்சி ரோடு, கோவை - 18.<br>

Phone : 0422 - 2305155<br>

E-mail : christchurchcbe@gmail.com |
Web : www.Christchurchcbe.org

</h3>

</div>

<div class="sub_header">

<b>

${year} ம் ஆண்டு அசன நன்கொடையாளர்கள்

</b>

</div>

<div class="hr"></div>

<table class="report">

<thead>

<tr>

<th>பெயர்</th>
<th>இடம்</th>
<th class="center">ரொக்கம்</th>
<th class="center">அரிசி</th>
<th class="center">கிடா</th>

</tr>

</thead>

<tbody>

${rows}

</tbody>

</table>

</div>

</body>

</html>

`;

//////////////////////////////////////////////////
// PRINT
//////////////////////////////////////////////////

const printWindow = window.open("","","width=900,height=1000");

printWindow.document.write(template);

printWindow.document.close();

printWindow.onload=()=>{

printWindow.focus();

setTimeout(()=>{

printWindow.print();
printWindow.close();

},300);

};

}
catch(err){

console.log("Print Error:",err);

}

};

return null;

};

export default AsanamReportPrintModal;