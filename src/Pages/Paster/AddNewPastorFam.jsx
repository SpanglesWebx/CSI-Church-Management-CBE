import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";

function AddNewPastorFam() {
  const token = window.sessionStorage.getItem("token");
  const navigate = useNavigate();
  const [Response, setResponse] = useState({
    status: null,
    message: "",
  });
  const [Checkbox, setCheckbox] = useState(false);
  const [submitPrevent, setSubmitPrevent] = useState(false);
  const [Img, setImg] = useState("");
  const [Data, setData] = useState({
    primary_family_id: "",
    secondary_family_id: null,
    member_id: "",
    pastor_role:"",
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
    joined_date:"",
    left_date: "",
    status: "Active",
  });
  // add/new
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
setSubmitPrevent(true)

      const response = await axios.post(
        `${URL}/pastor/add/pastor`,
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
        message: "Family Added Successfully.",
      });
      setTimeout(() => {
        navigate(`/admin/family/list`);
      }, 3000);
    } catch (error) {
setSubmitPrevent(false)

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
    if (Data.member_photo) {
      const fileReader = new FileReader();
      fileReader.addEventListener("load", (ev) => {
        setImg(ev.target.result);
      });
      fileReader.readAsDataURL(Data.member_photo);
    }
  }, [Data]);
  useEffect(() => {
  if (Checkbox) {
    setData((prev) => ({
      ...prev,
      present_address: prev.permanent_address,
    }));
  }
}, [Checkbox]);

  return (
    <React.Fragment>
      <section className="w-full bg-slate-50 rounded-ss">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col w-full p-5 bg-white rounded-md">
            <h1 className="text-xl font-semibold text-lavender--600">
              Pastor Details
            </h1> 
          </div>
          <div className="flex flex-col w-full p-5 mb-20 space-y-10 bg-white rounded-ss">
            <h1 className="text-xl font-semibold text-lavender--600">
               Personal Information
            </h1>
            <div className="grid w-full gap-4 sm:grid-cols-2 sm:gap-6">
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
                  pattern="[0-9]{10}"   // ✅ Only 10 digits
                  maxLength="10"        // ✅ Restrict input length
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg 
               focus:ring-lavender--600 focus:border-lavender--600 
               block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 
               dark:placeholder-gray-400 dark:text-white 
               dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  placeholder="Enter 10-digit mobile number"
                  required
                  onChange={(e) => {
                    // ✅ Allow only numbers and max 10 digits
                    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setData({ ...Data, mobile_number: value });
                  }}
                  value={Data.mobile_number}
                />
              </div>

              <div className="w-full">
                <label
                  htmlFor="member_name"
                  className="block mb-3 font-semibold text-gray-800 dark:text-white"
                >
                  Pastor Name
                </label>
                <input
                  type="text"
                  name="member_name"
                  id="member_name"
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  placeholder=""
                  required
                  onChange={(e) =>
                    setData({ ...Data, member_name: e.target.value })
                  }
                  value={Data.member_name}
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="member_tamil_name"
                  className="block mb-3 font-semibold text-gray-800 dark:text-white"
                >
                  Pastor Tamil Name
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
                  defaultValue={Data.gender}
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
                  onChange={(e) => {
                    const dob = e.target.value;
                    let age = "";
                    if (dob) {
                      const birthDate = new Date(dob);
                      const today = new Date();
                      age = today.getFullYear() - birthDate.getFullYear();
                      const m = today.getMonth() - birthDate.getMonth();
                      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                        age--; // adjust if birthday not reached this year
                      }
                    }
                    setData({ ...Data, date_of_birth: dob, age });
                  }}
                  value={Data.date_of_birth}
                  type="date"
                  name="date_of_birth"
                  id="date_of_birth"
                  required
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
                  value={Data.joined_date}
                  type="date"
                  name="joining_date"
                  id="joining_date"
                  required
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
                  
                  onChange={(e) => setData({ ...Data, email: e.target.value })}
                  value={Data.email}
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
                    value={Data.marriage_date}
                    type="date"
                    name="marriage_date"
                    id="marriage_date"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                    placeholder=""
                  />
                </div>
              
              {Img === "" ? (
                <div className="w-full">
                  <label
                    htmlFor="member_photo"
                    className="block mb-3 font-semibold text-gray-800 dark:text-white"
                  >
                    Pastor Photo
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
                    required={Data.member_photo === ""}
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
                    rows="3"
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
                    rows="3"
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

          
          <div className="flex items-center justify-end w-full space-x-8">
            <Link
              to={`/admin/family/list`}
              className="inline-flex items-center px-5 py-2.5 mt-4 sm:mt-6 text-base font-semibold text-center text-red-600 rounded-lg focus:ring-2 hover:text-red-700 focus:ring-red-200"
            >
              Discard
            </Link>
            <button
              type="submit"  disabled={submitPrevent}
              className={`${submitPrevent? "cursor-not-allowed" :"cursor-pointer"} inline-flex disabled:bg-opacity-80 items-center px-20 py-2.5 mt-4 sm:mt-6 text-base font-semibold text-center text-white bg-lavender--600 rounded-lg focus:ring-4 hover:bg-lavender--600  focus:ring-lavender-light-400`}
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

export default AddNewPastorFam;
