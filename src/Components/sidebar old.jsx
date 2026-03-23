import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DashboardIcon from "../assets/Group 24-min.png";
import FamilyListIcon from "../assets/Group 1000001882-min.png";
import MemberListIcon from "../assets/Group 1000002033-min.png";
import OfferingsIcon from "../assets/Group 1000002035-min.png";
import ExpenseIcon from "../assets/Vector-min.png";
import LogoutIcon from "../assets/Group 56-min.png";
import ReportsIcon from "../assets/ReportsIcon.png";
import { initFlowbite } from "flowbite";

function SideBar() {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    initFlowbite();
  }, []);

  return (
    <React.Fragment>
      <aside
        id="sidebar-multi-level-sidebar"
        className="w-[24rem] transition-transform sm:translate-x-0"
      >
        <div className="flex flex-col justify-between h-full overflow-y-auto py-7 pe-7">
          <ul className="space-y-5 font-medium ">
            <li>
              <Link
                to="/admin/dashboard"
                className={`${
                  location.pathname.includes("/dashboard")
                    ? "bg-lavender--600 text-white hover:text-lavender--600 hover:bg-slate-100"
                    : "text-gray-800 hover:bg-slate-100 hover:text-lavender--600"
                } flex items-center px-10 py-3 rounded-e-lg group`}
              >
                <img
                  src={DashboardIcon}
                  className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900 "
                  alt=""
                />
                <span className="text-lg ms-5">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/family/list"
                className={`${
                  location.pathname.includes("/family")
                    ? "bg-lavender--600 text-white hover:text-lavender--600 hover:bg-slate-100"
                    : "text-gray-800 hover:bg-slate-100 hover:text-lavender--600"
                } flex items-center px-10 py-3 rounded-e-lg group`}
              >
                <img
                  src={FamilyListIcon}
                  className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900 "
                  alt=""
                />
                <span className="text-lg ms-5">Family List</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/member/list"
                className={`${
                  location.pathname.includes("/member") &&
                  !location.pathname.includes("/family")
                    ? "bg-lavender--600 text-white hover:text-lavender--600 hover:bg-slate-100"
                    : "text-gray-800 hover:bg-slate-100 hover:text-lavender--600"
                } flex items-center px-10 py-3 rounded-e-lg group`}
              >
                <img
                  src={MemberListIcon}
                  className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900 "
                  alt=""
                />
                <span className="text-lg ms-5">Member List</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/offerings/type"
                className={`${
                  location.pathname.includes("/offerings")
                    ? "bg-lavender--600 text-white hover:text-lavender--600 hover:bg-slate-100"
                    : "text-gray-800 hover:bg-slate-100 hover:text-lavender--600"
                } flex items-center px-10 py-3 rounded-e-lg group`}
              >
                <img
                  src={OfferingsIcon}
                  className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900 "
                  alt=""
                />
                <span className="text-lg ms-5">Offerings</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/expense/list"
                className={`${
                  location.pathname.includes("/expense")
                    ? "bg-lavender--600 text-white hover:text-lavender--600 hover:bg-slate-100"
                    : "text-gray-800 hover:bg-slate-100 hover:text-lavender--600"
                } flex items-center px-10 py-3 rounded-e-lg group`}
              >
                <img
                  src={ExpenseIcon}
                  className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900 "
                  alt=""
                />
                <span className="text-lg ms-5">Expense</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/reports"
                className={`${
                  location.pathname.includes("/reports")
                    ? "bg-lavender--600 text-white hover:text-lavender--600 hover:bg-slate-100"
                    : "text-gray-800 hover:bg-slate-100 hover:text-lavender--600"
                } flex items-center px-10 py-3 rounded-e-lg group`}
              >
                <img
                  src={ReportsIcon}
                  className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900 "
                  alt=""
                />
                <span className="text-lg ms-5">Reports</span>
              </Link>
            </li>
          </ul>
          <div className="">
            <button
              data-modal-target="logout-modal"
              data-modal-toggle="logout-modal"
              className="flex items-center w-full px-10 py-3 text-gray-800 rounded-e-lg group hover:bg-slate-100 hover:text-lavender--600"
            >
              <img
                src={LogoutIcon}
                className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900"
                alt=""
              />
              <span className="text-lg ms-5 whitespace-nowrap">Log Out</span>
            </button>
          </div>
        </div>
      </aside>
      <div
        id="logout-modal"
        data-modal-backdrop="static"
        tabIndex="-1"
        aria-hidden="true"
        className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
      >
        <div className="relative w-full max-w-md max-h-full p-4">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <button
              type="button"
              className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              data-modal-hide="logout-modal"
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
            <div className="p-4 text-center md:p-5">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-200"
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
                  d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                Are you sure you want to Log Out?
              </h3>
              <button
                data-modal-hide="logout-modal"
                type="button"
                className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  window.sessionStorage.clear();
                  navigate("/");
                }}
                data-modal-hide="logout-modal"
                type="button"
                className="text-white ms-5 bg-lavender--600 hover:bg-lavender--800 focus:ring-4 focus:outline-none focus:ring-lavender--300 dark:focus:ring-lavender--800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
              >
                Yes
              </button>
            </div>
          </div>
        </div> 
      </div>
    </React.Fragment>
  );
}

export default SideBar;
