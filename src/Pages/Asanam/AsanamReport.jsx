import React, { useEffect, useState } from "react";
import axios from "axios";
import { URL } from "../../App";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaPrint } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";
import AsanamReportPrintModal from "./AsanamReportPrintModal";
import SmallSizedModal from "../../Components/Expense/SmallSizedModal";

export const AsanamReport = () => {

    const currentYear = new Date().getFullYear();

    const [searchTerm,setSearchTerm] = useState("");

    const [year,setYear] = useState(currentYear);
    const [data,setData] = useState([]);
    const [sortType,setSortType] = useState("");

const [isPrintModalOpen,setIsPrintModalOpen] = useState(false);
const [isDownloadModalOpen,setIsDownloadModalOpen] = useState(false);

const [totalData,setTotalData]=useState(null);
const [isTotalModalOpen,setIsTotalModalOpen]=useState(false);

const [startDate,setStartDate] = useState("");
const [endDate,setEndDate] = useState("");

    const token = sessionStorage.getItem("token");


     //////////////////////////////////////////////////
     // LOAD DATA
     //////////////////////////////////////////////////

    const loadData = async()=>{

        try{
            const res = await axios.get(
                `${URL}/asanam-report/${year}`,
                    {
                    params:{
                    search: searchTerm,startDate,
                    endDate
                    },
                    headers:{
                    Authorization:token
                    }
                }
            );
            setData(res.data.data || []);
        }
        catch(err){
            console.log("Asanam Report Error:",err);
            setData([]);
        }
    };

useEffect(()=>{
loadData();
},[year,searchTerm,startDate,endDate]);

     //////////////////////////////////////////////////
     // SORTING
     //////////////////////////////////////////////////

const sortedData = [...data].sort((a,b)=>{

    // MEMBER ID SORT
    if(sortType==="id"){
        return a.member_id.localeCompare(b.member_id);
    }
    // MEMBER NAME SORT
    if(sortType==="name"){
        return a.member_name.localeCompare(b.member_name);
    }
    // ZONE SORT BY ID
    if(sortType==="zone (By ID)"){
        if(a.zone_name===b.zone_name){
                return a.member_id.localeCompare(b.member_id);
        }
        return a.zone_name.localeCompare(b.zone_name);
    }
    // ZONE SORT BY NAME
    if(sortType==="zone (By Name)"){
        if(a.zone_name===b.zone_name){
                return a.member_name.localeCompare(b.member_name);
        }
        return a.zone_name.localeCompare(b.zone_name);
    }
    return 0;
});

//////////////////////////////////////////////////
// download
//////////////////////////////////////////////////

const downloadAsanamPDF = async () => {
    try {
        const res = await axios.get(
        `${URL}/asanam-report/pdf/download`,
        {
            params: {
            year,
            sortType,
            },
            headers: {
            Authorization: token,
            },
            responseType: "blob",
        }
        );

        const url = window.URL.createObjectURL(
        new Blob([res.data])
        );

        const link = document.createElement("a");

        link.href = url;

        link.setAttribute(
        "download",
        `Asanam-Report-${year}.pdf`
        );

        document.body.appendChild(link);

        link.click();

        link.remove();
    } catch (err) {
        console.log("Download Error:", err);
    }
};

const downloadTotalPDF = async () => {

try{

const res = await axios.get(

`${URL}/asanam-report/total/pdf`,

{
params:{ year },
headers:{ Authorization: token },
responseType:"blob"
}

);

const url = window.URL.createObjectURL(
new Blob([res.data])
);

const link = document.createElement("a");

link.href = url;

link.setAttribute(
"download",
`Asanam-Total-${year}.pdf`
);

document.body.appendChild(link);

link.click();

link.remove();

}
catch(err){

console.log("Total PDF Error:",err);

}

};


const loadTotal = async()=>{

try{

const res = await axios.get(

`${URL}/asanam-report/total/${year}`,

{
headers:{Authorization:token}
}

);

setTotalData(res.data);

setIsTotalModalOpen(true);

}

catch(err){

console.log(err);

}

};


    
    return (
        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">

<div className="flex justify-between items-center mb-3">
    {/* LEFT SIDE TITLE */}
    <h1 className="text-lg font-semibold">
        Asanam Report
    </h1>

    {/* RIGHT SIDE ICONS */}
    <div className="flex items-center gap-3">
<button
onClick={downloadTotalPDF}
className="px-3 py-1 text-sm bg-lavender--600 text-white rounded"
>
Total
</button>

    <FiDownload
        size={20}
        className="text-lavender--600 cursor-pointer"
        title="Download"
        onClick={downloadAsanamPDF}
    />

    <FaPrint
        size={20}
        className="text-lavender--600 cursor-pointer"
        title="Print"
        onClick={()=>setIsPrintModalOpen(true)}
    />

    </div>
</div>


{/* TOP BAR */}
<div className="flex items-center justify-between p-2">

{/* LEFT — SEARCH */}
<div className="relative">

<div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">

<svg
className="w-3 h-3 text-gray-500"
xmlns="http://www.w3.org/2000/svg"
fill="none"
viewBox="0 0 20 20"
>

<path
stroke="currentColor"
strokeWidth="2"
d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
/>

</svg>

</div>

<input
type="search"
placeholder="Search Name / ID / Zone"
value={searchTerm}
onChange={(e)=>setSearchTerm(e.target.value)}
className="block py-1 text-sm text-gray-900 rounded w-56 ps-8 bg-gray-50"
/>

</div>



{/* CENTER — DATE FILTER */}
<div className="flex items-center gap-3">

<label className="text-sm font-medium text-gray-600">
From
</label>

<input
type="date"
value={startDate}
onChange={(e)=>setStartDate(e.target.value)}
className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 border border-gray-300"
/>


<label className="text-sm font-medium text-gray-600">
To
</label>

<input
type="date"
value={endDate}
onChange={(e)=>setEndDate(e.target.value)}
className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 border border-gray-300"
/>

</div>



{/* RIGHT — FILTER + YEAR */}
<div className="flex items-center gap-4">


<select
value={sortType}
onChange={(e)=>setSortType(e.target.value)}
className="border px-3 py-1 rounded text-sm"
>

<option value="">Default Filter</option>

<option value="id">Member ID</option>

<option value="name">Member Name</option>

<option value="zone (By ID)">Zone (By ID)</option>

<option value="zone (By Name)">Zone (By Name)</option>

</select>



<div className="flex items-center gap-2">

<button
onClick={()=>setYear(year-1)}
className="p-2 hover:bg-gray-100 rounded"
>
<FaChevronLeft size={14}/>
</button>

<div className="text-lg font-semibold">
{year}
</div>

<button
disabled={year===currentYear}
onClick={()=>setYear(year+1)}
className={`p-2 rounded ${
year===currentYear
?
"opacity-40 cursor-not-allowed"
:
"hover:bg-gray-100"
}`}
>
<FaChevronRight size={14}/>
</button>

</div>


</div>

</div>


            {/* NO DATA */}
            {data.length===0 && (
                <div className="text-center text-gray-400 mt-20">
                        No Asanam Report
                </div>
            )}


            {/* TABLE */}
            {data.length>0 && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-gray-500">
                        <thead className="text-base text-gray-700 border-b">
                            <tr>
                                <th className="p-2 text-center">
                                    SI NO
                                </th>
                                <th className="p-2 text-center">
                                    Member ID
                                </th>
                                <th className="p-2 text-center">
                                    Member Name
                                </th>
                                <th className="p-2 text-center">
                                    Zone
                                </th>
                                <th className="p-2 text-center">
                                    Goat Amount
                                </th>
                                <th className="p-2 text-center">
                                    Rice Bag
                                </th>
                                <th className="p-2 text-center">
                                    Asanam Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData.map((item,index)=>(
                                <tr key={index} className="border-b">
                                    <td className="p-2 text-center">
                                        {index+1}
                                    </td>
                                    <td className="p-2 text-center">
                                        {item.member_id}
                                    </td>
                                    <td className="p-2 text-left">
                                        {item.member_name}
                                    </td>
                                    <td className="p-2 text-left">
                                        {item.zone_name || "-"}
                                    </td>
                                    <td className="p-2 text-center">
                                        ₹ {item.goat_total || 0}
                                    </td>
                                    <td className="p-2 text-center">
                                        ₹ {item.rice_total || 0}
                                    </td>
                                    <td className="p-2 text-center">
                                        ₹ {item.asanam_amount || 0}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

<SmallSizedModal
    isOpen={isTotalModalOpen}
    onClose={() => setIsTotalModalOpen(false)}
    title={`${year} அசன பண்டிகை வரவு சுருக்கம்`}
>
    {totalData && (
        <table className="w-full text-sm border">
        <thead>
            <tr className="border-b">
            <th className="text-left font-bold text-xl">
                Asanam Collection - {year}
            </th>
            <th className="text-center font-bold text-xl">
                AMOUNT
            </th>
            </tr>
        </thead>
        <tbody>
            <tr className="border-b">
            <td>
                CASH - RICE {totalData.riceTotal} X {totalData.ricePrice}
            </td>
            <td className="text-center">
                {totalData.riceTotal * totalData.ricePrice}
            </td>
            </tr>
            <tr className="border-b">
            <td>
                CASH - GOAT {totalData.goatTotal} X {totalData.goatPrice}
            </td>
            <td className="text-center">
                {totalData.goatTotal * totalData.goatPrice}
            </td>
            </tr>
            <tr className="border-b">
            <td>
                CASH
            </td>
            <td className="text-center">
                {totalData.cashTotal}
            </td>
            </tr>
            <tr className="border-b">
            <td>
                TIFFIN BOX COLLECTION {totalData.tiffinQty} X {totalData.tiffinPrice}
            </td>
            <td className="text-center">
                {totalData.tiffinAmount}
            </td>
            </tr>
            <tr className="border-b">
            <td>
                UNIFORM {totalData.uniformQty} X {totalData.uniformRate}
            </td>
            <td className="text-center">
                {totalData.uniformAmount}
            </td>
            </tr>
            <tr className="font-bold">
            <td>
                TOTAL INCOME
            </td>
            <td className="text-center">
                {totalData.grandTotal}
            </td>
            </tr>
        </tbody>
        </table>
    )}
</SmallSizedModal>

<AsanamReportPrintModal
isOpen={isPrintModalOpen}
onClose={()=>setIsPrintModalOpen(false)}
year={year}
sortType={sortType}
searchTerm={searchTerm}
/>

        </div>
    );
};