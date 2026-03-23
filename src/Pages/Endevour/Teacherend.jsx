import React, { useEffect, useState } from "react";
import axios from "axios";
import { URL } from "../../App";

export const Teacherend = () => {
  const [teachers, setTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const token = window.sessionStorage.getItem("token");

const fetchTeachers = async (page = 1, query = "") => {
  try {
    const res = await axios.get(`${URL}/endeavour-classes/teachers/details`, {
      headers: { Authorization: token },
      params: { page, limit: 10, search: query },
    });
    setTeachers(res.data.teachers || []);
    setTotalPages(res.data.totalPages || 1);
    setCurrentPage(res.data.page || 1);
  } catch (err) {
    console.error("Error fetching endeavour teachers:", err);
    setTeachers([]);
  }
};

// Fetch whenever page or searchQuery changes
useEffect(() => {
  fetchTeachers(CurrentPage, searchQuery);
}, [CurrentPage, searchQuery]);


  const filteredTeachers = teachers.filter(
    (t) =>
      t.teacher_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.teacher_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
      {/* 🔎 Search bar */}
      <div className="flex flex-col items-center justify-between lg:flex-row">
        <h3>Teachers</h3>
        <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
          <div className="relative">
            <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
              <svg
                className="w-3 h-3 text-gray-500"
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
              id="teacher-search"
              className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
              placeholder="Search..."
              value={searchQuery}
  onChange={(e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // reset to first page on search
  }}
            />
          </div>
        </div>
      </div>

      {/* 📋 Table */}
      <div className="overflow-x-auto mt-8">
        <table className="w-full text-sm text-left text-gray-500 rtl:text-right">
          <thead className="text-base text-gray-700 bg-white text-center">
            <tr>
              <th className="p-2 text-center">Sl No</th>
              <th className="p-2 text-center">Teacher ID</th>
              <th className="p-2 text-center">Teacher Name</th>
              <th className="p-2 text-center">Mobile Number</th>
              <th className="p-2 text-center">Class</th>
              <th className="p-2 text-center">Section</th>
            </tr>
          </thead>
          <tbody>
  {filteredTeachers.length === 0 ? (
    <tr>
      <td colSpan={6} className="p-4 text-center text-gray-500">
        No data found
      </td>
    </tr>
  ) : (
    filteredTeachers.map((t, idx) => (
      <tr key={t.class_id} className="bg-white border-b text-center">
        <td className="p-2">{(CurrentPage - 1) * 10 + idx + 1}</td>
        <td className="p-2">{t.teacher_id}</td>
        <td className="p-2">{t.teacher_name}</td>
        <td className="p-2">{t.mobile_number || "-"}</td>
        <td className="p-2">{t.class_name}</td>
        <td className="p-2">{t.section_name}</td>
      </tr>
    ))
  )}
</tbody>

        </table>
      </div>

      {/* 📑 Pagination */}
      <div className="relative flex flex-wrap items-center justify-center mt-4 space-x-3 select-none">
        <button
          onClick={() => setCurrentPage(CurrentPage - 1)}
          disabled={CurrentPage === 1}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          className={`px-4 py-2 rounded ${
            CurrentPage
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
        <div className="absolute flex px-3 space-x-2 rounded right-10">
          <span className="px-4 py-2 text-center text-gray-700 bg-gray-100 rounded">
            Total Page: <span>{TotalPages}</span>
          </span>
          <span
            onClick={() => setCurrentPage(TotalPages)}
            className={`${
              TotalPages === CurrentPage
                ? "disabled opacity-50 bg-gray-100 px-4 py-2 cursor-not-allowed"
                : "px-4 py-2 text-blue-400 bg-gray-100 rounded active:text-blue-800 hover:cursor-pointer"
            }`}
          >
            Last Page
          </span>
        </div>
      </div>
    </div>
  );
};
