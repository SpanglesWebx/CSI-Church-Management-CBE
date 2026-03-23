import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { URL } from "../../App";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Spinners from "../../Components/Spinners";
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import moment from "moment";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";
import './BillPages.css'
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  ShadingType,
  HeadingLevel,
} from "docx";

const BillsPages = () => {
  const token = window.sessionStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("individual");
  const [Data, setData] = useState([]);
  const [Search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showTamilOnly, setShowTamilOnly] = useState(false);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const debounceTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);
  const [startDate, setStartDate] = useState(() =>
    moment().subtract(1, "month").startOf("month").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(() =>
    moment().subtract(1, "month").endOf("month").format("YYYY-MM-DD")
  );
  const [downloading, setDownloading] = useState(false);


  const tableHeading = [
    "Sl. no.",
    "Family ID",
    "Member ID",
    "Family Head Name",
    "Family Head Tamil Name",
    "Action",
  ];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get("search") || "";
    const pageParam = parseInt(params.get("page")) || 1;

    setSearch(searchParam);
    setCurrentPage(pageParam);

    fetchData(pageParam, searchParam);
  }, [location.search, activeTab, startDate, endDate]);

  const fetchData = async (page, search) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);

    try {
      // const endpoint =
      //   activeTab === "individual"
      //     ? `${URL}/offerings/bill/family-heads?search=${search}&page=${page}&limit=15`
      //     : `${URL}/offerings/bill/overall?search=${search}&page=${page}&limit=15`;

      const endpoint =
        activeTab === "individual"
          ? `${URL}/offerings/bill/family-heads?search=${search}&page=${page}&limit=15&fromdate=${startDate}&todate=${endDate}`
          : `${URL}/offerings/bill/overall?search=${search}&page=${page}&limit=15&fromdate=${startDate}&todate=${endDate}`;


      const response = await axios.get(endpoint, {
        headers: { Authorization: token },
        signal: abortController.signal,
      });

      if (activeTab === "individual") {
        setData(response.data.familyHeads || []);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setData(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      navigate(`?search=${value}&page=1`);
    }, 300);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    navigate(`?search=${Search}&page=${page}`);
  };




// const handleDownloadExcel = async () => {
//   try {
//     setDownloading(true);
//     const response = await axios.get(
//       `${URL}/offerings/bill/overall?search=${Search}&page=1&limit=1000&fromdate=${startDate}&todate=${endDate}`,
//       {
//         headers: { Authorization: token },
//       }
//     );

//     const allData = response.data.data || [];

//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Overall Offerings", {
//       pageSetup: {
//         fitToPage: true,
//         fitToWidth: 1,
//         orientation: "portrait",
//         paperSize: 9, // A4
//         horizontalCentered: true,
//         margins: {
//           left: 0.3,
//           right: 0.3,
//           top: 0.5,
//           bottom: 0.5,
//           header: 0.3,
//           footer: 0.3,
//         }
//       }
//     });

//     let currentRow = 1;

//     // 🔹 Row 1: Church Name
//     worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
//     const titleCell = worksheet.getCell(`A${currentRow}`);
//     titleCell.value = "CSI CHURCH VYRAKUDI";
//     titleCell.font = { bold: true, size: 16, color: { argb: "FF4B0082" } };
//     titleCell.alignment = { horizontal: "center" };
//     currentRow++;

//     // 🔹 Row 2: Report Title with Month
//     const formattedMonth = moment(startDate).format("MMMM YYYY");
//     worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
//     const subTitleCell = worksheet.getCell(`A${currentRow}`);
//     subTitleCell.value = `Overall Family Offerings Bill (${formattedMonth})`;
//     subTitleCell.font = { bold: true, size: 12 };
//     subTitleCell.alignment = { horizontal: "center" };
//     currentRow += 2;

//     let grandTotal = 0;

//     allData.forEach((family) => {
//       const membersWithOfferings = (family.members || []).filter(
//         (m) => m.offerings && m.offerings.length > 0
//       );
//       if (membersWithOfferings.length === 0) return;

//       // 🔹 Family Head Header
//       const headName = showTamilOnly
//         ? family.member_tamil_name || "-"
//         : (family.member_name || "-") +
//           (family.member_tamil_name ? ` (${family.member_tamil_name})` : "");

//       worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
//       const headCell = worksheet.getCell(`A${currentRow}`);
//       headCell.value = `Family Head: ${headName} (${family.head})`;
//       headCell.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
//       headCell.fill = {
//         type: "pattern",
//         pattern: "solid",
//         fgColor: { argb: "FF8378FF" },
//       };
//       headCell.alignment = { horizontal: "left" };
//       currentRow++;

//       // 🔹 Offerings Table Header
//       worksheet.getRow(currentRow).values = [
//         "",
//         "Date",
//         "Amount (₹)",
//         "Category"
//       ];
//       worksheet.getRow(currentRow).font = { bold: true };
//       worksheet.getRow(currentRow).fill = {
//         type: "pattern",
//         pattern: "solid",
//         fgColor: { argb: "FFE5E5FF" },
//       };
//       worksheet.getRow(currentRow).alignment = { horizontal: "center" };
//       currentRow++;

//       let familyTotal = 0;

//       membersWithOfferings.forEach((member) => {
//         const eng = member.name || member.member_name || "-";
//         const tam = member.tamil_name || member.member_tamil_name || "";
//         const id = member.member_id;

//         const isHead = member.member_id === family.head;
//         const relation = isHead ? "" : (member.relation || "-");

//         const nameWithId = showTamilOnly
//           ? `${tam || eng} - ${id}`
//           : tam
//             ? `${eng} (${tam}) - ${id}`
//             : `${eng} - ${id}`;

//         const displayName = isHead
//           ? nameWithId
//           : `${nameWithId} (${relation})`;

//         // 🧍 Member Name Row
//         worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
//         const nameCell = worksheet.getCell(`A${currentRow}`);
//         nameCell.value = displayName;
//         nameCell.font = { bold: true };
//         nameCell.fill = {
//           type: "pattern",
//           pattern: "solid",
//           fgColor: { argb: "FFDDF1FF" },
//         };
//         nameCell.alignment = {
//           wrapText: true,
//           horizontal: "left"
//         };
//         currentRow++;

//         member.offerings.forEach((offering) => {
//           worksheet.getRow(currentRow).values = [
//             "",
//             new Date(offering.date).toLocaleDateString(),
//             offering.amount,
//             offering.category
//           ];

//           worksheet.getCell(`D${currentRow}`).alignment = {
//             wrapText: true,
//             horizontal: "left"
//           };

//           familyTotal += Number(offering.amount || 0);
//           grandTotal += Number(offering.amount || 0);
//           currentRow++;
//         });

//         currentRow++; // spacing
//       });

//       // 🔹 Family Total Row
//       worksheet.mergeCells(`A${currentRow}:C${currentRow}`);
//       const totalCell = worksheet.getCell(`A${currentRow}`);
//       totalCell.value = "Grand Total for this Family (₹)";
//       totalCell.font = { bold: true };
//       totalCell.alignment = { horizontal: "right" };

//       worksheet.getCell(`D${currentRow}`).value = familyTotal;
//       worksheet.getCell(`D${currentRow}`).font = { bold: true };
//       worksheet.getCell(`D${currentRow}`).alignment = { horizontal: "center" };
//       currentRow += 2;
//     });

//     // 📐 Adjust columns
//     worksheet.columns = [
//       { width: 8 },
//       { width: 18 },
//       { width: 15 },
//       { width: 60 } // Widened for long names
//     ];

//     const buffer = await workbook.xlsx.writeBuffer();
//     const blob = new Blob([buffer], {
//       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     });

//     const formattedStart = moment(startDate).format("MMM-YYYY");
//     saveAs(blob, `Overall_Offerings_Bill_${formattedStart}.xlsx`);
//   } catch (err) {
//     console.error("Excel Download Failed:", err);
//     alert("Failed to download Excel. Check console.");
//   }
//   finally {
//     setDownloading(false); // ⬅️ Hide loader
//   }
// };

// Updated handleDownloadDocx matching Excel logic with Tamil support, relation, and styling

const handleDownloadDocx = async () => {
  try {
    const token = sessionStorage.getItem("token");
    // const URL = "http://localhost:5000/api";
    const URL = "https://nodejs.vyrakudycsichurch.com/api"

    setDownloading(true);

    const response = await axios.get(
      `${URL}/offerings/bill/overall?search=${Search}&page=1&limit=1000&fromdate=${startDate}&todate=${endDate}`,
      {
        headers: { Authorization: token },
      }
    );

    const allData = response?.data?.data || [];
    const children = [];

    // Title
    children.push(
      new Paragraph({
        text: "CSI CHURCH VYRAKUDI",
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: `Overall Family Offerings Bill (${moment(startDate).format("MMMM YYYY")})`,
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );

    allData.forEach((family) => {
      const membersWithOfferings = (family.members || []).filter(
        (m) => m.offerings && m.offerings.length > 0
      );
      if (membersWithOfferings.length === 0) return;

      const headName = showTamilOnly
        ? family.member_tamil_name || "-"
        : (family.member_name || "-") +
            (family.member_tamil_name ? ` (${family.member_tamil_name})` : "");

      // children.push(
      //   new Paragraph({
      //     text: `Family Head: ${headName} (${family.head})`,
      //     heading: HeadingLevel.HEADING_3,
      //     shading: { fill: "#F3F2FF" },
      //     spacing: { after: 200 },
      //     bold: true,
      //     color: "000000",
      //     size: 30,
      //   })
      // );

      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 200 },
          shading: { fill: "#F3F2FF" },
          children: [
            new TextRun({
              text: `Family Head: ${headName} (${family.head})`,
              bold: true,
              color: "000000", // no hash (#) here
              size: 25,
            }),
          ],
        })
      );


      let familyTotal = 0;

      membersWithOfferings.forEach((member) => {
        const eng = member.name || member.member_name || "-";
        const tam = member.tamil_name || member.member_tamil_name || "";
        const id = member.member_id;
        const isHead = id === family.head;
        const relation = isHead ? "" : (member.relation || "-");

        const nameWithId = showTamilOnly
          ? `${tam || eng} - ${id}`
          : tam
            ? `${eng} (${tam}) - ${id}`
            : `${eng} - ${id}`;

        const displayName = isHead
          ? nameWithId
          : `${nameWithId} (${relation})`;

        children.push(
          new Paragraph({
            text: displayName,
            bold: true,
            shading: {
              fill: "DDF1FF",
              type: ShadingType.CLEAR,
              color: "auto",
            },
            spacing: { before: 100, after: 100 },
          })
        );

        const tableRows = [];
        tableRows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ text: "Date", bold: true })],
              }),
              new TableCell({
                children: [new Paragraph({ text: "Amount" })],
              }),
              new TableCell({
                children: [new Paragraph({ text: "Category" })],
              }),
            ],
          })
        );

        let memberTotal = 0;

        member.offerings.forEach((offering) => {
          const date = moment(offering.date).format("DD/MM/YYYY");
          const amount = offering.amount || 0;
          const category = offering.category || "-";

          tableRows.push(
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph(date)] }),
                new TableCell({ children: [new Paragraph(amount.toString())] }),
                new TableCell({ children: [new Paragraph(category)] }),
              ],
            })
          );

          memberTotal += Number(amount);
        });

        familyTotal += memberTotal;

        children.push(
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            alignment: AlignmentType.LEFT,
          }),
          new Paragraph({
            text: `\n`,
          })
        );
      });

      children.push(
        new Paragraph({
          text: `Grand Total for this Family (₹) ${familyTotal}`,
          bold: true,
          spacing: { after: 400 },
        })
      );
    });

    const doc = new Document({
      sections: [{ properties: {}, children }],
    });

    const blob = await Packer.toBlob(doc);
    const formattedStart = moment(startDate).format("MMM-YYYY");
    saveAs(blob, `Overall_Offerings_Bill_${formattedStart}.docx`);
  } catch (err) {
    console.error("DOCX Download Failed:", err);
    alert(`DOCX Download Failed: ${err?.response?.data?.message || err.message}`);
  } finally {
    setDownloading(false);
  }
};







  const serialOffset = (CurrentPage - 1) * 15;



  return (
    <div className="flex flex-col w-full p-5 mt-5 space-y-10 bg-white rounded-t-lg">
      {/* Tabs */}
      Offerings Bill
      
      {/* download progress */}

      {downloading && (
        <div className="text-center py-2 px-4 mb-2 rounded text-[#8378FF] bg-[#8378FF]/10 font-semibold text-[18px] animate-pulse">
          Initializing download<span className="dot-animation">.</span>Do not close the tab
        </div>
      )}


      {/* Filters */}
      <div className="flex items-center justify-between">
        <FormControlLabel
          control={
            <Checkbox
              checked={showTamilOnly}
              onChange={(e) => setShowTamilOnly(e.target.checked)}
            />
          }
          label="Tamil Names Only"
        />
        <div className="flex items-center justify-between px-2 print:px-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold whitespace-nowrap">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold whitespace-nowrap">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded shadow-sm"
              />
            </div>
          </div>
        </div>
        <div className="relative">
          <input
            type="search"
            placeholder="Search Members..."
            className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
            value={Search}
            onChange={handleSearchChange}
          />
          <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
            <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
            </svg>
          </div>
        </div>
        {activeTab === "overall" && (
          <div className="flex justify-end mb-2">
            <button
              onClick={handleDownloadDocx}
              className="px-4 py-2 bg-[#8378FF] text-white rounded hover:bg-indigo-700 text-sm"
            >
              <Download size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Table Section */}
      {loading ? (
        <Spinners />
      ) : activeTab === "individual" ? (
        Data.length > 0 ? (
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-base text-gray-700 bg-white">
              <tr>
                {tableHeading
                  .filter(h => !(showTamilOnly && h === "Family Head Name"))
                  .map((heading, idx) => (
                    <th key={idx} className="px-4 py-3 text-center">{heading}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {Data.map((item, index) => (
                <tr key={item.head} className="bg-white border-b">
                  <td className="px-4 py-4 text-sm text-center">{(CurrentPage - 1) * 15 + (index + 1)}</td>
                  <td className="px-4 py-4 text-sm text-center">{item.family_id}</td>
                  <td className="px-4 py-4 text-sm text-center">{item.head}</td>
                  {!showTamilOnly && <td className="px-4 py-4 text-sm">{item.member_name}</td>}
                  <td className="px-4 py-4 text-sm">{item.member_tamil_name}</td>
                  <td className="px-4 py-4 text-sm text-center">
                    <Link to={`/admin/bills/preview/${item.family_id}`} className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200">
                      <i className="fa-solid fa-eye"></i>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>No data found</div>
        )
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="text-sm text-gray-700 bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-center">Sl. No</th>
                <th className="px-4 py-3 text-center">Family ID</th>
                <th className="px-4 py-3 text-center">Member ID</th>
                {!showTamilOnly && (
                <th className="px-4 py-3 text-center">Member Name</th>
                )}
                <th className="px-4 py-3 text-center">Member Tamil Name</th>
                <th className="px-4 py-3 text-center">Relation</th>
                <th className="px-4 py-3 text-center">Offerings</th>
              </tr>
            </thead>
            <tbody>
              {Data.map((family, index) => (
                <React.Fragment key={family.head}>
                  <tr className="bg-slate-200 font-semibold">
                    <td className="text-center">{serialOffset + index + 1}</td>
                    <td className="text-center">{family.family_id}</td>
                    <td className="text-center">{family.head}</td>
                    {!showTamilOnly && (
                    <td className="text-center">{family.member_name}</td>
                    )}
                    <td className="text-center">{family.member_tamil_name}</td>
                    <td className="text-center">Head</td>
                    <td className="text-center">-</td>
                  </tr>
                  {/* {family.members?.map((member, idx) => ( */}
                  {family.members
                    ?.filter((member) => member.offerings && member.offerings.length > 0)
                    .map((member, idx) => (
                    <React.Fragment key={member.member_id || idx}>
                      <tr className="bg-white">
                        <td></td>
                        <td className="text-center">{member.family_id}</td>
                        <td className="text-center">{member.member_id}</td>
                        {!showTamilOnly && (
                          <td className="text-center">{member.name || member.member_name}</td>
                        )}
                        <td className="text-center">{member.tamil_name || member.member_tamil_name}</td>
                        <td className="text-center">{member.relation || (member.member_id === family.head ? 'Head' : '')}</td>
                        <td className="text-center">{member.offerings?.length || 0} records</td>
                      </tr>

                      {/* ✅ Offerings for each member */}
                      {member.offerings?.map((offering, i) => (
                        <tr key={i} className="bg-gray-50 text-xs">
                          <td colSpan={2}></td>
                          <td className="text-center" colSpan={2}>{new Date(offering.date).toLocaleDateString()}</td>
                          <td className="text-center">₹{offering.amount}</td>
                          <td className="text-center">{offering.category}</td>
                          <td className="text-center">{offering.paid_by || '-'}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}

                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {Data.length > 0 && (
        <div className="relative flex flex-wrap items-center justify-center mt-4 space-x-3 select-none">
          <button
            onClick={() => handlePageChange(CurrentPage - 1)}
            disabled={CurrentPage === 1}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button className={`px-4 py-2 rounded ${CurrentPage ? "bg-lavender--600 text-white" : "bg-gray-200 text-gray-700"}`}>{CurrentPage}</button>
          <button
            onClick={() => handlePageChange(CurrentPage + 1)}
            disabled={CurrentPage === TotalPages}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>

          <div className="absolute flex space-x-2 right-5">
            <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded">
              Total Pages: {TotalPages}
            </span>
            <span
              onClick={() => handlePageChange(TotalPages)}
              className={`px-4 py-2 bg-gray-100 text-blue-400 rounded ${TotalPages === CurrentPage ? "opacity-50 cursor-not-allowed" : "hover:cursor-pointer hover:text-blue-800"
                }`}
            >
              Last Page
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillsPages;