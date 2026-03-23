// src/pages/endeavour/EditEndeavourExam.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";

export const EditEndeavourExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = window.sessionStorage.getItem("token");

  // basic fields
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [registerBefore, setRegisterBefore] = useState("");
  const [examcenter, setExamCenter] = useState("");
  const [description, setDescription] = useState("");
  const [examBys, setExamBys] = useState([]);
  const [selectedExamBy, setSelectedExamBy] = useState("");
  const [teacherExam, setTeacherExam] = useState("");
  const [Response, setResponse] = useState({ status: null, message: "" });

  // grouping support
  const [classGroups, setClassGroups] = useState([]); // ["Primary","Junior"...]
  const [allClasses, setAllClasses] = useState([]); // full class docs from /endeavour-classes
  const [originalSectionClassExams, setOriginalSectionClassExams] = useState([]); // preserve participants/_id
  // grouped for UI: { className: "Primary", portion: "..." , sections: [orig section objects] }
  const [groupedClassExams, setGroupedClassExams] = useState([{ className: "", portion: "", sections: [] }]);

  // modal tags
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allExamByTags, setAllExamByTags] = useState([]);
  const [examByInput, setExamByInput] = useState("");

  // ui errors
  const [classErrors, setClassErrors] = useState({});

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [examRes, examBysRes, classGroupsRes, allClassesRes] = await Promise.all([
          axios.get(`${URL}/endeavour-exams/${id}`, { headers: { Authorization: token } }),
          axios.get(`${URL}/endeavour-exams/examby/all`, { headers: { Authorization: token } }),
          axios.get(`${URL}/endeavour-classes/event/groups`, { headers: { Authorization: token } }),
          axios.get(`${URL}/endeavour-classes`, { headers: { Authorization: token } }),
        ]);

        const exam = examRes.data.exam;
        const examBysList = examBysRes.data.examBys || [];
        const groupNames = classGroupsRes.data || [];
        const allCls = allClassesRes.data?.classes || allClassesRes.data || [];

        setExamBys(examBysList);
        setClassGroups(groupNames);
        setAllClasses(allCls);

        // basic fields
        setExamName(exam.examName || "");
        setExamDate(
          exam.examDate
            ? typeof exam.examDate === "string"
              ? exam.examDate.split("T")[0]
              : new Date(exam.examDate).toISOString().split("T")[0]
            : ""
        );
        setRegisterBefore(
          exam.registerBefore
            ? typeof exam.registerBefore === "string"
              ? exam.registerBefore.split("T")[0]
              : new Date(exam.registerBefore).toISOString().split("T")[0]
            : ""
        );
        setExamCenter(exam.examcenter || "");
        setDescription(exam.description || "");
        setTeacherExam(exam.teacherExam || "");

        // examBy: pick first ID if present
        if (Array.isArray(exam.examBy) && exam.examBy.length > 0) {
          setSelectedExamBy(exam.examBy[0]);
        }

        // preserve original section-level classExams (keep participants/_id)
        // ensure className is trimmed
        const origSectionExams = (exam.classExams || []).map((ce) => ({
          ...ce,
          className: (ce.className || "").trim(),
        }));
        setOriginalSectionClassExams(origSectionExams);

        // Build grouped view from sections: group by base before hyphen
        const groupsMap = {};
        origSectionExams.forEach((sec) => {
          const parts = (sec.className || "").split(" - ");
          const base = parts[0]?.trim() || sec.className || "";

          if (!groupsMap[base]) {
            groupsMap[base] = {
              className: base,
              portionCandidate: sec.portion || "",
              sections: [],
            };
          }
          groupsMap[base].sections.push(sec);
          if (!groupsMap[base].portionCandidate && sec.portion) groupsMap[base].portionCandidate = sec.portion;
        });

        const groupedArr = Object.values(groupsMap).map((g) => ({
          className: g.className,
          portion: g.portionCandidate || "",
          sections: g.sections || [],
        }));

        setGroupedClassExams(groupedArr.length ? groupedArr : [{ className: "", portion: "", sections: [] }]);
      } catch (err) {
        console.error("Failed to fetch exam details or lists:", err);
        setResponse({ status: "Failed", message: "Failed to fetch exam details" });
      }
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  // Group UI handlers
  const addGroupedClassRow = () => {
    setGroupedClassExams((p) => [...p, { className: "", portion: "", sections: [] }]);
  };

  const removeGroupedClassRow = (index) => {
    setGroupedClassExams((p) => p.filter((_, i) => i !== index));
    setClassErrors((errs) => {
      const copy = { ...errs };
      delete copy[index];
      return copy;
    });
  };

  const handleGroupedChange = (groupIndex, field, value) => {
    setGroupedClassExams((prev) => {
      const updated = prev.map((g) => ({ ...g }));
      if (field === "className") {
        // duplicate group check
        const duplicateIndex = updated.findIndex((g, idx) => idx !== groupIndex && g.className === value);
        if (duplicateIndex !== -1 && value.trim() !== "") {
          setClassErrors((e) => ({ ...e, [groupIndex]: `${value} is already selected above.` }));
          updated[groupIndex].className = "";
          return updated;
        } else {
          setClassErrors((e) => {
            const copy = { ...e };
            delete copy[groupIndex];
            return copy;
          });
          updated[groupIndex].className = value;
          return updated;
        }
      }

      if (field === "portion") {
        updated[groupIndex].portion = value;
        return updated;
      }

      return updated;
    });
  };

  const expandGroupedToSections = (grouped) => {
    // for each grouped row, produce section-level entries with participants preserved
    const expanded = [];

    grouped.forEach((g) => {
      const groupName = (g.className || "").trim();
      if (!groupName) return;

      // find original sections that belonged to this group (so we can preserve their participants)
      const origSections = (originalSectionClassExams || []).filter((sec) =>
        (sec.className || "").startsWith(groupName + " -") || (sec.className || "") === groupName
      );

      if (origSections.length > 0) {
        // For each original section, keep existing participants and _id, but update portion to group's portion (if provided)
        origSections.forEach((sec) => {
          expanded.push({
            // preserve original _id if present so DB can tie it if you need (optional)
            _id: sec._id,
            className: sec.className,
            portion: g.portion !== undefined ? g.portion : sec.portion || "",
            participants: sec.participants ? sec.participants : [],
          });
        });
      } else {
        // No existing sections in this exam for this group -> expand using allClasses list
        const sectionsFromAll = (allClasses || []).filter((c) => c.class_name === groupName);
        if (sectionsFromAll.length > 0) {
          sectionsFromAll.forEach((sec) => {
            expanded.push({
              className: `${sec.class_name} - ${sec.section_name || ""}`.trim(),
              portion: g.portion || "",
              participants: [], // new
            });
          });
        } else {
          // fallback: keep group as-is (backend may expand), include portion
          expanded.push({
            className: groupName,
            portion: g.portion || "",
            participants: [],
          });
        }
      }
    });

    return expanded;
  };

  // Submit
  const handleSubmit = async () => {
    try {
      const expandedClassExams = expandGroupedToSections(groupedClassExams);

      const payload = {
        examName,
        examDate,
        registerBefore,
        examcenter,
        description,
        examBy: selectedExamBy ? [selectedExamBy] : [],
        classExams: expandedClassExams,
        teacherExam,
      };

      const res = await axios.put(`${URL}/endeavour-exams/update/${id}`, payload, {
        headers: { Authorization: token },
      });

      if (res.data.success) {
        setResponse({ status: "Success", message: "Exam updated successfully!" });
        setTimeout(() => navigate("/admin/endeavourexam"), 1500);
      } else {
        setResponse({ status: "Failed", message: res.data.message || "Failed to update exam" });
      }
    } catch (err) {
      console.error("Update endeavour exam error:", err);
      setResponse({ status: "Failed", message: err.response?.data?.message || "Something went wrong" });
    }
  };

  // Modal tags handling
  useEffect(() => {
    if (isModalOpen && examBys.length) {
      setAllExamByTags(examBys.map((e) => e.name));
    }
  }, [isModalOpen, examBys]);

  const handlegoback = () => navigate("/admin/endeavourexam");

  return (
    <>
      <div className="flex justify-start mt-6">
        <FaArrowLeft size={18} onClick={handlegoback} className="cursor-pointer" title="go back" />
      </div>

      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold">Edit Endeavour Exam</h1>
        </div>

        {/* Basic fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div>
            <div className="flex items-center justify-between">
              <label className="block mb-1 font-semibold text-gray-800">Exam By</label>
              <button type="button" onClick={() => setIsModalOpen(true)} className="block mb-1 font-semibold text-sm text-lavender--600">Add Exam By</button>
            </div>
            <select value={selectedExamBy} onChange={(e) => setSelectedExamBy(e.target.value)} className="border border-gray-300 text-gray-800 rounded-lg block w-full p-2.5">
              <option value="">-- Select Exam By --</option>
              {examBys.map((eb) => <option key={eb._id} value={eb._id}>{eb.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-800">Exam Name</label>
            <input type="text" value={examName} onChange={(e) => setExamName(e.target.value)} placeholder="Enter Exam Name" className="border border-gray-300 rounded-lg block w-full p-2.5" />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-800">Exam Date</label>
            <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="border border-gray-300 rounded-lg block w-full p-2.5" />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-800">Register Before</label>
            <input type="date" value={registerBefore} onChange={(e) => setRegisterBefore(e.target.value)} className="border border-gray-300 rounded-lg block w-full p-2.5" />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-800">Exam Center</label>
            <input type="text" value={examcenter} onChange={(e) => setExamCenter(e.target.value)} placeholder="Enter the exam center" className="border border-gray-300 rounded-lg block w-full p-2.5" />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-800">Exam Description</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter the exam description" className="border border-gray-300 rounded-lg block w-full p-2.5" />
          </div>
        </div>

        {/* Grouped Class Exams UI */}
        <div className="mt-4 space-y-6">
          {groupedClassExams.map((g, gi) => (
            <div key={gi} className="border rounded-lg p-4 bg-gray-50 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-5">
                  <label className="block mb-1 font-semibold text-gray-800">Select Class Group</label>
                  <select value={g.className} onChange={(e) => handleGroupedChange(gi, "className", e.target.value)} className={`border ${classErrors[gi] ? "border-red-500" : "border-gray-300"} rounded-lg block w-full p-2.5`}>
                    <option value="">-- Select Class Group --</option>
                    {classGroups.map((cg, idx) => <option key={idx} value={cg}>{cg}</option>)}
                  </select>
                  {classErrors[gi] && <p className="text-red-500 text-sm mt-1">{classErrors[gi]}</p>}
                </div>

                <div className="sm:col-span-6">
                  <label className="block mb-1 font-semibold text-gray-800">Exam Portion</label>
                  <textarea value={g.portion} onChange={(e) => handleGroupedChange(gi, "portion", e.target.value)} rows={1} className="border border-gray-300 rounded-lg block w-full p-2.5" />
                </div>

                <div className="sm:col-span-1 flex justify-end">
                  {gi === groupedClassExams.length - 1 ? (
                    <button onClick={() => {
                      const last = groupedClassExams[groupedClassExams.length - 1];
                      if (!last.className || !last.portion) return;
                      // prevent duplicate
                      if (groupedClassExams.some((x, idx) => idx !== gi && x.className === last.className)) return;
                      addGroupedClassRow();
                    }} className="mt-6 px-3 py-2 bg-lavender--600 text-white rounded-lg hover:bg-lavender--700">
                      <FaPlus />
                    </button>
                  ) : (
                    <button onClick={() => removeGroupedClassRow(gi)} className="mt-6 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                      <FaTrash />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Teacher exam portion */}
        <div className="mt-4">
          <div className="border rounded-lg p-4 bg-gray-50 shadow-sm">
            <h4 className="font-semibold mb-2">Teacher Exam Portion</h4>
            <textarea value={teacherExam} onChange={(e) => setTeacherExam(e.target.value)} rows={3} className="border border-gray-300 rounded-lg block w-full p-2.5" />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={handleSubmit} className="px-6 py-2 bg-lavender--600 text-white rounded-lg hover:bg-lavender--700">Save Exam</button>
        </div>
      </div>

      {/* Exam By modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
              <h2 className="text-lg font-semibold mb-3">Add Exam By</h2>

              <div className="flex flex-wrap gap-2 mb-3">
                {allExamByTags.map((tag, i) => (
                  <span key={i} className="flex items-center bg-gray-200 px-2 py-1 rounded-full text-sm">
                    {tag}
                    <button className="ml-2 text-gray-600" onClick={() => setAllExamByTags((p) => p.filter((_, idx) => idx !== i))}>✕</button>
                  </span>
                ))}
              </div>

              <input value={examByInput} onChange={(e) => setExamByInput(e.target.value)} onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === "Tab") && examByInput.trim()) {
                  e.preventDefault();
                  const newTag = examByInput.trim();
                  if (!allExamByTags.includes(newTag)) setAllExamByTags((p) => [...p, newTag]);
                  setExamByInput("");
                }
              }} placeholder="+ Add the Exam By" className="border border-gray-300 rounded-lg block w-full p-2.5 mb-4" />

              <div className="flex justify-end gap-2">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button onClick={async () => {
                  try {
                    const res = await axios.put(`${URL}/endeavour-exams/examby/update`, { names: allExamByTags }, { headers: { Authorization: token } });
                    setExamBys(res.data.examBys || []);
                    setAllExamByTags([]);
                    setExamByInput("");
                    setIsModalOpen(false);
                    setResponse({ status: "Success", message: "Exam By updated successfully!" });
                  } catch (err) {
                    console.error("Failed to update examBy:", err);
                    setResponse({ status: "Failed", message: err.response?.data?.message || "Failed to update Exam By" });
                  }
                }} className="px-4 py-2 bg-lavender--600 text-white rounded-lg">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}
    </>
  );
};
