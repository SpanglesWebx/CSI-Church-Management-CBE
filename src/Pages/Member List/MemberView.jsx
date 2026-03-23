import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaPrint } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { URL } from "../../App";
import { CiEdit } from "react-icons/ci";
import { FiDownload } from "react-icons/fi";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { jwtDecode } from "jwt-decode";

export const MemberView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = window.sessionStorage.getItem("token");
    const [Response, setResponse] = useState({ status: null, message: "" });


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

  const shortTitle = (title) => {
    switch (title) {
      case "Mister": return "Mr";
      case "Miss": return "Ms";      // or return "Miss" if you prefer
      case "Master": return "Master";
      case "Mrs": return "Mrs";
      default: return title || "";
    }
  };

  const showToast = (status, message) => {
  setResponse({ status: null, message: "" });
  setTimeout(() => setResponse({ status, message }), 10);
  setTimeout(() => setResponse({ status: null, message: "" }), 3000);
};


 const downloadSingleMember = async () => {
  try {
    const res = await axios.get(
      `${URL}/new-members/download/${id}`,
      {
        headers: { Authorization: token },
        responseType: "arraybuffer",
      }
    );

    const blob = new Blob([res.data], { type: "application/pdf" });
    const blobURL = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobURL;
    link.download = `${member.member_id}.pdf`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobURL);

    showToast("Success", "Member PDF downloaded");
  } catch (err) {
    showToast("Failed", "Download failed");
  }
};




  if (!member) return <p className="text-center mt-10">Loading...</p>;

  return (
    <>
      <FaArrowLeft
        size={18}
        title="Back"
        onClick={() => navigate(-1)}
        className="cursor-pointer mb-4"
      />

      {member.status === "Active" && (
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
      {["admin", "treasurer"].includes(userRole) && (
      <div className="flex items-center justify-end p-1">
        <div className="flex items-center justify-between gap-3">
          <FiDownload size={20} className="text-lavender--600 cursor-pointer" title="Download" onClick={downloadSingleMember} />
          <FaPrint size={20} className="text-lavender--600 cursor-pointer" title="Print" onClick={() => {
            const w = window.open(`${URL}/new-members/members/pdf/${id}`, "_blank");
            w.onload = () => w.print();
          }} />
        </div>
      </div>
      )}
 
      {/* ✅ MEMBERSHIP DETAILS */}
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg text-lavender--600 font-semibold mb-3">Membership Details</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-3">

          {/* Member ID */}
          <div className="grid grid-cols-2 gap-4">
            <span className="text-md font-bold text-gray-600">Member ID</span>
            <span className="text-gray-800">{member.member_id}</span>
          </div>

          {/* Member Type */}
          <div className="grid grid-cols-2 gap-4">
            <span className="text-md font-bold text-gray-600">Member Type</span>
            <span className="text-gray-800">{member.member_type}</span>
          </div>

          {/* Is Head */}
          <div className="grid grid-cols-2 gap-4">
            <span className="text-md font-bold text-gray-600">Is Head</span>
            <span className="text-gray-800">{member.isHead}</span>
          </div>


          {/* Family ID (if HEAD) */}
          {member.isHead === "Yes" && (
            <div className="grid grid-cols-2 gap-4">
              <span className="text-md font-bold text-gray-600">Family ID</span>
              <span className="text-gray-800">{member.family_id}</span>
            </div>
          )}

          {/* Family Head ID (if NOT head) */}
          {member.isHead === "No" && (
            <div className="grid grid-cols-2 gap-4">
              <span className="text-md font-bold text-gray-600">Family ID</span>
              <span className="text-gray-800">{member.family_id}</span>
            </div>
          )}
          {member.isHead === "No" && (
            <div className="grid grid-cols-2 gap-4">
              <span className="text-md font-bold text-gray-600">Family Head ID</span>
              <span className="text-gray-800">{member.head_member_id}</span>
            </div>
          )}

          {/* Head Name – requires fetching family info */}
          {member.isHead === "No" && (
            <div className="grid grid-cols-2 gap-4">
              <span className="text-md font-bold text-gray-600">Head of Family</span>
              <span className="text-gray-800">{member.head_name || "-"}</span>
            </div>
          )}

          {/* Relation */}
          {member.isHead === "No" && (
            <div className="grid grid-cols-2 gap-4">
              <span className="text-md font-bold text-gray-600">Relation With Head</span>
              <span className="text-gray-800">{member.relation_with_head || "-"}</span>
            </div>
          )}

        </div>
      </div>


      {/* 🔁 TRANSFER DETAILS */}
      {member.is_transferred === "Yes" && (
        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <h1 className="text-lg text-lavender--600 font-semibold mb-3">
            Transfer Details
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-3">

            {/* Old Family ID */}
            {member.old_family_id && (
              <div className="grid grid-cols-2 gap-4">
                <span className="text-md font-bold text-gray-600">Old Family ID</span>
                <span className="text-gray-800">{member.old_family_id}</span>
              </div>
            )}

            {/* Transfer Date */}
            {member.family_changed_at && (
              <div className="grid grid-cols-2 gap-4">
                <span className="text-md font-bold text-gray-600">Family Transferred On</span>
                <span className="text-gray-800">
                  {moment(member.family_changed_at).format("DD-MMM-YYYY hh:mm A")}
                </span>
              </div>
            )}

            {/* Old Member ID */}
            {member.old_member_id && (
              <div className="grid grid-cols-2 gap-4">
                <span className="text-md font-bold text-gray-600">Old Member ID</span>
                <span className="text-gray-800">{member.old_member_id}</span>
              </div>
            )}

            {member.old_member_id_changed_at && (
              <div className="grid grid-cols-2 gap-4">
                <span className="text-md font-bold text-gray-600">Old Member ID Changed On</span>
                <span className="text-gray-800">
                  {moment(member.old_member_id_changed_at).format("DD-MMM-YYYY hh:mm A")}
                </span>
              </div>
            )}

            { }
            {member.old_member_type && (
              <div className="grid grid-cols-2 gap-4">
                <span className="text-md font-bold text-gray-600">Old Member Type</span>
                <span className="text-gray-800">{member.old_member_type}</span>
              </div>
            )}

            {member.old_member_type_changed_at && (
              <div className="grid grid-cols-2 gap-4">
                <span className="text-md font-bold text-gray-600">Old Member Type Changed On</span>
                <span className="text-gray-800">
                  {moment(member.old_member_type_changed_at).format("DD-MMM-YYYY hh:mm A")}
                </span>
              </div>
            )}

            {/* Inactive Description */}
           
          </div>
        </div>
      )}



      {/* ✅ PERSONAL DETAILS */}
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg text-lavender--600 font-semibold mb-3">Personal Details</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 p-3">
          {[

            {
              label: "Member Name",
              value:
                (member.member_title ? shortTitle(member.member_title) + " " : "") +
                (member.member_name || "-"),
            },
            {
              label: "Member Tamil Name",
              value:
                (member.member_tamil_title ? member.member_tamil_title + " " : "") +
                (member.member_tamil_name || "-"),
            },
            { label: "Father Name", value: member.father_name },
            { label: "Mother Name", value: member.mother_name },
            { label: "Gender", value: member.gender || "-" },
            {
              label: "Date of Birth",
              value: member.dob ? moment(member.dob).format("DD-MMM-YYYY") : "-",
            },
            { label: "Age", value: member.age ?? "-" },
            { label: "Place of Birth", value: member.place_of_birth || "-" },

            { label: "Primary Number", value: member.primary_contact_number || "-" },
            {
              label: "Contact Numbers",
              value:
                Array.isArray(member.contact_numbers) &&
                  member.contact_numbers.filter(n => n && n.trim() !== "").length > 0
                  ? member.contact_numbers
                    .filter(n => n && n.trim() !== "")
                    .join(", ")
                  : "-"
            },

            
            { label: "Primary Email", value: member.primary_email || "-" },
            { label: "Email", value: member.email || "-" },
            { label: "Blood Group", value: member.blood_group || "-" },
            {
              label: "Membership From",
              value: member.membership_from
                ? moment(member.membership_from).format("DD/MM/YYYY")
                : "",
            },
            { label: "Qualification", value: member.qualification || "-" },
            { label: "Occupation", value: member.occupation || "-" },
            { label: "Aadhar Number", value: member.aadhar || "-" },
            { label: "", value: member.colbreak || "" },
            {
              label: "Status",
              value: member.status,
              isStatus: true,
            },
            ...(member.status === "Inactive"
              ? [
                {
                  label: "Inactive Reason",
                  value: member.inactive_reason || "-",
                },
                ...(member.inactive_description &&
                  member.inactive_description.trim() !== ""
                  ? [
                    {
                      label: "Inactive Description",
                      value: member.inactive_description,
                      isMultiline: true,
                    },
                  ]
                  : []),
              ]
              : []),

            {
              label: "Membership Status",
              value: (
                <span
                  className={
                    member.membership_status === "Unhold"
                      ? "text-green-600 font-semibold"
                      : "text-red-600 font-semibold"
                  }
                >
                  {member.membership_status}
                </span>
              ),
              isRaw: true
            },

           
          ].map((item, i) => (
            <div key={i} className="grid grid-cols-2 gap-4">
              <span className="text-md font-bold text-gray-600">{item.label}</span>

              <span
                className={
                  item.isStatus
                    ? item.value === "Active"
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

      {/* ✅ DUAL MEMBERSHIP */}
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

      {/* ✅ ADDRESS */}
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg text-lavender--600 font-semibold mb-3">Address</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-3">
          {[
            { label: "Zone", value: member.zone || "-" },
            { label: "Area", value: member.area || "-" },
            { label: "Residential Address", value: member.present_address || "-" },
            { label: "Permanent Address", value: member.permanent_address || "-" },
            { label: "Official Address", value: member.official_address || "-" },
            { label: "Official Pincode", value: member.official_pincode || "-" },
            { label: "Residential Pincode", value: member.present_pincode || "-" },
            { label: "Permanent Pincode", value: member.permanent_pincode || "-" },


          ].map((item, i) => (
            <div key={i} className="grid grid-cols-2 gap-4">
              <span className="text-md font-bold text-gray-600">{item.label}</span>
              <span className="text-gray-800 whitespace-pre-wrap">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ SPIRITUAL INFORMATION */}
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg text-lavender--600 font-semibold mb-3">Spiritual Information</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-3 pb-8 border-b border-gray-400">
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
              <span className="text-md font-bold text-gray-600">{item.label}</span>
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
            { label: "Confirmed Church", value: member.confirmation_church || "-" },
          ].map((item, i) => (
            <div key={i} className="grid grid-cols-2 gap-4">
              <span className="text-md font-bold text-gray-600">{item.label}</span>
              <span className="text-gray-800">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ MARITAL INFORMATION */}
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg text-lavender--600 font-semibold mb-3">Marital Information</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-3">
          {[
            { label: "Marital Status", value: member.marital_status || "-" },
            {
              label: "Marriage Date",
              value: member.marriage_date
                ? moment(member.marriage_date).format("DD-MMM-YYYY")
                : "-",
            },
            { label: "Marriage Place", value: member.marriage_place || "-" },
          ].map((item, i) => (
            <div key={i} className="grid grid-cols-2 gap-4">
              <span className="text-md font-bold text-gray-600">{item.label}</span>
              <span className="text-gray-800">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {Response.status &&
              (Response.status === "Success" ? (
                <SuccessMessage Message={Response.message} />
              ) : (
                <FailedMessage Message={Response.message} />
              ))}
    </>
  );
};
