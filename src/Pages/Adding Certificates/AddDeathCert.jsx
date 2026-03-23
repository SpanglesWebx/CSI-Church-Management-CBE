import React, { useEffect, useRef, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";

export const AddDeathCert = () => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const [Response, setResponse] = useState({ status: null, message: "" });

  // --- SEARCH STATES ---
  const [idSearch, setIdSearch] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const [dropdown, setDropdown] = useState([]);
  const [memberData, setMemberData] = useState({});

  // --- FORM STATES ---
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [occupation, setOccupation] = useState("");
  const [address, setAddress] = useState("");
  const [fatherOrHusband, setFatherOrHusband] = useState("");

  const [placeOfDeath, setPlaceOfDeath] = useState("");
  const [diedOn, setDiedOn] = useState("");
  const [causeOfDeath, setCauseOfDeath] = useState("");
  const [placeOfBurial, setPlaceOfBurial] = useState("");
  const [buriedOn, setBuriedOn] = useState("");
  const [buriedBy, setBuriedBy] = useState("");
  const [certificateIssuedOn, setCertificateIssuedOn] = useState("");

  const [pastors, setPastors] = useState([]);

  // ================== UTILITIES ==================

  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
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

  const formatAadhar = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 12); // only 12 digits

    return digits
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .trim();
  };

  const showToast = (status, message) => {
    setResponse({ status: null, message: "" });
    setTimeout(() => setResponse({ status, message }), 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  };

  // ================== SEARCH BY ID ==================

  const debouncedSearchById = useRef(
    debounce(async (val) => {
      if (!val) return setDropdown([]);

      const res = await axios.get(`${URL}/death-member-search/id`, {
        headers: { Authorization: token },
        params: { query: val },
      });

      setDropdown(res.data || []);
    }, 300)
  ).current;

  // ================== SEARCH BY NAME ==================

  const debouncedSearchByName = useRef(
    debounce(async (val) => {
      if (!val) return setDropdown([]);

      const res = await axios.get(`${URL}/death-member-search/name`, {
        headers: { Authorization: token },
        params: { query: val },
      });

      setDropdown(res.data || []);
    }, 300)
  ).current;

  // ================== HANDLE SUBMIT ==================

  const handleSubmit = async () => {
if (!idSearch) {
  showToast("Failed", "ID of the Deceased is required");
  return;
}

if (!nameSearch) {
  showToast("Failed", "Name of the Deceased is required");
  return;
}

if (!gender) {
  showToast("Failed", "Gender is required");
  return;
}

if (!diedOn) {
  showToast("Failed", "Died On date is required");
  return;
}

if (!causeOfDeath) {
  showToast("Failed", "Cause of Death is required");
  return;
}

    try {
      await axios.post(
        `${URL}/deaths`,
        {
          member_id: idSearch,
          member_name: nameSearch,
          gender,
          father_or_husband: fatherOrHusband,
          dob,
          age,
          aadhar_number: aadhar,
          occupation,
          address,
          place_of_death: placeOfDeath,
          died_on: diedOn,
          cause_of_death: causeOfDeath,
          place_of_burial: placeOfBurial,
          buried_on: buriedOn,
          buried_by: buriedBy,
          certificate_issued_on: certificateIssuedOn,
        },
        { headers: { Authorization: token } }
      );

      showToast("Success", "Death certificate added successfully");

      setTimeout(() => {
        navigate("/admin/deathcertlist");
      }, 3000);
    } catch (err) {
      showToast(
        "Failed",
        err.response?.data?.error || "Error adding death certificate"
      );
    }
  };


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


  // ================== UI ==================

  return (
    <>
      <FaArrowLeft
        size={18}
        title="Back"
        onClick={() => navigate("/admin/deathcertlist")}
        className="cursor-pointer mb-4"
      />

      <h1 className="text-lg text-lavender--600 font-semibold">Add Death</h1>

      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px] relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2 relative">

          {/* MEMBER ID SEARCH */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              ID of the Deceased <span className="text-red-500">*</span>
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

          {/* NAME SEARCH */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name of the Deceased <span className="text-red-500">*</span>
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

          {/* DROPDOWN */}
          {dropdown.length > 0 && (
            <ul className="absolute mt-[75px] w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto">
              {dropdown.map((m) => (
                <li
                  key={m.member_id}
                  className="flex px-3 py-2 text-sm hover:bg-indigo-50 cursor-pointer"
                  onClick={() => {
                    setIdSearch(m.member_id);
                    setNameSearch(m.member_name);
                    setGender(m.gender || "");
                    setDob(m.dob || "");
                    setAge(calculateAge(m.dob));
                    setAadhar(formatAadhar(m.aadhar_number || ""));
                    setOccupation(m.occupation || "");
                    setAddress(m.present_address || "");
                    setDropdown([]);
                    setMemberData(m);
                  }}
                >
<span className="w-1/2 font-medium">{m.member_id}</span>
<span className="w-1/2">{m.member_name}</span>
                </li>
              ))}
            </ul>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Father / Husband Name
            </label>
            <input
              type="text"
              value={fatherOrHusband}
              onChange={(e) => setFatherOrHusband(e.target.value)}
              placeholder="Enter Father or Husband Name"
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => {
                const d = e.target.value;
                setDob(d);
                setAge(calculateAge(d));
              }}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Age
            </label>
            <input
              type="text"
              value={age}
              readOnly
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Aadhar Number
            </label>
            <input
              type="text"
              value={aadhar}
              placeholder="xxxx xxxx xxxx"
              maxLength={14}
              onChange={(e) => setAadhar(formatAadhar(e.target.value))}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700">
              Occupation
            </label>
            <input
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Place of Death
            </label>
            <input
              type="text"
              value={placeOfDeath}
              onChange={(e) => setPlaceOfDeath(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Died On <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={diedOn}
              onChange={(e) => setDiedOn(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cause of Death <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={causeOfDeath}
              onChange={(e) => setCauseOfDeath(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Place of Burial
            </label>
            <input
              type="text"
              value={placeOfBurial}
              onChange={(e) => setPlaceOfBurial(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Buried On
            </label>
            <input
              type="date"
              value={buriedOn}
              onChange={(e) => setBuriedOn(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

<div>
  <label className="block text-sm font-medium text-gray-700">
    Buried By
  </label>

  <select
    value={buriedBy}
    onChange={(e) => setBuriedBy(e.target.value)}
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


          <div>
            <label className="block text-sm font-medium text-gray-700">
              Certificate Issued On
            </label>
            <input
              type="date"
              value={certificateIssuedOn}
              onChange={(e) => setCertificateIssuedOn(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
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
