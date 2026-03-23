import React from "react";

const SectionDivider = ({ title }) => {
  return (
    <div className="mt-6 mb-4 flex items-center">
      <div className="flex-grow border-t border-gray-300"></div>

      <h2 className="mx-4 text-lg font-bold text-gray-700 whitespace-nowrap">
        {title}
      </h2>

      <div className="flex-grow border-t border-gray-300"></div>
    </div>
  );
};

export default SectionDivider;