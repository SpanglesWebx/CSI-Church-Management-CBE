import React from "react";
import { IoIosClose } from "react-icons/io";

const SubscriptionModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ">
      <div className="relative w-full max-w-[1500px] p-4 bg-white rounded-lg shadow dark:bg-gray-700">
        {/* Modal header */} 
        <div className="flex items-center justify-between px-4  rounded-t dark:border-gray-600">
         <span className="text-lavender--600 font-semibold">{title}</span> 
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            onClick={onClose}
          >
            <IoIosClose className="w-5 h-5 border rounded-full text-red-500 border-red-500" />
            <span className="sr-only">Close modal</span>
          </button>
        </div>
        {/* Modal body */}
        <div className="p-4 md:p-5 space-y-4">{children}</div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
