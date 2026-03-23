import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useReactToPrint } from 'react-to-print';
import ReactPaginate from 'react-paginate';
import moment from 'moment';
import './pagination.css'; // Ensure this path is correct
import { notoSansTamil } from '../../../NotoSansTamil';
const URL = import.meta.env.VITE_BACKEND_API_URL;
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import down from './icon/downloade.svg'
import print from './icon/print.svg'
import { FailedMessage, SuccessMessage } from '../ToastMessage';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

import BirthdayPreviewModal from "./BirthdayPreviewModal";
import SmallSizedModal from "../Expense/SmallSizedModal";

import BirthdayIndividualModal from "./BirthdayIndividualModal";



const tableHeading = [
  'Sl. no.',
  'Member ID',
  'Member Name',
  'Member Tamil Name',
  'DOB',
  'Status',
];

const ReportPage = () => {
  const [Response, setResponse] = useState({ status: null, message: "" });
  const token = window.sessionStorage.getItem("token");
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
    const [userRole, setUserRole] = useState("");

const [isPreviewOpen, setIsPreviewOpen] = useState(false);
const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
const [printMode, setPrintMode] = useState(""); // "list" | "individual"

const [fromSI, setFromSI] = useState("");
const [toSI, setToSI] = useState("");
const [totalCount, setTotalCount] = useState(0);
const [previewData, setPreviewData] = useState([]);
const [allBirthdayData, setAllBirthdayData] = useState([]);
const [isLoadingPreview, setIsLoadingPreview] = useState(false);

const [isIndividualPrint, setIsIndividualPrint] = useState(false);


const handleBirthdayPreview = async () => {
  try {
    setIsPreviewOpen(true);
    setIsLoadingPreview(true);

    const response = await axios.get(`${URL}/reports/birthday`, {
      params: {
        status: statusFilter !== 'All' ? statusFilter : undefined,
        fromdate: dateRange.from,
        todate: dateRange.to,
        search: searchTerm || undefined,
        page: 1,
        limit: 10000, // fetch all
      }
    });

    const sorted = sortBirthdayData(response.data.Birthday || []);
setPreviewData(sorted);
  } catch (error) {
    console.error(error);
  } finally {
    setIsLoadingPreview(false);
  }
};

  
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
  


//   useEffect(() => {
//     const today = moment();

//     const nextMonday = today.clone().add(1, "week").startOf("isoWeek");   // Monday
//     const nextSunday = nextMonday.clone().endOf("isoWeek");              // Sunday

//     setDateRange({
//       from: nextMonday.format("YYYY-MM-DD"),
//       to: nextSunday.format("YYYY-MM-DD"),
//     });
//   }, []);

//   const setWeekRange = (baseDate) => {
//   const monday = moment(baseDate).startOf("isoWeek");
//   const sunday = monday.clone().endOf("isoWeek");

//   setDateRange({
//     from: monday.format("YYYY-MM-DD"),
//     to: sunday.format("YYYY-MM-DD"),
//   });
// };

// const goPreviousWeek = () => {
//   const prevWeek = moment(dateRange.from).subtract(1, "week");
//   setWeekRange(prevWeek);
// };

// const goNextWeek = () => {
//   const nextWeek = moment(dateRange.from).add(1, "week");
//   setWeekRange(nextWeek);
// };

// const handleFromChange = (val) => {
//   const d = moment(val);
//   if (!d.isValid()) return;
//   setWeekRange(d);
// };

// const handleToChange = (val) => {
//   const d = moment(val);
//   if (!d.isValid()) return;
//   setWeekRange(d);
// };


const fetchTotalByDate = async () => {
  try {
    const res = await axios.get(`${URL}/reports/birthday`, {
      params: {
        fromdate: dateRange.from,
        todate: dateRange.to,
        page: 1,
        limit: 1 // we only need total count
      }
    });

    setTotalCount(res.data.total || 0);
  } catch (err) {
    console.error(err);
  }
};


const handleFromChange = (value) => {
  setDateRange((prev) => ({
    ...prev,
    from: value
  }));
};

const handleToChange = (value) => {
  setDateRange((prev) => ({
    ...prev,
    to: value
  }));
};



  // AbortController to cancel previous requests
  const abortControllerRef = useRef(new AbortController());


const sortBirthdayData = (list = []) => {
  const getPriority = (name = "") => {
    const first = name.trim().charAt(0);

    if (/^[A-Za-z]/.test(first)) return 1;
    if (/^[0-9]/.test(first)) return 2;
    return 3;
  };

  return [...list].sort((a, b) => {

    // sort by date (MM-DD)
    const da = moment(a.dob).format("MM-DD");
    const db = moment(b.dob).format("MM-DD");

    if (da !== db) return da.localeCompare(db);

    // priority A-Z → numbers → special
    const pa = getPriority(a.member_name);
    const pb = getPriority(b.member_name);

    if (pa !== pb) return pa - pb;

    return (a.member_name || "")
      .trim()
      .localeCompare((b.member_name || "").trim());
  });
};


  
  const fetchData = async () => {

    try {
      const response = await axios.get(`${URL}/reports/birthday`, {
        params: {
          status: statusFilter !== 'All' ? statusFilter : undefined,
          fromdate: dateRange.from || "",
          todate: dateRange.to || "",
          search: searchTerm || undefined,
          page: currentPage + 1, // API expects 1-based index
          limit: 10000,
        },
        signal: abortControllerRef.current.signal, // Pass the abort signal
      });

      console.log(response);

const sorted = sortBirthdayData(response.data.Birthday || []);

setData(sorted);
setFilteredData(sorted);
setTotal(sorted.length);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching data:', error);
      }
    }
  };

  // Debounce effect to delay API calls when typing
  const debounceFetchData = useRef(null);



  useEffect(() => {

    // Clear previous debounce timeout and set a new one
    clearTimeout(debounceFetchData.current);

    // Debounced function to fetch data
    debounceFetchData.current = setTimeout(() => {
      // Cancel the previous request before making a new one
      abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController(); // Create a new instance for next request
      fetchData();
    }, 100); // Debounce delay in milliseconds (500ms)

    return () => {
      clearTimeout(debounceFetchData.current); // Clean up timeout on unmount
    };
  }, [statusFilter, searchTerm, currentPage]);

  useEffect(() => {
    if (dateRange.from && dateRange.to) {

      // Clear previous debounce timeout and set a new one
      clearTimeout(debounceFetchData.current);

      // Debounced function to fetch data
      debounceFetchData.current = setTimeout(() => {
        // Cancel the previous request before making a new one
        abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController(); // Create a new instance for next request
        return fetchData();
      }, 100);
    } else if (!dateRange.from && !dateRange.to) {
      // Clear previous debounce timeout and set a new one
      clearTimeout(debounceFetchData.current);

      // Debounced function to fetch data
      debounceFetchData.current = setTimeout(() => {
        // Cancel the previous request before making a new one
        abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController(); // Create a new instance for next request
        return fetchData();
      }, 100);
    }
  }, [dateRange]);

  // Listen to any changes in `dateRange`


  useEffect(() => {
    // Reset to page 1 (index 0) when search term changes
    setCurrentPage(0);
  }, [searchTerm]);

  useEffect(() => {
    // Reset to page 1 (index 0) when date range changes
    setCurrentPage(0);
  }, [dateRange]);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });




  const showToast = (status, message) => {
    setResponse({ status: null, message: "" });
    setTimeout(() => setResponse({ status, message }), 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  };

const handleIndividualPrint = async () => {
  try {
    const res = await axios.get(
      `${URL}/member-reports-pdf/birthday-individual/pdf`,
      {
        params: {
          fromdate: dateRange.from,
          todate: dateRange.to,
          fromSI,
          toSI
        },
        responseType: "arraybuffer"
      }
    );

    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "BirthdayIndividual.pdf";
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    setIsPrintModalOpen(false);
  } catch (err) {
    console.error(err);
  }
};



  const downloadBirthdayPDF = async () => {
    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      const res = await axios.get(
        `${URL}/member-reports-pdf/birthday/pdf`,
        {
          params: {
            status: statusFilter,
            fromdate: dateRange.from,
            todate: dateRange.to,
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
      link.download = "BirthdayReport.pdf";
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast("Success", "Birthday PDF downloaded");
    } catch (err) {
      showToast("Failed", "Birthday PDF download failed");
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };






  // Calculate the offset based on the current page
const offset = currentPage * itemsPerPage;

const currentPageData = filteredData.slice(
  offset,
  offset + itemsPerPage
);

  return (
    <>
      <div className="relative h-auto  bg-gray-100">
        <div className="p-4 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-lavender--600">Birthday Reports</h2>
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
                onClick={downloadBirthdayPDF}
                className="mr-4 text-blue-600 cursor-pointer hover:text-blue-800"
              >
                <img src={down} />
              </button>
              <button
                onClick={async () => {
                  setIsPrintModalOpen(true);
                  fetchTotalByDate();

                  try {
                    const res = await axios.get(`${URL}/reports/birthday`, {
                      params: {
                        status: statusFilter !== "All" ? statusFilter : undefined,
                        fromdate: dateRange.from,
                        todate: dateRange.to,
                        search: searchTerm || undefined,
                        page: 1,
                        limit: 10000
                      }
                    });

                    setAllBirthdayData(sortBirthdayData(res.data.Birthday || []));
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="mr-4 text-green-600 cursor-pointer hover:text-green-800"
              >
                <img src={print} />
              </button>
            </div>
            )}

          </div>
        <div className="flex flex-wrap items-end justify-center gap-4 mb-4">

  {/* <button
    onClick={goPreviousWeek}
    className="p-2 rounded-full hover:bg-gray-200"
    title="Previous Week"
  >
    <FaChevronLeft size={18} />
  </button> */}

  <div>
    <label className="block mb-1 text-gray-600">From</label>
    <input
      type="date"
      value={dateRange.from}
      onChange={(e) => handleFromChange(e.target.value)}
      className="px-3 py-2 border rounded-md"
    />
  </div>


  <div>
    <label className="block mb-1 text-gray-600">To</label>
    <input
      type="date"
      value={dateRange.to}
      onChange={(e) => handleToChange(e.target.value)}
      className="px-3 py-2 border rounded-md"
    />
  </div>

  {/* <button
    onClick={goNextWeek}
    className="p-2 rounded-full hover:bg-gray-200"
    title="Next Week"
  >
    <FaChevronRight size={18} />
  </button> */}

</div>


          <div className="grid grid-cols-3 gap-2 mb-4">



            <div>
              <label className="block mb-1 text-gray-600">Search</label>
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div ref={componentRef} className="overflow-x-auto mt-4">
            <table className="table-fixed w-full text-sm text-gray-500">
              <thead>
                <tr>
                  <th className="w-[6%] px-2 py-2 text-center border-b text-base text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-400">
                    Sl. no.
                  </th>
                  <th className="w-[14%] px-2 py-2 text-center border-b text-base text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-400">
                    Member ID
                  </th>

                  {!showTamilOnly && (
                    <th className="w-[22%] px-2 py-2 border-b text-base text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-400">
                      Member Name
                    </th>
                  )}

                  <th className="w-[28%] px-2 py-2 border-b text-base text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-400">
                    Member Tamil Name
                  </th>

                  <th className="w-[14%] px-2 py-2 text-center border-b text-base text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-400">
                    DOB
                  </th>

<th className="w-[10%] px-2 py-2 text-center border-b text-base text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-400">
  AGE
</th>

                </tr>
              </thead>

              <tbody>
                {currentPageData.map((item, index) => (
                  <tr key={index} className="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">

                    <td className="w-[6%] px-4 py-2 text-sm text-center">
                      {offset + index + 1}
                    </td>

                    <td className="w-[14%] px-4 py-2 text-sm text-center">
                      {item.member_id}
                    </td>

                    {!showTamilOnly && (
                      <td className="w-[22%] px-4 py-4 text-sm break-words whitespace-normal">
                        {item.member_name}
                      </td>
                    )}

                    <td className="w-[28%] px-4 py-2 text-sm break-words whitespace-normal">
                      {item.member_tamil_name}
                    </td>

                    <td className="w-[14%] px-4 py-2 text-sm text-center">
                      {moment(item.dob).format("DD-MM-YYYY")}
                    </td>

<td className="w-[10%] px-4 py-2 text-sm text-center">
  {moment().diff(moment(item.dob), "years")}
</td>

                  </tr>
                ))}
              </tbody>
            </table>

          </div>
          <br />
          <div className="flex items-center justify-center select-none">
            <ReactPaginate
              previousLabel={"<"}
              nextLabel={">"}
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
              activeClassName={'active'} // Ensure this matches the CSS class
              forcePage={currentPage} // Ensure the pagination component reflects the current page
            />
          </div>
<BirthdayPreviewModal
  isOpen={isPreviewOpen}
  onClose={() => setIsPreviewOpen(false)}
  data={previewData}
  isLoading={isLoadingPreview}
  from={dateRange.from}
  to={dateRange.to}
/>

<BirthdayIndividualModal
  isOpen={isIndividualPrint}
  onClose={() => setIsIndividualPrint(false)}
  data={allBirthdayData}
  fromSI={fromSI}
  toSI={toSI}
/>


        </div>

        {isDownloading && (
          <div className="fixed inset-0 bg-black/40 z-50 flex flex-col items-center justify-center">
            <div className="w-14 h-14 border-4 border-lavender--600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white mt-4 text-sm">
              Started Birthday PDF Download…
            </p>
          </div>
        )}

      </div>

<SmallSizedModal
  isOpen={isPrintModalOpen}
  onClose={() => {
    setIsPrintModalOpen(false);
    setPrintMode("");
    setFromSI("");
    setToSI("");
  }}
  title="Print Birthday"
>
  <div className="p-4">

    {!printMode && (
      <>
        <p className="text-center font-medium mb-6">
          Do you want to Print as
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              setIsPrintModalOpen(false);
              handleBirthdayPreview();
            }}
            className="px-4 py-2 bg-lavender--600 text-white rounded"
          >
            Print List
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
              onChange={(e) =>
                setFromSI(e.target.value.replace(/\D/g, ""))
              }
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
              onChange={(e) =>
                setToSI(e.target.value.replace(/\D/g, ""))
              }
              className="border p-1 rounded w-24 text-center"
            />
          </div>
        </div>

        <div className="text-center mt-4 font-semibold">
          {fromSI && toSI
            ? `Total ${Math.max(0, Number(toSI) - Number(fromSI) + 1)} Members`
            : `Total ${totalCount} Members`
          }
        </div>


        <div className="flex justify-end mt-6">
          <button
onClick={() => {
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


      {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}
    </>

  );
};

export default ReportPage;








