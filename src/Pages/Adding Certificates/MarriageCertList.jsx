import React, { useEffect, useState } from 'react'
import { FaEye, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FailedMessage, SuccessMessage } from '../../Components/ToastMessage';
import Pagination from '../../Components/Helpers/Pagination';
import { URL } from '../../App';
import moment from 'moment';
export const MarriageCertList = () => {

  const [Response, setResponse] = useState({ status: null, message: "" });
  const token = window.sessionStorage.getItem("token");
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  // reusable pagination
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");

  const fetchMarriages = async () => {
    const res = await fetch(
      `${URL}/marriage-certificate?page=${CurrentPage}&limit=${rowsPerPage}&search=${searchTerm}&from=${startDate}&to=${endDate}`,
      { headers: { Authorization: token } }
    );
    const data = await res.json();
    setRows(data.data || []);
    setTotalPages(data.totalPages || 1);
  };

  useEffect(() => {
    fetchMarriages();
  }, [CurrentPage, searchTerm, startDate, endDate, rowsPerPage]);


  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg font-semibold">Marriage</h1>
        <div className="flex items-center justify-between p-2">
          <div className="">
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
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <label>From</label>
            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }} className="py-1 text-sm rounded border px-2" />
            <label>To</label>
            <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }} className="py-1 text-sm rounded border px-2" />
          </div>
          <div>
            <button
              onClick={() => navigate("/admin/mrgcertlist/addmrgcertificate")}
              className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg">
              <FaPlus /> Marriage
            </button>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">MRG ID</th>
                <th className="p-2 text-center">Sl No in Reg</th>
                <th className="p-2 text-center">Groom</th>
                <th className="p-2 text-center">Bride</th>
                <th className="p-2 text-center">Marriage Date</th>
                <th className="p-2 text-center">Action</th>
              </tr>
              {/* (CurrentPage - 1) * rowsPerPage + i + 1 */}
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr key={row._id} className="border-b">
                    <td className="p-2 text-center">
                      {(CurrentPage - 1) * rowsPerPage + i + 1}
                    </td>

                    <td className="p-2 text-center font-medium text-gray-800">
                      {row.marriageCode}
                    </td>

                    <td className="p-2 text-center">
                      {row.registerSlNo || "-"}
                    </td>

                    <td className="p-2 text-left">
                      {row.groom?.memberName || row.groom?.nonMemberName || "-"}
                    </td>

                    <td className="p-2 text-left">
                      {row.bride?.memberName || row.bride?.nonMemberName || "-"}
                    </td>

                    <td className="p-2 text-center">
                      {row.banns?.weddingDate
                        ? moment(row.banns.weddingDate).format("DD-MM-YYYY")
                        : "-"}
                    </td>
                    <td className="p-2 text-center">
                      <FaEye size={18} onClick={() => navigate(`/admin/mrgcertlist/viewmrgcertificate/${row._id}`)}
                        className="cursor-pointer text-lavender--600 mx-auto"
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

      {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}
    </>
  )
}
