import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { URL } from "../../App";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FailedMessage, SuccessMessage } from "../ToastMessage";

function Chart() {
  const [data, setData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState("2024");
  const label = "Year";
  const navigate = useNavigate();
  const token = window.sessionStorage.getItem("token");
  const [Response, setResponse] = useState({
    status: null,
    message: "",
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${URL}/offerings/trend?year=2024`, {
          headers: {
            Authorization: token,
          },
        });
        setData(response.data.chartData);
      } catch (error) {
        // if (error.response.status === 401) {
        //   setResponse({
        //     status: "Failed",
        //     message: "Un Authorized! Please Login Again.",
        //   });
        //   setTimeout(() => {
        //     window.sessionStorage.clear();
        //     navigate("/");
        //   }, 5000);
        // }
        // console.error("Error fetching data:", error);
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
      }
    };
    fetchData();
  }, [selectedYear]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (year) => {
    setSelectedYear(year);
    setIsOpen(false);
  };

  const dropdownItems = ["2024"];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border-2 border-lavender--600">
      <div className="flex justify-between items-center z-50 bg-white">
        <div className="text-lg font-bold mb-2 text-lavender--600">
          Offerings
        </div>

        <div className="relative z-30 bg-white inline-block text-left">
          <div>
            <button
              onClick={toggleDropdown}
              className="border-lavender--600 text-lavender--600 inline-flex justify-center w-full rounded-lg border shadow-sm px-4 py-2 bg-white text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-0"
            >
              {`${label}: ${selectedYear}`}
              <svg
                className="-mr-1 ml-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {isOpen && (
            <div
              className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="options-menu"
            >
              <div className="py-1" role="none">
                {dropdownItems.map((item, index) => (
                  <a
                    key={index}
                    href="#"
                    onClick={() => handleItemClick(item)}
                    className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100"
                    role="menuitem"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="h-64 rounded-lg">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#A9A9A9", fontSize: 12 }}
              domain={[0, 30000]}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#8aaee0"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {Response.status !== null ? (
        Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : Response.status === "Failed" ? (
          <FailedMessage Message={Response.message} />
        ) : null
      ) : null}
    </div>
  );
}

export default Chart;
