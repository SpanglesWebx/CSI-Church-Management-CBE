import React, { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { URL } from "../../App";
import { CiEdit } from "react-icons/ci";
import { jwtDecode } from "jwt-decode";


export const ViewPastor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = window.sessionStorage.getItem("token");
  const [userRole, setUserRole] = useState("");

  const [pastor, setPastor] = useState(null);

  const fetchPastor = async () => {
    try {
      const res = await axios.get(`${URL}/pastors/${id}`, {
        headers: { Authorization: token },
      });
      setPastor(res.data.data);
    } catch (err) {
      console.error("Fetch Presbyter Error:", err);
    }
  };

  useEffect(() => {
    fetchPastor();
  }, [id]);

  
    useEffect(() => {
    if (!token) return;
  
    try {
      const decoded = jwtDecode(token);
      console.log("Decoded roles:", decoded.roles);
  
      // If multiple roles exist, pick the active/stored one
      const storedRole = sessionStorage.getItem("role");
  
      if (storedRole && decoded.roles?.includes(storedRole)) {
        setUserRole(storedRole);
      } else {
        setUserRole(decoded.roles?.[0] || "");
      }
    } catch (err) {
      console.error("Invalid token", err);
    }
  }, [token]); 

  if (!pastor) return <p className="text-center mt-10">Loading...</p>;

  


  return (
    <>
      <FaArrowLeft
        size={18}
        title="Back"
        onClick={() => navigate(-1)}
        className="cursor-pointer mb-4"
      />
      {pastor.status === "Active" && ["admin", "churchofficeworker", 'officestaff'].includes(userRole) && (
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => navigate(`/admin/pastorlist/editpastor/${id}`)}
            className="flex items-center gap-2 px-4 py-2 text-lavender--600 font-semibold rounded-md"
          >
            <span>Edit</span>
            <CiEdit size={20} />
          </button>
        </div>
      )}

      <div className="flex justify-end mb-3">
        <div className="w-32 h-40 border rounded-md flex items-center justify-center overflow-hidden bg-gray-100">
          {pastor.pastor_photo ? (
            <img
              src={`${URL}/uploads/pastors/${pastor.pastor_photo}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-gray-500 px-2">No Photo</span>
          )}
        </div>
      </div>

      {/* PERSONAL DETAILS */}
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg text-lavender--600 font-semibold mb-3">Presbyter Details</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-3">
          {[
            { label: "Presbyter ID", value: pastor.pastor_id },
            { label: "Presbyter Family ID", value: pastor.pastor_family_id },
            { label: "Presbyter Name", value: pastor.pastor_name },
            { label: "Presbyter Tamil Name", value: pastor.pastor_tamil_name },
            { label: "Presbyter Role", value: pastor.pastor_role },
            { label: "Gender", value: pastor.gender },
            { label: "Age", value: pastor.age ?? "-" },
            {
              label: "Date of Birth",
              value: pastor.dob ? moment(pastor.dob).format("DD-MMM-YYYY") : "-",
            },
            {
              label: "Joining Date",
              value: pastor.joining_date
                ? moment(pastor.joining_date).format("DD-MMM-YYYY")
                : "-",
            },
            {
              label: "Marriage Date",
              value: pastor.marriage_date
                ? moment(pastor.marriage_date).format("DD-MMM-YYYY")
                : "-",
            },
            { label: "Aadhar Number", value: pastor.aadhar_number },
            {
              label: "Contact Numbers",
              value: pastor.contact_numbers?.length
                ? pastor.contact_numbers.join(", ")
                : "-",
            },
            { label: "Email", value: pastor.email || "-" },
            { label: "Residential Address", value: pastor.residential_address || "-" },
            {
              label: "Status",
              value: pastor.status,
              isStatus: true,
            },
            ...(pastor.status === "Inactive"
              ? [
                {
                  label: "Left Date",
                  value: pastor.left_date
                    ? moment(pastor.left_date).format("DD-MMM-YYYY")
                    : "-",
                },
                {
                  label: "Inactive Reason",
                  value: pastor.inactive_reason || "-",
                },
              ]
              : []),
          ].map((item, i) => (
            <div key={i} className="grid grid-cols-2 gap-4">
              <span className="text-md font-bold text-gray-600">{item.label}</span>
              <span
                className={
                  item.isStatus
                    ? pastor.status === "Active"
                      ? "text-green-600 font-semibold inline-block"
                      : "text-red-600  font-semibold inline-block"
                    : "text-gray-800"
                }
              >
                {item.value}
              </span>

            </div>
          ))}
        </div>
      </div>
    </>
  );
};
