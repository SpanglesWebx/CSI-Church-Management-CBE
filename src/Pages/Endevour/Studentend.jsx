import React, { useEffect, useState } from "react";
import { FaPlus, FaEye, FaTrash } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import Modal from "../../Components/Expense/ExpenseFormModal"; // reuse modal
import { URL } from "../../App";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";

export const Studentend = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eligibleMembers, setEligibleMembers] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [classList, setClassList] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const token = window.sessionStorage.getItem("token");
  const navigate = useNavigate();
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const pageSize = 10; // 👈 how many classes to show per page
  const [searchQuery, setSearchQuery] = useState("");
  const { register, handleSubmit, reset, formState: { errors }, } = useForm();

  const fetchClasses = async (page = 1, query = "") => {
    try {
      const params = new URLSearchParams({
        page,
        limit: pageSize,
        search: query,
      });

      const res = await axios.get(`${URL}/endeavour-classes?` + params.toString(), {
        headers: { Authorization: token },
      });

      setClassList(res.data.classes || []);
      setClassOptions(res.data.classes || []);
      setTotalPages(res.data.totalPages || 1);
      setCurrentPage(res.data.page || 1);
    } catch (err) {
      console.error("Error fetching classes:", err);
      setClassList([]);
      setClassOptions([]);
      setTotalPages(1);
    }
  };


  useEffect(() => {
    fetchClasses(CurrentPage, searchQuery);
  }, [CurrentPage, searchQuery]);


  // Handle search input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // reset to first page on new search
  };

  const resetModal = () => {
    setSelectedClassId("");
    setEligibleMembers([]);
    setSelectedStudents([]);
    reset();
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    resetModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetModal();
  };



  const handleClassChange = async (e) => {
  const selectedId = e.target.value;
  setSelectedClassId(selectedId);

  if (!selectedId) {
    setSelectedClass(null);
    setEligibleMembers([]);
    setSelectedStudents([]);
    return;
  }

  try {
    const headers = { headers: { Authorization: token } };

    // Try to find class data locally first (from classList), otherwise fetch it
    let cls = classList.find((c) => c._id === selectedId);
    if (!cls) {
      const clsRes = await axios.get(`${URL}/endeavour-classes/${selectedId}`, headers);
      // adjust depending on your backend shape; assume clsRes.data is the class object
      cls = clsRes.data;
    }

    // set selected class for UI (used for max_students etc.)
    setSelectedClass(cls);

    // Preselect students already present in this specific section
    const preselected = (cls.students || []).map((s) => ({
      member_id: s.member_id,
      member_name: s.member_name,
      date_of_birth: s.date_of_birth,
      _id: s._id,
    }));
    setSelectedStudents(preselected);

    // Fetch eligible students from backend (this endpoint should exclude students
    // already enrolled in any section of the same class_name if backend is implemented as suggested)
    const res = await axios.get(
      `${URL}/endeavour-classes/${selectedId}/eligible-students`,
      headers
    );

    let data = res.data || [];

    // Ensure the eligible list does not include students already in THIS SECTION
    // (defence-in-depth even if backend already excluded them)
    const eligibleFiltered = data.filter(
      (m) => !preselected.some((ps) => ps.member_id === m.member_id)
    );

    setEligibleMembers(eligibleFiltered);
  } catch (err) {
    console.error("Error fetching eligible endeavour members:", err);
    setSelectedClass(null);
    setEligibleMembers([]);
    setSelectedStudents([]);
  }
};

  const toggleStudentSelection = (member) => {
    const isSelected = selectedStudents.some(
      (s) => s.member_id === member.member_id
    );

    if (isSelected) {
      setSelectedStudents(
        selectedStudents.filter((s) => s.member_id !== member.member_id)
      );
      setEligibleMembers(
        eligibleMembers.map((m) =>
          m.member_id === member.member_id
            ? { ...m, alreadyEnrolled: false }
            : m
        )
      );
    } else {
      setSelectedStudents([...selectedStudents, member]);
      setEligibleMembers(
        eligibleMembers.map((m) =>
          m.member_id === member.member_id
            ? { ...m, alreadyEnrolled: true }
            : m
        )
      );
    }
  };

  const onSubmit = async () => {
    if (!selectedClassId) {
      alert("Please select a class");
      return;
    }

    try {
      await axios.post(
        `${URL}/endeavour-classes/${selectedClassId}/students`,
        { students: selectedStudents },
        { headers: { Authorization: token } }
      );
      setResponse({ status: "Success", message: "Students added successfully!" });
      await fetchClasses(CurrentPage, searchQuery);
      handleCloseModal();
    } catch (err) {
      console.error("Error saving endeavour students:", err);
      alert("Error saving students. Please try again.");
    }
  };

  const handleViewDetails = (cls) => {
    setSelectedClass(cls);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setSelectedClass(null);
    setIsViewModalOpen(false);
  };

  useEffect(() => {
    setTotalPages(Math.ceil(classList.length / pageSize));
  }, [classList]);


  return (
    <div>
      <div className="h-full p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex flex-col items-center justify-between lg:flex-row">
          <h2 className="font-bold text-lg">Endeavour Classes</h2>
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
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-4 py-2 text-white bg-lavender--600 rounded-lg"
          >
            <FaPlus /> Add Student
          </button>

        </div>

        {/* Class list table */}
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full ">
            <thead>
              <tr className="">
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Class</th>
                <th className="p-2 text-center">Years</th>
                <th className="p-2 text-center">Teacher</th>
                <th className="p-2 text-center">Students</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {classList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">
                    No data found
                  </td>
                </tr>
              ) : (
                classList.map((cls, idx) => (
                  <tr key={cls._id} className="border-b">
                    <td className="p-2 text-center">
                      {(CurrentPage - 1) * pageSize + idx + 1} {/* correct serial */}
                    </td>
                    <td className="p-2 text-center">{cls.class_name} {cls.section_name}</td>
                    <td className="p-2 text-center">
                      {moment(cls.year_from).format("YYYY")} - {moment(cls.year_to).format("YYYY")}
                    </td>
                    <td className="p-2">{cls.teacher?.name || "-"}</td>
                    <td className="p-2 text-center">{cls.students?.length || 0}</td>
                    <td className="p-2 text-center">
                      <FaEye className="cursor-pointer text-blue-600 m-auto" onClick={() => handleViewDetails(cls)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>



          </table>
        </div>
        <div className="relative flex flex-wrap items-center justify-center mt-4 space-x-3 select-none">
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

          <div className="absolute flex px-3 space-x-2 rounded right-10">
            <span className="px-4 py-2 text-center text-gray-700 bg-gray-100 rounded">
              Total Page: <span>{TotalPages}</span>
            </span>
            <span
              onClick={() => setCurrentPage(TotalPages)}
              className={`${TotalPages === CurrentPage
                ? "disabled opacity-50 bg-gray-100 px-4 py-2 cursor-not-allowed"
                : "px-4 py-2 text-blue-400 bg-gray-100 rounded active:text-blue-800 hover:cursor-pointer"
                }`}
            >
              Last Page
            </span>
          </div>
        </div>

      </div>

      {/* Add Students Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Add Student"
      >
        <div className="max-w-[1300px] w-full">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="max-h-[600px] overflow-y-auto pr-2">
              {/* Class & Section */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="w-full">
                  <label
                    htmlFor="class_section"
                    className="block mb-3 font-semibold text-gray-800 dark:text-white"
                  >
                    Class & Section
                  </label>
                  <select
                    id="class_section"
                    {...register("class_section", { required: "Class & Section is required" })}
                    onChange={handleClassChange}
                    className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  >
                    <option value="">Select Class & Section</option>
                    {classOptions.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.class_name}{cls.section_name ? ` - ${cls.section_name}` : ""}
                      </option>
                    ))}
                  </select>
                  {errors.class_section && (
                    <p className="text-sm text-red-500">{errors.class_section.message}</p>
                  )}
                </div>
              </div>

              {/* Eligible + Selected Students */}
              {eligibleMembers.length > 0 && (
                <div className="grid grid-cols-2 gap-6 mt-4">
                  {/* Eligible Members */}
                  <div>
                    <h3 className="mb-2 font-semibold text-gray-700">Eligible Members</h3>
                    <table className="min-w-full text-sm border">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 border">Member ID</th>
                          <th className="p-2 border">Name</th>
                          <th className="p-2 border">DOB</th>
                          <th className="p-2 border">Select</th>
                        </tr>
                      </thead>
                      <tbody>
                        {eligibleMembers
                          .filter(m => !selectedStudents.some(s => s.member_id === m.member_id))
                          .map((m) => (
                            <tr key={m.member_id}>
                              <td className="p-2 border">{m.member_id}</td>
                              <td className="p-2 border">{m.member_name}</td>
                              <td className="p-2 border">
                                {m.date_of_birth ? moment(m.date_of_birth).format("DD-MM-YYYY") : "-"}
                              </td>
                              <td className="p-2 border text-center">
                                {/* <input
                                  type="checkbox"
                                  checked={false}
                                  disabled={selectedStudents.length >= selectedClass?.max_students}
                                  onChange={() => toggleStudentSelection(m)}
                                /> */}
                                <input
  type="checkbox"
  checked={selectedStudents.some(s => s.member_id === m.member_id)}
  disabled={selectedStudents.length >= selectedClass?.max_students}
  onChange={() => toggleStudentSelection(m)}
/>

                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Selected Students */}
                  <div>
                    <h3 className="mb-2 font-semibold text-gray-700">Selected Students</h3>
                    <table className="min-w-full text-sm text-gray-600 border">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 border">Member ID</th>
                          <th className="p-2 border">Name</th>
                          <th className="p-2 border">DOB</th>
                          <th className="p-2 border">Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedStudents.map((m) => (
                          <tr key={m.member_id}>
                            <td className="p-2 border">{m.member_id}</td>
                            <td className="p-2 border">{m.member_name}</td>
                            <td className="p-2 border">
                              {m.date_of_birth ? moment(m.date_of_birth).format("DD-MM-YYYY") : "-"}
                            </td>
                            <td className="p-2 border">
                              <div className="flex justify-center items-center">
                                <FaTrash
                                  className="text-red-500 cursor-pointer"
                                  onClick={() => toggleStudentSelection(m)}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-base font-medium text-red-500 border border-transparent rounded-md focus:outline-none focus:ring-0 sm:text-sm"
                  onClick={handleCloseModal}
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center px-4 py-2 text-base font-medium text-white bg-lavender--600 border border-transparent rounded-md shadow-sm hover:bg-lavender--600 focus:outline-none focus:ring-0 sm:text-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      </Modal>


      {/* View Class Details */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        title="Class Details"
      >
        {selectedClass && (
          <div className="max-h-[600px] overflow-y-auto">
            {/* Class Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 mb-2">
              <p>
                <strong>Class & Section:</strong> {selectedClass.class_name}{" "}
                {selectedClass.section_name}
              </p>
              <p>
                <strong>Teacher:</strong> {selectedClass.teacher?.name || "-"}
              </p>
              <p>
                <strong>Year Range:</strong>{" "}
                {moment(selectedClass.year_from).format("YYYY")} to{" "}
                {moment(selectedClass.year_to).format("YYYY")}
              </p>
              <p>
                <strong>Current Students:</strong>{" "}
                {selectedClass.students?.length || 0}
              </p>
            </div>

            {/* Students Table */}
            <h3 className="mb-2 font-semibold text-gray-700">Students</h3>
            <table className="min-w-full text-sm text-gray-600 border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border text-center">Sl No</th>
                  <th className="p-2 border text-center">Member ID</th>
                  <th className="p-2 border text-center">Name</th>
                  <th className="p-2 border text-center">DOB</th>
                </tr>
              </thead>
              <tbody>
                {selectedClass.students && selectedClass.students.length > 0 ? (
                  selectedClass.students.map((s, index) => (
                    <tr key={s._id} className="border-b">
                      <td className="p-2 border text-center">{index + 1}</td>
                      <td className="p-2 border text-center">{s.member_id}</td>
                      <td className="p-2 border text-center">{s.member_name}</td>
                      <td className="p-2 border text-center">
                        {s.date_of_birth
                          ? moment(s.date_of_birth).format("DD-MM-YYYY")
                          : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-4 text-center text-gray-500"
                    >
                      No students enrolled.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
{Response.status && (
        Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />
      )}
    </div>
  );
};
