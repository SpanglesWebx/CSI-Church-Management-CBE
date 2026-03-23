import React, { useEffect, useRef, useState } from "react";
import { FaArrowLeft, FaEye, FaPlus } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";
import { TbTransferIn } from "react-icons/tb";
import SmallSizedModal from "../../Components/Expense/SmallSizedModal";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { jwtDecode } from "jwt-decode";

export const PastorFamPreview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = sessionStorage.getItem("token");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [userRole, setUserRole] = useState("");


  const [pastor, setPastor] = useState(null);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [CurrentPage, setCurrentPage] = useState(1);
  const [TotalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState([]);

  const [statusFilter, setStatusFilter] = useState("All");

  const [memberId, setMemberId] = useState("MBR");
    const [memberType, setMemberType] = useState("");
    const isPreparatory = memberType === "Preparatory/Unpaid Member";

    const [selectedMember, setSelectedMember] = useState(null);

const [familyId, setFamilyId] = useState("");
const [headIdSearch, setHeadIdSearch] = useState("");
const [headName, setHeadName] = useState("");
const [relation, setRelation] = useState("");

const [headDropdown, setHeadDropdown] = useState([]);
const [headValidationMsg, setHeadValidationMsg] = useState("");
const [headValidationType, setHeadValidationType] = useState("");
const [fatherName, setFatherName] = useState("");
const [motherName, setMotherName] = useState("");


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

const [isHead, setIsHead] = useState(true);

// debounce helper
const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

// 🔥 debounced head search (same logic as AddNewMember.jsx)
const debouncedHeadSearch = useRef(
  debounce(async (val) => {
    if (!val) {
      setHeadDropdown([]);
      return;
    }

    try {
      const res = await axios.get(
        `${URL}/member-search/by-id?id=${encodeURIComponent(val)}`,
        { headers: { Authorization: token } }
      );

      setHeadDropdown(res.data || []);
    } catch (err) {
      setHeadDropdown([
        { member_id: "none", member_name: "No Members Found" }
      ]);
    }
  }, 300)
).current;

// 🔥 Fetch family members (needed for Son/Daughter auto-fill)
const fetchFamilyMembers = async (famId) => {
  if (!famId) return null;

  try {
    const res = await axios.get(`${URL}/family/${famId}`, {
      headers: { Authorization: token }
    });
    return res.data; // { head_member_id, members: [...] }
  } catch (err) {
    console.log("Family fetch error:", err);
    return null;
  }
};

// ⭐ Auto-fill Father / Mother for Son or Daughter (SAME AS AddNewMember)
const autoFillParents = (family) => {
  if (!family || !family.members) return;

  const members = family.members;
  const headId = family.head_member_id;

  const headMember = members.find(m => m.member_id === headId);
  if (!headMember) return;

  let father = "";
  let mother = "";

  // If Head is Male → Father = Head
  if (headMember.gender === "Male") {
    father = headMember.member_name;

    const wife = members.find(m => m.relation_with_head === "Wife");
    if (wife) mother = wife.member_name;

  } else {
    // If Head is Female → Mother = Head
    mother = headMember.member_name;

    const husband = members.find(m => m.relation_with_head === "Husband");
    if (husband) father = husband.member_name;
  }

  setFatherName(father);
  setMotherName(mother);
};




  useEffect(() => {
    axios
      .get(`${URL}/pastors/${id}`, {
        headers: { Authorization: token }
      })
      .then((res) => setPastor(res.data.data))
      .catch((err) => console.log("Presbyter Fetch Error:", err));


  }, [id]);

  useEffect(() => {
    axios
      .get(
        `${URL}/pastors/family-members/${id}?page=${CurrentPage}&search=${searchTerm}&status=${statusFilter}`,
        { headers: { Authorization: token } }
      )
      .then((res) => {
        setPastor((prev) => prev || {}); // keep top card data from earlier fetch
        setMembers(res.data.data);
        setTotalPages(res.data.total_pages);
      })
      .catch((err) => console.log("Fetch Error:", err));
  }, [id, CurrentPage, searchTerm, statusFilter]);


  const resetTransferForm = () => {
  setMemberId("MBR");
  setMemberType("");
  setIsHead(true);
  setFamilyId("");
  setHeadIdSearch("");
  setHeadName("");
  setRelation("");
  setHeadDropdown([]);
  setHeadValidationMsg("");
  setHeadValidationType("");
};

useEffect(() => {
  if (isTransferModalOpen) {
    axios.get(`${URL}/new-members/init`, {
      headers: { Authorization: token }
    })
    .then((res) => {
      setMemberId(res.data.memberId);
    })
    .catch(() => setMemberId("MBR"));
  }
}, [isTransferModalOpen]);

// const handleMemberTypeChange = async (value) => {
//   setMemberType(value);

//   if (value === "Preparatory/Unpaid Member") {
//     // Preparatory member CANNOT be head
//     setIsHead(false);
//     setFamilyId("");
//     return;
//   }

//   // For all other member types → Head by default
//   setIsHead(true);

//   // Auto-generate family ID immediately when member type is selected
//   const nextFamId = await fetchNextFamilyId();
//   setFamilyId(nextFamId);
// };

const getBaseId = (id) => id.split("/")[0]; // helper

const handleMemberTypeChange = async (value) => {
  setMemberType(value);

  // Important: Take BASE from current auto-generated MBRxxxx (from init)
  const base = getBaseId(memberId);

  // ⭐ Preparatory Member = /2 + isHead = false
  if (value === "Preparatory/Unpaid Member") {
    setIsHead(false);
    setFamilyId(""); // No family ID for child yet
    setMemberId(base + "/2");
    return;
  }

  // ⭐ All other members = /1 + isHead = true
  setIsHead(true);
  setMemberId(base + "/1");

  // Fetch new family ID
  const nextFamId = await fetchNextFamilyId();
  setFamilyId(nextFamId);
};




const handleMemberIdChange = (e) => {
  let value = e.target.value;

  if (!value.startsWith("MBR")) return;

  let numeric = value.replace("MBR", "").replace(/[^0-9/]/g, "");
  let parts = numeric.split("/");

  if (parts[0].length > 5) parts[0] = parts[0].slice(0, 5);
  if (parts[1] && parts[1].length > 1) parts[1] = parts[1].slice(0, 1);

  let formatted = "MBR" + parts.join("/");
  setMemberId(formatted);
};

const handleFamilyIdChange = (e) => {
  let value = e.target.value.toUpperCase();

  // Must start with FAM
  if (!value.startsWith("FAM")) {
    value = "FAM";
  }

  // Extract digits only
  let numeric = value.replace("FAM", "").replace(/[^0-9]/g, "");

  // Limit to 5 digits
  if (numeric.length > 5) numeric = numeric.slice(0, 5);

  setFamilyId("FAM" + numeric);
};

// const validateHead = async (headId) => {
//   try {
//     const res = await axios.post(
//       `${URL}/new-members/validate-head`,
//       {
//         headMemberId: headId,
//         isPreparatory: memberType === "Preparatory/Unpaid Member"
//       },
//       { headers: { Authorization: token } }
//     );

//     // ✅ SAME AS AddNewMember.jsx
//     setFamilyId(res.data.familyId);
//     setHeadName(res.data.headName);
//     setMemberId(res.data.nextMemberId);   // ⭐ THIS IS THE MISSING LINE

//     setHeadValidationMsg("Family Head validated successfully");
//     setHeadValidationType("success");

//     setTimeout(() => {
//       setHeadValidationMsg("");
//       setHeadValidationType("");
//     }, 3000);

//   } catch (err) {
//     setHeadName("");
//     setHeadValidationMsg(
//       err.response?.data?.message || "Invalid Family Head ID"
//     );
//     setHeadValidationType("error");

//     setTimeout(() => {
//       setHeadValidationMsg("");
//       setHeadValidationType("");
//     }, 3000);
//   }
// };

const validateHead = async (headId) => {
  try {
    const res = await axios.post(
      `${URL}/new-members/validate-head`,
      {
        headMemberId: headId,
        isPreparatory: memberType === "Preparatory/Unpaid Member"
      },
      { headers: { Authorization: token } }
    );

    // ⭐ SAME AS AddNewMember
    setFamilyId(res.data.familyId);
    setHeadName(res.data.headName);
    setMemberId(res.data.nextMemberId);

    // ⭐ Fetch family & auto-fill parents if Son/Daughter
    fetchFamilyMembers(res.data.familyId).then((family) => {
      if (family && (relation === "Son" || relation === "Daughter")) {
        autoFillParents(family);
      }
    });

    setHeadValidationType("success");
    setHeadValidationMsg("Family Head validated successfully");

    setTimeout(() => {
      setHeadValidationMsg("");
      setHeadValidationType("");
    }, 3000);

  } catch (err) {
    setHeadName("");
    setHeadValidationType("error");
    setHeadValidationMsg(
      err.response?.data?.message || "Invalid Family Head ID"
    );

    setTimeout(() => {
      setHeadValidationMsg("");
      setHeadValidationType("");
    }, 3000);
  }
};

const fetchNextFamilyId = async () => {
  try {
    const res = await axios.get(`${URL}/new-members/next-family-id`, {
      headers: { Authorization: token }
    });
    return res.data.familyId;
  } catch (err) {
    console.log("Family ID Fetch Error:", err);
    return "";
  }
};


const handleTransferSubmit = async () => {
  if (!selectedMember) {
    return setResponse({ status: "Failed", message: "No member selected" });
  }

  if (!memberId || !memberType) {
    return setResponse({ status: "Failed", message: "Fill all required fields" });
  }

  const payload = {
    member_id: memberId,
    member_type: memberType,
    isHead: isHead ? "Yes" : "No",
    family_id: familyId,
    relation_with_head: isHead ? "Head" : relation
  };

  // ⭐ Detect if transferring the PASTOR
  const isPastor = selectedMember.relation === "Pastor";

  // ⭐ Build correct URL
  const transferUrl = isPastor
    ? `${URL}/pastors/transfer-family-member/${id}`
    : `${URL}/pastors/transfer-family-member/${id}/${selectedMember._id}`;

  try {
    await axios.post(transferUrl, payload, {
      headers: { Authorization: token }
    });

    setIsTransferModalOpen(false);
    setIsModalOpen(false);

    setResponse({
      status: "Success",
      message: "Member transferred successfully"
    });


  } catch (err) {
    setResponse({
      status: "Failed",
      message: err.response?.data?.message || "Transfer failed"
    });
  }
};




  if (!pastor) return <p className="text-center mt-10">Loading...</p>;






  return (
    <>
      <FaArrowLeft
        size={18}
        title="Back"
        onClick={() => navigate("/admin/pastorlist")}
        className="cursor-pointer mb-4"
      />

      {/* TOP INFO CARD */}
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[12px] border-2 border-lavender--600">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-10 w-full items-start text-center">


          {/* Pastor ID */}
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center min-h-[60px]">
              <i className="fa-solid fa-id-card text-lavender--600 text-2xl mb-1"></i>
              <p className="text-sm text-gray-500">Presbyter ID</p>
            </div>
            <p className="font-semibold text-gray-900">{pastor.pastor_id}</p>
          </div>

          {/* Pastor Family ID */}
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center min-h-[60px]">
              <i className="fa-solid fa-people-roof text-lavender--600 text-2xl mb-1"></i>
              <p className="text-sm text-gray-500">Presbyter Family ID</p>
            </div>
            <p className="font-semibold text-gray-900">{pastor.pastor_family_id}</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center min-h-[60px]">
              <i className="fa-solid fa-house text-lavender--600 text-2xl mb-1"></i>
              <p className="text-sm text-gray-500">Address</p>
            </div>
            <p className="font-semibold text-gray-900 text-center">
              {pastor.residential_address || "No Address"}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center min-h-[60px]">
              <i className="fa-solid fa-id-card text-lavender--600 text-2xl mb-1"></i>
              <p className="text-sm text-gray-500">Status</p>
            </div>
            <span
              className={`px-2 py-1 rounded text-center font-semibold text-xs 
                        ${pastor.status === "Active" ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500"}`}
            >
              {pastor.status}
            </span>
          </div>

        </div>
      </div>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-2">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 flex items-center pointer-events-none start-0 ps-3">
                <svg className="w-3 h-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input
                type="search"
                id="shop-search"
                className="block py-1 text-sm text-gray-900 rounded w-54 ps-8 bg-gray-50"
                placeholder="Search by Name or ID"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center p-4 space-x-3 space-y-3 lg:space-y-0 lg:space-x-3">
            <label className="text-l font-medium text-gray-600 mb-1">Presbyter Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="block py-1 text-sm text-gray-900 rounded w-40 px-3 bg-gray-50 focus:ring-lavender--600 focus:border-lavender--600"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
{["admin", "churchofficeworker", 'officestaff'].includes(userRole) && (
          <button
            onClick={() => navigate(`/admin/pastorlist/addpastorfamily/${id}`)}
            className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg"
          >
            <FaPlus /> Add Family Member
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
                <th className="p-2 text-center">Relation</th>
                <th className="p-2 text-center">Status</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-4 text-gray-400">
                    No Family Members Found
                  </td>
                </tr>
              ) : (
                members.map((m, index) => (
                  <tr key={m._id} className="border-b">
                    <td className="p-2 text-center">{index + 1}</td>
                    <td className="p-2 text-center">{m.member_id}</td>
                    <td className="p-2 text-left">{m.name}</td>
                    <td className="p-2 text-center">{m.relation}</td>
                    <td className="p-2 text-center">
                      <span
                        className={`px-2 py-1 rounded font-semibold text-xs 
                        ${m.status === "Active" ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500"}`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="p-2 text-center flex justify-center gap-3">
                      {m.relation === "Pastor" ? (
                        <FaEye
                          size={18}
                          onClick={() => navigate(`/admin/pastorlist/viewpastor/${pastor._id}`)}
                          className="text-lavender--600 cursor-pointer"
                        />
                      ) : (
                        <FaEye
                          size={18}
                          onClick={() => navigate(`/admin/pastorlist/viewpastorfammem/${id}/${m._id}`)}
                          className="text-lavender--600 cursor-pointer"
                        />
                      )}
{["admin", "churchofficeworker"].includes(userRole) && (
                      <TbTransferIn
                        size={18}
                        className="text-lavender--600 cursor-pointer"
                        onClick={() => {
                          setSelectedMember(m);
                          resetTransferForm();
                          setIsModalOpen(true);
                        }}
                      />
)}
                    </td>

                  </tr>
                ))
              )}
            </tbody>




          </table>
        </div>
        <div className="relative flex items-center justify-center mt-4 space-x-3 select-none">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={CurrentPage === 1} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">Previous</button>
          <button className="px-4 py-2 bg-lavender--600 text-white rounded">{CurrentPage}</button>
          <button onClick={() => setCurrentPage((p) => Math.min(TotalPages || p + 1, p + 1))} disabled={CurrentPage === TotalPages} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">Next</button>

          <div className="absolute right-2 flex space-x-2 px-4">
            <span className="px-4 py-2 bg-gray-100 rounded">Total Pages: {TotalPages}</span>
            <span onClick={() => TotalPages !== CurrentPage && setCurrentPage(TotalPages)} className={`${TotalPages === CurrentPage ? "opacity-50 cursor-not-allowed bg-gray-100 px-4 py-2" : "px-4 py-2 text-blue-600 bg-gray-100 rounded cursor-pointer"}`}>Last Page</span>
          </div>
        </div>

        {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}

        <SmallSizedModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Confirm Transfer"
        >
          <p className="text-gray-700 mb-4 text-center">
            Are you sure you want to Transfer this member?
          </p>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-300 rounded-md"
            >
              Cancel
            </button>

            <button
              className="px-4 py-2 bg-lavender--600 text-white rounded-md"
              onClick={() => setIsTransferModalOpen(true)}
            >
              Yes
            </button>
          </div>
        </SmallSizedModal>

        <Modal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} title="Transfer Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Member ID</label>
              <input
                type="text"
                value={memberId}
                onChange={handleMemberIdChange}
                onClick={(e) => {
                  // Prevent cursor from going before MBR
                  if (e.target.selectionStart < 3) {
                    e.target.setSelectionRange(3, 3);
                  }
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Member Type
              </label>

              <select
                value={memberType}
                onChange={(e) => handleMemberTypeChange(e.target.value)}
                required
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">Select Member Type</option>
                <option value="Full Member">Full Member</option>
                <option value="Dual Member">Dual Member</option>
                <option value="Preparatory/Unpaid Member">Preparatory/Unpaid Member</option>
                <option value="Non-Residential Member">Non-Residential Member</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Is Head</label>

              <div className="flex justify-center">
                <div className="relative flex bg-gray-200 rounded-full p-1 text-sm font-medium w-[70%]">

                  {/* animation background */}
                  <div
                    className="absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300"
                    style={{
                      width: "calc(50% - 0.25rem)",
                      transform: isHead ? "translateX(0)" : "translateX(100%)",
                    }}
                  />

                  <button
                    type="button"
                    disabled={memberType === "Preparatory/Unpaid Member"}   // ⭐ NEW
                    onClick={() => {
                      if (memberType === "Preparatory/Unpaid Member") return;

                      setIsHead(true);
                      fetchNextFamilyId().then(fid => setFamilyId(fid));
                    }}



                    className={`relative flex-1 py-1 text-center rounded-full
                    ${isHead ? "text-white" : "text-gray-700"}
                    ${memberType === "Preparatory/Unpaid Member" ? "opacity-40 cursor-not-allowed" : ""}
                    `}
                  >
                    Yes
                  </button>


                  {/* NO */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsHead(false);
                    }}

                    className={`relative flex-1 py-1 text-center rounded-full ${!isHead ? "text-white" : "text-gray-700"
                      }`}
                  >
                    No
                  </button>

                </div>
              </div>


            </div>
            {isHead && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Family ID</label>
                <input
                  type="text"
                  placeholder="Family ID"
                  value={familyId}
                  onChange={handleFamilyIdChange}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            )}
            {!isHead && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Family Head ID</label>

                <input
                  type="text"
                  placeholder="Enter Family Head ID"
                  value={headIdSearch}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHeadIdSearch(val);
                    debouncedHeadSearch(val);
                  }}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
                {headValidationMsg && (
                  <small
                    className={`mt-1 block text-xs ${headValidationType === "success"
                      ? "text-green-600"
                      : "text-red-600"
                      }`}
                  >
                    {headValidationMsg}
                  </small>
                )}

                {/* Dropdown */}
                {headDropdown.length > 0 && (
                  <ul className="absolute z-50 w-full bg-white mt-1 border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {headDropdown.map((m) => (
                      <li
                        key={m.member_id}
                        className={`flex px-3 py-2 text-sm ${m.member_id === "none"
                          ? "text-gray-500 cursor-default"
                          : "hover:bg-indigo-50 cursor-pointer"
                          }`}
                        onClick={() => {
                          if (m.member_id === "none") return;

                          // select
                          setHeadIdSearch(m.member_id);

                          // validate
                          validateHead(m.member_id);

                          // close dropdown
                          setHeadDropdown([]);
                        }}
                      >
                        <span className="w-[140px] font-medium">{m.member_id}</span>
                        <span className="ml-4 text-gray-800">{m.member_name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {!isHead && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Head of the Family</label>
                <input
                  type="text"
                  placeholder="Head of the Family"
                  value={headName}
                  readOnly
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            )}
            {!isHead && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Relation With Family Head
                </label>

                <select
                  required
                  value={relation}
                  onChange={async (e) => {
                    const rel = e.target.value;
                    setRelation(rel);

                    // ⭐ Only apply when Son or Daughter
                    if (rel === "Son" || rel === "Daughter") {
                      // Must have familyId first
                      if (familyId) {
                        const family = await fetchFamilyMembers(familyId);
                        autoFillParents(family);
                      }
                    }
                  }}

                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                >
                  <option value="">Select Relation</option>
                  <option value="Husband">Husband</option>
                  <option value="Wife">Wife</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                </select>
              </div> 
            )}
          </div>
          <div className="flex justify-end">

            <button
              className="px-4 py-2 bg-lavender--600 text-white rounded-md"
              onClick={handleTransferSubmit}
            >
              Transfer
            </button>
          </div>

        </Modal>

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
