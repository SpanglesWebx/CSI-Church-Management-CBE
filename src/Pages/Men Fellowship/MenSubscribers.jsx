import React, { useEffect, useState } from "react";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { Checkbox, FormControlLabel } from "@mui/material";
import axios from "axios";
import { URL } from "../../App";
import MenMemberPagination from "../../Components/Helpers/MenMemberPagination";

export const MenSubscribers = () => {
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [showTamilOnly, setShowTamilOnly] = useState(false);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");

  const token = window.sessionStorage.getItem("token");

  const fetchMenSubscribers  = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${URL}/men-subscribers`, {
        params: {
          search: searchQuery,
          page: CurrentPage,
          limit: rowsPerPage,
        },
        headers: { Authorization: token },
      });

      setSubscribers(res.data.subscribers || []);
      setTotalPages(res.data.totalPages || 1);

    } catch (err) {
      console.error("❌ Error fetching women subscribers:", err);
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenSubscribers();
  }, [searchQuery, CurrentPage, rowsPerPage]);

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">

        {/* Header */}
        <div className="flex flex-col items-center justify-between lg:flex-row">
          <div className="flex flex-wrap items-center p-4 space-x-3">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                <svg className="w-3 h-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input
                type="search"
                id="shop-search"
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50"
                placeholder="Search by Name or ID"
                value={searchQuery}
                onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
                }}
              />
            </div>
          </div>
          </div>

          <FormControlLabel
            control={
              <Checkbox
                checked={showTamilOnly}
                onChange={(e) => setShowTamilOnly(e.target.checked)}
              />
            }
            label="Tamil Names Only"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-8">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 text-center">
              <tr>
                <th className="p-2">Sl No.</th>
                <th className="p-2">Member ID</th>
                {showTamilOnly ? (
                  <th className="p-2">Member Tamil Name</th>
                ) : (
                  <>
                    <th className="p-2">Member Name</th>
                    <th className="p-2">Member Tamil Name</th>
                  </>
                )}
                <th className="p-2">Phone</th>
              </tr>
            </thead>

            <tbody className="text-center">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-4">Loading...</td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4">No Men Subscribers Found</td>
                </tr>
              ) : (
                subscribers.map((m, index) => (
                  <tr key={m.member_id} className="border-b">
                    <td className="p-2">
                      {(CurrentPage - 1) * rowsPerPage + index + 1}
                    </td>
                    <td className="p-2">{m.member_id}</td>

                    {showTamilOnly ? (
                      <td className="p-2 text-left">
                        {m.member_tamil_name || "-"}
                      </td>
                    ) : (
                      <>
                        <td className="p-2 text-left">{m.member_name}</td>
                        <td className="p-2 text-left">
                          {m.member_tamil_name || "-"}
                        </td>
                      </>
                    )}

                    <td className="p-2">{m.primary_contact_number}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <MenMemberPagination
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

      {Response.status && (
        Response.status === "Success"
          ? <SuccessMessage Message={Response.message} />
          : <FailedMessage Message={Response.message} />
      )}
    </>
  );
};
