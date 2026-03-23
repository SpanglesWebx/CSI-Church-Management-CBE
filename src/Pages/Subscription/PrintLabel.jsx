import React, { useEffect, useState } from "react"; 
import axios from "axios";
import { FaPrint } from "react-icons/fa";
import { URL } from "../../App";
import { FailedMessage } from "../../Components/ToastMessage";
import SmallSizedModal from "../../Components/Expense/SmallSizedModal";
import Pagination from "../../Components/Helpers/MenMemberPagination";
import PrintPreviewModal from "../../Components/Subscription/PrintPreviewModal";

export const PrintLabel = () => {

  const token = window.sessionStorage.getItem("token");

  const [gender, setGender] = useState("All");
  const [members, setMembers] = useState([]);

  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");

  const [Response, setResponse] = useState({ status: null, message: "" });

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
const [fromSI, setFromSI] = useState("");
const [toSI, setToSI] = useState("");
  const [totalCount, setTotalCount] = useState(0);

const [isPreviewOpen, setIsPreviewOpen] = useState(false);
const [selectedMembers, setSelectedMembers] = useState([]);
const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const fetchMembers = async () => {
    if (gender === "All") return;

    try {
      const res = await axios.get(`${URL}/print-label/members`, {
        headers: { Authorization: token },
        params: {
          gender,
          page: CurrentPage,
          limit: rowsPerPage,
        },
      });

      setMembers(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);

    } catch (err) {
      setResponse({ status: "Failed", message: "Failed to load members" });
    }
  };


const handlePreview = async () => {
  if (!fromSI || !toSI) return;

  setIsPreviewOpen(true);     // 🔥 open modal immediately
  setIsLoadingPreview(true);  // 🔥 start loader

  try {
    const res = await axios.get(`${URL}/print-label/members`, {
      headers: { Authorization: token },
      params: {
        gender,
        page: 1,
        limit: 10000,
      },
    });

    const allMembers = res.data.data || [];

    const start = parseInt(fromSI);
    const end = parseInt(toSI);

    const filtered = allMembers.slice(start - 1, end);

    setSelectedMembers(filtered);

  } catch (err) {
    console.log(err);
  } finally {
    setIsLoadingPreview(false);  // 🔥 stop loader
  }
};





  useEffect(() => {
    fetchMembers();
  }, [gender, CurrentPage, rowsPerPage]);

const handlePrintFilter = async () => {
  if (!fromSI || !toSI) return;

  try {
    const res = await axios.get(`${URL}/print-label/count`, {
      headers: { Authorization: token },
      params: {
        gender,
        fromSI,
        toSI,
      },
    });

    setTotalCount(res.data.count || 0);

  } catch (err) {
    console.log(err);
  }
};


useEffect(() => {
  const fetchCount = async () => {
    if (!fromSI || !toSI) {
      setTotalCount(0);
      return;
    }

    try {
      const res = await axios.get(`${URL}/print-label/count`, {
        headers: { Authorization: token },
        params: {
          gender,
          fromSI,
          toSI,
        },
      });

      setTotalCount(res.data.count || 0);

    } catch (err) {
      console.log(err);
      setTotalCount(0);
    }
  };

  fetchCount();
}, [fromSI, toSI, gender]);

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">

        <div className="flex justify-between items-center p-2">
          <h1 className="text-lg font-semibold">Subscription Labels</h1>

          <div className="flex items-center gap-4">

            <select
              value={gender}
              onChange={(e) => {
                setGender(e.target.value);
                setCurrentPage(1);
              }}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50"
            >
              <option value="All">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            {gender !== "All" && (
              <FaPrint
                size={20}
                className="text-lavender--600 cursor-pointer"
                onClick={() => setIsPrintModalOpen(true)}
              />
            )}

          </div>
        </div>

        {gender !== "All" && (
          <>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm text-gray-500">
                <thead className="text-base text-gray-700 border-b">
                  <tr>
                    <th className="p-2 text-center">SI No</th>
                    <th className="p-2 text-center">Member ID</th>
                    <th className="p-2 text-center">Member Name</th>
                    <th className="p-2 text-center">Address</th>
                    <th className="p-2 text-center">Primary Phone</th>
                  </tr>
                </thead>

                <tbody>
                  {members.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center p-3">
                        No Records Found
                      </td>
                    </tr>
                  ) : (
                    members.map((item, index) => (
                      <tr key={item._id} className="border-b text-center">
                        <td className="p-2">
                          {(CurrentPage - 1) * rowsPerPage + index + 1}
                        </td>
                        <td className="p-2">{item.member_id}</td>
                        <td className="p-2">{item.member_name}</td>
                        <td className="p-2">{item.present_address}</td>
                        <td className="p-2">{item.primary_contact_number}</td>
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
          </>
        )}
      </div>

<SmallSizedModal
  isOpen={isPrintModalOpen}
  onClose={() => {
    setIsPrintModalOpen(false);
    setFromSI("");
    setToSI("");
    setTotalCount(0);
  }}
  title="Range Filter"
>
  <div className="flex flex-col gap-4 p-3">

    <div className="flex gap-6 justify-center items-end">

<div>
  <label className="block text-sm font-medium text-gray-600 mb-1">
    From (SI No)
  </label>
  <input
    type="text"
    inputMode="numeric"
    pattern="[0-9]*"
    value={fromSI}
    onChange={(e) => {
      const value = e.target.value.replace(/[^0-9]/g, "");
      setFromSI(value);
    }}
    className="border p-1 rounded w-24 text-center"
  />
</div>

<div>
  <label className="block text-sm font-medium text-gray-600 mb-1">
    To (SI No)
  </label>
  <input
    type="text"
    inputMode="numeric"
    pattern="[0-9]*"
    value={toSI}
    onChange={(e) => {
      const value = e.target.value.replace(/[^0-9]/g, "");
      setToSI(value);
    }}
    className="border p-1 rounded w-24 text-center"
  />
</div>

    </div>

    {fromSI && toSI && (
      <div className="text-center font-semibold text-gray-700">
        Total {totalCount} Members
      </div>
    )}

<button
  onClick={handlePreview}
  className="px-4 py-2 bg-lavender--600 text-white rounded self-center"
>
  Preview
</button>

  </div>
</SmallSizedModal>

<PrintPreviewModal
  isOpen={isPreviewOpen}
  onClose={() => setIsPreviewOpen(false)}
  selectedMembers={selectedMembers}
  isLoading={isLoadingPreview}
/>


      {Response.status === "Failed" && (
        <FailedMessage Message={Response.message} />
      )}
    </>
  );
};