import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { URL } from "../../App";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Spinners from "../../Components/Spinners";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import down from "../../assets/downloade.svg";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import moment from "moment";
import Dropdown from "../../Components/Helpers/DropDown";

function List() {
  const token = window.sessionStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();

  const [Data, setData] = useState([]);
  const [categories, setCategories] = useState(["All", "Active", "Inactive"]);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [Search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [Response, setResponse] = useState({ status: null, message: "" });

  const abortControllerRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get("search") || "";
    const pageParam = parseInt(params.get("page")) || 1;

    setSearch(searchParam);
    setCurrentPage(pageParam);

    fetchData(pageParam, searchParam);
  }, [location.search]); // ✅ This will now trigger correctly

  const fetchData = async (page, search) => {
    // Abort the previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const { signal } = abortController;

    setLoading(true);

    try {
      const statusQuery = selectedCategory === "All" ? "" : selectedCategory;
      const response = await axios.get(
        `${URL}/pastor/familymembers?search=${search}&page=${page}&limit=15&status=${statusQuery}`,
        {
          headers: { Authorization: token },
          signal, // Pass signal for aborting
        }
      );
      setData(response.data.members);
      setTotalPages(response.data.TotalPages);
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Request canceled:", error.message);
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const newSearch = e.target.value;
    setSearch(newSearch);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(location.search);
      params.set("search", newSearch);
      params.set("page", "1");

      // Preserve tab selection
      const currentTab = params.get("tab") || "paster-family-list";
      params.set("tab", currentTab);

      navigate(`?${params.toString()}`);
    }, 300);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > TotalPages) return; // Prevent invalid pages

    const params = new URLSearchParams(location.search);
    params.set("page", newPage);
    params.set("tab", "paster-family-list"); // ✅ Preserve tab selection

    navigate(`?${params.toString()}`);
  };

  const tableHeading = [
    "Sl. no.",
    "Pastor Family ID",
    "Pastor Id",
    "Family Head Name",
    "Pastor Tamil Name",
    "Action",
  ];

  const handleSelect = (item) => {
    setSelectedCategory(item);
    setCurrentPage(1);

    const params = new URLSearchParams(location.search);
    params.set("search", Search);
    params.set("page", "1");
    params.set("tab", "paster-family-list"); // ✅ Preserve tab selection

    navigate(`?${params.toString()}`);
  };
  return (
    <React.Fragment>
      <div className="flex flex-col w-full p-5 mt-5 space-y-10 bg-white rounded-t-lg">
        <div className="flex flex-wrap items-center justify-between space-y-5">
          <div className="inline-flex space-x-3">
            <h1 className="text-lg font-semibold text-lavender--600">
              Pastor Family List
            </h1>
          </div>
          <div className="flex items-center space-x-5">
            <div className="">
              <input
                type="search"
                id="default-search"
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
                placeholder="Search Members..."
                value={Search}
                onChange={handleSearchChange}
              />
            </div>
            <Link
              to={`/admin/pastor/add/new`}
              className="px-3 py-1 space-x-2 text-sm text-white rounded bg-lavender--600 hover:bg-lavender--600"
            >
              <i className="fa-solid fa-plus"></i> New Pastor
            </Link>
          </div>
        </div>

        {loading ? (
          <Spinners />
        ) : Data && Data.length > 0 ? (
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-base text-gray-700 bg-white text-center">
              <tr>
                {tableHeading.map((item, index) => (
                  <th scope="col" className="px-4 py-3" key={index}>
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Data.map((item, index) => (
                <tr className="bg-white border-b" key={item.head}>
                  <th
                    scope="row"
                    className="px-4 py-4 text-sm font-medium text-gray-900 text-center"
                  >
                    {(CurrentPage - 1) * 15 + (index + 1)}
                  </th>
                  <td className="px-4 py-4 text-sm text-center">{item.familyId}</td>
                  <td className="px-4 py-4 text-sm text-center">{item.member_id}</td>
                  <td className="px-4 py-4 text-sm">{item.member_name}</td>
                  <td className="px-4 py-4 text-sm">{item.member_tamil_name}</td>
                  <td className=" px-4 py-4 text-sm text-center">
                    <Link
                      to={`/admin/pastor/pastorfamily/${item.familyId}`}
                      className="px-1.5 py-1 rounded bg-slate-100 hover:bg-slate-200"
                    >
                      <i className="fa-solid fa-eye"></i>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>No data found</div>
        )}

        <div className="relative flex flex-wrap items-center justify-center mt-4 space-x-3 select-none ">
          <button
            onClick={() => handlePageChange(CurrentPage - 1)}
            disabled={CurrentPage === 1}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            className={`px-4 py-2 rounded ${
              CurrentPage
                ? "bg-lavender--600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {CurrentPage}
          </button>
          <button
            onClick={() => handlePageChange(CurrentPage + 1)}
            disabled={CurrentPage === TotalPages || TotalPages === 0}
            className="px-4 py-2 w-[100px] text-gray-700 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
          <div className="absolute flex px-5 space-x-2 rounded right-1 ">
            <span className="px-4 py-2 text-center text-gray-700 bg-gray-100 rounded">
              Total Page: <span>{TotalPages}</span>
            </span>
            <span
              onClick={() => handlePageChange(TotalPages)}
              className={`${
                TotalPages === CurrentPage
                  ? "disabled opacity-50  bg-gray-100 px-4 py-2 cursor-not-allowed"
                  : "px-4 py-2 text-blue-400 bg-gray-100 rounded active:text-blue-800 hover:cursor-pointer"
              } `}
            >
              Last Page
            </span>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default List;
