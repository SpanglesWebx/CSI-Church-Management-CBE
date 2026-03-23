import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { URL } from "../../App";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AddEndeavourExam = () => {
  const [newExamBy, setNewExamBy] = useState([]);
  const [examBys, setExamBys] = useState([]);
  const [selectedExamBy, setSelectedExamBy] = useState("");
  const [examByInput, setExamByInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [registerBefore, setRegisterBefore] = useState("");
  const [examcenter, setExamCenter] = useState("");
  const [description, setDescription] = useState("");
  const [classes, setClasses] = useState([]);
  const token = window.sessionStorage.getItem("token");
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [classExams, setClassExams] = useState([{ className: "", portion: "" }]);
  const [teacherExam, setTeacherExam] = useState("");
  const [classErrors, setClassErrors] = useState([]);

  const navigate = useNavigate();

  // Add a new class row
  const addClassExam = () => {
    setClassExams([...classExams, { className: "", portion: "" }]);
  };

  // Handle changes in class exam fields
  const handleClassExamChange = (index, field, value) => {
    const updated = [...classExams];
    updated[index][field] = value;
    setClassExams(updated);

    // Check for duplicates
    const duplicate = updated.some((ex, i) => i !== index && ex.className === value);
    const errors = [...classErrors];
    errors[index] = duplicate ? "This class is already added" : "";
    setClassErrors(errors);
  };

  // Delete a class row
  const deleteClassExam = (index) => {
    setClassExams(classExams.filter((_, i) => i !== index));
  };

 
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${URL}/endeavour-classes/event/groups`, {
          headers: { Authorization: token },
        });
        setClasses(res.data || []); // this will now be ["Primary", "Junior", "Senior"]
      } catch (err) {
        console.error("Error fetching event class groups:", err);
      }
    };
    fetchClasses();
  }, [token]);

  // Fetch Exam Bys
  useEffect(() => {
    const fetchExamBys = async () => {
      try {
        const res = await axios.get(`${URL}/endeavour-exams/examby/all`, {
          headers: { Authorization: token },
        });
        setExamBys(res.data.examBys || []);
        setNewExamBy(res.data.examBys?.map(eb => eb.name) || []);
      } catch (err) {
        console.error("Failed to fetch Exam Bys:", err);
      }
    };
    fetchExamBys();
  }, [token]);

  // Handle form submission
  const handleSubmit = async () => {
    // Validations
    if (!examName.trim()) return setResponse({ status: "Failed", message: "Exam Name is required" });
    if (!examDate) return setResponse({ status: "Failed", message: "Exam Date is required" });
    if (!registerBefore) return setResponse({ status: "Failed", message: "Register Before date is required" });
    if (!examcenter.trim()) return setResponse({ status: "Failed", message: "Exam Center is required" });
    if (!selectedExamBy) return setResponse({ status: "Failed", message: "Please select Exam By" });

    for (let i = 0; i < classExams.length; i++) {
      if (!classExams[i].className || !classExams[i].portion.trim()) {
        return setResponse({ status: "Failed", message: "All Class Exams must be filled" });
      }
    }

    try {
      const payload = {
        examName,
        examDate,
        registerBefore,
        examcenter,
        description,
        examBy: [selectedExamBy],
        classExams,
        teacherExam,
      };

      const res = await axios.post(`${URL}/endeavour-exams/create`, payload, {
        headers: { Authorization: token },
      });

      if (res.data.success) {
        setResponse({ status: "Success", message: "Exam saved successfully!" });

        // Clear form
        setExamName("");
        setExamDate("");
        setRegisterBefore("");
        setExamCenter("");
        setDescription("");
        setSelectedExamBy("");
        setClassExams([{ className: "", portion: "" }]);
        setTeacherExam("");
        setTimeout(() => {
          navigate("/admin/endeavourexam");
        }, 3000);
      } else {
        setResponse({ status: "Failed", message: res.data.message || "Failed to save exam" });
      }
    } catch (err) {
      console.error(err);
      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Something went wrong",
      });
    }
  };

  // Navigate back
  const handlegoback = () => navigate("/admin/endeavourexam");

  return (
    <>
      <div className="flex justify-start mt-6">
        <FaArrowLeft size={18} onClick={handlegoback} className="cursor-pointer" title="go back" />
      </div>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold">Add Endeavour Exam</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          {/* Exam By */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block mb-1 font-semibold text-gray-800">Exam By</label>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="block mb-1 font-semibold text-sm text-lavender--600"
              >
                Add Exam By
              </button>
            </div>
            <select
              value={selectedExamBy}
              onChange={(e) => setSelectedExamBy(e.target.value)}
              className="border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5"
            >
              <option value="">-- Select Exam By --</option>
              {examBys.map((eb) => (
                <option key={eb._id} value={eb._id}>{eb.name}</option>
              ))}
            </select>
          </div>

          {/* Exam Name */}
          <div>
            <label className="block mb-1 font-semibold text-gray-800">Exam Name</label>
            <input
              type="text"
              placeholder="Enter Exam Name"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className="border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5"
            />
          </div>

          {/* Exam Date */}
          <div>
            <label className="block mb-1 font-semibold text-gray-800">Exam Date</label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5"
            />
          </div>

          {/* Register Before */}
          <div>
            <label className="block mb-1 font-semibold text-gray-800">Register Before</label>
            <input
              type="date"
              value={registerBefore}
              onChange={(e) => setRegisterBefore(e.target.value)}
              className="border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5"
            />
          </div>

          {/* Exam Center */}
          <div>
            <label className="block mb-1 font-semibold text-gray-800">Exam Center</label>
            <input
              type="text"
              value={examcenter}
              onChange={(e) => setExamCenter(e.target.value)}
              placeholder="Enter the exam center"
              className="border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5"
            />
          </div>

          {/* Exam Description */}
          <div>
            <label className="block mb-1 font-semibold text-gray-800">Exam Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter the exam description"
              className="border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5"
            />
          </div>
        </div>

        {/* Class Exam Portion */}
        <div className="mt-4 space-y-6">
          <div className="border rounded-lg p-4 bg-gray-50 shadow-sm">
            <h4 className="text-md font-semibold mb-3 text-gray-800">Student Exam Portion</h4>
            {classExams.map((exam, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end mb-3">
                <div className="sm:col-span-5">
                  <label className="block mb-1 font-semibold text-gray-800">Select Class</label>

                  <select
                    value={exam.className}
                    onChange={(e) => handleClassExamChange(index, "className", e.target.value)}
                    className={`border ${classErrors[index] ? 'border-red-500' : 'border-gray-300'} text-gray-800 rounded-lg block w-full p-2.5 focus:ring-lavender--600 focus:border-lavender--600`}
                  >
                    <option value="">-- Select Class --</option>
                    {classes.map((clsGroup, i) => (
                      <option key={i} value={clsGroup}>
                        {clsGroup}
                      </option>
                    ))}
                  </select>

                  {classErrors[index] && <p className="text-red-500 text-sm mt-1">{classErrors[index]}</p>}
                </div>

                {/* Exam Portion */}
                <div className="sm:col-span-6">
                  <label className="block mb-1 font-semibold text-gray-800">Exam Portion</label>
                  <textarea
                    placeholder="Enter exam portion"
                    value={exam.portion}
                    rows={1}
                    onChange={(e) => handleClassExamChange(index, "portion", e.target.value)}
                    className="border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5"
                  />
                </div>

                {/* Add / Delete */}
                <div className="sm:col-span-1 flex justify-end">
                  {index === classExams.length - 1 ? (
                    <button
                      onClick={() => {
                        const lastExam = classExams[classExams.length - 1];
                        if (!lastExam.className || !lastExam.portion.trim()) return;
                        addClassExam();
                      }}
                      className="mt-6 px-3 py-2 bg-lavender--600 text-white rounded-lg hover:bg-lavender--700 transition"
                    >
                      <FaPlus />
                    </button>
                  ) : (
                    <button
                      onClick={() => deleteClassExam(index)}
                      className="mt-6 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teacher Portion */}
        <div className="mt-4 space-y-6">
          <div className="mt-6 border rounded-lg p-4 bg-gray-50 shadow-sm">
            <h4 className="text-md font-semibold mb-3 text-gray-800">Teacher Exam Portion</h4>
            <textarea
              placeholder="Enter the exam portion for teachers"
              value={teacherExam}
              onChange={(e) => setTeacherExam(e.target.value)}
              className="border border-gray-300 text-gray-800 rounded-lg block w-full p-2.5 focus:ring-lavender--600 focus:border-lavender--600"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-lavender--600 text-white rounded-lg hover:bg-lavender--700"
          >
            Save Exam
          </button>
        </div>
      </div>

      {/* Modal for Exam By */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">Add Exam By</h2>

              {/* Tags */}
              <div className="mt-2">
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {newExamBy.map((tag, i) => (
                    <span key={i} className="flex items-center bg-gray-200 text-black px-2 py-1 rounded-full text-sm">
                      {tag}
                      <button
                        type="button"
                        className="ml-2 text-gray-600 hover:text-red-500"
                        onClick={() => setNewExamBy((prev) => prev.filter((_, index) => index !== i))}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                {/* Input */}
                <input
                  type="text"
                  placeholder="+ Add the Exam By"
                  value={examByInput}
                  onChange={(e) => setExamByInput(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === "Tab") && examByInput.trim()) {
                      e.preventDefault();
                      const newTag = examByInput.trim();
                      if (!newExamBy.includes(newTag)) setNewExamBy([...newExamBy, newTag]);
                      setExamByInput("");
                    }
                  }}
                  className="mt-3 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 mt-5">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      const res = await axios.put(
                        `${URL}/endeavour-exams/examby/update`,
                        { names: newExamBy },
                        { headers: { Authorization: token } }
                      );
                      setExamBys(res.data.examBys);
                      setNewExamBy([]);
                      setExamByInput("");
                      setIsModalOpen(false);
                      setResponse({ status: "Success", message: "Exam By updated successfully!" });
                    } catch (err) {
                      setResponse({ status: "Failed", message: err.response?.data?.message || "Failed to update Exam By" });
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

      {Response.status && (
        Response.status === "Success"
          ? <SuccessMessage Message={Response.message} />
          : <FailedMessage Message={Response.message} />
      )}
    </>
  );
};
