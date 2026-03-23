import React, { useEffect, useState } from 'react'
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { URL } from "../../App";
import axios from 'axios';
import { FaEye } from 'react-icons/fa';
import moment from "moment";

export const PaidExpense = () => {

  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const token = window.sessionStorage.getItem("token");
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCloseBillModalOpen, setIsCloseBillModalOpen] = useState(false);
  const [billFile, setBillFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [billName, setBillName] = useState("");
  const [billNo, setBillNo] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBillFile(file);
      const url = window.URL.createObjectURL(file); // use window.URL
      setPreviewURL(url);
    }
  };
  const [isBillPreviewOpen, setIsBillPreviewOpen] = useState(false);
  const [billPreviewFile, setBillPreviewFile] = useState(null);
  const [billPreviewName, setBillPreviewName] = useState("");



  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const fetchPaidExpenses = async () => {
      try {
        const res = await axios.get(
          `${URL}/expenses/paid?page=${CurrentPage}&limit=10`,
          {
            headers: { Authorization: token },
          }
        );

        if (res.data.status === "Success") {
          setExpenses(res.data.data);
          setTotalPages(res.data.totalPages);
        }
      } catch (err) {
        setResponse({ status: "Failed", message: err.message });
      }
    };

    fetchPaidExpenses();
  }, [CurrentPage]);

  const handleCloseBill = async () => {
    if (!billName || !billNo || !billFile) {
      setResponse({ status: "Failed", message: "Please fill all fields and upload file." });
      return;
    }

    const formData = new FormData();
    formData.append("billName", billName);
    formData.append("billNo", billNo);
    formData.append("billFile", billFile);

    try {
      const res = await axios.patch(
        `${URL}/expenses/close-bill/${selectedExpense._id}`,
        formData,
        {
          headers: {
            Authorization: token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.status === "Success") {
        setResponse({ status: "Success", message: res.data.message });
        setIsCloseBillModalOpen(false);
        // Optionally update local state so the table shows "Closed"
        setExpenses((prev) =>
          prev.map((exp) =>
            exp._id === selectedExpense._id ? { ...exp, billStatus: "Closed" } : exp
          )
        );
      } else {
        setResponse({ status: "Failed", message: res.data.message });
      }
    } catch (err) {
      setResponse({ status: "Failed", message: err.message });
    }
  };
  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold">Paid Expense</h1>
          <div className="">
            <label
              htmlFor="default-search"
              className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
            >
              Search Members
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                <svg
                  className="w-3 h-3 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                type="search"
                id="default-search"
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-lavender--600 dark:focus:border-lavender--600"
                placeholder="Search"
              />
            </div>
          </div>


        </div>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Expense Name</th>
                <th className="p-2 text-center">Amount</th>
                <th className="p-2 text-center">Expense Type</th>
                <th className="p-2 text-center">Status</th>
                <th className="p-2 text-center">Bill Status</th>
                <th className="p-2 text-center">Approval Status</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length > 0 ? (
                expenses.map((item, index) => (
                  <tr key={item._id}>
                    <td className="p-2 text-center">{index + 1}</td>
                    <td className="p-2 text-center">{item.expensename}</td>
                    <td className="p-2 text-center">{item.expenseamount}</td>
                    <td className="p-2 text-center">{item.type_of_expense}</td>
                    <td className="p-2 text-center text-green-600 font-semibold">
                      {item.status}
                    </td>
                    <td className={`p-2 text-center font-semibold ${item.billStatus === "Closed"
                      ? "text-green-600"
                      : "text-yellow-600"
                      }`}>
                      {item.billStatus || "Pending"}
                    </td>


                    <td className="p-2 text-center">{item.approval_status}</td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <FaEye
                          size={18}
                          className="text-lavender--600 cursor-pointer"
                          onClick={() => {
                            setSelectedExpense(item); // expense = current row
                            setIsModalOpen(true);
                          }}

                        />
                        {item.billStatus !== "Closed" && (
                          <button
                            className="flex items-center gap-2 px-3 py-1 text-white bg-green-600 rounded-lg"
                            onClick={() => {
                              setIsCloseBillModalOpen(true);
                              setSelectedExpense(item);
                            }}
                          >
                            Close Bill
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-4 text-center text-gray-500">
                    No paid expenses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="relative flex flex-wrap items-center justify-center mt-4 space-x-3 select-none ">
          <button
            onClick={() => setCurrentPage(CurrentPage - 1)}
            disabled={CurrentPage === 1}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            className={`px-4 py-2 rounded ${CurrentPage
              ? "bg-lavender--600 text-white"
              : "bg-gray-200 text-gray-700"
              }`}
          >
            {CurrentPage}
          </button>
          <button
            onClick={() => setCurrentPage(CurrentPage + 1)}
            disabled={CurrentPage === TotalPages || TotalPages === 0}
            className="px-4 py-2 w-[100px] text-gray-700 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
          <div className="absolute flex px-5 space-x-2 rounded right-1 ">
            <span className="px-4 py-2 text-center text-gray-700 bg-gray-100 rounded" >Total Page: <span >{TotalPages}</span>
            </span>
            <span
              onClick={() => setCurrentPage(TotalPages)}
              className={`${TotalPages === CurrentPage ? 'disabled opacity-50  bg-gray-100 px-4 py-2 cursor-not-allowed' : 'px-4 py-2 text-blue-400 bg-gray-100 rounded active:text-blue-800 hover:cursor-pointer'} `}
            >
              Last Page
            </span>
          </div>
        </div>
      </div>
      {Response.status && (
        Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : (
          <FailedMessage Message={Response.message} />
        )
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Paid Expense Details">
        {selectedExpense && (
          <div className="flex flex-col pt-5 ps-5 w-full max-w-4xl space-y-4 max-h-[600px] overflow-y-auto">
            {[
              { label: "Expense Name", value: selectedExpense.expensename },
              { label: "Expense Amount", value: `₹${selectedExpense.expenseamount}` },
              { label: "Type of Expense", value: selectedExpense.type_of_expense },
              { label: "Status", value: selectedExpense.status },
              { label: "Approval Status", value: selectedExpense.approval_status },
              { label: "Added By", value: `${selectedExpense.addedBy} (${selectedExpense.addedByRole})` },
              { label: "Paid Amount", value: `₹${selectedExpense.paidAmount}` },
              { label: "Paid At", value: moment(selectedExpense.paidAt).format("DD-MM-YYYY ") },

              // Member details if exist
              selectedExpense.memberId && { label: "Member ID", value: selectedExpense.memberId },
              selectedExpense.memberId && { label: "Member Name", value: selectedExpense.memberName },
              selectedExpense.memberId && { label: "Member Phone", value: selectedExpense.memberPhone },

              // Non-member details if exist
              selectedExpense.nonMemberName && { label: "Non-Member Name", value: selectedExpense.nonMemberName },
              selectedExpense.nonMemberName && { label: "Non-Member Phone", value: selectedExpense.nonMemberPhone },
              selectedExpense.nonMemberName && { label: "Non-Member Place", value: selectedExpense.nonMemberPlace },
              // ✅ Only show Bill details if expense is paid
              selectedExpense.status === "paid" && selectedExpense.billName && { label: "Bill Name", value: selectedExpense.billName },
              selectedExpense.status === "paid" && selectedExpense.billNo && { label: "Bill No", value: selectedExpense.billNo },
              selectedExpense.status === "paid" && selectedExpense.billFile && {
                label: "Bill File",
                value: (
                  <button
                    className="text-blue-600 underline"
                    onClick={() => {
                      setBillPreviewFile(`${URL}/${selectedExpense.billFile}`);
                      setBillPreviewName(selectedExpense.expensename);
                      setIsBillPreviewOpen(true);
                    }}
                  >
                    View Bill
                  </button>
                ),
              },
            ]
              .filter(Boolean)
              .map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 ">
                  <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700 dark:text-white">
                    {item.label}
                  </div>
                  <div
                    className={`col-span-12 sm:col-span-8 text-base ${item.value ? "text-gray-800 dark:text-gray-300" : "text-yellow-500 font-semibold"
                      }`}
                  >
                    {item.value || "N/A"}
                  </div>
                </div>
              ))}
          </div>
        )}
      </Modal>

      <Modal isOpen={isCloseBillModalOpen} onClose={() => setIsCloseBillModalOpen(false)} title="Close Bill">
        <>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-700">
              <span className="text-gray-500 font-normal">Name of the Expense: </span>
              {selectedExpense?.expensename || "Expense Name"}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
            <div>
              <label className="block text-sm font-medium text-gray-700">Bill Name</label>
              <input
                type="text"
                placeholder="Enter Bill Name"
                value={billName}
                onChange={(e) => setBillName(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bill No</label>
              <input
                type="text"
                placeholder="Enter Bill No"
                value={billNo}
                onChange={(e) => setBillNo(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Upload Bill</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Preview</label>
              {previewURL ? (
                previewURL.endsWith(".pdf") ? (
                  <iframe
                    src={previewURL}
                    title="PDF Preview"
                    className="w-full h-32 border rounded-md mt-1"
                  ></iframe>
                ) : (
                  <img
                    src={previewURL}
                    alt="Bill Preview"
                    className="w-full h-32 object-contain border rounded-md mt-1"
                  />
                )
              ) : (
                <div className="w-full h-32 border border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400 mt-1">
                  No file selected
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleCloseBill}
              className="px-4 py-2 bg-lavender--600 text-white rounded-md"
            >
              Save
            </button>
          </div>
        </>

      </Modal>

      <Modal
        isOpen={isBillPreviewOpen}
        onClose={() => setIsBillPreviewOpen(false)}
        title={billPreviewName || "Bill Preview"}
      >
        <div className="w-full h-[500px] flex items-center justify-center">
          {billPreviewFile ? (
            billPreviewFile.endsWith(".pdf") ? (
              <iframe
                src={billPreviewFile}
                title="PDF Preview"
                className="w-full h-full border rounded-md"
              />
            ) : (
              <img
                src={billPreviewFile}
                alt="Bill Preview"
                className="w-full h-full object-contain border rounded-md"
              />
            )
          ) : (
            <p className="text-gray-500">No file selected</p>
          )}
        </div>
      </Modal>



    </>
  )
}
