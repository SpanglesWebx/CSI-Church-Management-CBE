import React, { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { URL } from "../../App";

export const AddPastorFamily = () => {
  const [nextMemberId, setNextMemberId] = useState("");

  const navigate = useNavigate();
  const { id } = useParams();
  const token = sessionStorage.getItem("token");

  // Pastor data
  const [pastor, setPastor] = useState(null);

  // Form values
  const [name, setName] = useState("");
  const [tamilName, setTamilName] = useState("");
  const [relation, setRelation] = useState("");
  const [contactInput, setContactInput] = useState("");
  const [contactNumbers, setContactNumbers] = useState([]);

  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");

  const [gender, setGender] = useState("");
  const [aadhar, setAadhar] = useState("");

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [memberPhoto, setMemberPhoto] = useState(null);

  const [Response, setResponse] = useState({ status: null, message: "" });

  // Email Validator
  const validateEmail = (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  };

  // Fetch Pastor Details
  useEffect(() => {
    axios
      .get(`${URL}/pastors/${id}`, { headers: { Authorization: token } })
      .then((res) => {
        setPastor(res.data.data);

        // fetch next family member ID
        return axios.get(`${URL}/pastors/next-member-id/${id}`, {
          headers: { Authorization: token }
        });
      })
      .then((res) => setNextMemberId(res.data.next_member_id))
      .catch((err) => console.log(err));
  }, [id]);


  // Age Auto Calculation
  const handleDob = (value) => {
    setDob(value);
    if (!value) return setAge("");

    const today = new Date();
    const birth = new Date(value);

    let years = today.getFullYear() - birth.getFullYear();

    const mdiff = today.getMonth() - birth.getMonth();
    if (mdiff < 0 || (mdiff === 0 && today.getDate() < birth.getDate())) {
      years--;
    }

    setAge(years);
  };

  // Contact numbers (split by comma)
  const handleContact = (value) => {
    setContactInput(value);

    const arr = value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    setContactNumbers(arr);
  };

  // SAVE FUNCTION
  const handleSave = async () => {
    if (!name.trim()) {
      setResponse({ status: "Failed", message: "Enter member name" });
      return;
    }

    try {
      const fd = new FormData();

      fd.append("name", name);
      fd.append("tamil_name", tamilName);
      fd.append("relation", relation);
      fd.append("gender", gender);
      fd.append("dob", dob);
      fd.append("age", age);
      fd.append("aadhar_number", aadhar);
      fd.append("email", email);
      fd.append("contact_numbers", contactNumbers.join(","));
      if (memberPhoto) fd.append("member_photo", memberPhoto);

      const res = await axios.post(
        `${URL}/pastors/add-family-member/${id}`,
        fd,
        {
          headers: {
            Authorization: token,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setResponse({ status: "Success", message: "Family Member Added!" });

      setTimeout(() => {
        navigate(`/admin/pastorlist/pastorfampreview/${id}`);
      }, 1500);
    } catch (err) {
      console.log(err);
      setResponse({ status: "Failed", message: "Failed to add member" });
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    }
  };

  return (
    <>
      {/* Back Button */}
      <FaArrowLeft
        size={18}
        title="Back"
        onClick={() => navigate(-1)}
        className="cursor-pointer mb-4"
      />

      <h1 className="text-lg font-semibold">Add Presbyter Family Members</h1>

      {/* Form */}
      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg text-lavender--600 font-semibold">
          Personal Details
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">

          <div>
            <label className="text-sm font-medium">Presbyter ID</label>
            <input
              type="text"
              value={nextMemberId}
              readOnly
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Presbyter Family ID</label>
            <input
              type="text"
              value={pastor?.pastor_family_id || ""}
              readOnly
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          {/* Member Name */}
          <div>
            <label className="text-sm font-medium">Member Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Name"
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          {/* Tamil Name */}
          <div>
            <label className="text-sm font-medium">Member Tamil Name</label>
            <input
              type="text"
              value={tamilName}
              onChange={(e) => setTamilName(e.target.value)}
              placeholder="Enter Tamil Name"
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="text-sm font-medium">Contact Numbers</label>
            <input
              type="text"
              value={contactInput}
              onChange={(e) => handleContact(e.target.value)}
              placeholder="Enter phone numbers (comma separated)"
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
          {/* Gender */}
          <div>
            <label className="text-sm font-medium">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>


          {/* Relation */}
          <div>
            <label className="text-sm font-medium">Relationship</label>
            <select
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            >
              <option value="">Select Relation</option>

              {pastor?.gender === "Male" ? (
                <>
                  <option value="Wife">Wife</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                </>
              ) : (
                <>
                  <option value="Husband">Husband</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                </>
              )}
            </select>
          </div>

          {/* DOB */}
          <div>
            <label className="text-sm font-medium">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => handleDob(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          {/* Age */}
          <div>
            <label className="text-sm font-medium">Age</label>
            <input
              type="text"
              value={age}
              readOnly
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          {/* Aadhar */}
          <div>
            <label className="text-sm font-medium">Aadhar Number</label>
            <input
              type="text"
              value={aadhar}
              onChange={(e) => {
                let v = e.target.value.replace(/\D/g, "").slice(0, 12);
                v = v.replace(/(\d{4})(?=\d)/g, "$1 ");
                setAadhar(v);
              }}
              placeholder="xxxx xxxx xxxx"
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => {
                const v = e.target.value;
                setEmail(v);
                if (!validateEmail(v)) setEmailError("Invalid Email");
                else setEmailError("");
              }}
              className={`block w-full mt-1 border rounded-md shadow-sm sm:text-sm px-3 py-2 ${emailError ? "border-red-500" : "border-gray-300"
                }`}
              placeholder="Enter email"
            />
            {emailError && (
              <p className="text-red-500 text-xs mt-1">{emailError}</p>
            )}
          </div>

          {/* Photo */}
          <div>
            <label className="text-sm font-medium">Member Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setMemberPhoto(e.target.files[0])}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-lavender--600 text-white rounded-md"
        >
          Add Presbyter Family Member
        </button>
      </div>

      {/* Toasts */}
      {Response.status &&
        (Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : (
          <FailedMessage Message={Response.message} />
        ))}
    </>
  );
};
