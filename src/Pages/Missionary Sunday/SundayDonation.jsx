import React, { useEffect, useState } from 'react';
import { FaEye, FaPlus } from 'react-icons/fa';
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from 'axios';
import { URL } from "../../App";
import moment from 'moment';
import Pagination from '../../Components/Helpers/Pagination';

export const SundayDonation = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const token = window.sessionStorage.getItem("token");
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [donationDate, setDonationDate] = useState("");
  const [amount, setAmount] = useState("");
  const [donations, setDonations] = useState([]);
  const [description, setDescription] = useState("");
  // pagination (standard reusable)
const [rowsPerPage, setRowsPerPage] = useState(25); // ✅ default 25
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");




const fetchDonations = async () => {
  try {
    const res = await axios.get(`${URL}/missionary-sunday-donation/list`, {
      headers: { Authorization: token },
      params: {
        page: CurrentPage,
        limit: rowsPerPage,
        search: searchTerm,
        startDate,
        endDate
      }
    });

    setDonations(res.data.donations || []);
    setTotalPages(res.data.totalPages || 1);

  } catch (error) {
    console.error(error);
  }
};


useEffect(() => {
  fetchDonations();
}, [CurrentPage, searchTerm, startDate, endDate, rowsPerPage]);




  const saveDonation = async () => {
    if (!donationDate || !amount) {
      // ❗ Force toast re-render for error
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "All fields are required"
        });
      }, 10);

      setTimeout(() => {
        setResponse({ status: null, message: "" });
      }, 3000);

      return;
    }

    try {
      await axios.post(
        `${URL}/missionary-sunday-donation/add`,
        {
          date: donationDate,
          amount: Number(amount),
          description,
        },
        {
          headers: { Authorization: token }
        }
      );

      // 🔄 Force toast re-render for success
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Success",
          message: "Donation added successfully"
        });
      }, 10);

      // Close modal
      setIsModalOpen(false);

      // Reset input fields
      setDonationDate("");
      setAmount("");

      // Refresh listing
      fetchDonations();

    } catch (error) {
      console.error(error);

      // 🔄 Forced toast for errors
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Server error"
        });
      }, 10);
    } finally {
      // ⏱ Auto-clear
      setTimeout(() => {
        setResponse({ status: null, message: "" });
      }, 3000);
    }
  };




  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg font-semibold">Missionary Sunday Donation</h1>
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
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg"
          >
            <FaPlus /> Donation
          </button>
        </div>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Amount</th>
                <th className="p-2 text-center">Date</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {donations.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-3 text-center text-gray-500">
                    No records found
                  </td>
                </tr>
              )}

              {donations.map((item, index) => (
                <tr key={item._id} className="border-b text-center">
                  <td className="p-2">{(CurrentPage - 1) * rowsPerPage + index + 1}</td>
                  <td className="p-2">₹{item.amount}</td>
                  <td className="p-2">{moment(item.date).format("DD/MM/YYYY")}</td>
                  <td className="p-2 text-center">
                    <FaEye size={18} className="cursor-pointer text-lavender--600 mx-auto" onClick={() => { setSelectedDonation(item); setIsViewOpen(true); }} />
                  </td>
                </tr>
              ))}
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Donation">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={donationDate}
              onChange={(e) => setDonationDate(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => {
                const val = e.target.value;

                // Allow ONLY numbers (0–9)
                if (/^\d*$/.test(val)) {
                  setAmount(val);
                }
              }}
              placeholder="Enter Amount"
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              placeholder='Enter Description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={saveDonation}
            className="px-4 py-2 bg-lavender--600 text-white rounded-md"
          >
            Save
          </button>
        </div>

      </Modal>

      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Donation Details">
        {selectedDonation && (
          <div className="flex flex-col pt-5 ps-5 w-full max-w-4xl space-y-3 max-h-[650px] overflow-y-auto">

            {[
              { label: "Amount", value: `₹ ${selectedDonation.amount}` },
              {
                label: "Date",
                value: moment(selectedDonation.date).format("DD-MM-YYYY"),
              },
              { label: "Description", value: selectedDonation.description || "-" },
            ].map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-2 pb-2 last:border-none"
              >
                <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700">
                  {item.label}
                </div>

                <div
                  className={`col-span-12 sm:col-span-8 text-base text-gray-800`}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {Response.status && (
        Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : (
          <FailedMessage Message={Response.message} />
        )
      )}
    </>
  )
}
