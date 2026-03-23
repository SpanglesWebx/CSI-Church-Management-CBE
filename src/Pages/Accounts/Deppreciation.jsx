import React, { useState, useEffect } from "react";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FaPlus } from "react-icons/fa";
// import Pagination from "../../Components/Helpers/Pagination";  // ⭐ ADD THIS
import axios from "axios"; 
import { URL } from "../../App"; 
import { Download } from "lucide-react"; 
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage"; 

export const Deppreciation = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

const [list, setList] = useState([]);
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const rowsPerPage = 25;
const token = sessionStorage.getItem("token");


  const [ledgerCode, setLedgerCode] = useState("");
  const [ledgerName, setLedgerName] = useState("");
  const [date, setDate] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [depreciation, setDepreciation] = useState("");

const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");
const [Response, setResponse] = useState({ status: null, message: "" });


  // allow only numbers
  const onlyNumber = (value) => value.replace(/\D/g, "");

  const handleSave = () => {
    console.log({
      ledgerCode,
      ledgerName,
      date,
      openingBalance,
      depreciation,
    });

    // later API call here
    setIsModalOpen(false);
  };

//format YYYY-MM-DD → DD/MM/YYYY
const formatDate = (date) => {
  if (!date) return "";

  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
};

// get financial year start (01-04-yyyy)
const getFinancialYearStart = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = today.getMonth() + 1; // Jan = 1

  // if Jan–Mar → previous year FY
  const fyStartYear = month <= 3 ? year - 1 : year;

  // return YYYY-MM-DD (for input type="date")
  return `${fyStartYear}-04-01`;
};

const fetchDepreciation = async () => {
if (!fromDate || !toDate) return;

try {
  const res = await axios.get(
    `${URL}/depreciation/report`,
    {
      headers: { Authorization: token },
      params: {
        from: fromDate,
        to: toDate,
        page: currentPage,
        limit: rowsPerPage
      }
    }
  );

  setList(res.data.data || []);
  setTotalPages(res.data.totalPages || 1);

} catch (err) {
  setResponse({ status: "Failed", message: "Failed to fetch depreciation" });
}
};

const downloadDepreciation = async () => {
try {
  const res = await axios.get(
    `${URL}/depreciation/pdf`,
    {
      headers: { Authorization: token },
      params: { from: fromDate, to: toDate },
      responseType: "arraybuffer"
    }
  );

  const blob = new Blob([res.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `Depreciation-${fromDate}-to-${toDate}.pdf`;
  link.click();

  window.URL.revokeObjectURL(url);

  setResponse({ status: "Success", message: "PDF Downloaded" });

} catch (err) {
  setResponse({ status: "Failed", message: "Download failed" });
}
};



useEffect(() => {
if (fromDate && toDate) {
  fetchDepreciation();
}
}, [currentPage, fromDate, toDate]);



  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
<div className="flex justify-between items-center">
<h1 className="text-lg font-semibold">Depreciation</h1>
</div>

{/* DATE FILTER */}
<div className="flex flex-wrap items-center gap-3 mt-4">

<label className="font-medium">From</label>
<input
type="date"
value={fromDate}
onChange={(e) => setFromDate(e.target.value)}
className="border rounded px-3 py-1"
/>

<label className="font-medium">To</label>
<input
type="date"
value={toDate}
onChange={(e) => setToDate(e.target.value)}
className="border rounded px-3 py-1"
/>

{fromDate && toDate && (
<button
onClick={downloadDepreciation}
className="ml-auto px-3 py-2 bg-lavender--600 text-white rounded flex items-center gap-2"
>
<Download size={16} /> Download
</button>
)}

</div>

<div className="overflow-x-auto mt-4">
<table className="w-full text-sm border">

<thead className="bg-gray-100">
<tr>
<th className="border p-2">PARTICULARS</th>
<th className="border p-2 text-center">
W.D.V AS ON ({formatDate(fromDate)})
</th>
<th className="border p-2 text-center">ADDITIONS</th>
<th className="border p-2 text-center">DELETIONS</th>
<th className="border p-2 text-center">GROSS BLOCK</th>
<th className="border p-2 text-center">DEPR. RATE</th>
<th className="border p-2 text-center">DEPR. AMOUNT</th>
<th className="border p-2 text-center">
W.D.V AS ON ({formatDate(toDate)})
</th>
</tr>
</thead>


<tbody>

{list.length === 0 && (
<tr>
<td colSpan="8" className="text-center p-3">
No records
</td>
</tr>
)}

{list.map((row, i) => {

  // ✅ CATEGORY ROW
  if (row.type === "category") {
    return (
      <tr key={i} className="bg-gray-200 font-bold">
        <td className="border p-2">{row.categoryName}</td>
        <td className="border p-2"></td>
        <td className="border p-2"></td>
        <td className="border p-2"></td>
        <td className="border p-2"></td>
        <td className="border p-2"></td>
        <td className="border p-2"></td>
        <td className="border p-2"></td>
      </tr>
    );
  }

  // ✅ LEDGER ROW
  if (row.type === "ledger") {
    return (
      <tr key={i}>
        <td className="border p-2 pl-8">{row.ledgerName}</td>
        <td className="border p-2 text-center">{row.wdvOpening}</td>
        <td className="border p-2 text-center">{row.additions || "-"}</td>
        <td className="border p-2 text-center">{row.deletions || "-"}</td>
        <td className="border p-2 text-center">{row.grossBlock || "-"}</td>
        <td className="border p-2 text-center">
          {row.deprRate ? `${row.deprRate}%` : "-"}
        </td>
        <td className="border p-2 text-center">{row.deprAmount || "-"}</td>
        <td className="border p-2 text-center">{row.wdvClosing}</td>
      </tr>
    );
  }

  // ✅ GROUP TOTAL ROW
  if (row.type === "total") {
    return (
      <tr key={i} className="font-semibold bg-gray-50">
        <td className="border p-2">Group Total</td>
        <td className="border p-2 text-center">{row.total}</td>
        <td className="border p-2"></td>
        <td className="border p-2"></td>
        <td className="border p-2"></td>
        <td className="border p-2"></td>
        <td className="border p-2"></td>
        <td className="border p-2"></td>
      </tr>
    );
  }

  return null;

})}

</tbody>
</table>

{/* <Pagination
currentPage={currentPage}
totalPages={totalPages}
rowsPerPage={rowsPerPage}
setCurrentPage={setCurrentPage}
/> */}

</div>
      </div>
{Response.status &&
(Response.status === "Success" ? (
<SuccessMessage Message={Response.message} />
) : (
<FailedMessage Message={Response.message} />
))}

    </>
  );
};
