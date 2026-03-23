import React, { useEffect, useRef, useState } from "react";
import { FaEye, FaPlus } from "react-icons/fa";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from "axios";
import { URL } from "../../App";
import moment from "moment";
import Pagination from "../../Components/Helpers/Pagination";
import SmallSizedModal from "../../Components/Expense/SmallSizedModal";

export const CreditorsList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const token = window.sessionStorage.getItem("token");

  // listing states
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [churchName, setChurchName] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  // reusable pagination
const [rowsPerPage, setRowsPerPage] = useState(25);
const [rowsInput, setRowsInput] = useState("");
const [jumpInput, setJumpInput] = useState("");

// validation
const [errors, setErrors] = useState({});

// new fields
const [primaryContactNumber, setPrimaryContactNumber] = useState("");
const [contactNumber, setContactNumber] = useState("");
const [pincode, setPincode] = useState("");
const [email, setEmail] = useState("");
const [emailError, setEmailError] = useState("");
const [bankName, setBankName] = useState("");
const [accountNumber, setAccountNumber] = useState("");
const [ifscCode, setIfscCode] = useState("");
const [micrCode, setMicrCode] = useState("");
const [branchName, setBranchName] = useState("");
const [branchPhone, setBranchPhone] = useState("");

const [confirmModal, setConfirmModal] = useState(false);
const [modalText, setModalText] = useState("");
const [pendingAction, setPendingAction] = useState(null);


  const [creditorList, setCreditorList] = useState([]);

  const fetchCreditors = async () => {
    const res = await axios.get(`${URL}/creditors/list`, {
      headers: { Authorization: token },
      params: {
        page: CurrentPage,
        limit: rowsPerPage,
        search: searchTerm || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      },
    });

    setCreditorList(res.data.creditors);

    const pages = res.data.totalPages || 1;
    setTotalPages(pages);

    // 🔥 Fix: Prevent page > totalPages
    if (CurrentPage > pages) {
      setCurrentPage(1);
    }
  };


useEffect(() => {
  fetchCreditors();
}, [CurrentPage, searchTerm, startDate, endDate, rowsPerPage]);

const handleContactChange = (e) => {
  let value = e.target.value;

  // Allow digits, comma, space
  value = value.replace(/[^0-9, ]/g, "");

  // Remove space before comma
  value = value.replace(/ \,/g, ",");

  // Ensure single space after comma
  value = value.replace(/,\s*/g, ", ");

  // Prevent leading spaces
  value = value.replace(/^\s+/, "");

  setContactNumber(value);
};

const validateEmail = (value) => {
  const cleaned = value.trim();

  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

  if (cleaned === "") {
    setEmail("");
    setEmailError("");
    return;
  }

  setEmail(cleaned);

  if (!pattern.test(cleaned)) {
    setEmailError("Enter a valid email address");
  } else {
    setEmailError("");
  }
};


const resetForm = () => {
  setName("");
  setPrimaryContactNumber("");
  setContactNumber("");
  setEmail("");
  setAddress("");
  setChurchName("");
  setAadhaar("");
  setPincode("");

  setBankName("");
  setAccountNumber("");
  setIfscCode("");
  setMicrCode("");
  setBranchName("");
  setBranchPhone("");

setErrors({});
setEmailError("");
};


  const saveCreditor = async () => {
    if (!validateForm()) return;
    // if (!name || !phone) {
    //   // ❗ Validation toast — forced re-render
    //   setResponse({ status: null, message: "" });
    //   setTimeout(() => {
    //     setResponse({
    //       status: "Failed",
    //       message: "Name & Phone required",
    //     });
    //   }, 10);

    //   // Auto hide
    //   setTimeout(() => {
    //     setResponse({ status: null, message: "" });
    //   }, 3000);

    //   return;
    // }

    try {
    const payload = {
      name,
      church_name: churchName,
      primary_contact_number: primaryContactNumber,
      contact_number: contactNumber,
      aadhaar,
      pincode,
      email,
      address,
      bank_name: bankName,
      account_number: accountNumber,
      ifsc_code: ifscCode,
      micr_code: micrCode,
      branch_name: branchName,
      branch_phone: branchPhone,
    };

      await axios.post(`${URL}/creditors/add`, payload, {
        headers: { Authorization: token },
      });

      // 🟢 Success toast — forced re-render
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Success",
          message: "Creditor added",
        });
      }, 10);

      // Auto hide
      setTimeout(() => {
        setResponse({ status: null, message: "" });
      }, 3000);

      // Close modal
      setIsModalOpen(false);

      // Reset fields
      resetForm();

      fetchCreditors();

    } catch (err) {
      console.error("Save creditor error:", err);

      // 🔴 Error toast — forced re-render
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Server error",
        });
      }, 10);

      // Auto hide
      setTimeout(() => {
        setResponse({ status: null, message: "" });
      }, 3000);
    }
  };


const toggleCreditorStatus = async (id) => {
  try {
    const res = await axios.patch(
      `${URL}/creditors/status/${id}`,
      {},
      { headers: { Authorization: token } }
    );

    const updated = res.data.data;

    setSelectedRecord(updated);

    setCreditorList(prev =>
      prev.map(c => (c._id === id ? updated : c))
    );

  } catch (err) {
    console.log(err);
  }
};


const askToggleCreditor = (creditor) => {

  const nextStatus = creditor.status === "Active" ? "Inactive" : "Active";

  setModalText(
    `Are you sure you want to change "${creditor.name}" as ${nextStatus}?`
  );

  setPendingAction(() => () => toggleCreditorStatus(creditor._id));

  setConfirmModal(true);
};


const validateForm = () => {
  const e = {};

  if (!name.trim()) e.name = "Name is required";

  if (!primaryContactNumber || primaryContactNumber.length !== 10) {
    e.primaryContactNumber = "Enter valid 10 digit number";
  }

  if (!aadhaar || aadhaar.replace(/\D/g, "").length !== 12) {
    e.aadhaar = "Aadhaar must be 12 digits";
  }

  setErrors(e);
  return Object.keys(e).length === 0;
};


  const openView = async (item) => {
    try {
      const res = await axios.get(`${URL}/creditors/${item._id}`, {
        headers: { Authorization: token },
      });

      setSelectedRecord(res.data.data || res.data || item);
      setIsViewOpen(true);
    } catch (err) {
      console.error("View error:", err);
      setSelectedRecord(item);
      setIsViewOpen(true);
    }
  };

const Switch = ({ checked, onChange }) => {
  return (
    <div
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full cursor-pointer transition-all duration-300 ${
        checked ? "bg-lavender--600" : "bg-gray-300"
      }`}
    >
      <div
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${
          checked ? "translate-x-6" : ""
        }`}
      />
    </div>
  );
};


  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg font-semibold">Creditors</h1>
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div>
<button
  onClick={() => {
    resetForm();
    setIsModalOpen(true);
  }}
  className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg"
>
  <FaPlus /> Creditors
</button>

          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Creditor ID</th>
                <th className="p-2 text-center">Creditor Name</th>
                <th className="p-2 text-center">Phone Number</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {creditorList.length === 0 && (
                <tr><td colSpan="5" className="text-center p-3">No records found</td></tr>
              )}

              {creditorList.map((item, index) => (
                <tr key={item._id} className="border-b text-center">
                  <td className="p-2">{(CurrentPage - 1) * rowsPerPage + index + 1}</td>
                  <td>{item.creditor_id}</td>
                  <td>{item.name}</td>
                  <td>{item.primary_contact_number}</td>
                  <td>
                    <FaEye size={18} className="cursor-pointer text-lavender--600 mx-auto" onClick={() => openView(item)} />
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
<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Creditors">
            <div className=" max-h-[650px] overflow-y-auto">

  <div className="grid grid-cols-1 gap-6 mt-2">

    {/* ROW 1 – Name + Church Name */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <label className="text-sm font-medium text-gray-700">
          Name <span className="text-red-500 font-bold text-[17px]">*</span>
        </label>
        <input
          data-error="name"
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`block w-full mt-1 rounded-md shadow-sm sm:text-sm
          ${errors.name ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Church Name</label>
        <input
          type="text"
          placeholder="Enter Church Name"
          value={churchName}
          onChange={(e) => setChurchName(e.target.value)}
          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
        />
      </div>
    </div>

    {/* ROW 2 – Primary Contact + Contact Number */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <label className="text-sm font-medium text-gray-700">
          Primary Contact Number <span className="text-red-500 font-bold text-[17px]">*</span>
        </label>
        <input
          data-error="primaryContactNumber"
          type="text"
          placeholder="Enter 10 digit number"
          value={primaryContactNumber}
          onChange={(e) =>
            setPrimaryContactNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
          }
          className={`block w-full mt-1 rounded-md shadow-sm sm:text-sm
          ${errors.primaryContactNumber ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.primaryContactNumber && (
          <p className="text-red-500 text-xs">{errors.primaryContactNumber}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Contact Number</label>
<input
  type="text"
  placeholder="Enter Contact Number"
  value={contactNumber}
  onChange={handleContactChange}
  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
/>
      </div>
    </div>

    {/* ROW 3 – Aadhaar + Pincode */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <label className="text-sm font-medium text-gray-700">
          Aadhaar <span className="text-red-500 font-bold text-[17px]">*</span>
        </label>
        <input
          type="text"
          placeholder="xxxx xxxx xxxx"
          value={aadhaar}
          onChange={(e) => {
            let v = e.target.value.replace(/\D/g, "").slice(0, 12);
            setAadhaar(v.replace(/(.{4})/g, "$1 ").trim());
          }}
          className={`block w-full mt-1 rounded-md shadow-sm sm:text-sm
          ${errors.aadhaar ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.aadhaar && <p className="text-red-500 text-xs">{errors.aadhaar}</p>}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Pincode</label>
        <input
          type="text"
          placeholder="Enter Pincode"
          value={pincode}
          onChange={(e) =>
            /^\d{0,6}$/.test(e.target.value) && setPincode(e.target.value)
          }
          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
        />
      </div>
    </div>

    {/* ROW 4 – Email */}
    <div>
      <label className="text-sm font-medium text-gray-700">Email</label>
<input
  type="text"
  placeholder="Enter Email"
  value={email}
  onChange={(e) => validateEmail(e.target.value)}
  className={`block w-full mt-1 rounded-md shadow-sm sm:text-sm
    ${emailError ? "border-red-500" : "border-gray-300"}
  `}
/>
{emailError && (
  <p className="text-red-500 text-xs mt-1">{emailError}</p>
)}
    </div>

    {/* ROW 5 – Address */}
    <div>
      <label className="text-sm font-medium text-gray-700">Address</label>
      <textarea
        rows={5}
        placeholder="Enter Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm resize-none"
      />
    </div>

    {/* BANK DETAILS */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <div>
    <label className="text-sm font-medium text-gray-700">
      Bank Name 
    </label>
    <input
      type="text"
      placeholder="Enter the Name of the Bank"
      value={bankName}
      onChange={(e) => setBankName(e.target.value)}
      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
    />
  </div>

  <div>
    <label className="text-sm font-medium text-gray-700">
      Account Number 
    </label>
    <input
      type="text"
      placeholder="Enter Account Number"
      value={accountNumber}
      onChange={(e) => setAccountNumber(e.target.value)}
      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
    />
  </div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <div>
    <label className="text-sm font-medium text-gray-700">
      IFSC Code 
    </label>
    <input
      type="text"
      placeholder="Enter IFSC Code of the Bank"
      value={ifscCode}
      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
    />
  </div>

  <div>
    <label className="text-sm font-medium text-gray-700">MICR Code</label>
    <input
      type="text"
      placeholder="Enter MICR Code of the Bank"
      value={micrCode}
      onChange={(e) => setMicrCode(e.target.value)}
      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
    />
  </div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <div>
    <label className="text-sm font-medium text-gray-700">
      Branch Code / Name
    </label>
    <input
      type="text"
      placeholder="Enter Branch code with Branch Name"
      value={branchName}
      onChange={(e) => setBranchName(e.target.value)}
      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
    />
  </div>

  <div>
    <label className="text-sm font-medium text-gray-700">Branch Phone</label>
    <input
      type="text"
      placeholder="Enter Branch Phone Number"
      value={branchPhone}
      onChange={(e) => setBranchPhone(e.target.value)}
      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
    />
  </div>
</div>

  </div>

  <div className="flex justify-end gap-3 mt-6">
    <button
      onClick={saveCreditor}
      className="px-4 py-2 bg-lavender--600 text-white rounded-md"
    >
      Save
    </button>
  </div>
  </div>
</Modal>


        <Modal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          title="Creditor Details"
        >
          {selectedRecord && (
            <div className="flex flex-col pt-5 ps-5 w-full max-w-4xl space-y-3 max-h-[650px] overflow-y-auto">

              {[
                { label: "Creditor ID", value: selectedRecord.creditor_id },
                { label: "Name", value: selectedRecord.name },
                { label: "Phone", value: selectedRecord.phone },
                { label: "Address", value: selectedRecord.address || "-" },
                { label: "Church Name", value: selectedRecord.church_name || "-" },
                { label: "Aadhaar", value: selectedRecord.aadhaar || "-" },
{
  label: "Status",
  value: (
    <Switch
      checked={selectedRecord.status === "Active"}
      onChange={() => askToggleCreditor(selectedRecord)}
    />
  ),
},

              ].map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 pb-2 last:border-none">
                  <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700">
                    {item.label}
                  </div>
                  <div className="col-span-12 sm:col-span-8 text-base text-gray-800">
                    {item.value}
                  </div>
                </div>
              ))}

            </div>
          )}
        </Modal>

      </div>

      {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}


<SmallSizedModal
  isOpen={confirmModal}
  onClose={() => setConfirmModal(false)}
  title="Confirmation"
>
  <p className="text-sm text-gray-700">{modalText}</p>

  <div className="flex justify-end mt-4">
    <button
      onClick={() => {
        if (pendingAction) pendingAction();
        setConfirmModal(false);
      }}
      className="px-4 py-2 bg-lavender--600 text-white rounded"
    >
      Yes
    </button>
  </div>
</SmallSizedModal>

    </>
  )
}
