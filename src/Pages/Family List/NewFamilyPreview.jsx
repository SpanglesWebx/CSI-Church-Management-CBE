import React, { useEffect, useState } from 'react'
import { FaArrowLeft, FaEye, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";
import { FaEdit } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

export const NewFamilyPreview = () => {
  const navigate = useNavigate();
  const token = window.sessionStorage.getItem("token");
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [family, setFamily] = useState(null);
  const location = useLocation();
  const familyId = location.state?.familyId;

  const [familyPhoto, setFamilyPhoto] = useState(null);
  const [isPhotoHover, setIsPhotoHover] = useState(false);
  const [userRole, setUserRole] = useState("");


  useEffect(() => {
    if (!familyId) return;

    const token = sessionStorage.getItem("token");

    axios
      .get(`${URL}/family/${familyId}`, { headers: { Authorization: token } })
      .then(res => setFamily(res.data))
      .catch(err => console.log("Family Fetch Error:", err));
  }, [familyId]);

  useEffect(() => {
    if (familyPhoto && family?.family_id) {
      handleFamilyPhotoUpload();
    }
  }, [familyPhoto]);



  const handleFamilyPhotoUpload = async () => {
    if (!familyPhoto || !family) return;

    const formData = new FormData();
    formData.append("family_id", family.family_id);
    formData.append("photo", familyPhoto);

    try {
      const res = await axios.post(`${URL}/family/upload-photo`, formData, {
        headers: {
          Authorization: token,
          "Content-Type": "multipart/form-data"
        }
      });

      // ✅ Update UI instantly
      setFamily(prev => ({
        ...prev,
        photo: res.data.photo
      }));

      setFamilyPhoto(null);

    } catch (err) {
      console.log("Upload Error:", err);
    }
  };

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


  return (
    <>
<FaArrowLeft
  size={18}
  title='Back'
  onClick={() => navigate(-1)}
  className="cursor-pointer mb-4"
/>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[12px] border-2 border-lavender--600">

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-10 w-full items-start text-center">

          {/* Family Head */}
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center min-h-[60px]">
              <i className="fa-regular fa-user text-lavender--600 text-2xl mb-1"></i>
              <p className="text-sm text-gray-500">Family Head</p>
            </div>
            <p className="font-semibold text-gray-900">{family?.head_member_name}</p>
          </div>

          {/* Family ID */}
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center min-h-[60px]">
              <i className="fa-solid fa-sitemap text-lavender--600 text-2xl mb-1"></i>
              <p className="text-sm text-gray-500">Family ID</p>
            </div>
            <p className="font-semibold text-gray-900">{family?.family_id}</p>
          </div>

          {/* Address */}
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center min-h-[60px]">
              <i className="fa-solid fa-house text-lavender--600 text-2xl mb-1"></i>
              <p className="text-sm text-gray-500">Address</p>
            </div>
            <p className="font-semibold text-gray-900 text-center">
              {family?.address || "No Address"}
            </p>
          </div>

          <div className="flex flex-col items-center w-full">
            <div
              className="relative h-[6rem] w-40 border rounded-md overflow-hidden bg-gray-100 cursor-pointer"
              onMouseEnter={() => setIsPhotoHover(true)}
              onMouseLeave={() => setIsPhotoHover(false)}
            >
              {family?.photo ? (
                <>
                  {/* Image */}
                  <img
                    src={`${URL}${family.photo}?t=${Date.now()}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="Family"
                  />

                  {/* Dark Overlay */}
                  <div
                    className={`absolute inset-0 bg-black/40 transition duration-300 ${isPhotoHover ? "opacity-100" : "opacity-0"
                      }`}
                  />

                  {/* ✏️ Edit Icon */}
                  <label
                    htmlFor="familyPhotoUpload"
                    className={`
            absolute bottom-2 right-2 z-20
            bg-black text-white
            p-2 rounded-full shadow-lg
            cursor-pointer
            transition-all duration-200
            ${isPhotoHover ? "opacity-100 scale-100" : "opacity-0 scale-75"}
          `}
                  >
                    <FaEdit size={14} />
                  </label>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center px-2">
                  <span className="text-xs text-gray-500">
                    No Photo Uploaded
                  </span>
{["admin", "churchofficeworker",'officestaff'].includes(userRole) && (
                  <label
                    htmlFor="familyPhotoUpload"
                    className="text-xs text-lavender--600 font-medium mt-1 cursor-pointer"
                  >
                    Add Family Photo
                  </label>)}
                </div>
              )}

              {/* Hidden File Input */}
              {["admin", "churchofficeworker",'officestaff'].includes(userRole) && (
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => setFamilyPhoto(e.target.files[0])}
                className="hidden"
                id="familyPhotoUpload"
              />
              )}
            </div>
          </div>

        </div>
      </div>






      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-2">
          <h1 className="text-lg font-semibold">Family</h1>
          <div className="relative">
            <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
              <svg className="w-3 h-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
            </div>
            <input
              type="search"
              className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50"
              placeholder="Search by Name or ID"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
{["admin", "churchofficeworker", 'officestaff'].includes(userRole) && (
          <button onClick={() => navigate('/admin/memberlist/addnewmember')} className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg">
            <FaPlus /> Member
          </button>
)}
        </div>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-base text-gray-700 border-b">
              <tr>
                <th className="p-2 text-center">Sl No.</th>
                <th className="p-2 text-center">Member ID</th>
                <th className="p-2 text-center">Member Name</th>
                <th className="p-2 text-center">Tamil Name</th>
                <th className="p-2 text-center">Relation</th>
                <th className="p-2 text-center">Status</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {family?.members?.map((m, index) => (
                <tr key={m.member_id} className="border-b">
                  <td className="p-2 text-center">{index + 1}</td>
                  <td className="p-2 text-center">{m.member_id}</td>
                  <td className="p-2 text-left">{m.member_name}</td>
                  <td className="p-2 text-left">{m.member_tamil_name}</td>
                  <td className="p-2 text-center">{m.relation_with_head || "-"}</td>

                  <td className="p-2 text-center">
                    <span className={m.status === "Active" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                      {m.status}
                    </span>
                  </td>


                  <td className="p-2 text-center ">
                    <FaEye
                      size={18}
                      className="text-lavender--600 cursor-pointer mx-auto"
                      onClick={() =>
                        navigate(`/admin/familylist/familymemberslist/familymemberview/${m._id}`)
                      }

                    />
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </>
  )
}
