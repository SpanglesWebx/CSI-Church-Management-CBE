import React from "react";
import { IoIosClose } from "react-icons/io";

const DetailModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 shadow-md">
      <div className="relative w-1/4 max-w-sm md:max-w-2xl lg:max-w-4xl p-4 bg-white rounded-lg shadow dark:bg-gray-700">
        {/* Modal header */}
        <div className="flex items-center justify-end px-4 rounded-t dark:border-gray-600">
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            onClick={onClose}
          >
            <IoIosClose className="w-5 h-5 border rounded-full text-red-700 border-red-700" />
            <span className="sr-only">Close modal</span>
          </button>
        </div>
        {/* Modal body */}
        <div className="p-4 md:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DetailModal;

