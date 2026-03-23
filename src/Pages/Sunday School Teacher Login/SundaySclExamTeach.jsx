import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { URL } from "../../App";
import { FaEye, FaPlus, FaTrash } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import Pagination from "../../Components/Helpers/Pagination";

export const SundaySclExamTeach = () => {
  const navigate = useNavigate();
  // list + filters + pagination
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);

  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rowsInput, setRowsInput] = useState("");
  const [jumpInput, setJumpInput] = useState("");
  const token = window.sessionStorage.getItem("token");
  const teacherId = JSON.parse(atob(token.split(".")[1])).member_id;

  const [Response, setResponse] = useState({ status: null, message: "" });

  // modals + local selections
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);
  const [marksData, setMarksData] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedClassExam, setSelectedClassExam] = useState(null); // class entry from exam.classExams
  const [students, setStudents] = useState([]); // teacher's students
  const [participantSelections, setParticipantSelections] = useState([]); // currently checked students in Add Modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);



  const fetchExams = async () => {
    try {

      const teacherId = encodeURIComponent(
        JSON.parse(atob(token.split(".")[1])).member_id
      );
      const res = await axios.get(`${URL}/sundayschool-exams/teacher?teacherId=${teacherId}`, {
        headers: { Authorization: token },
        params: {
          page: CurrentPage,
          limit: rowsPerPage,
          search: search || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });
      if (res.data.success) {
        setExams(res.data.exams || []);
        setTotalPages(res.data.totalPages || 1);
      } else {
        setExams(res.data.exams || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching teacher exams:", err);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [search, startDate, endDate, CurrentPage, rowsPerPage, token]);


  // fetch students under this teacher (so teacher only sees their students)
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // const teacherId = JSON.parse(atob(token.split(".")[1])).member_id;


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
    if (token) fetchStudents();
  }, [token]);

  // const handleViewClick = (exam) => {
  //   setSelectedExam(exam);
  //   setIsViewModalOpen(true);
  // };


  const handleViewClick = (exam) => {
    navigate(`/admin/sundayschoolexam/${exam._id}`);
  };
  const handleOpenAddParticipants = (exam) => {
    setSelectedExam(exam);

    // For simplicity, select the first class that has no marks yet
    const classWithNoMarks = exam.classExams.find(cls =>
      !cls.participants || cls.participants.every(p => p.marks == null)
    );
    setSelectedClassExam(classWithNoMarks || null);

    // Initialize participant selections with existing participants' IDs
    if (classWithNoMarks && classWithNoMarks.participants?.length > 0) {
      const existingIds = classWithNoMarks.participants.map(p => p.member_id);
      setParticipantSelections(existingIds);
    } else {
      setParticipantSelections([]);
    }

    setIsAddModalOpen(true);
  };


  // When teacher changes class selection in the Add Participants modal
  const handleClassSelectionChange = (className) => {
    setSelectedClassExam((prev) => {
      // find classExams entry
      const ce = (selectedExam?.classExams || []).find((c) => c.className === className) || { className, portion: "" };
      return ce;
    });

    // preselect students previously saved for that class (if present in selectedExam.participants)
    const existing = (selectedExam?.participants || []).find((p) => p.className === className);
    setParticipantSelections(existing ? (existing.students || []).map((s) => s.member_id) : []);
  };

  // toggle a student's checkbox in Add Participants modal
  const toggleStudentSelection = (member_id) => {
    setParticipantSelections((prev) =>
      prev.includes(member_id) ? prev.filter((m) => m !== member_id) : [...prev, member_id]
    );
  };

  // Save participants for the selected exam & class
  const saveParticipants = async () => {
    try {
      if (!selectedExam || !selectedClassExam) {
        setResponse({ status: "Failed", message: "Please select an exam and class." });
        return;
      }

      // build payload: send full student objects (or minimal), backend can map by member_id
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

      // POST to your backend (adjust endpoint if needed)
      await axios.post(`${URL}/sundayschool-exams/add-participants`, payload, {
        headers: { Authorization: token },
      });

      await fetchExams();

      // optimistic local update: reflect the change in UI without refetch
      setExams((prev) =>
        prev.map((ex) => {
          if (String(ex._id) !== String(selectedExam._id)) return ex;
          // update participants array for that class
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



  const enrollTeacher = async () => {
    try {
      if (!selectedExam) {
        setResponse({ status: "Failed", message: "Please select an exam to enroll." });
        return;
      }

      const teacherId = JSON.parse(atob(token.split(".")[1])).member_id;

      const teacherRes = await axios.get(`${URL}/sunday-classes/teachers/details`, {
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

      await axios.post(`${URL}/sundayschool-exams/add-teachers`, payload, {
        headers: { Authorization: token },
      });

      // ✅ Optimistically update selectedExam to hide the Enroll button immediately
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

    // ✅ Look inside classExams for participants
    const classWithParticipants = (exam.classExams || []).find(
      (cls) => cls.participants && cls.participants.length > 0
    );

    if (!classWithParticipants) {
      setResponse({ status: "Failed", message: "No participants to add marks." });
      return;
    }

    // ✅ Set selected class and marks data properly
    setSelectedClassExam(classWithParticipants);
    const withMarks = classWithParticipants.participants.map((s) => ({
      ...s,
      marks: s.marks || "",
    }));
    setMarksData(withMarks);
    setIsMarksModalOpen(true);
  };


  // update mark input
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

      const res = await axios.post(`${URL}/sundayschool-exams/add-marks`, payload, {
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
          <h1 className="text-lg font-semibold">Sunday School Exams (Teacher)</h1>

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
                className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 
                                             border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600" />
              <label className="text-l font-medium text-gray-600 mb-1">To</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 
                                             border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">

            <thead className="text-base text-gray-700 border-b">
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

            <tbody className="text-center">
              {exams.length ? exams.map((ex, idx) => (
                <tr key={ex._id} className="border-b ">

                  <td className="p-2">
                    {(CurrentPage - 1) * rowsPerPage + idx + 1}
                  </td>

                  <td className="p-2 text-left">
                    {ex.examName}
                  </td>

                  <td className="p-2 text-left">
                    {ex.examBy?.[0]?.name || "-"}
                  </td>

                  <td className="p-2">
                    {ex.registerBefore
                      ? moment(ex.registerBefore).format("DD-MM-YYYY")
                      : "-"}
                  </td>

                  <td className="p-2">
                    {ex.examDate
                      ? moment(ex.examDate).format("DD-MM-YYYY")
                      : "-"}
                  </td>

                  <td className="p-2">
                    {ex.examcenter || "-"}
                  </td>

                  <td className="p-2">
                    <div className="flex items-center justify-center gap-3">

                      <FaEye
                        title="View"
                        size={18}
                        className="text-lavender--600 cursor-pointer"
                        onClick={() => handleViewClick(ex)}
                      />

                      {
                        ex.classExams?.some(cls =>
                          !cls.participants ||
                          cls.participants.every(p => p.marks == null)
                        ) && (
                          <CiEdit
                            size={18}
                            className="text-lavender--600 cursor-pointer"
                            // onClick={() => handleOpenAddParticipants(ex)}
                            onClick={() => navigate(`/admin/sundayschoolexam/${ex._id}/participants`)}
                            title="Add Participants"
                          />
                        )
                      }

                      {ex.classExams?.some(
                        cls =>
                          cls.participants &&
                          cls.participants.length > 0 &&
                          !cls.participants.every(
                            p => p.marks !== null && p.marks !== undefined
                          )
                      ) && (
                          <FaPlus
                            title="Add Marks"
                            size={16}
                            className="text-lavender--600 cursor-pointer"
                            // onClick={() => handleOpenAddMarks(ex)}
                              onClick={() => navigate(`/admin/sundayschoolexam/${ex._id}/marks`)}
                          />
                        )}

                    </div>
                  </td>

                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="p-3 text-center text-gray-500">
                    No exams found.
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
         