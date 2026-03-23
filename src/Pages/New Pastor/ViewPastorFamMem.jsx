import React, { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { URL } from "../../App";
import { CiEdit } from "react-icons/ci";
import { jwtDecode } from "jwt-decode";

export const ViewPastorFamMem = () => {
  const navigate = useNavigate();
  const { pastorId, memberId } = useParams();
  const token = sessionStorage.getItem("token");

  const [pastor, setPastor] = useState(null);
  const [member, setMember] = useState(null);
  const [userRole, setUserRole] = useState("");

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

  // Fetch Pastor → Extract Family Member
  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await axios.get(`${URL}/pastors/${pastorId}`, {
          headers: { Authorization: token }
        });

        setPastor(res.data.data);

        // Find specific family member
        const found = res.data.data.family_members.find(
          (m) => m._id === memberId
        );

        setMember(found || null);
      } catch (err) {
        console.error("Fetch Member Error:", err);
      }
    };

    fetchMember();
  }, [pastorId, memberId]);

  if (!pastor || !member)
    return <p className="text-center mt-10">Loading...</p>;

  return (
    <>
      {/* Back Button */}
      <FaArrowLeft
        size={18}
        title="Back"
        onClick={() => navigate(-1)}
        className="cursor-pointer mb-4"
      />

      {member.status === "Active" && ["admin", "churchofficeworker"].includes(userRole) &&(
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => navigate(`/admin/pastorlist/editpastorfammem/${pastorId}/${memberId}`)}
            className="flex items-center gap-2 px-4 py-2 text-lavender--600 font-semibold rounded-md"
          >
            <span>Edit</span>
            <CiEdit size={20} />
          </button>
        </div>
      )}

      {/* PHOTO */}
      <div className="flex justify-end mb-3">
        <div className="w-32 h-40 border rounded-md flex items-center justify-center overflow-hidden bg-gray-100">
          {member.member_photo ? (
            <img
              src={`${URL}/uploads/pastors/${member.member_photo}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-gray-500 px-2">No Photo</span>
          )}
        </div>
      </div>

      {/* FAMILY MEMBER DETAILS */}
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg text-lavender--600 font-semibold mb-3">
          Family Member Details
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-3">

          {[
            { label: "Member ID", value: member.member_id },
            { label: "Name", value: member.name },
            { label: "Tamil Name", value: member.tamil_name || "-" },
            { label: "Relation", value: member.relation },
            { label: "Gender", value: member.gender || "-" },
            { label: "Age", value: member.age ?? "-" },
            {
              label: "Date of Birth",
              value: member.dob
                ? moment(member.dob).format("DD-MMM-YYYY")
                : "-"
            },
            {
              label: "Aadhar Number",
              value: member.aadhar_number || "-"
            },
            {
              label: "Contact Numbers",
              value:
                member.contact_numbers?.length
                  ? member.contact_numbers.join(", ")
                  : "-"
            },
            { label: "Email", value: member.email || "-" },
            {
              label: "Status",
              value: member.status,
              isStatus: true
            }
          ].map((item, i) => (
            <div key={i} className="grid grid-cols-2 gap-4">
              <span className="text-md font-bold text-gray-600">
                {item.label}
              </span>

              <span
                className={
                  item.isStatus
                    ? member.status === "Active"
                      ? "text-green-600 font-semibold"
                      : "text-red-600 font-semibold"
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
