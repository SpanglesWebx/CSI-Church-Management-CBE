import React, { useEffect, useState } from 'react';
import { FaEye, FaPlus } from 'react-icons/fa';
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from 'axios';
import { URL } from "../../App";
import moment from 'moment';
import SmallSizedModal from '../../Components/Expense/SmallSizedModal';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../Components/Helpers/Pagination';

export const MemberStatusCheck = () => {
  const navigate = useNavigate();
  const [Response, setResponse] = useState({ status: null, message: "" });
  const token = window.sessionStorage.getItem("token");
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [unpaidMembers, setUnpaidMembers] = useState([]);
  const limit = 10;


  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  // pagination (standard across app)
const [rowsPerPage, setRowsPerPage] = useState(25);
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");


  // MODAL
  const [confirmModal, setConfirmModal] = useState(false);

  useEffect(() => {
    const currentYear = new Date().getFullYear();

    const presentYearStart = `${currentYear}-04-01`;
    const beforeLastYearStart = `${currentYear - 2}-04-01`;
    const presentYearEnd = `${currentYear + 1}-03-31`;

    setStartDate(beforeLastYearStart);
    setEndDate(presentYearEnd);
  }, []);



  useEffect(() => {
    if (!startDate || !endDate) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${URL}/subscriptions/unpaid-members`, {
          params: {
            from: startDate,
            to: endDate,
            page: CurrentPage,
            limit: rowsPerPage,
          },
          headers: { Authorization: token },
        });

        setUnpaidMembers(res.data.unpaidMembers);
        setTotalPages(res.data.totalPages);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);                     // 🔥 stop spinner
      }
    };

    fetchData();
  }, [startDate, endDate, token, CurrentPage, rowsPerPage]);   // 👈 ADD THIS


  const toggleMember = (memberId) => {
    const updated = selectedMembers.includes(memberId)
      ? selectedMembers.filter(id => id !== memberId)
      : [...selectedMembers, memberId];

    setSelectedMembers(updated);
    setSelectAll(updated.length === unpaidMembers.length);
  };

  // SELECT ALL
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedMembers([]);
      setSelectAll(false);
    } else {
      setSelectedMembers(unpaidMembers.map(m => m.member_id));
      setSelectAll(true);
    }
  };

  const holdSelectedMembers = async () => {
    try {
      await axios.post(
        `${URL}/subscriptions/hold-members`,
        { memberIds: selectedMembers },
        { headers: { Authorization: token } }
      );

      // 🟢 SUCCESS TOAST — force re-render
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Success",
          message: "Selected members are now on Hold",
        });
      }, 10);

      // Auto-hide after 3 sec
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);

      // Refresh UI
      setSelectedMembers([]);
      setSelectAll(false);
      setConfirmModal(false);

      const res = await axios.get(`${URL}/subscriptions/unpaid-members`, {
        params: { from: startDate, to: endDate },
        headers: { Authorization: token },
      });

      setUnpaidMembers(res.data.unpaidMembers);

    } catch (err) {
      console.error(err);

      // 🔴 ERROR TOAST — force re-render
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Failed to update members",
        });
      }, 10);

      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    }
  };

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg font-semibold">Membership Status</h1>
        <div className="flex items-center justify-between p-2">
          <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
            <label className="text-l font-medium text-gray-600 mb-1">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 
                                         border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
            />
            <label className="text-l font-medium text-gray-600 mb-1">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 
                                         border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
            />
          </div>

          <div className="flex items-center justify-between px-2 py-3 gap-3">


            <button
              disabled={selectedMembers.length === 0}
              onClick={() => setConfirmModal(true)}
              className={`px-4 py-2 rounded text-white 
              ${selectedMembers.length === 0 ? "bg-gray-400" : "bg-lavender--600"}`}
            >
              Make Them Hold
            </button>
          </div>
          <button onClick={() => navigate('/admin/memberstatus/holdedmembers')} className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg">
            <FaEye /> Holded Member
          </button>
        </div>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Member ID</th>
                <th className="p-2 text-center">Member Name</th>
                <th className="p-2 text-center">Member Status</th>
              </tr>
            </thead>
            <tbody className="relative">
              {loading ? (
                <tr>
                  <td colSpan={5}>
                    <div className="flex items-center justify-center py-12">
                      <div className="w-6 h-6 border-4 border-lavender--600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : unpaidMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">
                    No unpaid members found
                  </td>
                </tr>
              ) : (
                unpaidMembers.map((m, index) => (
                  <tr key={index} className="border-b text-center">
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(m.member_id)}
                        onChange={() => toggleMember(m.member_id)}
                      />
                    </td>
                    <td className="p-2">
                      {(CurrentPage - 1) * rowsPerPage + index + 1}
                    </td>
                    <td>{m.member_id}</td>
                    <td className="text-left">{m.member_name}</td>
                    <td>{m.membership_status}</td>
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

        <SmallSizedModal
          isOpen={confirmModal}
          onClose={() => setConfirmModal(false)}
          title="Confirm Hold"
        >
          <div className="p-2">
            <h2 className="text-lg font-semibold mb-4">
              Do you want to Hold the selected members?
            </h2>

            <div className="flex justify-center space-x-3 mt-4">
              <button
                onClick={() => setConfirmModal(false)}
                className="px-4 py-2 bg-white text-black hover:!text-red-600 border-2 border-black-100 rounded font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={holdSelectedMembers}
                className="px-4 py-2 bg-lavender--600 text-white rounded"
              >
                Yes
              </button>
            </div>
          </div>
        </SmallSizedModal>

      </div>
      {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}
    </>
  )
}
