import React, { useEffect, useRef, useState } from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom';
import { URL } from '../../App';
import axios from 'axios';
import { FailedMessage, SuccessMessage } from '../../Components/ToastMessage';

export const AddBaptismCert = () => {
  const navigate = useNavigate();
  const [baptismType, setBaptismType] = useState("");
  const [certificateIssued, setCertificateIssued] = useState("");
  const [issuedOn, setIssuedOn] = useState("");
  const token = sessionStorage.getItem("token");

  const [isMember, setIsMember] = useState(true);

  const [idSearch, setIdSearch] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const [dropdown, setDropdown] = useState([]);
  const [memberData, setMemberData] = useState({});
  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");
  const [profession, setProfession] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [fatherProfession, setFatherProfession] = useState("");
  const [fatherAadhar, setFatherAadhar] = useState("");
  const [motherProfession, setMotherProfession] = useState("");
  const [motherAadhar, setMotherAadhar] = useState("");
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [baptismDate, setBaptismDate] = useState("");
  const [baptismPlace, setBaptismPlace] = useState("");
  const [baptisedBy, setBaptisedBy] = useState("");
const [godParents, setGodParents] = useState([]);
const [godParentInput, setGodParentInput] = useState("");
  const [witnesses, setWitnesses] = useState("");
  const [remarks, setRemarks] = useState("");
  const [certificateIssuedBy, setCertificateIssuedBy] = useState("");
  const [nextBaptismId, setNextBaptismId] = useState("");
  const [pastors, setPastors] = useState([]);

useEffect(() => {
  axios.get(`${URL}/baptisms/next-id`, {
    headers: { Authorization: token }
  }).then(res => {
    setNextBaptismId(res.data.next);   // ✅ correct
  });
}, []);

useEffect(() => {
  axios
    .get(`${URL}/pastors/active/list`, {
      headers: { Authorization: token }
    })
    .then(res => {
      setPastors(res.data.data || []);
    })
    .catch(err => {
      console.error("Failed to load pastors", err);
    });
}, []);


  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedSearchById = useRef(
    debounce(async (val) => {
      if (!val) return setDropdown([]);
      const res = await axios.get(`${URL}/baptism-member-search/id`, {
        headers: { Authorization: token },
        params: { query: val },
      });
      setDropdown(res.data || []);
    }, 300)
  ).current;

  const debouncedSearchByName = useRef(
    debounce(async (val) => {
      if (!val) return setDropdown([]);
      const res = await axios.get(`${URL}/baptism-member-search/name`, {
        headers: { Authorization: token },
        params: { query: val },
      });
      setDropdown(res.data || []);
    }, 300)
  ).current;

  const formatAadhar = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 12); // only 12 digits

    return digits
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .trim();
  };

  const calculateAge = (dob) => {
  if (!dob) return "";
  const birth = new Date(dob);
  const today = new Date();

  let years = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    years--;
  }
  return years > 0 ? String(years) : "0";
};

const addGodParent = (e) => {
  if (e.key === "Enter" && godParentInput.trim()) {
    e.preventDefault();

    if (!godParents.includes(godParentInput.trim())) {
      setGodParents([...godParents, godParentInput.trim()]);
    }

    setGodParentInput("");
  }
};

const removeGodParent = (name) => {
  setGodParents(godParents.filter((p) => p !== name));
};


  const showToast = (status, message) => {
    setResponse({ status: null, message: "" });
    setTimeout(() => setResponse({ status, message }), 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  };

  const handleSubmit = async () => {
    try {
      await axios.post(
        `${URL}/baptisms`,
        {
          isMember, // ✅ NEW
          member_id: isMember ? idSearch : null,
          member_name: nameSearch,
          phone: !isMember ? memberData.phone : null,
          dob,
          age,
          profession,
          aadhar_number: aadhar,
          place_of_birth: birthPlace,
          father_name: fatherName,
          father_profession: fatherProfession,
          father_aadhar: fatherAadhar,
          mother_name: motherName,
          mother_profession: motherProfession,
          mother_aadhar: motherAadhar,
          address,
          pincode,
          baptism_date: baptismDate,
          baptism_type: baptismType,
          baptism_place: baptismPlace,
          baptised_by: baptisedBy,
          god_parents: godParents.join(", "),
          witnesses,
          remarks,
          certificate_issued: certificateIssued,   // ✅ FIX
          issued_on: issuedOn,                     // ✅ FIX
          issued_by: certificateIssuedBy

        },
        { headers: { Authorization: token } }
      );

      showToast("Success", "Baptism added successfully");

      // navigate after toast duration (3 seconds)
      setTimeout(() => {
        navigate("/admin/baptismcertlist");
      }, 3000);
    } catch (err) {
      showToast(
        "Failed",
        err.response?.data?.error || "Error adding baptism"
      );
    }
  };



  return (
    <>
      <FaArrowLeft
        size={18}
        title='Back'
        onClick={() => navigate("/admin/baptismcertlist")}
        className="cursor-pointer mb-4"
      />
      <h1 className="text-lg text-lavender--600 font-semibold">Add Baptism</h1>
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className='flex justify-between gap-3'>
          <h1 className="text-lg text-lavender--600 font-semibold">Member Details</h1>
          <h1 className="text-sm text-lavender--600 font-semibold">Baptism ID: <span className="text-black">{nextBaptismId}</span></h1>
        </div>
        {/* Member / Non-Member Toggle */}
        <div className="mb-4 flex justify-end">
          <div className="relative flex bg-gray-200 rounded-full p-1 text-sm font-medium w-56">

            {/* Sliding highlight */}
            <div
              className="absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300"
              style={{
                width: "calc(50% - 0.25rem)",
                transform: isMember ? "translateX(0)" : "translateX(100%)",
              }}
            />

            {/* Member */}
            <button
              type="button"
              onClick={() => {
                setIsMember(true);

                // reset non-member fields
                setNameSearch("");
                setIdSearch("");
                setDropdown([]);
              }}
              className={`relative flex-1 py-1 text-center rounded-full transition-colors duration-300 
        ${isMember ? "text-white" : "text-gray-700"}`}
            >
              Member
            </button>

            {/* Non-Member */}
            <button
              type="button"
              onClick={() => {
                setIsMember(false);

                // clear member search & auto-filled data
                setIdSearch("");
                setNameSearch("");
                setDropdown([]);
              }}
              className={`relative flex-1 py-1 text-center rounded-full transition-colors duration-300 
        ${!isMember ? "text-white" : "text-gray-700"}`}
            >
              Non-Member
            </button>
          </div>
        </div>

{isMember && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2 relative">

          {/* ID Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Member ID <span className='text-red-500 font-bold text-[17px]'>*</span>
            </label>
            <input
              type="text"
              placeholder="Search Member ID"
              value={idSearch}
              onChange={(e) => {
                setIdSearch(e.target.value);
                debouncedSearchById(e.target.value);
                setNameSearch("");
              }}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          {/* Name Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Member Name <span className='text-red-500 font-bold text-[17px]'>*</span>
            </label>
            <input
              type="text"
              placeholder="Search Member Name"
              value={nameSearch}
              onChange={(e) => {
                setNameSearch(e.target.value);
                debouncedSearchByName(e.target.value);
                setIdSearch("");
              }}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          {/* Dropdown */}
          {dropdown.length > 0 && (
            <ul className="absolute mt-[75px] w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto">
              {dropdown.map((m) => (
                <li
                  key={m.member_id}
                  className="flex px-3 py-2 text-sm hover:bg-indigo-50 cursor-pointer"
                  onClick={() => {
                    setIdSearch(m.member_id);
                    setNameSearch(m.member_name);
                    setDropdown([]);
                    setMemberData(m);   // 🔥 auto-fill trigger
                    setDob(m.dob || "");
                    setAge(m.age || "");
                    setProfession(m.occupation || "");
                    setAadhar(m.aadhar_number || "");
                    setBirthPlace(m.place_of_birth || "");
                    setFatherName(m.father_name || "");
                    setMotherName(m.mother_name || "");
                    setAddress(m.present_address || "");
                    setPincode(m.present_pincode || "");
                  }}
                >
                  <span className="w-1/2 font-medium">{m.member_id}</span>
                  <span className="w-1/2">{m.member_name}</span>
                </li>
              ))}
            </ul>
          )}
          

        </div>
)}
{!isMember && (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">

    <div>
      <label className="block text-sm font-medium text-gray-700">
        Name <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        value={nameSearch}
        onChange={(e) => setNameSearch(e.target.value)}
        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
        placeholder="Enter full name"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700">
        Phone Number <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        value={memberData.phone || ""}
        onChange={(e) =>
          setMemberData({ ...memberData, phone: e.target.value.replace(/\D/g, "") })
        }
        maxLength={10}
        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
        placeholder="Enter 10-digit phone number"
      />
    </div>

  </div>
)}


        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={e => {
                const d = e.target.value;
                setDob(d);
                setAge(calculateAge(d));     // ← AUTO AGE CALCULATION
              }}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Age</label>
            <input
              type="text"
              value={age}
              onChange={e => setAge(e.target.value)}
              readOnly
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              placeholder='Age'
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Profession</label>
            <input
              type="text"
              value={profession}
              onChange={e => setProfession(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Aadhar Number</label>
            <input
              type="text"
              value={aadhar}
              placeholder='xxxx xxxx xxxx'
              maxLength={14}
              onChange={(e) => setAadhar(formatAadhar(e.target.value))}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Place of Birth</label>
            <input
              type="text"
              value={birthPlace}
              onChange={e => setBirthPlace(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Father Name</label>
            <input
              type="text"
              value={fatherName}
              onChange={e => setFatherName(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Father Profession</label>
            <input
              type="text"
              value={fatherProfession}
              onChange={e => setFatherProfession(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Father Aadhar</label>
            <input
              type="text"
              value={fatherAadhar}
              placeholder='xxxx xxxx xxxx'
              maxLength={14}
              onChange={(e) => setFatherAadhar(formatAadhar(e.target.value))}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mother Name</label>
            <input
              type="text"
              value={motherName}
              onChange={e => setMotherName(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mother Profession</label>
            <input
              type="text"
              value={motherProfession}
              onChange={e => setMotherProfession(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mother Aadhar</label>
            <input
              type="text"
              value={motherAadhar}
              placeholder='xxxx xxxx xxxx'
              maxLength={14}
              onChange={(e) => setMotherAadhar(formatAadhar(e.target.value))}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg text-lavender--600 font-semibold">Baptism Details</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Baptism Date</label>
            <input
              type="date"
              value={baptismDate}
              onChange={e => setBaptismDate(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Baptism Type
            </label>

            <select
              value={baptismType}
              onChange={(e) => setBaptismType(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              required
            >
              <option value="">Select Baptism Type</option>
              <option value="Sprinkling">Sprinkling</option>
              <option value="Pouring">Pouring</option>
              <option value="Immersion">Immersion</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Baptism Place</label>
            <input
              type="text"
              value={baptismPlace}
              onChange={e => setBaptismPlace(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Baptised By</label>
            <select
              value={baptisedBy}
              onChange={(e) => setBaptisedBy(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            >
              <option value="">Select Presbytor</option>

              {pastors.map((p) => (
                <option
                  key={p._id}
                  value={`${p.title ? p.title + " " : ""}${p.pastor_name}`}
                >
                  {p.pastor_name}
                </option>
              ))}
            </select>

          </div>
<div className="sm:col-span-2 ">

<label className="block text-sm font-medium text-gray-700">
  Name of God Parents
</label>

<input
  type="text"
  value={godParentInput}
  placeholder="Type name and press Enter"
  onChange={(e) => setGodParentInput(e.target.value)}
  onKeyDown={addGodParent}
  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
/>

{/* Tags */}
<div className="flex flex-wrap gap-2 mt-2">
  {godParents.map((name, i) => (
    <span
      key={i}
      className="flex items-center px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700"
    >
      {name}
      <button
        type="button"
        className="ml-2 hover:text-red-600"
        onClick={() => removeGodParent(name)}
      >
        ✕
      </button>
    </span>
  ))}
</div>

</div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name of Witnesses</label>
            <input
              type="text"
              value={witnesses}
              onChange={e => setWitnesses(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Other Remarks</label>
            <input
              type="text"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Certificate Issued
            </label>

            <select
              value={certificateIssued}
              onChange={(e) => setCertificateIssued(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              required
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          {certificateIssued === "Yes" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Issued On
              </label>
              <input
                type="date"
                value={issuedOn}
                onChange={(e) => setIssuedOn(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          )}
          {certificateIssued === "Yes" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Certificate Issued By
              </label>
              <select
                value={certificateIssuedBy}
                onChange={(e) => setCertificateIssuedBy(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">Select Presbytor</option>

                {pastors.map((p) => (
                  <option
                    key={p._id}
                    value={`${p.title ? p.title + " " : ""}${p.pastor_name}`}
                  >
                    {p.pastor_name}
                  </option>
                ))}
              </select>
            </div>
          )}


        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-lavender--600 text-white rounded-md"
        >
          Add
        </button>
      </div>

      {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}

    </>
  )
}
