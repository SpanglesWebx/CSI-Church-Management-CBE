import React, { useState } from 'react'

export const Minutes = () => {
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [CurrentPage, setCurrentPage] = useState(1);
    const [TotalPages, setTotalPages] = useState(1);
    return (
        <>
            <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
                <div className="flex items-center justify-between p-4">
                    <h1 className="text-lg font-semibold">Church Minutes</h1>
                    <div className="">
                        <label
                            htmlFor="default-search"
                            className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
                        >
                            Search Members
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                                <svg
                                    className="w-3 h-3 text-gray-500 dark:text-gray-400"
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
                                id="default-search"
                                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-lavender--600 dark:focus:border-lavender--600"
                                placeholder="Search Title"
                            // value={search}
                            // onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">

                        <label className="text-l font-medium text-gray-600 mb-1">From</label>
                        <input
                            type="date"
                            // value={startDate}
                            // onChange={(e) => setStartDate(e.target.value)}
                            className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 
                                     border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
                        />

                        <label className="text-l font-medium text-gray-600 mb-1">To</label>
                        <input
                            type="date"
                            // value={endDate}
                            // onChange={(e) => setEndDate(e.target.value)}
                            className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 
                                     border border-gray-300 focus:ring-lavender--600 focus:border-lavender--600"
                        />


                    </div>

                </div>

                <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm text-gray-500">
                        <thead className="text-base text-gray-700">
                            <tr>
                                <th className="p-2 text-center">Sl No.</th>
                                <th className="p-2 text-center">Date</th>
                                <th className="p-2 text-center">Day</th>
                                <th className="p-2 text-center">Title</th>
                                <th className="p-2 text-center">Status</th>
                                <th className="p-2 text-center">Action</th>
                            </tr>
                        </thead>
                    </table>
                </div>
                <div className="relative flex flex-wrap items-center justify-center mt-4 space-x-3 select-none">
                    <button
                        onClick={() => setCurrentPage(CurrentPage - 1)}
                        disabled={CurrentPage === 1}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Previous
                    </button>

                    <span className="px-4 py-2 bg-lavender--600 text-white rounded">
                        {CurrentPage}
                    </span>

                    <button
                        onClick={() => setCurrentPage(CurrentPage + 1)}
                        disabled={CurrentPage === TotalPages}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Next
                    </button>

                    <div className="absolute flex px-5 space-x-2 rounded right-1">
                        <span className="px-4 py-2 text-gray-700 bg-gray-100 rounded">
                            Total Pages: {TotalPages}
                        </span>
                        <span
                            onClick={() => setCurrentPage(TotalPages)}
                            className={`${TotalPages === CurrentPage
                                ? "opacity-50 bg-gray-100 px-4 py-2 cursor-not-allowed"
                                : "px-4 py-2 text-blue-400 bg-gray-100 rounded cursor-pointer"
                                }`}
                        >
                            Last Page
                        </span>
                    </div>
                </div>
            </div>
        </>
    )
}
