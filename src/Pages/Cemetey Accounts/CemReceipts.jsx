import React, { useEffect, useRef, useState } from "react";
import { FaEye, FaPlus } from "react-icons/fa";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from "axios";
import { URL } from "../../App";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import Pagination from "../../Components/Helpers/Pagination";
import { jwtDecode } from "jwt-decode";
import { BiSolidEditAlt } from "react-icons/bi";

export const CemReceipts = () => {
  const [Response, setResponse] = useState({ status: null, message: "" });
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


  const navigate = useNavigate();
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [receipts, setReceipts] = useState([]);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");
  const [viewReceipt, setViewReceipt] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  /* ===============================
     VIEW RECEIPT
  =============================== */
  const openView = async (id) => {
    try {
      const res = await axios.get(`${URL}/cem-receipts/${id}`, {
        headers: { Authorization: token }
      });

      setSelectedReceipt(res.data.data);
      setIsViewOpen(true);
    } catch (err) {
      console.error("Failed to fetch receipt", err);
    }
  };

  const getReceiptNumbers = (receipt) => {
    return (receipt.receiptLines || [])
      .map(l => l.receiptNumber)
      .filter(Boolean)
      .sort((a, b) => Number(a) - Number(b))
      .join(", ");
  };

  /* ===============================
     FETCH RECEIPTS
  =============================== */
  const fetchReceipts = async () => {
    try {
      const res = await axios.get(`${URL}/cem-receipts/list`, {
        headers: { Authorization: token },
        params: {
          page: CurrentPage,
          limit: rowsPerPage,
          search: searchTerm,
          startDate,
          endDate,
        },
      });

      setReceipts(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Fetch receipts error", err);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [CurrentPage, rowsPerPage, searchTerm, startDate, endDate]);

  const isMultipleLines =
    selectedReceipt?.receiptLines &&
    selectedReceipt.receiptLines.length > 1;

  const singleLine =
    selectedReceipt?.receiptLines?.[0];

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg text-lavender--600 font-semibold">Receipts</h1>

        <div className="flex items-center justify-between p-2">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                <svg className="w-3 h-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input
                type="search"
                id="default-search"
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <label>From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="py-1 text-sm rounded border px-2"
            />
            <label>To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="py-1 text-sm rounded border px-2"
            />
          </div>
          {["admin", "churchofficeworker"].includes(userRole) && (
            <div>
              <button
                onClick={() => navigate("/admin/cemreceipts/addcemreceipts")}
                className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg"
              >
                <FaPlus /> Receipt
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Receipt ID</th>
                <th className="p-2 text-center">Trans No</th>
                <th className="p-2 text-center">Receipt Number</th>
                <th className="p-2 text-center">Receipt For</th>
                <th className="p-2 text-center">Name</th>
                <th className="p-2 text-center">Amount</th>
                <th className="p-2 text-center">Date</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-3 text-center text-gray-500">
                    No receipts found
                  </td>
                </tr>
              ) : (
                receipts.map((rec, index) => (
                  <tr key={rec._id} className="border-b">
                    <td className="p-2 text-center">
                      {(CurrentPage - 1) * rowsPerPage + index + 1}
                    </td>

                    <td className="p-2 text-center font-medium">
                      {rec.autoReceiptId}
                    </td>
                    <td className="p-2 text-center font-medium">
                      {rec.transNo}
                    </td>

                    <td className="p-2 text-center">
                      {rec.receiptNumbers || "-"}
                    </td>

                    <td className="p-2 text-left">
                      {rec.receiptFor && (
                        <>
                          <span className="text-lavender--600 font-semibold">
                            ({rec.receiptFor.ledgerCode})
                          </span>{" "}
                          {rec.receiptFor.ledgerName}

                          {rec.receiptFor.totalLines > 1 && (
                            <span className="text-gray-600 font-medium">
                              {" "}+ {rec.receiptFor.totalLines - 1}
                            </span>
                          )}
                        </>
                      )}
                    </td>

                    <td className="p-2 text-center">
                      {rec.name || "-"}
                    </td>
                    <td className="p-2 text-center">
                      ₹{rec.amount}
                    </td>

                    <td className="p-2 text-center">
                      {moment(rec.date).format("DD-MM-YYYY")}
                    </td>

                    <td className="p-2 text-center flex items-center gap-2 justify-center">
                      <FaEye
                        size={18}
                        className="cursor-pointer text-lavender--600"
                        onClick={() =>
                          navigate(`/admin/cemreceipts/viewcemreceipts/${rec._id}`)
                        }
                      />
                      {["admin", "treasurer"].includes(userRole) &&
                        !rec.receiptRealised &&
                        !rec.receiptReturned && (
                          <BiSolidEditAlt
                            size={20}
                            className="cursor-pointer text-lavender--600"
                            onClick={() =>
                              navigate(`/admin/cemreceipts/editcemreceipts/${rec._id}`)
                            }
                          />
                        )}
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
