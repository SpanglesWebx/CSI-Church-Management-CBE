import React, { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaEye, FaPrint } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";
import { FiDownload } from "react-icons/fi";
import SmallSizedModal from "../../Components/Expense/SmallSizedModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { jwtDecode } from "jwt-decode";

export const NewFamilyList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = window.sessionStorage.getItem("token");

  const [familyList, setFamilyList] = useState([]);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  // const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  // const [searchTerm, setSearchTerm] = useState("");
  const [rowsInput, setRowsInput] = useState("");
  // const [rowsPerPage, setRowsPerPage] = useState(50);
  const [jumpInput, setJumpInput] = useState("");
    const [userRole, setUserRole] = useState("");

const pageFromUrl = Number(searchParams.get("page")) || 1;
const searchFromUrl = searchParams.get("search") || "";
const limitFromUrl = Number(searchParams.get("limit")) || 50;

const [CurrentPage, setCurrentPage] = useState(pageFromUrl);
const [searchTerm, setSearchTerm] = useState(searchFromUrl);
const [rowsPerPage, setRowsPerPage] = useState(limitFromUrl);


  const fetchFamilyList = async () => {
    try {
      const res = await axios.get(
        `${URL}/family/list?page=${CurrentPage}&search=${searchTerm}&limit=${rowsPerPage}`,
        { headers: { Authorization: token } }
      );

      setFamilyList(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Fetch Family Error:", err);
      setFamilyList([]);
    }
  };

  useEffect(() => {
    fetchFamilyList();
  }, [CurrentPage, searchTerm, rowsPerPage]);

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

useEffect(() => {
  setSearchParams({
    page: CurrentPage,
    search: searchTerm,
    limit: rowsPerPage
  });
}, [CurrentPage, searchTerm, rowsPerPage]);

const downloadFamiliesPdf = async () => {
  try {
    setIsDownloading(true);

    const res = await axios.get(`${URL}/family/download`, {
      headers: { Authorization: token }
    });

    const families = res.data.data || [];
    const doc = new jsPDF("l", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    // Helper to shorten titles
    const formatName = (title, name) => {
      let t = (title || "").trim().toUpperCase();
      let n = (name || "").trim().toUpperCase();
      
      if (t === "MISTER" || t === "MASTER") t = "MR.";
      else if (t === "MISS") t = "MS.";
      else if (t === "MISTRESS") t = "MRS.";
      
      return `${t} ${n}`.trim();
    };

    // Helper to format dates to DD-MM-YYYY
    const formatDate = (dateStr) => {
      if (!dateStr) return "";
      const parts = dateStr.split("-");
      // If it's already in a 3-part format like YYYY-MM-DD, flip it
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return dateStr;
    };

    // TITLE SECTION
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0); // Black text
    doc.text("CSI CHRIST CHURCH COIMBATORE", pageWidth / 2, 12, { align: "center" });
    doc.text("FAMILY LIST", pageWidth / 2, 18, { align: "center" });

    const body = [];


    families.forEach((family, familyIndex) => {
      const headMember = family.members.find(m => m.member_id === family.head.member_id);

      // COMBINED HEADER & ADDRESS
      let headerContent = `${familyIndex + 1}. ${family.head.member_id} ${family.head.member_name} FAM ID: ${family.family_id}`.toUpperCase();
      
      if (headMember?.present_address) {
        headerContent += `,${headMember.present_address.toUpperCase()}`;
      }

      body.push([{
        content: headerContent,
        colSpan: 9,
        styles: { 
          fontStyle: "bold", 
          fontSize: 10, // Slightly smaller to ensure long addresses fit in one line
          textColor: [0, 0, 0], 
          fillColor: [255, 255, 255],
          halign: 'left' 
        }
      }]);

      // MEMBERS DATA (FontSize 11, Dates Formatted)
      family.members.forEach((m, idx) => {
        body.push([
          idx + 1,
          (m.member_id || "").toUpperCase(),
          formatName(m.member_title, m.member_name),
          (m.relation_with_head || "").toUpperCase(),
          formatDate(m.dob),
          formatDate(m.baptism_date),
          formatDate(m.confirmation_date),
          formatDate(m.marriage_date),
          (m.primary_contact_number || "").toUpperCase(),
          (m.contact_numbers || []).join(", ").toUpperCase()
        ]);
      });

      // Spacer row
      body.push([{ content: "", colSpan: 10, styles: { minCellHeight: 2 } }]);
    });
    autoTable(doc, {
      startY: 25,
      margin: { left: 10, right: 10 },
      tableWidth: 'auto', 
      head: [[
        "SL", "MEMBER ID", "NAME", "RELATION", "DOB", 
        "BAPTISM", "CONFIRMATION", "MARRIAGE", 
        "PRI. CONTACT", "OTHER PH"
      ]],
      body: body,
      theme: "plain",
      showHead: "everyPage",

      // HEADER STYLING
      headStyles: {
        font: "helvetica",
        fontStyle: "bold",
        fontSize: 8, 
        halign: "center",
        valign: "middle",
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        lineWidth: { top: 0.5, bottom: 0.5 },
      },

      // DATA STYLING (Changed to size 11 to fit dates on one line)
      styles: {
        font: "helvetica",
        fontStyle: "normal",
        fontSize: 7, // Reduced to 11
        textColor: [0, 0, 0],
        cellPadding: 1,
        overflow: 'linebreak'
      },

      // Adjusted widths to ensure 10-character dates don't wrap
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 28 },
        2: { cellWidth: 'auto' }, // Name flexes to fill space
        4: { cellWidth: 23 }, // DOB
        5: { cellWidth: 23 }, // BAPTISM
        6: { cellWidth: 25 }, // CONFIRMATION (slightly wider for header text)
        7: { cellWidth: 23 }, // MARRIAGE
        8: { cellWidth: 26 }  // PRI CONTACT
      }
    });

    // FOOTER
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`PAGE ${i} OF ${totalPages}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: "center" });
    }

    doc.save("FAMILY LIST CSI CHRIST CHURCH CBE TRICHY ROAD.pdf");

  } catch (err) {
    console.error(err);
  } finally {
    setIsDownloading(false);
  }
};

  const getPaginationPages = () => {
    const pages = [];
    const range = 2;

    if (TotalPages <= 7) {
      for (let i = 1; i <= TotalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    if (CurrentPage > range + 2) pages.push("ellipsis-left");

    const start = Math.max(2, CurrentPage - range);
    const end = Math.min(TotalPages - 1, CurrentPage + range);

    for (let i = start; i <= end; i++) pages.push(i);

    if (CurrentPage < TotalPages - (range + 1)) pages.push("ellipsis-right");

    pages.push(TotalPages);

    return pages;
  };


  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold">Family</h1>
          {["admin", "treasurer"].includes(userRole) && (
          <FiDownload size={20} className="text-lavender--600 cursor-pointer" title="Download" onClick={() => setIsDownloadModalOpen(true)} />
          )}
          </div>
        <div className="flex items-center justify-between p-2">
          

          <div className="relative">
            <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
              <svg className="w-3 h-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
            </div>
            <input
              type="search"
              className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50"
              placeholder="Search by Name or ID"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Family ID</th>
                <th className="p-2 text-center">Member ID</th>
                <th className="p-2 text-center">Family Head Name</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="text-center">
              {familyList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-3">No Families Found</td>
                </tr>
              ) : (
                familyList.map((fam, index) => (
                  <tr key={fam._id} className="border-b">
                    <td className="p-2">{(CurrentPage - 1) * rowsPerPage + index + 1}</td>
                    <td className="p-2 font-semibold">{fam.family_id}</td>
                    <td className="p-2">{fam.head?.member_id}</td>
                    <td className="p-2 text-left">{fam.head?.member_name}</td>

                    <td className="p-2 flex justify-center">
                      <FaEye
                        size={18}
                        className="text-lavender--600 cursor-pointer"
onClick={() => navigate(
  `/admin/familylist/familymemberslist?${searchParams.toString()}`,
  {
    state: { familyId: fam.family_id }
  }
)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="relative flex items-center justify-center mt-4 space-x-2 select-none">
          <div className="absolute left-2">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded">

              {/* Label */}
              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                No. of Rows
              </span>



              <div className="relative w-24">

                {/* Search Icon INSIDE input */}
                <div
                  className="absolute inset-y-0 right-0 flex items-center pe-2 cursor-pointer"
                  onClick={() => {
                    setRowsPerPage(rowsInput || "50");
                    setCurrentPage(1);
                  }}
                >
                  <svg
                    className="w-4 h-4 text-gray-500 hover:text-gray-700"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </div>

                {/* Input */}
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="50"
                  value={rowsInput}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setRowsInput(value);
                  }}
                  className=" block w-full py-1 pr-8 pl-2 text-sm text-gray-900 bg-gray-100 rounded outline-none " />
              </div>

            </div>
          </div>




          {/* CENTER – Pagination */}
          <div className="flex items-center justify-center space-x-2">

            {/* Previous */}
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={CurrentPage === 1}
              className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaChevronLeft />
            </button>

            {/* Page Numbers */}
            {getPaginationPages().map((page, index) => {
              if (typeof page === "string") {
                return (
                  <span key={page + index} className="px-3 py-2 text-gray-500">
                    …
                  </span>
                );
              }

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={` w-10 h-10 flex items-center justify-center rounded-full font-medium  ${page === CurrentPage
                    ? "bg-lavender--600 text-white"
                    : " hover:border-2 border-gray-300"
                    }`}
                >
                  {page}
                </button>
              );
            })}

            {/* Next */}
            <button
              onClick={() => setCurrentPage(p => Math.min(TotalPages, p + 1))}
              disabled={CurrentPage === TotalPages}
              className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaChevronRight />
            </button>

          </div>

          {/* RIGHT – Last Page */}
          <div className="absolute right-2">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded">

              {/* Label */}
              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                Jump to Page
              </span>

              <div className="relative w-20">

                {/* Search Icon INSIDE input */}
                <div
                  className="absolute inset-y-0 right-0 flex items-center pe-2 cursor-pointer"
                  onClick={() => {
                    const page = Number(jumpInput);

                    if (!page) return;                // empty / invalid
                    if (page < 1) return;             // below 1
                    if (page > TotalPages) return;    // above last page

                    setCurrentPage(page);
                    setJumpInput("");                 // optional clear
                  }}
                >
                  <svg
                    className="w-4 h-4 text-gray-500 hover:text-gray-700"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </div>

                {/* Input */}
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder={`1-${TotalPages}`}
                  value={jumpInput}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setJumpInput(value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const page = Number(jumpInput);

                      if (!page) return;
                      if (page < 1) return;
                      if (page > TotalPages) return;

                      setCurrentPage(page);
                      setJumpInput("");
                    }
                  }}
                  className="block w-full py-1 pr-8 pl-2 text-sm text-gray-900 bg-gray-100 rounded outline-none"
                />
              </div>

            </div>
          </div>


        </div>
        <SmallSizedModal
          isOpen={isDownloadModalOpen}
          onClose={() => {
            if (!isDownloading) setIsDownloadModalOpen(false);
          }}
          title="Download Members"
        >
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={downloadFamiliesPdf}
              disabled={isDownloading}
              className="px-4 py-2 bg-lavender--600 text-white rounded"
            >
              {isDownloading ? "Generating..." : "Download PDF"}
            </button>
          </div>
        </SmallSizedModal>


      </div>
    </>
  );
};
