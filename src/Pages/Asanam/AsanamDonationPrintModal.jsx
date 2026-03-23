import { useEffect } from "react";
import axios from "axios";
import { URL } from "../../App";

const AsanamDonationPrintModal = ({
isOpen,
onClose,
search,
sortType,
startDate,
endDate
})=>{

useEffect(()=>{

if(!isOpen) return;

loadAndPrint();

onClose();

},[isOpen]);

//////////////////////////////////////////////////
// LOAD DATA + PRINT
//////////////////////////////////////////////////

const loadAndPrint = async()=>{

try{

const res = await axios.get(

`${URL}/asanam-donations`,

{
params:{
search,
sort:sortType,
startDate,
endDate
},

headers:{
Authorization:sessionStorage.getItem("token")
}

}

);

let data=res.data || [];

//////////////////////////////////////////////////
// SORTING
//////////////////////////////////////////////////

if(sortType==="name"){
data.sort((a,b)=>a.name.localeCompare(b.name));
}

if(sortType==="place"){
data.sort((a,b)=>(a.place||"").localeCompare(b.place||""));
}

if(sortType==="item"){
data.sort((a,b)=>(a.item||"").localeCompare(b.item||""));
}

//////////////////////////////////////////////////
// BUILD ROWS
//////////////////////////////////////////////////

let rows="";

data.forEach(d=>{

rows+=`

<tr>

<td>${d.tamil_name || d.name}</td>

<td>${d.place_tamil || d.place || "-"}</td>

<td>${d.item}</td>

<td class="center">

${d.quantity || 0} ${d.unit_tamil || ""}

</td>

</tr>

`;

});

//////////////////////////////////////////////////
// TEMPLATE
//////////////////////////////////////////////////

const template=`

<!DOCTYPE html>

<html lang="ta">

<head>

<meta charset="UTF-8"/>

<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil&display=swap" rel="stylesheet"/>

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

.header{

text-align:center;
line-height:1.4;

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

.center{
text-align:center;
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
width:30%;
}

.report th:nth-child(2),
.report td:nth-child(2){
width:25%;
}

.report th:nth-child(3),
.report td:nth-child(3){
width:25%;
}

.report th:nth-child(4),
.report td:nth-child(4){
width:20%;
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

ஆலயத்திற்கு நன்கொடையாக வந்த பொருட்களின் விபரம்

</div>

<table class="report">

<thead>

<tr>

<th>பெயர்</th>

<th>இடம்</th>

<th>பொருட்கள்</th>

<th class="center">அளவு</th>

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
// PRINT WINDOW
//////////////////////////////////////////////////

const printWindow=window.open("","","width=900,height=1000");

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

export default AsanamDonationPrintModal;