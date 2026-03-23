import React from "react";
import { IoIosClose } from "react-icons/io";
import { FiDownload } from "react-icons/fi";

const AgeFilterModal = ({
  isOpen,
  onClose,
  title,
  ageFrom,
  ageTo,
  ageMode, 
  members,
  onDownload,
  isDownloading,   // ✅ NEW
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-[1500px] p-4 bg-white rounded-lg shadow dark:bg-gray-700">

        {/* ---------- HEADER (same frame as SubscriptionModal) ---------- */}
        <div className="flex items-center justify-between px-4 rounded-t dark:border-gray-600">
          <span className="text-lavender--600 font-semibold">{title}</span>
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            onClick={onClose}
            disabled={isDownloading}
          >
            <IoIosClose className="w-5 h-5 border rounded-full text-red-500 border-red-500" />
            <span className="sr-only">Close modal</span>
          </button>
        </div>

        {/* ---------- BODY ---------- */}
        <div className="p-4 md:p-5 space-y-4">

          <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-semibold text-gray-700">
            {ageMode === "below"
              ? `Below ${ageFrom} years old`
              : ageMode === "above"
              ? `Above ${ageFrom} years old`
              : ageTo
              ? `Members between ${ageFrom} to ${ageTo} years old`
              : `Members aged ${ageFrom} years old`}
          </h2>



            <FiDownload
              size={20}
              className={`text-lavender--600 cursor-pointer ${isDownloading && "opacity-50 pointer-events-none"}`}
              title="Download Age Category PDF"
              onClick={onDownload}
            />
          </div>

          {/* Scrollable table */}
          <div className="max-h-[500px] overflow-y-auto overflow-x-auto border rounded">
            <table className="w-full text-sm text-gray-500">
              <thead className="text-base text-gray-700 border-b sticky top-0 bg-white">
                <tr>
                  <th className="p-2 text-center">Sl No.</th>
                  <th className="p-2 text-center">Member ID</th>
                  <th className="p-2 text-center">Member Name</th>
                  <th className="p-2 text-center">Age</th>
                </tr>
              </thead>

              <tbody className="text-center">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-4">
                      No members in this age range
                    </td>
                  </tr>
                ) : (
                  members.map((m, index) => (
                    <tr key={m._id} className="border-b">
                      <td className="p-2">{index + 1}</td>
                      <td className="p-2">{m.member_id}</td>
                      <td className="p-2 text-left">{m.member_name}</td>
                      <td className="p-2">{m.age || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

{isDownloading && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
    <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-lavender--600 border-t-transparent rounded-full animate-spin" />

      <p className="text-sm font-medium text-gray-700">
        Preparing PDF Download… Please wait
      </p>
    </div>
  </div>
)}


    </div>
  );
};

export default AgeFilterModal;
