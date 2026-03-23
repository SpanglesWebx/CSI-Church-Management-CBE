import React, { useEffect, useState } from 'react'
import Pagination from '../../Components/Helpers/Pagination';
import axios from "axios";
import { URL } from "../../App";
import { FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import SmallSizedModal from "../../Components/Expense/SmallSizedModal";
import SubscriptionPrintModal from "./SubscriptionPrintModal";

export const SubsReport = () => {
  const [Response, setResponse] = useState({ status: null, message: "" });
  const navigate = useNavigate();
  const token = window.sessionStorage.getItem("token");
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");
  const [list, setList] = useState([]);



  const [openPrintModal, setOpenPrintModal] = useState(false);

  const [selectedDate, setSelectedDate] = useState("");
  const [dateMembers, setDateMembers] = useState([]);

  const [loadingMembers, setLoadingMembers] = useState(false);
  const [searched, setSearched] = useState(false);




  const [printData, setPrintData] = useState(null);
  const [openPrint, setOpenPrint] = useState(false);
  const [printing, setPrinting] = useState(false);


  const fetchReport = async () => {
    try {
      const res = await fetch(
        `${URL}/subscriptions/report?page=${CurrentPage}&limit=${rowsPerPage}&search=${searchTerm}&from=${startDate}&to=${endDate}`,
        {
          headers: { Authorization: token },
        }
      );

      const data = await res.json();

      setList(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
    }
  };



  useEffect(() => {
    fetchReport();
  }, [CurrentPage, rowsPerPage, searchTerm, startDate, endDate]);

  const handleView = (memberId) => {
    const path = `/admin/subsreport/viewsubreport/${memberId}`;
    console.log("Attempting to navigate to:", path);
    navigate(path);
  };
  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg text-lavender--600 font-semibold">Report</h1>
        <div className="flex items-center justify-between p-2">

          {/* Search */}
          <div className="relative">
            <input
              type="search"
              className="block py-1 text-sm text-gray-900 rounded w-54 ps-3 bg-gray-50"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Print Button */}
          <button
            onClick={() => setOpenPrintModal(true)}
            className="px-4 py-1 text-sm text-white bg-lavender--600 rounded"
          >
            Print Subscription
          </button>

        </div>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Member ID</th>
                <th className="p-2 text-center">Member Name</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {list.length > 0 ? (
                list.map((item, index) => (
                  <tr key={item.member_id} className="border-b">
                    <td className="p-2 text-center">
                      {(CurrentPage - 1) * rowsPerPage + index + 1}
                    </td>

                    <td className="p-2 text-center">{item.member_id}</td>
                    <td className="p-2 text-left">{item.member_name}</td>

                    <td className="p-2 text-center">
                      <FaEye
                        size={18}
                        className="cursor-pointer text-lavender--600 inline-block"
                        onClick={() => {
                          // encodeURIComponent turns "MBR01286/1" into "MBR01286%2F1"
                          const encodedId = encodeURIComponent(item.member_id);
                          navigate(`/admin/subsreport/viewsubreport/${encodedId}`);
                        }}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-400">
                    No data found
                  </td>
                </tr>
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

      <SmallSizedModal
        isOpen={openPrintModal}
        onClose={() => setOpenPrintModal(false)}
        title="Print Subscription"
      >

        <div className="space-y-4 relative">

          <div className="flex items-end gap-3">

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Date
              </label>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setDateMembers([]);
                }}
                className="w-full mt-1 border rounded px-2 py-1"
              />
            </div>

            <button
              className="px-4 py-1 bg-lavender--600 text-white rounded h-[32px]"
              onClick={async () => {

                if (!selectedDate) return;

                try {
                  setLoadingMembers(true);
                  setSearched(true);

                  const res = await axios.get(
                    `${URL}/subscriptions/report/print-by-date`,
                    {
                      params: { date: selectedDate },
                      headers: { Authorization: token }
                    }
                  );

                  setDateMembers(res.data || []);

                } catch (err) {
                  console.error(err);
                  setDateMembers([]);
                } finally {
                  setLoadingMembers(false);
                }

              }}
            >
              Search
            </button>

          </div>
          {/* DATE FILTERED TABLE */}
          {searched && (
            <div className="border rounded mt-4 max-h-60 overflow-y-auto">
              {dateMembers.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="p-2 text-left">Member ID</th>
                      <th className="p-2 text-left">Member Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dateMembers.map(m => (
                      <tr key={m.member_id} className="border-b">
                        <td className="p-2">{m.member_id}</td>
                        <td className="p-2">{m.member_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-3 text-center text-gray-400">
                  {loadingMembers
                    ? "Loading subscriptions..."
                    : "No subscriptions found for this date"}
                </div>
              )}
            </div>
          )}

          {/* PRINT BUTTON CENTER */}
          <div className="flex justify-center pt-4">
            <button
              disabled={printing}
              className={`px-6 py-2 rounded text-white ${printing ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"
                }`}
              onClick={async () => {
                if (!selectedDate) return;

                try {
                  setPrinting(true);

                  const res = await axios.get(
                    `${URL}/subscriptions/report/print-by-date`,
                    {
                      params: { date: selectedDate },
                      headers: { Authorization: token }
                    }
                  );

                  const formatted = res.data.map(d => ({
                    title: d.member_title,
                    name: d.member_name,
                    address: d.address,
                    pincode: d.pincode,
                    member_id: d.member_id,
                    date: d.date,
                    selectedMonthsData: d.paidMonths,
                    months: d.paidMonths.map(m => `${m.month} ${m.year}`)
                  }));

                  setPrintData(formatted);
                  setOpenPrint(true);

                } catch (err) {
                  console.error(err);
                } finally {
                  setPrinting(false);
                }
              }}
            >
              {printing ? "Preparing Print..." : "Print"}
            </button>
          </div>

        </div>
        <SubscriptionPrintModal
          isOpen={openPrint}
          onClose={() => setOpenPrint(false)}
          data={printData}
        />
      </SmallSizedModal>

      {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}
    </>
  )
}
