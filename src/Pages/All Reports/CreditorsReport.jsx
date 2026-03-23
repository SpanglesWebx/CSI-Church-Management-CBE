import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Pagination from '../../Components/Helpers/Pagination';
import { FaEye } from 'react-icons/fa';
import { URL } from '../../App';
import axios from 'axios';
import JournalModal from '../../Components/Expense/JournalModal';

export const CreditorsReport = () => {
  const navigate = useNavigate();
  const token = window.sessionStorage.getItem("token");
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ledgerRows, setLedgerRows] = useState([]);
  const [selectedCreditor, setSelectedCreditor] = useState(null);
  const [creditors, setCreditors] = useState([]);

  const fetchCreditors = async () => {
    const res = await axios.get(
      `${URL}/creditor-report/list`,
      { headers: { Authorization: token } }
    );

    setCreditors(res.data.data || []);
  };

  useEffect(() => {
    fetchCreditors();
  }, []);


  const openLedger = async (creditor) => {
    setSelectedCreditor(creditor);

    const res = await axios.get(
      `${URL}/creditor-report/ledger`,
      {
        headers: { Authorization: token },
        params: {
          creditorId: creditor.id
        }
      }
    );

    setLedgerRows(res.data.rows);
    setIsModalOpen(true);
  };


  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-2">
          <h1 className="text-lg font-semibold text-lavender--600">Creditor Report</h1>
        </div>
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
                id="shop-search"
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50"
                placeholder="Search by Name or ID"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); changePage(1); }}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Creditor ID</th>
                <th className="p-2 text-center">Creditor Name</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {creditors.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-3 text-center text-gray-500">
                    No creditors found
                  </td>
                </tr>
              ) : (
                creditors.map((row, index) => (
                  <tr key={row.id} className="border-b">
                    <td className="p-2 text-center">
                      {(CurrentPage - 1) * rowsPerPage + index + 1}
                    </td>

                    <td className="p-2 text-center font-medium">
                      {row.id}
                    </td>

                    <td className="p-2 text-left">
                      {row.name}
                    </td>

                    <td className="p-2 text-center">
                      <FaEye size={18}
                        className="text-lavender--600 cursor-pointer mx-auto"
                        onClick={() => openLedger(row)}
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


      </div>

      <JournalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Creditor Ledger"
      >
        <div className="text-center mb-4">
          <h2 className="font-bold text-lg">{selectedCreditor?.name}</h2>
          <p className="text-sm text-gray-500">{selectedCreditor?.id}</p>
        </div>

        <table className="w-full text-sm border">
  <thead className="bg-gray-100">
    <tr>
      <th className="p-2">Date</th>
      <th className="p-2">Tran No</th>
      <th className="p-2">A/C Description</th>
      <th className="p-2 text-right">Dr Amount</th>
      <th className="p-2 text-right">Cr Amount</th>
    </tr>
  </thead>

  <tbody>
    {ledgerRows.map((r, i) => (
      <tr key={i} className="border-t">
        <td className="p-2">
          {new Date(r.date).toLocaleDateString("en-GB")}
        </td>
        <td className="p-2">{r.tranNo}</td>
        <td className="p-2">{r.description}</td>
        <td className="p-2 text-right">
          {r.debit ? r.debit.toLocaleString() : ""}
        </td>
        <td className="p-2 text-right">
          {r.credit ? r.credit.toLocaleString() : ""}
        </td>
      </tr>
    ))}
  </tbody>

  {/* GRAND TOTAL (LIKE SHEET) */}
  <tfoot className="bg-gray-100 font-semibold">
    <tr>
      <td colSpan="3" className="p-2 text-right">Grand Total</td>
      <td className="p-2 text-right">
        {ledgerRows.reduce((s, r) => s + r.debit, 0).toLocaleString()}
      </td>
      <td className="p-2 text-right">
        {ledgerRows.reduce((s, r) => s + r.credit, 0).toLocaleString()}
      </td>
    </tr>
  </tfoot>
</table>

      </JournalModal>

    </>
  )
}
