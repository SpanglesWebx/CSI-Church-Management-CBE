import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import Modal from "../../Components/Expense/ExpenseFormModal";

function AddNew() {
  const token = window.sessionStorage.getItem("token");
  const navigate = useNavigate();
  const [Response, setResponse] = useState({
    status: null,
    message: "",
  });
  const [Checkbox, setCheckbox] = useState(false);
  const [submitPrevent, setSubmitPrevent] = useState(false);
  const [Img, setImg] = useState("");

  const [isChecked, setIsChecked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [modalData, setModalData] = useState({
    church_name: "",
    dual_member_id: "",
    certification: null,
  });


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

    if (!modalData.certification) {
      alert("Please upload a file");
      return;
    }

    // Push new certification into Data.certifications array
    setData((prev) => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        {
          church_name: modalData.church_name,
          dual_member_id: modalData.dual_member_id, // modal member ID
          certification: modalData.certification, // file
        },
      ],
    }));

    // Close modal
    handleCloseModal();

    // Reset modal fields
    setModalData({
      church_name: "",
      dual_member_id: "",
      certification: null,
    });
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




  // const [Data, setData] = useState({
  //   primary_family_id: "",
  //   secondary_family_id: null,
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
  //   // joined_date: new Date().toString(),
  //   joined_date: "",
  //   left_date: "",
  //   status: "Active",
  // });

  const [Data, setData] = useState({
    primary_family_id: "",
    secondary_family_id: null,
    member_id: "",
    member_type: "",
    assigned_member_id: "",
    member_name: "",
    member_tamil_name: "",
    gender: "",
    date_of_birth: "",
    age: "", // dynamically calculated
    email: "",
    occupation: "",
    community: "",
    nationality: "",
    member_photo: "",
    permanent_address: "",
    present_address: "",
    marital_status: "", // dropdown: Married / Unmarried
    marriage_place: "", // conditionally visible
    baptism_status: "", // dropdown: Yes / No
    baptized_date: "", // enabled only if baptism_status === "Yes"
    baptism_place: "",  // conditionally visible
    baptized_by: "",    // conditionally visible
    confirmation_status: "", // dropdown: Yes / No
    confirmation_date: "", // conditionally visible
    confirmation_place: "", // conditionally visible
    communion_date: "", // enabled only if applicable
    aadhar_number: "",
    father_name: "",
    mother_name: "",
    place_of_birth: "",
    blood_group: "", // dropdown
    qualification: "",
    joined_date: "",
    left_date: "",
    status: "Active",
    certifications: [],
    dual_member: "",            // 👈 NEW
    church_name: "",            // 👈 NEW
    dual_member_id: "",         // 👈 NEW
    dual_member_certificate: "",
    husband_name: "",
  });

  // add/new
  // const handleSubmit = async (event) => {
  //   event.preventDefault();
  //   try {
  //     setSubmitPrevent(true)

  //     const response = await axios.post(
  //       `${URL}/family/add/new`,
  //       { ...Data },
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //           Authorization: token,
  //         },
  //       }
  //     );
  //     setResponse({
  //       status: "Success",
  //       message: "Family Added Successfully.",
  //     });
  //     setTimeout(() => {
  //       navigate(`/admin/family/list`);
  //     }, 3000);
  //   } catch (error) {
  //     setSubmitPrevent(false)

  //     console.error(error);
  //     if (error.response.status === 401) {
  //       setResponse({
  //         status: "Failed",
  //         message: "Un Authorized! Please Login Again.",
  //       });
  //       setTimeout(() => {
  //         window.sessionStorage.clear();
  //         navigate("/");
  //       }, 5000);
  //     }
  //     if (error.response.status === 500) {
  //       setResponse({
  //         status: "Failed",
  //         message: "Server Unavailable!",
  //       });
  //       setTimeout(() => {
  //         setResponse({
  //           status: null,
  //           message: "",
  //         });
  //       }, 5000);
  //     }
  //   }
  // };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitPrevent(true);

      // Ensure safe defaults for enums
      const safeData = {
        ...Data,
        baptism_status: Data.baptism_status || "No",
        confirmation_status: Data.confirmation_status || "No",
      };

      // Build FormData
      const formData = new FormData();

      for (let key in safeData) {
        if (key === "certifications") {
          safeData.certifications.forEach((cert, index) => {
            formData.append(`certifications[${index}][church_name]`, cert.church_name);
            formData.append(`certifications[${index}][dual_member_id]`, cert.dual_member_id);
            formData.append(`certifications[${index}][certification_file]`, cert.certification);
          });
        } else if (
          typeof safeData[key] === "object" &&
          safeData[key] !== null &&
          !(safeData[key] instanceof File)
        ) {
          // Flatten nested objects like permanent_address
          for (let subKey in safeData[key]) {
            formData.append(`${key}[${subKey}]`, safeData[key][subKey]);
          }
        } else {
          formData.append(key, safeData[key]);
        }
      }

      const response = await axios.post(
        `${URL}/family/add/new`,
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
        message: "Family Added Successfully.",
      });

      setTimeout(() => {
        navigate(`/admin/family/list`);
      }, 3000);

    } catch (error) {
      setSubmitPrevent(false);
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
  // useEffect(() => {
  //   if (Checkbox) {
  //     setData({ ...Data, present_address: { ...Data.permanent_address } });
  //   }
  // }, [Checkbox]);

useEffect(() => {
  if (Checkbox) {
    setData((prev) => ({
      ...prev,
      present_address: prev.permanent_address
    }));
  }
}, [Checkbox]);


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

  return (
    <React.Fragment>
      <section className="w-full bg-slate-50 rounded-ss">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col w-full p-5 bg-white rounded-md">
            <h1 className="text-xl font-semibold text-lavender--600">
              New Family
            </h1>
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
                  Family Head Name
                </label>
                <input
                  type="text"
                  name="member_name"
                  id="member_name"
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  placeholder=""
                  required
                  // onChange={(e) =>
                  //   setData({ ...Data, member_name: e.target.value })
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
                  Family Head Tamil Name
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
                  value={Data.father_name}
                  onChange={(e) => setData({ ...Data, father_name: e.target.value })}
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  placeholder="Enter Father Name"
                />
              </div>

              <div className="w-full">
                <label
                  htmlFor="mother_name"
                  className="block mb-3 font-semibold text-gray-800 dark:text-white"
                >
                  Mother Name
                </label>
                <input
                  type="text"
                  name="mother_name"
                  id="mother_name"
                  value={Data.mother_name}
                  onChange={(e) => setData({ ...Data, mother_name: e.target.value })}
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                  placeholder="Enter Mother Name"
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
                    Family Head Photo
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
            <div className="flex justify-between gap-10">
              <div className="w-full space-y-10">
                <h1 className="text-xl font-semibold text-lavender--600">
                  Permanent Address
                </h1>
                {/* <div className="grid w-full gap-4 sm:grid-cols-1 sm:gap-6">
                  <div className="w-full">
                    <label
                      htmlFor="address"
                      className="block mb-3 font-semibold text-gray-800 dark:text-white"
                    >
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                      placeholder="House No/Name"
                      required
                      onChange={(e) =>
                        setData({
                          ...Data,
                          permanent_address: {
                            ...Data.permanent_address,
                            address: e.target.value,
                          },
                        })
                      }
                      value={Data.permanent_address.address}
                    />
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="city"
                      className="block mb-3 font-semibold text-gray-800 dark:text-white"
                    >
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      id="city"
                      className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                      placeholder="city"
                      required
                      onChange={(e) =>
                        setData({
                          ...Data,
                          permanent_address: {
                            ...Data.permanent_address,
                            city: e.target.value,
                          },
                        })
                      }
                      value={Data.permanent_address.city}
                    />
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="district"
                      className="block mb-3 font-semibold text-gray-800 dark:text-white"
                    >
                      District
                    </label>
                    <input
                      type="text"
                      name="district"
                      id="district"
                      className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                      placeholder="district"
                      required
                      onChange={(e) =>
                        setData({
                          ...Data,
                          permanent_address: {
                            ...Data.permanent_address,
                            district: e.target.value,
                          },
                        })
                      }
                      value={Data.permanent_address.district}
                    />
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="state"
                      className="block mb-3 font-semibold text-gray-800 dark:text-white"
                    >
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      id="state"
                      className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                      placeholder="state"
                      required
                      onChange={(e) =>
                        setData({
                          ...Data,
                          permanent_address: {
                            ...Data.permanent_address,
                            state: e.target.value,
                          },
                        })
                      }
                      value={Data.permanent_address.state}
                    />
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="country"
                      className="block mb-3 font-semibold text-gray-800 dark:text-white"
                    >
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      id="country"
                      className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                      placeholder="country"
                      required
                      onChange={(e) =>
                        setData({
                          ...Data,
                          permanent_address: {
                            ...Data.permanent_address,
                            country: e.target.value,
                          },
                        })
                      }
                      value={Data.permanent_address.country}
                    />
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="zip_code"
                      className="block mb-3 font-semibold text-gray-800 dark:text-white"
                    >
                      Zip Code
                    </label>
                    <input
                      type="text"
                      name="zip_code"
                      id="zip_code"
                      className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                      placeholder="Zip Code"
                      required
                      onChange={(e) =>
                        setData({
                          ...Data,
                          permanent_address: {
                            ...Data.permanent_address,
                            zip_code: e.target.value,
                          },
                        })
                      }
                      value={Data.permanent_address.zip_code}
                    />
                  </div>
                </div> */}
                <textarea
                  rows={10}
                  className="bg-gray-50 border border-gray-300 text-gray-800 rounded-lg block w-full p-3"
                  value={Data.permanent_address}
                  onChange={(e) =>
                    setData({ ...Data, permanent_address: e.target.value })
                  }
                  required
                />

              </div>
              <div className="w-full space-y-7">
                <div className="flex justify-between">
                  <h1 className="text-xl font-semibold text-lavender--600">
                    Present Address
                  </h1>
                  <div className="flex items-center mb-4">
                    <input
                      id="default-checkbox"
                      onClick={() => setCheckbox((prev) => !prev)}
                      type="checkbox"
                      value={Checkbox}
                      className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-lavender--600 focus:ring-lavender--500 dark:focus:ring-lavender--600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label
                      htmlFor="default-checkbox"
                      className="text-xs font-medium text-gray-900 ms-2 dark:text-gray-300"
                    >
                      Same as Permanent Address
                    </label>
                  </div>
                </div>
                {/* <div className="grid w-full gap-4 sm:grid-cols-1 sm:gap-6">
                  <div className="w-full">
                    <label
                      htmlFor="address"
                      className="block mb-3 font-semibold text-gray-800 dark:text-white"
                    >
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      className="bg-gray-50 disabled:bg-slate-100 disabled:cursor-not-allowed border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                      placeholder="House No/Name"
                      required
                      disabled={Checkbox}
                      onChange={(e) =>
                        setData({
                          ...Data,
                          present_address: {
                            ...Data.present_address,
                            address: e.target.value,
                          },
                        })
                      }
                      value={
                        Checkbox
                          ? Data.permanent_address.address
                          : Data.present_address.address
                      }
                    />
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="city"
                      className="block mb-3 font-semibold text-gray-800 dark:text-white"
                    >
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      id="city"
                      className="bg-gray-50 disabled:bg-slate-100 disabled:cursor-not-allowed border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                      placeholder="city"
                      required
                      disabled={Checkbox}
                      onChange={(e) =>
                        setData({
                          ...Data,
                          present_address: {
                            ...Data.present_address,
                            city: e.target.value,
                          },
                        })
                      }
                      value={
                        Checkbox
                          ? Data.permanent_address.city
                          : Data.present_address.city
                      }
                    />
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="district"
                      className="block mb-3 font-semibold text-gray-800 dark:text-white"
                    >
                      District
                    </label>
                    <input
                      type="text"
                      name="district"
                      id="district"
                      className="bg-gray-50 disabled:bg-slate-100 disabled:cursor-not-allowed border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                      placeholder="district"
                      required
                      disabled={Checkbox}
                      onChange={(e) =>
                        setData({
                          ...Data,
                          present_address: {
                            ...Data.present_address,
                            district: e.target.value,
                          },
                        })
                      }
                      value={
                        Checkbox
                          ? Data.permanent_address.district
                          : Data.present_address.district
                      }
                    />
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="state"
                      className="block mb-3 font-semibold text-gray-800 dark:text-white"
                    >
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      id="state"
                      className="bg-gray-50 disabled:bg-slate-100 disabled:cursor-not-allowed border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                      placeholder="state"
                      required
                      disabled={Checkbox}
                      onChange={(e) =>
                        setData({
                          ...Data,
                          present_address: {
                            ...Data.present_address,
                            state: e.target.value,
                          },
                        })
                      }
                      value={
                        Checkbox
                          ? Data.permanent_address.state
                          : Data.present_address.state
                      }
                    />
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="country"
                      className="block mb-3 font-semibold text-gray-800 dark:text-white"
                    >
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      id="country"
                      className="bg-gray-50 disabled:bg-slate-100 disabled:cursor-not-allowed border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                      placeholder="country"
                      required
                      disabled={Checkbox}
                      onChange={(e) =>
                        setData({
                          ...Data,
                          present_address: {
                            ...Data.present_address,
                            country: e.target.value,
                          },
                        })
                      }
                      value={
                        Checkbox
                          ? Data.permanent_address.country
                          : Data.present_address.country
                      }
                    />
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="zip_code"
                      className="block mb-3 font-semibold text-gray-800 dark:text-white"
                    >
                      Zip Code
                    </label>
                    <input
                      type="text"
                      name="zip_code"
                      id="zip_code"
                      className="bg-gray-50 disabled:bg-slate-100 disabled:cursor-not-allowed border border-gray-300 text-gray-800 rounded-lg focus:ring-lavender--600 focus:border-lavender--600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
                      placeholder="Zip Code"
                      required
                      disabled={Checkbox}
                      onChange={(e) =>
                        setData({
                          ...Data,
                          present_address: {
                            ...Data.present_address,
                            zip_code: e.target.value,
                          },
                        })
                      }
                      value={
                        Checkbox
                          ? Data.permanent_address.zip_code
                          : Data.present_address.zip_code
                      }
                    />
                  </div>
                </div> */}
                <textarea
                  rows={10}
                  disabled={Checkbox} // when “same as permanent address” is checked
                  className="bg-gray-50 border border-gray-300 rounded-lg block w-full p-3 disabled:bg-slate-100"
                  value={
                    Checkbox ? Data.permanent_address : Data.present_address
                  }
                  onChange={(e) =>
                    setData({ ...Data, present_address: e.target.value })
                  }
                />

              </div>
            </div>
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
                  <div className="w-full mt-4">
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
