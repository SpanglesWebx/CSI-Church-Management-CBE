
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

  // ✅ Full Data state with new fields included
  const [Data, setData] = useState({
    family_head: "",
    family_head_name: "",
    relationship_with_family_head: "",
    primary_family_id: "",
    secondary_family_id: "",
    member_id: "",
    assigned_member_id: "",
    member_type:"",
    member_name: "",
    member_tamil_name: "",
    gender: "",
    age: "",
    date_of_birth: "",
    mobile_number: "",
    email: "",
    occupation: "",
    community: "",
    nationality: "",
    place_of_birth: "",
    wife_father_name: "",
    wife_mother_name: "",
    aadhar_number: "",
    blood_group: "",
    qualification: "",
    dual_member: "",
    church_name: "",
    dual_member_id: "",
    baptism_status: "",
    baptized_date: "",
    baptism_place: "",
    baptism_by: "",
    confirmation_status: "",
    confirmation_date: "",
    confirmation_place: "",
    confirmation_by: "",
    communion: "",
    communion_date: "",
    communion_place: "",
    communion_by: "",
    marital_status: "",
    marriage_date: "",
    marriage_place: "",
    joined_date: "",
    left_date: "",
    reason_for_inactive: "",
    description: "",
    rejoining_date: "",
    reason_for_rejoining: "",
    status: "",
    member_photo: "",
    permanent_address: "",
    present_address: "",
  });

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
      const response = await axios.get(`${URL}/member/${params.id}`, {
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
          message: "Un Authorized! Please Login Again.",
        });
        setTimeout(() => {
          window.sessionStorage.clear();
          navigate("/");
        }, 1000);
      }
      if (error.response?.status === 500) {
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

  const formatDate = (date) =>
    date ? moment(new Date(date)).format("YYYY-MM-DD") : "Nil";

  return (
    <React.Fragment>
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <Spinners />
        </div>
      ) : (
        <section className="w-full bg-slate-50 rounded-ss">
          <div className="w-full bg-white rounded-ss flex flex-col p-5 mb-20 space-y-10">
            <p>
              <i
                onClick={() => navigate(-1)}
                className="hover:cursor-pointer fa-solid fa-arrow-left-long text-2xl"
              ></i>
            </p>

            <div className="flex items-start justify-between">
              <div className="w-full flex flex-col">
                <div className="inline-flex justify-between items-center">
                  <h1 className="text-xl text-lavender--600 font-semibold">
                    Member Details
                  </h1>
                  <div className="inline-flex space-x-10">
                    <h3
                      className={`${Data?.status === "Active"
                        ? "text-green-600"
                        : "text-red-600"
                        } font-semibold px-5`}
                    >
                      {Data?.status}
                    </h3>
                    {Data?.reason_for_inactive !== "Death" ? (
                      <Link
                        to={`/admin/member/${Data?.member_id}/edit`}
                        className="text-lavender--700 hover:text-lavender--500 text-base font-semibold"
                      >
                        <i className="fa-solid fa-pen-to-square"></i> Edit
                      </Link>
                    ) : null}
                  </div>
                </div>

                <div className="w-full flex justify-end mt-3">
                  {Data.member_photo && (
                    <img
                      src={`${URL}${Data.member_photo}`}
                      alt="Profile"
                      className="w-28"
                    />
                  )}
                </div>

                <div className="flex flex-col pt-5 ps-5">
                  <div className="row gy-3 text-gray-700 text-sm">

                    {/* ================== Basic Info ================== */}
                    <div className="col-12 fw-bold text-lavender--600 text-base border-bottom pb-1 mb-2 mt-3">Basic Info</div>
                    <div className="col-sm-3 fw-semibold">Primary Family Id</div>
                    <div className="col-sm-9">{Data.primary_family_id}</div>

                    <div className="col-sm-3 fw-semibold">Member Type</div>
                    <div className="col-sm-9">{Data.member_type}</div>

                    <div className="col-sm-3 fw-semibold">Secondary Family Id</div>
                    <div className="col-sm-9">{Data.secondary_family_id || "Nil"}</div>

                    <div className="col-sm-3 fw-semibold">Member Id</div>
                    <div className="col-sm-9">{Data.member_id}</div>

                    <div className="col-sm-3 fw-semibold">Assigned Member Id</div>
                    <div className="col-sm-9">{Data.assigned_member_id}</div>

                    <div className="col-sm-3 fw-semibold">Joining Date</div>
                    <div className="col-sm-9">{formatDate(Data.joined_date)}</div>

                    {/* ================== Family Info ================== */}
                    <div className="col-12 fw-bold text-lavender--600 text-base border-bottom pb-1 mt-5 mb-2 ">Family Info</div>
                    {Data.family_head ? (
                      <>
                        <div className="col-sm-3 fw-semibold">Family Head Name</div>
                        <div className="col-sm-9">{Data.member_name}</div>

                        {Data.member_tamil_name && (
                          <>
                            <div className="col-sm-3 fw-semibold">Family Head Tamil Name</div>
                            <div className="col-sm-9">{Data.member_tamil_name}</div>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="col-sm-3 fw-semibold">Member Name</div>
                        <div className="col-sm-9">{Data.member_name}</div>

                        {Data.member_tamil_name && (
                          <>
                            <div className="col-sm-3 fw-semibold">Member Tamil Name</div>
                            <div className="col-sm-9">{Data.member_tamil_name}</div>
                          </>
                        )}

                        <div className="col-sm-3 fw-semibold">Family Head Name</div>
                        <div className="col-sm-9">{Data.family_head_name}</div>

                        <div className="col-sm-3 fw-semibold">Relationship with Family Head</div>
                        <div className="col-sm-9">{Data.relationship_with_family_head}</div>
                      </>
                    )}

                    {/* Wife Fields */}
                    {Data.relationship_with_family_head === "Wife" && (
                      <>
                        <div className="col-sm-3 fw-semibold">Wife's Father Name</div>
                        <div className="col-sm-9">{Data.wife_father_name}</div>

                        <div className="col-sm-3 fw-semibold">Wife's Mother Name</div>
                        <div className="col-sm-9">{Data.wife_mother_name}</div>
                      </>
                    )}

                    {/* ================== Personal Info ================== */}
                    <div className="col-12 fw-bold text-lavender--600 text-base border-bottom pb-1 mt-5 mb-2">Personal Info</div>
                    <div className="col-sm-3 fw-semibold">Gender</div>
                    <div className="col-sm-9">{Data.gender}</div>

                    <div className="col-sm-3 fw-semibold">Age</div>
                    <div className="col-sm-9">{Data.age}</div>

                    <div className="col-sm-3 fw-semibold">Mobile Number</div>
                    <div className="col-sm-9">{Data.mobile_number}</div>

                    <div className="col-sm-3 fw-semibold">Email</div>
                    <div className="col-sm-9">{Data.email}</div>

                    <div className="col-sm-3 fw-semibold">Date of Birth</div>
                    <div className="col-sm-9">{formatDate(Data.date_of_birth)}</div>

                    <div className="col-sm-3 fw-semibold">Place of Birth</div>
                    <div className="col-sm-9">{Data.place_of_birth}</div>

                    <div className="col-sm-3 fw-semibold">Community</div>
                    <div className="col-sm-9">{Data.community}</div>

                    <div className="col-sm-3 fw-semibold">Nationality</div>
                    <div className="col-sm-9">{Data.nationality}</div>

                    <div className="col-sm-3 fw-semibold">Occupation</div>
                    <div className="col-sm-9">{Data.occupation}</div>

                    <div className="col-sm-3 fw-semibold">Aadhar Number</div>
                    <div className="col-sm-9">{Data.aadhar_number}</div>

                    <div className="col-sm-3 fw-semibold">Blood Group</div>
                    <div className="col-sm-9">{Data.blood_group}</div>

                    <div className="col-sm-3 fw-semibold">Qualification</div>
                    <div className="col-sm-9">{Data.qualification}</div>

                    {/* Address */}
                    <div className="col-sm-3 fw-semibold">Present Address</div>
                    <div className="col-sm-9">{Data.present_address || "Nil"}</div>

                    <div className="col-sm-3 fw-semibold">Permanent Address</div>
                    <div className="col-sm-9">{Data.permanent_address || "Nil"}</div>

                    {/* ================== Sacraments ================== */}
                    <div className="col-12 fw-bold text-lavender--600 text-base border-bottom pb-1 mt-5 mb-2">Spiritual Information</div>

                    <div className="col-sm-3 fw-semibold">Baptism Status</div>
                    <div className="col-sm-9">{Data.baptism_status}</div>

                    <div className="col-sm-3 fw-semibold">Baptized Date</div>
                    <div className="col-sm-9">{formatDate(Data.baptized_date)}</div>

                    <div className="col-sm-3 fw-semibold">Baptism Place</div>
                    <div className="col-sm-9">{Data.baptism_place}</div>

                    <div className="col-sm-3 fw-semibold">Baptism By</div>
                    <div className="col-sm-9">{Data.baptism_by}</div>

                    <div className="col-sm-3 fw-semibold">Confirmation Status</div>
                    <div className="col-sm-9">{Data.confirmation_status}</div>

                    <div className="col-sm-3 fw-semibold">Confirmation Date</div>
                    <div className="col-sm-9">{formatDate(Data.confirmation_date)}</div>

                    <div className="col-sm-3 fw-semibold">Confirmation Place</div>
                    <div className="col-sm-9">{Data.confirmation_place}</div>

                    <div className="col-sm-3 fw-semibold">Confirmation By</div>
                    <div className="col-sm-9">{Data.confirmation_by}</div>

                    <div className="col-sm-3 fw-semibold">Communion</div>
                    <div className="col-sm-9">{Data.communion}</div>

                    <div className="col-sm-3 fw-semibold">Communion Date</div>
                    <div className="col-sm-9">{formatDate(Data.communion_date)}</div>

                    <div className="col-sm-3 fw-semibold">Communion Place</div>
                    <div className="col-sm-9">{Data.communion_place}</div>

                    <div className="col-sm-3 fw-semibold">Communion By</div>
                    <div className="col-sm-9">{Data.communion_by}</div>

                    {/* ================== Marriage ================== */}
                    <div className="col-12 fw-bold text-lavender--600 text-base border-bottom pb-1 mt-5 mb-2">Marriage</div>
                    <div className="col-sm-3 fw-semibold">Marital Status</div>
                    <div className="col-sm-9">{Data.marital_status}</div>

                    {Data.marriage_date && (
                      <>
                        <div className="col-sm-3 fw-semibold">Marriage Date</div>
                        <div className="col-sm-9">{formatDate(Data.marriage_date)}</div>
                      </>
                    )}

                    <div className="col-sm-3 fw-semibold">Marriage Place</div>
                    <div className="col-sm-9">{Data.marriage_place}</div>

                    {/* ================== Membership Tracking ================== */}
                    <div className="col-12 fw-bold text-lavender--600 text-base border-bottom pb-1 mt-5 mb-2">Dual Membership</div>


                    <div className="col-sm-3 fw-semibold">Dual Member</div>
                    <div className="col-sm-9">{Data.dual_member}</div>

                    <div className="col-sm-3 fw-semibold">Church Name</div>
                    <div className="col-sm-9">{Data.church_name}</div>

                    <div className="col-sm-3 fw-semibold">Dual Member Id</div>
                    <div className="col-sm-9">{Data.dual_member_id}</div>

                    {Data.left_date && (
                      <>
                        <div className="col-sm-3 fw-semibold">Left Date</div>
                        <div className="col-sm-9">{formatDate(Data.left_date)}</div>
                      </>
                    )}

                    {Data.reason_for_inactive && (
                      <>
                        <div className="col-sm-3 fw-semibold">Reason for Inactive</div>
                        <div className="col-sm-9">{Data.reason_for_inactive}</div>
                      </>
                    )}

                    {Data.description && (
                      <>
                        <div className="col-sm-3 fw-semibold">Description</div>
                        <div className="col-sm-9">{Data.description}</div>
                      </>
                    )}

                    {Data.rejoining_date && (
                      <>
                        <div className="col-sm-3 fw-semibold">Rejoining Date</div>
                        <div className="col-sm-9">{formatDate(Data.rejoining_date)}</div>
                      </>
                    )}

                    {Data.reason_for_rejoining && (
                      <>
                        <div className="col-sm-3 fw-semibold">Reason for Rejoining</div>
                        <div className="col-sm-9">{Data.reason_for_rejoining}</div>
                      </>
                    )}

                  </div>
                </div>


              </div>
            </div>
          </div>

          {/* Toast Messages */}
          {Response.status !== null ? (
            Response.status === "Success" ? (
              <SuccessMessage Message={Response.message} />
            ) : Response.status === "Failed" ? (
              <FailedMessage Message={Response.message} />
            ) : null
          ) : null}
        </section>
      )}
    </React.Fragment>
  );
}

export default Preview;
