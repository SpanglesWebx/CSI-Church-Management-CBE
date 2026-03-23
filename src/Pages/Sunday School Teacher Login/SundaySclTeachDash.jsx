import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaSchool,
  FaCalendarAlt,
  FaClipboardCheck,
  FaUserCheck,
  FaUserTimes
} from "react-icons/fa";
import axios from "axios";
import moment from "moment";
import { URL } from "../../App";

/* Stat Card reused */


const StatCard = ({ title, value, icon, loading, onIconClick, color }) => {

  const [display, setDisplay] = useState(0);

  const isNumber = typeof value === "number";

  useEffect(() => {

    if (loading) {
      setDisplay(0);
      return;
    }

    if (!isNumber) return;

    let start = 0;
    const end = Number(value);

    if (end === 0) {
      setDisplay(0);
      return;
    }

    const duration = 800;
    const interval = 20;
    const steps = duration / interval;
    const step = Math.ceil(end / steps);

    const counter = setInterval(() => {

      start += step;

      if (start >= end) {
        setDisplay(end);
        clearInterval(counter);
      } else {
        setDisplay(start);
      }

    }, interval);

    return () => clearInterval(counter);

  }, [value, loading]);


  const styles = {
    default: {
      border: "border-lavender--600",
      title: "text-lavender--600",
      text: "text-lavender--600",
      spinner: "border-t-lavender--600"
    },
    green: {
      // border: "border-lavender--600",
      // title: "text-lavender--600",
      border: "border-green-400",
      title: "text-green-400",

      text: "text-green-400",
      spinner: "border-t-green-400"
    },
    red: {
      border: "border-red-500",
      title: "text-red-500",
      text: "text-red-500",
      spinner: "border-t-red-500"
    }
  };

  const theme = styles[color] || styles.default;

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-6 border-2 ${theme.border}`}>

      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${theme.title}`}>
          {title}
        </h3>

        <div
          onClick={onIconClick}
          className={`text-2xl ${theme.text} cursor-pointer`}
        >
          {icon}
        </div>
      </div>

      <div className="text-center">

        {loading ? (
          <div className="flex justify-center">
            <div className={`h-8 w-8 border-4 border-gray-200 ${theme.spinner} rounded-full animate-spin`} />
          </div>
        ) : (
          <div className={`text-4xl font-bold ${theme.text}`}>
            {isNumber ? display : value}
          </div>
        )}

      </div>

    </div>
  );
};


export const SundaySclTeachDash = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    class: { class_name: "", section_name: "" },
    totalStudents: 0,
    attendance: { marked: false, present: 0, absent: 0 },
    events: [],
    exams: []
  });

  const [loading, setLoading] = useState(true);

  const token = sessionStorage.getItem("token");

  useEffect(() => {

    if (!token) {
      setLoading(false);
      return;
    }

    const payload = JSON.parse(atob(token.split(".")[1]));
    const teacherId = encodeURIComponent(payload.member_id);

    fetchDashboard(teacherId);

  }, []);

  const fetchDashboard = async (teacherId) => {
    try {

      const res = await axios.get(
        `${URL}/sundayschool/dashboard/teacher?teacherId=${teacherId}`,
        {
          headers: { Authorization: token }
        }
      );

      setData(res.data);

    } catch (err) {

      console.error("Teacher dashboard error:", err);

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="p-4 md:p-6 min-h-screen space-y-6">

      {/* ROW 1 */}
      <div className="grid gap-4 sm:grid-cols-2">

        <StatCard
          value={`${data.class.class_name} - ${data.class.section_name}`}
          title="Class"
          icon={<FaSchool />}
          loading={loading}
        />

        <StatCard
          title="Students"
          value={data.totalStudents}
          icon={<FaUsers title="View Students"/>}
          onIconClick={() => navigate("/admin/sundayschoolstudents")}
          loading={loading}
        />

      </div>


      {/* ROW 2 ATTENDANCE */}
      <div className="bg-white rounded-2xl shadow-sm p-5 border-2 border-lavender--600">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold mb-4 text-lavender--600">
            Today Attendance
          </h3>


          <FaClipboardCheck
          title="View Attendance"
            onClick={() => navigate("/admin/sundayschoolofferingsandattendance")}
            className="text-2xl text-lavender--600 cursor-pointer hover:scale-110 transition"
          />

        </div>

        {!data.attendance.marked && !loading && (
          <div className="flex items-center gap-2 text-red-600 font-medium">
            <FaClipboardCheck />
            Attendance Not Marked
          </div>
        )}

        {data.attendance.marked && (

          <div className="grid md:grid-cols-3 gap-4">

            <StatCard
              title="Attendance"
              value="Marked"
              icon={<FaClipboardCheck />}
              loading={loading}
            />

            <StatCard
              key={data.attendance.present}
              title="Present"
              value={Number(data.attendance.present)}
              icon={<FaUserCheck />}
              loading={loading}
              color="green"
            />

            <StatCard
              key={data.attendance.absent}
              title="Absent"
              value={Number(data.attendance.absent)}
              icon={<FaUserTimes />}
              loading={loading}
              color="red"
            />

          </div>

        )}

      </div>

      {/* ROW 3 */}

      <div className="grid lg:grid-cols-2 gap-4">

        {/* EVENTS */}
        <div className="bg-white rounded-2xl shadow-sm p-5 border-2 border-lavender--600">

          <h3 className="text-lg font-semibold text-lavender--600 mb-4">
            Recent Events
          </h3>

          {data.events.length === 0 && (
            <p className="text-gray-400 text-sm">
              No events available
            </p>
          )}

          {data.events.map(event => (
            <div
              key={event._id}
              onClick={() => navigate(`/admin/sundayschoolevent/view/${event._id}`)}
              className="border-l-4 border-green-500 bg-gray-50 p-4 rounded mb-3 cursor-pointer hover:shadow-md hover:scale-[1.02] transition"
            >

              <p className="font-semibold text-gray-800">
                {event.eventName}
              </p>

              <p className="text-sm text-gray-600 mt-1">
                {moment(event.eventDate).format("DD MMM YYYY")}
              </p>

            </div>
          ))}

        </div>


        {/* EXAMS */}
        <div className="bg-white rounded-2xl shadow-sm p-5 border-2 border-lavender--600">

          <h3 className="text-lg font-semibold text-lavender--600 mb-4">
            Recent Exams
          </h3>

          {data.exams.length === 0 && (
            <p className="text-gray-400 text-sm">
              No exams available
            </p>
          )}

          {data.exams.map(exam => (
            <div
              key={exam._id}
              onClick={() => navigate(`/admin/sundayschoolexam/${exam._id}`)}
              className="border-l-4 border-green-500 bg-gray-50 p-4 rounded mb-3 cursor-pointer hover:shadow-md hover:scale-[1.02] transition"
            >

              <p className="font-semibold text-gray-800">
                {exam.examName}
              </p>

              <p className="text-sm text-gray-600 mt-1">
                {moment(exam.examDate).format("DD MMM YYYY")}
              </p>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
};



