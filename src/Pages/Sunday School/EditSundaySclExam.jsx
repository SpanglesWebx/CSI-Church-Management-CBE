






import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";

export const EditSundaySclExam = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const token = window.sessionStorage.getItem("token");

  const [saving, setSaving] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);

  const [activeField, setActiveField] = useState(null);
  const [errors, setErrors] = useState({});
  const [Response, setResponse] = useState({ status: null, message: "" });

  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [registerBefore, setRegisterBefore] = useState("");
  const [examCenter, setExamCenter] = useState("");
  const [description, setDescription] = useState("");

  const [classes, setClasses] = useState([]);

  const [classExams, setClassExams] = useState([
    { className: "", portion: "" }
  ]);

  const [teacherExam, setTeacherExam] = useState("");

  const [examBys, setExamBys] = useState([]);
  const [selectedExamBy, setSelectedExamBy] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [examByInput, setExamByInput] = useState("");
  const [modalExamByList, setModalExamByList] = useState([]);

  const MAX_NAME = 50;
  const MAX_CENTER = 100;
  const MAX_DESC = 150;
  const MAX_PORTION = 200;
  const MAX_EXAMBY = 40;

  const validateMaxLength = (name, value, max = 100) => {

    if (value.length > max) {

      setErrors(prev => ({
        ...prev,
        [name]: `Maximum ${max} characters allowed`
      }));

      setTimeout(() => {
        setErrors(prev => {
          const copy = { ...prev };
          delete copy[name];
          return copy;
        });
      }, 3000);

      return false;
    }

    setErrors(prev => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });

    return true;
  };

  const showTemporaryError = (key, message, duration = 3000) => {

    setErrors(prev => ({
      ...prev,
      [key]: message
    }));

    setTimeout(() => {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }, duration);
  };

  const RequiredLabel = ({ children }) => (
    <label className="block mb-1 text-sm font-medium text-gray-700">
      {children}
      <span className="text-red-600 ml-1">*</span>
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

  useEffect(() => {

    const fetchData = async () => {

      try {

        const [examRes, classRes, examByRes] = await Promise.all([
          axios.get(`${URL}/sundayschool-exams/${id}`, { headers: { Authorization: token } }),
          axios.get(`${URL}/sunday-classes/event/groups`, { headers: { Authorization: token } }),
          axios.get(`${URL}/sundayschool-exams/examby/all`, { headers: { Authorization: token } })
        ]);

        const exam = examRes.data.exam;

        setClasses(classRes.data || []);
        setExamBys(examByRes.data.examBys || []);

        setExamName(exam.examName || "");
        setExamCenter(exam.examcenter || "");
        setDescription(exam.description || "");
        setTeacherExam(exam.teacherExam || "");

        if (Array.isArray(exam.examBy) && exam.examBy.length) {
          const id = exam.examBy[0]?._id || exam.examBy[0];
          setSelectedExamBy(id);
        }
        
        if (exam.examDate) {
          setExamDate(exam.examDate.split("T")[0]);
        }

        if (exam.registerBefore) {
          setRegisterBefore(exam.registerBefore.split("T")[0]);
        }

        if (exam.classExams?.length) {

          const unique = {};

          exam.classExams.forEach(c => {

            const base = c.className.split(" - ")[0].trim();

            if (!unique[base]) {
              unique[base] = {
                className: base,
                portion: c.portion
              };
            }

          });

          setClassExams(Object.values(unique));

        }

      } catch (err) {

        setResponse({
          status: "Failed",
          message: "Failed to load exam"
        });

      }

    };

    fetchData();

  }, [id, token]);

  useEffect(() => {
    if (isModalOpen) {
      setModalExamByList(examBys.map(e => e.name));
    }
  }, [isModalOpen, examBys]);

  const addClassExam = () => {
    setClassExams(prev => [...prev, { className: "", portion: "" }]);
  };

  const deleteClassExam = (index) => {
    setClassExams(prev => prev.filter((_, i) => i !== index));
  };

  const handleClassExamChange = (index, field, value) => {

    setClassExams(prev =>
      prev.map((row, i) => {

        if (i !== index) return row;

        if (field === "className") {

          const duplicate = prev.some((r, idx) =>
            idx !== index && r.className === value
          );

          if (duplicate && value !== "") {
            showTemporaryError(`class-${index}`, "Class already selected above");
            return row;
          }
        }

        if (field === "portion") {
          if (!validateMaxLength(`portion-${index}`, value, MAX_PORTION)) return row;
        }

        return { ...row, [field]: value };

      })
    );
  };

  useEffect(() => {

    const blockRefresh = (e) => {

      if (saving) {
        e.preventDefault();
        e.returnValue = "";
      }

    };

    window.addEventListener("beforeunload", blockRefresh);

    return () => window.removeEventListener("beforeunload", blockRefresh);

  }, [saving]);

  const handleSubmit = async () => {

    if (saving) return;

    try {

      setSaving(true);

      if (!selectedExamBy || !examName || !examDate || !registerBefore || !examCenter) {
        setResponse({ status: "Failed", message: "Please fill all required fields" });
        return;
      }

      const exam = new Date(examDate);
      const register = new Date(registerBefore);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (exam < today) {
        setResponse({ status: "Failed", message: "Exam date cannot be in the past" });
        return;
      }

      if (register > exam) {
        setResponse({ status: "Failed", message: "Register before must be before exam date" });
        return;
      }

      const cleanedClass = classExams
        .map(c => ({
          className: c.className,
          portion: c.portion?.trim()
        }))
        .filter(c => c.className && c.portion);

      if (cleanedClass.length === 0) {
        setResponse({ status: "Failed", message: "Add at least one class exam portion" });
        return;
      }

      const classSet = new Set();

      for (const c of cleanedClass) {

        if (classSet.has(c.className)) {
          setResponse({ status: "Failed", message: `${c.className} selected multiple times` });
          return;
        }

        classSet.add(c.className);

      }

      const payload = {
        examName: examName.trim(),
        examDate,
        registerBefore,
        examcenter: examCenter.trim(),
        description: description?.trim(),
        examBy: [selectedExamBy],
        classExams: cleanedClass,
        teacherExam: teacherExam?.trim()
      };

      const res = await axios.put(
        `${URL}/sundayschool-exams/update/${id}`,
        payload,
        { headers: { Authorization: token } }
      );

      setResponse({
        status: "Success",
        message: res.data?.message || "Exam updated successfully"
      });

      setTimeout(() => navigate("/admin/exam"), 1500);

    } catch (err) {

      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Failed to update exam"
      });

    } finally {

      setSaving(false);

    }

  };

  const handlegoback = () => navigate("/admin/exam");

  return (
    <>
      <div className={`${saving ? "pointer-events-none opacity-60" : ""}`}>

        <div className="flex justify-start mt-6">
          <FaArrowLeft size={18} onClick={handlegoback} className="cursor-pointer" />
        </div>

        <div className="p-4 bg-white shadow-md rounded-lg mt-3">

          <h1 className="text-xl font-bold">Edit Sunday School Exam</h1>

          {/* FIRST ROW */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

            <div>
              <div className="flex items-center justify-between">
                <RequiredLabel>Exam By</RequiredLabel>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="text-sm font-medium text-lavender--600"
                >
                  Add Exam By
                </button>
              </div>

              <select
                value={selectedExamBy}
                onChange={(e) => setSelectedExamBy(e.target.value)}
                className="block w-full mt-1 rounded-md border border-gray-300 shadow-sm sm:text-sm"
              >
                <option value="">-- Select Exam By --</option>
                {examBys.map(eb => (
                  <option key={eb._id} value={eb._id}>{eb.name}</option>
                ))}
              </select>
            </div>

            <div className="relative">

              <div className="mb-2">
                <RequiredLabel>Exam Name</RequiredLabel>
              </div>

              <input
                type="text"
                value={examName}
                onFocus={() => setActiveField("examName")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (validateMaxLength("examName", val, MAX_NAME)) {
                    setExamName(val);
                  }
                }}
                className={`block w-full mt-1 rounded-md border shadow-sm sm:text-sm
                ${errors.examName ? "border-red-500" : "border-gray-300"}`}
              />

              {errors.examName && (
                <p className="text-red-500 text-xs mt-1">{errors.examName}</p>
              )}

              <CharCounter
                value={examName}
                max={MAX_NAME}
                show={activeField === "examName"}
              />

            </div>

            <div>

              <div className="mb-2">
                <RequiredLabel>Exam Date</RequiredLabel>
              </div>

              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="block w-full mt-1 rounded-md border border-gray-300 shadow-sm sm:text-sm"
              />

            </div>

          </div>

          {/* SECOND ROW */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">

            <div>
              <RequiredLabel>Register Before</RequiredLabel>

              <input
                type="date"
                value={registerBefore}
                onChange={(e) => setRegisterBefore(e.target.value)}
                className="block w-full mt-1 rounded-md border border-gray-300 shadow-sm sm:text-sm"
              />

            </div>

            <div className="relative">

              <RequiredLabel>Exam Center</RequiredLabel>

              <input
                type="text"
                value={examCenter}
                onFocus={() => setActiveField("center")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (validateMaxLength("center", val, MAX_CENTER)) {
                    setExamCenter(val);
                  }
                }}
                className={`block w-full mt-1 rounded-md border shadow-sm sm:text-sm
                ${errors.center ? "border-red-500" : "border-gray-300"}`}
              />

              {errors.center && (
                <p className="text-red-500 text-xs mt-1">{errors.center}</p>
              )}

              <CharCounter
                value={examCenter}
                max={MAX_CENTER}
                show={activeField === "center"}
              />

            </div>

            <div className="relative">

              <RequiredLabel>Description</RequiredLabel>

              <input
                type="text"
                value={description}
                onFocus={() => setActiveField("desc")}
                onBlur={() => setActiveField(null)}
                onChange={(e) => {
                  const val = e.target.value;

                  if (validateMaxLength("desc", val, MAX_DESC)) {
                    setDescription(val);
                  }
                }}
                className={`block w-full mt-1 rounded-md border shadow-sm sm:text-sm
                ${errors.desc ? "border-red-500" : "border-gray-300"}`}
              />

              {errors.desc && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.desc}
                </p>
              )}

              <CharCounter
                value={description}
                max={MAX_DESC}
                show={activeField === "desc"}
              />

            </div>

          </div>

          {/* STUDENT + TEACHER */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

            <div className="p-5 bg-gray-50 border rounded-xl space-y-4">

              <h3 className="font-semibold text-gray-700">
                Student Exam Portion
              </h3>

              {classExams.map((exam, index) => {

                const isLast = index === classExams.length - 1;
                const filled = exam.className && exam.portion.trim();

                return (

                  <div key={index} className="grid grid-cols-12 gap-3">

                    <div className="col-span-4 flex flex-col">

                      <label className="text-sm font-medium text-gray-700">
                        Class
                      </label>

                      <select
                        value={exam.className}
                        onChange={(e) =>
                          handleClassExamChange(index, "className", e.target.value)
                        }
                        className={`block w-full mt-1 rounded-md border shadow-sm sm:text-sm
                        ${errors[`class-${index}`] ? "border-red-500" : "border-gray-300"}`}
                      >
                        <option value="">-- Select Class --</option>
                        {classes.map((c, i) => {

                          const name = typeof c === "string" ? c : c.class_name;

                          return (
                            <option key={i} value={name}>
                              {name}
                            </option>
                          );
                        })}
                      </select>

                      {errors[`class-${index}`] && (
                        <p className="text-red-500 text-xs mt-1 min-h-[16px]">
                          {errors[`class-${index}`]}
                        </p>
                      )}

                    </div>

                    <div className="col-span-7 flex flex-col relative">

                      <label className="text-sm font-medium text-gray-700">
                        Portion
                      </label>

                      <input
                        type="text"
                        value={exam.portion}
                        onFocus={() => setActiveField(`portion-${index}`)}
                        onBlur={() => setActiveField(null)}
                        onChange={(e) =>
                          handleClassExamChange(index, "portion", e.target.value)
                        }
                        className={`block w-full mt-1 rounded-md border shadow-sm sm:text-sm
                        ${errors[`portion-${index}`] ? "border-red-500" : "border-gray-300"}`}
                      />

                      <CharCounter
                        value={exam.portion}
                        max={MAX_PORTION}
                        show={activeField === `portion-${index}`}
                      />

                    </div>

                    <div className="col-span-1 flex items-start justify-end pt-6">

                      {isLast ? (
                        <button
                          onClick={() => {
                            if (!filled) {
                              setResponse({
                                status: "Failed",
                                message: "Fill the current row first"
                              });
                              return;
                            }
                            addClassExam();
                          }}
                          disabled={!filled}
                          className={`p-2 rounded-md text-white
                          ${filled
                              ? "bg-lavender--600 hover:bg-lavender--700"
                              : "bg-gray-300 cursor-not-allowed"
                            }`}
                        >
                          <FaPlus />
                        </button>
                      ) : (
                        <button
                          onClick={() => deleteClassExam(index)}
                          className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                        >
                          <FaTrash />
                        </button>
                      )}

                    </div>

                  </div>

                );

              })}

            </div>

            <div className="p-5 bg-gray-50 border rounded-xl ">

              <h3 className="font-semibold text-gray-700 mb-3">
                Teacher Exam Portion
              </h3>

              <div className="relative">

                <textarea
                  rows={6}
                  value={teacherExam}
                  onFocus={() => setActiveField("teacher")}
                  onBlur={() => setActiveField(null)}
                  onChange={(e) => {

                    const val = e.target.value;

                    if (validateMaxLength("teacher", val, MAX_PORTION)) {
                      setTeacherExam(val);
                    }

                  }}
                  className={`block w-full rounded-md border shadow-sm sm:text-sm
                  ${errors.teacher ? "border-red-500" : "border-gray-300"}`}
                />

                {errors.teacher && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.teacher}
                  </p>
                )}

                <CharCounter
                  value={teacherExam}
                  max={MAX_PORTION}
                  show={activeField === "teacher"}
                />

              </div>

            </div>

          </div>

          <div className="flex justify-end mt-6">

            <button
              onClick={handleSubmit}
              disabled={saving}
              className={`px-6 py-2 text-white rounded-md
              ${saving ? "bg-gray-400" : "bg-lavender--600"}`}
            >
              {saving ? "Updating..." : "Update Exam"}
            </button>

          </div>

        </div>



        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">

              <div className="bg-white rounded-lg p-6 w-96 shadow-lg relative">

                <h2 className="text-lg font-semibold mb-3 text-gray-800">
                  Add Exam By
                </h2>

                <div className="flex flex-wrap gap-2 mb-3">

                  {modalExamByList.map((name, i) => {

                    const exists = examBys.some(
                      e => e.name.toLowerCase() === name.toLowerCase()
                    );

                    return (
                      <span
                        key={i}
                        className={`flex items-center px-2 py-1 rounded-full text-sm text-white
                ${exists ? "bg-green-500" : "bg-red-500"}`}
                      >
                        {name}

                        <button
                          type="button"
                          className="ml-2 text-white hover:text-gray-200"
                          onClick={() =>
                            setModalExamByList(prev =>
                              prev.filter((_, idx) => idx !== i)
                            )
                          }
                        >
                          ✕
                        </button>

                      </span>
                    );

                  })}

                </div>

                <input
                  type="text"
                  placeholder="Type and press Enter"
                  value={examByInput}
                  onChange={(e) => setExamByInput(e.target.value)}
                  onKeyDown={(e) => {

                    if ((e.key === "Enter" || e.key === "Tab") && examByInput.trim()) {

                      e.preventDefault();

                      const value = examByInput.trim();

                      if (!modalExamByList.includes(value)) {
                        setModalExamByList(prev => [...prev, value]);
                      }

                      setExamByInput("");
                    }

                  }}
                  className="border border-gray-300 rounded-lg block w-full p-2.5"
                />

                <div className="flex justify-end gap-2 mt-5">

                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setExamByInput("");
                      setModalExamByList([]);
                    }}
                    className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>

                  <button
                    disabled={modalSaving}
                    onClick={async () => {

                      if (modalSaving) return;

                      try {

                        setModalSaving(true);

                        const res = await axios.put(
                          `${URL}/sundayschool-exams/examby/update`,
                          { names: modalExamByList },
                          { headers: { Authorization: token } }
                        );

                        setExamBys(res.data.examBys);

                        if (res.data.examBys?.length) {
                          setSelectedExamBy(
                            res.data.examBys[res.data.examBys.length - 1]._id
                          );
                        }

                        setResponse({
                          status: "Success",
                          message: "Exam By updated successfully!"
                        });

                        setIsModalOpen(false);
                        setExamByInput("");
                        setModalExamByList([]);

                      } catch (err) {

                        setResponse({
                          status: "Failed",
                          message:
                            err.response?.data?.message ||
                            "Failed to update Exam By"
                        });

                      } finally {

                        setModalSaving(false);

                      }

                    }}
                    className="px-4 py-2 text-white rounded-lg bg-lavender--600"
                  >

                    {modalSaving ? "Saving..." : "Save"}

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

      </div>
    </>
  );
};