

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { URL } from "../../App";
import { FaArrowLeft } from "react-icons/fa";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";

export const ViewSundayExam = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const token = window.sessionStorage.getItem("token");

  const [selectedExam, setSelectedExam] = useState(null);
  const [Response, setResponse] = useState({ status: null, message: "" });

  const [editingMarksClass, setEditingMarksClass] = useState(null);
  const [marksDraftByClass, setMarksDraftByClass] = useState({});

  useEffect(() => {

    const fetchExam = async () => {
      try {

        const res = await axios.get(
          `${URL}/sundayschool-exams/${id}`,
          { headers: { Authorization: token } }
        );

        setSelectedExam(res.data.exam);

      } catch (err) {

        setResponse({
          status: "Failed",
          message: "Failed to load exam"
        });

      }
    };

    fetchExam();

  }, [id]);

  const getParticipantsForClass = (exam, className) => {
    const cls = (exam?.classExams || []).find(c => c.className === className);
    return cls?.participants || [];
  };

  const handleEditMarksToggle = (cls) => {

    const draft = (cls.participants || []).map(s => ({
      member_id: s.member_id,
      member_name: s.member_name,
      class_name: s.class_name,
      section_name: s.section_name,
      marks: s.marks ?? "",
    }));

    setMarksDraftByClass(prev => ({
      ...prev,
      [cls.className]: draft
    }));

    setEditingMarksClass(cls.className);

  };

  const handleDraftMarkChange = (className, idx, value) => {

    setMarksDraftByClass(prev => {

      const copy = { ...prev };
      const arr = [...(copy[className] || [])];

      arr[idx] = { ...arr[idx], marks: value };

      copy[className] = arr;

      return copy;

    });

  };

  const saveEditedMarks = async (className) => {

    try {

      if (!selectedExam) {
        setResponse({ status: "Failed", message: "Select exam first." });
        return;
      }

      const marksData = (marksDraftByClass[className] || []).map(m => ({
        member_id: m.member_id,
        marks: m.marks === "" ? null : Number(m.marks),
      }));

      const payload = {
        examId: selectedExam._id,
        className,
        marksData,
      };

      const classExam = selectedExam.classExams.find(c => c.className === className);

      const hasMarks = classExam?.participants?.some(
        p => p.marks !== null && p.marks !== undefined
      );

      const endpoint = hasMarks ? "update-marks" : "add-marks";

      const res = await axios({
        method: hasMarks ? "put" : "post",
        url: `${URL}/sundayschool-exams/${endpoint}`,
        data: payload,
        headers: { Authorization: token },
      });

      const refreshed = await axios.get(
        `${URL}/sundayschool-exams/${id}`,
        { headers: { Authorization: token } }
      );

      setSelectedExam(refreshed.data.exam);

      setEditingMarksClass(null);

      setResponse({
        status: "Success",
        message: res.data.message || "Marks saved."
      });

    } catch (err) {

      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Failed to save marks"
      });

    }

  };

  if (!selectedExam) {
    return <p className="p-4">Loading...</p>;
  }

  return (
    <>

    
          <FaArrowLeft
            size={18}
            className="cursor-pointer"
            onClick={() => navigate("/admin/exam")}
          />
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">

        <div className="flex items-center gap-3 mb-4">


          <h3 className="font-semibold">View Exam Details</h3>

        </div>

        <div className="text-sm text-gray-700 space-y-4">

          {[
            { label: "Exam By", value: selectedExam.examBy?.[0]?.name || "-" },
            { label: "Exam Name", value: selectedExam.examName },
            { label: "Exam Date", value: selectedExam.examDate ? new Date(selectedExam.examDate).toLocaleDateString() : "-" },
            { label: "Register Before", value: selectedExam.registerBefore ? new Date(selectedExam.registerBefore).toLocaleDateString() : "-" },
            { label: "Center", value: selectedExam.examcenter || "-" },
            { label: "Description", value: selectedExam.description || "-" },
            { label: "Teacher Portion", value: selectedExam.teacherExam || "-" },
          ].map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 py-1">
              <div className="col-span-12 sm:col-span-4 font-semibold">{item.label}</div>
              <div className="col-span-12 sm:col-span-8">{item.value}</div>
            </div>
          ))}

          <h5 className="font-semibold">Teacher Details</h5>

          <div className="mt-3 border p-3 rounded">

            {selectedExam?.teacherDetails?.length > 0 ? (

              <table className="w-full text-sm border border-gray-300 mt-2 table-fixed">

                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border text-center w-20">Sl No.</th>
                    <th className="p-2 border text-center w-1/2">Teacher Name</th>
                    <th className="p-2 border text-center w-1/4">Teacher ID</th>
                    <th className="p-2 border text-center w-1/4">Class</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedExam.teacherDetails.map((td, i) => (
                    <tr key={td._id || i}>
                      <td className="p-2 border text-center">{i + 1}</td>
                      <td className="p-2 border">{td.teacherName}</td>
                      <td className="p-2 border text-center">{td.teacherId}</td>
                      <td className="p-2 border">{td.className}</td>
                    </tr>
                  ))}
                </tbody>

              </table>

            ) : (
              <p className="text-gray-500 italic mt-2">No teacher details available.</p>
            )}

          </div>

          <div>

            <h5 className="font-semibold mt-4">Class Exams & Participants</h5>

            {(selectedExam?.classExams || []).map((cls, idx) => {

              const participants = getParticipantsForClass(selectedExam, cls.className);

              return (

                <div key={cls._id || idx} className="mt-3 border p-3 rounded">

                  <div className="flex items-start justify-between mb-2">

                    <p className="font-medium">
                      {cls.className}
                      <span className="text-sm text-gray-500"> — {cls.portion}</span>
                    </p>

                    {participants.length > 0 && (

                      <div className="flex items-center gap-2">

                        {cls.participants?.some(p => p.marks != null) && (
                          <button
                            className="px-2 py-1 border rounded text-sm text-white bg-lavender--600"
                            onClick={() => handleEditMarksToggle(cls)}
                            title="Edit Marks"
                          >
                            Edit Marks
                          </button>
                        )}

                      </div>

                    )}

                  </div>

                  {participants.length > 0 ? (

                    <table className="w-full text-sm border border-gray-300 table-fixed">

                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 border text-center w-20">Sl No.</th>
                          <th className="p-2 border text-left w-1/2">Student Name</th>
                          <th className="p-2 border text-center w-1/4">Student ID</th>
                          <th className="p-2 border text-center w-1/4">Marks</th>
                        </tr>
                      </thead>

                      <tbody>

                        {participants.map((p, i) => {

                          const isEditingThisClass = editingMarksClass === cls.className;

                          const draft = (marksDraftByClass[cls.className] || [])[i];

                          return (

                            <tr key={p._id || p.member_id || i}>

                              <td className="p-2 border text-center">{i + 1}</td>

                              <td className="p-2 border">{p.member_name}</td>

                              <td className="p-2 border text-center">{p.member_id}</td>

                              <td className="p-2 border text-center">

                                {isEditingThisClass ? (

                                  <input
                                    type="number"
                                    min={0}
                                    className="border rounded px-2 py-1 w-20 text-center"
                                    value={draft?.marks ?? ""}
                                    onChange={(e) =>
                                      handleDraftMarkChange(cls.className, i, e.target.value)
                                    }
                                  />

                                ) : (
                                  p.marks !== null && p.marks !== undefined ? p.marks : "-"
                                )}

                              </td>

                            </tr>

                          );

                        })}

                      </tbody>

                    </table>

                  ) : (

                    <p className="text-gray-500 italic">
                      No participants added yet for this class.
                    </p>

                  )}

                  {editingMarksClass === cls.className && (

                    <div className="flex justify-end gap-2 mt-3">

                      <button
                        className="px-3 py-1 border rounded text-sm bg-white"
                        onClick={() => setEditingMarksClass(null)}
                      >
                        Cancel
                      </button>

                      <button
                        className="px-3 py-1 bg-lavender--600 text-white rounded text-sm"
                        onClick={() => saveEditedMarks(cls.className)}
                      >
                        Save Marks
                      </button>

                    </div>

                  )}

                </div>

              );

            })}

          </div>

        </div>

      </div>

      {Response.status && (
        Response.status === "Success"
          ? <SuccessMessage Message={Response.message} />
          : <FailedMessage Message={Response.message} />
      )}
    </>
  );
};