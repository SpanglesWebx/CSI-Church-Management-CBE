import React, { useMemo } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Pagination = ({
  currentPage,
  totalPages,
  rowsPerPage,
  rowsInput,
  jumpInput,
  setCurrentPage,
  setRowsPerPage,
  setRowsInput,
  setJumpInput,
  defaultRows = 25,
}) => {

  const getPaginationPages = useMemo(() => {
    const pages = [];
    const range = 2;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    if (currentPage > range + 2) pages.push("ellipsis-left");

    const start = Math.max(2, currentPage - range);
    const end = Math.min(totalPages - 1, currentPage + range);

    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - (range + 1)) pages.push("ellipsis-right");

    pages.push(totalPages);

    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="relative flex items-center justify-center mt-4 space-x-2 select-none">

      {/* LEFT – Rows Per Page */}
      <div className="absolute left-2">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded">
          <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
            No. of Rows
          </span>

          <div className="relative w-24">
            <div
              className="absolute inset-y-0 right-0 flex items-center pe-2 cursor-pointer"
              onClick={() => {
                setRowsPerPage(Number(rowsInput) || defaultRows);
                setCurrentPage(1);
              }}
            >
              <svg className="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
            </div>

            <input
              type="text"
              inputMode="numeric"
              value={rowsInput}
              placeholder={String(defaultRows)}
              onChange={(e) =>
                setRowsInput(e.target.value.replace(/[^0-9]/g, ""))
              }
              className="block w-full py-1 pr-8 pl-2 text-sm bg-gray-100 rounded outline-none"
            />
          </div>
        </div>
      </div>

      {/* CENTER – Pages */}
      <div className="flex items-center space-x-2">

        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full disabled:opacity-50"
        >
          <FaChevronLeft />
        </button>

{getPaginationPages.map((page, index) =>
  typeof page === "string" ? (
    <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">…</span>
  ) : (
    <button
      key={`page-${page}-${index}`}
      onClick={() => setCurrentPage(page)}
      className={`w-10 h-10 flex items-center justify-center rounded-full font-medium
        ${page === currentPage
          ? "bg-lavender--600 text-white"
          : "hover:border-2 border-gray-300"
        }`}
    >
      {page}
    </button>
  )
)}

        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full disabled:opacity-50"
        >
          <FaChevronRight />
        </button>

      </div>

      {/* RIGHT – Jump */}
      <div className="absolute right-2">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded">
          <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
            Jump to Page
          </span>

          <div className="relative w-20">
            <input
              type="text"
              inputMode="numeric"
              value={jumpInput}
              placeholder={`1-${totalPages}`}
              onChange={(e) =>
                setJumpInput(e.target.value.replace(/[^0-9]/g, ""))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const page = Number(jumpInput);
                  if (page >= 1 && page <= totalPages) {
                    setCurrentPage(page);
                    setJumpInput("");
                  }
                }
              }}
              className="block w-full py-1 pr-2 pl-2 text-sm bg-gray-100 rounded outline-none"
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default Pagination;
