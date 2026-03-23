import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { URL } from "../../App";
import { FaEye, FaTrash } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import Pagination from "../../Components/Helpers/Pagination";

export const SundayEventSclTeach = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);

  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");
  const token = window.sessionStorage.getItem("token");
  const [Response, setResponse] = useState({ status: null, message: "" });

  // Modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedClassEvent, setSelectedClassEvent] = useState(null);
  const [competitionOptions, setCompetitionOptions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [participantBlocks, setParticipantBlocks] = useState([]);
  const [students, setStudents] = useState([]);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Fetch Sunday School events by teacher


  const fetchEvents = async () => {
    try {
      const teacherId = encodeURIComponent(
        JSON.parse(atob(token.split(".")[1])).member_id
      );
      const res = await axios.get(`${URL}/sundayschool-events/teacher?teacherId=${teacherId}`, {
        headers: { Authorization: token },
        params: {
          search,
          startDate,
          endDate,
          page: CurrentPage,
          limit: rowsPerPage,
        },
      });

      if (res.data.success) {
        setEvents(res.data.events || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching teacher events:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [search, startDate, endDate, CurrentPage, rowsPerPage]);



  // Fetch students under teacher
  useEffect(() => {
    const fetchStudents = async () => {
      try {

        const teacherId = encodeURIComponent(
          JSON.parse(atob(token.split(".")[1])).member_id
        );
        const res = await axios.get(`${URL}/sunday-classes/teacher/students?teacherId=${teacherId}`, {
          headers: { Authorization: token },
        });
        setStudents(res.data.students || []);
      } catch (err) {
        console.error("Error fetching teacher students:", err);
      }
    };
    fetchStudents();
  }, [token]);

  // const handleViewClick = (event) => {
  //   setSelectedEvent(event);
  //   setIsViewModalOpen(true);
  // };



  const handleViewClick = (event) => {
    navigate(`/admin/sundayschoolevent/view/${event._id}`);
  };

  const enrollTeacher = async () => {
    try {
      if (!selectedEvent || selectedTeachers.length === 0) {
        setResponse({ status: "Failed", message: "Please select an event and competitions." });
        return;
      }

      const teacherId = JSON.parse(atob(token.split(".")[1])).member_id;
      const teacherRes = await axios.get(`${URL}/sunday-classes/teachers/details`, {
        headers: { Authorization: token },
      });

      const teacher = teacherRes.data.teachers.find(t => t.teacher_id === teacherId);
      if (!teacher) {
        setResponse({ status: "Failed", message: "Teacher details not found." });
        return;
      }

      const payload = {
        eventId: selectedEvent._id,
        teachers: selectedTeachers.map(comp => ({
          competition: comp,
          teacherId: teacher.teacher_id,
          teacherName: teacher.teacher_name,
          className: teacher.class_name,
        })),
      };

      await axios.post(`${URL}/sundayschool-events/add-teachers`, payload, {
        headers: { Authorization: token },
      });

      await fetchEvents();

      setResponse({ status: "Success", message: "Enrolled successfully!" });
      setIsConfirmModalOpen(false);

    } catch (err) {
      console.error("Enrollment error:", err);
      setResponse({ status: "Failed", message: err.response?.data?.message || "Enrollment failed" });
    }
  };


  const canEditEvent = (registerBefore) => {
    if (!registerBefore) return false;

    const now = moment();
    const lastMoment = moment(registerBefore).endOf("day");

    return now.isSameOrBefore(lastMoment);
  };

  return (
    <>
      {/* Event Table */}
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold">Sunday School Events</h1>

          {/* Search */}
          <div className="">
            <input
              type="search"
              placeholder="Search"
              value={search}
              // onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="block py-1 text-sm text-gray-900 rounded w-54 px-3 bg-gray-50 border border-gray-300"
            />
          </div>

          {/* Date Filters */}
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


          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Event Name</th>
                <th className="p-2 text-center">Event By</th>
                <th className="p-2 text-center">Register Before</th>
                <th className="p-2 text-center">Event Date</th>
                <th className="p-2 text-center">Venue</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="text-center">
              {events.length ? events.map((ev, idx) => (
                <tr key={ev._id} className="border-b ">
                  <td className="p-2">
                    {(CurrentPage - 1) * rowsPerPage + (idx + 1)}
                  </td>
                  <td className="p-2">{ev.eventName}</td>
                  <td className="p-2">{ev.eventBy?.name || "-"}</td>
                  <td className="p-2">{ev.registerBefore ? moment(ev.registerBefore).format("DD-MM-YYYY") : "-"}</td>
                  <td className="p-2">{ev.eventDate ? moment(ev.eventDate).format("DD-MM-YYYY") : "-"}</td>
                  <td className="p-2">{ev.venue}</td>
                  <td className="p-2">
                    <div className="flex items-center justify-center gap-3">
                      <FaEye
                        size={18}
                        className="text-lavender--600 cursor-pointer"
                        title="View Event"
                        onClick={() => handleViewClick(ev)}
                      />

                      {/* {canEditEvent(ev.registerBefore) && (
                        <CiEdit
                          size={18}
                          className="text-lavender--600 cursor-pointer"
                          title="Edit Event"
                          onClick={() => {
                            setSelectedEvent(ev);
                            const firstClass = (ev.classEvents || [])[0];
                            setSelectedClassEvent(firstClass);
                            setCompetitionOptions(firstClass?.competitions || []);
                            setSelectedCompetition(null);
                            setIsAddModalOpen(true);
                          }}
                        />
                      )} */}

                      {canEditEvent(ev.registerBefore) && (
                        <CiEdit
                          size={18}
                          className="text-lavender--600 cursor-pointer"
                          title="Edit Event"
                          onClick={() =>
                            navigate(`/admin/sundayschoolevent/edit/${ev._id}`)
                          }
                        />
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="p-3 text-center text-gray-500">
                    No events found.
                  </td>
                </tr>
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

      {/* Response Message */}
      {Response.status && (Response.status === "Success"
        ? <SuccessMessage Message={Response.message} />
        : <FailedMessage Message={Response.message} />)}

      {/* Modals */}
      {/* ... replicate Add Participants Modal, Teacher Modal, Confirm Modal exactly like EndeavourEvent.jsx */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="View Event Details">
        {selectedEvent ? (
          <div className="text-sm text-gray-700 space-y-3 max-h-[600px] overflow-y-auto">

            {/* Basic Event Info */}
            {[
              { label: "Event By", value: selectedEvent.eventBy?.name },
              { label: "Event Name", value: selectedEvent.eventName },
              { label: "Event Date", value: selectedEvent.eventDate ? moment(selectedEvent.eventDate).format("DD-MM-YYYY") : "-" },
              { label: "Register Before", value: selectedEvent.registerBefore ? moment(selectedEvent.registerBefore).format("DD-MM-YYYY") : "-" },
              { label: "Venue", value: selectedEvent.venue },
              { label: "Description", value: selectedEvent.description },
              {
                label: "Teacher Competitions",
                value: selectedEvent.teacherCompetitions?.length ? selectedEvent.teacherCompetitions.join(", ") : "None",
                hasButton: true
              },
            ].map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 py-2">
                <div className="col-span-12 sm:col-span-4 font-semibold">{item.label}</div>
                <div className="col-span-12 sm:col-span-8">{item.value || "-"}</div>
                {item.hasButton && (
                  <div className="col-span-12 sm:col-span-1 flex justify-end">
                    {selectedEvent?.teacherCompEvents?.some(
                      tce =>
                        tce.participants?.some(
                          p => String(p.member_id) === String(JSON.parse(atob(token.split(".")[1])).member_id)
                        )
                    ) ? (
                      <button
                        className="px-2 py-1 text-sm bg-lavender--600 text-white rounded"
                        disabled
                      >
                        Enrolled
                      </button>
                    ) : (
                      <button
                        className="px-2 py-1 text-sm bg-lavender--600 text-white rounded hover:bg-lavender--700"
                        onClick={() => setIsTeacherModalOpen(true)}
                      >
                        Add
                      </button>
                    )}
                  </div>
                )}


              </div>
            ))}

            <h3 className="font-semibold text-base">Class Events:</h3>

            {(selectedEvent?.classEvents || []).map((cls) => (
              <div key={cls._id} className="mt-2 border p-2 rounded">
                <p className="font-medium">{cls.className}</p>

                {(cls?.competitions || []).map((comp) => (
                  <div key={comp._id} className="mt-1 p-2 border rounded bg-gray-50">
                    <p className="font-semibold">{comp.competition} — <em>{comp.title}</em></p>

                    {comp.participants && comp.participants.length > 0 ? (
                      <ul className="mt-1 text-gray-700">
                        {comp.participants.map((p, idx) => (
                          <li key={idx}>
                            {p.member_name}
                            {p.prize && p.prize !== "None" && p.prize.trim() !== "" && (
                              <> — {p.prize} Prize</>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="ml-5 text-gray-400 italic">No participants added yet.</p>
                    )}
                  </div>
                ))}

              </div>
            ))}

          </div>
        ) : (
          <p className="text-center text-gray-500">Loading...</p>
        )}
      </Modal>



      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          // reset modal selections
          setClassOptions([]);
          setSelectedClassEvent(null);
          setCompetitionOptions([]);
          setSelectedCompetition(null);
          setParticipantBlocks([]);
        }}
        title="Add Competition Participants"
      >
        <div className="space-y-4 max-h-[600px] overflow-y-auto">

          {/* Competition Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Competition</label>
              <select
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                value={selectedCompetition?._id || ""}
                onChange={(e) => {
                  const comp = (competitionOptions || []).find(c => c._id === e.target.value) || null;
                  setSelectedCompetition(comp);
                }}
                disabled={!competitionOptions || competitionOptions.length === 0}
              >
                <option value="">Select Competition</option>
                {(competitionOptions || []).map((comp) => (
                  <option key={comp._id} value={comp._id}>{comp.competition}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                readOnly
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                value={selectedCompetition?.title || ""}
              />
            </div>
          </div>

          {/* Add Participants Button */}
          <div className="flex justify-end mt-3">

            <button
              onClick={() => {
                if (!selectedCompetition) return;

                // prevent duplicate competition blocks
                const exists = participantBlocks.find(
                  (b) => b.competitionId === selectedCompetition._id
                );
                if (exists) return;

                // Preselect students who are already participants for this competition.
                // We use `member_id` to match the event's participant snapshot to teacher's student record.
                const preselected = (students || []).filter((stu) =>
                  (selectedCompetition.participants || []).some(
                    (p) => String(p.member_id) === String(stu.member_id)
                  )
                );

                setParticipantBlocks((prev) => [
                  ...prev,
                  {
                    competitionId: selectedCompetition._id,
                    title: selectedCompetition.title,
                    students: preselected, // <-- pre-fill with matching student objects
                  },
                ]);

                setSelectedCompetition(null);
              }}
              className="px-5 py-2 bg-lavender--600 text-white rounded-lg hover:bg-lavender--700"
            >
              Add Participants
            </button>

          </div>

          {/* Participant Blocks */}
          <div className="space-y-4">
            {participantBlocks.map((block, blockIndex) => {
              // Filter students for the selected class
              // inside participantBlocks.map((block, blockIndex) => { ... })
              const classStudents = (students || []).filter((s) => {
                // build student's class label the same way AddEndeavourEvent does:
                const studentClassLabel = s.class_name + (s.section_name ? ` - ${s.section_name}` : "");
                const selectedLabel = selectedClassEvent?.className || selectedClassEvent?.class_name || "";
                return studentClassLabel === selectedLabel;
              });


              return (
                <div key={blockIndex} className="border p-4 rounded-lg bg-gray-50 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{block.title}</h3>
                    <button
                      onClick={() =>
                        setParticipantBlocks(prev => prev.filter((_, i) => i !== blockIndex))
                      }
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  {/* Student Checkboxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {classStudents.map(student => (
                      <label key={student._id} className="flex items-center space-x-2">

                        <input
                          type="checkbox"
                          checked={block.students.some((s) => String(s.member_id) === String(student.member_id))}
                          onChange={(e) => {
                            setParticipantBlocks((prev) => {
                              const updated = [...prev];
                              const blk = updated[blockIndex];
                              if (e.target.checked) {
                                // avoid duplicates
                                if (!blk.students.some((x) => String(x.member_id) === String(student.member_id))) {
                                  blk.students.push(student);
                                }
                              } else {
                                blk.students = blk.students.filter(
                                  (s) => String(s.member_id) !== String(student.member_id)
                                );
                              }
                              return updated;
                            });
                          }}
                        />

                        <span>{student.member_name}</span>
                      </label>
                    ))}

                  </div>
                </div>
              );
            })}

          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-4">

            <button
              onClick={async () => {
                try {
                  if (!selectedEvent || !selectedClassEvent) {
                    console.error("Missing required selections:", { selectedEvent, selectedClassEvent });
                    setResponse({ status: "Failed", message: "Please select a class and competition before saving." });
                    return;
                  }

                  const payload = {
                    eventId: selectedEvent._id,
                    className: selectedClassEvent.className,
                    participants: participantBlocks.map(block => ({
                      competitionId: block.competitionId,
                      students: block.students.map(s => ({
                        member_id: s.member_id,
                        member_name: s.member_name,
                        class_name: s.class_name,
                        section_name: s.section_name,
                      })),
                    })),
                  };

                  console.log("Saving participants payload:", payload);

                  await axios.post(`${URL}/sundayschool-events/add-participants`, payload, {
                    headers: { Authorization: token },
                  });

                  setParticipantBlocks([]);
                  setIsAddModalOpen(false);

                  await fetchEvents();
                  setResponse({ status: "Success", message: "Participants saved successfully!" });
                } catch (err) {
                  console.error("Save participants error:", err);
                  setResponse({
                    status: "Failed",
                    message: err.response?.data?.message || "Failed to save participants",
                  });
                }
              }}

              className="px-6 py-2 bg-lavender--600 text-white rounded-lg hover:bg-lavender--700"
            >
              Save Participants
            </button>

          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        title="Select Teacher Competitions"
      >
        <div className="space-y-2">
          {selectedEvent?.teacherCompetitions?.map((comp, idx) => (
            <div key={idx} className="flex items-center">
              <input
                type="checkbox"
                id={`teacher-${idx}`}
                value={comp}
                checked={selectedTeachers.includes(comp)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setSelectedTeachers((prev) =>
                    checked ? [...prev, comp] : prev.filter((c) => c !== comp)
                  );
                }}
                className="mr-2"
              />
              <label htmlFor={`teacher-${idx}`}>{comp}</label>
            </div>
          ))}

        </div>

        <div className="flex justify-end mt-4 space-x-2">
          <button
            className="px-3 py-1 bg-gray-300 rounded"
            onClick={() => setIsTeacherModalOpen(false)}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 bg-lavender--600 text-white rounded"
            onClick={() => {
              setIsTeacherModalOpen(false);
              setIsConfirmModalOpen(true); // Open confirm modal
            }}
          >
            Save
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Enrollment"
      >
        <p>Do you want to enroll yourself in the selected teacher competitions?</p>

        <div className="flex justify-end mt-4 space-x-2">
          <button
            className="px-3 py-1 bg-gray-300 rounded"
            onClick={() => setIsConfirmModalOpen(false)}
          >
            No
          </button>
          <button
            className="px-3 py-1 bg-lavender--600 text-white rounded"
            onClick={enrollTeacher}
          >
            Yes
          </button>

        </div>
      </Modal>
    </>
  );
};





// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import moment from "moment";
// import { URL } from "../../App";
// import { FaEye } from "react-icons/fa";
// import { CiEdit } from "react-icons/ci";
// import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
// import Pagination from "../../Components/Helpers/Pagination";

// export const SundayEventSclTeach = () => {
//   const navigate = useNavigate();

//   const [events, setEvents] = useState([]);
//   const [search, setSearch] = useState("");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");

//   const [CurrentPage, setCurrentPage] = useState(1);
//   const [TotalPages, setTotalPages] = useState(1);

//   const [rowsPerPage, setRowsPerPage] = useState(25);
//   const [rowsInput, setRowsInput] = useState("");
//   const [jumpInput, setJumpInput] = useState("");

//   const token = window.sessionStorage.getItem("token");

//   const [Response, setResponse] = useState({ status: null, message: "" });

//   const fetchEvents = async () => {
//     try {
//       const teacherId = encodeURIComponent(
//         JSON.parse(atob(token.split(".")[1])).member_id
//       );

//       const res = await axios.get(
//         `${URL}/sundayschool-events/teacher/${teacherId}`,
//         {
//           headers: { Authorization: token },
//           params: {
//             search,
//             startDate,
//             endDate,
//             page: CurrentPage,
//             limit: rowsPerPage,
//           },
//         }
//       );

//       if (res.data.success) {
//         setEvents(res.data.events || []);
//         setTotalPages(res.data.totalPages || 1);
//       }
//     } catch (err) {
//       console.error("Error fetching teacher events:", err);
//     }
//   };

//   useEffect(() => {
//     fetchEvents();
//   }, [search, startDate, endDate, CurrentPage, rowsPerPage]);

//   const handleViewClick = (event) => {
//     navigate(`/admin/sundayschoolevent/view/${event._id}`);
//   };

//   const handleEditClick = (event) => {
//     navigate(`/admin/sundayschoolevent/edit/${event._id}`);
//   };

//   const canEditEvent = (registerBefore) => {
//     if (!registerBefore) return false;

//     const now = moment();
//     const lastMoment = moment(registerBefore).endOf("day");

//     return now.isSameOrBefore(lastMoment);
//   };

//   return (
//     <>
//       <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">

//         <div className="flex items-center justify-between p-4">

//           <h1 className="text-lg font-semibold">
//             Sunday School Events
//           </h1>

//           <input
//             type="search"
//             placeholder="Search"
//             value={search}
//             onChange={(e) => {
//               setSearch(e.target.value);
//               setCurrentPage(1);
//             }}
//             className="block py-1 text-sm text-gray-900 rounded w-54 px-3 bg-gray-50 border border-gray-300"
//           />

//           <div className="flex items-center space-x-3">

//             <input
//               type="date"
//               value={startDate}
//               onChange={(e) => setStartDate(e.target.value)}
//               className="border px-2 py-1 rounded"
//             />

//             <input
//               type="date"
//               value={endDate}
//               onChange={(e) => setEndDate(e.target.value)}
//               className="border px-2 py-1 rounded"
//             />

//           </div>
//         </div>

//         <div className="overflow-x-auto mt-4">

//           <table className="w-full text-sm text-gray-500">

//             <thead className="text-base text-gray-700 border-b">

//               <tr>
//                 <th className="p-2 text-center">Sl No.</th>
//                 <th className="p-2 text-center">Event Name</th>
//                 <th className="p-2 text-center">Event By</th>
//                 <th className="p-2 text-center">Register Before</th>
//                 <th className="p-2 text-center">Event Date</th>
//                 <th className="p-2 text-center">Venue</th>
//                 <th className="p-2 text-center">Action</th>
//               </tr>

//             </thead>

//             <tbody className="text-center">

//               {events.length ? (
//                 events.map((ev, idx) => (
//                   <tr key={ev._id} className="border-b">

//                     <td className="p-2">
//                       {(CurrentPage - 1) * rowsPerPage + (idx + 1)}
//                     </td>

//                     <td className="p-2">{ev.eventName}</td>

//                     <td className="p-2">{ev.eventBy?.name || "-"}</td>

//                     <td className="p-2">
//                       {ev.registerBefore
//                         ? moment(ev.registerBefore).format("DD-MM-YYYY")
//                         : "-"}
//                     </td>

//                     <td className="p-2">
//                       {ev.eventDate
//                         ? moment(ev.eventDate).format("DD-MM-YYYY")
//                         : "-"}
//                     </td>

//                     <td className="p-2">{ev.venue}</td>

//                     <td className="p-2">

//                       <div className="flex items-center justify-center gap-3">

//                         <FaEye
//                           size={18}
//                           className="text-lavender--600 cursor-pointer"
//                           onClick={() => handleViewClick(ev)}
//                         />

//                         {canEditEvent(ev.registerBefore) && (
//                           <CiEdit
//                             size={18}
//                             className="text-lavender--600 cursor-pointer"
//                             onClick={() => handleEditClick(ev)}
//                           />
//                         )}

//                       </div>

//                     </td>

//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={7} className="p-3 text-center text-gray-500">
//                     No events found.
//                   </td>
//                 </tr>
//               )}

//             </tbody>
//           </table>
//         </div>

//         <Pagination
//           currentPage={CurrentPage}
//           totalPages={TotalPages}
//           rowsPerPage={rowsPerPage}
//           rowsInput={rowsInput}
//           jumpInput={jumpInput}
//           setCurrentPage={setCurrentPage}
//           setRowsPerPage={setRowsPerPage}
//           setRowsInput={setRowsInput}
//           setJumpInput={setJumpInput}
//           defaultRows={25}
//         />
//       </div>

//       {Response.status &&
//         (Response.status === "Success" ? (
//           <SuccessMessage Message={Response.message} />
//         ) : (
//           <FailedMessage Message={Response.message} />
//         ))}
//     </>
//   );
// };