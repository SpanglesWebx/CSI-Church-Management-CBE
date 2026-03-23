import React, { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { URL } from "../../App";

export const EditPastorFamMem = () => {
  const navigate = useNavigate();
  const { pastorId, memberId } = useParams();
  const token = sessionStorage.getItem("token");

  const [member, setMember] = useState(null);
  const [pastor, setPastor] = useState(null);

  // Form States
  const [name, setName] = useState("");
  const [tamilName, setTamilName] = useState("");
  const [relation, setRelation] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");

  const [aadhar, setAadhar] = useState("");
  const [email, setEmail] = useState("");
  const [contactInput, setContactInput] = useState("");
  const [contactNumbers, setContactNumbers] = useState([]);
  const [memberPhoto, setMemberPhoto] = useState(null);

  const [Response, setResponse] = useState({ status: null, message: "" });

  // Auto Age Calculation
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

  // Fetch Member Data
  useEffect(() => {
    axios
      .get(`${URL}/pastors/${pastorId}`, { headers: { Authorization: token } })
      .then((res) => {
        setPastor(res.data.data);

        const found = res.data.data.family_members.find(
          (m) => m._id === memberId
        );

        if (!found) navigate(-1);

        setMember(found);

        // Prefill Fields
        setName(found.name);
        setTamilName(found.tamil_name);
        setRelation(found.relation);
        setGender(found.gender);
        setDob(found.dob);
        setAge(found.age);
        setAadhar(found.aadhar_number);
        setEmail(found.email);
        setContactInput(found.contact_numbers.join(", "));
        setContactNumbers(found.contact_numbers);
      })
      .catch((err) => console.log(err));
  }, [pastorId, memberId]);

  // Update Handler
  const handleUpdate = async () => {
    try {
      const fd = new FormData();

      fd.append("name", name);
      fd.append("tamil_name", tamilName);
      fd.append("relation", relation);
      fd.append("gender", gender);
      fd.append("dob", dob);
      fd.append("age", age);
      fd.append("email", email);
      fd.append("aadhar_number", aadhar);
      fd.append("contact_numbers", contactNumbers.join(","));

      if (memberPhoto) fd.append("member_photo", memberPhoto);

      await axios.put(
        `${URL}/pastors/update-family-member/${pastorId}/${memberId}`,
        fd,
        {
          headers: {
            Authorization: token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResponse({
        status: "Success",
        message: "Family Member Updated Successfully!",
      });

      setTimeout(() => {
        navigate(`/admin/pastorlist/viewpastorfammem/${pastorId}/${memberId}`);
      }, 1500);
    } catch (err) {
      console.log(err);
      setResponse({
        status: "Failed",
        message: "Failed to update family member!",
      });
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

      <h1 className="text-lg font-semibold">Edit Family Member</h1>

      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <h1 className="text-lg text-lavender--600 font-semibold mb-3">
          Personal Details
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Member Name */}
          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          {/* Tamil Name */}
          <div>
            <label className="text-sm font-medium">Tamil Name</label>
            <input
              type="text"
              value={tamilName}
              onChange={(e) => setTamilName(e.target.value)}
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
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {/* Relation */}
          <div>
            <label className="text-sm font-medium">Relation</label>
            <select
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            >
              <option>Wife</option>
              <option>Husband</option>
              <option>Son</option>
              <option>Daughter</option>
            </select>
          </div>

          {/* DOB */}
          <div>
            <label className="text-sm font-medium">DOB</label>
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
            <label className="text-sm font-medium">Aadhar</label>
            <input
              type="text"
              value={aadhar}
              onChange={(e) =>
                setAadhar(
                  e.target.value.replace(/\D/g, "").slice(0, 12).replace(/(.{4})/g, "$1 ")
                )
              }
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          {/* Contact Numbers */}
          <div>
            <label className="text-sm font-medium">Contact Numbers</label>
            <input
              type="text"
              value={contactInput}
              onChange={(e) => {
                const input = e.target.value;
                setContactInput(input);
                setContactNumbers(
                  input.split(",").map((n) => n.trim()).filter((n) => n)
                );
              }}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>

          {/* Photo */}
          <div>
            <label className="text-sm font-medium">Photo</label>
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
          onClick={handleUpdate}
          className="px-4 py-2 bg-lavender--600 text-white rounded-md"
        >
          Update Member
        </button>
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
