import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom"; // ✅ Import to manage query params
import FamilyList from "./PasterFamilyList.jsx";
import PasterList from "./PasterList.jsx";

function List() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "paster-list"; // ✅ Read tab from URL

  const handleTabChange = (tab) => {
    setSearchParams({ tab }); // ✅ Updates the URL without reloading
  };

  return (
    <div className="w-full">
      {/* Navigation Bar */}
      <nav className="flex justify-center p-2 space-x-5 text-xl font-semibold">
        <button
          className={`px-4 py-2 ${
            activeTab === "paster-list"
              ? "border-b-2 border-lavender--600 text-lavender--600"
              : "text-gray-500"
          }`}
          onClick={() => handleTabChange("paster-list")} // ✅ Update URL on click
        >
          Pastor List
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "paster-family-list"
              ? "border-b-2 border-lavender--600 text-lavender--600"
              : "text-gray-500"
          }`}
          onClick={() => handleTabChange("paster-family-list")}
        >
          Pastor Family List
        </button>
      </nav>

      {/* Conditional Rendering Based on Active Tab */}
      <div className="">
        {activeTab === "paster-list" ? <PasterList /> : <FamilyList />}
      </div>
    </div>
  );
}

export default List;
