import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FaArrowLeft, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import Pagination from "../../Components/Helpers/Pagination";

const URL = import.meta.env.VITE_BACKEND_API_URL;

const tableHeading = [
  "Sl. No.",
  "Buyer ID",
  "Buyer Name",
  "Buyer Phone",
  "Overall Unpaid",
  "Action",
];

export const HarvestAucReport = () => {
  const [auctions, setAuctions] = useState([]);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
const [CurrentPage, setCurrentPage] = useState(1);
const [TotalPages, setTotalPages] = useState(1);
const [searchQuery, setSearchQuery] = useState("");

// shared pagination states
const [rowsPerPage, setRowsPerPage] = useState(25);
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");
  const [totalOverallUnpaid, setTotalOverallUnpaid] = useState(0);


  const token = window.sessionStorage.getItem("token");

  // fetch buyer-centric report
  // useEffect(() => {
  //   const fetchAuctions = async () => {
  //     try {
  //       const res = await axios.get(`${URL}/harvest-auctions/report/by-buyer`, {
  //         headers: { Authorization: token },
  //       });
  //       setAuctions(Array.isArray(res.data) ? res.data : []);
  //     } catch (err) {
  //       console.error("Error fetching harvest auctions:", err);
  //       setAuctions([]);
  //     }
  //   };
  //   fetchAuctions();
  // }, [token]);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await axios.get(`${URL}/harvest-auctions/report/by-buyer`, {
          params: { page: CurrentPage, limit: rowsPerPage, search: searchQuery },
          headers: { Authorization: token },
        });

        setAuctions(res.data.buyers || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalOverallUnpaid(res.data.totalOverallUnpaid || 0);
      } catch (err) {
        console.error("Error fetching harvest auctions:", err);
        setAuctions([]);
      }
    };
    fetchAuctions();
  }, [token, CurrentPage, searchQuery, rowsPerPage]);


  const handleView = (buyer) => {
    setSelectedBuyer(buyer);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedBuyer(null);
    setIsModalOpen(false);
    setPaymentAmount("");
  };

  const handlePayment = async (auctionId) => {
    if (!paymentAmount || isNaN(paymentAmount) || paymentAmount <= 0) {
      alert("Enter a valid payment amount");
      return;
    }

    try {
      await axios.post(
        `${URL}/harvest-auctions/payment`,
        { auctionId, amountPaid: Number(paymentAmount), source: "Direct", },
        { headers: { Authorization: token } }
      );

      // Refresh report
      const res = await axios.get(`${URL}/harvest-auctions/report/by-buyer`, {
        headers: { Authorization: token },
      });

      const updatedBuyer = res.data.find((b) => b.key === selectedBuyer.key);
      setSelectedBuyer(updatedBuyer);
      setPaymentAmount("");
    } catch (err) {
      console.error("Payment error:", err.response?.data || err);
      alert("Payment failed");
    }
  };

  const navigate = useNavigate();

  return (
    <div className="">
      <FaArrowLeft
        size={18}
        onClick={() => navigate(-1)}
        className="cursor-pointer"
      />
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-4">
          <h3 className=" font-semibold">Harvest Auction Reports</h3>
          <div className="">
            <label
              htmlFor="default-search"
              className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
            >
              Search Members
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                <svg
                  className="w-3 h-3 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
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
              <input
                type="search"
                id="default-search"
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-lavender--600 dark:focus:border-lavender--600"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // reset to first page when searching
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">Total Unpaid (All Buyers)</p>
            <p className="text-lg font-bold text-red-600">
              ₹ {Number(totalOverallUnpaid).toLocaleString()}
            </p>
          </div>
        </div>

        { }
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
              {auctions.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-gray-500"
                    colSpan={tableHeading.length}
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                auctions.map((buyer, bi) => (
                  <tr key={bi} className="border-b">
<td className="px-4 py-2 text-center">
{(CurrentPage - 1) * rowsPerPage + bi + 1}
</td>
                    <td className="px-4 py-2 text-center">
                      {buyer.isMember
                        ? buyer.buyerId
                        : buyer.buyerPhone
                          ? `Phone: ${buyer.buyerPhone}`
                          : "Non-Member"}
                    </td>
                    <td className="px-4 py-2">{buyer.buyerName}</td>
                    <td className="px-4 py-2 text-center">{buyer.buyerPhone}</td>
                    <td
                      className={`px-4 py-2 text-center font-semibold ${buyer.overallUnpaid > 0 ? "text-red-600" : "text-green-600"
                        }`}
                    >
                      ₹{Number(buyer.overallUnpaid || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <FaEye
                        className="cursor-pointer mx-auto text-lavender--600 hover:text-lavender--600"
                        onClick={() => handleView(buyer)}
                        title="View"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>


<Pagination
  currentPage={CurrentPage}
  totalPages={TotalPages}
  rowsPerPage={rowsPerPage}
  rowsInput={rowsInput}
  jumpInput={jumpInput}
  setCurrentPage={setCurrentPage}
  setRowsPerPage={setRowsPerPage}
  setRowsInput={setRowsInput}
  setJumpInput={setJumpInput}
  defaultRows={25}
/>

        {/* <div className="relative flex flex-wrap items-center justify-center mt-4 space-x-3 select-none">
          <button
            onClick={() => setCurrentPage(CurrentPage - 1)}
            disabled={CurrentPage === 1}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span className="px-4 py-2 bg-lavender--600 text-white rounded">
            {CurrentPage}
          </span>

          <button
            onClick={() => setCurrentPage(CurrentPage + 1)}
            disabled={CurrentPage === TotalPages}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>

          <div className="absolute flex px-5 space-x-2 rounded right-1">
            <span className="px-4 py-2 text-gray-700 bg-gray-100 rounded">
              Total Pages: {TotalPages}
            </span>
            <span
              onClick={() => setCurrentPage(TotalPages)}
              className={`${TotalPages === CurrentPage
                ? "opacity-50 bg-gray-100 px-4 py-2 cursor-not-allowed"
                : "px-4 py-2 text-blue-400 bg-gray-100 rounded cursor-pointer"
                }`}
            >
              Last Page
            </span>
          </div>
        </div> */}
      </div>

      {/* Modal */}
      {isModalOpen && selectedBuyer && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={`Payment History - ${selectedBuyer.buyerName} ${selectedBuyer.isMember && selectedBuyer.buyerId
            ? `(${selectedBuyer.buyerId})`
            : selectedBuyer.buyerPhone
              ? `(${selectedBuyer.buyerPhone})`
              : ""
            }`}
        >
          <div className="space-y-3 max-h-[650px] overflow-y-auto">
            {/* Buyer Info */}
            <div className="bg-gray-50 border rounded-lg text-[20px] p-4 mb-4 flex flex-wrap items-center space-x-6">
              <p>
                <span className="font-semibold">Buyer:</span> {selectedBuyer.buyerName}
              </p>
              <p>
                <span className="font-semibold">Phone:</span> {selectedBuyer.buyerPhone}
              </p>
              <p className="font-semibold">
                Due Amount:{" "}
                <span className="text-red-600 font-bold">
                  ₹ {selectedBuyer.overallUnpaid}
                </span>
              </p>
            </div>

            {/* Payment Input */}
            {/* <div className="flex space-x-2 mb-4">
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
                className="border rounded px-3 py-2 flex-1"
              />
              <button
                onClick={() => handlePayment(selectedBuyer.auctions[0]._id)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Pay
              </button>
            </div> */}

            {/* Auctions Table */}
            <table className="w-full border mb-6">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Item</th>
                  <th className="p-2 border">Seller</th>
                  <th className="p-2 border text-right">Auction Amount</th>
                </tr>
              </thead>
              <tbody>
                {selectedBuyer.auctions.map((auction) => (
                  <tr key={auction._id} className="hover:bg-gray-50">
                    <td className="p-2 border">
                      {new Date(auction.date).toLocaleDateString()}
                    </td>
                    <td className="p-2 border">{auction.item}</td>
                    <td className="p-2 border">{auction.sellerName}</td>
                    <td className="p-2 border text-right">₹{auction.amount}</td>
                  </tr>
                ))}
                <tr className="font-bold bg-gray-50">
                  <td colSpan="3" className="p-2 border text-right">
                    Totals
                  </td>
                  <td className="p-2 border text-right">
                    ₹
                    {selectedBuyer.auctions.reduce((sum, a) => sum + a.amount, 0)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Payments Made */}
            {selectedBuyer.payments && selectedBuyer.payments.length > 0 && (
              <>
                <h3 className="text-md font-bold mb-2">Payments Made</h3>
                <table className="w-full border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Date</th>
                      <th className="p-2 border text-right">Amount Paid</th>
                      <th className="p-2 border text-center">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBuyer.payments.map((p, idx) => (
                      <tr key={idx} className="">
                        <td className="p-2 border">
                          {new Date(p.date).toLocaleDateString()}
                        </td>
                        <td className="p-2 border text-right text-green-600 font-semibold">
                          ₹{p.amount}
                        </td>
                        <td className="p-2 border text-center">
                          {p.source}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}


          </div>
        </Modal>
      )}
    </div>
  );
};
