import axios from "axios";
import React, { useEffect, useState } from "react";
import { URL } from "../../App";
import { Link, useNavigate } from "react-router-dom";
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
  const [Data, setData] = useState([]);
  const [categories, setCategories] = useState(["All", "Active", "Inactive"]);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [Search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [Response, setResponse] = useState({
    status: null,
    message: "",
  });

  useEffect(() => {
    fetchData();
  }, [CurrentPage, Search, selectedCategory]);

  // const fetchData = async () => {
  //   try {
  //     const response = await axios.get(
  //       `${URL}/family/list?search=${Search}&page=${CurrentPage}&limit=${15}`,
  //       {
  //         headers: {
  //           Authorization: token,
  //         },
  //       }
  //     );
  //     setData(response.data.RegisteredData);
  //     setTotalPages(response.data.TotalPages);
  //     // setCurrentPage(response.data.currentPage);
  //   } catch (error) {
  //     console.error(error);
  //     if (error.response.status === 401) {
  //       setResponse({
  //         status: "Failed",
  //         message: "Un Authorized! Please Login Again.",
  //       });
  //       setTimeout(() => {
  //         window.sessionStorage.clear();
  //         navigate("/");
  //       }, 5000);
  //     }
  //     if (error.response.status === 500) {
  //       setResponse({
  //         status: "Failed",
  //         message: "Server Unavailable!",
  //       });
  //       setTimeout(() => {
  //         setResponse({
  //           status: null,
  //           message: "",
  //         });
  //       }, 5000);
  //     }
  //   }
  // };
  // useEffect(() => {
  //   if (Search !== "") {
  //     setFilterData(
  //       Data &&
  //         Data.filter((elem) => {
  //           return (
  //             elem.family_id.toLowerCase().startsWith(Search.toLowerCase()) ||
  //             elem.member_name.toLowerCase().startsWith(Search.toLowerCase()) ||
  //             elem.head.toLowerCase().startsWith(Search.toLowerCase())
  //           );
  //         })
  //     );
  //   } else {
  //     setFilterData(Data);
  //   }
  // }, [Data, Search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statusQuery = selectedCategory === "All" ? "" : selectedCategory;

      const response = await axios.get(
        `${URL}/family/list?search=${Search}&page=${CurrentPage}&limit=15&status=${statusQuery}`,
        {
          headers: {
            Authorization: token,
          },
        }
        
        
      );
      console.log(response.data.RegisteredData);
      // console.log(response.data.RegisteredData);

      setData(response.data.RegisteredData);
      setTotalPages(response.data.TotalPages);
      // setCurrentPage(response.data.currentPage);
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
          }, 5000);
        } else if (error.response.status === 500) {
          setResponse({
            status: "Failed",
            message: "Server Unavailable!",
          });
          setTimeout(() => {
            setResponse({
              status: null,
              message: "",
            });
          }, 5000);
        }
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const tableHeading = [
    "Sl. no.",
    "Family ID",
    "Family Head Name",
    "Member Id",
    "Status",
  ];

  // const handleDownloadPDF = async () => {
  //   try {
  //     const statusQuery = selectedCategory === "All" ? "" : selectedCategory;
  //     const res = await axios.get(
  //       `${URL}/family/download-list?status=${statusQuery}`,
  //       {
  //         headers: {
  //           Authorization: token,
  //         },
  //       }
  //     );

  //     const Data = res.data.RegisteredData;

  //     const doc = new jsPDF();

  //     const headers = [tableHeading]; // Ensure tableHeading is correctly defined

  //     const rows = Data.map((item, index) => [
  //       index + 1,
  //       item.family_id,
  //       item.member_name,
  //       item.head,
  //       item.status,
  //     ]);

  //     doc.autoTable({
  //       head: headers,
  //       body: rows,
  //     });

  //     doc.save("Family Reports.pdf");

  //     console.log("PDF generated successfully!");
  //   } catch (error) {
  //     console.error("Error generating PDF:", error);
  //     throw new Error("Failed to generate PDF");
  //   }
  // };

  const handleSelect = (item) => {
    setSelectedCategory(item);
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const statusQuery = selectedCategory === "All" ? "" : selectedCategory;
      const res = await axios.get(
        `${URL}/family/download-list?status=${statusQuery}`,
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
        item.family_id,
        item.member_name,
        item.member_tamil_name,
        item.head,
        item.status,
      ]);

      doc.autoTable({
        head: headers,
        body: rows,
      });

      doc.save("Family Reports.pdf");

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

      <div className="flex flex-col w-full p-5 mt-5 space-y-10 bg-white   rounded-t-lg">
        <div className="flex flex-wrap items-center justify-between space-y-5">
          <div className="inline-flex space-x-3">
            <h1 className="text-lg font-semibold text-lavender--600">
              Family List
            </h1>
          </div>
          <div className="flex items-center space-x-5">
            <div className="w-full lg:w-auto">
              <Dropdown
                items={categories}
                onSelect={handleSelect}
                label="Status"
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
            <Link
              to={`/admin/family/add/new`}
              className="px-3 py-1 space-x-2 text-sm text-white rounded bg-lavender--600 hover:bg-lavender--600 focus:ring-4 focus:ring-lavender-light-400"
            >
              <i className="fa-solid fa-plus"></i> New Family
            </Link>

            <button
              onClick={handleDownloadPDF}
              className="mr-4 text-blue-600 cursor-pointer hover:text-blue-800"
            >
              <img src={down} />
            </button>
          </div>
        </div>
        {loading ? (
          <Spinners /> // Show spinner when loading is true
        ) : Data && Data.length > 0 ? (
          <table className="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
            <thead className="text-base text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-400">
              <tr>
                {[
                  "Sl.No",
                  "Family Id",
                  "Family Head Name",
                  "Member Tamil Name",
                  "Member Id",
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
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  key={item.head} // Ensure unique key if possible
                >
                  <th
                    scope="row"
                    className="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {(CurrentPage - 1) * 15 + (index + 1)}
                  </th>
                  <td className="px-4 py-4 text-sm">{item.family_id}</td>
                  <td className="px-4 py-4 text-sm">{item.member_name}</td>
                  <td className="px-4 py-4 text-sm">{item.member_tamil_name}</td>
                  <td className="px-4 py-4 text-sm">{item.head}</td>
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
                      to={`/admin/family/${item.family_id}/preview`}
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
          <div className="px-4 py-4 text-sm text-center text-gray-500 dark:text-gray-400">
            No data available
          </div>
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
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
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
