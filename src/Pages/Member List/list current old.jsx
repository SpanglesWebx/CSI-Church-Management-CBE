import axios from "axios";
import React, { useEffect, useState } from "react";
import { URL } from "../../App";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Spinners from "../../Components/Spinners";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import down from "../../assets/downloade.svg";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import Dropdown from "../../Components/Helpers/DropDown";

function List() {
  const token = window.sessionStorage.getItem("token");
  const [categories, setCategories] = useState(["All", "Active", "Inactive"]);
  const navigate = useNavigate();
  const location = useLocation();
  const [Data, setData] = useState([]);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [Search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [Response, setResponse] = useState({
    status: null,
    message: "",
  });

  // Load search and status from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get("search") || "";
    const pageParam = parseInt(params.get("page")) || 1;
    const statusParam = params.get("status") || "All";

    setSearch(searchParam);
    setCurrentPage(pageParam);
    setSelectedCategory(statusParam);

    fetchData(pageParam, searchParam, statusParam);
  }, [location.search]);

  // Update URL params when search, page, or status changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (Search) {
      params.append("search", Search);
    }
    if (CurrentPage) {
      params.append("page", CurrentPage);
    }
    if (selectedCategory) {
      params.append("status", selectedCategory);
    }
    navigate(`?${params.toString()}`, { replace: true });
  }, [Search, CurrentPage, selectedCategory]);

  const fetchData = async (page, search, status) => {
    setLoading(true);
    try {
      const statusQuery = status === "All" ? "" : status;
      const response = await axios.get(
        `${URL}/member/list?search=${search}&page=${page}&limit=${15}&status=${statusQuery}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );
console.log(response.data.RegisteredDat);

      setData(response.data.RegisteredData);
      setTotalPages(response.data.TotalPages);
    } catch (error) {
      console.error(error);
      if (error.response) {
        if (error.response.status === 401) {
          setResponse({
            status: "Failed",
            message: "Unauthorized! Please Login Again.",
          });
          setTimeout(() => {
            window.sessionStorage.clear();
            navigate("/");
          }, 1000);
        }
        if (error.response.status === 500) {
          setResponse({
            status: "Failed",
            message: "Server Unavailable!",
          });
          setTimeout(() => {
            setResponse({
              status: null,
              message: "",
            });
          }, 1000);
        }
      } else {
        setResponse({
          status: "Failed",
          message: "An unexpected error occurred",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item) => {
    setSelectedCategory(item);  // Update selected category (status)
  };

  const tableHeading = [
    "Sl. no.",
    "Member ID",
    "Member Name",
    "Member Tamil Name",
    "Family Id",
    "Family Head Name",
    "Status",
  ];

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const statusQuery = selectedCategory === "All" ? "" : selectedCategory;
      const res = await axios.get(
        `${URL}/member/download-list?status=${statusQuery}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      const Data = res.data.RegisteredData;

      const doc = new jsPDF();

      const headers = [tableHeading];

      const rows = Data.map((item, index) => [
        index + 1,
        item.member_id,
        item.member_name,
        item.member_tamil_name,
        item.family_id,
        item.family_head_name,
        item.status,
      ]);

      doc.autoTable({
        head: headers,
        body: rows,
      });

      doc.save("Member Reports.pdf");

      console.log("PDF generated successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error("Failed to generate PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <React.Fragment>
      {isDownloading && (
        <div className="p-4 font-semibold text-center text-blue-500 bg-blue-100 rounded-md">
          Your download is in progress, please wait...
        </div>
      )}

      <div className="flex flex-col w-full p-5 mt-5 space-y-10 bg-white rounded-t-lg">
        <div className="flex flex-wrap items-center justify-between space-y-5">
          <div className="inline-flex space-x-3">
            <h1 className="text-lg font-semibold text-lavender--600">
              Member List
            </h1>
          </div>
          <div className="flex items-center space-x-5">
            <div className="w-full lg:w-auto">
              <Dropdown
                items={categories}
                onSelect={handleSelect}
                label="Status"
                selected={selectedCategory}  // Ensure the dropdown reflects the selected status
              />
            </div>

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
                  placeholder="Search Members..."
                  onChange={(e) => {
                    setCurrentPage(1);
                    setSearch(e.target.value);
                  }}
                />
              </div>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="mr-4 text-blue-600 cursor-pointer hover:text-blue-800"
            >
              <img src={down} />
            </button>
          </div>
        </div>

        {loading ? (
          <Spinners />
        ) : Data && Data.length > 0 ? (
          <table className="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
            <thead className="text-base text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-400">
              <tr>
                {[
                  "Sl.No",
                  "Member Id",
                  "Member Name",
                  "Member Tamil Name",
                  "Family Id",
                  "Family Head Name",
                  "Status",
                  "Action",
                ].map((item, index) => (
                  <th scope="col" className="px-4 py-3" key={index}>
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Data.map((item, index) => (
                <tr
                  key={item.member_id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                >
                  <td className="px-4 py-4 text-sm">{index + 1}</td>
                  <td className="px-4 py-4 text-sm">{item.member_id}</td>
                  <td className="px-4 py-4 text-sm">{item.member_name}</td>
                  <td className="px-4 py-4 text-sm">{item.member_tamil_name}</td>
                  <td className="px-4 py-4 text-sm">{item.family_id}</td>
                  <td className="px-4 py-4 text-sm">{item.family_head_name}</td>
                  <td
                    className={`${
                      item.status === "Active"
                        ? "text-green-600"
                        : "text-red-600"
                    } px-4 py-4 text-sm font-semibold`}
                  >
                    {item.status}
                  </td>
                  <td className="flex gap-5 px-4 py-4 text-sm">
                    <Link
                      to={`/admin/member/${item.member_id}/preview`}
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
          <table className="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
            <tbody>
              <tr>
                <td
                  colSpan="8"
                  className="px-4 py-4 text-sm text-center text-gray-500 dark:text-gray-400"
                >
                  No members found
                </td>
              </tr>
            </tbody>
          </table>
        )}

        <div className="flex items-center justify-center mt-4 space-x-2">
          <button
            onClick={() => setCurrentPage(CurrentPage - 1)}
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
            onClick={() => setCurrentPage(CurrentPage + 1)}
            disabled={CurrentPage === TotalPages || TotalPages === 0}
            className="px-4 py-2 w-[100px] text-gray-700 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
          <div className="absolute flex px-3 space-x-2 rounded right-5 ">
  <span  className="px-4 py-2 text-center text-gray-700 bg-gray-100 rounded" >Total Page: <span >{TotalPages}</span>
 </span>
 <span
  onClick={() => setCurrentPage(TotalPages)}
  className={`${TotalPages === CurrentPage ? 'disabled opacity-50  bg-gray-100 px-4 py-2 cursor-not-allowed' : 'px-4 py-2 text-blue-400 bg-gray-100 rounded active:text-blue-800 hover:cursor-pointer'} `}
>
  Last Page
</span>
 </div>
        </div>
      </div>
      {Response.status !== null ? (
        Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : Response.status === "Failed" ? (
          <FailedMessage Message={Response.message} />
        ) : null
      ) : null}
    </React.Fragment>
  );
}

export default List;
