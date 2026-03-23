import React, { useEffect, useState, useRef } from 'react';
import { FaEye, FaPlus } from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import Modal from "../../Components/Expense/ExpenseFormModal";
import Pagination from "../../Components/Helpers/Pagination";
import { Checkbox, FormControlLabel } from '@mui/material';
import axios from "axios";
import { URL } from "../../App";
import { useForm } from 'react-hook-form';
import debounce from "lodash.debounce";
import moment from 'moment';

export const CoupleList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");
  const [showTamilOnly, setShowTamilOnly] = useState(false);
  const [CoupleMembers, setCoupleMembers] = useState([]);
  const [memberIdSearch, setMemberIdSearch] = useState("");
  const [memberNameSearch, setMemberNameSearch] = useState("");
  const [memberDropdownById, setMemberDropdownById] = useState([]);
  const [memberDropdownByName, setMemberDropdownByName] = useState([]);
  const [memberVerified, setMemberVerified] = useState(false);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [loading, setLoading] = useState(false);
  const [isAlreadyAdded, setIsAlreadyAdded] = useState(false);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCouple, setSelectedCouple] = useState(null);

  const handleViewDetails = (couple) => {
    setSelectedCouple(couple);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedCouple(null);
  };


  const token = window.sessionStorage.getItem("token");

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      member_id: "",
      member_name: "",
      phone: "",
      spouse_member_id: "",
      spouse_member_name: "",
      spouse_member_tamil_name: "",
      spouse_phone: "",
    },
  });

  const handleOpenModal = () => {
    setIsModalOpen(true);
    reset();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);

    // ✅ Reset fields and states when closing
    reset({
      member_id: "",
      member_name: "",
      member_tamil_name: "",
      phone: "",
      spouse_member_id: "",
      spouse_member_name: "",
      spouse_member_tamil_name: "",
      spouse_phone: "",
    });
    setMemberIdSearch("");
    setMemberNameSearch("");
    setMemberVerified(false);
    setIsAlreadyAdded(false); // ✅ clear error message
  };


  // Debounced search for married family heads (by ID)
  const debouncedSearchMemberById = useRef(
    debounce(async (val) => {
      if (!val) return setMemberDropdownById([]);
      try {
        const res = await axios.get(`${URL}/member-search/married-husbands?query=${val}`, {
          headers: { Authorization: token },
        });
        setMemberDropdownById(res.data || []);
      } catch (err) {
        console.error(err);
        setMemberDropdownById([]);
      }
    }, 400)
  ).current;

  // Debounced search for married family heads (by Name)
  const debouncedSearchMemberByName = useRef(
    debounce(async (val) => {
      if (!val) return setMemberDropdownByName([]);
      try {
        const res = await axios.get(`${URL}/member-search/married-husbands?query=${val}`, {
          headers: { Authorization: token },
        });
        setMemberDropdownByName(res.data || []);
      } catch (err) {
        console.error(err);
        setMemberDropdownByName([]);
      }
    }, 400)
  ).current;

  // Fetch Couple Members list
  const fetchCoupleMembers = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${URL}/couples-fellowship`,
        {
          params: {
            page: currentPage,
            limit: rowsPerPage,
          },
          headers: { Authorization: token },
        }
      );

      setCoupleMembers(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);

    } catch (err) {
      console.error(err);
      setCoupleMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupleMembers();
  }, [currentPage, rowsPerPage]);
  // const onSubmit = async (formData) => {
  //   try {
  //     await axios.post(`${URL}/couples-fellowship`, {
  //       husband: {
  //         member_id: formData.member_id,
  //         member_name: formData.member_name,
  //         member_tamil_name: formData.member_tamil_name || "",
  //         mobile_number: formData.phone,
  //       },
  //       wife: {
  //         member_id: formData.spouse_member_id,
  //         member_name: formData.spouse_member_name,
  //         member_tamil_name: formData.spouse_member_tamil_name || "",
  //         mobile_number: formData.spouse_phone,
  //       },
  //     }, { headers: { Authorization: token } });

  //     setResponse({ status: "Success", message: "Member added to Couple Fellowship" });
  //     handleCloseModal();
  //     fetchCoupleMembers();
  //   } catch (err) {
  //     console.error(err.response?.data || err);
  //     setResponse({ status: "Failed", message: err.response?.data?.message || "Error adding member" });
  //   }
  // };



  //form-reset after save
  const onSubmit = async (formData) => {
    try {
      await axios.post(`${URL}/couples-fellowship`, {
        husband: {
          member_id: formData.member_id,
          member_name: formData.member_name,
          member_tamil_name: formData.member_tamil_name || "",
          mobile_number: formData.phone,
        },
        wife: {
          member_id: formData.spouse_member_id,
          member_name: formData.spouse_member_name,
          member_tamil_name: formData.spouse_member_tamil_name || "",
          mobile_number: formData.spouse_phone,
        },
      }, { headers: { Authorization: token } });

      // ✅ Reset fields
      reset({
        member_id: "",
        member_name: "",
        member_tamil_name: "",
        phone: "",
        spouse_member_id: "",
        spouse_member_name: "",
        spouse_member_tamil_name: "",
        spouse_phone: "",
      });
      setMemberIdSearch("");
      setMemberNameSearch("");
      setMemberVerified(false);
      setIsAlreadyAdded(false);

      // ✅ Success response
      setResponse({ status: "Success", message: "Member added to Couple Fellowship" });
      handleCloseModal();
      fetchCoupleMembers();
    } catch (err) {
      console.error(err.response?.data || err);
      setResponse({ status: "Failed", message: err.response?.data?.message || "Error adding member" });
    }
  };




  return (
    <>
      {/* Main Table */}
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex flex-col items-center justify-between lg:flex-row">
          <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
            <div className="relative">
              <input
                type="search"
                placeholder="Search..."
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
              />
            </div>
          </div>

          <div className="flex w-full gap-x-4 lg:w-auto">
            <FormControlLabel
              control={<Checkbox checked={showTamilOnly} onChange={(e) => setShowTamilOnly(e.target.checked)} />}
              label="Tamil Names Only"
            />
            <button
              onClick={handleOpenModal}
              className="flex items-center w-full gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg lg:w-auto"
            >
              <FaPlus /> Add Member
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-8">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className='text-base text-gray-700 bg-white text-center'>
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Member ID</th>
                {showTamilOnly ? (
                  <th className="p-2 text-center">Member Tamil Name</th>
                ) : (
                  <>
                    <th className="p-2 text-center">Member Name</th>
                    <th className="p-2 text-center">Member Tamil Name</th>
                  </>
                )}
                <th className="p-2 text-center">Phone</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-4">Loading...</td>
                </tr>
              ) : CoupleMembers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4">No Couple members found</td>
                </tr>
              ) : (
                CoupleMembers.map((m, index) => (
                  <tr key={m._id} className="border-b">
                    <td className="p-2">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </td>
                    <td className="p-2">{m.husband.member_id}</td>
                    {showTamilOnly ? (
                      <td className="p-2 text-left">{m.husband.member_tamil_name || "-"}</td>
                    ) : (
                      <>
                        <td className="p-2 text-left">{m.husband.member_name}</td>
                        <td className="p-2 text-left">{m.husband.member_tamil_name || "-"}</td>
                      </>
                    )}
                    <td className="p-2">{m.husband.mobile_number}</td>
                    <td>
                      <FaEye
                        title='View'
                        size={18}
                        className="cursor-pointer text-blue-600 hover:text-blue-800 inline-block"
                        onClick={() => handleViewDetails(m)} // cls = couple row object
                      />
                    </td>

                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
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

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Add Couple Member">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
              {/* Member ID */}
              <div>
                <label className="block text-lg font-medium text-gray-700">Member ID</label>
                <input
                  type="text"
                  placeholder="Search by ID"
                  {...register("member_id", { required: "Member ID is required" })}
                  value={memberIdSearch}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMemberIdSearch(val);
                    debouncedSearchMemberById(val);
                  }}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
                {memberVerified && (
                  <p className="flex items-center gap-2 text-sm text-green-600 mt-1">
                    Member verified successfully <MdVerified />
                  </p>
                )}

                {!memberVerified && memberIdSearch.trim() !== "" && memberDropdownById.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">Member not found</p>
                )}

                {!memberVerified && memberNameSearch.trim() !== "" && memberDropdownByName.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">Member not found</p>
                )}
                {isAlreadyAdded && (
                  <p className="text-sm text-red-500 mt-1">
                    Member already added to Couple Fellowship
                  </p>
                )}


              </div>

              {/* Member Name */}
              <div>
                <label className="block text-lg font-medium text-gray-700">Member Name</label>
                <input
                  type="text"
                  placeholder="Search by Name"
                  {...register("member_name", { required: "Member Name is required" })}
                  value={memberNameSearch}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMemberNameSearch(val);
                    debouncedSearchMemberByName(val);
                  }}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-lg font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  readOnly
                  {...register("phone")}
                  value={watch("phone") || ""}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>

              {/* Unified Dropdown */}
              {(memberDropdownById.length > 0 || memberDropdownByName.length > 0) && (
                <ul className="absolute left-1/2 -translate-x-1/2 mt-[75px] w-[100%] bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {(memberDropdownById.length > 0 ? memberDropdownById : memberDropdownByName).map((m) => (
                    <li
                      key={m.member_id}
                      className="flex px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 cursor-pointer transition"
                      onClick={async () => {
                        const alreadyAdded = CoupleMembers.some(
                          (c) => c.husband.member_id === m.member_id
                        );
                        if (alreadyAdded) {
                          // Close dropdown
                          setMemberDropdownById([]);
                          setMemberDropdownByName([]);

                          // Reset all form fields
                          reset({
                            member_id: "",
                            member_name: "",
                            member_tamil_name: "",
                            phone: "",
                            spouse_member_id: "",
                            spouse_member_name: "",
                            spouse_member_tamil_name: "",
                            spouse_phone: "",
                          });
                          setMemberIdSearch("");
                          setMemberNameSearch("");
                          setMemberVerified(false);

                          // Show inline error
                          setIsAlreadyAdded(true);

                          return; // stop execution
                        }

                        // If not already added, clear error and continue
                        setIsAlreadyAdded(false);

                        setMemberIdSearch(m.member_id);
                        setMemberNameSearch(m.member_name);
                        setValue("member_id", m.member_id);
                        setValue("member_name", m.member_name);
                        setValue("member_tamil_name", m.member_tamil_name || "");
                        setValue("phone", m.primary_contact_number || "");
                        setMemberDropdownById([]);
                        setMemberDropdownByName([]);
                        setMemberVerified(true);

                        // Fetch spouse
                        try {
                          const res = await axios.get(`${URL}/member-search/get-spouse?memberId=${m.member_id}`, {
                            headers: { Authorization: token },
                          });

                          const spouse = res.data || {};

                          setValue("spouse_member_id", spouse.member_id || "");
                          setValue("spouse_member_name", spouse.member_name || "");
                          setValue("spouse_member_tamil_name", spouse.member_tamil_name || "");
                          setValue("spouse_phone", spouse.primary_contact_number || "");
                        } catch (err) {
                          console.error("❌ Spouse fetch error:", err);
                          setValue("spouse_member_id", "");
                          setValue("spouse_member_name", "");
                          setValue("spouse_member_tamil_name", "");
                          setValue("spouse_phone", "");
                        }
                      }}



                    >
                      <span className="w-[250px] font-medium">{m.member_id}</span>
                      <span className="flex-1">{m.member_name}</span>
                      <span className="w-[200px] text-gray-500">
                        {m.primary_contact_number}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Spouse Section */}
          <div className="p-4 border rounded-lg bg-gray-50 mt-4">
            <p className="block text-lg font-medium text-lavender--600">Spouse Name</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
              <div>
                <label className="block text-lg font-medium text-gray-700">Spouse ID</label>
                <input
                  type="text"
                  readOnly
                  {...register("spouse_member_id")}
                  value={watch("spouse_member_id") || ""}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700">Spouse Name</label>
                <input
                  type="text"
                  readOnly
                  {...register("spouse_member_name")}
                  value={watch("spouse_member_name") || ""}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700">Spouse Phone</label>
                <input
                  type="text"
                  readOnly
                  {...register("spouse_phone")}
                  value={watch("spouse_phone") || ""}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button type="submit" className="px-4 py-2 bg-lavender--600 text-white rounded-md" disabled={isAlreadyAdded}>Add</button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        title="Couple Details"
      >
        {selectedCouple && (

          <div className="p-4">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <p>
                <span className="font-semibold">Family ID:</span>{" "}
                {selectedCouple?.husband?.family_id || "N/A"}
              </p>
              <p className="text-sm text-gray-500">
                Joined on: {selectedCouple?.createdAt ? moment(selectedCouple.createdAt).format("DD-MM-YYYY") : "N/A"}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
              {/* Husband Section */}
              <div className="flex flex-col space-y-6">
                <h2 className="text-xl font-bold text-lavender--600">Husband Details</h2>
                {[
                  { label: "ID", value: selectedCouple?.husband?.member_id },
                  { label: "Name", value: selectedCouple?.husband?.member_name },
                  { label: "Tamil Name", value: selectedCouple?.husband?.member_tamil_name },
                  { label: "Phone", value: selectedCouple?.husband?.mobile_number },
                ].map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 py-2">
                    <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700 dark:text-white">
                      {item.label}
                    </div>
                    <div
                      className={`col-span-12 sm:col-span-8 text-base ${item.value ? "text-gray-800 dark:text-gray-300" : "text-yellow-500 font-semibold"
                        }`}
                    >
                      {item.value || "None"}
                    </div>
                  </div>
                ))}
              </div>

              {/* Wife Section */}
              <div className="flex flex-col space-y-6">
                <h2 className="text-xl font-bold text-lavender--600">Wife Details</h2>
                {[
                  { label: "ID", value: selectedCouple?.wife?.member_id },
                  { label: "Name", value: selectedCouple?.wife?.member_name },
                  { label: "Tamil Name", value: selectedCouple?.wife?.member_tamil_name },
                  { label: "Phone", value: selectedCouple?.wife?.mobile_number },
                ].map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 py-2">
                    <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700 dark:text-white">
                      {item.label}
                    </div>
                    <div
                      className={`col-span-12 sm:col-span-8 text-base ${item.value ? "text-gray-800 dark:text-gray-300" : "text-yellow-500 font-semibold"
                        }`}
                    >
                      {item.value || "None"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        )}
      </Modal>


      {/* Response Messages */}
      {Response.status === "Success" && <SuccessMessage Message={Response.message} />}
      {Response.status === "Failed" && <FailedMessage Message={Response.message} />}
    </>
  );
};
