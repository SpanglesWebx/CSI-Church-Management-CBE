import React, { useState } from "react";
import { IoIosEye } from "react-icons/io";
import Spinners from "../Spinners";
import DetailModal from "./detailsModal";
import Pagination from "../Helpers/Pagination";
import moment from "moment";
import axios from "axios";
import { URL } from "../../App";
import { useNavigate } from "react-router-dom";

const tableHeading = ["Sl. no.", "Date", "Category", "Amount", "Action"];

export default function ExpenseTable({ expenses, loading ,CurrentPage }) {
  const token = window.sessionStorage.getItem("token");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const naviagte = useNavigate()
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleShowDetails = async (member) => {
    console.log("member:",member)
    try {
      setIsModalOpen(true);
      setIsLoading(true); // Set loading to true when fetching starts
      const response = await axios.get(`${URL}/expense/${member._id}`, {
        headers: {
          Authorization: token,
        },
      });
      setSelectedMember(response.data);
    } catch (error) {
      console.error("Error fetching expense details:", error);
      if (error.response.status === 401) {
        window.sessionStorage.clear();
        naviagte("/");
      }
    } finally {
      setIsLoading(false); // Ensure loading is set to false when fetching ends or on error
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const bufferToBase64 = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const ImageRenderer = ({ imageBuffer }) => {
    const base64String = bufferToBase64(imageBuffer.data);
    const imageSrc = `data:image/jpeg;base64,${base64String}`;

    return (
      <img src={imageSrc} alt="Auto charge" className="w-[90%] h-[230px]" />
    );
  };

  if (loading) {
    return <Spinners />;
  }

  return (
    <div className="overflow-x-auto">
      {expenses?.length === 0 ? (
        <div className="flex items-center justify-center">
          <p>No results found</p>
        </div>
      ) : (
        <>
          <table className="min-w-full mt-8">
            <thead>
              <tr>
                {tableHeading?.map((heading) => (
                  <th className="p-2 font-bold text-left" key={heading}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses &&
                expenses.map((member, index) => (
                  <tr key={member._id} className="border-t border-gray-200">
                  
                      <td className="p-2 text-gray-600 text-left">
                       {((CurrentPage - 1) * 15) + (index + 1)}
                      </td>

                    <td className="p-2 text-gray-600 text-left">
                      {moment(new Date(member?.date)).format("DD-MM-YYYY")}
                    </td>
                    <td className="p-2 text-gray-600 text-left">
                      {member.category}
                    </td>
                    <td className="p-2 text-gray-600 text-left">
                      {member.amount}
                    </td>
                    <td className="p-2">
                      <button
                        className="text-lavender--600 bg-lavender--600 p-2 rounded-md"
                        onClick={() => handleShowDetails(member)}
                      >
                        <IoIosEye />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          <DetailModal isOpen={isModalOpen} onClose={handleCloseModal}>
            {isLoading ? (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 animate-pulse">
                  <span className="font-medium break-words bg-gray-300 h-6 w-20 rounded"></span>
                  <span className="text-gray-600 break-words bg-gray-300 h-6 w-40 rounded"></span>
                </div>
                <div className="grid grid-cols-2 animate-pulse">
                  <span className="break-words bg-gray-300 h-6 w-20 rounded"></span>
                  <span className="text-gray-600 break-words bg-gray-300 h-6 w-40 rounded"></span>
                </div>
                <div className="grid grid-cols-2 animate-pulse">
                  <span className="break-words bg-gray-300 h-6 w-20 rounded"></span>
                  <span className="text-gray-600 break-words bg-gray-300 h-6 w-40 rounded"></span>
                </div>
                <div className="grid grid-cols-2 animate-pulse">
                  <span className="break-words bg-gray-300 h-6 w-20 rounded"></span>
                  <span className="text-gray-600 break-words bg-gray-300 h-6 w-40 rounded"></span>
                </div>
                <div className="animate-pulse bg-gray-300 h-48 w-full rounded"></div>
              </div>
            ) : selectedMember ? (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2">
                  <span className="font-medium break-words">Date</span>
                  <span className="text-gray-600 break-words">
                    {moment(new Date(selectedMember?.date)).format(
                      "DD-MM-YYYY"
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="break-words">Category</span>
                  <span className="text-gray-600 break-words">
                    {selectedMember.category}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="break-words">Amount</span>
                  <span className="text-gray-600 break-words">
                    ₹ {selectedMember.amount}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="break-words">Description</span>
                  <span className="text-gray-600 break-words">
                    {selectedMember.description}
                  </span>
                </div>
                {selectedMember.image && (
                 <img src={` ${URL}${selectedMember.image}`} alt={selectedMember.image} className="w-[90%] h-[230px]" />
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <p>No details available</p>
              </div>
            )}
          </DetailModal>
        </>
      )}
    </div>
  );
}
