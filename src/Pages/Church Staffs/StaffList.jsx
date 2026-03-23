import React, { useEffect, useRef, useState } from "react";
import { FaEye, FaPlus } from "react-icons/fa";
import axios from "axios";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { URL } from "../../App";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { CiEdit } from "react-icons/ci";
import moment from "moment";
import Pagination from "../../Components/Helpers/Pagination";
import SmallSizedModal from "../../Components/Expense/SmallSizedModal";

export const StaffList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [Response, setResponse] = useState({ status: "", message: "" });
  const token = window.sessionStorage.getItem("token");

  // Filters
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Member / Non-member toggle
  const [isMember, setIsMember] = useState(true);

  // Member search states
  const [memberIdSearch, setMemberIdSearch] = useState("");
  const [dropdownById, setDropdownById] = useState([]);
  const [memberNameSearch, setMemberNameSearch] = useState("");
  const [dropdownByName, setDropdownByName] = useState([]);
  const [employeeId, setEmployeeId] = useState("");

  const [staffs, setStaffs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [statusSelection, setStatusSelection] = useState("Active");
  const [showTextarea, setShowTextarea] = useState(false);
  const [notes, setNotes] = useState("");
  // pagination (standard)
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");

const [confirmModal, setConfirmModal] = useState(false);
const [modalText, setModalText] = useState("");
const [pendingAction, setPendingAction] = useState(null);


  const handleView = (staff) => {
    setSelectedStaff(staff);
    setIsViewOpen(true);
  };

  const handleCloseView = () => {
    setIsViewOpen(false);
    setSelectedStaff(null);
  };

  const handleEdit = (staff) => {
    setSelectedStaff(staff);

    const formatAadhar = (num = "") => {
      return num.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ");
    };

    setEditForm({
      // Common
      designation: staff.designation || "",
      salary: staff.salary || "",
      inactive_description: staff.inactive_description || "",
      notes: staff.notes || "",

      // Member fields
      member_id: staff.member_id || "",
      member_name: staff.member_name || "",
      member_tamil_name: staff.member_tamil_name || "",
      gender: staff.gender || "",
      phone: staff.phone || "",
      aadhar_number: staff.aadhar_number || "",
      permanent_address: staff.permanent_address || "",
      present_address: staff.present_address || "",

      // Non-member fields
      non_member_name: staff.non_member_name || "",
      non_member_tamil_name: staff.non_member_tamil_name || "",
      non_member_gender: staff.non_member_gender || "",
      non_member_phone: staff.non_member_phone || "",
      non_member_aadhar: formatAadhar(staff.non_member_aadhar || ""),
      non_member_permanent_address: staff.non_member_permanent_address || "",
      non_member_present_address: staff.non_member_present_address || "",
    });

    setStatusSelection(staff.status || "Active");
    setIsEditOpen(true);
  };


  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedStaff(null);
  };

  useEffect(() => {
    if (isModalOpen) {
      axios
        .get(`${URL}/staffs/generate-id`, { headers: { Authorization: token } })
        .then((res) => setEmployeeId(res.data.employee_id))
        .catch((err) => {
          console.error("Failed to fetch employee ID:", err);
          setEmployeeId("EMPXXXX");
        });
    }
  }, [isModalOpen]);


  // --- Local form state (replacing useForm/register/watch/reset) ---
  const [form, setForm] = useState({
    // Member fields (read-only after pick)
    memberId: "",
    memberName: "",
    memberTamilName: "",
    gender: "",
    phone: "",
    aadhar_number: "",
    permanent_address: "",
    present_address: "",

    // Non-member fields (editable)
    nonMemberName: "",
    nonMemberTamilName: "",
    nonMemberGender: "",
    nonMemberPhone: "",
    nonMemberAadhar: "",
    nonMemberPermanentAddress: "",
    nonMemberPresentAddress: "",

    // Common
    designation: "",
    salary: "",
  });

  const resetForm = () => {
    setForm({
      memberId: "",
      memberName: "",
      memberTamilName: "",
      gender: "",
      phone: "",
      aadhar_number: "",
      permanent_address: "",
      present_address: "",
      nonMemberName: "",
      nonMemberTamilName: "",
      nonMemberGender: "",
      nonMemberPhone: "",
      nonMemberAadhar: "",
      nonMemberPermanentAddress: "",
      nonMemberPresentAddress: "",
      designation: "",
      salary: "",
    });
  };

  // Debounce utility
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // 🔍 Search by Member ID
  const debouncedSearchById = useRef(
    debounce(async (val) => {
      if (!val) return setDropdownById([]);
      try {
        const res = await axios.get(`${URL}/member-search/by-id?id=${val}`, {
          headers: { Authorization: token },
        });
        setDropdownById(res.data || []);
      } catch (err) {
        if (err.response?.status === 404) {
          setDropdownById([{ member_id: "none", member_name: "No members found" }]);
        } else {
          setDropdownById([]);
        }
      }
    }, 300)
  ).current;

  // 🔍 Search by Member Name
  const debouncedSearchByName = useRef(
    debounce(async (val) => {
      if (!val) return setDropdownByName([]);
      try {
        const res = await axios.get(`${URL}/member-search?name=${val}`, {
          headers: { Authorization: token },
        });
        setDropdownByName(res.data || []);
      } catch (err) {
        if (err.response?.status === 404) {
          setDropdownByName([{ member_id: "none", member_name: "No members found" }]);
        } else {
          setDropdownByName([]);
        }
      }
    }, 300)
  ).current;

  // Reset when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      resetForm();
      setMemberIdSearch("");
      setMemberNameSearch("");
      setDropdownById([]);
      setDropdownByName([]);
      setIsMember(true);
    }
  }, [isModalOpen]);

  // Helper: format member address object into single string
  const formatAddress = (a) =>
    a
      ? `${a.address || ""}${a.city ? ", " + a.city : ""}${a.district ? ", " + a.district : ""
      }${a.state ? ", " + a.state : ""}${a.zip_code ? ", " + a.zip_code : ""}${a.country ? ", " + a.country : ""
      }`
      : "";

  const fetchStaffs = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: CurrentPage,
        limit: rowsPerPage,
        search,
        fromDate,
        toDate,
        status: statusFilter,
      });

      const res = await axios.get(`${URL}/staffs?${params.toString()}`, {
        headers: { Authorization: token },
      });

      setStaffs(res.data.staffs || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching staffs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, [search, fromDate, toDate, statusFilter, CurrentPage, rowsPerPage]);



  // 🧾 Handle Save (Add Staff)
const handleSave = async () => {
  try {

    // MEMBER VALIDATION
    if (isMember) {

      if (!form.memberId) {
        setResponse({ status: "Failed", message: "Member ID is required" });
        return;
      }

      if (!form.memberName) {
        setResponse({ status: "Failed", message: "Member Name is required" });
        return;
      }

    }

    // NON MEMBER VALIDATION
    if (!isMember) {

      if (!form.nonMemberName?.trim()) {
        setResponse({ status: "Failed", message: "Name is required for non-member" });
        return;
      }

      if (!form.nonMemberTamilName?.trim()) {
        setResponse({ status: "Failed", message: "Tamil Name is required" });
        return;
      }

      if (!form.nonMemberGender) {
        setResponse({ status: "Failed", message: "Gender is required" });
        return;
      }

    }


      const payload = {
        employee_id: employeeId,
        isMember,
designation: form.designation || "",
salary: form.salary ? Number(form.salary) : 0,
        notes,
      };

      if (isMember) {
        if (!form.memberId || !form.memberName) {
          setResponse({ status: "Failed", message: "Please select a member" });
          return;
        }
        Object.assign(payload, {
          member_id: form.memberId,
          member_name: form.memberName,
          member_tamil_name: form.memberTamilName || "",
          gender: form.gender || "",
          phone: form.phone || "",
          aadhar_number: form.aadhar_number || "",
          permanent_address: form.permanent_address || "",
          present_address: form.present_address || "",
        });
      } else {
        if (!form.nonMemberName?.trim()) {
          setResponse({ status: "Failed", message: "Name is required for non-member" });
          return;
        }
        Object.assign(payload, {
          non_member_name: form.nonMemberName,
          non_member_tamil_name: form.nonMemberTamilName || "",
          non_member_gender: form.nonMemberGender || "",
          non_member_phone: form.nonMemberPhone || "",
          non_member_aadhar: form.nonMemberAadhar || "",
          non_member_permanent_address: form.nonMemberPermanentAddress || "",
          non_member_present_address: form.nonMemberPresentAddress || "",
        });
      }

      const res = await axios.post(`${URL}/staffs`, payload, {
        headers: { Authorization: token },
      });

      setResponse({ status: "Success", message: res.data?.message || "Staff added successfully" });
      setIsModalOpen(false);
      resetForm();
      setIsMember(true);
      setMemberIdSearch("");
      setMemberNameSearch("");
      setDropdownById([]);
      setDropdownByName([]);

      fetchStaffs();

      // If you have a fetch list function, you can call it here to refresh the table
      // fetchStaffs();

    } catch (err) {
      console.error("Error saving staff:", err);
      const msg = err.response?.data?.message || "Failed to add staff. Please try again.";
      setResponse({ status: "Failed", message: msg });
    }
  };

  const handleUpdateStaff = async () => {
    try {


      const payload = {
        // 🔹 Common fields
designation: editForm.designation?.trim() || "",
salary: editForm.salary ? Number(editForm.salary) : 0,
        status: statusSelection,
        inactive_description:
          statusSelection === "Inactive" ? editForm.inactive_description?.trim() : "",
        notes,

        // 🔹 Non-member editable fields
        ...(selectedStaff.isMember
          ? {} // member details are not editable
          : {
            non_member_name: editForm.non_member_name?.trim() || "",
            non_member_tamil_name: editForm.non_member_tamil_name?.trim() || "",
            non_member_gender: editForm.non_member_gender || "",
            non_member_phone: editForm.non_member_phone || "",
            non_member_aadhar: (editForm.non_member_aadhar || "").replace(/\s/g, ""),
            non_member_permanent_address:
              editForm.non_member_permanent_address?.trim() || "",
            non_member_present_address:
              editForm.non_member_present_address?.trim() || "",
          }),
      };


      const res = await axios.put(`${URL}/staffs/${selectedStaff._id}`, payload, {
        headers: { Authorization: token },
      });

      setResponse({ status: "Success", message: res.data.message });
      setIsEditOpen(false);
      fetchStaffs(); // refresh table
    } catch (err) {
      console.error(err);
      setResponse({ status: "Failed", message: "Failed to update staff" });
    }
  };


const toggleStaffStatus = async () => {
  try {
    const newStatus =
      selectedStaff.status === "Active" ? "Inactive" : "Active";

    const payload = {
      status: newStatus,
      inactive_description:
        newStatus === "Inactive" ? "Status changed manually" : "",
    };

    const res = await axios.put(
      `${URL}/staffs/${selectedStaff._id}`,
      payload,
      { headers: { Authorization: token } }
    );

    setSelectedStaff(res.data.staff);

    fetchStaffs();

  } catch (err) {
    console.error(err);
  }
};

const askToggleStaff = () => {
  const nextStatus =
    selectedStaff.status === "Active" ? "Inactive" : "Active";

  setModalText(
    `Are you sure you want to change "${selectedStaff.employee_id}" as ${nextStatus}?`
  );

  setPendingAction(() => toggleStaffStatus);
  setConfirmModal(true);
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
          checked ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </div>
  );
};

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h4 className="font-semibold">Staffs</h4>

        {/* 🔎 Search, Filter & Add Section */}
        <div className="flex flex-wrap items-center justify-between">
          {/* Search Input */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                <svg
                  className="w-3 h-3 text-gray-500"
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
                placeholder="Search"
              />
            </div>
          </div>

          {/* Date Filters */}
          <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
            <label className="text-l font-medium text-gray-600 mb-1">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
            />

            <label className="text-l font-medium text-gray-600 mb-1">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
            />
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block py-1 text-sm text-gray-900 rounded w-30 px-3 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Add Staff Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg"
          >
            <FaPlus /> Staff
          </button>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto mt-8">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Staff ID</th>
                <th className="p-2 text-center">Member Name</th>
                <th className="p-2 text-center">Designation</th>
                <th className="p-2 text-center">Status</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : staffs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                staffs.map((staff, index) => (
                  <tr
                    key={staff._id}
                    className="border-t "
                  >
                    <td className="p-2 text-center">
                      {(CurrentPage - 1) * rowsPerPage + index + 1}
                    </td>
                    <td className="p-2 text-center font-semibold text-gray-700">
                      {staff.employee_id}
                    </td>
                    <td className="p-2 text-center text-gray-800">
                      {staff.isMember
                        ? staff.member_name || "-"
                        : staff.non_member_name || "-"}
                    </td>
                    <td className="p-2 text-center text-gray-700">
                      {staff.designation}
                    </td>
                    <td
                      className={`p-2 text-center font-medium ${staff.status === "Active"
                        ? "text-green-600"
                        : "text-red-500"
                        }`}
                    >
                      {staff.status}
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex justify-center gap-3">
                        <FaEye
                          size={18}
                          onClick={() => handleView(staff)}
                          className="cursor-pointer text-lavender--600"
                          title="View Details"
                        />
                        {/* {staff.status === "Active" && ( */}
                        <CiEdit
                          size={20}
                          onClick={() => handleEdit(staff)}
                          className="cursor-pointer text-lavender--600 hover:text-lavender--700 transition"
                          title="Edit Staff"
                        />
                        {/* )} */}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>

        {/* Pagination */}
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

      {/* Add Staff Modal with full BookSlots fields */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
          setIsMember(true);
          setMemberIdSearch("");
          setMemberNameSearch("");
          setDropdownById([]);
          setDropdownByName([]);
        }}
        title="Add Staff"
      >
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          <div className="p-4 border rounded-lg bg-gray-50">
            {/* Toggle */}
            <div className="mb-4 flex justify-between">
              <h5 className="font-semibold text-gray-800">
                Staff ID: <span className="text-lavender--600">{employeeId}</span>
              </h5>

              <div className="relative flex bg-gray-200 rounded-full p-1 text-sm font-medium w-56">
                <div
                  className="absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300"
                  style={{
                    width: "calc(50% - 0.25rem)",
                    transform: isMember ? "translateX(0)" : "translateX(100%)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsMember(true);
                    resetForm();
                    setMemberIdSearch("");
                    setMemberNameSearch("");
                    setDropdownById([]);
                    setDropdownByName([]);
                  }}
                  className={`relative flex-1 py-1 text-center rounded-full ${isMember ? "text-white" : "text-gray-700"
                    }`}
                >
                  Member
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMember(false);
                    resetForm();
                    setMemberIdSearch("");
                    setMemberNameSearch("");
                    setDropdownById([]);
                    setDropdownByName([]);
                  }}
                  className={`relative flex-1 py-1 text-center rounded-full ${!isMember ? "text-white" : "text-gray-700"
                    }`}
                >
                  Non-Member
                </button>
              </div>
            </div>

            {/* Conditional fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
              {isMember ? (
                <>
                  {/* Member ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Member ID <span className="text-red-500 font-bold text-[17px]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Search by ID"
                      value={memberIdSearch}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMemberIdSearch(val);
                        debouncedSearchById(val);
                      }}
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>

                  {/* Member Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Member Name <span className="text-red-500 font-bold text-[17px]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Search by Name"
                      value={memberNameSearch}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMemberNameSearch(val);
                        debouncedSearchByName(val);
                      }}
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>

                  {/* Tamil Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tamil Name 
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={form.memberTamilName || ""}
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Gender 
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={form.gender || ""}
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone 
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={form.phone || ""}
                      className="w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                    />
                  </div>

                  {/* Aadhar */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Aadhar
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={form.aadhar_number || ""}
                      className="w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                    />
                  </div>

                  {/* Permanent Address */}
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Permanent Address
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={form.permanent_address || ""}
                      className="w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                    />
                  </div>

                  {/* Present Address */}
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Present Address
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={form.present_address || ""}
                      className="w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                    />
                  </div>

                  {/* Dropdown results */}
                  {(dropdownById.length > 0 || dropdownByName.length > 0) && (
                    <ul className="absolute left-1/2 -translate-x-1/2 mt-[65px] w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                      {(dropdownById.length > 0 ? dropdownById : dropdownByName).map(
                        (m) => (
                          <li
                            key={m.member_id}
                            className={`flex px-3 py-2 text-sm ${m.member_id === "none"
                              ? "text-gray-500 cursor-default"
                              : "hover:bg-indigo-50 cursor-pointer"
                              }`}
                            onClick={() => {
                              if (m.member_id === "none") return;
                              setMemberIdSearch(m.member_id);
                              setMemberNameSearch(m.member_name);
                              setForm((prev) => ({
                                ...prev,
                                memberId: m.member_id,
                                memberName: m.member_name,
                                memberTamilName: m.member_tamil_name || "",
                                gender: m.gender || "",
                                phone: m.mobile_number || "",
                                aadhar_number: m.aadhar_number || "",
                                permanent_address: m.permanent_address || "",
                                present_address: m.present_address || "",
                              }));
                              setDropdownById([]);
                              setDropdownByName([]);
                            }}
                          >
                            <span className="w-[250px] font-medium">
                              {m.member_id === "none" ? m.member_name : m.member_id}
                            </span>
                            {m.member_id !== "none" && (
                              <>
                                <span className="flex-1">{m.member_name}</span>
                                <span className="w-[200px] text-gray-500">
                                  {m.mobile_number}
                                </span>
                              </>
                            )}
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </>
              ) : (
                <>
                  {/* Non-Member Form */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name <span className="text-red-500 font-bold text-[17px]">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.nonMemberName}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, nonMemberName: e.target.value }))
                      }
                      placeholder="Enter full name"
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tamil Name <span className="text-red-500 font-bold text-[17px]">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.nonMemberTamilName}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, nonMemberTamilName: e.target.value }))
                      }
                      placeholder="தமிழ் பெயர்"
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Gender <span className="text-red-500 font-bold text-[17px]">*</span>
                    </label>
                    <select
                      value={form.nonMemberGender}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, nonMemberGender: e.target.value }))
                      }
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={form.nonMemberPhone}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          nonMemberPhone: e.target.value.replace(/\D/g, "").slice(0, 10),
                        }))
                      }
                      placeholder="10-digit phone"
                      maxLength={10}
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Aadhar
                    </label>
                    <input
                      type="text"
                      value={form.nonMemberAadhar}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, "").substring(0, 12);
                        value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
                        setForm((p) => ({ ...p, nonMemberAadhar: value }));
                      }}
                      placeholder="XXXX XXXX XXXX"
                      maxLength={14}
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Permanent Address
                    </label>
                    <textarea
                      value={form.nonMemberPermanentAddress}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          nonMemberPermanentAddress: e.target.value,
                        }))
                      }
                      placeholder="Enter permanent address"
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      rows={2}
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Present Address
                    </label>
                    <textarea
                      value={form.nonMemberPresentAddress}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          nonMemberPresentAddress: e.target.value,
                        }))
                      }
                      placeholder="Enter present address"
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      rows={2}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
            <div className=" mt-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <div className="text-lg fw-medium text-gray-700">
                  {showTextarea && <label className="mb-0">Notes</label>}
                </div>

                <div className="mb-0 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showNotes"
                    checked={showTextarea}
                    onChange={() => setShowTextarea(!showTextarea)}
                    className="h-4 w-4 rounded-sm border-2 border-lavender--600 checked:border-lavender--600 accent-lavender--600 focus:ring-lavender--600"
                  />

                  <label className="form-check-label" htmlFor="showNotes">
                    Add Notes
                  </label>
                </div>
              </div>

              {showTextarea && (
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="form-control mt-2 border-gray-300 rounded-md shadow-sm"
                  placeholder="Enter your notes here..."
                />
              )}
            </div>
          </div>

          {/* Common fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="">
              <label className="block text-sm font-medium text-gray-700">
                Designation
              </label>
              <input
                type="text"
                value={form.designation}
                onChange={(e) =>
                  setForm((p) => ({ ...p, designation: e.target.value }))
                }
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div className="">
              <label className="block text-sm font-medium text-gray-700">
                Salary
              </label>
              <input
                type="text"
                inputMode="numeric" // mobile numeric keyboard
                pattern="[0-9]*"
                value={form.salary}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ""); // remove non-numbers
                  setForm((p) => ({ ...p, salary: value }));
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-lavender--600 text-white rounded"
            >
              Add
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="View Staff"
      >
        {selectedStaff && (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            <div className="flex flex-col ps-5 w-full max-w-4xl space-y-4">

              {/* 🧾 Common Details */}
              {[
                { label: "Staff Type", value: selectedStaff.isMember ? "Member" : "Non-Member" },
                { label: "Staff ID", value: selectedStaff.employee_id },
              ].map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2">
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

              {/* 👤 Conditional Member / Non-member Info */}
              {selectedStaff.isMember ? (
                <>
                  {[
                    { label: "Member ID", value: selectedStaff.member_id },
                    { label: "Member Name", value: selectedStaff.member_name },
                    { label: "Tamil Name", value: selectedStaff.member_tamil_name || "N/A" },
                    { label: "Gender", value: selectedStaff.gender || "N/A" },
                    { label: "Phone", value: selectedStaff.phone || "N/A" },
                    { label: "Aadhar", value: selectedStaff.aadhar_number || "N/A" },
                    { label: "Permanent Address", value: selectedStaff.permanent_address || "N/A" },
                    { label: "Present Address", value: selectedStaff.present_address || "N/A" },
                  ].map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2">
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
                </>
              ) : (
                <>
                  {[
                    { label: "Name", value: selectedStaff.non_member_name },
                    { label: "Tamil Name", value: selectedStaff.non_member_tamil_name },
                    { label: "Gender", value: selectedStaff.non_member_gender },
                    { label: "Phone", value: selectedStaff.non_member_phone },
                    { label: "Aadhar", value: selectedStaff.non_member_aadhar },
                    { label: "Permanent Address", value: selectedStaff.non_member_permanent_address || "N/A" },
                    { label: "Present Address", value: selectedStaff.non_member_present_address || "N/A" },
                  ].map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2">
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
                </>
              )}

              {/* 💼 Job Details */}
              {[
                { label: "Designation", value: selectedStaff.designation },
                // ✅ Show Notes only if it exists
                ...(selectedStaff.notes?.trim()
                  ? [{ label: "Notes", value: selectedStaff.notes }]
                  : []),
                { label: "Salary", value: `₹${selectedStaff.salary?.toLocaleString()}` },
              ].map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2">
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

              {/* 📅 Status & Dates */}
              {[
{
  label: "Status",
  value: (
    <div className="flex items-center gap-3">
      <Switch
        checked={selectedStaff.status === "Active"}
        onChange={askToggleStaff}
      />
    </div>
  ),
},
                {
                  label: "Start Date",
                  value: moment(selectedStaff.start_date).format("DD-MM-YYYY"),
                },
                // ✅ Conditionally show End Date only if Inactive
                ...(selectedStaff.status === "Inactive"
                  ? [
                    {
                      label: "End Date",
                      value: moment(selectedStaff.end_date).format("DD-MM-YYYY"),
                    },
                    {
                      label: "Inactive Reason",
                      value: selectedStaff.inactive_description || "N/A",
                    },
                  ]
                  : []),
              ].map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2">
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
          </div>
        )}
      </Modal>


      <Modal
        isOpen={isEditOpen}
        onClose={handleCloseEdit}
        title="Edit Staff"
      >
        {selectedStaff && (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            <div className="p-4 border rounded-lg bg-gray-50">
              {/* Staff ID */}
              <div className="mb-4 flex justify-between">
                <h5 className="font-semibold text-gray-800">
                  Staff ID:{" "}
                  <span className="text-lavender--600">
                    {selectedStaff.employee_id}
                  </span>
                </h5>

                <h5 className="font-semibold text-gray-800">
                  Type:{" "}
                  <span className="text-lavender--600">
                    {selectedStaff.isMember ? "Member" : "Non-Member"}
                  </span>
                </h5>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {selectedStaff.isMember ? (
                  <>
                    {/* Member Fields */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Member ID
                      </label>
                      <input
                        type="text"
                        value={selectedStaff.member_id}
                        readOnly
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Member Name
                      </label>
                      <input
                        type="text"
                        value={selectedStaff.member_name}
                        readOnly
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tamil Name
                      </label>
                      <input
                        type="text"
                        value={selectedStaff.member_tamil_name}
                        readOnly
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Gender
                      </label>
                      <input
                        type="text"
                        value={selectedStaff.gender}
                        readOnly
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Phone
                      </label>
                      <input
                        type="text"
                        value={selectedStaff.phone}
                        readOnly
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Aadhar
                      </label>
                      <input
                        type="text"
                        value={selectedStaff.aadhar_number}
                        readOnly
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Permanent Address
                      </label>
                      <textarea
                        value={selectedStaff.permanent_address}
                        readOnly
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                        rows={2}
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Present Address
                      </label>
                      <textarea
                        value={selectedStaff.present_address}
                        readOnly
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100"
                        rows={2}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Non-Member Fields */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <input
                        type="text"
                        value={editForm.non_member_name || ""}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            non_member_name: e.target.value,
                          }))
                        }
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tamil Name
                      </label>
                      <input
                        type="text"
                        value={editForm.non_member_tamil_name || ""}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            non_member_tamil_name: e.target.value,
                          }))
                        }
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Gender
                      </label>
                      <select
                        value={editForm.non_member_gender || ""}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            non_member_gender: e.target.value,
                          }))
                        }
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Phone
                      </label>
                      <input
                        type="text"
                        value={editForm.non_member_phone || ""}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            non_member_phone: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10),
                          }))
                        }
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Aadhar
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={14} // 12 digits + 2 spaces
                        value={editForm.non_member_aadhar || ""}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "").substring(0, 12); // only digits
                          value = value.replace(/(\d{4})(?=\d)/g, "$1 "); // space every 4 digits
                          setEditForm((p) => ({ ...p, non_member_aadhar: value }));
                        }}
                        placeholder="XXXX XXXX XXXX"
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      />
                    </div>


                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Permanent Address
                      </label>
                      <textarea
                        value={editForm.non_member_permanent_address || ""}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            non_member_permanent_address: e.target.value,
                          }))
                        }
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                        rows={2}
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Present Address
                      </label>
                      <textarea
                        value={editForm.non_member_present_address || ""}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            non_member_present_address: e.target.value,
                          }))
                        }
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                        rows={2}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
              <div className=" mt-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div className="text-lg fw-medium text-gray-700">
                    {showTextarea && <label className="mb-0">Notes</label>}
                  </div>

                  <div className="mb-0 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="showNotes"
                      checked={showTextarea}
                      onChange={() => setShowTextarea(!showTextarea)}
                      className="h-4 w-4 rounded-sm border-2 border-lavender--600 checked:border-lavender--600 accent-lavender--600 focus:ring-lavender--600"
                    />

                    <label className="form-check-label" htmlFor="showNotes">
                      Add Notes
                    </label>
                  </div>
                </div>

                {showTextarea && (
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="form-control mt-2 border-gray-300 rounded-md shadow-sm"
                    placeholder="Enter your notes here..."
                  />
                )}
              </div>
            </div>

            {/* Designation & Salary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Designation
                </label>
                <input
                  type="text"
                  value={editForm.designation}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, designation: e.target.value }))
                  }
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Salary
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={editForm.salary}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setEditForm((p) => ({ ...p, salary: value }));
                  }}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            </div>

            {/* Status & Reason */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex gap-6 items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    value="Active"
                    checked={statusSelection === "Active"}
                    onChange={(e) => setStatusSelection(e.target.value)}
                  />
                  Active
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    value="Inactive"
                    checked={statusSelection === "Inactive"}
                    onChange={(e) => setStatusSelection(e.target.value)}
                  />
                  Inactive
                </label>
              </div>

              {statusSelection === "Inactive" && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Reason for Inactivation
                  </label>
                  <input
                    type="text"
                    value={editForm.inactive_description}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        inactive_description: e.target.value,
                      }))
                    }
                    placeholder="Enter reason..."
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>
              )}
            </div>

            {/* Save */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleUpdateStaff}
                className="px-4 py-2 bg-lavender--600 text-white rounded"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>


<SmallSizedModal
  isOpen={confirmModal}
  onClose={() => setConfirmModal(false)}
  title="Confirmation"
>
  <p className="text-sm text-gray-700">{modalText}</p>

  <div className="flex justify-end gap-3 mt-4">
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


      {Response.status && (
        Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : (
          <FailedMessage Message={Response.message} />
        )
      )}
    </>
  );
};
