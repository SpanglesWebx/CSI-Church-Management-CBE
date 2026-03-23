import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FaEye } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

const URL = import.meta.env.VITE_BACKEND_API_URL;

const tableHeading = [
  "Sl. No.",
  "Student ID",
  "Student Name",
  "Student Phone",
  "Total Due",
  "Action",
]; 

export const EndevaourAucReportforTeach = () => {
  const [dues, setDues] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [teacherId, setTeacherId] = useState(null);

  const token = window.sessionStorage.getItem("token");

  // 🔑 decode token to extract teacherId
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded);
        setTeacherId(decoded.member_id);
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, [token]);

  // fetch student dues 
  useEffect(() => {
    const fetchDues = async () => {
      if (!token || !teacherId) return;

      try {
        const res = await axios.get(
          `${URL}/endeavour-auctions/report/student-dues/teacher/${teacherId}`,
          {
            headers: { Authorization: token },
          }
        );

        setDues(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching student dues:", err);
        setDues([]);
      }
    };
    fetchDues();
  }, [token, teacherId]);

  const handleView = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedStudent(null);
    setIsModalOpen(false);
  };

  return (
    <div className="relative h-auto w-full bg-gray-100">
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">
          Auction Dues - My Students
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                {tableHeading.map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2 border-b text-gray-700 text-center"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dues.length === 0 ? (
                <tr>
                  <td
                    colSpan={tableHeading.length}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                dues.map((student, si) => (
                  <tr key={si}>
                    <td className="px-4 py-2 text-center">{si + 1}</td>
                    <td className="px-4 py-2 text-center">
                      {student.buyerId}
                    </td>
                    <td className="px-4 py-2">{student.buyerName}</td>
                    <td className="px-4 py-2 text-center">
                      {student.buyerPhone}
                    </td>
                    <td
                      className={`px-4 py-2 text-center font-semibold ${
                        student.totalDue > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      ₹{Number(student.totalDue || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <FaEye
                        className="cursor-pointer mx-auto text-lavender--600 hover:text-lavender--600"
                        onClick={() => handleView(student)}
                        title="View"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && selectedStudent && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={`Dues - ${selectedStudent.buyerName} ${
            selectedStudent.buyerId ? `(${selectedStudent.buyerId})` : ""
          }`}
        >
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {/* Student Info */}
            <div className="bg-gray-50 border rounded-lg text-[20px] p-4 mb-4 flex flex-wrap items-center space-x-6">
              <p>
                <span className="font-semibold">Student:</span>{" "}
                {selectedStudent.buyerName}
              </p>
              <p>
                <span className="font-semibold">Phone:</span>{" "}
                {selectedStudent.buyerPhone}
              </p>
              <p className="font-semibold">
                Due Amount:{" "}
                <span className="text-red-600 font-bold">
                  ₹ {selectedStudent.totalDue}
                </span>
              </p>
            </div>

            {/* Dues Table */}
            <table className="w-full border mb-6">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Item</th>
                  <th className="p-2 border">Seller</th>
                  <th className="p-2 border text-right">Balance Due</th>
                </tr>
              </thead>
              <tbody>
                {selectedStudent.dues.map((d) => (
                  <tr key={d.auctionId} className="hover:bg-gray-50">
                    <td className="p-2 border">
                      {new Date(d.date).toLocaleDateString()}
                    </td>
                    <td className="p-2 border">{d.item}</td>
                    <td className="p-2 border">
                      {d.sellerName} ({d.sellerId})
                    </td>
                    <td className="p-2 border text-right text-red-600">
                      ₹{d.balance}
                    </td>
                  </tr>
                ))}
                <tr className="font-bold bg-gray-50">
                  <td colSpan="3" className="p-2 border text-right">
                    Totals
                  </td>
                  <td className="p-2 border text-right">
                    ₹
                    {selectedStudent.dues.reduce(
                      (sum, d) => sum + d.balance,
                      0
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  );
};
