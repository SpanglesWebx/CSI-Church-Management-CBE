

import React, { useEffect, useState } from "react";
import {
    FaPlus,
    FaUsers,
    FaChalkboardTeacher,
    FaCalendarAlt,
    FaSchool
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";

const StatCard = ({ title, value, icon, subtitle, loading }) => {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        if (loading) {
            setDisplay(0);
            return;
        }

        let start = 0;
        const end = Number(value) || 0;

        if (end === 0) {
            setDisplay(0);
            return;
        }

        const duration = 800;
        const interval = 20;
        const step = Math.ceil(end / (duration / interval));

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

    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 border-2 border-lavender--600">

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-lavender--600">
                    {title}
                </h3>

                <div className="text-2xl text-lavender--600 opacity-80">
                    {icon}
                </div>
            </div>

            {/* Value */}
            <div className="text-center">
                <div className="text-5xl font-bold text-lavender--600">
                    {loading ? 0 : display}
                </div>

                <p className="text-gray-600 text-sm mt-1">
                    {subtitle}
                </p>
            </div>

        </div>
    );
};

export const DashSundayschool = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    const [data, setData] = useState({
        totalStudents: 0,
        totalClasses: 0,
        totalTeachers: 0,
        eventsThisMonth: 0,
        announcements: {}
    });

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);

            const token = sessionStorage.getItem("token");

            const res = await axios.get(`${URL}/sundayschool/dashboard`, {
                headers: {
                    Authorization: token
                }
            });

            setData(res.data);
        } catch (err) {
            console.error("Dashboard error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-6  min-h-screen">

            {/* Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <StatCard
                    title="Students"
                    subtitle="Total Students"
                    value={data.totalStudents}
                    icon={<FaUsers />}
                    loading={loading}
                />

                <StatCard
                    title="Classes"
                    subtitle="Total Classes"
                    value={data.totalClasses}
                    icon={<FaSchool />}
                    loading={loading}
                />

                <StatCard
                    title="Events"
                    subtitle="Events This Month"
                    value={data.eventsThisMonth}
                    icon={<FaCalendarAlt />}
                    loading={loading}
                />

                <StatCard
                    title="Teachers"
                    subtitle="Total Teachers"
                    value={data.totalTeachers}
                    icon={<FaChalkboardTeacher />}
                    loading={loading}
                />

            </div>

            {/* Bottom Section */}
            <div className="grid lg:grid-cols-3 gap-4 mt-6">

                {/* Announcements */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-5 border-2 border-lavender--600">

                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Announcements
                    </h3>

                    {data?.announcements?.exam && (
                        <div className="border-l-4 border-lavender--600 bg-gray-50 p-3 rounded mb-3">
                            <p className="text-sm text-gray-500">Recent Exam</p>
                            <p className="font-semibold text-gray-800">
                                {data.announcements.exam.examName}
                            </p>
                        </div>
                    )}

                    {data?.announcements?.event && (
                        <div className="border-l-4 border-green-500 bg-gray-50 p-3 rounded">
                            <p className="text-sm text-gray-500">Recent Event</p>
                            <p className="font-semibold text-gray-800">
                                {data.announcements.event.eventName}
                            </p>
                        </div>
                    )}

                    {!data?.announcements?.exam &&
                        !data?.announcements?.event && (
                            <p className="text-gray-400 text-sm">
                                No announcements yet
                            </p>
                        )}

                </div>

                {/* Quick Links */}
                <div className="bg-white rounded-2xl shadow-sm p-5 border-2 border-lavender--600">

                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Quick Links
                    </h3>

                    <div className="grid gap-2">

                        <button
                            onClick={() => navigate("/admin/class")}
                            className="flex items-center justify-center gap-2 bg-lavender--600 hover:bg-lavender--700 text-white py-2 rounded-lg text-sm font-medium transition"
                        >
                            <FaSchool /> Add Class
                        </button>

                        <button
                            onClick={() => navigate("/admin/teacher")}
                            className="flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-100 py-2 rounded-lg text-sm"
                        >
                            <FaChalkboardTeacher /> View Teachers
                        </button>

                        <button
                            onClick={() => navigate("/admin/student")}
                            className="flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-100 py-2 rounded-lg text-sm"
                        >
                            <FaUsers /> Add Student
                        </button>

                        <button
                            onClick={() => navigate("/admin/event")}
                            className="flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-100 py-2 rounded-lg text-sm"
                        >
                            <FaCalendarAlt /> Add Event
                        </button>

                        <button
                            onClick={() => navigate("/admin/sunday-attendance")}
                            className="flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-100 py-2 rounded-lg text-sm"
                        >
                            <FaPlus /> Add Attendance
                        </button>

                    </div>

                </div>

            </div>
        </div>
    );
};