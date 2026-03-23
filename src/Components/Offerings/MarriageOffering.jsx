import React, { useState } from "react";
import { IoIosEye } from "react-icons/io";
import Spinners from "../Spinners";
import Pagination from "../Helpers/Pagination";
import moment from "moment";
import DetailModal from "../Expense/detailsModal";
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';


export default function OfferingTable({ offerings, loading, Data,CurrentPage, showTamilOnly}) {
  
  console.log(offerings);
const tableHeading = [
  "SI.No.",
  !Data ? "Member ID" : null,
  !showTamilOnly ? (!Data ? "Member Name" : "Name") : null, // hide if Tamil-only
  "Member Tamil Name",
  !showTamilOnly ? "Member Wife" : null,                    // hide if Tamil-only
  "Member Wife Tamil Name",
  "Date",
  "Amount",
].filter(Boolean);
 // Removes nulls
 // Filter out any null values

console.log(tableHeading);

  const [itemsPerPage, setitemsPerPage] = useState(15);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  // const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(3);
  

  const handlePageChange = (page) => {
    // setCurrentPage(page);
  };

  // Function to handle click on eye icon
  const handleShowDetails = (member) => {
    setSelectedMember(member); // Set the selected member for the modal
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  function truncateWords(text, numWords) {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= numWords) return text;
    return words.slice(0, numWords).join(" ") + "...";
  }

  if (loading) {
    return <Spinners />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full mt-8">
        <thead className="">
          <tr>
  {tableHeading.map((heading) => (
    <th className="p-2 font-bold text-center" key={heading}>
      {heading}
    </th>
  ))}
</tr>

        </thead>
        <tbody>
          {offerings?.length > 0 ? (
            offerings?.map((member, index) => (
              <tr
                key={member._id}
                className="border-t border-gray-200 cursor-pointer"
                onClick={() => handleShowDetails(member)}
              >
                <td className="p-2 py-3 text-center text-gray-700">
                {((CurrentPage - 1) * itemsPerPage) + (index + 1)}
                </td>
                <td className={`p-2 text-gray-700 text-center ${Data ? 'hidden' : ''}`}>
                  {member.member_id}
                </td>
                {!showTamilOnly && (
                <td className="p-2 text-left text-gray-700">
                {member.member_name}
                </td>
                )}
                <td className="p-2 text-left text-gray-700">
                  {member.member_tamil_name} {/* Display Tamil name in table */}
                </td>
                {!showTamilOnly && (
                    <td className="px-4 py-4 text-sm">{member.member_wife}</td>
                  )}
                <td className="p-2 text-left text-gray-700">
                  {member.member_wife_tamil_name} {/* NEW: Display wife's Tamil name in table */}
                </td>
                <td className="p-2 text-center text-gray-700">
                  {moment(new Date(member?.date)).format("DD-MM-YYYY")}
                </td>
                <td className="p-2 text-center text-gray-700">{member.amount}</td>
                {/* {member?.description ? (
                  <td className="p-2 text-left text-gray-700">
                    {truncateWords(member.description, 3)}
                  </td>
                ) : (
                  <td className="p-2 text-left text-gray-700">Nil</td>
                )} */}
              </tr>
            ))
          ) : (
            <tr>
              <td
                className="p-2 text-center text-gray-700"
                colSpan={tableHeading.length}
              >
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <DetailModal isOpen={isModalOpen} onClose={handleCloseModal}>
        {isLoading ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 animate-pulse">
              <span className="w-20 h-6 font-medium break-words bg-gray-300 rounded"></span>
              <span className="w-40 h-6 text-gray-600 break-words bg-gray-300 rounded"></span>
            </div>
            <div className="grid grid-cols-2 animate-pulse">
              <span className="w-20 h-6 break-words bg-gray-300 rounded"></span>
              <span className="w-40 h-6 text-gray-600 break-words bg-gray-300 rounded"></span>
            </div>
            <div className="grid grid-cols-2 animate-pulse">
              <span className="w-20 h-6 break-words bg-gray-300 rounded"></span>
              <span className="w-40 h-6 text-gray-600 break-words bg-gray-300 rounded"></span>
            </div>
            <div className="grid grid-cols-2 animate-pulse">
              <span className="w-20 h-6 break-words bg-gray-300 rounded"></span>
              <span className="w-40 h-6 text-gray-600 break-words bg-gray-300 rounded"></span>
            </div>
            <div className="w-full h-48 bg-gray-300 rounded animate-pulse"></div>
          </div>
        ) : selectedMember ? (
          <div className="flex flex-col gap-4">
            {/* Display Member ID if available and not in "Data" mode */}
            {!Data && selectedMember.member_id && (
              <div className="grid grid-cols-2">
                <span className="font-medium break-words">Member ID</span>
                <span className="text-gray-600 break-words">
                  {selectedMember.member_id}
                </span>
              </div>
            )}
            {/* Display Member Name */}
            <div className="grid grid-cols-2">
              <span className="font-medium break-words">Member Name</span>
              <span className="text-gray-600 break-words">
                {selectedMember.member_name}
              </span>
            </div>
            {/* Display Member Tamil Name */}
            {selectedMember.member_tamil_name && (
              <div className="grid grid-cols-2">
                <span className="font-medium break-words">Member Tamil Name</span>
                <span className="text-gray-600 break-words">
                  {selectedMember.member_tamil_name}
                </span>
              </div>
            )}
            {/* Display Spouse Name (Wife) and her Tamil Name */}
            {selectedMember.member_wife && ( 
              <div className="grid grid-cols-2">
                <span className="font-medium break-words">Spouse Name</span>
                <span className="text-gray-600 break-words">
                  {selectedMember.member_wife}
                  {selectedMember.member_wife_tamil_name && ` (${selectedMember.member_wife_tamil_name})`}
                </span>
              </div>
            )}
            <div className="grid grid-cols-2">
              <span className="font-medium break-words">Date</span>
              <span className="text-gray-600 break-words">
                {moment(new Date(selectedMember?.date)).format("DD-MM-YYYY")}
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
            {/* {selectedMember.image && (
              <ImageRenderer imageBuffer={selectedMember.image} />
            )} */}
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <p>No details available</p>
          </div>
        )}
      </DetailModal>
    </div>
  );
}
