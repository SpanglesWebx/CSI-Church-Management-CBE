import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import { initFlowbite } from "flowbite";
import moment from "moment";

function Edit() {
  const token = window.sessionStorage.getItem("token");
  const params = useParams();
  const navigate = useNavigate();
  const [Response, setResponse] = useState({
    status: null,
    message: "",
  });

  const [Status, setStatus] = useState("");
  const [Checkbox, setCheckbox] = useState(false);
  const [NewFamily, setNewFamily] = useState(false);
  const [SameAddress, setSameAddress] = useState(true);
  const [submitPrevent, setSubmitPrevent] = useState(false);
  const [Image, setImage] = useState("");
  const [Img, setImg] = useState("");
  const [FamilyData, setFamilyData] = useState({
    family_id: "",
    family_head_name: "",
    marriage_date: "",
    permanent_address: "",

  });
  const [OriginalType, setOriginalType] = useState("");
  // const [Data, setData] = useState({
  //   family_head: "",
  //   family_head_name: "",
  //   relationship_with_family_head: "",
  //   primary_family_id: "",
  //   secondary_family_id: "",
  //   member_id: "",
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
  //   joined_date: "",
  //   left_date: "",
  //   reason_for_inactive: "",
  //   description: "",
  //   rejoining_date: "",
  //   reason_for_rejoining: "",
  //   status: "",
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
  });
  useEffect(() => {
    initFlowbite();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${URL}/member/${params.id}`, {
        headers: {
          Authorization: token,
        },
      });
      setData(response.data);
      setStatus(response.data.status);
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
    if (NewFamily) {
      const button = document.getElementById("Modal-Trig");
      button.click();
    }
  }, [NewFamily]);

  useEffect(() => {
    if (Img) {
      const fileReader = new FileReader();
      fileReader.addEventListener("load", (ev) => {
        setImage(ev.target.result);
      });
      fileReader.readAsDataURL(Img);
    }
  }, [Img]);

  useEffect(() => {
    if (Data && Data.member_photo) {
      setImage(`${URL}${Data.member_photo}`);
    }
  }, [Data]);

  useEffect(() => {
    if (Checkbox) {
      setData((prev) => ({
        ...prev,
        present_address: prev.permanent_address
      }));
    }
  }, [Checkbox]);


  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitPrevent(true);

      // default route (normal update)
      let apiUrl = `${URL}/member/details/update/${params.id}`;

      // if Half → Full, call promote API
      if (Data.member_type === "Full Member" && OriginalType.member_type === "Half Member") {
        apiUrl = `${URL}/member/promote/${params.id}`;
      }

      // const response = await axios.put(
      //   apiUrl,
      //   {
      //     ...Data,
      //     status: Status,
      //     new_family: NewFamily,
      //     member_photo: Img !== "" ? Img : Data && Data.member_photo,
      //   },
      //   {
      //     headers: {
      //       "Content-Type": "multipart/form-data",
      //       Authorization: token,
      //     },
      //   }
      // );

   const response = await axios.put(
  apiUrl,
  {
    ...Data,

    // force NO NEW FAMILY — always false
    new_family: false,

    // update status normally
    status: Status,

    member_photo: Img !== "" ? Img : Data.member_photo,
  },
  {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: token,
    },
  }
);


      setResponse({
        status: "Success",
        message: "Member Details Updated Successfully.",
      });

      // 🔑 If backend returned a new member_id, use it
      const newId = response.data?.new_member_id || params.id;

      setTimeout(() => {
        navigate(`/admin/member/${newId}/preview`);
      }, 2000);

    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        setResponse({
          status: "Failed",
          message: "Un Authorized! Please Login Again.",
        });
        setTimeout(() => {
          window.sessionStorage.clear();
          navigate("/");
        }, 5000);
      }
      if (error.response?.status === 500) {
        setResponse({
          status: "Failed",
          message: "Server Unavailable!",
        });
        setTimeout(() => {
          setResponse({ status: null, message: "" });
        }, 5000);
      }
    }
  };









  return (
    <React.Fragment>
      <section className="w-full bg-slate-50 rounded-ss">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col w-full p-5 bg-white rounded-md">
            <h1 className="text-xl font-semibold text-lavender--600">
              Update Family Details
            </h1>
          </div>
          <div className="flex flex-col w-full p-5 mb-20 space-y-10 bg-white rounded-ss">
            <h1 className="text-xl font-semibold text-lavender--600">
              Personal Information
            </h1>
            <div className="grid w-full gap-4 sm:grid-cols-2 sm:gap-6">
              <div className="w-full">
                <label
                  htmlFor="member_id"
                  className="block mb-3 font-semibold text-gray-800 dark:text-white"
                >
                  Member Id
                </label>
                <input
                  type="text"
                  name="member_id"
                  id="member_id"
                  className="bg-gray-50 disabled:bg-slate-200 disabled:cursor-not-allowed border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  placeholder=""
                  required
                  disabled
                  onChange={(e) =>
                    setData({ ...Data, member_id: e.target.value })
                  }
                  value={Data.member_id}
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="primary_family_id"
                  className="block mb-3 font-semibold text-gray-800 dark:text-white"
                >
                  Primary Family Id
                </label>
                <input
                  type="text"
                  name="primary_family_id"
                  id="primary_family_id"
                  className="bg-gray-50 border disabled:bg-slate-200 disabled:cursor-not-allowed border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  placeholder=""
                  required
                  disabled
                  onChange={(e) =>
                    setData({ ...Data, primary_family_id: e.target.value })
                  }
                  value={Data.primary_family_id}
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="secondary_family_id"
                  className="block mb-3 font-semibold text-gray-800 dark:text-white"
                >
                  Secondary Family Id
                </label>
                <input
                  type="text"
                  name="secondary_family_id"
                  id="secondary_family_id"
                  className="bg-gray-50 border disabled:bg-slate-200 disabled:cursor-not-allowed border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  placeholder=""
                  required
                  disabled
                  onChange={(e) =>
                    setData({ ...Data, secondary_family_id: e.target.value })
                  }
                  value={Data.secondary_family_id}
                />
              </div>

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
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500 disabled:bg-slate-200 disabled:cursor-not-allowed"
                  value={Data.member_type}
                  onChange={(e) =>
                    setData({ ...Data, member_type: e.target.value })
                  }
                  required
                  disabled={Data.member_type === "Full Member"}
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
              {Data && Data.family_head !== undefined ? (
                <>
                  <div className="w-full">
                    <label
                      htmlFor="member_name"
                      className="block mb-3 font-semibold text-gray-800 dark:text-white"
                    >
                      Family Head Name
                    </label>
                    <input
                      type="text"
                      name="member_name"
                      id="member_name"
                      className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                      placeholder=""
                      required
                      onChange={(e) =>
                        setData({
                          ...Data,
                          member_name: e.target.value,
                        })
                      }
                      value={Data.member_name}
                    />
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="member_tamil_name"
                      className="block mb-3 font-semibold text-gray-800 dark:text-white"
                    >
                      Family Head Tamil Name
                    </label>
                    <input
                      type="text"
                      name="member_tamil_name"
                      id="member_tamil_name"
                      className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                      placeholder=""
                      required
                      onChange={(e) =>
                        setData({
                          ...Data,
                          member_tamil_name: e.target.value,
                        })
                      }
                      value={Data.member_tamil_name}
                    />
                  </div>
                </>
              ) : (
                <>
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
                      onChange={(e) =>
                        setData({
                          ...Data,
                          member_name: e.target.value,
                        })
                      }
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
                      onChange={(e) =>
                        setData({
                          ...Data,
                          member_tamil_name: e.target.value,
                        })
                      }
                      value={Data.member_tamil_name}
                    />
                  </div>
                  {/* <div className="w-full">
                    <label
                      htmlFor="relationship_with_family_head"
                      className="block mb-3 font-semibold text-gray-800 dark:text-white"
                    >
                      Relationship with Family Head
                    </label>
                    <select
                      onChange={(e) =>
                        setData({
                          ...Data,
                          relationship_with_family_head: e.target.value,
                        })
                      }
                      value={Data.relationship_with_family_head}
                      name="relationship_with_family_head"
                      id="relationship_with_family_head"
                      required
                      className="bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full px-2.5 py-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-lavender--600 dark:focus:border-lavender--600"
                    >
                      <option value="">Select</option>
                      {["Wife", "Son", "Daughter"].map((item, index) => (
                        <option value={item} key={index}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div> */}
                </>
              )}

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
                />
              </div>
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
                    value={FamilyData?.family_head_name || ""}
                    readOnly
                    className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
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
              {Data && Data.family_head !== undefined ? <div></div> : null}
              {Image === "" ? (
                <div className="w-full">
                  <label
                    htmlFor="member_photo"
                    className="block mb-3 font-semibold text-gray-800 dark:text-white"
                  >
                    {Data && Data.family_head !== undefined
                      ? "Family Head Photo"
                      : "Member Photo"}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setImg(e.target.files[0]);
                    }}
                    name="member_photo"
                    id="member_photo"
                    className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full py-0.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                    placeholder=""
                    required={Image === ""}
                  />
                </div>
              ) : (
                <div className="relative w-40 h-40 overflow-hidden rounded-md">
                  <img
                    src={Image}
                    alt="profile picture"
                    className="object-cover w-full h-full"
                  />
                  <button className="absolute text-white bg-red-500 rounded-full top-1 right-3">
                    <i
                      className="fa-solid fa-xmark rounded-full hover:cursor-pointer px-0.5 border border-red-600 text-red-600 absolute right-0 top-2"
                      onClick={() => {
                        setImage("");
                        setImg("");
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
          {/* <div className="flex flex-col w-full p-5 mb-20 space-y-10 bg-white rounded-ss">
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
                <div className="w-full space-y-10">
                  <div className="flex justify-between">
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
                    <label className="block mb-3 font-semibold text-gray-800">
                      Permanent Address
                    </label>

                    <textarea
                      rows={10}
                      className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg block w-full p-3"
                      value={Data.permanent_address}
                      onChange={(e) =>
                        setData({ ...Data, permanent_address: e.target.value })
                      }
                    />

                </div>
                <label className="block mb-3 font-semibold text-gray-800">
                  Present Address
                </label>

                <textarea
                  rows={10}
                  disabled={Checkbox}
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg block w-full p-3 disabled:bg-slate-100"
                  value={Checkbox ? Data.permanent_address : Data.present_address}
                  onChange={(e) =>
                    setData({ ...Data, present_address: e.target.value })
                  }
                />

              </div>
            )}
          </div> */}
          <div className="flex flex-col w-full p-5 mb-20 space-y-10 bg-white rounded-ss">

  {/* Header + Checkbox */}
  <div className="flex justify-between items-center">
    <h1 className="text-xl font-semibold text-lavender--600">
      Address
    </h1>

    <div className="flex items-center">
      <input
        id="sameAddress"
        type="checkbox"
        checked={SameAddress}
        onChange={() => {
          setSameAddress(prev => {
            const newValue = !prev;

            // ✔ When enabling same address → sync present to permanent
            if (newValue === true) {
              setData(d => ({
                ...d,
                present_address: d.permanent_address
              }));
            }

            // ✔ When disabling same address → prefill present with permanent
            if (newValue === false) {
              setData(d => ({
                ...d,
                present_address: d.permanent_address
              }));
            }

            return newValue;
          });
        }}
        className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-lavender--600"
      />

      <label
        htmlFor="sameAddress"
        className="text-base font-medium text-gray-600 ml-2"
      >
        Same Address as Family Head
      </label>
    </div>
  </div>

  {/* Show BOTH textareas ONLY when SameAddress is false */}
  {!SameAddress && (
    <div className="flex w-full gap-10">

      {/* Permanent Address - LEFT HALF */}
      <div className="w-1/2">
        <label className="block mb-2 font-semibold text-gray-800">
          Permanent Address
        </label>

        <textarea
          rows={10}
          className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg block w-full p-3"
          value={Data.permanent_address}
          onChange={(e) =>
            setData(prev => ({
              ...prev,
              permanent_address: e.target.value,
              // ✔ If sameAddress is ON while typing (rare but safe)
              ...(SameAddress && { present_address: e.target.value })
            }))
          }
        />
      </div>

      {/* Present Address - RIGHT HALF */}
      <div className="w-1/2">
        <label className="block mb-2 font-semibold text-gray-800">
          Present Address
        </label>

        <textarea
          rows={10}
          className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg block w-full p-3"
          value={Data.present_address}
          onChange={(e) =>
            setData(prev => ({
              ...prev,
              present_address: e.target.value
            }))
          }
        />
      </div>

    </div>
  )}

</div>





          {/* <div className="flex flex-col w-full p-5 mb-20 space-y-10 bg-white rounded-ss">
            <h1 className="text-xl font-semibold text-lavender--600">
              Spiritual Information
            </h1>
            <div className="pb-10 space-y-36">
              <div className="grid w-full gap-4 sm:grid-cols-2 sm:gap-6">
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
                    value={moment(new Date(Data.baptized_date)).format(
                      "YYYY-MM-DD"
                    )}
                    type="date"
                    name="baptized_date"
                    id="baptized_date"
                    className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                    placeholder=""
                  />
                </div>
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
                    value={moment(new Date(Data.communion_date)).format(
                      "YYYY-MM-DD"
                    )}
                    type="date"
                    name="communion_date"
                    id="communion_date"
                    className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                    placeholder=""
                  />
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
                    value={
                      Data.marriage_date === null
                        ? ""
                        : moment(new Date(Data.marriage_date)).format(
                            "YYYY-MM-DD"
                          )
                    }
                    type="date"
                    name="marriage_date"
                    id="marriage_date"
                    className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                    placeholder=""
                    required={Data.reason_for_inactive === "Married"} 
                  />
                </div>
              </div>
            </div>
          </div> */}

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

                {/* <div className="w-full">
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
                </div> */}



                {/* handles new family creation when the status changed to married */}
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
                    onChange={(e) => {
                      const value = e.target.value;
                      setData({ ...Data, marital_status: value });

                      // 🔑 also set NewFamily flag
                      if (value === "Married") {
                        setNewFamily(true);
                      } else {
                        setNewFamily(false);
                      }
                    }}
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
                    value={Data.marriage_date}
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
          <div className="flex flex-col w-full p-5 pb-10 space-y-10 bg-white rounded-ss">
            {(Data.status === "Inactive" || Data.status === "Active") &&
              Data.reason_for_inactive !== null ? (
              <>
                <table className="w-auto max-w-md text-xs text-left text-gray-500 rtl:text-right dark:text-gray-400">
                  <tbody className="">
                    <tr className="dark:bg-gray-800 dark:border-gray-700">
                      <td className="py-3 text-lg font-semibold text-gray-700">
                        Reason for Inactive
                      </td>
                      <td className="text-base">
                        {Data && Data.reason_for_inactive}
                      </td>
                    </tr>
                    <tr className="dark:bg-gray-800 dark:border-gray-700">
                      <td className="py-3 text-lg font-semibold text-gray-700">
                        Description
                      </td>
                      <td className="text-sm">{Data && Data.description}</td>
                    </tr>
                    {Data.status === "Active" &&
                      Data.rejoining_date !== null ? (
                      <>
                        <tr className="dark:bg-gray-800 dark:border-gray-700">
                          <td className="py-3 text-lg font-semibold text-gray-700">
                            Rejoining Date
                          </td>
                          <td className="text-base">
                            {moment(new Date(Data.rejoining_date)).format(
                              "YYYY-MM-DD"
                            )}
                          </td>
                        </tr>
                        <tr className="dark:bg-gray-800 dark:border-gray-700">
                          <td className="py-3 text-lg font-semibold text-gray-700">
                            Reason for Rejoining
                          </td>
                          <td className="text-sm">
                            {Data && Data.reason_for_rejoining}
                          </td>
                        </tr>
                      </>
                    ) : null}
                  </tbody>
                </table>
              </>
            ) : null}

            <div className="space-y-5">
              <div className="flex flex-row gap-20">
                <label className="text-base font-semibold text-gray-700">
                  Status
                </label>
                <div className="text-sm">
                  {Data.gender !== "Female" &&
                    Data.status === "Inactive" &&
                    Data.reason_for_inactive !== "Married" ? (
                    <ul className="inline-flex items-center w-full space-x-20 text-base font-medium text-gray-900 bg-white border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <li className="">
                        <div className="flex items-center">
                          <input
                            id="inactive_button"
                            type="radio"
                            value="Inactive"
                            // onChange={() => {
                            //   setStatus("Inactive");
                            //   setData({
                            //     ...Data,
                            //     left_date: new Date().toString(),
                            //   });
                              // }}
                              onChange={() => {
                                setStatus("Inactive");
                                setNewFamily(false);   // ❗ MAKE SURE new family is never created
                                setData({
                                  ...Data,
                                  status: "Inactive",
                                  left_date: new Date().toString(),
                                  reason_for_inactive: "",   // Optional: clear reason
                                });
                              }}

                              checked={Status === "Inactive"}
                            name="inactive_button"
                            className="w-4 h-4 text-red-600 bg-gray-100 border-red-600 focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                          />
                          <label
                            htmlFor="inactive_button"
                            className="w-full text-base font-medium text-red-600 ms-2 dark:text-gray-300"
                          >
                            Inactive
                          </label>
                        </div>
                      </li>
                    </ul>
                  ) : (
                    <ul className="inline-flex items-center w-full space-x-20 text-base font-medium text-gray-900 bg-white border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <li className="">
                        <div className="flex items-center">
                          <input
                            id="active_button"
                            type="radio"
                            value="Active"
                            onChange={() => {
                              setStatus("Active");
                              setData({
                                ...Data,
                                joined_date: new Date().toString(),
                                left_date: "",
                              });
                            }}
                            name="active_button"
                            checked={Status === "Active"}
                            className="w-4 h-4 text-green-600 bg-gray-100 border-green-600 focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                          />
                          <label
                            htmlFor="active_button"
                            className="w-full text-base font-medium text-green-600 ms-2 dark:text-gray-300"
                          >
                            Active
                          </label>
                        </div>
                      </li>
                      <li className="">
                        <div className="flex items-center">
                          <input
                            id="inactive_button"
                            type="radio"
                            value="Inactive"
                            onChange={() => {
                              setStatus("Inactive");
                              setData({
                                ...Data,
                                left_date: new Date().toString(),
                              });
                            }}
                            checked={Status === "Inactive"}
                            name="inactive_button"
                            className="w-4 h-4 text-red-600 bg-gray-100 border-red-600 focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                          />
                          <label
                            htmlFor="inactive_button"
                            className="w-full text-base font-medium text-red-600 ms-2 dark:text-gray-300"
                          >
                            Inactive
                          </label>
                        </div>
                      </li>
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {Status === "Inactive" && Data.status === "Active" ? (
              <div className="grid w-full gap-4 sm:grid-cols-2 sm:gap-6">
                {Data && Data.gender === "Female" ? (
                  <div className="w-full">
                    <label
                      htmlFor="reason_for_inactive"
                      className="block mb-3 font-semibold text-gray-800 dark:text-white"
                    >
                      Reason For Inactive
                    </label>
                    <select
                      onChange={(e) => {
                        setData({
                          ...Data,
                          reason_for_inactive: e.target.value,
                        });
                      }}
                      defaultValue={Data.reason_for_inactive}
                      id="reason_for_inactive"
                      name="reason_for_inactive"
                      required
                      className="bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full px-2.5 py-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-lavender--600 dark:focus:border-lavender--600"
                    >
                      <option value="">Select</option>
                      {["Married", "Death", "Others"].map((item, index) => (
                        <option value={item} key={index}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="w-full">
                    <label
                      htmlFor="reason_for_inactive"
                      className="block mb-3 font-semibold text-gray-800 dark:text-white"
                    >
                      Reason For Inactive
                    </label>
                    <select
                      onChange={(e) => {
                        setData({
                          ...Data,
                          reason_for_inactive: e.target.value,
                        });
                      }}
                      defaultValue={Data.reason_for_inactive}
                      id="reason_for_inactive"
                      name="reason_for_inactive"
                      required
                      className="bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full px-2.5 py-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-lavender--600 dark:focus:border-lavender--600"
                    >
                      <option value="">Select</option>
                      {["Death", "Others"].map((item, index) => (
                        <option value={item} key={index}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="w-full">
                  <label
                    htmlFor="description"
                    className="block mb-3 font-semibold text-gray-800 dark:text-white"
                  >
                    Description
                  </label>
                  <input
                    onChange={(e) =>
                      setData({ ...Data, description: e.target.value })
                    }
                    value={Data.description}
                    type="text"
                    name="description"
                    id="description"
                    className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                    placeholder=""
                  />
                </div>
              </div>
            ) : null}

            {Status === "Active" &&
              Data.status === "Inactive" &&
              Data.reason_for_inactive !== "Death" ? (
              <div className="grid w-full gap-4 sm:grid-cols-2 sm:gap-6">
                <div className="w-full">
                  <label
                    htmlFor="rejoining_date"
                    className="block mb-3 font-semibold text-gray-800 dark:text-white"
                  >
                    Rejoining Date
                  </label>
                  <input
                    onChange={(e) =>
                      setData({ ...Data, rejoining_date: e.target.value })
                    }
                    value={Data.rejoining_date}
                    type="date"
                    name="rejoining_date"
                    id="rejoining_date"
                    className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                    placeholder=""
                  />
                </div>
                <div className="w-full">
                  <label
                    htmlFor="reason_for_rejoining"
                    className="block mb-3 font-semibold text-gray-800 dark:text-white"
                  >
                    Reason For Rejoining
                  </label>
                  <input
                    onChange={(e) =>
                      setData({
                        ...Data,
                        reason_for_rejoining: e.target.value,
                      })
                    }
                    value={Data.reason_for_rejoining}
                    type="text"
                    name="reason_for_rejoining"
                    id="reason_for_rejoining"
                    className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                    placeholder=""
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="default-checkbox"
                    onChange={() => setNewFamily((prev) => !prev)}
                    checked={NewFamily}
                    type="checkbox"
                    className="w-5 h-5 bg-gray-100 border-gray-300 rounded text-lavender--600 focus:ring-lavender--500 dark:focus:ring-lavender--600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    htmlFor="default-checkbox"
                    className="text-base font-medium text-lavender--600 dark:text-gray-300"
                  >
                    Start New Family Tree
                  </label>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-end w-full space-x-8">
            <Link
              to={`/admin/member/${params.id}/preview`}
              className="inline-flex items-center px-5 py-2.5 mt-4 sm:mt-6 text-base font-semibold text-center text-red-600 rounded-lg focus:ring-2 hover:text-red-700 focus:ring-red-200"
            >
              Discard
            </Link>
            <button
              type="submit"
              className="inline-flex disabled:bg-opacity-80 items-center px-20 py-2.5 mt-4 sm:mt-6 text-base font-semibold text-center text-white bg-lavender--600 rounded-lg focus:ring-4 hover:bg-lavender--600  focus:ring-lavender-light-400"
            >
              Update
            </button>
          </div>
        </form>
        <button
          id="Modal-Trig"
          className="hidden"
          type="button"
          data-modal-target="static-modal"
          data-modal-toggle="static-modal"
        >
          Click
        </button>
        <div
          id="static-modal"
          data-modal-backdrop="static"
          tabIndex="-1"
          className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
        >
          <div className="relative w-full max-w-md max-h-full p-4">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <div className="p-4 text-center md:p-5">
                <h3 className="mb-5 text-xl font-semibold text-lavender--600 dark:text-gray-400">
                  Start New Family Tree
                </h3>
                <p className="mb-5 text-base font-normal text-gray-500 dark:text-gray-400">
                  The member will start a new family tree. The family ID number
                  will be modified.
                </p>
                <button
                  onClick={() => setNewFamily(false)}
                  data-modal-hide="static-modal"
                  type="button"
                  className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  data-modal-hide="static-modal"
                  data-modal-target="address-modal"
                  data-modal-toggle="address-modal"
                  type="button"
                  disabled={submitPrevent}
                  className={`${submitPrevent ? "cursor-not-allowed" : "cursor-pointer"}  text-white ms-5 bg-lavender--600 hover:bg-lavender--800 focus:ring-4 focus:outline-none focus:ring-lavender--300 dark:focus:ring-lavender--800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center`}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
        <div
          id="address-modal"
          data-modal-backdrop="static"
          tabIndex="-1"
          className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
        >
          <div className="relative w-full max-w-md max-h-full p-4">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <div className="p-4 text-center md:p-5">
                <h3 className="mb-5 text-xl font-semibold text-lavender--600 dark:text-gray-400">
                  Address Updating
                </h3>
                <p className="mb-5 text-base font-normal text-gray-500 dark:text-gray-400">
                  Do you wish to change or keep the current address?
                </p>
                <button
                  onClick={() => setSameAddress(true)}
                  data-modal-hide="address-modal"
                  type="button"
                  className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  Continue as same
                </button>
                <button
                  onClick={() => setSameAddress(false)}
                  data-modal-hide="address-modal"
                  type="button"
                  className="text-white ms-5 bg-lavender--600 hover:bg-lavender--800 focus:ring-4 focus:outline-none focus:ring-lavender--300 dark:focus:ring-lavender--800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                >
                  Update Address
                </button>
              </div>
            </div>
          </div>
        </div>
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

export default Edit;
