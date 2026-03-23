import React, { useEffect, useRef, useState } from 'react'
import { FaArrowLeft, FaHeading } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom';
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";
import axios from "axios";
import moment from "moment";
import { URL } from "../../App";
import SmallSizedModal from '../../Components/Expense/SmallSizedModal';
import { PiLetterCircleHBold } from 'react-icons/pi';

export const AddNewMember = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const latestHeadSearchRef = useRef("");
  const [errors, setErrors] = useState({});
  const [isHead, setIsHead] = useState(true);
  const [familyId, setFamilyId] = useState("");
  const [headName, setHeadName] = useState("");
  const [relation, setRelation] = useState("");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [aadharError, setAadharError] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [primaryContactNumber, setPrimaryContactNumber] = useState("");
  const [contactNumbers, setContactNumbers] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [primaryEmail, setPrimaryEmail] = useState("");
  const [primaryEmailError, setPrimaryEmailError] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoError, setPhotoError] = useState("");
  const [isDualMember, setIsDualMember] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [presentAddress, setPresentAddress] = useState("");
  const [presentPincode, setPresentPincode] = useState("");
  const [permanentPincode, setPermanentPincode] = useState("");
  const [sameAddress, setSameAddress] = useState(false);
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const [zoneError, setZoneError] = useState("");
  const token = window.sessionStorage.getItem("token");
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [newAreaName, setNewAreaName] = useState("");
  const [areaError, setAreaError] = useState("");
  const [baptism, setBaptism] = useState("");
  const [communion, setCommunion] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  // Personal Details
  const [memberId, setMemberId] = useState("MBR");
  const [memberType, setMemberType] = useState("");
  const isPreparatory = memberType === "Preparatory/Unpaid Member";
  const [memberName, setMemberName] = useState("");
  const [memberTamilName, setMemberTamilName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");

  const [gender, setGender] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [qualification, setQualification] = useState("");
  const [occupation, setOccupation] = useState("");
  const [community, setCommunity] = useState("");
  const [nationality, setNationality] = useState("");

  // Dual Membership
  const [dualMemberId, setDualMemberId] = useState("");
  const [churchName, setChurchName] = useState("");

  // Spiritual Info
  const [baptismDate, setBaptismDate] = useState("");
  const [baptismBy, setBaptismBy] = useState("");
  const [baptismChurch, setBaptismChurch] = useState("");

  const [communionDate, setCommunionDate] = useState("");
  const [communionBy, setCommunionBy] = useState("");

  const [confirmationDate, setConfirmationDate] = useState("");
  const [confirmationBy, setConfirmationBy] = useState("");
  const [confirmationChurch, setConfirmationChurch] = useState("");

  // Marital Info
  const [marriageDate, setMarriageDate] = useState("");
  const [marriagePlace, setMarriagePlace] = useState("");
  const [headIdSearch, setHeadIdSearch] = useState("");      // ⭐ ADD
  const [headDropdown, setHeadDropdown] = useState([]);      // ⭐ ADD

  const [headValidationMsg, setHeadValidationMsg] = useState("");
  const [headValidationType, setHeadValidationType] = useState("");
  const [title, setTitle] = useState("");
  const [tamilTitle, setTamilTitle] = useState("");

  const [showTamilKeyboard, setShowTamilKeyboard] = useState(false);
  const [activeTamilField, setActiveTamilField] = useState(null);

  // refs + state (add near other useState/useRef)
  const tamilInputWrapperRef = useRef(null);   // wrapper around the tamil input
  const tamilInputRef = useRef(null);          // actual input element
  // New fields
  const [addOfficialAddress, setAddOfficialAddress] = useState(false);
  const [membershipFrom, setMembershipFrom] = useState("");
  const [officialAddress, setOfficialAddress] = useState("");
  const [officialPincode, setOfficialPincode] = useState("");

  const [occupations, setOccupations] = useState([]);
  const [selectedOccupation, setSelectedOccupation] = useState("");

  const [isOccupationModalOpen, setIsOccupationModalOpen] = useState(false);
  const [newOccupationName, setNewOccupationName] = useState("");
  const [occupationError, setOccupationError] = useState("");
  const [isManualTitle, setIsManualTitle] = useState(false);

  const scrollToFirstError = (errorsObj) => {
    const firstKey = Object.keys(errorsObj)[0];
    if (!firstKey) return;

    const el = document.querySelector(`[data-error="${firstKey}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus();
    }
  };


  const validateForm = () => {
    const e = {};
    if (!primaryContactNumber || primaryContactNumber.length !== 10) {
      e.primaryContactNumber = "Please fill the Primary Contact Number";
    }
    if (isHead) {
      if (!memberId) e.memberId = "Please fill Member ID";
      if (!memberType) e.memberType = "Please select Member Type";
      if (!familyId) e.familyId = "Please fill Family ID";
      if (!memberName) e.memberName = "Please fill Member Name";
      if (!memberTamilName) e.memberTamilName = "Please fill Tamil Name";
      if (!gender) e.gender = "Please select Gender";
    } else {
      if (!headIdSearch) e.headIdSearch = "Please fill Family Head ID";
      if (!relation) e.relation = "Please select Relation";
      if (!memberId) e.memberId = "Please fill Member ID";
      if (!memberType) e.memberType = "Please select Member Type";
      if (!memberName) e.memberName = "Please fill Member Name";
      if (!memberTamilName) e.memberTamilName = "Please fill Tamil Name";
      if (!gender) e.gender = "Please select Gender";
    }

    setErrors(e);

    if (Object.keys(e).length > 0) {
      scrollToFirstError(e);
      return false;
    }

    return true;

  };

  const handlePrimaryContactChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    val = val.slice(0, 10);
    setPrimaryContactNumber(val);
  };



  const relationGenderMap = {
    Husband: "Male",
    Son: "Male",
    Brother: "Male",
    Father: "Male",
    "Son-In-Law": "Male",
    Grandson: "Male",

    Wife: "Female",
    Daughter: "Female",
    Sister: "Female",
    Mother: "Female",
    "Daughter-In-Law": "Female",
    Granddaughter: "Female",
  };



  // close when clicking outside (same UX as dropdown)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!showTamilKeyboard) return;
      if (
        tamilInputWrapperRef.current &&
        !tamilInputWrapperRef.current.contains(e.target)
      ) {
        setShowTamilKeyboard(false);
        setActiveTamilField(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTamilKeyboard]);







  const getTitle = (age, gender, maritalStatus, memberType) => {
    if (!gender) return "";

    // ⭐ SPECIAL CASE FOR PRESBYTER
    if (memberType === "Presbyter & Family") {
      if (gender === "Male") return "Rev. Mr.";
      if (gender === "Female") return "Rev. Mrs.";
    }

    const a = Number(age);

    if (gender === "Male") {
      return a < 13 ? "Master" : "Mister";
    }

    if (gender === "Female") {
      if (a < 13) return "Miss";
      if (maritalStatus === "Married") return "Mrs";
      return "Miss";
    }

    return "";
  };
  // useEffect(() => {
  //   const newTitle = getTitle(age, gender, maritalStatus, memberType);
  //   setTitle(newTitle);
  // }, [age, gender, maritalStatus, memberType]);

  const getTamilTitle = (title) => {
    switch (title) {
      case "Master": return "மாஸ்டர்";
      case "Mister": return "மிஸ்டர்";
      case "Miss": return "மிஸ்";
      case "Mrs": return "மிசஸ்";

      case "Rev. Mr.": return "அருட்திரு.";
      case "Rev. Mrs.": return "அருட்திருமதி.";

      default: return "";
    }
  };

  useEffect(() => {
  setIsManualTitle(false);
}, [memberType]);

  useEffect(() => {
    setTamilTitle(getTamilTitle(title));
  }, [title]);

  const transliterateTamil = async (text) => {
    try {
      if (!text.trim()) {
        setMemberTamilName("");
        return;
      }

      const res = await axios.get(
        `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=ta-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8`
      );

      if (res.data[0] === "SUCCESS") {
        const tamil = res.data[1][0][1][0];
        setMemberTamilName(tamil);
      }
    } catch (error) {
      console.error("Tamil Transliteration Error:", error);
    }
  };

  useEffect(() => {
    transliterateTamil(memberName);
  }, [memberName]);

  const handleTamilKey = (val) => {
    if (activeTamilField === "memberTamilName") {
      if (val === "BACKSPACE") {
        setMemberTamilName((prev) => prev.slice(0, -1));
      } else {
        setMemberTamilName((prev) => prev + val);
      }
    }
  };



  const insertTamilAtCursor = (letter) => {
    const input = tamilInputRef.current;
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;

    // BACKSPACE handling
    if (letter === "BACKSPACE") {
      if (start === end && start > 0) {
        const newValue =
          memberTamilName.slice(0, start - 1) +
          memberTamilName.slice(end);

        setMemberTamilName(newValue);

        requestAnimationFrame(() => {
          input.selectionStart = input.selectionEnd = start - 1;
          input.focus();   // ⭐ Force focus again
        });
      }
      return;
    }

    // Insert letter
    const before = memberTamilName.slice(0, start);
    const after = memberTamilName.slice(end);
    const newValue = before + letter + after;

    setMemberTamilName(newValue);

    requestAnimationFrame(() => {
      input.selectionStart = input.selectionEnd = start + letter.length;
      input.focus();   // ⭐ Always keep input focused
    });
  };

  // ⭐ Fetch Next Auto-Increment Family ID
  const fetchNextFamilyId = async () => {
    try {
      const res = await axios.get(`${URL}/new-members/next-family-id`, {
        headers: { Authorization: token }
      });
      return res.data.familyId;
    } catch (err) {
      console.error("Failed to fetch next Family ID", err);
      return "";
    }
  };



  const TamilKeyboardDropdown = ({ onSelect, onClose }) => {
    const keys = [
      "அ", "ஆ", "இ", "ஈ", "உ", "ஊ",
      "எ", "ஏ", "ஐ", "ஒ", "ஓ", "ஔ",
      "க", "ங", "ச", "ஞ", "ட", "ண",
      "த", "ந", "ப", "ம", "ய", "ர",
      "ல", "வ", "ழ", "ள", "ற", "ன",
      "ஷ", "ஸ", "ஹ", "ஜ",
      "்", "ா", "ி", "ீ", "ு", "ூ", "ெ", "ே", "ை", "ொ", "ோ", "ௌ"
    ];

    const highlightKeys = new Set([
      "்", "ா", "ி", "ீ", "ு", "ூ", "ெ", "ே", "ை", "ொ", "ோ", "ௌ"
    ]);

    return (
      <div
        className="absolute z-50 w-full bg-white mt-1 border border-gray-200 rounded-md shadow-lg p-3"
        onClick={(e) => e.stopPropagation()}
      >

        <div
          className="
          flex 
          flex-wrap 
          justify-center 
          gap-1 
        "
          style={{
            height: "120px",
            alignContent: "space-between"
          }}
        >
          {keys.map((k) => {
            const isHighlight = highlightKeys.has(k);
            return (
              <button
                key={k}
                className={`px-2 py-1 rounded text-xs font-semibold
                ${isHighlight
                    ? "bg-indigo-400 hover:bg-indigo-500"
                    : "bg-blue-200 hover:bg-blue-300"}
              `}
                onClick={() => insertTamilAtCursor(k)}
              >
                {k}
              </button>
            );
          })}
        </div>

        <div className="flex justify-between mt-3">
          <button
            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
            onClick={() => insertTamilAtCursor("BACKSPACE")

            }

          >
            Backspace
          </button>

          <button
            className="bg-lavender--600 text-white px-3 py-1 rounded text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>

      </div>
    );
  };






  const generateFamilyIdFromMember = (memberId) => {
    if (!memberId) return "";
    const base = memberId.split("/")[0];  // MBR00007
    const num = base.replace("MBR", "");  // 00007
    return `FAM${num}`;
  };



  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // search by ID
  // const debouncedHeadSearch = useRef(
  //   debounce(async (val) => {
  //     if (!val) {
  //       setHeadDropdown([]);
  //       return;
  //     }

  //     // 🔐 Store latest search value
  //     latestHeadSearchRef.current = val;

  //     try {
  //       const res = await axios.get(
  //         `${URL}/member-search/by-id?id=${encodeURIComponent(val)}`,
  //         {
  //           headers: { Authorization: token },
  //         }
  //       );

  //       // ✅ Update dropdown ONLY if this is the latest search
  //       if (latestHeadSearchRef.current === val) {
  //         setHeadDropdown(res.data || []);
  //       }
  //     } catch (err) {
  //       // Same protection for error case
  //       if (latestHeadSearchRef.current === val) {
  //         setHeadDropdown([
  //           { member_id: "none", member_name: "No Members Found" },
  //         ]);
  //       }
  //     }
  //   }, 300)
  // ).current;

  const debouncedHeadSearch = useRef(
    debounce(async (val) => {
      if (!val) {
        setHeadDropdown([]);
        return;
      }

      latestHeadSearchRef.current = val;

      try {
        const [idRes, nameRes] = await Promise.allSettled([
          axios.get(
            `${URL}/member-search/by-id?id=${encodeURIComponent(val)}`,
            { headers: { Authorization: token } }
          ),
          axios.get(
            `${URL}/member-search/by-name?name=${encodeURIComponent(val)}`,
            { headers: { Authorization: token } }
          ),
        ]);

        let combined = [];

        if (idRes.status === "fulfilled") {
          combined = [...combined, ...(idRes.value.data || [])];
        }

        if (nameRes.status === "fulfilled") {
          combined = [...combined, ...(nameRes.value.data || [])];
        }

        // ✅ REMOVE DUPLICATES (VERY IMPORTANT)
        const uniqueMap = new Map();
        combined.forEach((m) => {
          if (m.member_id) {
            uniqueMap.set(m.member_id, m);
          }
        });

        const finalResults = Array.from(uniqueMap.values());

        if (latestHeadSearchRef.current === val) {
          setHeadDropdown(
            finalResults.length
              ? finalResults
              : [{ member_id: "none", member_name: "No Members Found" }]
          );
        }
      } catch (err) {
        if (latestHeadSearchRef.current === val) {
          setHeadDropdown([
            { member_id: "none", member_name: "No Members Found" },
          ]);
        }
      }
    }, 300)
  ).current;




  const calculateAge = (selectedDob) => {
    const dobDate = new Date(selectedDob);
    const today = new Date();

    let calculatedAge = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    const dayDiff = today.getDate() - dobDate.getDate();

    // Fix age if birthday hasn't come yet this year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      calculatedAge--;
    }

    setAge(calculatedAge >= 0 ? calculatedAge : 0);
  };

  const handleAadharChange = (value) => {
    // Remove all non-numeric characters
    let numeric = value.replace(/\D/g, "");

    // Limit to 12 digits
    numeric = numeric.slice(0, 12);

    // Auto-spacing: XXXX XXXX XXXX
    let formatted = numeric
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .trim();

    setAadhar(formatted);

    // Validation
    if (numeric.length === 12) {
      setAadharError(""); // Valid
    } else {
      setAadharError("Aadhar must be 12 digits");
    }
  };

  const handleContactChange = (e) => {
    let value = e.target.value;

    // Remove all characters except digits, commas, and spaces
    value = value.replace(/[^0-9, ]/g, "");

    // ❌ Remove spaces BEFORE comma
    value = value.replace(/ \,/g, ",");

    // ✅ Fix spacing AFTER comma → exactly one space
    value = value.replace(/,\s*/g, ", ");

    // ❌ Prevent leading space at start
    value = value.replace(/^\s+/, "");

    setContactNumbers(value);
  };



  const validateEmail = (value) => {
    // Remove spaces
    const cleaned = value.trim();

    // Email regex (strong + commonly used)
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

    if (cleaned === "") {
      setEmail("");
      setEmailError("");
      return;
    }

    setEmail(cleaned);

    if (!pattern.test(cleaned)) {
      setEmailError("Enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const validatePrimaryEmail = (value) => {

    const cleaned = value.trim();

    const pattern =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

    setPrimaryEmail(cleaned);

    // ✅ Allow empty
    if (cleaned === "") {
      setPrimaryEmailError("");
      return;
    }

    // ✅ Validate only if entered
    if (!pattern.test(cleaned)) {
      setPrimaryEmailError("Enter a valid primary email");
    } else {
      setPrimaryEmailError("");
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      setPhoto(null);
      setPhotoError("Only JPG, JPEG, and PNG formats are allowed.");
      return;
    }

    setPhoto(file);
    setPhotoError("");
  };

  const handleSameAddress = () => {
    if (!presentAddress && !presentPincode) return;

    const newValue = !sameAddress;
    setSameAddress(newValue);

    if (newValue) {
      setPermanentAddress(presentAddress);
      setPermanentPincode(presentPincode);
    } else {
      setPermanentAddress("");
      setPermanentPincode("");
    }
  };

  const fetchZones = async () => {
    try {
      const res = await axios.get(`${URL}/zones/all`, {
        headers: { Authorization: token },
      });

      setZones(res.data);
    } catch (err) {
      console.error("Zones Fetch Error:", err);
      setZones([]);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchOccupations = async () => {
    try {
      const res = await axios.get(`${URL}/occupations/all`, {
        headers: { Authorization: token },
      });
      setOccupations(res.data);
    } catch (err) {
      console.error("Occupation Fetch Error:", err);
      setOccupations([]);
    }
  };

  useEffect(() => {
    fetchOccupations();
  }, []);
  const showToast = (status, message) => {
    setResponse({ status: null, message: "" });
    setTimeout(() => setResponse({ status, message }), 10);
    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  };

  const handleSaveOccupation = async () => {
    if (!newOccupationName.trim()) {
      setOccupationError("Occupation is required");
      showToast("Failed", "Occupation is required"); // 🔥 toast added
      return;
    }

    try {
      await axios.post(
        `${URL}/occupations/add`,
        { occupation: newOccupationName },
        { headers: { Authorization: token } }
      );

      setNewOccupationName("");
      setOccupationError("");
      setIsOccupationModalOpen(false);

      fetchOccupations();

      showToast("Success", "Occupation added successfully"); // 🔥 success toast
    } catch (err) {
      const msg =
        err.response?.data?.message || "Error adding occupation";

      setOccupationError(msg);
      showToast("Failed", msg); // 🔥 error toast
    }
  };

  const handleSaveZone = async () => {
    if (!newZoneName.trim()) {
      // ❗ Validation toast
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: "Zone name is required",
        });
      }, 10);

      // Auto hide
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
      return;
    }

    try {
      await axios.post(
        `${URL}/zones/add`,
        { zone: newZoneName },
        {
          headers: { Authorization: token },
        }
      );

      // 🟢 Success toast — forced re-render
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Success",
          message: "Zone added successfully",
        });
      }, 10);

      // Auto hide
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);

      // Reset UI
      setNewZoneName("");
      setIsZoneModalOpen(false);

      fetchZones();

    } catch (err) {
      console.error("Add Zone Error:", err);

      // 🔴 Error toast — forced re-render
      setResponse({ status: null, message: "" });
      setTimeout(() => {
        setResponse({
          status: "Failed",
          message: err.response?.data?.message || "Something went wrong",
        });
      }, 10);

      // Auto hide
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    }
  };

  const fetchAreas = async (zone) => {
    try {
      const res = await axios.get(
        `${URL}/zones/areas/${zone}`,
        { headers: { Authorization: token } }
      );
      setAreas(res.data);
    } catch (err) {
      console.error("Area Fetch Error:", err);
      setAreas([]);
    }
  };

  useEffect(() => {
    if (selectedZone) {
      fetchAreas(selectedZone);
    } else {
      setAreas([]);
    }
  }, [selectedZone]);

  const handleSaveArea = async () => {
    if (!selectedZone) {
      setAreaError("Please select a Zone first.");
      return;
    }

    if (!newAreaName.trim()) {
      setAreaError("Area name is required.");
      return;
    }

    try {
      await axios.post(
        `${URL}/zones/area/add`,
        { zone: selectedZone, area: newAreaName },
        { headers: { Authorization: token } }
      );

      setResponse({ status: "Success", message: "Area added successfully" });

      // Reset
      setNewAreaName("");
      setAreaError("");
      setIsAreaModalOpen(false);

      fetchAreas(selectedZone);

    } catch (err) {
      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Error adding area",
      });
    }

    setTimeout(() => setResponse({ status: null, message: "" }), 3000);
  };

  // Auto ID Generate
  const handleMemberIdChange = (e) => {
    let value = e.target.value.toUpperCase();

    if (!value.startsWith("MBR")) value = "MBR";

    let suffix = value.slice(3).replace(/[^0-9]/g, "");

    const newId = "MBR" + suffix;
    setMemberId(newId);

    // Auto-update family ID if this member is head
    if (isHead) {
      fetchNextFamilyId().then(id => setFamilyId(id));
    }

  };



  const handleFamilyIdChange = (e) => {
    let value = e.target.value.toUpperCase();

    // Always force prefix FAM
    if (!value.startsWith("FAM")) {
      value = "FAM" + value.replace(/[^0-9]/g, "");
    }

    // Extract digits after FAM
    let digits = value.slice(3).replace(/[^0-9]/g, "");

    // Allow only 5 digits
    digits = digits.slice(0, 5);

    // Build final family ID
    let finalId = "FAM" + digits;

    setFamilyId(finalId);
  };



  const handleMemberTypeChange = (type) => {
    resetMembershipCore();
    setMemberType(type);


    // Preparatory Member → always non-head
    if (type === "Preparatory/Unpaid Member") {

      setIsHead(false);

      // Reset memberId & familyId because Head must be selected again
      setMemberId("");
      setFamilyId("");

      // Force user to select head again
      setHeadName("");
      setHeadIdSearch("");
      setRelation("");

    }
    else {
      setIsHead(true);

      const base = memberId.split("/")[0];
      setMemberId(`${base}/1`);

      // Auto-assign family for head
      fetchNextFamilyId().then(id => setFamilyId(id));
    }

  };


  useEffect(() => {
    if (memberType === "Dual Member") {
      setIsDualMember("Yes");
    } else {
      setIsDualMember("");
      setDualMemberId("");
      setChurchName("");
    }
  }, [memberType]);



  useEffect(() => {
    const fetchIds = async () => {
      try {
        const res = await axios.get(`${URL}/new-members/init`, {
          headers: { Authorization: token }
        });

        const newMemberId = res.data.memberId;
        setMemberId(newMemberId);

        setFamilyId("");

      } catch (err) {
        console.log(err);
      }
    };

    fetchIds();
  }, []);



  // const validateHead = async (headId) => {
  //   try {
  //     const res = await axios.post(
  //       `${URL}/new-members/validate-head`,
  //       {
  //         headMemberId: headId,
  //         isPreparatory: memberType === "Preparatory/Unpaid Member",
  //       },
  //       { headers: { Authorization: token } }
  //     );

  //     // Set updated values
  //     setFamilyId(res.data.familyId);  // correct family from head
  // setHeadName(res.data.headName);
  // setMemberId(res.data.nextMemberId); // next sub-member or next main (from backend)


  //     // ✔ Show success message below input
  //     setHeadValidationType("success");
  //     setHeadValidationMsg("Family Head validated successfully");

  //     // Auto-clear
  //     setTimeout(() => {
  //       setHeadValidationMsg("");
  //       setHeadValidationType("");
  //     }, 3000);

  //   } catch (err) {
  //     setHeadName("");

  //     // ✔ Show error message below input
  //     setHeadValidationType("error");
  //     setHeadValidationMsg(
  //       err.response?.data?.message || "Invalid Family Head ID"
  //     );

  //     // Auto-clear
  //     setTimeout(() => {
  //       setHeadValidationMsg("");
  //       setHeadValidationType("");
  //     }, 3000);
  //   }
  // };


  useEffect(() => {
    const blockRefresh = (e) => {
      if (saving) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", blockRefresh);
    return () => window.removeEventListener("beforeunload", blockRefresh);
  }, [saving]);


  const handleSave = async () => {
    if (saving) return;
    if (!validateForm()) return;
    try {
      setSaving(true);
      const formData = new FormData();

      // Append Photo


      // Append all fields
      Object.entries({
        member_id: memberId,
        member_type: memberType,
        isHead: isHead ? "Yes" : "No",
        family_id: familyId,
        relation_with_head: relation,
        member_name: memberName,
        member_title: title,
        member_tamil_name: memberTamilName,
        member_tamil_title: tamilTitle,
        father_name: fatherName,
        mother_name: motherName,
        gender,
        dob,
        age,
        place_of_birth: placeOfBirth,
        aadhar_number: aadhar,
        blood_group: bloodGroup,
        joining_date: joiningDate,
        email, primary_email: primaryEmail,
        qualification,
        occupation: selectedOccupation,
        community,
        nationality,
        primary_contact_number: primaryContactNumber,
        contact_numbers: contactNumbers,
        is_dual_member: isDualMember,
        dual_member_id: dualMemberId,
        church_name: churchName,
        present_address: presentAddress,
        permanent_address: permanentAddress,
        present_pincode: presentPincode,
        permanent_pincode: permanentPincode,
        zone: selectedZone,
        area: selectedArea,
        baptism,
        baptism_date: baptismDate,
        baptism_by: baptismBy,
        baptism_church: baptismChurch,
        confirmation,
        confirmation_date: confirmationDate,
        confirmation_by: confirmationBy,
        confirmation_church: confirmationChurch,
        marital_status: maritalStatus,
        marriage_date: marriageDate,
        marriage_place: marriagePlace,
        status: "Active",
        membership_status: "Unhold",
        membership_from: membershipFrom,
        official_address: officialAddress,
        official_pincode: officialPincode,

      }).forEach(([key, value]) => formData.append(key, value));
      if (photo) {
        formData.append("photo", photo);
      }

      await axios.post(`${URL}/new-members/add`, formData, {
        headers: {
          Authorization: token,
          "Content-Type": "multipart/form-data",
        },
      });

      setResponse({
        status: "Success",
        message: "Member Added Successfully!",
      });

      setTimeout(() => navigate("/admin/memberlist"), 500);

    } catch (err) {
      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Error saving member",
      });
    } finally {
      setSaving(false);
    }
  };

  // ⭐ Auto-fill Head Details After Validation
  const autoFillHeadDetails = async (headMemberId) => {
    try {
      const encoded = encodeURIComponent(headMemberId);

      const res = await axios.get(
        `${URL}/new-members/by-member-id/${encoded}`,
        { headers: { Authorization: token } }
      );

      const h = res.data;

      // ☑ Contact Numbers
      if (memberType === "Preparatory/Unpaid Member") {
        setContactNumbers(
          Array.isArray(h.contact_numbers)
            ? h.contact_numbers.join(",")
            : h.contact_numbers || ""
        );
      }

      // ☑ Address
      setPresentAddress(h.present_address || "");
      setPermanentAddress(h.permanent_address || "");

      if (h.present_address && h.permanent_address) {
        setSameAddress(true);
      }

      // ☑ Pincode
      setPresentPincode(h.present_pincode || "");
      setPermanentPincode(h.permanent_pincode || "");

      // ☑ Zone & Area
      setSelectedZone(h.zone || "");
      setSelectedArea(h.area || "");

    } catch (err) {
      console.log("Auto-fill head details error:", err);
    }
  };

  // ⭐ Fetch full family members for parent auto-fill
  const fetchFamilyMembers = async (famId) => {
    try {
      const res = await axios.get(`${URL}/family/${famId}`, {
        headers: { Authorization: token }
      });
      return res.data; // contains members array + head info
    } catch (err) {
      console.log("Family fetch error:", err);
      return null;
    }
  };

  // ⭐ Auto-fill Father / Mother for Son or Daughter
  const autoFillParents = (family) => {
    if (!family || !family.members) return;

    const members = family.members;
    const headId = family.head_member_id;
    const headMember = members.find(m => m.member_id === headId);

    if (!headMember) return;

    let father = "";
    let mother = "";

    // ⭐ If Head is Male → Father = Head
    if (headMember.gender === "Male") {
      father = headMember.member_name;

      // Check if Wife exists → Mother
      const wife = members.find(m => m.relation_with_head === "Wife");
      if (wife) mother = wife.member_name;

    } else {
      // ⭐ If Head is Female → Mother = Head
      mother = headMember.member_name;

      // Check if Husband exists → Father
      const husband = members.find(m => m.relation_with_head === "Husband");
      if (husband) father = husband.member_name;
    }

    // ⭐ Finally set in state
    setFatherName(father);
    setMotherName(mother);
  };

  const autoFillSpouseMaritalInfo = (family) => {
    if (!family || !family.members) return;

    const head = family.members.find(
      m => m.member_id === family.head_member_id
    );

    if (!head) return;

    // Only if head is already married
    if (head.marital_status === "Married") {
      setMaritalStatus("Married");
      setMarriageDate(head.marriage_date || "");
      setMarriagePlace(head.marriage_place || "");
    }
  };



  const validateHead = async (headId) => {
    try {
      const res = await axios.post(
        `${URL}/new-members/validate-head`,
        {
          headMemberId: headId,
          isPreparatory: memberType === "Preparatory/Unpaid Member",
        },
        { headers: { Authorization: token } }
      );

      // Set updated values from validation
      setFamilyId(res.data.familyId);
      setHeadName(res.data.headName);
      setMemberId(res.data.nextMemberId);
      // ⭐ Fetch family members for father/mother auto-fill
      fetchFamilyMembers(res.data.familyId).then(family => {

        if (relation === "Husband" || relation === "Wife") {
          autoFillSpouseMaritalInfo(family);
        }
        if (family && (relation === "Son" || relation === "Daughter")) {
          autoFillParents(family);
        }
      });


      // --- SUCCESS MESSAGE ---
      setHeadValidationType("success");
      setHeadValidationMsg("Family Head validated successfully");
      setTimeout(() => {
        setHeadValidationMsg("");
        setHeadValidationType("");
      }, 3000);

      // ⭐ Auto-fill Head Details
      autoFillHeadDetails(headId);

    } catch (err) {
      // --- ERROR ---
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

  const resetMembershipCore = () => {
    // setMemberId("");
    // setMemberType("");
    setFamilyId("");
    setHeadName("");
    setRelation("");
    setHeadIdSearch("");
  };

  const clearError = (field) => {
    setErrors(prev => {
      if (!prev[field]) return prev;
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

useEffect(() => {
  if (!isManualTitle) {
    const newTitle = getTitle(age, gender, maritalStatus, memberType);
    setTitle(newTitle);
  }
}, [age, gender, maritalStatus, memberType]);


useEffect(() => {
  if (memberType === "Presbyter & Family") {
    if (!["Rev. Mr.", "Rev. Mrs."].includes(title)) {
      setTitle("");
    }
  } else {
    if (["Rev. Mr.", "Rev. Mrs."].includes(title)) {
      setTitle("");
    }
  }
}, [memberType]);


  return (
    <>
      <div className={`${saving ? "pointer-events-none opacity-60" : ""}`}>
        <FaArrowLeft
          size={18}
          title='Back'
          onClick={() => navigate("/admin/memberlist")}
          className="cursor-pointer mb-4"
        />
        <h1 className="text-lg font-semibold">Add Member</h1>
        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <h1 className="text-lg text-lavender--600 font-semibold">Membership Details</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Member ID <span className='text-red-500 font-bold text-[17px]'>*</span></label>
              <input
                data-error="memberId"
                type="text"
                readOnly
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
                Member Type <span className='text-red-500 font-bold text-[17px]'>*</span>
              </label>

              <select
                data-error="memberType"
                value={memberType}
                onChange={(e) => {
                  handleMemberTypeChange(e.target.value);
                  if (e.target.value) clearError("memberType");
                }}
                required
                className={`block w-full mt-1 rounded-md shadow-sm sm:text-sm
              ${errors.memberType ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">Select Member Type</option>
                <option value="Full Member">Full Member</option>
                <option value="Dual Member">Dual Member</option>
                <option value="Preparatory/Unpaid Member">Preparatory/Unpaid Member</option>
                <option value="Non-Residential Member">Non-Residential Member</option>
                <option value="Presbyter & Family">Presbyter & Family</option>
              </select>
              {errors.memberType && (
                <p className="text-red-500 text-xs mt-1">{errors.memberType}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Is Head <span className='text-red-500 font-bold text-[17px]'>*</span></label>

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
                      if (memberType === "Preparatory/Unpaid Member") return; // ⭐ Prevent clicking

                      resetMembershipCore();

                      setIsHead(true);
                      setHeadIdSearch("");
                      setHeadName("");
                      setRelation("");

                      fetchNextFamilyId().then(id => setFamilyId(id));
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
                      resetMembershipCore();
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
                <label className="block text-sm font-medium text-gray-700">Family ID <span className='text-red-500 font-bold text-[17px]'>*</span></label>
                {/* <input
                type="text"
                placeholder="Family ID"
                value={familyId}
                readOnly
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              /> */}
                <input
                  data-error="familyId"
                  type="text"
                  readOnly
                  placeholder="Family ID"
                  value={familyId}
                  onChange={(e) => {
                    handleFamilyIdChange(e);
                    if (e.target.value) clearError("familyId");
                  }}
                  className={`block w-full mt-1 rounded-md shadow-sm sm:text-sm
                ${errors.familyId ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.familyId && <p className="text-red-500 text-xs">{errors.familyId}</p>}
              </div>
            )}
            {!isHead && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Family Head ID <span className='text-red-500 font-bold text-[17px]'>*</span></label>

                <input
                  data-error="headIdSearch"
                  type="text"
                  placeholder="Search Family Head ID"
                  value={headIdSearch}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHeadIdSearch(val);
                    debouncedHeadSearch(val);
                    if (val) clearError("headIdSearch");
                  }}
                  className={`block w-full mt-1 rounded-md shadow-sm sm:text-sm
                ${errors.headIdSearch ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.headIdSearch && <p className="text-red-500 text-xs">{errors.headIdSearch}</p>}
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
                        <span className="w-[140px] font-medium flex items-center">
                          {m.member_id}

                          {m.isHead === "Yes" && (
                            <span className="ml-1 flex items-center text-green-500">
                              <PiLetterCircleHBold
                                size={22}
                                className="mx-0.5"
                                title="Family Head"
                              />
                            </span>
                          )}
                        </span>

                        <span className="ml-4 text-gray-800">{m.member_name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {!isHead && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Head of the Family <span className='text-red-500 font-bold text-[17px]'>*</span></label>
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
                  Relation With Family Head <span className='text-red-500 font-bold text-[17px]'>*</span>
                </label>

                <select
                  data-error="relation"
                  required
                  value={relation}
                  onChange={async (e) => {
                    const rel = e.target.value;
                    setRelation(rel);
                    if (rel) clearError("relation");

                    // ✅ Auto set gender
                    if (relationGenderMap[rel]) {
                      setGender(relationGenderMap[rel]);
                    }

                    // ⬇️ MUST have familyId already
                    if (!familyId) return;

                    const family = await fetchFamilyMembers(familyId);

                    // ✅ Parents auto-fill
                    if (rel === "Son" || rel === "Daughter") {
                      autoFillParents(family);
                    }

                    // ✅ SPOUSE MARITAL AUTO-FILL (THIS WAS MISSING)
                    if (rel === "Husband" || rel === "Wife") {
                      autoFillSpouseMaritalInfo(family);
                    }
                  }}


                  className={`block w-full mt-1 rounded-md shadow-sm sm:text-sm
                ${errors.relation ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="">Select Relation</option>
                  <option value="Husband">Husband</option>
                  <option value="Wife">Wife</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Son-In-Law">Son-In-Law</option>
                  <option value="Daughter-In-Law">Daughter-In-Law</option>
                  <option value="Grandson">Grandson</option>
                  <option value="Granddaughter">Granddaughter</option>
                </select>
                {errors.relation && (
                  <p className="text-red-500 text-xs mt-1">{errors.relation}</p>
                )}
              </div>
            )}

          </div>
        </div>
        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <h1 className="text-lg text-lavender--600 font-semibold">Personal Details</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">



            <div>
              <label className="block text-sm font-medium text-gray-700">
                Member Name <span className='text-red-500 font-bold text-[17px]'>*</span>
              </label>

              <div className="flex items-center mt-1 w-full">

                {/* 10% Title */}
<select
  value={title}
onChange={(e) => {
  setTitle(e.target.value);
  setIsManualTitle(true); // 🔥 important
}}
  className="border border-gray-300 bg-gray-50 text-gray-700 text-sm rounded-l-md shadow-sm"
  style={{ width: "20%", minWidth: "60px", height: "38px" }}
>
  <option value="">Select</option>

  {memberType === "Presbyter & Family" ? (
    <>
      <option value="Rev. Mr.">Rev. Mr.</option>
      <option value="Rev. Mrs.">Rev. Mrs.</option>
    </>
  ) : (
    <>
      <option value="Master">Master</option>
      <option value="Mister">Mister</option>
      <option value="Miss">Miss</option>
      <option value="Mrs">Mrs</option>
    </>
  )}
</select>
                {/* 90% Editable Name */}
                <input
                  data-error="memberName"
                  type="text"
                  value={memberName}
                  onChange={(e) => {
                    setMemberName(e.target.value);
                    if (e.target.value.trim()) clearError("memberName");
                  }}
                  className={`border border-gray-300 rounded-r-md shadow-sm sm:text-sm px-3 py-2
                ${errors.memberName ? "border-red-500" : "border-gray-300"}`}
                  style={{ width: "80%", height: "38px" }}
                  placeholder="Enter Member Name"
                />

              </div>
              {errors.memberName && (
                <p className="text-red-500 text-xs mt-1">{errors.memberName}</p>
              )}
            </div>



            <div className="relative" ref={tamilInputWrapperRef}>
              <label className="block text-sm font-medium text-gray-700">
                Member Tamil Name <span className='text-red-500 font-bold text-[17px]'>*</span>
              </label>

              <div className="flex items-center mt-1 w-full">
                <span
                  className="border border-gray-300 bg-gray-50 text-gray-700 text-sm flex items-center justify-center select-none rounded-l-md"
                  style={{ width: "20%", minWidth: "60px", height: "38px" }}
                >
                  {tamilTitle}
                </span>

                <input
                  data-error="memberTamilName"
                  type="text"
                  ref={tamilInputRef}
                  className={`border border-gray-300 rounded-r-md shadow-sm sm:text-sm px-3 py-2
                ${errors.memberTamilName ? "border-red-500" : "border-gray-300"}`}
                  style={{ width: "80%", height: "38px" }}
                  value={memberTamilName}
                  onChange={(e) => {
                    setMemberTamilName(e.target.value);
                    if (e.target.value.trim()) clearError("memberTamilName");
                  }}
                  onFocus={() => {
                    setActiveTamilField("memberTamilName");
                    setShowTamilKeyboard(true);
                  }}
                  placeholder="உறுப்பினர் பெயரை உள்ளிடவும்"
                />

              </div>

              {showTamilKeyboard && (
                <TamilKeyboardDropdown
                  onSelect={handleTamilKey}
                  onClose={() => setShowTamilKeyboard(false)}
                />
              )}
              {errors.memberTamilName && (
                <p className="text-red-500 text-xs mt-1">{errors.memberTamilName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Father Name</label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="Enter Father Name"
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mother Name</label>
              <input
                type="text"
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
                placeholder="Enter Mother Name"
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>



            <div>
              <label className="block text-sm font-medium text-gray-700">
                Primary Contact Number <span className='text-red-500 font-bold text-[17px]'>*</span>
              </label>

              <input
                data-error="primaryContactNumber"
                type="text"
                value={primaryContactNumber}
                onChange={handlePrimaryContactChange}
                placeholder="Enter 10 digit number"
                className={`block w-full mt-1 rounded-md shadow-sm sm:text-sm border
              ${errors.primaryContactNumber ? "border-red-500" : "border-gray-300"}
              `}
              />
              {errors.primaryContactNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.primaryContactNumber}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Numbers</label>
              <input
                type="text"
                value={contactNumbers}
                onChange={handleContactChange}
                placeholder='Enter Contact Numbers'
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Gender <span className='text-red-500 font-bold text-[17px]'>*</span></label>
              <select
                data-error="gender"
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value);
                  if (e.target.value) clearError("gender");
                }}
                className={`block w-full mt-1 rounded-md shadow-sm sm:text-sm
              ${errors.gender ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs">{errors.gender}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => {
                  const value = e.target.value;
                  setDob(value);
                  calculateAge(value);
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input
                type="text"
                placeholder='Select Date of Birth'
                value={age}
                readOnly
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Place of Birth</label>
              <input
                type="text"
                value={placeOfBirth}
                onChange={(e) => setPlaceOfBirth(e.target.value)}
                placeholder='Enter Place'
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Blood Group</label>
              <select
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>

                <option value="A1+">A1+</option>
                <option value="A1-">A1-</option>
                <option value="A2+">A2+</option>
                <option value="A2-">A2-</option>
                <option value="A1B+">A1B+</option>
                <option value="AB1+">AB1+</option>
                <option value="AB1-">AB1-</option>
                <option value="AB2+">AB2+</option>
                <option value="AB2-">AB2-</option>
                <option value="A2B+">A2B+</option>
                <option value="A2B-">A2B-</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Membership From</label>
              <input
                type="date"
                value={membershipFrom}
                onChange={(e) => setMembershipFrom(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Primary Email
              </label>

              <input
                data-error="primaryEmail"
                type="text"
                value={primaryEmail}
                onChange={(e) => {
                  setPrimaryEmail(e.target.value);
                  if (e.target.value) clearError("primaryEmail");
                }}

                onBlur={(e) => {
                  validatePrimaryEmail(e.target.value);
                }}
                placeholder="Enter Primary Email"
                className={`block w-full mt-1 rounded-md shadow-sm sm:text-sm border
    ${errors.primaryEmail ? "border-red-500" : "border-gray-300"}
    `}
              />

              {errors.primaryEmail && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.primaryEmail}
                </p>
              )}

              {primaryEmailError && (
                <p className="text-red-500 text-xs mt-1">
                  {primaryEmailError}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Qualification</label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder='Enter Qualification'
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            {/* <div>
              <label className="block text-sm font-medium text-gray-700">Occupation</label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder='Enter Profession'
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div> */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Occupation
                </label>

                <button
                  type="button"
                  onClick={() => setIsOccupationModalOpen(true)}
                  className="text-sm text-lavender--600 font-semibold"
                >
                  + Add Occupation
                </button>
              </div>

              <select
                value={selectedOccupation}
                onChange={(e) => setSelectedOccupation(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">-- Select Occupation --</option>
                {occupations.map((o) => (
                  <option key={o._id} value={o.occupation}>
                    {o.occupation}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Aadhar Number</label>
              <input
                type="text"
                value={aadhar}
                placeholder="XXXX XXXX XXXX"
                onChange={(e) => handleAadharChange(e.target.value)}
                className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm ${aadharError ? "border-red-500" : ""
                  }`}
              />
              {aadharError && (
                <p className="text-red-500 text-xs mt-1">{aadharError}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Member Photo</label>
              <input
                type="file"
                accept=".jpg, .jpeg, .png"
                onChange={handlePhotoUpload}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />

              {photoError && (
                <p className="text-red-500 text-xs mt-1">{photoError}</p>
              )}
            </div>
          </div>
        </div>
        {memberType === "Dual Member" && (
          <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
            <h1 className="text-lg text-lavender--600 font-semibold mb-2">Dual Membership</h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Is Dual Member</label>
                <select
                  value={isDualMember}
                  onChange={(e) => setIsDualMember(e.target.value)}
                  disabled={true}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                >
                  <option value="">--Select--</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              {isDualMember === "Yes" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dual Member ID</label>
                    <input
                      type="text"
                      value={dualMemberId}
                      onChange={(e) => setDualMemberId(e.target.value)}
                      placeholder="Enter Dual Member ID"
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Church Name</label>
                    <input
                      type="text"
                      value={churchName}
                      onChange={(e) => setChurchName(e.target.value)}
                      placeholder="Enter Church Name"
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg text-lavender--600 font-semibold">Address</h1>
            <div className='flex items-center gap-3'>

              <button
                type="button"
                disabled={!presentAddress}
                onClick={() => handleSameAddress()}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition
    ${sameAddress
                    ? "bg-lavender--600 text-white"
                    : "bg-gray-200 text-gray-700"}
    ${!presentAddress ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
  `}
              >
                Same as Residential Address
              </button>

              <button
                type="button"
                onClick={() => {
                  const next = !addOfficialAddress;
                  setAddOfficialAddress(next);

                  if (!next) {
                    setOfficialAddress("");
                    setOfficialPincode("");
                  }
                }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition
    ${addOfficialAddress
                    ? "bg-lavender--600 text-white"
                    : "bg-gray-200 text-gray-700"}
  `}
              >
                Add Official Address
              </button>

            </div>


          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Residential Address
              </label>
              <textarea
                rows={9}
                placeholder="Enter Residential Address"
                value={presentAddress}
                onChange={(e) => {
                  setPresentAddress(e.target.value);
                  if (sameAddress) setPermanentAddress(e.target.value);
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm resize-none overflow-y-auto"
              />

            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Permanent Address
              </label>
              <textarea
                rows={9}
                placeholder="Enter Permanent Address"
                value={permanentAddress}
                onChange={(e) => {
                  setPermanentAddress(e.target.value);
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm resize-none overflow-y-auto"
                readOnly={sameAddress}
              />

            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Residential Pincode</label>
              <input
                type="text"
                value={presentPincode}
                onChange={(e) => {
                  const val = e.target.value;

                  // ✅ Allow only digits & max 6 characters
                  if (/^\d{0,6}$/.test(val)) {
                    setPresentPincode(val);

                    // ✅ Auto-fill permanent if checkbox checked
                    if (sameAddress) setPermanentPincode(val);
                  }
                }}
                placeholder="Enter Residential Pincode"
                maxLength={6}
                inputMode="numeric"
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Permanent Pincode</label>
              <input
                type="text"
                value={permanentPincode}
                onChange={(e) => {
                  const val = e.target.value;

                  // ✅ Allow only digits & max 6 characters
                  if (/^\d{0,6}$/.test(val)) {
                    setPermanentPincode(val);
                  }
                }}
                placeholder="Enter Permanent Pincode"
                maxLength={6}
                inputMode="numeric"
                readOnly={sameAddress}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>


          </div>
          {addOfficialAddress && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Official Address
                </label>
                <textarea
                  rows={6}
                  placeholder="Enter Official Address"
                  value={officialAddress}
                  onChange={(e) => setOfficialAddress(e.target.value)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm resize-none overflow-y-auto"
                />

              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Official Pincode</label>
                <input
                  type="text"
                  placeholder="Enter Official Pincode"
                  value={officialPincode}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d{0,6}$/.test(val)) setOfficialPincode(val);
                  }}
                  maxLength={6}
                  inputMode="numeric"
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Zone
                </label>

                <button
                  type="button"
                  onClick={() => setIsZoneModalOpen(true)}
                  className="block mb-1 font-semibold text-sm text-lavender--600"
                >
                  + Add Zone
                </button>
              </div>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">-- Select Zone --</option>
                {zones.map((z) => (
                  <option key={z._id} value={z.zone}>
                    {z.zone}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Area</label>
                <button
                  type="button"
                  onClick={() => setIsAreaModalOpen(true)}
                  className="block mb-1 font-semibold text-sm text-lavender--600"
                >
                  + Add Area
                </button>
              </div>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">-- Select Area --</option>
                {areas.map((a, index) => (
                  <option key={index} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <SmallSizedModal
            isOpen={isZoneModalOpen}
            onClose={() => {
              setIsZoneModalOpen(false);
              setZoneError("");
              setNewZoneName("");
            }}
            title="Add New Zone"
          >
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Zone Name</label>
                <input
                  type="text"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="Enter Zone Name"
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />

                {zoneError && (
                  <p className="text-red-500 text-xs mt-1">{zoneError}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleSaveZone}
                className="px-4 py-2 bg-lavender--600 text-white rounded-md"
              >
                Save
              </button>
            </div>
          </SmallSizedModal>

          <SmallSizedModal
            isOpen={isAreaModalOpen}
            onClose={() => {
              setIsAreaModalOpen(false);
              setAreaError("");
              setNewAreaName("");
            }}
            title="Add New Area"
          >
            <div className="grid grid-cols-1 gap-4 mb-2">

              <div>
                <label className="block text-sm font-medium text-gray-700">Zone</label>
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                >
                  <option value="">-- Select Zone --</option>
                  {zones.map((z) => (
                    <option key={z._id} value={z.zone}>
                      {z.zone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Area Name</label>
                <input
                  type="text"
                  value={newAreaName}
                  onChange={(e) => setNewAreaName(e.target.value)}
                  placeholder="Enter Area"
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
                {areaError && (
                  <p className="text-red-500 text-xs mt-1">{areaError}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleSaveArea}
                className="px-4 py-2 bg-lavender--600 text-white rounded-md"
              >
                Save
              </button>
            </div>
          </SmallSizedModal>
          <SmallSizedModal
            isOpen={isOccupationModalOpen}
            onClose={() => {
              setIsOccupationModalOpen(false);
              setOccupationError("");
              setNewOccupationName("");
            }}
            title="Add New Occupation"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Occupation Name
              </label>
              <input
                type="text"
                value={newOccupationName}
                onChange={(e) => setNewOccupationName(e.target.value)}
                placeholder="Enter Occupation"
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />

              {occupationError && (
                <p className="text-red-500 text-xs mt-1">{occupationError}</p>
              )}
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={handleSaveOccupation}
                className="px-4 py-2 bg-lavender--600 text-white rounded-md"
              >
                Save
              </button>
            </div>
          </SmallSizedModal>
        </div>
        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <h1 className="text-lg text-lavender--600 font-semibold mb-2">Spiritual Information</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 pb-8 border-b border-gray-400">

            {/* Confirmation Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirmation</label>
              <select
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">--Select--</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* SHOW ONLY IF YES */}
            {confirmation === "Yes" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirmed Date</label>
                  <input
                    type="date"
                    value={confirmationDate}
                    onChange={(e) => setConfirmationDate(e.target.value)}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirmed By</label>
                  <input
                    type="text"
                    value={confirmationBy}
                    onChange={(e) => setConfirmationBy(e.target.value)}
                    placeholder="Enter Pastor Name"
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirmed Church</label>
                  <input
                    type="text"
                    placeholder="Enter Place"
                    value={confirmationChurch}
                    onChange={(e) => setConfirmationChurch(e.target.value)}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>
              </>
            )}

          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 ">

            {/* Baptism Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Baptism</label>
              <select
                value={baptism}
                onChange={(e) => setBaptism(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">--Select--</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Show only if YES */}
            {baptism === "Yes" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Baptized Date</label>
                  <input
                    type="date"
                    value={baptismDate}
                    onChange={(e) => setBaptismDate(e.target.value)}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Baptized By</label>
                  <input
                    type="text"
                    value={baptismBy}
                    onChange={(e) => setBaptismBy(e.target.value)}
                    placeholder="Enter Pastor Name"
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Baptized Church</label>
                  <input
                    type="text"
                    placeholder="Enter Place"
                    value={baptismChurch}
                    onChange={(e) => setBaptismChurch(e.target.value)}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>
              </>
            )}

          </div>

        </div>
        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <h1 className="text-lg text-lavender--600 font-semibold mb-2">Marital Information</h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">

            {/* Marital Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Marital Status</label>
              <select
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                <option value="">--Select--</option>
                <option value="Married">Married</option>
                <option value="Single">Single</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>

            {/* Show only when Married */}
            {["Married", "Divorced", "Widowed"].includes(maritalStatus) && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Marriage Date</label>
                  <input
                    type="date"
                    value={marriageDate}
                    onChange={(e) => setMarriageDate(e.target.value)}
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Marriage Place</label>
                  <input
                    type="text"
                    value={marriagePlace}
                    onChange={(e) => setMarriagePlace(e.target.value)}
                    placeholder="Enter Marriage Place"
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  />
                </div>
              </>
            )}

          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 rounded-md text-white flex items-center gap-2
            ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}
            `}
          >
            {saving && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            {saving ? "Saving..." : "Save"}
          </button>

        </div>
        {Response.status &&
          (Response.status === "Success" ? (
            <SuccessMessage Message={Response.message} />
          ) : (
            <FailedMessage Message={Response.message} />
          ))}

      </div>

    </>
  )
}