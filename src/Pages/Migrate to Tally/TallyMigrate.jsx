import React, { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";
import axios from "axios";
import { URL } from "../../App";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { jwtDecode } from "jwt-decode";
import Modal from "../../Components/Expense/ExpenseFormModal";
import Pagination from "../../Components/Helpers/Pagination";

export const TallyMigrate = () => {
  const token = sessionStorage.getItem("token");
  const [userRole, setUserRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");

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

  const openViewModal = (log) => {
    setSelectedLog(log);
    setIsViewOpen(true);
  };

  const capitalize = (text = "") =>
    text.charAt(0).toUpperCase() + text.slice(1);


  let loggedInUser = "-";
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const rawRole =
        sessionStorage.getItem("role") || decoded.roles?.[0] || "";

      const activeRole = capitalize(rawRole);

      loggedInUser = `(${decoded.member_id}) - ${activeRole}`;
    } catch (err) {
      console.error("Invalid token", err);
    }
  }

  let triggeredBy = {
    user_id: "",
    user_name: "",
    role: "",
  };

  if (token) {
    try {
      const decoded = jwtDecode(token);

      triggeredBy = {
        user_id: decoded.member_id || decoded.user_id || "",
        user_name: decoded.member_name || decoded.name || "",
        role: sessionStorage.getItem("role") || decoded.roles?.[0] || "",
      };
    } catch (err) {
      console.error("Invalid token", err);
    }
  }


  const [logs, setLogs] = useState([]);
  const [Response, setResponse] = useState({ status: null, message: "" });

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${URL}/tally/migration-history`, {
        headers: { Authorization: token },
        params: {
          page: CurrentPage,
          limit: rowsPerPage,
        },
      });

      setLogs(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);

      if (CurrentPage > (res.data.totalPages || 1)) {
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Failed to fetch migration history", err);
    }
  };


  useEffect(() => {
    fetchHistory();
  }, [CurrentPage, rowsPerPage]);

  useEffect(() => {
    const blockRefresh = (e) => {
      if (saving) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", blockRefresh);
    return () => window.removeEventListener("beforeunload", blockRefresh);
  }, [saving]);



  const handleMigrateToTally = async () => {
    if (saving) return;
    try {
      setSaving(true);
      await axios.post(
        `${URL}/tally/migrate/receipts`, {
        triggered_by: triggeredBy, // ✅ SEND DECODED DATA
      },
        { headers: { Authorization: token } }
      );

      setResponse({
        status: "Success",
        message: "Migration to Tally completed successfully",
      });

      fetchHistory();
    } catch (err) {
      setResponse({
        status: "Failed",
        message: "Migration to Tally failed",
      });
    } finally {
      setSaving(false); // 🔓 always unlock UI
    }

    setTimeout(() => {
      setResponse({ status: null, message: "" });
    }, 3000);
  };

  const formatTriggeredBy = (triggeredBy) => {
    if (!triggeredBy) return "-";

    const id = triggeredBy.user_id || "-";
    const role = triggeredBy.role
      ? triggeredBy.role.charAt(0).toUpperCase() + triggeredBy.role.slice(1)
      : "";

    return role ? `(${id}) - ${role}` : `(${id})`;
  };


  return (
    <>
      <div className={`p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px] 
        ${saving ? "pointer-events-none opacity-60" : ""}`}
      >
        <div className="flex items-center justify-between p-2">
          <h1 className="text-lg font-semibold">Tally Migration</h1>
          {["admin", "churchofficeworker"].includes(userRole) && (
          <button
            onClick={handleMigrateToTally}
            disabled={saving}
            className={`px-4 py-2 rounded-lg text-white flex items-center gap-2
            ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}
              `}
          >
            {saving && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            {saving ? "Migrating..." : "Migrate to Tally"}
          </button>
          )}

        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Date and Time</th>
                <th className="p-2 text-center">Logged in User</th>
                <th className="p-2 text-center">Migration Status</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-400">
                    No migration history found
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr key={log._id} className="border-b text-center">
                    <td className="p-2">{(CurrentPage - 1) * rowsPerPage + index + 1}</td>
                    <td className="p-2">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-2">{formatTriggeredBy(log.triggered_by)}</td>
                    <td
                      className={`p-2 font-semibold ${log.status === "Success"
                        ? "text-green-600"
                        : "text-red-600"
                        }`}
                    >
                      {log.status}
                    </td>
                    <td className="p-2">
                      <FaEye size={18} onClick={() => openViewModal(log)} className="mx-auto text-lavender--600 cursor-pointer" />
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

        <Modal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          title="Tally Migration Details"
        >
          {selectedLog && (
            <div className="flex flex-col pt-5 ps-5 w-full max-w-4xl space-y-4 max-h-[650px] overflow-y-auto">

              {/* SUMMARY */}
              {[
                { label: "Migration Type", value: selectedLog.migration_type },
                { label: "Total Entries", value: selectedLog.total_entries },
                { label: "Total Receipts", value: `₹ ${selectedLog.total_receipts}` },
                { label: "Total Payments", value: `₹ ${selectedLog.total_payments}` },
                { label: "Status", value: selectedLog.status },
                {
                  label: "Migrated On",
                  value: new Date(selectedLog.createdAt).toLocaleString(),
                },
              ].map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 pb-2">
                  <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700">
                    {item.label}
                  </div>
                  <div className="col-span-12 sm:col-span-8 text-base text-gray-800">
                    {item.value}
                  </div>
                </div>
              ))}

              <hr className="my-2" />

              {/* DETAILS HEADER */}
              <h2 className="text-lg font-semibold text-gray-800">
                Migrated Details
              </h2>

              {/* DETAILS LIST */}
              {selectedLog.details.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-2 bg-gray-50"
                >
                  {[
                    { label: "Source", value: item.source },
                    { label: "Heading", value: item.heading },
                    { label: "Entries Count", value: item.count },
                    { label: "Amount", value: `₹ ${item.amount}` },
                  ].map((row, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2">
                      <div className="col-span-12 sm:col-span-4 font-medium text-gray-600">
                        {row.label}
                      </div>
                      <div className="col-span-12 sm:col-span-8 text-gray-800">
                        {row.value}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </Modal>

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
