import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { URL } from "../../App";
import { FaEye, FaPlus, FaTrash } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";

export const EndeavourSclExamTeach = () => {
  // list + filters + pagination
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const token = window.sessionStorage.getItem("token");
  const teacherId = JSON.parse(atob(token.split(".")[1])).member_id;

  const [Response, setResponse] = useState({ status: null, message: "" });

  // modals + local selections
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);
  const [marksData, setMarksData] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedClassExam, setSelectedClassExam] = useState(null);
  const [students, setStudents] = useState([]);
  const [participantSelections, setParticipantSelections] = useState([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // fetch Endeavour exams assigned to teacher
  const fetchExams = async () => {
    try {
      const res = await axios.get(`${URL}/endeavour-exams/teacher/${teacherId}`, {
        headers: { Authorization: token },
        params: { search, startDate, endDate, page: currentPage, limit },
      });
      setExams(res.data.exams || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching teacher exams:", err);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [search, startDate, endDate, currentPage, token]);

  // fetch students under this teacher
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get(`${URL}/endeavour-classes/teacher/${teacherId}/students`, {
          headers: { Authorization: token },
        });
        setStudents(res.data.students || []);
      } catch (err) {
        console.error("Error fetching teacher students:", err);
      }
    };
    if (token) fetchStudents();
  }, [token]);

  // --- Handlers ---
  const handleViewClick = (exam) => {
    setSelectedExam(exam);
    setIsViewModalOpen(true);
  };

  const handleOpenAddParticipants = (exam) => {
    setSelectedExam(exam);

    const classWithNoMarks = exam.classExams.find(cls =>
      !cls.participants || cls.participants.every(p => p.marks == null)
    );
    setSelectedClassExam(classWithNoMarks || null);

    if (classWithNoMarks && classWithNoMarks.participants?.length > 0) {
      const existingIds = classWithNoMarks.participants.map(p => p.member_id);
      setParticipantSelections(existingIds);
    } else {
      setParticipantSelections([]);
    }

    setIsAddModalOpen(true);
  };

  const handleClassSelectionChange = (className) => {
    setSelectedClassExam((prev) => {
      const ce = (selectedExam?.classExams || []).find((c) => c.className === className) || { className, portion: "" };
      return ce;
    });

    const existing = (selectedExam?.participants || []).find((p) => p.className === className);
    setParticipantSelections(existing ? (existing.students || []).map((s) => s.member_id) : []);
  };

  const toggleStudentSelection = (member_id) => {
    setParticipantSelections((prev) =>
      prev.includes(member_id) ? prev.filter((m) => m !== member_id) : [...prev, member_id]
    );
  };

  const saveParticipants = async () => {
    try {
      if (!selectedExam || !selectedClassExam) {
        setResponse({ status: "Failed", message: "Please select an exam and class." });
        return;
      }

      const selectedStudentObjects = (students || []).filter((s) => participantSelections.includes(s.member_id))
        .map((s) => ({
          member_id: s.member_id,
          member_name: s.member_name,
          class_name: s.class_name,
          section_name: s.section_name,
        }));

      const payload = {
        examId: selectedExam._id,
        className: selectedClassExam.className,
        participants: selectedStudentObjects,
      };

      await axios.post(`${URL}/endeavour-exams/add-participants`, payload, {
        headers: { Authorization: token },
      });

      await fetchExams();

      setExams((prev) =>
        prev.map((ex) => {
          if (String(ex._id) !== String(selectedExam._id)) return ex;
          const others = (ex.participants || []).filter((p) => p.className !== selectedClassExam.className);
          const newParticipantsEntry = {
            className: selectedClassExam.className,
            students: selectedStudentObjects,
          };
          return { ...ex, participants: [...others, newParticipantsEntry] };
        })
      );

      setIsAddModalOpen(false);
      setParticipantSelections([]);
      setResponse({ status: "Success", message: "Participants saved successfully!" });
    } catch (err) {
      console.error("Save participants error:", err);
      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Failed to save participants",
      });
    }
  };

  // const enrollTeacher = async () => {
  //   try {
  //     if (!selectedExam) {
  //       setResponse({ status: "Failed", message: "Please select an exam to enroll." });
  //       return;
  //     }

  //     const teacherRes = await axios.get(`${URL}/endeavour-classes/teachers/details`, {
  //       headers: { Authorization: token },
  //     });
  //     const teacher = teacherRes.data.teachers?.find((t) => t.teacher_id === teacherId);

  //     if (!teacher) {
  //       setResponse({ status: "Failed", message: "Teacher details not found." });
  //       return;
  //     }

  //     const payload = {
  //       examId: selectedExam._id,
  //       teacher: {
  //         teacherId: teacher.teacher_id,
  //         teacherName: teacher.teacher_name,
  //         className: teacher.class_name,
  //       },
  //     };

  //     await axios.post(`${URL}/endeavour-exams/add-teachers`, payload, {
  //       headers: { Authorization: token },
  //     });

  //     setResponse({ status: "Success", message: "Enrolled successfully!" });
  //     setIsConfirmModalOpen(false);
  //   } catch (err) {
  //     console.error("Enrollment error:", err);
  //     setResponse({ status: "Failed", message: err.response?.data?.message || "Enrollment failed" });
  //   }
  // };



  const enrollTeacher = async () => {
  try {
    if (!selectedExam) {
      setResponse({ status: "Failed", message: "Please select an exam to enroll." });
      return;
    }

    const teacherRes = await axios.get(`${URL}/endeavour-classes/teachers/details`, {
      headers: { Authorization: token },
    });
    const teacher = teacherRes.data.teachers?.find((t) => t.teacher_id === teacherId);

    if (!teacher) {
      setResponse({ status: "Failed", message: "Teacher details not found." });
      return;
    }

    const payload = {
      examId: selectedExam._id,
      teacher: {
        teacherId: teacher.teacher_id,
        teacherName: teacher.teacher_name,
        className: teacher.class_name,
      },
    };

    await axios.post(`${URL}/endeavour-exams/add-teachers`, payload, {
      headers: { Authorization: token },
    });

    // ✅ Optimistically update selectedExam to hide the button immediately
    setSelectedExam((prev) => ({
      ...prev,
      teacherDetails: [
        ...(prev.teacherDetails || []),
        {
          teacherId: teacher.teacher_id,
          teacherName: teacher.teacher_name,
          className: teacher.class_name,
          _id: new Date().getTime().toString(), // temporary unique _id
        },
      ],
    }));

    setResponse({ status: "Success", message: "Enrolled successfully!" });
    setIsConfirmModalOpen(false);
  } catch (err) {
    console.error("Enrollment error:", err);
    setResponse({ status: "Failed", message: err.response?.data?.message || "Enrollment failed" });
  }
};

  const getParticipantsForClass = (exam, className) => {
    const cls = (exam?.classExams || []).find(c => c.className === className);
    return cls?.participants || [];
  };

  const handleOpenAddMarks = (exam) => {
    setSelectedExam(exam);

    const classWithParticipants = (exam.classExams || []).find(
      (cls) => cls.participants && cls.participants.length > 0
    );

    if (!classWithParticipants) {
      setResponse({ status: "Failed", message: "No participants to add marks." });
      return;
    }

    setSelectedClassExam(classWithParticipants);
    const withMarks = classWithParticipants.participants.map((s) => ({
      ...s,
      marks: s.marks || "",
    }));
    setMarksData(withMarks);
    setIsMarksModalOpen(true);
  };

  const handleMarkChange = (idx, value) => {
    setMarksData((prev) => {
      const updated = [...prev];
      updated[idx].marks = value;
      return updated;
    });
  };

  const saveMarks = async () => {
    try {
      const payload = {
        examId: selectedExam._id,
        className: selectedClassExam.className,
        marksData,
      };

      const res = await axios.post(`${URL}/endeavour-exams/add-marks`, payload, {
        headers: { Authorization: token },
      });

      await fetchExams();

      if (res.data.hasMarks) {
        setExams((prev) =>
          prev.map((ex) =>
            ex._id === selectedExam._id
              ? {
                ...ex,
                classExams: ex.classExams.map((cls) =>
                  cls.className === selectedClassExam.className
                    ? { ...cls, hasMarks: true }
                    : cls
                ),
              }
              : ex
          )
        );
      }

      setResponse({ status: "Success", message: res.data.message });
      setIsMarksModalOpen(false);
    } catch (err) {
      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Failed to save marks",
      });
    }
  };

  // Pagination helpers
  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const goLast = () => setCurrentPage(totalPages);

  return (
    <>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold">Endeavour Exams (Teacher)</h1>

          <div className="flex items-center space-x-3">
            <input
              type="search"
              placeholder="Search exams"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="block py-1 text-sm rounded w-54 px-3 bg-gray-50 border border-gray-300"
            />
            <div className="flex items-center space-x-2">
              <label className="text-l font-medium text-gray-600 mb-1">From</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 border border-gray-300" />
              <label className="text-l font-medium text-gray-600 mb-1">To</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 border border-gray-300" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
                  <table className="w-full text-sm text-gray-500">
                    <thead className="text-base text-gray-700">
                      <tr>
                        <th className="p-2 text-center">Sl No.</th>
                        <th className="p-2 text-center">Exam Name</th>
                        <th className="p-2 text-center">Exam By</th>
                        <th className="p-2 text-center">Register Before</th>
                        <th className="p-2 text-center">Exam Date</th>
                        <th className="p-2 text-center">Center</th>
                        <th className="p-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exams.length ? exams.map((ex, idx) => (
                        <tr key={ex._id}>
                          <td className="text-center">{(currentPage - 1) * limit + (idx + 1)}</td>
                          <td className="p-2 text-center">{ex.examName}</td>
                          <td className="p-2 text-center">{ex.examBy?.[0]?.name || "-"}</td>
                          <td className="p-2 text-center">{ex.registerBefore ? moment(ex.registerBefore).format("DD-MM-YYYY") : "-"}</td>
                          <td className="p-2 text-center">{ex.examDate ? moment(ex.examDate).format("DD-MM-YYYY") : "-"}</td>
                          <td className="p-2 text-center">{ex.examcenter || "-"}</td>
                          <td>
                            <div className="flex items-center justify-center gap-3">
                              <FaEye title="View" size={18} className="text-lavender--600 cursor-pointer" onClick={() => handleViewClick(ex)} />
        
        
                              {
                                ex.classExams?.some(cls =>
                                  !cls.participants || cls.participants.every(p => p.marks == null) // null or undefined
                                ) && (
                                  <CiEdit
                                    size={18}
                                    className="text-lavender--600 cursor-pointer"
                                    onClick={() => handleOpenAddParticipants(ex)}
                                    title="Add Participants"
                                  />
                                )
                              }
        
        
        
                              {/* 🟢 Show Add Marks only if there are participants */}
                              {ex.classExams?.some(
                                cls =>
                                  cls.participants &&
                                  cls.participants.length > 0 &&
                                  !cls.participants.every(p => p.marks !== null && p.marks !== undefined)
                              ) && (
                                  <FaPlus
                                    title="Add Marks"
                                    size={16}
                                    className="text-lavender--600 cursor-pointer"
                                    onClick={() => handleOpenAddMarks(ex)}
                                  />
                                )}
        
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={7} className="text-center text-gray-500">No exams found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
        
                <div className="relative flex flex-wrap items-center justify-center mt-4 space-x-3 select-none">
                  <button onClick={goPrev} disabled={currentPage === 1} className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50">Previous</button>
                  <span className="px-4 py-2 bg-lavender--600 text-white rounded">{currentPage}</span>
                  <button onClick={goNext} disabled={currentPage === totalPages} className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50">Next</button>
        
                  <div className="absolute flex px-5 space-x-2 rounded right-1">
                    <span className="px-4 py-2 text-gray-700 bg-gray-100 rounded">Total Pages: {totalPages}</span>
                    <span onClick={goLast} className={`${totalPages === currentPage ? "opacity-50 bg-gray-100 px-4 py-2 cursor-not-allowed" : "px-4 py-2 text-blue-400 bg-gray-100 rounded cursor-pointer"}`}>Last Page</span>
                  </div>
                </div>

        {/* Table, Modals, Response Messages */}
        {/* Reuse same JSX as Sunday School version but with Endeavour data */}
        {/* ... copy the table, view modal, add participants modal, marks modal, enroll modal ... */}
      </div>
      {/* Response Message */}
      {Response.status && (Response.status === "Success"
        ? <SuccessMessage Message={Response.message} />
        : <FailedMessage Message={Response.message} />)}

      {/* View Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="View Exam Details">
        {selectedExam ? (
          <div className="text-sm text-gray-700 space-y-3 max-h-[600px] overflow-y-auto">
            {[
              { label: "Exam By", value: selectedExam.examBy?.[0]?.name || "-" },
              { label: "Exam Name", value: selectedExam.examName },
              { label: "Exam Date", value: selectedExam.examDate ? moment(selectedExam.examDate).format("DD-MM-YYYY") : "-" },
              { label: "Register Before", value: selectedExam.registerBefore ? moment(selectedExam.registerBefore).format("DD-MM-YYYY") : "-" },
              { label: "Center", value: selectedExam.examcenter },
              { label: "Description", value: selectedExam.description },
              { label: "Teacher Portion", value: selectedExam.teacherExam || "-" }
            ].map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 py-2">
                <div className="col-span-12 sm:col-span-4 font-semibold">{item.label}</div>
                <div className="col-span-12 sm:col-span-8">{item.value || "-"}</div>
              </div>
            ))}
            {/* Only show Enroll button if teacher is NOT already enrolled */}
            {!selectedExam?.teacherDetails?.some(td => td.teacherId === teacherId) && (
              <button
                className="px-2 py-1 bg-lavender--600 text-white rounded text-sm"
                onClick={() => setIsConfirmModalOpen(true)}
              >
                Enroll
              </button>
            )}




            <h3 className="font-semibold text-base">Class Exams & Participants</h3>

            {(selectedExam?.classExams || []).map((cls, idx) => {
              const participants = getParticipantsForClass(selectedExam, cls.className);
              return (
                <div key={idx} className="mt-4 border p-3 rounded">
                  <p className="font-medium mb-2">
                    {cls.className} <span className="text-sm text-gray-500"> — {cls.portion}</span>
                  </p>

                  {participants.length > 0 ? (
                    <table className="w-full text-sm border border-gray-300">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 border text-center">Sl No.</th>
                          <th className="p-2 border text-left">Student Name</th>
                          <th className="p-2 border text-center">Student ID</th>
                          <th className="p-2 border text-center">Marks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participants.map((p, i) => (
                          <tr key={p.member_id}>
                            <td className="p-2 border text-center">{i + 1}</td>
                            <td className="p-2 border">{p.member_name}</td>
                            <td className="p-2 border text-center">{p.member_id}</td>
                            <td className="p-2 border text-center">
                              {p.marks !== null && p.marks !== undefined ? p.marks : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-500 italic">No participants added yet.</p>
                  )}
                </div>
              );
            })}


          </div>
        ) : (
          <p className="text-center text-gray-500">Loading...</p>
        )}
      </Modal>

      {/* Add Participants Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => {
        setIsAddModalOpen(false);
        setSelectedClassExam(null);
        setParticipantSelections([]);
      }} title="Add Students for Exam">
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Class</label>
              <select
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                value={selectedClassExam?.className || ""}
                onChange={(e) => handleClassSelectionChange(e.target.value)}
              >
                <option value="">Select Class</option>
                {(selectedExam?.classExams || []).map((c) => (
                  <option key={c.className} value={c.className}>{c.className}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Portion</label>
              <input type="text" readOnly className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" value={selectedClassExam?.portion || ""} />
            </div>
          </div>

          <div className="border rounded p-3 bg-gray-50">
            <h4 className="font-semibold mb-2">Select Students</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {(selectedClassExam ? students.filter((s) => {
                const label = s.class_name + (s.section_name ? ` - ${s.section_name}` : "");
                return label === selectedClassExam.className;
              }) : []).map((student) => (
                <label key={student._id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={participantSelections.includes(student.member_id)}
                    onChange={() => toggleStudentSelection(student.member_id)}
                  />
                  <span>{student.member_name} ({student.member_id})</span>
                </label>
              ))}

              {!selectedClassExam && <p className="text-gray-500">Please select a class to list students.</p>}
            </div>
          </div>

          <div className="flex justify-end mt-3">
            <button className="px-5 py-2 bg-lavender--600 text-white rounded" onClick={saveParticipants}>Save Participants</button>
          </div>
        </div>
      </Modal>

      {/* Teacher Enrollment Modal */}
      <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="Confirm Enrollment">
        <p>Do you want to enroll yourself for this exam's teacher portion?</p>
        <div className="flex justify-end mt-4 space-x-2">
          <button className="px-3 py-1 bg-gray-300 rounded" onClick={() => setIsConfirmModalOpen(false)}>No</button>
          <button className="px-3 py-1 bg-lavender--600 text-white rounded" onClick={enrollTeacher}>Yes</button>
        </div>
      </Modal>

      <Modal
        isOpen={isMarksModalOpen}
        onClose={() => setIsMarksModalOpen(false)}
        title="Add Marks"
      >
        {selectedClassExam && (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p><b>Exam Name:</b> {selectedExam?.examName}</p>
              <p><b>Exam Date:</b> {moment(selectedExam?.examDate).format("DD-MM-YYYY")}</p>
              <p><b>Exam Center:</b> {selectedExam?.examcenter}</p>
              <p><b>Class Name:</b> {selectedClassExam.className}</p>
              <p><b>Total Students:</b> {marksData.length}</p>
            </div>

            <table className="w-full border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border text-center">Sl No</th>
                  <th className="p-2 border text-center">Student Name</th>
                  <th className="p-2 border text-center">Student ID</th>
                  <th className="p-2 border text-center">Marks</th>
                </tr>
              </thead>
              <tbody>
                {marksData.map((s, i) => (
                  <tr key={s.member_id}>
                    <td className="p-2 border text-center">{i + 1}</td>
                    <td className="p-2 border">{s.member_name}</td>
                    <td className="p-2 border text-center">{s.member_id}</td>
                    <td className="p-2 border text-center">
                      <input
                        type="number"
                        min={0}
                        value={s.marks}
                        onChange={(e) => handleMarkChange(i, e.target.value)}
                        className="border rounded px-2 py-1 w-20 text-center"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mt-4">
              <button
                className="px-5 py-2 bg-lavender--600 text-white rounded"
                onClick={saveMarks}
              >
                Save Marks
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
