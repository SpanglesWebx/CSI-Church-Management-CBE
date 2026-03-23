import React, { useEffect, useRef, useState } from "react";
import { AiOutlineCloseCircle, AiOutlineNotification } from "react-icons/ai";
import { FaPlus, FaRegClock } from "react-icons/fa";
import { FiCheckCircle, FiUsers } from "react-icons/fi";
import { MdHome, MdOutlineCalendarMonth } from "react-icons/md";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { useForm } from "react-hook-form";
import axios from "axios";
import { URL } from "../../App";
import { IoCheckmark, IoCloseCircleOutline, IoPersonAddOutline } from "react-icons/io5";
import { CiEdit, CiHome } from "react-icons/ci";
import { HiDotsHorizontal } from "react-icons/hi";
import { IoIosCheckmarkCircleOutline, IoIosSearch, IoMdCheckmarkCircleOutline, IoMdClose } from "react-icons/io";

export const MenActivities = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [maleNameSearch, setMaleNameSearch] = useState("");
  const [maleDropdownByName, setMaleDropdownByName] = useState([]);
  const [activityType, setActivityType] = useState("");
  const [showTextarea, setShowTextarea] = useState(false);
  const [showAttendanceTextarea, setAttendanceShowTextarea] = useState(false);
  const [isMemberMember, setIsMemberMember] = useState(true);

  const [MemberIdSearch, setMemberIdSearch] = useState("");
  const [MemberDropdownById, setMemberDropdownById] = useState([]);
  const [MemberSearch, setMemberSearch] = useState("");
  const [MemberDropdown, setMemberDropdown] = useState([]);
  const [addedMembers, setAddedMembers] = useState([]);
  const [selectedMemberAddress, setSelectedMemberAddress] = useState("");
  const [activities, setActivities] = useState([]);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [houseOfferings, setHouseOfferings] = useState({});
  // Attendance modal states
  const [attendees, setAttendees] = useState([]); // [{ id, name, isMember, status }]
  const [attendanceSearch, setAttendanceSearch] = useState("");
  const [nonMemberName, setNonMemberName] = useState("");
  const [showAddNonMember, setShowAddNonMember] = useState(false);
  const [summary, setSummary] = useState({
    totalPresent: 0,
    membersPresent: 0,
    guestsPresent: 0,
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null); // Close dropdown
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);




  const token = window.sessionStorage.getItem("token");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useForm({
    defaultValues: {
      member_name: "",
    },
  });

  const handleOpenModal = () => {
    setIsModalOpen(true);
    reset();
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const cardsData = [
    {
      title: "Total Offerings This Month",
      value: "₹12,500",
      subtitle: "+8.5% from last month",
      icon: MdOutlineCalendarMonth,
    },
    {
      title: "Activities Planned",
      value: "8",
      subtitle: "+2 from last month",
      icon: FaRegClock,
    },
    {
      title: "Activities Completed",
      value: "5",
      subtitle: "62.5% from last month",
      icon: FiCheckCircle,
    },
    {
      title: "Next Activity",
      value: "This Week",
      subtitle: "Fellowship Prayer",
      icon: AiOutlineNotification,
    },
  ];

  // Debounce function
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // Search male members by name
  const debouncedSearchMaleByName = useRef(
    debounce(async (val) => {
      if (!val) return setMaleDropdownByName([]);
      try {
        const res = await axios.get(`${URL}/member-search/male?name=${val}`, {
          headers: { Authorization: token },
        });
        setMaleDropdownByName(res.data || []);
      } catch (err) {
        if (err.response?.status === 404) {
          setMaleDropdownByName([{ member_id: "none", member_name: "No male members match your search", mobile_number: "" }]);
        } else {
          setMaleDropdownByName([]);
        }
      }
    }, 300)
  ).current;
  const debouncedSearchMember = useRef(
    debounce(async (val) => {
      if (!val || !isMemberMember) return setMemberDropdown([]);
      try {
        const res = await axios.get(`${URL}/member-search?name=${val}`, {
          headers: { Authorization: token },
        });
        setMemberDropdown(res.data || []);
      } catch (err) {
        console.error(err);
      }
    }, 400)
  ).current;

  const debouncedSearchMemberById = useRef(
    debounce(async (val) => {
      if (!val || !isMemberMember) return setMemberDropdownById([]);
      try {
        const res = await axios.get(`${URL}/member-search/by-id?id=${val}`, {
          headers: { Authorization: token },
        });
        setMemberDropdownById(res.data || []);
      } catch (err) {
        console.error(err);
      }
    }, 300)
  ).current;

  useEffect(() => {
    if (isMemberMember) {
      // Switching to Member → clear Non-Member fields
      reset({
        MemberName: "",
        MemberPhone: "",
      });
    } else {
      // Switching to Non-Member → clear Member search fields
      setMemberIdSearch("");
      setMemberSearch("");
      reset({
        MemberId: "",
        MemberName: "",
        MemberPhone: "",
      });
      setMemberDropdownById([]);
      setMemberDropdown([]);
    }
  }, [isMemberMember]);



  const handleAddMember = () => {
    if (isMemberMember) {
      if (!MemberIdSearch || !MemberSearch) return;

      setAddedMembers(prev => [
        ...prev,
        {
          id: MemberIdSearch,
          name: MemberSearch,
          address: selectedMemberAddress || "-", // Use hidden input
          isMember: true,
        },
      ]);

      // Reset fields
      setMemberIdSearch("");
      setMemberSearch("");
      setSelectedMemberAddress("");
    } else {
      const name = getValues("nonMemberName");
      const address = getValues("nonMemberAddress");
      if (!name || !address) return;

      setAddedMembers(prev => [
        ...prev,
        {
          id: "-",
          name,
          address,
          isMember: false,
        },
      ]);

      setValue("nonMemberName", "");
      setValue("nonMemberAddress", "");
    }
  };

  const handleRemoveMember = (index) => {
    setAddedMembers((prev) => prev.filter((_, i) => i !== index));
  };



  const fetchActivities = async (page = 1) => {
    try {
      const res = await axios.get(`${URL}/men-activities?page=${page}`, {
        headers: { Authorization: token },
        params: {
          page,
          startDate,
          endDate,
          search,
          status: statusFilter,
        },
      });

      setActivities(res.data.activities || []);
      setCurrentPage(res.data.currentPage);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Failed to fetch activities:", err);
    }
  };

  useEffect(() => {
    fetchActivities(CurrentPage);
  }, [CurrentPage, startDate, endDate, search, statusFilter]);









  const onSubmit = async (data) => {
    try {
      const payload = {
        date: data.date, // from form input
        activityType,
        title: data.title || "",           // weekly prayer
        churchName: data.churchName || "", // church prayer
        churchLocation: data.churchLocation || "",
        customTitle: data.customTitle || "", // other
        leader: { id: "-", name: maleNameSearch }, // you can extend later with id
        notes: data.notes || "",
        houses: activityType === "house-visit" ? addedMembers : [],
      };

      let res;

      if (selectedActivity) {
        // EDIT: update existing activity
        res = await axios.put(`${URL}/men-activities/${selectedActivity._id}`, payload, {
          headers: { Authorization: token },
        });
        setResponse({ status: "Success", message: "Activity Updated!" });
      } else {
        // CREATE: new activity
        res = await axios.post(`${URL}/men-activities`, payload, {
          headers: { Authorization: token },
        });
        setResponse({ status: "Success", message: "Activity Saved!" });
      }

      fetchActivities(CurrentPage);

      // Close modal + reset form
      reset();
      setAddedMembers([]);
      setActivityType("");
      setSelectedActivity(null); // reset selected activity
      setIsModalOpen(false);
    } catch (err) {
      setResponse({ status: "Failed", message: err.response?.data?.message || err.message });
    }
  };


  useEffect(() => {
    if (selectedActivity) {
      if (selectedActivity.activityType === "house-visit") {
        const initialOfferings = {};
        (selectedActivity.houses || []).forEach(h => {
          initialOfferings[h._id || h.name] = h.offering || ""; // use saved offering if present
        });
        setHouseOfferings(initialOfferings);
      } else {
        setHouseOfferings({ single: selectedActivity.totalOffering || "" });
      }
    } else {
      setHouseOfferings({});
    }
  }, [selectedActivity]);

  const computeTotalOfferingForSelected = () => {
    if (!selectedActivity) return 0;
    if (selectedActivity.activityType === "house-visit") {
      return Object.values(houseOfferings).reduce((s, v) => s + (Number(v) || 0), 0);
    } else {
      return Number(houseOfferings.single || 0);
    }
  };


  const handleEditActivity = (activity) => {

    if (activity.status === "Completed") {
      FailedMessage("Cannot edit a completed activity");
      return;
    }
    setSelectedActivity(activity);        // mark this activity as selected
    setIsModalOpen(true);                 // open the modal

    // Pre-fill the form fields
    reset({
      date: new Date(activity.date).toISOString().split("T")[0], // format YYYY-MM-DD
      title: activity.title || "",
      churchName: activity.churchName || "",
      churchLocation: activity.churchLocation || "",
      customTitle: activity.customTitle || "",
      notes: activity.notes || "",
      nonMemberName: "",                   // clear non-member input
      nonMemberAddress: "",
    });

    setActivityType(activity.activityType);

    // Leader name
    setMaleNameSearch(activity.leader?.name || "");

    // Pre-fill addedMembers for house-visit
    if (activity.activityType === "house-visit") {
      setAddedMembers(activity.houses || []);
    } else {
      setAddedMembers([]);
    }

    // If you are using the member toggle, set it appropriately
    setIsMemberMember(true); // default; adjust if needed
  };




  useEffect(() => {
    if (isAttendanceModalOpen && selectedActivity) {
      const fetchAttendance = async () => {
        try {
          const res = await axios.get(`${URL}/mens-fellowship`, {
            headers: { Authorization: token },
          });

          // Transform members → attendees with default absent
          const members = res.data.map((m) => ({
            id: m._id,
            member_id: m.member_id,
            name: m.member_name,
            tamilName: m.member_tamil_name,
            mobile: m.mobile_number,
            isMember: true,
            status: "absent", // 👈 default
          }));

          setAttendees(members);
        } catch (err) {
          console.error("Error fetching attendance:", err);
          setAttendees([]); // fallback
        }
      };
      fetchAttendance();
    }
  }, [isAttendanceModalOpen, selectedActivity]);


  const toggleAttendance = (index) => {
    setAttendees((prev) =>
      prev.map((a, i) =>
        i === index ? { ...a, status: a.status === "present" ? "absent" : "present" } : a
      )
    );
  };

  const markAllPresent = () => {
    setAttendees((prev) => prev.map((a) => ({ ...a, status: "present" })));
  };

  const markAllAbsent = () => {
    setAttendees((prev) => prev.map((a) => ({ ...a, status: "absent" })));
  };


  const handleAddNonMember = () => {
    if (!nonMemberName.trim()) return;
    setAttendees((prev) => [
      ...prev,
      { id: "-", name: nonMemberName, isMember: false, status: "present" },
    ]);
    setNonMemberName(""); // reset input
  };


  const saveAttendance = async () => {
    try {
      const res = await axios.put(
        `${URL}/men-activities/${selectedActivity._id}/attendance`,
        { attendees },
        { headers: { Authorization: token } }
      );
      setResponse({ status: "Success", message: "Attendance saved successfully!" });
      setIsAttendanceModalOpen(false);

      fetchActivities(CurrentPage);
      fetchSummary();
    } catch (err) {
      console.error("Failed to save attendance:", err);
      setResponse({ status: "Failed", message: err.response?.data?.message || "Save failed" });
    }
  };


  const fetchSummary = async () => {
    try {
      const res = await axios.get(
        `${URL}/men-activities/${selectedActivity._id}/attendance-summary`,
        { headers: { Authorization: token } }
      );
      setSummary(res.data);
    } catch (err) {
      console.error("Failed to fetch summary:", err);
    }
  };

  useEffect(() => {
    if (selectedActivity?._id) {
      fetchSummary();
    }
  }, [selectedActivity]);

  const handleCompleteActivity = async () => {
    if (!selectedActivity) return;
    try {
      let payload = {};

      if (selectedActivity.activityType === 'house-visit') {
        const updatedHouses = (selectedActivity.houses || []).map(h => ({
          ...h,
          offering: Number(houseOfferings[h._id || h.name] || 0)
        }));
        const total = updatedHouses.reduce((s, h) => s + (Number(h.offering) || 0), 0);
        payload.houses = updatedHouses;
        payload.totalOffering = total;
      } else {
        const total = Number(houseOfferings.single || 0);
        payload.totalOffering = total;
      }

      payload.status = 'Completed';

      await axios.put(`${URL}/men-activities/${selectedActivity._id}`, payload, {
        headers: { Authorization: token },
      });

      setResponse({ status: "Success", message: "Activity completed and offerings saved" });
      setIsCompleteModalOpen(false);
      setSelectedActivity(null);
      setHouseOfferings({});
      fetchActivities(CurrentPage); // refresh list & cards
    } catch (err) {
      setResponse({ status: "Failed", message: err.response?.data?.message || "Failed to complete activity" });
    }
  };


  const handleInactive = async (activity) => {
    if (!activity) return;
    try {
      await axios.put(
        `${URL}/men-activities/${activity._id}`,
        { status: "Cancelled" },
        { headers: { Authorization: token } }
      );

      setResponse({ status: "Success", message: "Activity marked as Cancelled" });
      fetchActivities(CurrentPage); // refresh table
    } catch (err) {
      setResponse({ status: "Failed", message: err.response?.data?.message || "Failed to cancel activity" });
    }
  };






  const safeAttendees = Array.isArray(attendees) ? attendees : [];

  const totalPresent = safeAttendees.filter(a => (a.status || "").toLowerCase() === "present").length;

  const nonMembersCount = safeAttendees.filter(a =>
    (typeof a.isMember === "boolean" && a.isMember === false) ||
    (typeof a.type === "string" && a.type.toLowerCase() === "non-member")
  ).length;

  const membersCount = safeAttendees.length - nonMembersCount;



 


  return (
    <>
      {/* Dashboard Cards */}
      <div className="container my-4">
        <div className="row g-4">
          {cardsData.map((card, index) => (
            <div key={index} className="col-12 col-sm-6 col-md-3">
              <div
                className="card"
                style={{
                  backgroundColor: "#ffffff",
                  border: "2px solid #E1E7EF",
                  height: "150px",
                  width: "250px",
                  borderRadius: "12px",
                }}
              >
                <div className="card-body d-flex flex-column justify-content-center text-center">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="card-title mb-0 !text-[#65758B]">{card.title}</h6>
                    <card.icon className="text-lavender--600 w-[20px] h-[20px]" />
                  </div>
                  <h4 className="fw-bold mb-2 text-left">{card.value}</h4>
                  <small className="text-left text-[12px] text-[#5C95E0]">{card.subtitle}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Add Activity */}
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex flex-col items-center justify-between lg:flex-row">
          <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">

            <label className="text-l font-medium text-gray-600 mb-1">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 
                 border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
            />

            <label className="text-l font-medium text-gray-600 mb-1">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 
                 border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
            />
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
                  placeholder="Search Members..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
              >
                <option value="All">All</option>
                <option value="Planned">Planned</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>


          <div className="flex w-full gap-x-4 lg:w-auto">
            <button className="flex items-center w-full gap-2 px-4 py-1.5 text-white bg-lavender--600 rounded-lg lg:w-auto" onClick={handleOpenModal}>
              <FaPlus /> Add New Activity
            </button>
          </div>
        </div>

        {/* Activities Table */}
        <div className="overflow-x-auto mt-8">
          <table className="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
            <thead className="text-base text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-400 text-center">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Date</th>
                <th className="p-2 text-center">Activity Type</th>
                <th className="p-2 text-center">Title / Member / Church</th>
                <th className="p-2 text-center">Leader / Host</th>
                <th className="p-2 text-center">Status</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {activities.length > 0 ? (
                activities.map((a, index) => (
                  <tr key={a._id} className="border-b">
                    <td className="p-2">{index + 1 + (CurrentPage - 1) * 10}</td>
                    <td className="p-2 text-center">
                      {new Date(a.date).toLocaleDateString("en-GB")}
                    </td>
                    <td className="p-2 text-left">{a.activityType}</td>
                    <td className="p-2 text-left">
                      {a.activityType === "house-visit"
                        ? a.houses.map((h) => h.name).join(", ")
                        : a.title || a.churchName || a.customTitle}
                    </td>
                    <td className="p-2 text-left">{a.leader?.name}</td>


                    <td className="p-2 text-center">
                      <span
                        className={`px-3 py-1 rounded-[15px] text-sm font-medium 
                        ${a.status === "Completed" ? "bg-green-100 text-green-700" : ""} 
                        ${a.status === "Cancelled" ? "bg-red-100 text-red-700" : ""} 
                        ${a.status === "Planned" ? "bg-[#F1F5F9] text-lavender--600" : ""}`}
                      >
                        {a.status}
                      </span>
                    </td>


                    <td className="p-2 text-center relative">
                      <button
                        type="button"
                        onClick={() => toggleDropdown(a._id)}
                        className="text-[20px]"
                      ><HiDotsHorizontal />
                      </button>
                      {openDropdown === a._id && (
                        <div
                          ref={dropdownRef}
                          className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-lg shadow-lg z-20"
                        >


                          <ul className="py-2 text-sm text-gray-700">
                            {a.status === "Cancelled" ? (
                              <li className="px-4 py-2 text-sm text-red-500">Cancelled</li>
                            ) : a.status === "Completed" ? (
                              <li className="px-4 py-2 text-sm text-gray-600">Completed</li>
                            ) : (
                              <>
                                <li>
                                  <button
                                    onClick={() => {
                                      setSelectedActivity(a);
                                      setIsCompleteModalOpen(true);
                                      setOpenDropdown(null); // close dropdown
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100"
                                  >
                                    <FiCheckCircle className="w-[18px] h-[18px] text-black" />
                                    <span>Mark as Completed</span>
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100"
                                    onClick={() => handleEditActivity(a)}
                                  >
                                    <CiEdit className="w-[20px] h-[20px] text-black" />
                                    <span>Edit Activity</span>
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className="flex items-center gap-2 w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100"
                                    onClick={() => handleInactive(a)}
                                  >
                                    <AiOutlineCloseCircle className="w-[18px] h-[18px]" />
                                    <span>Inactive</span>
                                  </button>
                                </li>
                              </>
                            )}
                          </ul>

                        </div>
                      )}

                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-4 text-gray-500">
                    No activities found
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

      {/* Modal for Adding Activity */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="New Activity">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            <div className="p-4 border rounded-lg bg-gray-50">
              <h5 className="mb-3">Activity Details</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">

                {/* Date */}
                <div>
                  <label className="block text-lg font-medium text-gray-700">Date</label>
                  <input type="date" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" {...register("date", { required: "Date is required" })} />
                </div>

                {/* Activity Type */}
                <div>
                  <label className="block text-lg font-medium text-gray-700">Activity Type</label>
                  <select className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-lavender--600 focus:border-lavender--600"
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}>
                    <option value="">Select Activity</option>
                    <option value="house-visit">House Visit</option>
                    <option value="weekly-prayer">Weekly Prayer</option>
                    <option value="church-prayer">Church Prayer</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {activityType === "weekly-prayer" && (
                  <div>
                    <label className="block text-lg font-medium text-gray-700">Title of Prayer</label>
                    <input
                      type="text"
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      {...register("title")}
                    />
                  </div>
                )}

                {activityType === "church-prayer" && (
                  <div>
                    <label className="block text-lg font-medium text-gray-700">Church Name</label>
                    <input
                      type="text"
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      {...register("churchName")}
                    />
                  </div>
                )}
                {activityType === "church-prayer" && (
                  <div>
                    <label className="block text-lg font-medium text-gray-700">Church Location</label>
                    <input
                      type="text"
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      {...register("churchLocation")}
                    />
                  </div>
                )}

                {activityType === "other" && (
                  <div>
                    <label className="block text-lg font-medium text-gray-700">Custom Title</label>
                    <input
                      type="text"
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                      {...register("customTitle")}
                    />
                  </div>
                )}

                {/* Leader/Host Search with Dropdown */}
                <div className="relative">
                  <label className="block text-lg font-medium text-gray-700">Leader / Host</label>
                  <input
                    type="text"
                    placeholder="Search by Name"
                    {...register("member_name", { required: "Member Name is required" })}
                    value={maleNameSearch}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMaleNameSearch(val);
                      debouncedSearchMaleByName(val);
                    }}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                  {maleDropdownByName.length > 0 && (
                    <ul className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-auto">
                      {maleDropdownByName.map((m) => (
                        <li
                          key={m.member_id}
                          className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            if (m.member_id === "none") return;
                            setMaleNameSearch(m.member_name);
                            setValue("member_name", m.member_name);
                            setMaleDropdownByName([]);
                          }}
                        >
                          {m.member_id === "none" ? m.member_name : `${m.member_name} - ${m.mobile_number || ""}`}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <div className="text-lg fw-medium text-gray-700">
                  {showTextarea && <label className="mb-0">Notes</label>}
                </div>

                <div className="form-check mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="showNotes"
                    checked={showTextarea}
                    onChange={() => setShowTextarea(!showTextarea)}
                  />
                  <label className="form-check-label" htmlFor="showNotes">
                    Add Notes
                  </label>
                </div>
              </div>

              {showTextarea && (
                <textarea
                  rows={4}
                  className="form-control mt-2 border-gray-300 rounded-md shadow-sm"
                  placeholder="Enter your notes here..."
                  {...register("notes")}
                />
              )}
            </div>
            {activityType === "house-visit" && (
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-700">Member Details</h3>

                  {/* Toggle */}
                  <div className="relative flex bg-gray-200 rounded-full p-1 text-sm font-medium w-56">
                    <div
                      className="absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300"
                      style={{ width: "calc(50% - 0.25rem)", transform: isMemberMember ? "translateX(0)" : "translateX(100%)" }}
                    />
                    <button
                      type="button"
                      onClick={() => setIsMemberMember(true)}
                      className={`relative flex-1 py-1 text-center rounded-full transition-colors duration-300 ${isMemberMember ? "text-white" : "text-gray-700"
                        }`}
                    >
                      Member
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMemberMember(false)}
                      className={`relative flex-1 py-1 text-center rounded-full transition-colors duration-300 ${!isMemberMember ? "text-white" : "text-gray-700"
                        }`}
                    >
                      Non-Member
                    </button>
                  </div>
                </div>

                {isMemberMember ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
                    {/* Member ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Member ID</label>
                      <input
                        type="text"
                        placeholder="Search by ID"
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                        value={MemberIdSearch}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMemberIdSearch(val);
                          debouncedSearchMemberById(val);
                        }}
                      />
                    </div>

                    {/* Member Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Member Name</label>
                      <input
                        type="text"
                        placeholder="Search by Name"
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                        value={MemberSearch}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMemberSearch(val);
                          debouncedSearchMember(val);
                        }}
                      />
                      {(MemberDropdownById.length > 0 || MemberDropdown.length > 0) && (
                        <ul className="absolute left-0 mt-1 w-[65%] bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[120px] overflow-y-auto">
                          {(MemberDropdownById.length > 0 ? MemberDropdownById : MemberDropdown).map((m) => (


                            <li
                              key={m.member_id}
                              className="flex px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 cursor-pointer transition"
                              onClick={() => {
                                setMemberIdSearch(m.member_id);
                                setMemberSearch(m.member_name);
                                setValue("MemberId", m.member_id);
                                setValue("MemberName", m.member_name);

                                // Set hidden address input
                                const fullAddress = Object.values(m.present_address || m.permanent_address || {})
                                  .filter(Boolean)
                                  .join(", ");
                                setSelectedMemberAddress(fullAddress);

                                // Clear dropdowns
                                setMemberDropdownById([]);
                                setMemberDropdown([]);
                              }}
                            >
                              <span className="w-[250px] font-medium">{m.member_id}</span>
                              <span className="flex-1">{m.member_name}</span>
                            </li>

                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <button className="flex items-center w-full gap-2 px-4 py-1.5 mt-[25px] text-white bg-lavender--600 rounded-lg lg:w-auto" type="button" onClick={handleAddMember}>
                        <FaPlus /> Add
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Member Name</label>
                      <input
                        type="text"
                        placeholder="Enter Member Name"
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                        {...register("nonMemberName", { required: "Member Name is required" })}
                      />
                      {errors.nonMemberName && <p className="text-sm text-red-500">{errors.nonMemberName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Member Address</label>
                      <input
                        type="text"
                        placeholder="Enter Member Address"
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                        {...register("nonMemberAddress", { required: "Member Address is required" })}
                      />
                      {errors.nonMemberAddress && <p className="text-sm text-red-500">{errors.nonMemberAddress.message}</p>}
                    </div>
                    <div>
                      <button className="flex items-center w-full gap-2 px-4 py-1.5 mt-[25px] text-white bg-lavender--600 rounded-lg lg:w-auto" type="button" onClick={handleAddMember}>
                        <FaPlus /> Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {addedMembers.length > 0 && (
              <div className="overflow-x-auto mt-8">
                <table className="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
                  <thead className="text-base text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-400 text-center">
                    <tr className="border-b">
                      <th className="p-2 text-center">S.No</th>
                      <th className="p-2 text-center">Member Name</th>
                      <th className="p-2 text-center">Member ID</th>
                      <th className="p-2 text-center">Address</th>
                      <th className="p-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="p-2 text-center">
                    {addedMembers.map((m, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 text-center">{index + 1}</td>
                        <td className="p-2 text-left">
                          {m.name} {m.isMember ? "(member)" : "(non-member)"}
                        </td>
                        <td className="p-2 text-center">{m.isMember ? m.id : "-"}</td>
                        <td className="p-2 text-left">{m.address || "-"}</td>
                        <td className="p-2 flex justify-center items-center">
                          <IoCloseCircleOutline
                            className="w-[20px] h-[20px] text-[#DB7B7B]"
                            onClick={() => handleRemoveMember(index)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}


            <div className="flex justify-end gap-3 mt-6">
              <button type="submit" className="px-4 py-2 bg-lavender--600 text-white rounded-md">
                Save
              </button>
            </div>
          </div>
        </form>



      </Modal>


      {/* Modal to mark completed activity */}
      <Modal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        title="Mark Activity Completed"
      >
        {selectedActivity ? (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            <div className="p-3 border rounded-lg bg-gray-50">
              <h5 className="mb-2">Activity Details</h5>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-1">
                {/* Column 1 → span 4 */}
                <div className="space-y-4 md:col-span-4">
                  <div>
                    <h6 className="font-semibold text-gray-700">Date</h6>
                    <p>{new Date(selectedActivity.date).toLocaleDateString("en-GB")}</p>
                  </div>
                  <div>
                    <h6 className="font-semibold text-gray-700">Activity Title</h6>
                    <p>
                      {selectedActivity.activityType === "house-visit"
                        ? selectedActivity.houses.map(h => h.name).join(", ")
                        : selectedActivity.title || selectedActivity.churchName || selectedActivity.customTitle
                      }
                    </p>
                  </div>
                  <div>
                    <h6 className="font-semibold text-gray-700">Leader / Host</h6>
                    <p>{selectedActivity.leader?.name}</p>
                  </div>
                </div>

                {/* Column 2 → span 3 */}
                <div className="space-y-4 md:col-span-3">
                  <div>
                    <h6 className="font-semibold text-gray-700">Activity Type</h6>
                    <p>{selectedActivity.activityType}</p>
                  </div>
                </div>

                {/* Column 3 → span 5 */}
                <div className="space-y-4 md:col-span-5">
                  {/* Card 1 */}
                  <div className="p-2 bg-[#F8FAFC] rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="text-lavender--600 text-2xl">
                        <MdHome />
                      </div>
                      <div>
                        <h6 className="font-semibold text-gray-800">Total Offering</h6>
                        <p className="text-lg font-bold text-lavender--600">
                          ₹{new Intl.NumberFormat('en-IN').format(computeTotalOfferingForSelected())}
                        </p>

                      </div>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="p-3 bg-[#F0FDF4] rounded-xl border border-green-200 shadow-sm flex items-center gap-4">
                    <div className="text-[#21C45D] text-3xl flex-shrink-0">
                      <FiUsers />
                    </div>

                    <div className="flex flex-col justify-center">
                      <h6 className="font-semibold text-gray-800">Attendance</h6>
                      <span className="font-bold text-lg text-[#21C45D] mt-1">
                        {summary.membersPresent} / {summary.totalMembers} Members
                      </span>

                      <button
                        className={`mt-2 px-3 py-1 text-white text-sm rounded-md flex items-center gap-1 
                        ${summary.membersPresent > 0 ? "bg-gray-400 cursor-not-allowed" : "bg-[#21C45D] hover:bg-green-600"}`}
                        onClick={() => setIsAttendanceModalOpen(true)}
                        disabled={summary.membersPresent > 0}
                      >
                        <IoMdCheckmarkCircleOutline className="w-[20px] h-[20px]" /> Mark Attendance
                      </button>
                    </div>
                  </div>


                </div>
              </div>

            </div>

            {selectedActivity && (
              <div className="p-3 border rounded-lg bg-gray-50">
                {selectedActivity.activityType === "house-visit" ? (
                  <>
                    <h6 className="font-semibold mb-2">House Members & Offering</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedActivity.houses.map((h) => (
                        <div key={h._id || h.name} className="flex flex-col">
                          <label className="text-gray-700 font-medium mb-1">{h.name}</label>
                          <input
                            type="number"
                            placeholder="Enter Offering Amount"
                            className="border border-gray-300 rounded-md p-2 shadow-sm"
                            value={houseOfferings[h._id || h.name]}
                            onChange={(e) =>
                              setHouseOfferings(prev => ({
                                ...prev,
                                [h._id || h.name]: e.target.value
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <h6 className="font-semibold mb-2">Offering Amount</h6>
                    <input
                      type="number"
                      placeholder="Enter Offering Amount"
                      className="border border-gray-300 rounded-md p-2 shadow-sm w-full md:w-1/2"
                      value={houseOfferings["single"] || ""}
                      onChange={(e) =>
                        setHouseOfferings({ single: e.target.value })
                      }
                    />
                  </>
                )}
              </div>
            )}


            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <div className="text-lg fw-medium text-gray-700">
                  {showAttendanceTextarea && <label className="mb-0">Notes</label>}
                </div>

                <div className="form-check mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="showNotes"
                    checked={showAttendanceTextarea}
                    onChange={() => setAttendanceShowTextarea(!showAttendanceTextarea)}
                  />
                  <label className="form-check-label" htmlFor="showNotes">
                    Add Notes
                  </label>
                </div>
              </div>

              {showAttendanceTextarea && (
                <textarea
                  rows={4}
                  className="form-control mt-2 border-gray-300 rounded-md shadow-sm"
                  placeholder="Enter your notes here..."
                  {...register("attendancenotes")}
                />
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button type="submit" onClick={handleCompleteActivity} className="px-4 py-2 bg-lavender--600 text-white rounded-md">
                Complete Activity
              </button>
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}

      </Modal>



      {/* Attendance Modal */}
      <Modal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        title="Mark Attendance"
      >
        {/* Search Attendees */}
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 relative">
          <div className="relative">
            <IoIosSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 mt-1 border border-[#E5E7EB] rounded-md bg-[#FBFAFF] 
               focus:border-lavender-600 focus:ring-lavender-600"
              placeholder="Search Attendees"
              value={attendanceSearch}
              onChange={(e) => setAttendanceSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 items-center mt-3">
          <button
            className="w-[150px] h-[40px] flex items-center justify-center gap-2 bg-[#FBFAFF] border border-[#E5E7EB] rounded-md"
            onClick={markAllPresent}
          >
            <IoCheckmark className="text-gray-600" />
            <span>All Present</span>
          </button>

          <button
            className="w-[150px] h-[40px] flex items-center justify-center gap-2 bg-[#FBFAFF] border border-[#E5E7EB] rounded-md"
            onClick={markAllAbsent}
          >
            <IoMdClose className="text-gray-600" />
            <span>All Absent</span>
          </button>

          <button
            className="w-[150px] h-[40px] flex items-center justify-center gap-2 bg-[#FBFAFF] border border-[#E5E7EB] rounded-md"
            onClick={() => setShowAddNonMember(true)}
          >
            <IoPersonAddOutline className="text-gray-600" />
            <span>Add Person</span>
          </button>
        </div>

        {/* Non-Member Input */}
        {showAddNonMember && (
          <div className="flex gap-4 mt-3">
            <input
              type="text"
              className="flex-1 pr-3 py-2 border border-[#E5E7EB] rounded-md bg-[#FBFAFF] focus:border-lavender-600 focus:ring-lavender-600"
              placeholder="Enter Name"
              value={nonMemberName}
              onChange={(e) => setNonMemberName(e.target.value)}
            />
            <button
              className="w-1/5 px-4 py-2 bg-lavender--600 text-white rounded-md"
              onClick={handleAddNonMember}
            >
              Add
            </button>
          </div>
        )}

        {/* Attendees List */}
        <div className="max-h-72 overflow-y-auto border rounded-md">
          {attendees
            .filter((a) =>
              a.name.toLowerCase().includes(attendanceSearch.toLowerCase())
            )
            .map((a, idx) => (
              <div
                key={a.id}
                className="flex justify-between items-center border-b px-3 py-2"
              >
                <span>
                  {a.name} {a.isMember ? "(member)" : "(non-member)"}
                </span>
                <div className="flex gap-2">
                  <IoIosCheckmarkCircleOutline
                    className={`w-7 h-7 cursor-pointer rounded-full ${a.status === "present"
                      ? "bg-green-500 text-white"
                      : " text-gray-600"
                      }`}
                    onClick={() =>
                      setAttendees((prev) =>
                        prev.map((p, i) =>
                          i === idx ? { ...p, status: "present" } : p
                        )
                      )
                    }
                  />

                  <AiOutlineCloseCircle
                    className={`w-7 h-7 cursor-pointer rounded-full ${a.status === "absent"
                      ? "bg-red-500 text-white"
                      : " text-gray-600"
                      }`}
                    onClick={() =>
                      setAttendees((prev) =>
                        prev.map((p, i) =>
                          i === idx ? { ...p, status: "absent" } : p
                        )
                      )
                    }
                  />
                </div>

              </div>
            ))}
        </div>

        {/* Attendance Summary */}
        <div className="flex justify-between items-center mt-6 bg-[#FBFAFF] p-4 rounded-md border border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <FiUsers className="text-blue-500 w-5 h-5" />
            <div>
              <div className="font-medium text-gray-800">Total Present</div>
              <div className="text-blue-600 font-bold text-xl">{totalPresent}</div>
            </div>
          </div>

          <div className="text-gray-700 font-medium">
            Members/Guests{" "}
            <span className="ml-2 font-bold">
              {membersCount} / {nonMembersCount}
            </span>
          </div>
        </div>




        {/* Save Attendance */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 bg-lavender--600 text-white rounded-md"
            onClick={saveAttendance}
          >
            Save Attendance
          </button>
        </div>
      </Modal>



      {/* Toast Messages */}
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
