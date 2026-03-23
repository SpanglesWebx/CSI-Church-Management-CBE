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
  const [SameAddress, setSameAddress] = useState(false);
  const [submitPrevent, setSubmitPrevent] = useState(false);
  const [Image, setImage] = useState("");
  const [Img, setImg] = useState("");

  const [Data, setData] = useState({
    family_head_id: "",
    family_head_name: "",
    relationship_with_family_head: "",
    primary_family_id: "",
    secondary_family_id: "",
    member_id: "",
    pastor_role:"",
    assigned_member_id: "",
    member_name: "",
    member_tamil_name: "",
    gender: "",
    date_of_birth: "",
    age:"",
    aadhar_number:"",
    email: "",
    member_photo: "",
    permanent_address: "",
    present_address: "",
    marriage_date: "",
    joined_date: "",
    reason_for_inactive: "",
    description: "",
    rejoining_date: "",
    left_date: "",
    reason_for_rejoining: "",
    status: "",
  });

  useEffect(() => {
    initFlowbite();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${URL}/pastor/${params.id}`, {
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
    setData({ ...Data, present_address: { ...Data.permanent_address } });
  }
}, [Checkbox]);


  
  
  const handleSubmit = async (event) => {
  event.preventDefault();
  try {
    setSubmitPrevent(true);
    delete Data.familyhead_id;

    if (Status !== "Active") {
      Data.status = "Inactive";
    }

    const formData = new FormData();

    // ✅ Clean out fields that are "null", null, or undefined
    const cleanedData = {};
    Object.entries(Data).forEach(([key, val]) => {
      if (val !== null && val !== "null" && val !== undefined) {
        cleanedData[key] = val;
      }
    });

    // ✅ Append date_of_birth ONLY if valid
    if (cleanedData.date_of_birth) {
      formData.append("date_of_birth", cleanedData.date_of_birth);
    }

    // ✅ Append only primitive fields (skip objects and dates already handled)
    for (const key in cleanedData) {
      if (
        key !== "permanent_address" &&
        key !== "present_address" &&
        key !== "date_of_birth" &&
        typeof cleanedData[key] !== "object"
      ) {
        formData.append(key, cleanedData[key]);
      }
    }

    // ✅ Safe address formatter
    const safeAddress = (addressObj) => ({
      address: addressObj?.address || "",
      city: addressObj?.city || "",
      district: addressObj?.district || "",
      state: addressObj?.state || "",
      zip_code: addressObj?.zip_code || "",
      country: addressObj?.country || "",
    });

    formData.append(
      "permanent_address",
      JSON.stringify(safeAddress(Data.permanent_address))
    );
    formData.append(
      "present_address",
      JSON.stringify(safeAddress(Data.present_address))
    );

    // ✅ Append image only if selected
    if (Img) {
      formData.append("member_photo", Img);
    }

    const response = await axios.put(
      `${URL}/pastor/${Data.member_id}`,
      formData,
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

    setTimeout(() => {
      navigate(
        `/admin/pastor/${response?.data?.updatedMember?.member_id}/preview`
      );
    }, 5000);
  } catch (error) {
    console.error(error);
    if (error.response?.status === 401) {
      setResponse({
        status: "Failed",
        message: "Unauthorized! Please Login Again.",
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
                  htmlFor="secondary_family_id"
                  className="block mb-3 font-semibold text-gray-800 dark:text-white"
                >
                  Family Id
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
                    setData({ ...Data, familyId: e.target.value })
                  }
                  value={Data.familyId}
                />
              </div>
              {Data.relationship_with_family_head === "head" && (
              <div className="w-full">
                <label
                  htmlFor="pastor_role"
                  className="block mb-3 font-semibold text-gray-800 dark:text-white"
                >
                  Pastor Role
                </label>
                <select
                  name="pastor_role"
                  id="pastor_role"
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg 
               focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 
               dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
               dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  required
                  value={Data.pastor_role || ""}
                  onChange={(e) =>
                    setData({ ...Data, pastor_role: e.target.value })
                  }
                >
                  <option value="">Select</option>
                  <option value="Primary">Primary</option>
                  <option value="Secondary">Secondary</option>
                </select>
              </div>
              )}

              {Data && Data.familyhead_id !== undefined ? (
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
                </>
              )}
              
              <div className="w-full">
                <label
                  htmlFor="mobile_number"
                  className="block mb-3 font-semibold text-gray-800 dark:text-white"
                >
                  Mobile Number
                </label>
                <input
                  type="number"
                  name="mobile_number"
                  id="mobile_number"
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  placeholder=""
                  required
                  onChange={(e) =>
                    setData({
                      ...Data,
                      mobile_number: e.target.value,
                    })
                  }
                  value={Data.mobile_number}
                />
              </div>
              {Data.relationship_with_family_head !== "head" && (
              <div className="w-full">
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
              </div>
              )}
              <div className="w-full">
                <label
                  htmlFor="gender"
                  className="block mb-3 font-semibold text-gray-800 dark:text-white"
                >
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
                  className="bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full px-2.5 py-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-lavender--600 dark:focus:border-lavender--600"
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
                <label
                  htmlFor="date_of_birth"
                  className="block mb-3 font-semibold text-gray-800 dark:text-white"
                >
                  Date of Birth
                </label>
                <input
                  onChange={(e) =>
                    setData({ ...Data, date_of_birth: e.target.value })
                  }
                  value={moment(new Date(Data.date_of_birth)).format(
                    "YYYY-MM-DD"
                  )}
                  type="date"
                  name="date_of_birth"
                  id="date_of_birth"
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  placeholder=""
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="age"
                  className="block mb-3 font-semibold text-gray-800 dark:text-white"
                >
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  id="age"
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg 
               focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 
               dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
               dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  placeholder=""
                  readOnly
                  value={Data.age || ""}
                />
              </div>
              {Data.relationship_with_family_head === "Wife" && (
                <div className="w-full">
                  <label
                    htmlFor="husband_name"
                    className="block mb-3 font-semibold text-gray-800 dark:text-white"
                  >
                    Husband Name
                  </label>
                  <input
                    type="text"
                    name="husband_name"
                    id="husband_name"
                    readOnly
                    value={Data.husband_name}
                    className="bg-gray-100 border border-gray-300 text-gray-800 rounded-lg 
        block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 
        dark:text-white"
                  />
                </div>
              )}

              {(Data.relationship_with_family_head === "Son" ||
                Data.relationship_with_family_head === "Daughter") && (
                  <div className="w-full">
                    <label
                      htmlFor="father_name"
                      className="block mb-3 font-semibold text-gray-800 dark:text-white"
                    >
                      Father Name
                    </label>
                    <input
                      type="text"
                      name="father_name"
                      id="father_name"
                      readOnly
                      value={Data.father_name}
                      className="bg-gray-100 border border-gray-300 text-gray-800 rounded-lg 
        block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 
        dark:text-white"
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
                  htmlFor="joining_date"
                  className="block mb-3 font-semibold text-gray-800 dark:text-white"
                >
                 Joining Date
                </label>
                <input
                  onChange={(e) =>
                    setData({ ...Data, joined_date: e.target.value })
                  }
                  required
                  readOnly
                  value={
                        Data.joined_date
                          ? moment(new Date(Data.joined_date)).format("YYYY-MM-DD")
                          : ""
                      }
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
              {(Data.relationship_with_family_head === "head" ||
                Data.relationship_with_family_head === "Wife") && (
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
                        Data.marriage_date
                          ? moment(new Date(Data.marriage_date)).format("YYYY-MM-DD")
                          : ""
                      }
                      type="date"
                      name="marriage_date"
                      id="marriage_date"
                      className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                    />
                  </div>
                )}
              
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
            <div className="flex justify-between gap-10">
              {/* Permanent Address */}
              <div className="w-full space-y-10">
                <h1 className="text-xl font-semibold text-lavender--600">
                  Permanent Address
                </h1>
                <div className="w-full">
                  <label
                    htmlFor="permanent_address"
                    className="block mb-3 font-semibold text-gray-800 dark:text-white"
                  >
                    Address
                  </label>
                  <textarea
                    name="permanent_address"
                    id="permanent_address"
                    rows="10"
                    className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg 
                     focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 
                     dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                     dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                    placeholder="Enter full permanent address"
                    required
                    value={Data.permanent_address || ""}
                    onChange={(e) =>
                      setData({ ...Data, permanent_address: e.target.value })
                    }
                  ></textarea>
                </div>
              </div>

              {/* Present Address */}
              <div className="w-full space-y-7">
                <div className="flex justify-between items-center">
                  <h1 className="text-xl font-semibold text-lavender--600">
                    Present Address
                  </h1>
                  <div className="flex items-center mb-4">
                    <input
                      id="same-address"
                      type="checkbox"
                      checked={Checkbox}
                      onChange={() => setCheckbox((prev) => !prev)}
                      className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-lavender--600 
                       focus:ring-lavender--500 dark:focus:ring-lavender--600 
                       dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label
                      htmlFor="same-address"
                      className="text-xs font-medium text-gray-900 ms-2 dark:text-gray-300"
                    >
                      Same as Permanent Address
                    </label>
                  </div>
                </div>
                <div className="w-full">
                  <label
                    htmlFor="present_address"
                    className="block mb-3 font-semibold text-gray-800 dark:text-white"
                  >
                    Address
                  </label>
                  <textarea
                    name="present_address"
                    id="present_address"
                    rows="10"
                    className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg 
                     focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 
                     dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                     dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500 
                     disabled:bg-slate-100 disabled:cursor-not-allowed"
                    placeholder="Enter full present address"
                    required
                    disabled={Checkbox}
                    value={Checkbox ? Data.permanent_address : Data.present_address || ""}
                    onChange={(e) =>
                      setData({ ...Data, present_address: e.target.value })
                    }
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full p-5 pb-10 space-y-10 bg-white rounded-ss">
            {(Data.status === "Inactive" || Data.status === "Active") &&
            Data.status !== "Active" ? (
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
                  {Data.status === "Inactive" ? (
                    <ul className="inline-flex items-center w-full space-x-20 text-base font-medium text-gray-900 bg-white border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
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
                                status: "Inactive",
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
          </div>

          <div className="flex items-center justify-end w-full space-x-8">
            <Link
              to={`/admin/pastor/${params.id}/preview`}
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
                <button
                  data-modal-hide="static-modal"
                  data-modal-target="address-modal"
                  data-modal-toggle="address-modal"
                  type="button"
                  disabled={submitPrevent}
                  className={`${
                    submitPrevent ? "cursor-not-allowed" : "cursor-pointer"
                  }  text-white ms-5 bg-lavender--600 hover:bg-lavender--800 focus:ring-4 focus:outline-none focus:ring-lavender--300 dark:focus:ring-lavender--800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center`}
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
