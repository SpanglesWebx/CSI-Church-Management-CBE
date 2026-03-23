import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import accIcon from "../../assets/Mask group (2)-min.png";
import treeIcon from "../../assets/Group 1000001887-min.png";
import Modal from "../../Components/Expense/ExpenseFormModal";

function AddNew() {
  const token = window.sessionStorage.getItem("token");
  const params = useParams();
  const navigate = useNavigate();
  const [Response, setResponse] = useState({
    status: null,
    message: "",
  });
  const [Img, setImg] = useState("");
  const [SameAddress, setSameAddress] = useState(true);
  const [Checkbox, setCheckbox] = useState(false);
  const [submitPrevent, setSubmitPrevent] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);



  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setIsChecked(checked);
    if (checked) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsChecked(false); // uncheck when closing
  };

  const handleSubmitModal = (e) => {
    e.preventDefault();
    // handle save logic here
    handleCloseModal();
  };


  const [FamilyData, setFamilyData] = useState({
    family_id: "",
    family_head_name: "",
    marriage_date: "",
    permanent_address: "",

  });
  // const [Data, setData] = useState({
  //   family_id: "",
  //   member_id: "",
  //   member_type: "",
  //   assigned_member_id: "",
  //   member_name: "",
  //   member_tamil_name: "",
  //   gender: "",
  //   date_of_birth: "",
  //   email: "",
  //   occupation: "",
  //   community: "",
  //   nationality: "",
  //   member_photo: "",
  //   permanent_address: {
  //     address: "",
  //     city: "",
  //     district: "",
  //     state: "",
  //     zip_code: "",
  //   },
  //   present_address: {
  //     address: "",
  //     city: "",
  //     district: "",
  //     state: "",
  //     zip_code: "",
  //   },
  //   baptized_date: "",
  //   communion_date: "",
  //   marriage_date: "",
  //   joined_date: new Date().toString(),
  //   left_date: "",
  //   status: "Active",
  // });

  const [Data, setData] = useState({
    // existing fields
    family_id: "",
    member_id: "",
    member_type: "",
    assigned_member_id: "",
    member_name: "",
    member_tamil_name: "",
    gender: "",
    date_of_birth: "",
    age: "",                       // NEW
    email: "",
    mobile_number: "",             // NEW
    occupation: "",
    community: "",
    nationality: "",
    member_photo: "",
    permanent_address: "",
    present_address: "",


    // sacraments
    baptism: "No",                 // NEW (status Yes/No)
    baptized_date: "",
    baptism_place: "",             // NEW
    baptism_by: "",                // NEW
    confirmation: "No",            // NEW (status Yes/No)
    confirmation_date: "",         // NEW
    confirmation_place: "",        // NEW
    confirmation_by: "",           // NEW
    communion: "No",               // NEW
    communion_date: "",            // (already exists, but kept for clarity)
    communion_place: "",           // NEW
    communion_by: "",              // NEW

    // marriage
    marital_status: "Unmarried",   // NEW
    marriage_date: "",
    marriage_place: "",            // NEW

    // family references
    relationship_with_family_head: "", // NEW
    family_head_name: "",              // NEW (head autofill, not for editing)
    mother_name: "",                   // NEW
    wife_father_name: "",              // NEW
    wife_mother_name: "",              // NEW
    place_of_birth: "",                // NEW

    // extras
    aadhar_number: "",             // NEW
    blood_group: "",               // NEW
    qualification: "",             // NEW
    dual_member: "no",             // NEW
    church_name: "",               // NEW
    dual_member_id: "",            // NEW

    // member lifecycle
    joined_date: new Date().toString(),
    left_date: "",
    status: "Active",
    husband_name: "",
  });
  const handleRelationshipChange = async (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      relationship_with_family_head: value,
    }));

    // ✅ If Wife selected, fetch husband (family head) details
    if (value === "Wife" && formData.primary_family_id) {
      try {
        const response = await axios.get(
          `${URL}/family/head/${formData.primary_family_id}`,
          {
            headers: { Authorization: token },
          }
        );
        const husband = response.data;

        if (husband) {
          setFormData((prev) => ({
            ...prev,
            husband_name: husband.member_name,
            permanent_address: husband.permanent_address,
            present_address: husband.present_address,
            marriage_date: husband.marriage_date,
            marriage_place: husband.marriage_place,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch husband details", error);
      }
    }
  };

  useEffect(() => {
    if (Data.relationship_with_family_head === "Wife" || Data.relationship_with_family_head === "Daughter") {
      setData((prevData) => ({
        ...prevData,
        gender: "Female",
      }));
    } else if (Data.relationship_with_family_head === "Son") {
      setData((prevData) => ({
        ...prevData,
        gender: "Male",
      }));
    }
    else if (Data.relationship_with_family_head === "") {
      setData((prevData) => ({
        ...prevData,
        gender: "",
      }));
    }
  }, [Data.relationship_with_family_head]);

  useEffect(() => {
    const generateId = async () => {
      try {
        const response = await axios.post(`${URL}/family/generate-member-id`, {
          familyId: params.family_id,
          relationship: Data.relationship_with_family_head,
        }, {
          headers: {
            Authorization: token,
          },
        });
        setData(prevData => ({ ...prevData, member_id: response.data.member_id }));
      } catch (error) {
        console.error("Error generating member ID:", error);
      }
    };

    if (Data.relationship_with_family_head) {
      generateId();
    }
  }, [Data.relationship_with_family_head, params.family_id, token]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitPrevent(true)

      const response = await axios.post(
        `${URL}/family/${params.family_id}/member/add/new`,
        { ...Data },
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );
      setResponse({
        status: "Success",
        message: "Member Added Successfully.",
      });

      setTimeout(() => {
        window.history.back() || navigate(-1);
      }, 3000);
    } catch (error) {
      console.error(error);
      setSubmitPrevent(false)

      if (error.response.status === 401) {
        setResponse({
          status: "Failed",
          message: "Un Authorized! Please Login Again.",
        });
      }
      if (error.response.status === 500) {
        setResponse({
          status: "Failed",
          message: "Server Unavailable!",
        });
      }
    } finally {
      setTimeout(() => {
        setResponse({
          status: null,
          message: "",
        });
      }, 5000);
    }
  };
useEffect(() => {
  if (Checkbox) {
    setData((prev) => ({
      ...prev,
      present_address: prev.permanent_address,
    }));
  }
}, [Checkbox]);


  useEffect(() => {
    fetchData();
  }, [params]);

  useEffect(() => {
    if (SameAddress) {
      setData({
        ...Data,
        permanent_address: FamilyData?.head_member?.permanent_address || "",
        present_address: FamilyData?.head_member?.present_address || "",


      });
    }
  }, [FamilyData, SameAddress]);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${URL}/family/${params.family_id}/full`,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      setFamilyData(response.data);
      // navigate(-1)
    } catch (error) {
      console.error(error);
      if (error.response.status === 401) {
        setResponse({
          status: "Failed",
          message: "Un Authorized! Please Login Again.",
        });
        setTimeout(() => {
          window.sessionStorage.clear();
          navigate("/");
        }, 5000);
      }
      if (error.response.status === 500) {
        setResponse({
          status: "Failed",
          message: "Server Unavailable!",
        });
        setTimeout(() => {
          setResponse({
            status: null,
            message: "",
          });
        }, 5000);
      }
    }
  };
  useEffect(() => {
    console.log("FamilyData from API:", FamilyData);
  }, [FamilyData]);

  useEffect(() => {
    if (Data.member_photo) {
      const fileReader = new FileReader();
      fileReader.addEventListener("load", (ev) => {
        setImg(ev.target.result);
      });
      fileReader.readAsDataURL(Data.member_photo);
    }
  }, [Data]);

  // Helper function
  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleEnglishChange = async (e) => {
    const name = e.target.value;
    setData((prev) => ({ ...prev, member_name: name }));

    if (!name.trim()) {
      setData((prev) => ({ ...prev, member_tamil_name: "" }));
      return;
    }

    try {
      const res = await axios.get(
        `https://inputtools.google.com/request?text=${encodeURIComponent(
          name
        )}&itc=ta-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8`
      );

      if (res.data[0] === "SUCCESS") {
        const tamil = res.data[1][0][1][0];
        setData((prev) => ({ ...prev, member_tamil_name: tamil }));
      }
    } catch (error) {
      console.error("Transliteration error:", error);
    }
  };


  return (
    <React.Fragment>
      <section className="w-full bg-slate-50 rounded-ss">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col w-full px-5 py-8 bg-white border rounded-xl border-lavender--600">
            <div className="flex items-center gap-20">
              <h1 className="text-2xl font-semibold text-lavender--600">
                Add Member
              </h1>
              <div className="flex items-center gap-5">
                <img src={accIcon} alt="" className="w-10" />
                <div className="flex flex-col gap-1">
                  <h6 className="text-base font-semibold ">
                    {FamilyData && FamilyData.family_head_name}
                  </h6>
                  <p className="text-xs text-gray-400 ">Family Head</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <img src={treeIcon} alt="" className="w-10" />
                <div className="flex flex-col gap-1">
                  <h6 className="text-base font-semibold ">
                    {FamilyData && FamilyData.family_id}
                  </h6>
                  <p className="text-xs text-gray-400 ">Family Id</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col w-full p-5 mb-20 space-y-10 bg-white rounded-ss">
            <h1 className="text-xl font-semibold text-lavender--600">
              Personal Information
            </h1>
            <div className="grid w-full gap-4 sm:grid-cols-2 sm:gap-6">

              <div className="w-full">
                <label
                  htmlFor="member_type"
                  className="block mb-3 font-semibold text-gray-800 dark:text-white"
                >
                  Member Type
                </label>
                <select
                  name="member_type"
                  id="member_type"
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  value={Data.member_type}
                  onChange={(e) =>
                    setData({ ...Data, member_type: e.target.value })
                  }
                  required
                >
                  <option value="">Select Member Type</option>
                  <option value="Full Member">Full Member</option>
                  {/* <option value="Half Member">Half Member</option> */}
                  <option value="Supporting Member">Supporting Member</option>
                </select>
              </div>

              <div className="w-full">
                <label
                  htmlFor="assigned_member_id"
                  className="block mb-3 font-semibold text-gray-800 dark:text-white"
                >
                  Assigned Member Id
                </label>
                <input
                  type="text"
                  name="assigned_member_id"
                  id="assigned_member_id"
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  placeholder=""
                  required
                  onChange={(e) =>
                    setData({ ...Data, assigned_member_id: e.target.value })
                  }
                  value={Data.assigned_member_id}
                />
              </div>

              <div className="w-full">
                <label
                  htmlFor="mobile_number"
                  className="block mb-3 font-semibold text-gray-800 dark:text-white"
                >
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobile_number"
                  id="mobile_number"
                  maxLength={10} // regex validation
                  inputMode="numeric" // mobile keyboards show only numbers
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  placeholder="Enter 10 digit mobile number"
                  required
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ""); // allow only digits
                    if (value.length <= 10) {
                      setData({
                        ...Data,
                        mobile_number: value,
                      });
                    }
                  }}
                  value={Data.mobile_number}
                />
              </div>

              <div className="w-full">
                <label
                  htmlFor="member_name"
                  className="block mb-3 font-semibold text-gray-800 dark:text-white"
                >
                  Member Name
                </label>
                <input
                  type="text"
                  name="member_name"
                  id="member_name"
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  placeholder=""
                  required
                  // onChange={(e) =>
                  //   setData({
                  //     ...Data,
                  //     member_name: e.target.value,
                  //   })
                  // }
                  onChange={handleEnglishChange}
                  value={Data.member_name}
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="member_tamil_name"
                  className="block mb-3 font-semibold text-gray-800 dark:text-white"
                >
                  Member Tamil Name
                </label>
                <input
                  type="text"
                  name="member_tamil_name"
                  id="member_tamil_name"
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  placeholder=""
                  required
                  // onChange={(e) =>
                  //   setData({
                  //     ...Data,
                  //     member_tamil_name: e.target.value,
                  //   })
                  // }
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, member_tamil_name: e.target.value }))
                  }
                  value={Data.member_tamil_name}
                />
              </div>


              <div className="w-full">
                <label
                  htmlFor="relationship_with_family_head"
                  className="block mb-3 font-semibold text-gray-800 dark:text-white"
                >
                  Relationship with Family Head
                </label>
                <select
                  onChange={(e) => {
                    const value = e.target.value;
                    let updatedData = { ...Data, relationship_with_family_head: value };

                    if (value === "Wife") {
                      updatedData = {
                        ...updatedData,
                        marital_status: FamilyData?.head?.marital_status || "Married",
                        marriage_date: FamilyData?.head?.marriage_date || "",
                        marriage_place: FamilyData?.head?.marriage_place || "",
                        permanent_address: FamilyData?.head?.permanent_address || "",
    present_address: FamilyData?.head?.present_address || "",
                      };
                    }
                    else if (value === "Son" || value === "Daughter") {
                      updatedData = {
                        ...updatedData,
                       permanent_address: FamilyData?.head?.permanent_address || "",
    present_address: FamilyData?.head?.present_address || "",
                      };
                    }

                    setData(updatedData);
                  }}


                  value={Data.relationship_with_family_head}
                  name="relationship_with_family_head"
                  id="relationship_with_family_head"
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg block w-full p-2.5"
                >
                  <option value="">Select</option>
                  {["Wife", "Son", "Daughter"].map((item, index) => (
                    <option value={item} key={index}>
                      {item}
                    </option>
                  ))}
                </select>

              </div>



              <div className="w-full">
                <label htmlFor="gender" className="block mb-3 font-semibold text-gray-800 dark:text-white">
                  Gender
                </label>
                <select
                  onChange={(e) =>
                    setData({
                      ...Data,
                      gender: e.target.value,
                    })
                  }
                  value={Data.gender}
                  id="gender"
                  name="gender"
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                >
                  <option value="">Select</option>
                  {["Male", "Female", "Others"].map((gen, index) => (
                    <option value={gen} key={index}>
                      {gen}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full">
                {/* Date of Birth Field */}
                <label
                  htmlFor="date_of_birth"
                  className="block mb-3 font-semibold text-gray-800 dark:text-white"
                >
                  Date of Birth
                </label>
                <input
                  onChange={(e) => {
                    const dob = e.target.value;
                    setData({
                      ...Data,
                      date_of_birth: dob,
                      age: calculateAge(dob), // Update age dynamically
                    });
                  }}
                  value={Data.date_of_birth}
                  type="date"
                  name="date_of_birth"
                  id="date_of_birth"
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                /></div>
              <div className="w-full">
                {/* Age Field (Read-only) */}
                <label
                  htmlFor="age"
                  className="block  mb-3 font-semibold text-gray-800 dark:text-white"
                >
                  Age
                </label>
                <input
                  type="text"
                  name="age"
                  id="age"
                  value={Data.age || ""}
                  readOnly
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                />
              </div>

              <div className="w-full">
                <label
                  htmlFor="place_of_birth"
                  className="block mb-3 font-semibold text-gray-800 dark:text-white"
                >
                  Place of Birth
                </label>
                <input
                  type="text"
                  name="place_of_birth"
                  id="place_of_birth"
                  value={Data.place_of_birth}
                  onChange={(e) => setData({ ...Data, place_of_birth: e.target.value })}
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  placeholder="Enter place of birth"
                />
              </div>

              {Data.relationship_with_family_head === "Wife" && (
                <div className="w-full">
                  <label
                    htmlFor="wife_father_name"
                    className="block mb-3 font-semibold text-gray-800 dark:text-white"
                  >
                    Father Name
                  </label>
                  <input
                    type="text"
                    id="wife_father_name"
                    name="wife_father_name"
                    value={Data.wife_father_name || ""}
                    onChange={(e) =>
                      setData({
                        ...Data,
                        wife_father_name: e.target.value,
                      })
                    }
                    placeholder="Enter Wife's Father Name"
                    className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  />
                </div>
              )}

              {Data.relationship_with_family_head === "Wife" && (
                <div className="w-full">
                  <label
                    htmlFor="wife_mother_name"
                    className="block mb-3 font-semibold text-gray-800 dark:text-white"
                  >
                    Mother Name
                  </label>
                  <input
                    type="text"
                    id="wife_mother_name"
                    name="wife_mother_name"
                    value={Data.wife_mother_name || ""}
                    onChange={(e) =>
                      setData({
                        ...Data,
                        wife_mother_name: e.target.value,
                      })
                    }
                    placeholder="Enter Wife's Mother Name"
                    className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  />
                </div>
              )}
              {/* Conditional Field */}
              {Data.relationship_with_family_head && (
                <div className="w-full">
                  <label
                    htmlFor="parent_name"
                    className="block mb-3 font-semibold text-gray-800 dark:text-white"
                  >
                    {Data.relationship_with_family_head === "Wife"
                      ? "Husband Name"
                      : "Father Name"}
                  </label>
                  <input
                    type="text"
                    id="parent_name"
                    name="parent_name"
                    value={
                      Data.relationship_with_family_head === "Wife"
                        ? FamilyData?.head?.member_name || ""
                        : FamilyData?.head?.member_name || ""
                    }

                    readOnly={Data.relationship_with_family_head === "Wife"}
                    className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg block w-full p-2.5"
                  />

                </div>
              )}




              <div className="w-full">
                <label
                  htmlFor="aadhar_number"
                  className="block mb-3 font-semibold text-gray-800 dark:text-white"
                >
                  Aadhar Number
                </label>
                <input
                  type="text"
                  name="aadhar_number"
                  id="aadhar_number"
                  value={Data.aadhar_number}
                  onChange={(e) => {
                    // Remove non-digits
                    let value = e.target.value.replace(/\D/g, "");
                    // Limit to 12 digits
                    value = value.slice(0, 12);
                    // Add space every 4 digits
                    value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
                    setData({ ...Data, aadhar_number: value });
                  }}
                  maxLength="14" // 12 digits + 2 spaces
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  placeholder="XXXX XXXX XXXX"
                />
              </div>

              <div className="w-full">
                <label
                  htmlFor="blood_group"
                  className="block mb-3 font-semibold text-gray-800 dark:text-white"
                >
                  Blood Group
                </label>
                <select
                  name="blood_group"
                  id="blood_group"
                  value={Data.blood_group}
                  onChange={(e) => setData({ ...Data, blood_group: e.target.value })}
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                >
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div className="w-full">
                <label
                  htmlFor="joining_date"
                  className="block mb-3 font-semibold text-gray-800 dark:text-white"
                >
                  Joining Date
                </label>
                <input
                  onChange={(e) =>
                    setData({ ...Data, joined_date: e.target.value })
                  }
                  value={Data.joined_date}
                  type="date"
                  name="joining_date"
                  id="joining_date"
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  placeholder=""
                />
              </div>







              <div className="w-full">
                <label
                  htmlFor="email"
                  className="block mb-3 font-semibold text-gray-800 dark:text-white"
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  placeholder=""
                  required
                  onChange={(e) => setData({ ...Data, email: e.target.value })}
                  value={Data.email}
                />
              </div>

              <div className="w-full">
                <label
                  htmlFor="qualification"
                  className="block mb-3 font-semibold text-gray-800 dark:text-white"
                >
                  Qualification
                </label>
                <input
                  type="text"
                  name="qualification"
                  id="qualification"
                  value={Data.qualification}
                  onChange={(e) => setData({ ...Data, qualification: e.target.value })}
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  placeholder="Enter qualification"
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="occupation"
                  className="block mb-3 font-semibold text-gray-800 dark:text-white"
                >
                  Occupation
                </label>
                <input
                  type="text"
                  name="occupation"
                  id="occupation"
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  placeholder=""
                  required
                  onChange={(e) =>
                    setData({ ...Data, occupation: e.target.value })
                  }
                  value={Data.occupation}
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="community"
                  className="block mb-3 font-semibold text-gray-800 dark:text-white"
                >
                  Community
                </label>
                <input
                  type="text"
                  name="community"
                  id="community"
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  placeholder=""
                  required
                  onChange={(e) =>
                    setData({ ...Data, community: e.target.value })
                  }
                  value={Data.community}
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="nationality"
                  className="block mb-3 font-semibold text-gray-800 dark:text-white"
                >
                  Nationality
                </label>
                <input
                  type="nationality"
                  name="nationality"
                  id="nationality"
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  placeholder=""
                  required
                  onChange={(e) =>
                    setData({ ...Data, nationality: e.target.value })
                  }
                  value={Data.nationality}
                />
              </div>
              {Img === "" ? (
                <div className="w-full">
                  <label
                    htmlFor="member_photo"
                    className="block mb-3 font-semibold text-gray-800 dark:text-white"
                  >
                    Member Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setData({
                        ...Data,
                        member_photo: e.target.files[0],
                      });
                    }}
                    name="member_photo"
                    id="member_photo"
                    className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full py-0.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                    placeholder=""
                    required={Img === ""}
                  />
                </div>
              ) : (
                <div className="relative w-40 h-40 overflow-hidden rounded-md">
                  <img
                    src={Img}
                    alt="profile picture"
                    className="object-cover w-full h-full"
                  />
                  <button className="absolute text-white bg-red-500 rounded-full top-1 right-3">
                    <i
                      className="fa-solid fa-xmark rounded-full hover:cursor-pointer px-0.5 border border-red-600 text-red-600 absolute right-0 top-2"
                      onClick={() => {
                        setImg("");
                        setData((prev) => {
                          return { ...prev, member_photo: "" };
                        });
                      }}
                    ></i>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col w-full p-5 mb-20 space-y-10 bg-white rounded-ss">
            <h1 className="text-xl font-semibold text-lavender--600">
              Dual Member
            </h1>
            <div className="grid w-full gap-4 sm:grid-cols-2 sm:gap-6">
              <div className="w-full">
                {/* Dropdown instead of checkbox */}
                <label
                  htmlFor="dual_member"
                  className="block mb-3 font-semibold text-gray-800 dark:text-white"
                >
                  Dual Member
                </label>
                <select
                  id="dual_member"
                  name="dual_member"
                  value={Data.dual_member}
                  onChange={(e) =>
                    setData({
                      ...Data,
                      dual_member: e.target.value,
                    })
                  }
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                >
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              {/* Show extra fields only if Yes */}
              {Data.dual_member === "yes" && (
                <div className="w-full">
                  {/* Church Name */}
                  <label
                    htmlFor="church_name"
                    className="block mb-3 font-semibold text-gray-800 dark:text-white"
                  >
                    Church Name
                  </label>
                  <input
                    type="text"
                    id="church_name"
                    name="church_name"
                    value={Data.church_name || ""}
                    onChange={(e) =>
                      setData({
                        ...Data,
                        church_name: e.target.value,
                      })
                    }
                    className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  />
                </div>
              )}

              {Data.dual_member === "yes" && (
                <div className="w-full">
                  <label
                    htmlFor="dual_member_id"
                    className="block mb-3 font-semibold text-gray-800 dark:text-white"
                  >
                    Dual Member ID
                  </label>
                  <input
                    type="text"
                    id="dual_member_id"
                    name="dual_member_id"
                    value={Data.dual_member_id || ""}
                    onChange={(e) =>
                      setData({
                        ...Data,
                        dual_member_id: e.target.value,
                      })
                    }
                    className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col w-full p-5 mb-20 space-y-10 bg-white rounded-ss">
            {SameAddress ? (
              <div className="flex justify-between gap-10">
                <div className="w-full space-y-10">
                  <h1 className="text-xl font-semibold text-lavender--600">
                    Permanent Address
                  </h1>
                  <div className="flex items-center mb-4">
                    <input
                      id="default-checkbox"
                      onChange={() => setSameAddress((prev) => !prev)}
                      type="checkbox"
                      checked={SameAddress}
                      className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-lavender--600 focus:ring-lavender--500 dark:focus:ring-lavender--600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label
                      htmlFor="default-checkbox"
                      className="text-base font-medium text-gray-600 ms-2 dark:text-gray-300"
                    >
                      Same Address as Family Head's Address
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-between gap-10">
                <label className="block mb-3 font-semibold text-gray-800">
  Permanent Address
</label>

<textarea
  rows={8}
  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg block w-full p-3"
  value={Data.permanent_address}
  disabled={SameAddress}
  onChange={(e) =>
    setData({ ...Data, permanent_address: e.target.value })
  }
/>

                <label className="block mb-3 font-semibold text-gray-800">
  Present Address
</label>

<textarea
  rows={8}
  disabled={Checkbox}
  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg block w-full p-3 disabled:bg-slate-100"
  value={Checkbox ? Data.permanent_address : Data.present_address}
  onChange={(e) =>
    setData({ ...Data, present_address: e.target.value })
  }
/>

              </div>
            )}
          </div>
          <div className="flex flex-col w-full p-5 mb-20 space-y-10 bg-white rounded-ss">
            <h1 className="text-xl font-semibold text-lavender--600">
              Spiritual Information
            </h1>
            <div className="pb-10 space-y-36">
              <div className="grid w-full gap-4 sm:grid-cols-2 sm:gap-6">

                <div className="w-full">
                  <label
                    htmlFor="baptism"
                    className="block mb-3 font-semibold text-gray-800 dark:text-white"
                  >
                    Baptism
                  </label>
                  <select
                    id="baptism"
                    name="baptism"
                    value={Data.baptism}
                    onChange={(e) => setData({ ...Data, baptism: e.target.value })}
                    className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                {Data.baptism === "Yes" && (
                  <div className="w-full">
                    <label
                      htmlFor="baptized_date"
                      className="block mb-3 font-semibold text-gray-800 dark:text-white"
                    >
                      Baptized Date
                    </label>
                    <input
                      onChange={(e) =>
                        setData({ ...Data, baptized_date: e.target.value })
                      }
                      value={Data.baptized_date}
                      type="date"
                      name="baptized_date"
                      id="baptized_date"
                      disabled={Data.baptism !== "Yes"}
                      className={`bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 
                    ${Data.baptism !== "Yes" ? "opacity-50 cursor-not-allowed" : ""} 
                    dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500`}
                    />
                  </div>
                )}

                {Data.baptism === "Yes" && (
                  <div className="w-full ">
                    <label
                      htmlFor="baptism_place"
                      className="block mb-3 font-semibold text-gray-800 dark:text-white"
                    >
                      Baptism Place
                    </label>
                    <input
                      type="text"
                      name="baptism_place"
                      id="baptism_place"
                      value={Data.baptism_place}
                      onChange={(e) => setData({ ...Data, baptism_place: e.target.value })}
                      className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                      placeholder="Enter baptism place"
                    />
                  </div>
                )}

                {Data.baptism === "Yes" && (
                  <div className="w-full ">
                    <label
                      htmlFor="baptism_by"
                      className="block mb-3 font-semibold text-gray-800 dark:text-white"
                    >
                      Baptism By
                    </label>
                    <input
                      type="text"
                      name="baptism_by"
                      id="baptism_by"
                      value={Data.baptism_by}
                      onChange={(e) => setData({ ...Data, baptism_by: e.target.value })}
                      className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                      placeholder="Enter person who baptized"
                    />
                  </div>
                )}


                <div className="w-full">
                  <label
                    htmlFor="confirmation"
                    className="block mb-3 font-semibold text-gray-800 dark:text-white"
                  >
                    Confirmation
                  </label>
                  <select
                    name="confirmation"
                    id="confirmation"
                    value={Data.confirmation}
                    onChange={(e) => setData({ ...Data, confirmation: e.target.value })}
                    className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                {Data.confirmation === "Yes" && (
                  <div className="w-full ">
                    <label
                      htmlFor="confirmation_date"
                      className="block mb-3 font-semibold text-gray-800 dark:text-white"
                    >
                      Confirmation Date
                    </label>
                    <input
                      onChange={(e) =>
                        setData({ ...Data, confirmation_date: e.target.value })
                      }
                      value={Data.confirmation_date}
                      type="date"
                      name="confirmation_date"
                      id="confirmation_date"
                      disabled={Data.confirmation !== "Yes"}
                      className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                )}

                {Data.confirmation === "Yes" && (
                  <>
                    {/* Confirmation Place */}
                    <div className="w-full ">
                      <label
                        htmlFor="confirmation_place"
                        className="block mb-3 font-semibold text-gray-800 dark:text-white"
                      >
                        Confirmation Place
                      </label>
                      <input
                        type="text"
                        name="confirmation_place"
                        id="confirmation_place"
                        value={Data.confirmation_place}
                        onChange={(e) =>
                          setData({ ...Data, confirmation_place: e.target.value })
                        }
                        className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                        placeholder="Enter place of confirmation"
                      />
                    </div>

                    {/* Confirmation By */}
                    <div className="w-full ">
                      <label
                        htmlFor="confirmation_by"
                        className="block mb-3 font-semibold text-gray-800 dark:text-white"
                      >
                        Confirmation By
                      </label>
                      <input
                        type="text"
                        name="confirmation_by"
                        id="confirmation_by"
                        value={Data.confirmation_by}
                        onChange={(e) =>
                          setData({ ...Data, confirmation_by: e.target.value })
                        }
                        className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                        placeholder="Enter confirmed by"
                      />
                    </div>
                  </>
                )}
                {/* Communion Dropdown */}
                <div className="w-full">
                  <label
                    htmlFor="communion"
                    className="block mb-3 font-semibold text-gray-800 dark:text-white"
                  >
                    Communion
                  </label>
                  <select
                    name="communion"
                    id="communion"
                    value={Data.communion}
                    onChange={(e) => setData({ ...Data, communion: e.target.value })}
                    className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                {Data.communion === "Yes" && (
                  <div className="w-full">
                    <label
                      htmlFor="communion_date"
                      className="block mb-3 font-semibold text-gray-800 dark:text-white"
                    >
                      Communion Date
                    </label>
                    <input
                      onChange={(e) =>
                        setData({ ...Data, communion_date: e.target.value })
                      }
                      value={Data.communion_date}
                      type="date"
                      name="communion_date"
                      id="communion_date"
                      disabled={Data.communion !== "Yes"}
                      className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                )}

                {/* Optional: Communion Place and By fields when Yes */}
                {Data.communion === "Yes" && (
                  <>
                    <div className="w-full ">
                      <label
                        htmlFor="communion_place"
                        className="block mb-3 font-semibold text-gray-800 dark:text-white"
                      >
                        Communion Place
                      </label>
                      <input
                        type="text"
                        name="communion_place"
                        id="communion_place"
                        value={Data.communion_place}
                        onChange={(e) =>
                          setData({ ...Data, communion_place: e.target.value })
                        }
                        className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                        placeholder="Enter place of communion"
                      />
                    </div>

                    <div className="w-full ">
                      <label
                        htmlFor="communion_by"
                        className="block mb-3 font-semibold text-gray-800 dark:text-white"
                      >
                        Communion By
                      </label>
                      <input
                        type="text"
                        name="communion_by"
                        id="communion_by"
                        value={Data.communion_by}
                        onChange={(e) =>
                          setData({ ...Data, communion_by: e.target.value })
                        }
                        className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                        placeholder="Enter communion by"
                      />
                    </div>
                  </>
                )}

                <div className="w-full">
                  <label
                    htmlFor="marital_status"
                    className="block mb-3 font-semibold text-gray-800 dark:text-white"
                  >
                    Marital Status
                  </label>
                  <select
                    name="marital_status"
                    id="marital_status"
                    value={Data.marital_status}
                    onChange={(e) => setData({ ...Data, marital_status: e.target.value })}
                    className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                    required
                  >
                    <option value="">Select</option>
                    <option value="Married">Married</option>
                    <option value="Unmarried">Unmarried</option>
                  </select>
                </div>


                <div className="w-full">
                  <label
                    htmlFor="marriage_date"
                    className="block mb-3 font-semibold text-gray-800 dark:text-white"
                  >
                    Marriage Date
                  </label>
                  <input
                    onChange={(e) =>
                      setData({ ...Data, marriage_date: e.target.value })
                    }
                    // value={Data.marriage_date}
                    value={Data.marriage_date ? Data.marriage_date.split("T")[0] : ""}
                    type="date"
                    name="marriage_date"
                    id="marriage_date"
                    disabled={Data.marital_status !== "Married"}
                    className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder=""
                  />
                </div>

                {/* Marriage Place (conditionally shown) */}
                {Data.marital_status === "Married" && (
                  <div className="w-full">
                    <label
                      htmlFor="marriage_place"
                      className="block mb-3 font-semibold text-gray-800 dark:text-white"
                    >
                      Marriage Place
                    </label>
                    <input
                      type="text"
                      name="marriage_place"
                      id="marriage_place"
                      value={Data.marriage_place}
                      onChange={(e) => setData({ ...Data, marriage_place: e.target.value })}
                      placeholder="Enter Marriage Place"
                      className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                    />
                  </div>
                )}

              </div>
            </div>
          </div>
          <div className="flex items-center justify-end w-full space-x-8">
            <Link
              to={`/admin/family/list`}
              className="inline-flex items-center px-5 py-2.5 mt-4 sm:mt-6 text-base font-semibold text-center text-red-600 rounded-lg focus:ring-2 hover:text-red-700 focus:ring-red-200"
            >
              Discard
            </Link>
            {/* <button
              type="submit"
              disabled={submitPrevent}
              className="inline-flex disabled:bg-opacity-80 items-center px-20 py-2.5 mt-4 sm:mt-6 text-base font-semibold text-center text-white bg-lavender--600 rounded-lg focus:ring-4 hover:bg-lavender--600  focus:ring-lavender-light-400"
            >
              Save
            </button> */}
            <button
              type="submit" disabled={submitPrevent}
              className={`${submitPrevent ? "cursor-not-allowed" : "cursor-pointer"} inline-flex disabled:bg-opacity-80 items-center px-20 py-2.5 mt-4 sm:mt-6 text-base font-semibold text-center text-white bg-lavender--600 rounded-lg focus:ring-4 hover:bg-lavender--600  focus:ring-lavender-light-400`}
            >
              Save
            </button>
          </div>
        </form>
      </section>
      {Response.status !== null ? (
        Response.status === "Success" ? (
          <SuccessMessage Message={Response.message} />
        ) : Response.status === "Failed" ? (
          <FailedMessage Message={Response.message} />
        ) : null
      ) : null}
    </React.Fragment>
  );
}

export default AddNew;
