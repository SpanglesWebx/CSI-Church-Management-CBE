import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { URL } from "../../App";
import { initFlowbite } from "flowbite";
import axios from "axios";
import moment from "moment";
import Spinners from "../../Components/Spinners";

function Preview() {
  const token = window.sessionStorage.getItem("token");

  useEffect(() => {
    initFlowbite();
  }, []);

  const params = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [Data, setData] = useState({});

  const [Response, setResponse] = useState({
    status: null,
    message: "",
  });

  useEffect(() => {
    fetchData();
  }, [params]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${URL}/pastor/${params.id}`, {
        headers: {
          Authorization: token,
        },
      });
      setData(response.data);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        setResponse({
          status: "Failed",
          message: "Unauthorized! Please log in again.",
        });
        setTimeout(() => {
          window.sessionStorage.clear();
          navigate("/");
        }, 1000);
      } else if (error.response?.status === 500) {
        setResponse({
          status: "Failed",
          message: "Server Unavailable!",
        });
        setTimeout(() => {
          setResponse({ status: null, message: "" });
        }, 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <Spinners />
        </div>
      ) : (
        <section className="w-full bg-slate-50 rounded-ss">
          <div className="flex flex-col w-full p-5 mb-20 space-y-10 bg-white rounded-ss">
            <p>
              <i
                onClick={() => navigate(-1)}
                className="text-2xl hover:cursor-pointer fa-solid fa-arrow-left-long"
              ></i>
            </p>

            <div className="flex items-start justify-between">
              <div className="flex flex-col w-full">
                <div className="inline-flex items-center justify-between">
                  <h1 className="text-xl font-semibold text-lavender--600">
                    Member Details
                  </h1>
                  <div className="inline-flex space-x-10">
                    <h1
                      className={`${
                        Data.status === "Active"
                          ? "text-green-600"
                          : "text-red-600"
                      } font-semibold px-5`}
                    >
                      {Data.status}
                    </h1>
                    <Link
                      to={`/admin/pastor/${Data.member_id}/edit`}
                      className="text-base font-semibold text-lavender--700 hover:text-lavender--500"
                    >
                      <i className="fa-solid fa-pen-to-square"></i> Edit
                    </Link>
                  </div>
                </div>
                <div className="flex justify-end w-full mt-3 ">
                  <img
                    src={Data.member_photo ? `${URL}${Data.member_photo}` : ""}
                    alt="Profile"
                    className="w-28"
                  />
                </div>
                  {/* <div className="flex flex-col pt-5 ps-5 w-full max-w-4xl space-y-4">
                    {[
                      { label: "Family ID", value: Data.familyId },
                      { label: "Member ID", value: Data.member_id },
                      { label: "Pastor Role", value: Data.pastor_role },   // 👈 new field
                      { label: "Pastor Name", value: Data.member_name },
                      { label: "Pastor Tamil Name", value: Data.member_tamil_name },
                      { label: "Mobile Number", value: Data.mobile_number },
                      { label: "Gender", value: Data.gender},
                      
                      { label: "Date of Birth", value: moment(Data.date_of_birth).format("DD-MM-YYYY") },
                      { label: "Age", value: Data.age },  // 👈 calculated field
                      { label: "Aadhar Number", value: Data.aadhar_number},
                      { label: "Joined Date", value: moment(Data.joined_date).format("DD-MM-YYYY")},
                      { label: "Marriage Date", value: moment(Data.marriage_date).format("DD-MM-YYYY")},
                      { label: "Email", value: Data.email },
                      {
                        label: "Permanent Address",
                        value:
                          Data.permanent_address
                      },
                      {
                        label: "Present Address",
                        value:
                          Data.present_address
                      },
                      ...(Data.status === "Inactive"
                        ? [
                          { label: "Reason for Inactive", value: Data.reason_for_inactive },
                          { label: "Description", value: Data.description },
                          { label: "Left Date", value: Data.left_date },
                        ]
                        : []),
                      { label: "Status", value: Data.status },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-12 gap-2 py-2 "
                      >
                        {/* Label col-sm-3 
                        <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700 dark:text-white">
                          {item.label}
                        </div>
                        {/* Value col-sm-9 
                        <div className="col-span-12 sm:col-span-8 text-base text-gray-800 dark:text-gray-300">
                          {item.value || "--"}
                        </div>
                      </div>
                    ))}
                  </div> */}
                  <div className="flex flex-col pt-5 ps-5 w-full max-w-4xl space-y-4">
                    {(Data.relationship_with_family_head === "head"
                      ? [
                        { label: "Family ID", value: Data.familyId },
                        { label: "Member ID", value: Data.member_id },
                        { label: "Pastor Role", value: Data.pastor_role },
                        { label: "Pastor Name", value: Data.member_name },
                        { label: "Pastor Tamil Name", value: Data.member_tamil_name },
                        { label: "Mobile Number", value: Data.mobile_number },
                        { label: "Gender", value: Data.gender },
                        { label: "Date of Birth", value: moment(Data.date_of_birth).format("DD-MM-YYYY") },
                        { label: "Age", value: Data.age },
                        { label: "Aadhar Number", value: Data.aadhar_number },
                        { label: "Joined Date", value: moment(Data.joined_date).format("DD-MM-YYYY") },
                        { label: "Marriage Date", value: moment(Data.marriage_date).format("DD-MM-YYYY") },
                        { label: "Email", value: Data.email },
                        { label: "Permanent Address", value: Data.permanent_address },
                        { label: "Present Address", value: Data.present_address },
                        ...(Data.status === "Inactive"
                          ? [
                            { label: "Reason for Inactive", value: Data.reason_for_inactive },
                            { label: "Description", value: Data.description },
                            { label: "Left Date", value: moment(Data.left_date).format("DD-MM-YYYY") },
                          ]
                          : []),
                        { label: "Status", value: Data.status },
                      ]
                      : [
                        { label: "Family ID", value: Data.familyId },
                        { label: "Member ID", value: Data.member_id },
                        { label: "Relationship with Head", value: Data.relationship_with_family_head },
                        { label: "Member Name", value: Data.member_name },
                        { label: "Member Tamil Name", value: Data.member_tamil_name },
                        { label: "Mobile Number", value: Data.mobile_number },
                        { label: "Gender", value: Data.gender },
                        { label: "Date of Birth", value: moment(Data.date_of_birth).format("DD-MM-YYYY") },
                        { label: "Age", value: Data.age },
                        { label: "Aadhar Number", value: Data.aadhar_number },
                        { label: "Joined Date", value: moment(Data.joined_date).format("DD-MM-YYYY") },
                        { label: "Marriage Date", value: moment(Data.marriage_date).format("DD-MM-YYYY") },
                        { label: "Email", value: Data.email },
                        { label: "Permanent Address", value: Data.permanent_address },
                        { label: "Present Address", value: Data.present_address },
                        
                        ...(Data.status === "Inactive"
                          ? [
                            { label: "Reason for Inactive", value: Data.reason_for_inactive },
                            { label: "Description", value: Data.description },
                            { label: "Left Date", value: moment(Data.left_date).format("DD-MM-YYYY") },
                          ]
                          : []),
                        { label: "Status", value: Data.status },
                      ]
                    ).map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 py-2">
                        <div className="col-span-12 sm:col-span-4 text-lg font-semibold text-gray-700 dark:text-white">
                          {item.label}
                        </div>
                        <div className="col-span-12 sm:col-span-8 text-base text-gray-800 dark:text-gray-300">
                          {item.value || "--"}
                        </div>
                      </div>
                    ))}
                  </div>


              </div>
            </div>
          </div>
        </section>
      )}
    </React.Fragment>
  );
}

export default Preview;
