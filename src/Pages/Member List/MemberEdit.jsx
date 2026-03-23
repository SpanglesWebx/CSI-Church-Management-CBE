import React, { useEffect, useRef, useState } from "react";
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";
import SmallSizedModal from "../../Components/Expense/SmallSizedModal";
import { SuccessMessage, FailedMessage } from "../../Components/ToastMessage";
import Modal from "../../Components/Expense/ExpenseFormModal";
import { BiTransfer } from "react-icons/bi";

export const MemberEdit = () => {

  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const { id } = useParams();
  const [errors, setErrors] = useState({});

  const token = sessionStorage.getItem("token");

  // --- Membership states
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
  const [photoPreview, setPhotoPreview] = useState("");
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
  const [memberId, setMemberId] = useState("");
  const [memberType, setMemberType] = useState("");
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
  const [dualMemberId, setDualMemberId] = useState("");
  const [churchName, setChurchName] = useState("");
  const [baptismDate, setBaptismDate] = useState("");
  const [baptismBy, setBaptismBy] = useState("");
  const [baptismChurch, setBaptismChurch] = useState("");
  const [confirmationDate, setConfirmationDate] = useState("");
  const [confirmationBy, setConfirmationBy] = useState("");
  const [confirmationChurch, setConfirmationChurch] = useState("");
  const [marriageDate, setMarriageDate] = useState("");
  const [marriagePlace, setMarriagePlace] = useState("");
  const [headMemberId, setHeadMemberId] = useState("");
  const [membershipStatus, setMembershipStatus] = useState("Unhold");
  const [holdReason, setHoldReason] = useState("");
  const [memberStatus, setMemberStatus] = useState("Active");
  const [inactiveReason, setInactiveReason] = useState("");
  const [inactiveDescription, setInactiveDescription] = useState("");
  const [oldFamilyId, setOldFamilyId] = useState("");
  const [showTypeChangeModal, setShowTypeChangeModal] = useState(false);
  const [pendingMemberType, setPendingMemberType] = useState("");
  const [previousMemberType, setPreviousMemberType] = useState("");


  // --- Head-switch modal states
  const [showHeadSwitchModal, setShowHeadSwitchModal] = useState(false);


  const [transferModal, setTransferModal] = useState(false);
  const [transferHeadSearch, setTransferHeadSearch] = useState("");
  const [transferHeadDropdown, setTransferHeadDropdown] = useState([]);
  const [transferHeadValidationMsg, setTransferHeadValidationMsg] = useState("");
  const [transferHeadValidationType, setTransferHeadValidationType] = useState("");


  // value: "same" or "new" (or "")
  const [headSwitchOption, setHeadSwitchOption] = useState("");
  // relation to apply to the old head when making same-family swap
  const [oldHeadRelation, setOldHeadRelation] = useState("");

  const [title, setTitle] = useState("");
  const [tamilTitle, setTamilTitle] = useState("");

  const [showTamilKeyboard, setShowTamilKeyboard] = useState(false);
  const [activeTamilField, setActiveTamilField] = useState(null);

  const tamilInputWrapperRef = useRef(null);
  const tamilInputRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  // new states
  const [transliterationRequested, setTransliterationRequested] = useState(false);
  const [userEditedTamil, setUserEditedTamil] = useState(false);
  const [addOfficialAddress, setAddOfficialAddress] = useState(false);
  const [membershipFrom, setMembershipFrom] = useState("");
  const [officialAddress, setOfficialAddress] = useState("");
  const [officialPincode, setOfficialPincode] = useState("");
  const [occupations, setOccupations] = useState([]);
  const [selectedOccupation, setSelectedOccupation] = useState("");

  const [isOccupationModalOpen, setIsOccupationModalOpen] = useState(false);
  const [newOccupationName, setNewOccupationName] = useState("");
  const [occupationError, setOccupationError] = useState("");

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

const [isManualTitle, setIsManualTitle] = useState(false);

useEffect(() => {
  if (!isManualTitle) {
    const newTitle = getTitle(age, gender, maritalStatus, memberType);
    setTitle(newTitle);
  }
}, [age, gender, maritalStatus, memberType]);

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
    setTamilTitle(getTamilTitle(title));
  }, [title]);

  const transliterateTamil = async (text) => {
    if (!text.trim()) {
      setMemberTamilName("");
      return;
    }
    try {
      const res = await axios.get(
        `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=ta-t-i0-und&num=1&ie=utf-8&oe=utf-8`
      );

      if (res.data[0] === "SUCCESS") {
        const tamil = res.data[1][0][1][0];
        setMemberTamilName(tamil);
      }
    } catch (err) {
      console.log("Transliteration error:", err);
    }
  };



  // const insertTamilAtCursor = (letter) => {
  //   const input = tamilInputRef.current;
  //   if (!input) return;

  //   const start = input.selectionStart;
  //   const end = input.selectionEnd;

  //   if (letter === "BACKSPACE") {
  //     if (start > 0) {
  //       const newVal = 
  //         memberTamilName.slice(0, start - 1) +
  //         memberTamilName.slice(end);
  //       setMemberTamilName(newVal);
  //       requestAnimationFrame(() => {
  //         input.selectionStart = input.selectionEnd = start - 1;
  //       });
  //     }
  //     return;
  //   }

  //   const before = memberTamilName.slice(0, start);
  //   const after = memberTamilName.slice(end);
  //   const newVal = before + letter + after;

  //   setMemberTamilName(newVal);

  //   requestAnimationFrame(() => {
  //     input.selectionStart = input.selectionEnd = start + letter.length;
  //   });
  // };

  const insertTamilAtCursor = (letter) => {
    const input = tamilInputRef.current;
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;

    // Handle Backspace
    if (letter === "BACKSPACE") {
      if (start > 0) {
        const newVal =
          memberTamilName.slice(0, start - 1) +
          memberTamilName.slice(end);

        setMemberTamilName(newVal);

        requestAnimationFrame(() => {
          input.selectionStart = input.selectionEnd = start - 1;
          input.focus();   // ⭐ Keep cursor focused always
        });
      }
      return;
    }

    // Insert Tamil letter
    const before = memberTamilName.slice(0, start);
    const after = memberTamilName.slice(end);
    const newVal = before + letter + after;

    setMemberTamilName(newVal);

    requestAnimationFrame(() => {
      input.selectionStart = input.selectionEnd = start + letter.length;
      input.focus();   // ⭐ Cursor never disappears
    });
  };

  const TamilKeyboardDropdown = ({ onClose }) => {
    const keys = [
      "அ", "ஆ", "இ", "ஈ", "உ", "ஊ",
      "எ", "ஏ", "ஐ", "ஒ", "ஓ", "ஔ",
      "க", "ங", "ச", "ஞ", "ட", "ண",
      "த", "ந", "ப", "ம", "ய", "ர",
      "ல", "வ", "ழ", "ள", "ற", "ன",
      "ஷ", "ஸ", "ஹ", "ஜ",
      "்", "ா", "ி", "ீ", "ு", "ூ", "ெ", "ே", "ை", "ொ", "ோ", "ௌ"
    ];

    const highlights = new Set([
      "்", "ா", "ி", "ீ", "ு", "ூ", "ெ", "ே", "ை", "ொ", "ோ", "ௌ"
    ]);

    return (
      <div
        className="absolute z-50 w-full bg-white mt-1 border border-gray-200 rounded-md shadow-lg p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex flex-wrap justify-center gap-1"
          style={{ height: "120px", alignContent: "space-between" }}
        >
          {keys.map((k) => (
            <button
              key={k}
              className={
                highlights.has(k)
                  ? "bg-indigo-400 hover:bg-indigo-500 px-2 py-1 rounded text-xs font-bold"
                  : "bg-blue-200 hover:bg-blue-300 px-2 py-1 rounded text-xs"
              }
              onClick={() => insertTamilAtCursor(k)}
            >
              {k}
            </button>
          ))}
        </div>

        <div className="flex justify-between mt-3">
          <button
            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
            onClick={() => insertTamilAtCursor("BACKSPACE")}
          >
            Backspace
          </button>

          <button
            className="bg-gray-600 text-white px-3 py-1 rounded text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  // Debounced transliteration — runs only when user actively requested it
  useEffect(() => {
    if (!transliterationRequested) return;

    // If user already edited Tamil manually, do not overwrite it.
    if (userEditedTamil) {
      setTransliterationRequested(false);
      return;
    }

    // debounce (200–400ms as you like)
    const t = setTimeout(() => {
      transliterateTamil(memberName);
      setTransliterationRequested(false);
    }, 300);

    return () => clearTimeout(t);
  }, [transliterationRequested, memberName, userEditedTamil]);


  const handlePrimaryContactChange = (e) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPrimaryContactNumber(val);
  };
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
  // --- Fetch member details
  const fetchMember = async () => {
    try {
      const res = await axios.get(`${URL}/new-members/${id}`, {
        headers: { Authorization: token },
      });

      const m = res.data.data;

      // Set all states with existing data
      setMemberId(m.member_id || "");
      setMemberType(m.member_type || "");
      setIsHead(m.isHead === "Yes");
      setFamilyId(m.family_id || "");
      setRelation(m.relation_with_head || "");
      setMemberName(m.member_name || "");
      setMemberTamilName(m.member_tamil_name || "");
      setFatherName(m.father_name || "");
      setMotherName(m.mother_name || "");
      setTransliterationRequested(false);
      setUserEditedTamil(false);
      setIsInitialLoad(false);
      setTitle(m.member_title || "");
      setIsManualTitle(true);
      setTamilTitle(m.member_tamil_title || "");
      setIsInitialLoad(false);
      setGender(m.gender || "");
      setDob(m.dob || "");
      setAge(m.age ?? "");
      setPlaceOfBirth(m.place_of_birth || "");
      setAadhar(m.aadhar_number || "");
      setBloodGroup(m.blood_group || "");
      setJoiningDate(m.joining_date || "");
      setEmail(m.email || "");
      setPrimaryEmail(m.primary_email || "");
      setQualification(m.qualification || "");
      setSelectedOccupation(m.occupation || "");
      setCommunity(m.community || "");
      setNationality(m.nationality || "");
      setPrimaryContactNumber(m.primary_contact_number || "");
      setContactNumbers((m.contact_numbers || []).join ? (m.contact_numbers || []).join(",") : (m.contact_numbers || ""));
      setPhotoPreview(m.photo ? `${URL}${m.photo}` : "");
      setIsDualMember(m.is_dual_member || "");
      setDualMemberId(m.dual_member_id || "");
      setChurchName(m.church_name || "");
      setPresentAddress(m.present_address || "");
      setPermanentAddress(m.permanent_address || "");
      setPresentPincode(m.present_pincode || "");
      setPermanentPincode(m.permanent_pincode || "");
      setSelectedZone(m.zone || "");
      setSelectedArea(m.area || "");
      setBaptism(m.baptism || "");
      setBaptismDate(m.baptism_date || "");
      setBaptismBy(m.baptism_by || "");
      setBaptismChurch(m.baptism_church || "");
      setConfirmation(m.confirmation || "");
      setConfirmationDate(m.confirmation_date || "");
      setConfirmationBy(m.confirmation_by || "");
      setConfirmationChurch(m.confirmation_church || "");
      setMaritalStatus(m.marital_status || "");
      setMarriageDate(m.marriage_date || "");
      setMarriagePlace(m.marriage_place || "");
      setHeadName(res.data.data.head_name || m.head_name || "");
      setHeadMemberId(m.head_member_id || "");
      setMembershipStatus(m.membership_status);
      setHoldReason(m.hold_reason || "");
      setMemberStatus(m.status || "Active");
      setInactiveReason(m.inactive_reason || "");
      setInactiveDescription(m.inactive_description || "");
      setOldFamilyId(m.old_family_id || "");
      setMembershipFrom(m.membership_from || "");
      setOfficialAddress(m.official_address || "");
      setOfficialPincode(m.official_pincode || "");
      if ((m.official_address && m.official_address.trim() !== "") ||
        (m.official_pincode && m.official_pincode.trim() !== "")) {
        setAddOfficialAddress(true);
      } else {
        setAddOfficialAddress(false);
      }


    } catch (err) {
      console.log("Fetch Member Error:", err);
    }
  };

  useEffect(() => {
    fetchMember();
    fetchZones();
    fetchOccupations();
  }, []);

  // --- Age calculation
  const calculateAge = (selectedDob) => {
    if (!selectedDob) {
      setAge("");
      return;
    }
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

  // --- Aadhar formatting & validation
  const handleAadharChange = (value) => {
    let numeric = value.replace(/\D/g, "");
    numeric = numeric.slice(0, 12);
    let formatted = numeric.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    setAadhar(formatted);
    if (numeric.length === 12) setAadharError("");
    else setAadharError("Aadhar must be 12 digits");
  };

  // --- Contacts
  const handleContactChange = (e) => {
    const value = e.target.value;
    const cleaned = value.replace(/[^0-9,]/g, "");
    setContactNumbers(cleaned);
  };

  // --- Email validation
  const validateEmail = (value) => {
    const cleaned = value.trim();
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
    if (cleaned === "") {
      setEmail("");
      setEmailError("");
      return;
    }
    setEmail(cleaned);
    if (!pattern.test(cleaned)) setEmailError("Enter a valid email address");
    else setEmailError("");
  };

  const validatePrimaryEmail = (value) => {

    const cleaned = value.trim();

    const pattern =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

    setPrimaryEmail(cleaned);

    if (cleaned === "") {
      setPrimaryEmailError("");
      return;
    }

    if (!pattern.test(cleaned)) {
      setPrimaryEmailError("Enter a valid primary email");
    } else {
      setPrimaryEmailError("");
    }
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

  // --- Zones & Areas
  const fetchZones = async () => {
    try {
      const res = await axios.get(`${URL}/zones/all`, { headers: { Authorization: token } });
      setZones(res.data || []);
    } catch (err) {
      console.error("Zones Fetch Error:", err);
      setZones([]);
    }
  };

  const handleSaveZone = async () => {
    if (!newZoneName.trim()) {
      setResponse({ status: "Failed", message: "Zone name is required" });
      setTimeout(() => setResponse({ status: null, message: "" }), 2500);
      return;
    }

    try {
      await axios.post(`${URL}/zones/add`, { zone: newZoneName }, { headers: { Authorization: token } });
      setResponse({ status: "Success", message: "Zone added successfully" });
      setNewZoneName("");
      setIsZoneModalOpen(false);
      fetchZones();
    } catch (err) {
      setResponse({ status: "Failed", message: err.response?.data?.message || "Something went wrong" });
    }
    setTimeout(() => setResponse({ status: null, message: "" }), 2500);
  };

  const fetchAreas = async (zone) => {
    try {
      const res = await axios.get(`${URL}/zones/areas/${zone}`, { headers: { Authorization: token } });
      setAreas(res.data || []);
    } catch (err) {
      console.error("Area Fetch Error:", err);
      setAreas([]);
    }
  };

  useEffect(() => {
    if (selectedZone) fetchAreas(selectedZone);
    else setAreas([]);
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
      await axios.post(`${URL}/zones/area/add`, { zone: selectedZone, area: newAreaName }, { headers: { Authorization: token } });
      setResponse({ status: "Success", message: "Area added successfully" });
      setNewAreaName("");
      setAreaError("");
      setIsAreaModalOpen(false);
      fetchAreas(selectedZone);
    } catch (err) {
      setResponse({ status: "Failed", message: err.response?.data?.message || "Error adding area" });
    }
    setTimeout(() => setResponse({ status: null, message: "" }), 2500);
  };

  // --- Member ID changes (if you allow editing id)
  const handleMemberIdChange = (e) => {
    let value = e.target.value.toUpperCase();
    if (!value.startsWith("MBR")) value = "MBR";
    let suffix = value.slice(3).replace(/[^0-9]/g, "");
    const newId = "MBR" + suffix;
    setMemberId(newId);

    // If this member is Head → auto-update family ID (useful when creating new family from id change)
    if (isHead) {
      setFamilyId(getFamilyIdFromMember(newId));
    }
  };

  // --- Member type change (e.g. preparatory -> full)
  // const handleMemberTypeChange = async (newType) => {
  //   const oldType = memberType;
  //   setMemberType(newType);

  //   // If upgrading from preparatory to non-preparatory, fetch new member id
  //   if (oldType === "Preparatory/Unpaid Member" && newType !== "Preparatory/Unpaid Member" && !isHead) {
  //     try {
  //       const res = await axios.get(`${URL}/new-members/init`, { headers: { Authorization: token } });
  //       const freshMemberId = res.data.memberId; // e.g. MBR00005
  //       const finalId = freshMemberId.includes("/") ? freshMemberId : freshMemberId + "/1";
  //       setMemberId(finalId);
  //       setOldFamilyId("");
  //       setResponse({ status: "Success", message: "Member upgraded — new ID assigned" });
  //       setTimeout(() => setResponse({ status: null, message: "" }), 2500);
  //     } catch (err) {
  //       console.log("New ID fetch failed", err);
  //     }
  //   }
  // };



  // ✔ Preparatory → Full/Dual/Non = always new /1 ID
  // ✔ Dual ↔ Full ↔ Non = ID NEVER changes
  // ✔ No accidental re-generation
  // ✔ No gaps, no family break, no wrong numbering
  const handleMemberTypeChange = async (newType) => {
    const oldType = memberType;
    setMemberType(newType);

    // 🚨 ONLY ONE CASE must generate ID
    const isUpgrade =
      oldType === "Preparatory/Unpaid Member" &&
      newType !== "Preparatory/Unpaid Member";

    if (!isUpgrade) return;        // ⛔ all other changes do nothing
    if (isHead) return;           // ⛔ heads never regenerate

    try {
      const res = await axios.get(`${URL}/new-members/init`, {
        headers: { Authorization: token },
      });

      const freshMemberId = res.data.memberId;
      setMemberId(freshMemberId + "/1");
      setOldFamilyId("");

      setResponse({ status: "Success", message: "Preparatory → Full member activated with new ID" });
      setTimeout(() => setResponse({ status: null, message: "" }), 2500);
    } catch (err) {
      console.error("Member ID generation failed", err);
    }
  };


  // --- Generate new family id (not used for same-family)
  const generateNewFamilyId = async () => {
    try {
      const res = await axios.get(`${URL}/new-members/next-family-id`, { headers: { Authorization: token } });
      setOldFamilyId(familyId);
      setFamilyId(res.data.familyId);
    } catch (err) {
      console.log("New Family ID Error:", err);
    }
  };

  // --- When user clicks YES to become head, open modal (do NOT flip isHead immediately)
  // This prevents accidental family changes before user confirms.
  const handleTryMakeHead = () => {
    if (memberType === "Preparatory/Unpaid Member") {
      setResponse({ status: "Failed", message: "Preparatory members cannot become Family Head." });
      setTimeout(() => setResponse({ status: null, message: "" }), 2000);
      return;
    }
    // Reset modal states
    setHeadSwitchOption("");
    setOldHeadRelation("");
    setShowHeadSwitchModal(true);
  };

  // --- Modal confirm for SAME family
  const confirmMakeHeadSameFamily = () => {
    // Require a relation for old head ideally
    // (you may relax this requirement if you want)
    // We'll allow empty relation but warn user if empty
    // Apply changes locally: promote this member (isHead true), leave familyId as-is
    setHeadSwitchOption("same");
    setIsHead(true);
    setRelation("Head"); // new member relation
    // oldFamilyId remains same
    setShowHeadSwitchModal(false);
  };

  // --- Modal confirm for NEW family
  const confirmMakeHeadNewFamily = async () => {
    try {
      const res = await axios.get(`${URL}/new-members/next-family-id`, {
        headers: { Authorization: token }
      });

      const newFam = res.data.familyId;   // ✅ FAM00003

      setOldFamilyId(familyId);
      setFamilyId(newFam);
      setIsHead(true);
      setRelation("Head");
      setShowHeadSwitchModal(false);
    } catch (err) {
      setResponse({ status: "Failed", message: "Unable to generate new Family ID" });
    }
  };


  // --- Photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    if (file) setPhotoPreview(URL.createObjectURL(file));
  };

  // --- Validate head when user provides headMemberId (if you use that flow)
  const validateHead = async (headId) => {
    try {
      const res = await axios.post(`${URL}/new-members/validate-head`, {
        headMemberId: headId,
        isPreparatory: memberType === "Preparatory/Unpaid Member",
      }, {
        headers: { Authorization: token }
      });

      // Update state on success
      setFamilyId(res.data.familyId);
      setHeadName(res.data.headName);
      setMemberId(res.data.nextMemberId);
      setResponse({ status: "Success", message: "Head validated successfully" });
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    } catch (err) {
      setHeadName("");
      setResponse({ status: "Failed", message: err.response?.data?.message || "Invalid Head Member ID" });
      setTimeout(() => setResponse({ status: null, message: "" }), 3000);
    }
  };
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

  // --- UPDATE MEMBER (submit)
  const handleUpdate = async () => {
    if (saving) return;
    try {
      setSaving(true);
      const formData = new FormData();


      // Append all relevant fields
      const payload = {
        member_id: memberId,
        member_type: memberType,
        isHead: isHead ? "Yes" : "No",
        family_id: familyId,
        old_family_id: oldFamilyId,
        relation_with_head: relation,
        member_name: memberName,
        member_tamil_name: memberTamilName,
        member_title: title,               // <-- NEW
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
        email,
        qualification,
        primary_email: primaryEmail,
        occupation: selectedOccupation,
        community,
        nationality,
        primary_contact_number: primaryContactNumber,
        contact_numbers: contactNumbers
          ? contactNumbers.split(",").map(n => n.trim()).filter(Boolean)
          : [],

        is_dual_member: isDualMember,
        dual_member_id: dualMemberId,
        church_name: churchName,
        present_address: presentAddress,
        permanent_address: permanentAddress,
        present_pincode: presentPincode,
        permanent_pincode: permanentPincode,
        membership_from: membershipFrom,
        official_address: officialAddress,
        official_pincode: officialPincode,
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
        membership_status: membershipStatus,
        hold_reason: holdReason,
        status: memberStatus,
        inactive_reason: inactiveReason,
        inactive_description: inactiveDescription,

      };

      // Append to formData
      Object.entries(payload).forEach(([k, v]) => {
        // ensure undefined/null values are not appended as "null"
        if (v !== undefined && v !== null) formData.append(k, v);
      });
      if (photo) formData.append("photo", photo);

      // Append head-switch flags
      // Backend expects: makeHeadType ('same_family' | 'new_family') and selectedRelationForOldHead
      const makeHeadTypeValue = headSwitchOption === "same" ? "same_family" : headSwitchOption === "new" ? "new_family" : "";
      if (makeHeadTypeValue) formData.append("makeHeadType", makeHeadTypeValue);
      if (oldHeadRelation) formData.append("selectedRelationForOldHead", oldHeadRelation);

      // Send request
      await axios.put(`${URL}/new-members/update/${id}`, formData, {
        headers: {
          Authorization: token,
          "Content-Type": "multipart/form-data",
        },
      });

      setResponse({ status: "Success", message: "Member Updated Successfully" });
      // setTimeout(() => navigate("/admin/memberlist"), 1400);
      setTimeout(() => navigate(-1), 1400);
    } catch (err) {
      console.error("Update Member Error:", err);
      setResponse({ status: "Failed", message: err.response?.data?.message || "Update Failed" });
    } finally {
      setSaving(false);
    }
  };

  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // const debouncedTransferHeadSearch = useRef(
  //   debounce(async (val) => {
  //     if (!val) {
  //       setTransferHeadDropdown([]);
  //       return;
  //     }

  //     try {
  //       const res = await axios.get(
  //         `${URL}/member-search/by-id?id=${encodeURIComponent(val)}`,
  //         { headers: { Authorization: token } }
  //       );
  //       setTransferHeadDropdown(res.data || []);
  //     } catch {
  //       setTransferHeadDropdown([{ member_id: "none", member_name: "No Members Found" }]);
  //     }
  //   }, 300)
  // ).current;

  const debouncedTransferHeadSearch = useRef(
  debounce(async (val) => {
    if (!val) {
      setTransferHeadDropdown([]);
      return;
    }

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

      // ✅ Remove duplicates
      const uniqueMap = new Map();
      combined.forEach((m) => {
        if (m.member_id) {
          uniqueMap.set(m.member_id, m);
        }
      });

      const finalResults = Array.from(uniqueMap.values());

      setTransferHeadDropdown(
        finalResults.length
          ? finalResults
          : [{ member_id: "none", member_name: "No Members Found" }]
      );
    } catch {
      setTransferHeadDropdown([
        { member_id: "none", member_name: "No Members Found" },
      ]);
    }
  }, 300)
).current;

  const validateTransferHead = async (headId) => {
    try {
      const res = await axios.post(
        `${URL}/new-members/validate-transfer-head`,
        { headMemberId: headId },
        { headers: { Authorization: token } }
      );

      setTransferHeadValidationType("success");
      setTransferHeadValidationMsg("Valid Family Head");
      setTransferHeadSearch(headId);

    } catch (err) {
      setTransferHeadValidationType("error");
      setTransferHeadValidationMsg("Invalid Family Head ID");
    }

    setTimeout(() => {
      setTransferHeadValidationType("");
      setTransferHeadValidationMsg("");
    }, 2500);
  };


  const handleTransferMember = async () => {
    if (!transferHeadSearch || !relation) {
      setResponse({ status: "Failed", message: "Select Head and Relation" });
      setTimeout(() => setResponse({ status: null, message: "" }), 2500);
      return;
    }

    try {
      await axios.post(
        `${URL}/new-members/transfer-member`,
        {
          memberMongoId: id,
          newHeadId: transferHeadSearch,
          newRelation: relation
        },
        { headers: { Authorization: token } }
      );

      setResponse({ status: "Success", message: "Member transferred successfully" });
      setTransferModal(false);
      fetchMember();

    } catch (err) {
      setResponse({
        status: "Failed",
        message: err.response?.data?.message || "Transfer failed"
      });
    }

    setTimeout(() => setResponse({ status: null, message: "" }), 2500);
  };

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
          title="Back"
          onClick={() => navigate(-1)}
          className="cursor-pointer mb-4"
        />

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">Edit Member</h1>

          <button onClick={() => setTransferModal(true)} className="flex items-center gap-2 px-3 py-2 text-white bg-lavender--600 rounded-lg">
            <BiTransfer size={18} /> Transfer Member
          </button>
        </div>


        {/* PHOTO PREVIEW */}
        {photoPreview && (
          <div className="mt-2">
            <img src={photoPreview} alt="Member" className="h-28 w-28 object-cover rounded-md border" />
          </div>
        )}

        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <h1 className="text-lg text-lavender--600 font-semibold">Membership Details</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Member ID <span className='text-red-500 font-bold text-[17px]'>*</span></label>
              <input
                type="text"
                value={memberId}
                readOnly
                onClick={(e) => {
                  if (e.target.selectionStart < 3) e.target.setSelectionRange(3, 3);
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Member Type <span className='text-red-500 font-bold text-[17px]'>*</span></label>
              <select
                data-error="memberType"
                value={memberType}
                // onChange={(e) => handleMemberTypeChange(e.target.value)}
                onChange={(e) => {
                  const newType = e.target.value;

                  if (newType !== memberType) {
                    setPreviousMemberType(memberType);
                    setPendingMemberType(newType);
                    setShowTypeChangeModal(true);
                  }
                }}

                required
                disabled={memberType === "Full Member"}
                className={`block w-full mt-1 rounded-md shadow-sm sm:text-sm
              ${errors.memberType ? "border-red-500" : "border-gray-300"}
              ${memberType === "Full Member" ? "bg-gray-100 cursor-not-allowed" : ""}
              `}

              >
                <option value="">Select Member Type</option>
                <option value="Full Member">Full Member</option>
                <option value="Dual Member">Dual Member</option>
                <option value="Preparatory/Unpaid Member">Preparatory/Unpaid Member</option>
                <option value="Non-Residential Member">Non-Residential Member</option>
                <option value="Presbyter & Family">Presbyter & Family</option>
                {/* <option value="Other Denominations/Not Confirmed Member">Other Denominations/Not Confirmed Member</option> */}
              </select>
              {errors.memberType && (
                <p className="text-red-500 text-xs mt-1">{errors.memberType}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Is Head <span className='text-red-500 font-bold text-[17px]'>*</span></label>

              <div className="flex justify-center">
                <div className="relative flex bg-gray-200 rounded-full p-1 text-sm font-medium w-[70%]">
                  <div
                    className="absolute top-1 bottom-1 left-1 bg-lavender--600 rounded-full transition-transform duration-300"
                    style={{
                      width: "calc(50% - 0.25rem)",
                      transform: isHead ? "translateX(0)" : "translateX(100%)",
                    }}
                  />

                  {/* YES button now only triggers modal (confirmation) */}
                  <button
                    type="button"
                    onClick={() => {
                      if (memberType === "Preparatory/Unpaid Member") return; // blocked
                      if (!isHead) {
                        handleTryMakeHead();
                      }
                    }}
                    disabled={memberType === "Preparatory/Unpaid Member"}
                    className={`relative flex-1 py-1 text-center rounded-full ${isHead ? "text-white" : "text-gray-700"} ${memberType === "Preparatory/Unpaid Member" ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    Yes
                  </button>

                  {/* NO */}
                  <button
                    type="button"
                    onClick={() => {
                      // If user toggles OFF head, just set false
                      setIsHead(false);
                      // Keep familyId (do not auto-create anything)
                    }}
                    className={`relative flex-1 py-1 text-center rounded-full ${!isHead ? "text-white" : "text-gray-700"}`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>

            {isHead && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Family ID <span className='text-red-500 font-bold text-[17px]'>*</span></label>
                <input
                  type="text"
                  placeholder="Family ID"
                  value={familyId}
                  readOnly
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            )}

            {!isHead && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Family Head ID  <span className='text-red-500 font-bold text-[17px]'>*</span></label>
                  <input type="text" value={headMemberId} readOnly className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Head of the Family</label>
                  <input type="text" placeholder="Head of the Family" value={headName} readOnly className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Relation With Family Head <span className='text-red-500 font-bold text-[17px]'>*</span></label>
                  <select required value={relation} onChange={(e) => setRelation(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm">
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
                  </select>
                </div>
              </>
            )}

          </div>
        </div>

        {/* PERSONAL DETAILS ... (kept same as original) */}
        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <h1 className="text-lg text-lavender--600 font-semibold">Personal Details</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">


            <div>
              <label className="block text-sm font-medium text-gray-700">
                Member Name <span className='text-red-500 font-bold text-[17px]'>*</span>
              </label>

              <div className="flex items-center mt-1 w-full">
<select
  value={title}
onChange={(e) => {
  setTitle(e.target.value);
  setIsManualTitle(true);
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

                <input
                  data-error="memberName"
                  type="text"
                  value={memberName}
                  onChange={(e) => {
                    setMemberName(e.target.value);
                    setTransliterationRequested(true); // user wants transliteration
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
                    setUserEditedTamil(true);   // user manually edited Tamil — protect it
                  }}
                  onFocus={() => {
                    setActiveTamilField("memberTamilName");
                    setShowTamilKeyboard(true);
                  }}
                  placeholder="உறுப்பினர் பெயரை உள்ளிடவும்"
                />
              </div>

              {showTamilKeyboard && (
                <TamilKeyboardDropdown onClose={() => setShowTamilKeyboard(false)} />
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
                Primary Contact Number
              </label>

              <input
                type="text"
                value={primaryContactNumber}
                onChange={handlePrimaryContactChange}
                placeholder="Enter 10 digit number"
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Numbers</label>
              <input type="text" value={contactNumbers} onChange={handleContactChange} placeholder="Enter Contact Numbers" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Gender <span className='text-red-500 font-bold text-[17px]'>*</span></label>
              <select data-error="gender" value={gender} onChange={(e) => setGender(e.target.value)} className={`block w-full mt-1 rounded-md shadow-sm sm:text-sm
              ${errors.gender ? "border-red-500" : "border-gray-300"}`}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs">{errors.gender}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input type="date" value={dob} onChange={(e) => { const value = e.target.value; setDob(value); calculateAge(value); }} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input type="text" placeholder="Select Date of Birth" value={age} readOnly className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Place of Birth</label>
              <input type="text" value={placeOfBirth} onChange={(e) => setPlaceOfBirth(e.target.value)} placeholder="Enter Place" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Blood Group</label>
              <select className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>

                <option value="A1-">A1-</option>
                <option value="A1+">A1+</option>
                <option value="A2+">A2+</option>
                <option value="A2-">A2-</option>
                <option value="A1B+">A1B+</option>
                <option value="AB1+">AB1+</option>
                <option value="AB1-">AB1-</option>
                <option value="AB2+">AB2+</option>
                <option value="AB2-">AB2-</option>
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
                type="text"
                value={primaryEmail}
                onChange={(e) => setPrimaryEmail(e.target.value)}
                onBlur={(e) => validatePrimaryEmail(e.target.value)}
                placeholder="Enter Primary Email"
                className={`block w-full mt-1 border rounded-md shadow-sm sm:text-sm
    ${primaryEmailError ? "border-red-500" : "border-gray-300"}
    `}
              />

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
              <input type="text" value={qualification} onChange={(e) => setQualification(e.target.value)} placeholder="Enter Qualification" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
            </div>

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
              <input type="text" value={aadhar} placeholder="XXXX XXXX XXXX" onChange={(e) => handleAadharChange(e.target.value)} className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm ${aadharError ? "border-red-500" : ""}`} />
              {aadharError && <p className="text-red-500 text-xs mt-1">{aadharError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Member Photo</label>
              <input type="file" accept=".jpg, .jpeg, .png" onChange={handlePhotoUpload} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
              {photoError && <p className="text-red-500 text-xs mt-1">{photoError}</p>}
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
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sameAddress}
                  onChange={handleSameAddress}
                  disabled={!presentAddress}
                  className="w-4 h-4"
                />

                <label className="text-sm font-medium text-gray-700">
                  Same as Residential Address
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={addOfficialAddress}
                  onChange={(e) => {
                    setAddOfficialAddress(e.target.checked);
                    if (!e.target.checked) {
                      setOfficialAddress("");
                      setOfficialPincode("");
                    }
                  }}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium text-gray-700">
                  Add Official Address
                </label>
              </div>
            </div>


          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">

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
                placeholder="Add Profession"
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

            {/* Baptism Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Baptism</label>
<select
  value={baptism}
  onChange={(e) => setBaptism(e.target.value)}
  disabled={baptism === "Yes"}
  className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm
    ${baptism === "Yes" ? "bg-gray-100 cursor-not-allowed" : ""}
  `}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

            {/* Confirmation Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirmation</label>
<select
  value={confirmation}
  onChange={(e) => setConfirmation(e.target.value)}
  disabled={confirmation === "Yes"}
  className={`block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm
    ${confirmation === "Yes" ? "bg-gray-100 cursor-not-allowed" : ""}
  `}
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
        </div>

        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <h1 className="text-lg text-lavender--600 font-semibold mb-2">Marital Information</h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Marital Status</label>
              <select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm">
                <option value="">--Select--</option>
                <option value="Married">Married</option>
                <option value="Single">Single</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>

            {maritalStatus && maritalStatus !== "Single" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Marriage Date</label>
                  <input type="date" value={marriageDate} onChange={(e) => setMarriageDate(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Marriage Place</label>
                  <input type="text" value={marriagePlace} onChange={(e) => setMarriagePlace(e.target.value)} placeholder="Enter Marriage Place" className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Membership Status */}
        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <h1 className="text-lg text-lavender--600 font-semibold mb-2">Membership Status</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <div className="flex gap-6 mt-1">
                <label className="flex items-center gap-2">
                  <input type="radio" name="membershipStatus" className="text-green-500 border-green-500 focus:ring-green-500" value="Unhold" checked={membershipStatus === "Unhold"} onChange={() => setMembershipStatus("Unhold")} />
                  <span className="text-green-500 font-semibold">Unhold</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="membershipStatus" className="text-red-500 border-red-500 focus:ring-red-500" value="Hold" checked={membershipStatus === "Hold"} onChange={() => setMembershipStatus("Hold")} />
                  <span className="text-red-500 font-semibold">Hold</span>
                </label>
              </div>
            </div>

            {membershipStatus === "Hold" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason for the Hold</label>
                <input type="text" placeholder="Enter Reason" value={holdReason} onChange={(e) => setHoldReason(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm" />
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
          <h1 className="text-lg text-lavender--600 font-semibold mb-2">Status</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>

              <div className="flex gap-6 mt-1">
                {/* ACTIVE */}
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="memberStatus"
                    value="Active"
                    checked={memberStatus === "Active"}
                    onChange={() => setMemberStatus("Active")}
                    className="text-green-500 border-green-500 focus:ring-green-500"
                  />
                  <span className="text-green-500 font-semibold">Active</span>
                </label>

                {/* INACTIVE */}
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="memberStatus"
                    value="Inactive"
                    checked={memberStatus === "Inactive"}
                    onChange={() => setMemberStatus("Inactive")}
                    className="text-red-500 border-red-500 focus:ring-red-500"
                  />
                  <span className="text-red-500 font-semibold">Inactive</span>
                </label>
              </div>
            </div>


            {memberStatus === "Inactive" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <select value={inactiveReason} onChange={(e) => setInactiveReason(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm">
                  <option value="">--Select--</option>
                  <option value="Death">Death</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Marriage">Marriage</option>
                  <option value="Others">Others</option>
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-4">
            {memberStatus === "Inactive" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input type="text" placeholder="Enter Description" disabled={memberStatus !== "Inactive"} value={inactiveDescription} onChange={(e) => setInactiveDescription(e.target.value)} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm disabled:bg-gray-100" />
              </div>
            )}
          </div>

          {/* Head Switch Modal (uses your ExpenseFormModal component) */}
          <Modal isOpen={showHeadSwitchModal} onClose={() => setShowHeadSwitchModal(false)} title="Change Family Head">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-700 mb-2">Choose how this member should become the head:</p>

                <div className="flex gap-2 mb-3">
                  <button className={`px-3 py-2 rounded ${headSwitchOption === "same" ? "bg-lavender--600 text-white" : "bg-gray-100"}`} onClick={() => setHeadSwitchOption("same")}>
                    Same Family
                  </button>

                  <button className={`px-3 py-2 rounded ${headSwitchOption === "new" ? "bg-lavender--600 text-white" : "bg-gray-100"}`} onClick={() => setHeadSwitchOption("new")}>
                    New Family
                  </button>
                </div>

                {headSwitchOption === "same" && (
                  <>
                    <p className="text-sm mb-2">Current Head: <strong>{headName || headMemberId || "—"}</strong></p>

                    <label className="block text-sm font-medium">Relation for OLD Head</label>
                    <select className="w-full border rounded-md p-2 mb-3" value={oldHeadRelation} onChange={(e) => setOldHeadRelation(e.target.value)}>
                      <option value="">Select Relation</option>
                      <option value="Husband">Husband</option>
                      <option value="Wife">Wife</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Son">Son</option>
                      <option value="Daughter">Daughter</option>
                      <option value="Brother">Brother</option>
                      <option value="Sister">Sister</option>
                      <option value="Son-In-Law">Son-In-Law</option>
                      <option value="Daughter-In-Law">Daughter-In-Law</option>
                    </select>

                    <div className="flex gap-2">
                      <button className="px-3 py-2 bg-gray-200 rounded" onClick={() => { setHeadSwitchOption(""); setOldHeadRelation(""); }}>
                        Cancel
                      </button>
                      <button className="px-3 py-2 bg-green-600 text-white rounded" onClick={confirmMakeHeadSameFamily}>
                        Confirm (Same Family)
                      </button>
                    </div>
                  </>
                )}

                {headSwitchOption === "new" && (
                  <>
                    <p className="text-sm mb-2">This will create a new Family ID derived from the Member ID and make this member the Head of the new family.</p>
                    <div className="flex gap-2">
                      <button className="px-3 py-2 bg-gray-200 rounded" onClick={() => setHeadSwitchOption("")}>Cancel</button>
                      <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={confirmMakeHeadNewFamily}>Confirm (Create New Family)</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Modal>

          <Modal isOpen={transferModal} onClose={() => setTransferModal(false)} title="Transfer Member">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">

              {/* Head ID */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700">Family Head ID</label>
                <input
                  type="text"
                  value={transferHeadSearch}
                  onChange={(e) => {
                    setTransferHeadSearch(e.target.value.toUpperCase());
                    debouncedTransferHeadSearch(e.target.value.toUpperCase());
                  }}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                  placeholder="Search Head ID"
                />

                {/* Dropdown */}
                {/* Unified Floating Dropdown */}
                {transferHeadDropdown.length > 0 && (
                  <ul className="absolute left-1/2 -translate-x-1/2 mt-[10px] w-[100%] bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {transferHeadDropdown.map(h => (
                      <li
                        key={h.member_id}
                        className={`flex px-3 py-2 text-sm ${h.member_id === "none"
                          ? "text-gray-500 cursor-default"
                          : "hover:bg-indigo-50 cursor-pointer"
                          }`}
                        onClick={() => {
                          if (h.member_id === "none") return;
                          setTransferHeadSearch(h.member_id);
                          setTransferHeadDropdown([]);
                          validateTransferHead(h.member_id);
                        }}
                      >
                        <span className="w-[220px] font-medium">{h.member_id}</span>
                        <span className="flex-1">{h.member_name}</span>
                      </li>
                    ))}
                  </ul>
                )}


                {/* Validation message */}
                {transferHeadValidationMsg && (
                  <p className={`text-sm mt-1 ${transferHeadValidationType === "success" ? "text-green-600" : "text-red-600"}`}>
                    {transferHeadValidationMsg}
                  </p>
                )}
              </div>

              {/* Relation */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700">Relation With New Head</label>
                <select
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm sm:text-sm"
                >
                  <option value="">Select Relation</option>
                  <option>Husband</option>
                  <option>Wife</option>
                  <option>Son</option>
                  <option>Daughter</option>
                  <option>Brother</option>
                  <option>Sister</option>
                  <option>Father</option>
                  <option>Mother</option>
                </select>
              </div>

              <div className="col-span-2 flex justify-end">
                <button onClick={handleTransferMember} className="bg-lavender--600 text-white px-4 py-2 rounded-lg">
                  Transfer Now
                </button>
              </div>

            </div>
          </Modal>

          <SmallSizedModal
            isOpen={showTypeChangeModal}
            onClose={() => {
              setShowTypeChangeModal(false);
              setPendingMemberType("");
            }}
            title="Confirm Member Type Change"
          >
            <p className="text-md text-center text-gray-700 mb-4">
              Are you sure you want to change the member type from{" "}
              <b>{previousMemberType}</b> to <b>{pendingMemberType}</b> ?
            </p>

            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => {
                  // ❌ Cancel – revert back
                  setMemberType(previousMemberType);
                  setShowTypeChangeModal(false);
                }}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                No
              </button>

              <button
                onClick={() => {
                  // ✅ Confirm – apply change
                  setShowTypeChangeModal(false);
                  handleMemberTypeChange(pendingMemberType);
                }}
                className="px-4 py-2 bg-lavender--600 text-white rounded-md"
              >
                Yes
              </button>
            </div>
          </SmallSizedModal>



        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleUpdate}
            disabled={saving}
            className={`px-4 py-2 rounded-md text-white flex items-center gap-2
            ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-lavender--600"}
            `}
          >
            {saving && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            {saving ? "Updating..." : "Update Member"}
          </button>

        </div>

        {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}
      </div>

    </>
  )
}
