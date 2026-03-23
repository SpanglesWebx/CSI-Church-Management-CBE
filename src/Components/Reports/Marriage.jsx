import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useReactToPrint } from 'react-to-print';
import ReactPaginate from 'react-paginate';
import moment from 'moment';
import './pagination.css'; // Ensure this path is correct
import { notoSansTamil } from '../../../NotoSansTamil';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import down from './icon/downloade.svg';
import print from './icon/print.svg';
import { FailedMessage, SuccessMessage } from '../ToastMessage';
import { jwtDecode } from "jwt-decode";

import SmallSizedModal from "../Expense/SmallSizedModal";
import MarriageIndividualModal from "./MarriageIndividualModal";

const URL = import.meta.env.VITE_BACKEND_API_URL;

const tableHeading = [
  'Sl. no.',
  'Member ID',
  'Member Name',
  'Member Tamil Name',
  'Marriage Date',
];

const ReportPage = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); // Zero-based index for pagination
  const [itemsPerPage] = useState(10);
  const [filteredData, setFilteredData] = useState([]);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const componentRef = useRef();
  const [showTamilOnly, setShowTamilOnly] = useState(false);
  const [total, setTotal] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
const [downloadProgress, setDownloadProgress] = useState(0);
const [Response, setResponse] = useState({ status: null, message: "" });

const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
const [printMode, setPrintMode] = useState("");

const [fromSI, setFromSI] = useState("");
const [toSI, setToSI] = useState("");

const [isIndividualPrint, setIsIndividualPrint] = useState(false);

const [totalCount, setTotalCount] = useState(0);


const token = window.sessionStorage.getItem("token");
    const [userRole, setUserRole] = useState("");
  
    useEffect(() => {
    if (!token) return;
  
    try {
      const decoded = jwtDecode(token);
      console.log("Decoded roles:", decoded.roles);
  
      // If multiple roles exist, pick the active/stored one
      const storedRole = sessionStorage.getItem("role");
  
      if (storedRole && decoded.roles?.includes(storedRole)) {
        setUserRole(storedRole);
      } else {
        setUserRole(decoded.roles?.[0] || "");
      }
    } catch (err) {
      console.error("Invalid token", err);
    }
  }, [token]);



const showToast = (status, message) => {
  setResponse({ status: null, message: "" });
  setTimeout(() => setResponse({ status, message }), 10);
  setTimeout(() => setResponse({ status: null, message: "" }), 3000);
};


  // AbortController reference
  const abortControllerRef = useRef(new AbortController());


const sortMarriageData = (list = []) => {

  return [...list].sort((a, b) => {

    const da = moment(a.marriage_date).format("MM-DD");
    const db = moment(b.marriage_date).format("MM-DD");

    if (da !== db) return da.localeCompare(db);

    const nameA = (a.husband_name || a.wife_name || "").trim();
    const nameB = (b.husband_name || b.wife_name || "").trim();

    return nameA.localeCompare(nameB);
  });

};


  // Fetch data function with AbortController
  const fetchData = async (signal) => {
    try {
      let from = dateRange.from;
      let to = dateRange.to;

      // 🔥 Default to NEXT WEEK if empty
      // if (!from || !to) {
      //   const today = moment();
      //   const nextMonday = today.clone().add(1, "week").startOf("isoWeek");
      //   const nextSunday = nextMonday.clone().endOf("isoWeek");
      //   from = nextMonday.format("YYYY-MM-DD");
      //   to = nextSunday.format("YYYY-MM-DD");
      //   setDateRange({ from, to });
      //   return; // ⛔ STOP FIRST CALL (prevents double fetch)
      // }

// require manual date selection
if (!from || !to) {
  setData([]);
  setFilteredData([]);
  setTotal(0);
  return;
}



      const response = await axios.get(`${URL}/reports/marriage`, {
        params: {
          fromdate: from,
          todate: to,
          search: searchTerm || undefined,
          page: currentPage + 1,
          limit: 10000,
        },
        signal,
      });

const sorted = sortMarriageData(response.data.Marriage || []);

setData(sorted);
setFilteredData(sorted);
setTotal(sorted.length);

    } catch (error) {
      if (!axios.isCancel(error)) console.error("Marriage fetch error:", error);
    }
  };


  // Debounce effect for API calls
  const debounceFetchData = useRef(null);

  useEffect(() => {
    abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    fetchData(controller.signal);
  }, [currentPage, searchTerm, dateRange]);


useEffect(() => {
  setTotalCount(data.length);
}, [data]);


  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });





const downloadMarriagePDF = async () => {
  try {
    setIsDownloading(true);
    setDownloadProgress(0);

    const res = await axios.get(
      `${URL}/member-reports-pdf/marriage/pdf`,
      {
        params: {
          fromdate: dateRange.from,
          todate: dateRange.to,
          search: searchTerm,
        },
        responseType: "arraybuffer",
        onDownloadProgress: (e) => {
          if (e.total) {
            setDownloadProgress(
              Math.round((e.loaded * 100) / e.total)
            );
          }
        },
      }
    );

    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "MarriageReport.pdf";
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    showToast("Success", "Marriage PDF downloaded");
  } catch (err) {
    showToast("Failed", "Marriage PDF download failed");
  } finally {
    setIsDownloading(false);
    setDownloadProgress(0);
  }
};


const offset = currentPage * itemsPerPage;

const currentPageData = data.slice(
  offset,
  offset + itemsPerPage
);



  return (
    <>
<div className="relative h-auto ml-5 w-[100%] bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-lavender--600">
            Marriage Reports
          </h2>
          <FormControlLabel
            control={
              <Checkbox
                checked={showTamilOnly}
                onChange={(e) => setShowTamilOnly(e.target.checked)}
              />
            }
            label="Tamil Names Only"
          />
           {userRole !== "churchofficeworker" && (
          <div className="flex gap-x-5">
            <button
              onClick={downloadMarriagePDF}
              className="mr-4 text-blue-600 cursor-pointer hover:text-blue-800"
            >
              <img src={down} />
            </button>
<button
  onClick={() => setIsPrintModalOpen(true)}
  className="text-green-600 cursor-pointer hover:text-green-800"
>
  <img src={print} />
</button>
          </div>)}
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div>
            <label className="block mb-1 text-gray-600">From</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange({ ...dateRange, from: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-600">To</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange({ ...dateRange, to: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-600">Search</label>
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        <div ref={componentRef} className="overflow-x-auto mt-4">
          <table className="table-fixed w-full text-sm text-gray-500">
            <thead>
              <tr>
                <th className="w-[5%] px-2 py-2 text-center border-b text-base text-gray-700 bg-white">Sl. No.</th>
                <th className="w-[21%] px-2 py-2 border-b text-center text-base text-gray-700 bg-white">Husband Name</th>
                <th className="w-[19%] px-2 py-2 border-b text-center text-base text-gray-700 bg-white">Tamil Name</th>
                <th className="w-[21%] px-2 py-2 border-b text-center text-base text-gray-700 bg-white">Wife Name</th>
                <th className="w-[19%] px-2 py-2 border-b text-center text-base text-gray-700 bg-white">Tamil Name</th>
                <th className="w-[15%] px-2 py-2 text-center border-b text-base text-gray-700 bg-white">Marriage Date</th>
                <th className="w-[10%] px-2 py-2 text-center border-b text-base text-gray-700 bg-white">
                  Years
                </th>
              </tr>
            </thead>




            <tbody>
              {currentPageData.map((item, index) => (
                <tr key={index} className="text-sm font-medium text-gray-900">

                  <td className="w-[5%] px-3 py-2 text-center">
                    {offset + index + 1}
                  </td>

                  <td className="w-[21%] px-3 py-2 break-words whitespace-normal">
                    {item.husband_name}
                  </td>

                  <td className="w-[19%] px-3 py-2 break-words whitespace-normal">
                    {item.husband_tamil_name}
                  </td>

                  <td className="w-[21%] px-3 py-2 break-words whitespace-normal">
                    {item.wife_name}
                  </td>

                  <td className="w-[19%] px-3 py-2 break-words whitespace-normal">
                    {item.wife_tamil_name}
                  </td>

                  <td className="w-[15%] px-3 py-2 text-center">
                    {moment(item.marriage_date).format("DD-MM-YYYY")}
                  </td>

<td className="w-[10%] px-3 py-2 text-center">
  {moment().diff(moment(item.marriage_date), "years")}
</td>

                </tr>
              ))}
            </tbody>



          </table>
        </div>

        <br />
        <div className="flex items-center justify-center">
          <ReactPaginate
            previousLabel={'<'}
            nextLabel={'>'}
            breakLabel={'...'}
            pageCount={Math.ceil(total / itemsPerPage)}
            marginPagesDisplayed={1}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={'pagination'}
            pageClassName={'page-item'}
            pageLinkClassName={'page-link'}
            previousClassName={'page-item'}
            previousLinkClassName={'page-link'}
            nextClassName={'page-item'}
            nextLinkClassName={'page-link'}
            breakClassName={'page-item'}
            breakLinkClassName={'page-link'}
            activeClassName={'active'}
            forcePage={currentPage}
          />
        </div>
      </div>

      {isDownloading && (
  <div className="fixed inset-0 bg-black/40 z-50 flex flex-col items-center justify-center">
    <div className="w-14 h-14 border-4 border-lavender--600 border-t-transparent rounded-full animate-spin"></div>
    <p className="text-white mt-4 text-sm">
      Started Marriage PDF Download…
    </p>
  </div>
)}

<MarriageIndividualModal
  isOpen={isIndividualPrint}
  onClose={() => setIsIndividualPrint(false)}
  data={data}
  fromSI={fromSI}
  toSI={toSI}
/>


    </div>

<SmallSizedModal
  isOpen={isPrintModalOpen}
  onClose={() => {
    setIsPrintModalOpen(false);
    setPrintMode("");
    setFromSI("");
    setToSI("");
  }}
  title="Print Marriage"
>
  <div className="p-4">

    {!printMode && (
      <>
        <p className="text-center font-medium mb-6">
          Do you want to Print as
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            // onClick={() => setPrintMode("individual")}
            className="px-4 py-2 bg-lavender--600 text-white rounded"
          >
            Print Label
          </button>
          <button
            onClick={() => setPrintMode("individual")}
            className="px-4 py-2 bg-lavender--600 text-white rounded"
          >
            Print Individual
          </button>
        </div>
      </>
    )}

    {printMode === "individual" && (
      <>
        <div className="grid grid-cols-2 gap-6 mt-4 justify-items-center">

          <div>
            <label className="block text-sm font-medium mb-1">
              From (SI No)
            </label>
            <input
              type="text"
              value={fromSI}
              onChange={(e)=>setFromSI(e.target.value.replace(/\D/g,""))}
              className="border p-1 rounded w-24 text-center"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              To (SI No)
            </label>
            <input
              type="text"
              value={toSI}
              onChange={(e)=>setToSI(e.target.value.replace(/\D/g,""))}
              className="border p-1 rounded w-24 text-center"
            />
          </div>

        </div>

<div className="text-center mt-4 font-semibold text-gray-700">
  {fromSI && toSI
    ? `Total ${Math.max(0, Number(toSI) - Number(fromSI) + 1)} Members`
    : `Total ${totalCount} Members`
  }
</div>

        <div className="flex justify-end mt-6">
          <button
            onClick={()=>{
              if(!fromSI || !toSI) return;
              setIsIndividualPrint(true);
            }}
            className="px-4 py-2 bg-lavender--600 text-white rounded"
          >
            Submit
          </button>
        </div>
      </>
    )}

  </div>
</SmallSizedModal>



    {Response.status && (
  Response.status === "Success"
    ? <SuccessMessage Message={Response.message} />
    : <FailedMessage Message={Response.message} />
)}

    </>
    
  );
};

export default ReportPage;
