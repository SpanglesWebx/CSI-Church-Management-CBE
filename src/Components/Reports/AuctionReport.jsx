import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import down from "./icon/downloade.svg";
import "./pagination.css";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FaEye } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";


const URL = import.meta.env.VITE_BACKEND_API_URL;

// Columns shown in the table (one row PER BUYER)
const tableHeading = [
  "Sl. No.",
  "Buyer ID / Phone",
  "Buyer Name",
  "Buyer Phone",
  "Overall Unpaid",
  "Action",
];

export const AuctionReport = () => {
  const token = window.sessionStorage.getItem("token");

  // store buyers directly
  const [buyers, setBuyers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const [paymentAmount, setPaymentAmount] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBuyerKey, setSelectedBuyerKey] = useState(null);
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

  // ---- Fetch buyers directly ----
  const fetchData = async () => {
    try {
      const res = await axios.get(`${URL}/auctions/report/all`, {
        headers: { Authorization: token },
        params: {
          fromdate: dateRange.from || "",
          todate: dateRange.to || "",
          search: searchTerm || undefined,
        },
      });
      setBuyers(Array.isArray(res.data) ? res.data : []);
      setCurrentPage(0);
    } catch (err) {
      console.error("Error fetching auctions:", err);
      setBuyers([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, dateRange.from, dateRange.to]);

  // ---- Filters ----
  const filteredBuyers = useMemo(() => {
    return (buyers || [])
      .filter((b) => {
        const s = (searchTerm || "").trim().toLowerCase();
        if (!s) return true;
        const haystack = [
          b.buyerName,
          b.buyerId,
          b.buyerPhone,
          ...b.auctions.map((a) => [a.item, a.sellerName, a.sellerPhone]).flat(),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(s);
      })
      .filter((b) => {
        const from = dateRange.from ? new Date(dateRange.from) : null;
        const to = dateRange.to ? new Date(dateRange.to) : null;
        return b.auctions.some((a) => {
          const d = new Date(a.date);
          if (from && d < from) return false;
          if (to && d > to) return false;
          return true;
        });
      });
  }, [buyers, searchTerm, dateRange]);

  // ---- Pagination ----
  const pageCount = Math.ceil(filteredBuyers.length / itemsPerPage) || 1;
  const offset = currentPage * itemsPerPage;
  const pageBuyers = filteredBuyers.slice(offset, offset + itemsPerPage);

  const handlePageClick = ({ selected }) => setCurrentPage(selected);

  // ---- Modal handlers ----
  const openBuyerModal = (buyerKey) => {
    setSelectedBuyerKey(buyerKey);
    setIsModalOpen(true);
  };
  const closeBuyerModal = () => {
    setIsModalOpen(false);
    setSelectedBuyerKey(null);
  };

  const selectedBuyer = useMemo(() => {
    return buyers.find((b) => b.key === selectedBuyerKey) || null;
  }, [buyers, selectedBuyerKey]);

  // ---- Pay ----
  const handlePay = async () => {
    if (!selectedBuyer) return;

    const buyerKey = selectedBuyer.isMember
      ? selectedBuyer.buyerId
      : `PHONE:${selectedBuyer.buyerPhone}`;

    try {
      const res = await axios.post(
        `${URL}/auctions/payment`,
        { buyerKey, amount: Number(paymentAmount) },
        { headers: { Authorization: token } }
      );

      const updatedBuyer = res.data; // backend must return updated buyer object

      setBuyers((prev) =>
        prev.map((b) => (b.key === updatedBuyer.key ? updatedBuyer : b))
      );

      setPaymentAmount(0);
    } catch (err) {
      console.error("Payment failed:", err);
    }
  };

  // ---- Excel export ----
  const handleDownloadExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Auction Report (Buyers)");

      const titleRow = sheet.addRow(["Auction Buyer Summary"]);
      titleRow.font = { size: 14, bold: true };
      sheet.mergeCells(`A${titleRow.number}:F${titleRow.number}`);
      sheet.addRow([]);

      const hdr = [
        "Sl. No.",
        "Buyer ID / Phone",
        "Buyer Name",
        "Buyer Phone",
        "Overall Unpaid",
      ];
      sheet.addRow(hdr).eachCell((c) => {
        c.font = { bold: true };
        c.alignment = { horizontal: "center" };
      });

      buyers.forEach((b, i) => {
        sheet.addRow([
          i + 1,
          b.isMember
            ? b.buyerId
            : b.buyerPhone
              ? `PHONE:${b.buyerPhone}`
              : "Non-Member",
          b.buyerName || "",
          b.buyerPhone || "",
          b.overallUnpaid,
        ]);
      });

      sheet.getColumn(5).numFmt = '"₹"#,##0';

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "Auction_Buyer_Summary.xlsx");
    } catch (err) {
      console.error("Excel export failed:", err);
    }
  };


  return (
    <div className="relative h-auto ml-5 w-full bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Auction Reports (By Buyer)</h2>
           {userRole !== "churchofficeworker" && (
          <button
            onClick={handleDownloadExcel}
            className="text-blue-600 hover:text-blue-800"
          >
            <img src={down} alt="download" />
          </button>
           )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
          <div>
            <label className="block text-sm text-gray-600">From</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange((p) => ({ ...p, from: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">To</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange((p) => ({ ...p, to: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buyer/Seller/ID/Phone/Item/Status"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        {/* Table (one row per BUYER) */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                {tableHeading.map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2 border-b text-gray-700 text-center"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageBuyers.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-gray-500"
                    colSpan={tableHeading.length}
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                pageBuyers.map((b, i) => (
                  <tr key={b.key}>
                    <td className="px-4 py-2 text-center">
                      {offset + i + 1}
                    </td>

                    {/* Buyer ID / Phone (grouping key) */}
                    <td className="px-4 py-2 text-center">
                      {b.isMember
                        ? b.buyerId
                        : b.buyerPhone
                          ? `Phone: ${b.buyerPhone}`
                          : "Non-Member"}
                    </td>

                    <td className="px-4 py-2">{b.buyerName}</td>
                    <td className="px-4 py-2 text-center">{b.buyerPhone}</td>

                    {/* Overall Unpaid */}
                    <td
                      className={`px-4 py-2 text-center font-semibold ${b.overallUnpaid > 0 ? "text-red-600" : "text-green-600"
                        }`}
                    >
                      ₹{Number(b.overallUnpaid || 0).toLocaleString()}

                    </td>

                    {/* Action */}
                    <td className="px-4 py-2 text-center">
                      <FaEye
                        className="text-lavender--600 cursor-pointer text-l mx-auto hover:text-lavender--600"
                        onClick={() => openBuyerModal(b.key)}
                        title="View"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center mt-4">
          <ReactPaginate
            previousLabel={"<"}
            nextLabel={">"}
            breakLabel={"..."}
            pageCount={pageCount}
            onPageChange={handlePageClick}
            containerClassName={"pagination"}
            activeClassName={"active"}
            forcePage={currentPage}
          />
        </div>
      </div>

      {/* History Modal (per buyer) */}
      {isModalOpen && selectedBuyer && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeBuyerModal}
          title={`Payment History - ${selectedBuyer.buyerName} ${selectedBuyer.isMember && selectedBuyer.buyerId
              ? `(${selectedBuyer.buyerId})`
              : selectedBuyer.buyerPhone
                ? `(${selectedBuyer.buyerPhone})`
                : ""
            }`}
        >
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {/* Summary */}
            <div className="p-3 bg-gray-50 rounded border">
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Buyer: </span>
                  <span className="font-semibold">{selectedBuyer.buyerName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Phone: </span>
                  <span className="font-semibold">{selectedBuyer.buyerPhone || "-"}</span>
                </div>
                <div>
                  <span className="text-gray-600">Overall Unpaid: </span>
                  <span
                    className={`font-semibold ${selectedBuyer.overallUnpaid > 0 ? "text-red-600" : "text-green-600"
                      }`}
                  >
                    ₹{Number(selectedBuyer.overallUnpaid || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Enter Payment */}
            <div className="p-3 border rounded bg-gray-50 flex gap-3 items-center">
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                min={0}
                placeholder="Enter amount"
                className="border px-3 py-2 rounded w-40"
              />
              <button
                onClick={handlePay}
                disabled={!paymentAmount || paymentAmount <= 0}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Pay
              </button>
            </div>

            {/* Auction List */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-3 py-2 border text-left">Date</th>
                    <th className="px-3 py-2 border text-left">Item</th>
                    <th className="px-3 py-2 border text-left">Seller</th>
                    <th className="px-3 py-2 border text-right">Auction Amount</th>
                    {/* <th className="px-3 py-2 border text-right">Paid</th>
            <th className="px-3 py-2 border text-right">Balance</th>
            <th className="px-3 py-2 border text-center">Status</th> */}
                  </tr>
                </thead>
                <tbody>
                  {selectedBuyer.auctions
                    .slice()
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((a) => (
                      <tr key={a._id}>
                        <td className="px-3 py-2 border">
                          {a.date ? new Date(a.date).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-3 py-2 border">{a.item || "-"}</td>
                        <td className="px-3 py-2 border">
                          {a.sellerName || "-"}
                          {a.sellerPhone ? ` (${a.sellerPhone})` : ""}
                        </td>
                        <td className="px-3 py-2 border text-right">₹{a.amount}</td>
                        {/* <td className="px-3 py-2 border text-right text-green-600">
                  ₹{a.totalPaid || 0}
                </td>
                <td className="px-3 py-2 border text-right text-red-600">
                  ₹{a.balance || 0}
                </td>
                <td className="px-3 py-2 border text-center font-semibold">
                  {a.payment_status === "Paid" ? (
                    <span className="text-green-600">Paid</span>
                  ) : (
                    <span className="text-red-600">Unpaid</span>
                  )}
                </td> */}
                      </tr>
                    ))}
                </tbody>

                {/* Totals */}
                <tfoot>
                  <tr className="bg-gray-50 font-bold">
                    <td colSpan={3} className="px-3 py-2 border text-right text-gray-700">
                      Totals
                    </td>
                    <td className="px-3 py-2 border text-right">
                      ₹{selectedBuyer.auctions.reduce((s, a) => s + (a.amount || 0), 0)}
                    </td>
                    {/* <td className="px-3 py-2 border text-right text-green-600">
              ₹{selectedBuyer.auctions.reduce((s, a) => s + (a.totalPaid || 0), 0)}
            </td>
            <td className="px-3 py-2 border text-right text-red-600">
              ₹{selectedBuyer.auctions.reduce((s, a) => s + (a.balance || 0), 0)}
            </td>
            <td className="px-3 py-2 border"></td> */}
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Payment History */}
            {selectedBuyer.payments?.length > 0 && (
              <div className="mt-3">
                <h3 className="font-semibold mb-2">Payments Made</h3>
                <table className="min-w-full bg-white border rounded">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-3 py-2 border text-left">Date</th>
                      <th className="px-3 py-2 border text-right">Amount Paid</th>
                      {/* <th className="px-3 py-2 border text-right">Balance After</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBuyer.payments
                      .slice() // clone array so we don’t mutate
                      .sort((a, b) => new Date(b.date) - new Date(a.date)) // ✅ newest first
                      .map((p, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 border">
                            {new Date(p.date).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2 border text-right text-green-600 font-semibold">
                            ₹{p.amountPaid}
                          </td>
                          {/* <td className="px-3 py-2 border text-right font-semibold">
                            ₹{p.balanceAfter ?? "-"}
                          </td> */}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}


            <div className="flex justify-end pt-2">
              <button
                onClick={closeBuyerModal}
                className="px-4 py-2 text-red-500 border rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>


      )}
    </div>
  );
};

export default AuctionReport;
