import React, { useEffect, useState, useRef } from "react";
import { CiEdit } from "react-icons/ci";
import { FaEye, FaPlus } from "react-icons/fa";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { URL } from "../../App";
import axios from "axios";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import down from "../../assets/downloade.svg";
import moment from "moment";
import { debounce } from "lodash";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import "./DashSundayschool.css";
import Pagination from "../../Components/Helpers/Pagination";

export const ClassSunday = () => {
  // class tags state
  const [selectedClass, setSelectedClass] = useState("");
  const [classList, setClassList] = useState([]); // { _id, name } objects from backend
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);

  const [newClasses, setNewClasses] = useState([]); // tags array inside modal
  const [classInput, setClassInput] = useState("");

  // separate modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { category } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [classes, setClasses] = useState([]);
  const [serverError, setServerError] = useState("");
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [options, setOptions] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const token = window.sessionStorage.getItem("token");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [memberIdSearch, setMemberIdSearch] = useState("");
  const [memberNameSearch, setMemberNameSearch] = useState("");
  const [memberDropdownById, setMemberDropdownById] = useState([]);
  const [memberDropdownByName, setMemberDropdownByName] = useState([]);
  const [memberVerified, setMemberVerified] = useState(false);
  const [memberError, setMemberError] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewClass, setViewClass] = useState(null);




  // UI validation + helpers
  const [errorsUI, setErrorsUI] = useState({});
  const [activeField, setActiveField] = useState(null);
  const [saving, setSaving] = useState(false);

  // pagination helpers (optional like previous screen)
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);

    // Reset react-hook-form fields
    reset({
      class_name: "",
      section_name: "",
      year_from: "",
      year_to: "",
      teacherId: "",
      max_students: "",
      notes: "",
    });

    // Reset local state
    setSelectedClass("");
    setMemberIdSearch("");
    setMemberNameSearch("");
    setMemberDropdownById([]);
    setMemberDropdownByName([]);
    setMemberVerified(false);
    setNewClasses([]);
    setClassInput("");
  };

  const handleCloseAddModal = () => {
    reset();
    setIsAddModalOpen(false);
  };
  const handleViewClass = (row) => {
    setViewClass(row);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewClass(null);
    setIsViewModalOpen(false);
  };

  // 🔍 Debounced search by ID
  const debouncedSearchMemberById = useRef(
    debounce(async (val) => {
      if (!val) {
        setMemberDropdownById([]);
        return;
      }
      try {
        const res = await axios.get(`${URL}/member-search/by-id?id=${val}`, {
          headers: { Authorization: token },
        });
        if (res.data?.length > 0) {
          setMemberDropdownById(res.data);
          setMemberError("");
        } else {
          setMemberDropdownById([]);
          setMemberError("Member not found");
        }
      } catch (err) {
        console.error(err);
        setMemberDropdownById([]);
        setMemberError("Error searching member");
      }
    }, 400)
  ).current;

  // 🔍 Debounced search by Name
  const debouncedSearchMemberByName = useRef(
    debounce(async (val) => {
      if (!val) {
        setMemberDropdownByName([]);
        return;
      }
      try {
        const res = await axios.get(`${URL}/member-search?name=${val}`, {
          headers: { Authorization: token },
        });
        if (res.data?.length > 0) {
          setMemberDropdownByName(res.data);
          setMemberError("");
        } else {
          setMemberDropdownByName([]);
          setMemberError("Member not found");
        }
      } catch (err) {
        console.error(err);
        setMemberDropdownByName([]);
        setMemberError("Error searching member");
      }
    }, 400)
  ).current;

  const [Response, setResponse] = useState({
    status: null,
    message: "",
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    trigger,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
    },
  });

  const navigate = useNavigate();

  /** =================== LOAD CLASSES =================== */
  const loadClasses = async (page = 1) => {
    try {
      const params = new URLSearchParams({ page, limit: rowsPerPage });
      if (searchQuery) params.set("search", searchQuery.trim());
      if (dateRange.from) params.set("from", dateRange.from);
      if (dateRange.to) params.set("to", dateRange.to);

      const { data } = await axios.get(
        `${URL}/sunday-classes?` + params.toString(),
        {
          headers: { Authorization: token },
        }
      );

      setClasses(data.classes || []);
      setCurrentPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Error loading classes:", err);
      setClasses([]);
      setTotalPages(1);
    }
  };

  useEffect(() => {
    loadClasses(CurrentPage);
  }, [CurrentPage, rowsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
    loadClasses(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, dateRange]);

  /** =================== TEACHER SEARCH =================== */
  const handleSearchteacher = async (query) => {
    if (!query || query.length < 2) {
      setOptions([]);
      return;
    }
    try {
      const res = await fetch(
        `${URL}/member-search?name=${encodeURIComponent(query)}`,
        { headers: { Authorization: token } }
      );
      if (!res.ok) {
        setOptions([]);
        return;
      }
      const data = await res.json();
      setOptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Teacher search error:", err);
      setOptions([]);
    }
  };

  /** =================== FORM HANDLERS =================== */
  const handleOpenModal = () => {
    setIsModalOpen(true);
    setIsEdit(false);
    setEditingClass(null);
    reset();
    setOptions([]);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEdit(false);
    setEditingClass(null);
    reset();
    setOptions([]);
  };

  const onSubmit = async (formData) => {
    try {
      if (isEdit && editingClass) {
        await axios.put(`${URL}/sunday-classes/${editingClass._id}`, formData, {
          headers: { Authorization: token },
        });
      } else {
        await axios.post(`${URL}/sunday-classes`, formData, {
          headers: { Authorization: token },
        });
      }

      reset();
      setIsModalOpen(false);
      setIsEdit(false);
      setEditingClass(null);

      const updated = await axios.get(`${URL}/sunday-classes`, {
        headers: { Authorization: token },
      });
      setClasses(updated.data.classes || []);
    } catch (error) {
      console.error("Error saving class:", error);
      setServerError(error?.response?.data?.message || "Error saving class");
    }
  };

  /** =================== DATE & SEARCH =================== */
  const today = new Date().toISOString().split("T")[0];

  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
    if (e.target.value && toDate) {
      setDateRange({ from: e.target.value, to: toDate });
    }
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
    if (fromDate && e.target.value) {
      setDateRange({ from: fromDate, to: e.target.value });
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const fetchClassTags = async () => {
      try {
        const res = await axios.get(`${URL}/sunday-class-tags`, {
          headers: { Authorization: token },
        });
        // expecting: { classTags: [{ _id, name }, ...] }
        setClassList(res.data.classTags || []);
      } catch (err) {
        console.error("Error fetching class tags:", err);
        setClassList([]);
      }
    };
    fetchClassTags();
  }, []); // run once

  const handleAddSubmit = async (formData) => {
    if (saving) return;
    const isValid = await trigger();
    if (!isValid) {
      setResponse({
        status: "Failed",
        message: "Please fill all required fields",
      });
      return;
    }
    try {
      setSaving(true);
      await axios.post(`${URL}/sunday-classes`, formData, {
        headers: { Authorization: token },
      });

      reset();
      setIsAddModalOpen(false);

      const updated = await axios.get(`${URL}/sunday-classes`, {
        headers: { Authorization: token },
      });

      setClasses(updated.data.classes || []);

      // ✅ SHOW SUCCESS TOAST
      setResponse({
        status: "Success",
        message: "Class added successfully",
      });

    } catch (error) {
      console.error("Error adding class:", error);

      setResponse({
        status: "Failed",
        message: error?.response?.data?.message || "Error adding class",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (formData) => {
    if (saving || !editingClass) return;


    try {
      setSaving(true);

      await axios.put(`${URL}/sunday-classes/${editingClass._id}`, formData, {
        headers: { Authorization: token },
      });

      reset();
      setIsEditModalOpen(false);
      setEditingClass(null);

      const updated = await axios.get(`${URL}/sunday-classes`, {
        headers: { Authorization: token },
      });

      setClasses(updated.data.classes || []);

      // ✅ SUCCESS TOAST
      setResponse({
        status: "Success",
        message: "Class updated successfully",
      });

    } catch (error) {
      setResponse({
        status: "Failed",
        message: error?.response?.data?.message || "Error updating class",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (memberVerified) {
      const timer = setTimeout(() => setMemberVerified(false), 2000); // 2000ms = 2s
      return () => clearTimeout(timer); // cleanup if component unmounts or changes
    }
  }, [memberVerified]);


  useEffect(() => {
    if (Response.status !== null) {
      const timer = setTimeout(() => {
        setResponse({ status: null, message: "" });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [Response]);


  const validateMaxLength = (name, value, max = 100) => {
    if (value.length > max) {
      setErrorsUI(prev => ({
        ...prev,
        [name]: `Maximum ${max} characters allowed`
      }));

      setTimeout(() => {
        setErrorsUI(prev => {
          const copy = { ...prev };
          delete copy[name];
          return copy;
        });
      }, 4000);

      return false;
    }

    setErrorsUI(prev => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });

    return true;
  };


  const RequiredLabel = ({ children }) => (
    <label className="block text-sm font-medium text-gray-700">
      {children}
      <span className="text-red-500 ml-1">*</span>
    </label>
  );

  const CharCounter = ({ value = "", max = 100, show }) => {
    if (!show || !value.length) return null;

    return (
      <span
        className={`absolute bottom-1 right-2 text-[10px]
      ${value.length > max ? "text-red-500" : "text-gray-400"}`}
      >
        {value.length}/{max}
      </span>
    );
  };

  return (
    <div>
      <div className="h-full p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px] ">
        <div>
          <h1 className="text-lg font-semibold">
            Sunday School Class
          </h1>
        </div>
        {/* FILTERS */}
        <div className="flex flex-col items-center justify-between lg:flex-row">
          <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
            {/* From Date */}

            <div className="flex items-center gap-2">
              <label>From</label>
              <input type="date" max={today}
                value={fromDate}
                onChange={handleFromDateChange}
                className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 
                         border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"/>
            </div>

            {/* To Date */}


            <div className="flex items-center gap-2">
              <label>To</label>
              <input type="date" max={today}
                value={toDate}
                onChange={handleToDateChange}
                className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 
                         border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"/>
            </div>

            {/* Search */}
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
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex w-full gap-x-4 lg:w-auto">
            {fromDate && toDate ? (
              <button className="mr-4 text-blue-600 cursor-pointer hover:text-blue-800">
                <img src={down} alt="download" />
              </button>
            ) : null}
            <button
              onClick={() => {
                handleOpenAddModal();
              }}
              className="flex items-center w-full gap-2 px-5 py-2 text-white bg-lavender--600 rounded-lg lg:w-auto"
            >
              <FaPlus /> Add Class
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto mt-8">
          <table className="w-full text-sm text-left text-gray-500 rtl:text-right">
            <thead className="text-base text-gray-700 bg-white text-center">
              <tr>
                <th className="p-2">Sl No</th>
                <th className="p-2">Class</th>
                <th className="p-2">Section</th>
                <th className="p-2">From</th>
                <th className="p-2">Year</th>
                <th className="p-2">Teacher</th>
                <th className="p-2">Max Students</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((row, index) => (
                <tr key={row._id} className="bg-white border-b text-center">
                  <td className="p-2">
                    {(CurrentPage - 1) * rowsPerPage + index + 1}
                  </td>
                  <td className="p-2">{row.class_name}</td>
                  <td className="p-2">{row.section_name}</td>
                  <td className="p-2">
                    {row.year_from ? moment(row.year_from).format("DD-MM-YYYY") : "-"}
                  </td>
                  <td className="p-2">
                    {row.year_to ? moment(row.year_to).format("DD-MM-YYYY") : "-"}
                  </td>
                  <td className="p-2">{row.teacher?.name || "-"}</td>
                  <td className="p-2">{row.max_students}</td>
                  <td className="p-2 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <FaEye
                        title="View Class"
                        size={18}
                        className="text-lavender--600 cursor-pointer"
                        onClick={() => handleViewClass(row)}
                      />

                      <CiEdit
                        title="Edit"
                        size={18}
                        className="cursor-pointer text-blue-500"
                        onClick={() => {
                          setEditingClass(row);
                          setIsEditModalOpen(true);

                          setSelectedClass(row.class_name);


                          // Prefill form
                          setValue("class_name", row.class_name);
                          setValue("section_name", row.section_name);
                          setValue("year_from", row.year_from?.split("T")[0]);
                          setValue("year_to", row.year_to?.split("T")[0]);
                          setValue("max_students", row.max_students);
                          setValue("notes", row.notes || "");

                          if (row.teacher) {
                            setMemberIdSearch(row.teacher.member_id);
                            setMemberNameSearch(row.teacher.name);
                            setValue("teacherId", row.teacher.member_id);
                            setMemberVerified(true);
                          }
                        }}
                      />
                    </div>


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


      <Modal isOpen={isAddModalOpen} onClose={handleCloseAddModal} title="Add Class">
        <div className={`${saving ? "pointer-events-none opacity-60" : ""}`}>
          <form onSubmit={handleSubmit(handleAddSubmit)}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* CLASS FIELD */}
              <div>
                <div className="flex items-center justify-between">


                  <RequiredLabel>Class</RequiredLabel>
                  <button
                    type="button"
                    onClick={() => {
                      setIsClassModalOpen(true);
                      // optionally prefill newClasses with current tags so user can edit them
                      setNewClasses(classList.map(c => c.name));
                    }}
                    className="block mb-1 font-semibold text-sm text-lavender--600"
                  >
                    Add Class
                  </button>
                </div>

                <select
                  {...register("class_name", { required: "Class is required" })}
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setValue("class_name", e.target.value); // sync with react-hook-form
                  }}
                  className="border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5"
                >
                  <option value="">-- Select Class --</option>
                  {classList.map((cls) => (
                    <option key={cls._id} value={cls.name}>
                      {cls.name}
                    </option>
                  ))}
                </select>

                {errors.class_name && (
                  <p className="text-sm text-red-500 mt-1">{errors.class_name.message}</p>
                )}
              </div>



              {/* Section */}
              <div className="relative">
                <RequiredLabel>Section</RequiredLabel>

                <input
                  type="text"
                  {...register("section_name", { required: "Section is required" })}
                  maxLength={30}
                  onFocus={() => setActiveField("section_name")}
                  onBlur={() => setActiveField(null)}
                  onChange={(e) => {
                    let val = e.target.value.replace(/[0-9]/g, "");

                    if (!validateMaxLength("section_name", val, 30)) return;

                    setValue("section_name", val, { shouldValidate: true });
                  }}
                  className={`block w-full mt-1 border rounded-md shadow-sm
    ${errorsUI.section_name ? "border-red-500" : "border-gray-300"}`}
                />


                {errorsUI.section_name && (
                  <p className="text-xs text-red-500 mt-1">{errorsUI.section_name}</p>
                )}

                {errors.section_name && (
                  <p className="text-sm text-red-500">{errors.section_name.message}</p>
                )}
              </div>

              {/* Year From */}
              <div>


                <RequiredLabel>Year From
                </RequiredLabel>
                <input
                  type="date"
                  {...register("year_from", { required: "Start year is required" })}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
                />
                {errors.year_from && (
                  <p className="text-sm text-red-500">{errors.year_from.message}</p>
                )}
              </div>

              {/* Year To */}
              <div>

                <RequiredLabel>Year To</RequiredLabel>
                <input
                  type="date"
                  {...register("year_to", { required: "End year is required" })}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
                />
                {errors.year_to && (
                  <p className="text-sm text-red-500">{errors.year_to.message}</p>
                )}
              </div>



              {/* Teacher */}
              <div className="relative">


                <RequiredLabel>Teacher ID</RequiredLabel>

                {/* Hidden field for backend ID */}
                <input
                  type="hidden"
                  {...register("teacherId", { required: "Teacher is required" })}
                />

                {/* Search by ID */}
                <input
                  type="text"
                  placeholder="Search by Member ID"
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
                  value={memberIdSearch}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMemberIdSearch(val);
                    debouncedSearchMemberById(val);
                  }}
                />
              </div>
              <div className="relative">

                <RequiredLabel>Teacher Name</RequiredLabel>

                {/* OR Search by Name */}
                <input
                  type="text"
                  placeholder="Search by Name"
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
                  value={memberNameSearch}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMemberNameSearch(val);
                    debouncedSearchMemberByName(val);
                  }}
                />



                {memberVerified && (
                  <p className="mt-1 text-sm text-green-600">Teacher verified successfully</p>
                )}

                {errors.teacherId && (
                  <p className="text-sm text-red-500">{errors.teacherId.message}</p>
                )}
              </div>
              {/* Dropdown results */}
              {(memberDropdownById.length > 0 || memberDropdownByName.length > 0) && (
                <ul className="absolute left-1/2 -translate-x-1/2 mt-[275px] w-[90%] bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {(memberDropdownById.length > 0 ? memberDropdownById : memberDropdownByName).map((m) => (
                    <li
                      key={m.member_id}
                      onClick={() => {
                        setMemberIdSearch(m.member_id);
                        setMemberNameSearch(m.member_name);
                        setValue("teacherId", m.member_id);
                        setMemberDropdownById([]);
                        setMemberDropdownByName([]);
                        setMemberVerified(true);
                      }}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex justify-between"
                    >

                      <span className="w-[400px] font-medium">{m.member_id}</span>
                      <span className="flex-1">{m.member_name}</span>
                    </li>
                  ))}
                </ul>
              )}


              {/* Max Students */}
              <div className="relative">
                <RequiredLabel>Max Students</RequiredLabel>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  {...register("max_students", {
                    required: "Required",
                    pattern: {
                      value: /^[0-9]{1,10}$/,
                      message: "Only numbers allowed (max 10 digits)"
                    }
                  })}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setValue("max_students", val, { shouldValidate: true });
                  }}
                  className="block w-full mt-1 border rounded-md shadow-sm border-gray-300"


                />

                {errors.max_students && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.max_students.message}
                  </p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="mt-4 relative">
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>

              <input
                type="text"
                maxLength={200}
                {...register("notes")}
                onFocus={() => setActiveField("notes")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  const val = e.target.value;

                  if (!validateMaxLength("notes", val, 200)) return;

                  setValue("notes", val);
                }}
                className={`block w-full mt-1 border rounded-md shadow-sm
      ${errorsUI.notes ? "border-red-500" : "border-gray-300"}
    `}
              />





            </div>



            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="submit"
                disabled={saving}
                className={`px-4 py-2 rounded-md text-white flex items-center gap-2
  ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}`}
              >
                {saving && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Class"
      >
        <div className={`${saving ? "pointer-events-none opacity-60" : ""}`}>
          <form onSubmit={handleSubmit(handleEditSubmit)}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Class */}


              {/* CLASS FIELD */}
              <div>
                <div className="flex items-center justify-between">

                  <RequiredLabel>Class</RequiredLabel>
                  <button
                    type="button"
                    onClick={() => {
                      setIsClassModalOpen(true);
                      // optionally prefill newClasses with current tags so user can edit them
                      setNewClasses(classList.map(c => c.name));
                    }}
                    className="block mb-1 font-semibold text-sm text-lavender--600"
                  >
                    Add Class
                  </button>
                </div>
                <select
                  {...register("class_name", { required: "Class is required" })}
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setValue("class_name", e.target.value, { shouldValidate: true });
                  }}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
                >
                  <option value="">-- Select Class --</option>

                  {classList.map((cls) => (
                    <option key={cls._id} value={cls.name}>
                      {cls.name}
                    </option>
                  ))}
                </select>

                {errors.class_name && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.class_name.message}
                  </p>
                )}
              </div>



              {/* Section */}
              <div>

                <RequiredLabel>Section</RequiredLabel>
                <input
                  type="text"
                  {...register("section_name", { required: "Section is required" })}
                  onInput={(e) =>
                    (e.target.value = e.target.value.replace(/[0-9]/g, ""))
                  }
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
                />
                {errors.section_name && (
                  <p className="text-sm text-red-500">{errors.section_name.message}</p>
                )}
              </div>

              {/* Year From */}
              <div>

                <RequiredLabel>Year From</RequiredLabel>
                <input
                  type="date"
                  {...register("year_from", { required: "Start year is required" })}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
                />
                {errors.year_from && (
                  <p className="text-sm text-red-500">{errors.year_from.message}</p>
                )}
              </div>

              {/* Year To */}
              <div>

                <RequiredLabel> Year To</RequiredLabel>
                <input
                  type="date"
                  {...register("year_to", { required: "End year is required" })}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
                />
                {errors.year_to && (
                  <p className="text-sm text-red-500">{errors.year_to.message}</p>
                )}
              </div>



              {/* Teacher */}
              <div className="relative">

                <RequiredLabel> Teacher ID</RequiredLabel>

                {/* Hidden field for backend ID */}
                <input
                  type="hidden"
                  {...register("teacherId", { required: "Teacher is required" })}
                />

                {/* Search by ID */}
                <input
                  type="text"
                  placeholder="Search by Member ID"
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
                  value={memberIdSearch}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMemberIdSearch(val);
                    debouncedSearchMemberById(val);
                  }}
                />
              </div>
              <div className="relative">

                <RequiredLabel> Teacher Name</RequiredLabel>

                {/* OR Search by Name */}
                <input
                  type="text"
                  placeholder="Search by Name"
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
                  value={memberNameSearch}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMemberNameSearch(val);
                    debouncedSearchMemberByName(val);
                  }}
                />



                {memberVerified && (
                  <p className="mt-1 text-sm text-green-600">Teacher verified successfully</p>
                )}

                {errors.teacherId && (
                  <p className="text-sm text-red-500">{errors.teacherId.message}</p>
                )}
              </div>
              {/* Dropdown results */}
              {(memberDropdownById.length > 0 || memberDropdownByName.length > 0) && (
                <ul className="absolute left-1/2 -translate-x-1/2 mt-[275px] w-[90%] bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {(memberDropdownById.length > 0 ? memberDropdownById : memberDropdownByName).map((m) => (
                    <li
                      key={m.member_id}
                      onClick={() => {
                        setMemberIdSearch(m.member_id);
                        setMemberNameSearch(m.member_name);
                        setValue("teacherId", m.member_id);
                        setMemberDropdownById([]);
                        setMemberDropdownByName([]);
                        setMemberVerified(true);
                      }}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex justify-between"
                    >

                      <span className="w-[400px] font-medium">{m.member_id}</span>
                      <span className="flex-1">{m.member_name}</span>
                    </li>
                  ))}
                </ul>
              )}


              {/* Max Students */}
              {/* <div>
                <RequiredLabel>Max Students</RequiredLabel>
                <input
                  type="number"
                  min={0}

                  {...register("max_students", { required: "Required" })}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
                />
                {errors.max_students && (
                  <p className="text-sm text-red-500">{errors.max_students.message}</p>
                )}
              </div> */}
              <div className="relative">
                <RequiredLabel>Max Students</RequiredLabel>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  {...register("max_students", {
                    required: "Required",
                    pattern: {
                      value: /^[0-9]{1,10}$/,
                      message: "Only numbers allowed (max 10 digits)"
                    }
                  })}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, ""); // remove non-digits
                    setValue("max_students", val);
                  }}
                  className={`block w-full mt-1 border rounded-md shadow-sm
      ${errors.max_students ? "border-red-500" : "border-gray-300"}
    `}
                />

                {errors.max_students && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.max_students.message}
                  </p>
                )}
              </div>
            </div>

            {/* Notes */}



            <div className="mt-4 relative">
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>

              <input
                type="text"
                maxLength={150}
                {...register("notes")}
                onFocus={() => setActiveField("notes")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  const val = e.target.value;

                  if (!validateMaxLength("notes", val, 150)) return;

                  setValue("notes", val);
                }}
                className={`block w-full mt-1 border rounded-md shadow-sm
      ${errorsUI.notes ? "border-red-500" : "border-gray-300"}
    `}
              />



            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="submit"
                disabled={saving}
                className={`px-4 py-2 rounded-md text-white flex items-center gap-2
  ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}`}
              >
                {saving && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                {saving ? "Updating..." : "Update"}
              </button>
            </div>
          </form>
        </div>
      </Modal>


      <Modal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        title="View Class Details"
      >
        {viewClass ? (
          <div className="text-sm text-gray-700 space-y-4 max-h-[600px] overflow-y-auto">
            {[
              { label: "Class Name", value: viewClass.class_name || "-" },
              { label: "Section", value: viewClass.section_name || "-" },
              { label: "Year From", value: viewClass.year_from ? new Date(viewClass.year_from).toLocaleDateString() : "-" },
              { label: "Year To", value: viewClass.year_to ? new Date(viewClass.year_to).toLocaleDateString() : "-" },
              { label: "Max Students", value: viewClass.max_students || "-" },
              { label: "Notes", value: viewClass.notes || "-" },
              { label: "Teacher ID", value: viewClass.teacher?.member_id || "-" },
              { label: "Teacher Name", value: viewClass.teacher?.name || "-" },
            ].map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 py-1">
                <div className="col-span-12 sm:col-span-4 font-semibold text-[16px]">{item.label}</div>
                <div className="col-span-12 sm:col-span-8 text-[16px]">{item.value}</div>
              </div>
            ))}

            {/* Students */}
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Students</h3>
              {viewClass.students?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full border text-sm text-gray-700">
                    <thead className="bg-gray-100 text-xs">
                      <tr>
                        <th className="p-2 border">Sl No.</th>
                        <th className="p-2 border">Member ID</th>
                        <th className="p-2 border">Name</th>
                        <th className="p-2 border">DOB</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewClass.students.map((s, i) => (
                        <tr key={i}>
                          <td className="p-2 border">{i + 1}</td>
                          <td className="p-2 border">{s.member_id}</td>
                          <td className="p-2 border">{s.member_name}</td>
                          <td className="p-2 border">
                            {s.date_of_birth ? moment(s.date_of_birth).format("DD-MM-YYYY") : "-"}
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No students enrolled.</p>
              )}
            </div>


          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">No details available</div>
        )}
      </Modal>



      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">
                Add Class
              </h2>

              {/* Tags */}
              <div className="mt-2">
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {newClasses.map((tag, i) => (
                    <span key={i} className="flex items-center bg-gray-200 text-black px-2 py-1 rounded-full text-sm">
                      {tag}
                      <button
                        type="button"
                        className="ml-2 text-gray-600 hover:text-red-500"
                        onClick={() => setNewClasses(prev => prev.filter((_, idx) => idx !== i))}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                {/* Input for adding new class */}
                <input
                  type="text"
                  placeholder="+ Add Class"
                  value={classInput}
                  onChange={(e) => setClassInput(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === "Tab") && classInput.trim()) {
                      e.preventDefault();
                      const newTag = classInput.replace(/[0-9]/g, "").trim();
                      if (newTag && !newClasses.includes(newTag)) {
                        setNewClasses(prev => [...prev, newTag]);
                      }
                      setClassInput("");
                    }
                  }}
                  className="mt-3 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 mt-5">
                <button
                  onClick={() => {
                    setIsClassModalOpen(false);
                    setNewClasses([]);
                    setClassInput("");
                  }}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      // call the class-tags update endpoint
                      const res = await axios.put(
                        `${URL}/sunday-class-tags/update`,
                        { names: newClasses },
                        { headers: { Authorization: token } }
                      );

                      // expecting { classTags: [{_id, name}, ...] }
                      setClassList(res.data.classTags || []);
                      // Optionally auto-select the first newly added class
                      if (newClasses.length > 0) {
                        const pick = newClasses[0];
                        setSelectedClass(pick);
                        setValue("class_name", pick);
                      }

                      setNewClasses([]);
                      setClassInput("");
                      setIsClassModalOpen(false);

                      setResponse({
                        status: "Success",
                        message: "Classes updated successfully!",
                      });
                    } catch (err) {
                      console.error("Error updating class tags:", err);
                      setResponse({
                        status: "Failed",
                        message: err.response?.data?.message || "Failed to update classes",
                      });
                    }
                  }}
                  className="px-4 py-2 bg-lavender--600 text-white rounded-lg hover:bg-lavender--700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {Response.status !== null ? (
        Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : Response.status === "Failed" ? (
          <FailedMessage Message={Response.message} />
        ) : null
      ) : null}
    </div>
  )
}


