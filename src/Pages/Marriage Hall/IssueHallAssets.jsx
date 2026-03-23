import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { FaEye, FaPlus, FaPrint } from 'react-icons/fa6'
import { FiDownload } from 'react-icons/fi'
import { URL } from '../../App';
import Modal from '../../Components/Expense/ExpenseFormModal';
import Pagination from '../../Components/Helpers/Pagination';

export const IssueHallAssets = () => {

  const token = window.sessionStorage.getItem("token");
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [issuedList, setIssuedList] = useState([]);
  const [viewIssueModal, setViewIssueModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(25);
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");




  const fetchIssuedAssets = async () => {
    try {
      const res = await axios.get(`${URL}/kitchen-asset-issues`, {
        headers: { Authorization: token },
        params: { page: CurrentPage, limit: rowsPerPage, search: searchTerm }
      });

      setIssuedList(res.data.data || []);

const pages = res.data.totalPages || 1;
setTotalPages(pages);

if (CurrentPage > pages) {
  setCurrentPage(1);
}

    } catch (err) {
      console.error(err);
    }
  };

useEffect(() => {
  fetchIssuedAssets();
}, [CurrentPage, rowsPerPage, searchTerm]);


  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-2">
          <h1 className="text-lg font-semibold">Issued Assets</h1>
          <div className="flex items-center justify-between gap-3">
            <FiDownload size={20} className="text-lavender--600 cursor-pointer" title="Download" />
            <FaPrint size={20} className="text-lavender--600 cursor-pointer" title="Print" />
          </div>
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
              id="shop-search"
              className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50"
              placeholder="Search Name"
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
                <th className="p-2 text-center">Hall Name</th>
                <th className="p-2 text-center">Customer Name</th>
                <th className="p-2 text-center">Booking Date</th>
                <th className="p-2 text-center">No. of Items</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {issuedList.length === 0 && (
                <tr><td colSpan="6" className="text-center p-3">No records</td></tr>
              )}

              {issuedList.map((row, i) => (
                <tr key={row._id} className="border-b text-center">
                  <td className="p-2 text-center">{(CurrentPage - 1) * rowsPerPage + i + 1}</td>
                  <td className="p-2 text-center">{row.hall_id?.hall_name || "-"}</td>
                  <td className="p-2 text-left">{row.customer_name}</td>
                  <td className="p-2 text-center">{new Date(row.booking_date).toLocaleDateString("en-GB")}</td>
                  <td className="p-2 text-center font-semibold">{row.items.length}</td>
                  <td className="p-2 text-center">
                    <FaEye size={18} className="cursor-pointer text-lavender--600 mx-auto"
                      onClick={() => {
                        setSelectedIssue(row);
                        setViewIssueModal(true);
                      }} />
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


        <Modal isOpen={viewIssueModal} onClose={() => setViewIssueModal(false)} title="Issued Asset Details">

          {selectedIssue && (
            <div className="flex flex-col space-y-3 max-h-[650px] overflow-y-auto">

              {[
                { label: "Hall", value: selectedIssue.hall_id?.hall_name },
                { label: "Customer Name", value: selectedIssue.customer_name },
                { label: "Booking Date", value: new Date(selectedIssue.booking_date).toLocaleDateString("en-GB") },
                { label: "No. of Item Types", value: selectedIssue.items.length }
              ].map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2">
                  <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700">
                    {item.label}
                  </div>
                  <div className="col-span-12 sm:col-span-8 text-base text-gray-800">
                    {item.value}
                  </div>
                </div>
              ))}

              {/* ITEMS TABLE */}
              <div className="mt-6 p-2 border rounded-md bg-gray-50">
                <h2 className="text-lg font-semibold mb-2">Issued Items</h2>

                <table className="w-full text-sm border">
                  <thead className="">
                    <tr className='text-center'>
                      <th className="p-2 border">Sl</th>
                      <th className="p-2 border">Item</th>
                      <th className="p-2 border">Issued</th>
                      <th className="p-2 border">Returned</th>
                      <th className="p-2 border">Damaged</th>
                      <th className="p-2 border">Missing</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedIssue.items.map((i, idx) => (
                      <tr key={i._id} className="border-b text-center">
                        <td className="p-2 border">{idx + 1}</td>
                        <td className="p-2 border">{i.item_name}</td>
                        <td className="p-2 border font-semibold">{i.issued_qty}</td>
                        <td className="p-2 border">{i.returned}</td>
                        <td className="p-2 border">{i.damaged}</td>
                        <td className="p-2 border">{i.missing}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}
        </Modal>

      </div>
    </>
  )
}
