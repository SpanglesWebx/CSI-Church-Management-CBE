import React, { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { URL } from "../../App";
import { jwtDecode } from "jwt-decode";

export const FamilyMemberView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = window.sessionStorage.getItem("token");
  const [userRole, setUserRole] = useState("");

  const [member, setMember] = useState(null);

  const fetchMember = async () => {
    try {
      const res = await axios.get(`${URL}/new-members/${id}`, {
        headers: { Authorization: token },
      });
      setMember(res.data.data);
    } catch (err) {
      console.error("Fetch Member Error:", err);
    }
  };

  useEffect(() => {
    fetchMember();
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


  if (!member) return <p className="text-center mt-10">Loading...</p>;

  

  return (
    <>
      {/* BACK BUTTON */}
      <FaArrowLeft
        size={18}
        title="Back"
        onClick={() => navigate(-1)}
        className="cursor-pointer mb-4"
      />

      {/* EDIT BUTTON */}
      {member.status === "Active" && ["admin", "churchofficeworker", 'officestaff'].includes(userRole) &&(
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => navigate(`/admin/memberlist/editmember/${id}`)}
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
          {member.photo ? (
            <img
              src={`${URL}${member.photo}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-gray-500 text-center px-2">
              No Photo Uploaded
            </span>
          )}
        </div>
      </div>

      {/* MEMBERSHIP DETAILS */}
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg text-lavender--600 font-semibold mb-3">
          Membership Details
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-3">
          {[
            { label: "Member ID", value: member.member_id },
            { label: "Member Type", value: member.member_type },
            { label: "Is Head", value: member.isHead },
            { label: "Family ID", value: member.family_id },
            member.isHead === "No" && {
              label: "Family Head ID",
              value: member.head_member_id || "-",
            },
            member.isHead === "No" && {
              label: "Head of Family",
              value: member.head_name || "-",
            },
            member.isHead === "No" && {
              label: "Relation With Head",
              value: member.relation_with_head || "-",
            },
          ]
            .filter(Boolean)
            .map((item, i) => (
              <div key={i} className="grid grid-cols-2 gap-4">
                <span className="text-md font-bold text-gray-600">
                  {item.label}
                </span>
                <span className="text-gray-800">{item.value}</span>
              </div>
            ))}
        </div>
      </div>

      {/* PERSONAL DETAILS */}
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg text-lavender--600 font-semibold mb-3">
          Personal Details
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-3">
          {[
            { label: "Father Name", value: member.father_name },
            { label: "Mother Name", value: member.mother_name },
            { label: "Member Name", value: member.member_name },
            { label: "Tamil Name", value: member.member_tamil_name || "-" },
            { label: "Gender", value: member.gender },
            {
              label: "Date of Birth",
              value: member.dob
                ? moment(member.dob).format("DD-MMM-YYYY")
                : "-",
            },
            { label: "Age", value: member.age ?? "-" },
            { label: "Place of Birth", value: member.place_of_birth || "-" },
            { label: "Aadhar Number", value: member.aadhar_number || "-" },
            {
              label: "Contact Numbers",
              value: member.contact_numbers?.join(", ") || "-",
            },
            { label: "Email", value: member.email || "-" },
            { label: "Blood Group", value: member.blood_group || "-" },
            {
              label: "Joining Date",
              value: member.joining_date
                ? moment(member.joining_date).format("DD-MMM-YYYY")
                : "-",
            },
            { label: "Qualification", value: member.qualification || "-" },
            { label: "Occupation", value: member.occupation || "-" },
            { label: "Community", value: member.community || "-" },
            { label: "Nationality", value: member.nationality || "-" },
            {
              label: "Status",
              value: member.status,
              isStatus: true,
            },
            {
              label: "Membership Status",
              value: member.membership_status,
            },
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

      {/* ADDRESS */}
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg text-lavender--600 font-semibold mb-3">
          Address
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-3">
          {[
            { label: "Zone", value: member.zone || "-" },
            { label: "Area", value: member.area || "-" },
            {
              label: "Residential Address",
              value: member.present_address || "-",
            },
            {
              label: "Permanent Address",
              value: member.permanent_address || "-",
            },
            {
              label: "Residential Pincode",
              value: member.present_pincode || "-",
            },
            {
              label: "Permanent Pincode",
              value: member.permanent_pincode || "-",
            },
          ].map((item, i) => (
            <div key={i} className="grid grid-cols-2 gap-4">
              <span className="text-md font-bold text-gray-600">
                {item.label}
              </span>
              <span className="text-gray-800 whitespace-pre-wrap">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg text-lavender--600 font-semibold mb-3">Dual Membership</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-3">
          {[
            { label: "Is Dual Member", value: member.is_dual_member || "" },
            { label: "Dual Member ID", value: member.dual_member_id || "-" },
            { label: "Church Name", value: member.dual_church_name || "-" },
          ].map((item, i) => (
            <div key={i} className="grid grid-cols-2 gap-4">
              <span className="text-md font-bold text-gray-600">{item.label}</span>
              <span className="text-gray-800">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SPIRITUAL INFO */}
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg text-lavender--600 font-semibold mb-3">
          Spiritual Information
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-3 border-b pb-6">
          {[
            { label: "Baptism Status", value: member.baptism || "-" },
            {
              label: "Baptism Date",
              value: member.baptism_date
                ? moment(member.baptism_date).format("DD-MMM-YYYY")
                : "-",
            },
            { label: "Baptized By", value: member.baptism_by || "-" },
            { label: "Baptized Church", value: member.baptism_church || "-" },
          ].map((item, i) => (
            <div key={i} className="grid grid-cols-2 gap-4">
              <span className="text-md font-bold text-gray-600">
                {item.label}
              </span>
              <span className="text-gray-800">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-3">
          {[
            { label: "Confirmation Status", value: member.confirmation || "-" },
            {
              label: "Confirmation Date",
              value: member.confirmation_date
                ? moment(member.confirmation_date).format("DD-MMM-YYYY")
                : "-",
            },
            { label: "Confirmed By", value: member.confirmation_by || "-" },
            {
              label: "Confirmed Church",
              value: member.confirmation_church || "-",
            },
          ].map((item, i) => (
            <div key={i} className="grid grid-cols-2 gap-4">
              <span className="text-md font-bold text-gray-600">
                {item.label}
              </span>
              <span className="text-gray-800">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* MARITAL INFO */}
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg text-lavender--600 font-semibold mb-3">
          Marital Information
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-3">
          {[
            { label: "Marital Status", value: member.marital_status || "-" },
            {
              label: "Marriage Date",
              value: member.marriage_date
                ? moment(member.marriage_date).format("DD-MMM-YYYY")
                : "-",
            },
            {
              label: "Marriage Place",
              value: member.marriage_place || "-",
            },
          ].map((item, i) => (
            <div key={i} className="grid grid-cols-2 gap-4">
              <span className="text-md font-bold text-gray-600">
                {item.label}
              </span>
              <span className="text-gray-800">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
