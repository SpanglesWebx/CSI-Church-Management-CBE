import axios from "axios";
import React, { useEffect, useState } from "react";
import { URL } from "../../App";
import { Link, useNavigate } from "react-router-dom";
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
  const [Data, setData] = useState([]);
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [Search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [Response, setResponse] = useState({
    status: null,
    message: "",
  });
  useEffect(() => {
    fetchData();
  }, [CurrentPage, Search, selectedCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statusQuery = selectedCategory === "All" ? "" : selectedCategory;
      const response = await axios.get(
        `${URL}/member/list?search=${Search}&page=${CurrentPage}&limit=${15}&status=${statusQuery}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      setData(response.data.RegisteredData);
      setTotalPages(response.data.TotalPages);
      // setCurrentPage(response.data.currentPage);
    } catch (error) {
      console.error(error);
      if (error.response) {
        if (error.response.status === 401) {
          setResponse({
            status: "Failed",
            message: "Un Authorized! Please Login Again.",
          });
          setTimeout(() => {
            window.sessionStorage.clear();
            navigate("/");
          }, 5000);
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
          }, 5000);
        }
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false); // End loading state
    }
  };

  // useEffect(() => {
  //   if (Search !== "") {
  //     setFilterData(
  //       Data &&
  //         Data.filter((elem) => {
  //           return (
  //             elem.member_id.toLowerCase().startsWith(Search.toLowerCase()) ||
  //             elem.member_name.toLowerCase().startsWith(Search.toLowerCase()) ||
  //             elem.family_id.toLowerCase().startsWith(Search.toLowerCase()) ||
  //             elem.family_head_name
  //               .toLowerCase()
  //               .startsWith(Search.toLowerCase()) ||
  //             elem.status.toLowerCase().startsWith(Search.toLowerCase())
  //           );
  //         })
  //     );
  //   } else {
  //     setFilterData(Data);
  //   }
  // }, [Data, Search]);

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

      console.log(res);

      const Data = res.data.RegisteredData;

      const doc = new jsPDF();

      const headers = [tableHeading];

      const rows = Data.map((item, index) => [
        index + 1,
        item.member_id,
        item.member_name,
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

  const handleSelect = (item) => {
    setSelectedCategory(item);
  };

  return (
    <React.Fragment>
      {isDownloading && (
        <div className="text-blue-500 font-semibold text-center bg-blue-100 p-4 rounded-md">
          Your download is in progress, please wait...
        </div>
      )}

      <div className="w-full flex flex-col bg-white mt-5 p-5 space-y-10 rounded-t-lg">
        <div className="flex flex-wrap space-y-5 items-center justify-between">
          <div className="inline-flex space-x-3">
            <h1 className="font-semibold text-lg text-lavender--600">
              Member List
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
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
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
                  className="block w-54 py-1 ps-8 text-sm text-gray-900 rounded bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-lavender--600 dark:focus:border-lavender--600"
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
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-base text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-400">
              <tr>
                {[
                  "Sl.No",
                  "Member Id",
                  "Member Name",
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
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  key={index}
                >
                  <th
                    scope="row"
                    className="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {(CurrentPage - 1) * 15 + (index + 1)}
                  </th>
                  <td className="px-4 py-4 text-sm">{item.member_id}</td>
                  <td className="px-4 py-4 text-sm">{item.member_name}</td>
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
                  <td className="px-4 py-4 text-sm flex gap-5">
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
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <tbody>
              <tr>
                <td
                  colSpan="7"
                  className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No members found
                </td>
              </tr>
            </tbody>
          </table>
        )}

        <div className="flex justify-center items-center space-x-2 mt-4">
          <button
            onClick={() => setCurrentPage(CurrentPage - 1)}
            disabled={CurrentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
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
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
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
